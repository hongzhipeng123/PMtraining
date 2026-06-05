/* ── Layered Memory System (v2.0) ──────────────────────────────
   3 layers:
   - Long-term (Profile): user preferences/strengths/weaknesses (cross-session)
   - Mid-term (Summary): early conversation summaries (per session, when > N rounds)
   - Short-term (Recent): last K rounds in full text
   ────────────────────────────────────────────────────────────── */

const SUMMARY_TRIGGER = 6;        // when rounds > 6, start summarizing earliest
const KEEP_RECENT = 3;            // always keep last 3 rounds in full text
const MEMORY_STRATEGIES = {
  economy:  { label: '🟢 经济', desc: '仅画像+最近2轮', recent: 2, useProfile: true, useSummary: false },
  balanced: { label: '🔵 平衡', desc: '画像+摘要+最近3轮', recent: 3, useProfile: true, useSummary: true },
  full:     { label: '🟣 完整', desc: '画像+全摘要+最近6轮', recent: 6, useProfile: true, useSummary: true },
};

/* ── Rough token estimator (1 zh char ≈ 1.5 tok, 1 en char ≈ 0.3 tok) ── */
const estimateTokens = (text) => {
  if (!text) return 0;
  let zh = 0, en = 0;
  for (const c of text) {
    if (/[\u4e00-\u9fa5]/.test(c)) zh++;
    else en++;
  }
  return Math.ceil(zh * 1.5 + en * 0.3);
};

/* ── Memory Manager ── */
const MemoryManager = {
  /* User profile (long-term) */
  getProfile(user) {
    if (!user) return null;
    try {
      return JSON.parse(localStorage.getItem(`user_${user}_profile`) || 'null') ||
        { preferences: [], strengths: [], weaknesses: [], conversation_count: 0 };
    } catch { return { preferences: [], strengths: [], weaknesses: [], conversation_count: 0 }; }
  },

  saveProfile(user, profile) {
    if (!user) return;
    profile.last_updated = new Date().toISOString();
    localStorage.setItem(`user_${user}_profile`, JSON.stringify(profile));
  },

  /* Format profile as compact tag string (e.g. "[偏好:To B / 强项:用研 / 弱项:数据指标]") */
  formatProfileTag(profile) {
    if (!profile) return '';
    const parts = [];
    if (profile.preferences?.length) parts.push(`偏好:${profile.preferences.slice(0, 3).join('、')}`);
    if (profile.strengths?.length) parts.push(`强项:${profile.strengths.slice(0, 2).join('、')}`);
    if (profile.weaknesses?.length) parts.push(`弱项:${profile.weaknesses.slice(0, 2).join('、')}`);
    return parts.length ? `[用户画像 - ${parts.join(' / ')}]` : '';
  },

  /* Get user's chosen strategy */
  getStrategy(user) {
    try {
      const s = localStorage.getItem(`user_${user}_memory_strategy`);
      return MEMORY_STRATEGIES[s] ? s : 'balanced';
    } catch { return 'balanced'; }
  },

  setStrategy(user, strategy) {
    if (!user || !MEMORY_STRATEGIES[strategy]) return;
    localStorage.setItem(`user_${user}_memory_strategy`, strategy);
  },

  /* Sessions index */
  getSessionsIndex(user) {
    try { return JSON.parse(localStorage.getItem(`user_${user}_sessions_index`) || '[]'); }
    catch { return []; }
  },

  getSession(user, sessionId) {
    try { return JSON.parse(localStorage.getItem(`user_${user}_session_${sessionId}`) || 'null'); }
    catch { return null; }
  },

  saveSession(user, session) {
    if (!user || !session) return;
    localStorage.setItem(`user_${user}_session_${session.id}`, JSON.stringify(session));
    // Update index
    const idx = MemoryManager.getSessionsIndex(user);
    const found = idx.findIndex(s => s.id === session.id);
    const entry = {
      id: session.id,
      title: session.title,
      category: session.category,
      created_at: session.created_at,
      updated_at: new Date().toISOString(),
      rounds: session.rounds?.length || 0,
      score: session.final_score,
    };
    if (found >= 0) idx[found] = entry; else idx.unshift(entry);
    localStorage.setItem(`user_${user}_sessions_index`, JSON.stringify(idx.slice(0, 50)));
  },

  createSession(user, { title, category }) {
    const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const session = {
      id, title, category,
      created_at: new Date().toISOString(),
      rounds: [],          // [{role:'ai'|'user', content:'...', ts:..., summarized:false}]
      summary: '',
      summary_round_count: 0,
      final_score: null,
    };
    MemoryManager.saveSession(user, session);
    return session;
  },

  deleteSession(user, sessionId) {
    localStorage.removeItem(`user_${user}_session_${sessionId}`);
    const idx = MemoryManager.getSessionsIndex(user).filter(s => s.id !== sessionId);
    localStorage.setItem(`user_${user}_sessions_index`, JSON.stringify(idx));
  },

  /* ─── Build messages with layered memory ───
     Returns { messages, breakdown, needsSummary, sessionAfterAdd } */
  buildMessages(user, session, systemPrompt, userInput, options = {}) {
    const strategy = options.strategy || MemoryManager.getStrategy(user);
    const cfg = MEMORY_STRATEGIES[strategy];
    const profile = MemoryManager.getProfile(user);
    const profileTag = cfg.useProfile ? MemoryManager.formatProfileTag(profile) : '';

    // Append user input to a working rounds array (don't save yet)
    const workingRounds = [...(session.rounds || [])];
    workingRounds.push({ role: 'user', content: userInput, ts: Date.now() });

    // Decide which rounds become "recent" (kept verbatim)
    const recentStartIdx = Math.max(0, workingRounds.length - cfg.recent);
    const olderRounds = workingRounds.slice(0, recentStartIdx);
    const recentRounds = workingRounds.slice(recentStartIdx);

    // Need summarization? if older rounds exist beyond what's already summarized
    const alreadySummarizedTo = session.summary_round_count || 0;
    const needsSummary = cfg.useSummary && olderRounds.length > alreadySummarizedTo + 1;

    // Build prompt parts
    const parts = [];
    let sysContent = systemPrompt;
    let profileTokens = 0, summaryTokens = 0, recentTokens = 0;

    if (profileTag) {
      sysContent += '\n\n' + profileTag;
      profileTokens = estimateTokens(profileTag);
    }

    if (cfg.useSummary && session.summary) {
      sysContent += '\n\n[早期对话摘要]\n' + session.summary;
      summaryTokens = estimateTokens(session.summary);
    }

    const messages = [{ role: 'system', content: sysContent }];

    // Add recent rounds in full (excluding the just-added user input which goes last)
    for (let i = 0; i < recentRounds.length - 1; i++) {
      const r = recentRounds[i];
      messages.push({ role: r.role === 'ai' ? 'assistant' : 'user', content: r.content });
      recentTokens += estimateTokens(r.content);
    }
    // Last entry is the current user input
    const last = recentRounds[recentRounds.length - 1];
    messages.push({ role: 'user', content: last.content });
    recentTokens += estimateTokens(last.content);

    const systemTokens = estimateTokens(systemPrompt);
    const totalUsed = systemTokens + profileTokens + summaryTokens + recentTokens;

    // Full traversal comparison (no memory tricks)
    const fullTextSum = workingRounds.reduce((s, r) => s + estimateTokens(r.content), 0);
    const fullTotal = systemTokens + fullTextSum;

    return {
      messages,
      workingRounds,
      breakdown: {
        system: systemTokens,
        profile: profileTokens,
        summary: summaryTokens,
        recent: recentTokens,
        total: totalUsed,
        fullTotal,
        savings: fullTotal > 0 ? Math.round((1 - totalUsed / fullTotal) * 100) : 0,
        strategy,
      },
      needsSummary,
      olderRoundsToSummarize: olderRounds.slice(alreadySummarizedTo),
    };
  },

  /* ─── Generate or update session summary (call after rounds beyond window) ─── */
  async generateSummary(apiKey, oldSummary, newRounds) {
    if (!newRounds || newRounds.length === 0) return oldSummary || '';
    const dialogText = newRounds.map(r => `${r.role === 'ai' ? 'AI' : '用户'}：${r.content}`).join('\n');
    const prompt = oldSummary
      ? `已有摘要：\n${oldSummary}\n\n新增对话：\n${dialogText}\n\n请用150字以内整合更新整体摘要。仅输出摘要本身，不要其他说明。`
      : `请用150字以内总结以下对话的核心要点和用户立场。仅输出摘要本身，不要其他说明。\n\n${dialogText}`;
    try {
      const result = await callDeepSeekSync(apiKey, [
        { role: 'system', content: '你是对话摘要器，输出极简但保留关键信息。' },
        { role: 'user', content: prompt },
      ]);
      return result.trim();
    } catch { return oldSummary || ''; }
  },

  /* ─── Refresh user profile based on session score and category ─── */
  updateProfileFromSession(user, session) {
    if (!user || !session) return;
    const profile = MemoryManager.getProfile(user);
    profile.conversation_count = (profile.conversation_count || 0) + 1;

    if (session.category) {
      profile.preferences = [...new Set([...(profile.preferences || []), session.category])].slice(0, 5);
    }
    if (session.final_score >= 85 && session.category) {
      profile.strengths = [...new Set([...(profile.strengths || []), session.category])].slice(0, 4);
    } else if (session.final_score && session.final_score < 70 && session.category) {
      profile.weaknesses = [...new Set([...(profile.weaknesses || []), session.category])].slice(0, 4);
    }
    MemoryManager.saveProfile(user, profile);
  },

  /* ─── Token log (rolling) ─── */
  logTokenUsage(user, used, saved) {
    if (!user) return;
    const key = `user_${user}_token_log`;
    const log = JSON.parse(localStorage.getItem(key) || '[]');
    log.push({ ts: Date.now(), used, saved });
    localStorage.setItem(key, JSON.stringify(log.slice(-100)));
  },

  getTokenStats(user) {
    try {
      const log = JSON.parse(localStorage.getItem(`user_${user}_token_log`) || '[]');
      const totalUsed = log.reduce((s, x) => s + (x.used || 0), 0);
      const totalSaved = log.reduce((s, x) => s + (x.saved || 0), 0);
      return { totalUsed, totalSaved, calls: log.length };
    } catch { return { totalUsed: 0, totalSaved: 0, calls: 0 }; }
  },
};

Object.assign(window, { MemoryManager, MEMORY_STRATEGIES, estimateTokens });
