/* ── Growth: Interview (v2 with Memory) + Daily + Dashboard ── */

/* ─── Difficulty maps for legacy data ─── */
const DIFF_MAP = { '低': 'easy', '中': 'mid', '高': 'hard' };
const DIFF_META = {
  easy: { label: '🟢 入门', color: T.success, time: 5 },
  mid:  { label: '🟡 进阶', color: T.warning, time: 10 },
  hard: { label: '🔴 资深', color: T.error, time: 15 },
};
const getDiff = (q) => DIFF_MAP[q.difficulty] || 'mid';

/* ─── Interview Page (v2) ─── */
const InterviewPage = ({ user, onNavToReport }) => {
  const [view, setView] = React.useState('library'); // library | session | history
  const [category, setCategory] = React.useState('全部');
  const [diffFilter, setDiffFilter] = React.useState('all');
  const [currentSession, setCurrentSession] = React.useState(null);
  const [currentQ, setCurrentQ] = React.useState(null);
  const isMobile = useIsMobile();
  const toast = useToast();

  const completedIds = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem(`user_${user}_interview_done`) || '[]'); }
    catch { return []; }
  }, [user, view]);

  const easyCount = INTERVIEW_QUESTIONS.filter(q => getDiff(q) === 'easy').length;
  const midCount = INTERVIEW_QUESTIONS.filter(q => getDiff(q) === 'mid').length;
  const hardCount = INTERVIEW_QUESTIONS.filter(q => getDiff(q) === 'hard').length;
  const doneEasy = completedIds.filter(i => getDiff(INTERVIEW_QUESTIONS[i]) === 'easy').length;
  const doneMid = completedIds.filter(i => getDiff(INTERVIEW_QUESTIONS[i]) === 'mid').length;
  const midUnlocked = doneEasy >= 2;
  const hardUnlocked = doneMid >= 3;

  const startQuestion = (qIdx) => {
    const q = INTERVIEW_QUESTIONS[qIdx];
    if (!q) return;
    const session = MemoryManager.createSession(user, {
      title: q.q.slice(0, 30),
      category: q.cat,
    });
    setCurrentSession({ ...session, qIdx });
    setCurrentQ(q);
    setView('session');
  };

  const filteredQuestions = INTERVIEW_QUESTIONS.map((q, i) => ({ ...q, _idx: i }))
    .filter(q => category === '全部' || q.cat === category)
    .filter(q => {
      if (diffFilter === 'all') return true;
      if (diffFilter === 'done') return completedIds.includes(q._idx);
      if (diffFilter === 'todo') return !completedIds.includes(q._idx);
      return getDiff(q) === diffFilter;
    });

  /* Library view */
  if (view === 'library') {
    return (
      <div className="page-enter" style={{ padding: isMobile ? '16px' : '24px 32px', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>模拟面试 · 题库</h2>
            <p style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>{INTERVIEW_QUESTIONS.length} 道精选题 · 渐进式挑战</p>
          </div>
          <Button variant="secondary" onClick={() => setView('history')}>📚 会话历史</Button>
        </div>

        {/* Difficulty progress */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
          {[
            { lvl: 'easy', desc: '基础题，建立产品思维', done: doneEasy, total: easyCount, unlocked: true },
            { lvl: 'mid', desc: '进阶题，掌握核心方法论', done: doneMid, total: midCount, unlocked: midUnlocked, hint: '完成 2 道入门题解锁' },
            { lvl: 'hard', desc: '挑战题，培养战略视角', done: completedIds.filter(i => getDiff(INTERVIEW_QUESTIONS[i]) === 'hard').length, total: hardCount, unlocked: hardUnlocked, hint: '完成 3 道进阶题解锁' },
          ].map(g => {
            const meta = DIFF_META[g.lvl];
            return (
              <Card key={g.lvl} style={{ border: `1px solid ${meta.color}40`, opacity: g.unlocked ? 1 : 0.55 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Badge color={meta.color}>{meta.label}</Badge>
                  <span style={{ fontSize: 10, color: T.muted }}>{g.done}/{g.total}</span>
                </div>
                <div style={{ fontSize: 12, color: T.textSec, marginBottom: 8 }}>{g.desc}</div>
                <div style={{ height: 4, background: T.bg, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(g.done / Math.max(g.total, 1)) * 100}%`, height: '100%', background: meta.color }} />
                </div>
                {!g.unlocked && <div style={{ fontSize: 10, color: T.muted, marginTop: 8 }}>🔒 {g.hint}</div>}
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, background: T.card, padding: 4, borderRadius: 10 }}>
            {[
              { key: 'all', label: '全部' },
              { key: 'easy', label: '🟢 入门' },
              { key: 'mid', label: '🟡 进阶' },
              { key: 'hard', label: '🔴 资深' },
              { key: 'done', label: '✓ 已完成' },
              { key: 'todo', label: '○ 未完成' },
            ].map(f => (
              <button key={f.key} onClick={() => setDiffFilter(f.key)} style={{
                padding: '6px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
                background: diffFilter === f.key ? T.p500 : 'transparent',
                color: diffFilter === f.key ? '#fff' : T.textSec, fontSize: 12, fontWeight: 600,
              }}>{f.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            {INTERVIEW_CATS.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{
                padding: '4px 10px', borderRadius: 12, fontSize: 11,
                background: category === c ? T.p500 + '20' : T.surface,
                border: `1px solid ${category === c ? T.p500 + '60' : T.border}`,
                color: category === c ? T.p400 : T.textSec, cursor: 'pointer', fontWeight: category === c ? 600 : 400,
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Questions grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 10, marginBottom: 24 }}>
          {filteredQuestions.map(q => {
            const diff = getDiff(q);
            const meta = DIFF_META[diff];
            const locked = (diff === 'mid' && !midUnlocked) || (diff === 'hard' && !hardUnlocked);
            const done = completedIds.includes(q._idx);
            return (
              <Card key={q._idx} hoverable={!locked}
                onClick={() => !locked && startQuestion(q._idx)}
                style={{
                  padding: 14, opacity: locked ? 0.5 : 1, cursor: locked ? 'not-allowed' : 'pointer',
                  borderLeft: `2px solid ${meta.color}`,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <Badge color={meta.color}>{meta.label}</Badge>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {done && <Badge color={T.success}>✓ 已完成</Badge>}
                    {locked && <Badge color={T.muted}>🔒</Badge>}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 6, lineHeight: 1.5 }}>{q.q}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge color={T.cyan}>{q.cat}</Badge>
                  <span style={{ fontSize: 10, color: T.muted }}>⏱ {meta.time} min</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  /* Session view */
  if (view === 'session' && currentSession) {
    return <InterviewSession user={user} session={currentSession} question={currentQ}
      onComplete={(updatedSession) => {
        const qIdx = currentSession.qIdx;
        if (qIdx != null && !completedIds.includes(qIdx)) {
          localStorage.setItem(`user_${user}_interview_done`, JSON.stringify([...completedIds, qIdx]));
        }
        MemoryManager.updateProfileFromSession(user, updatedSession);
        setView('library');
        setCurrentSession(null); setCurrentQ(null);
      }}
      onExit={() => { setView('library'); setCurrentSession(null); setCurrentQ(null); }}
    />;
  }

  /* History view */
  if (view === 'history') {
    return <InterviewHistory user={user} onBack={() => setView('library')}
      onPickSession={(s) => {
        const full = MemoryManager.getSession(user, s.id);
        if (full) {
          // Resume: load existing rounds
          const q = INTERVIEW_QUESTIONS.find(iq => iq.q.slice(0, 30) === full.title);
          setCurrentSession({ ...full, qIdx: q ? INTERVIEW_QUESTIONS.indexOf(q) : null });
          setCurrentQ(q || { q: full.title, cat: full.category, difficulty: '中' });
          setView('session');
        }
      }}
    />;
  }
  return null;
};

/* ─── Interview Session (the actual chat with memory) ─── */
const InterviewSession = ({ user, session: initSession, question, onComplete, onExit }) => {
  const isMobile = useIsMobile();
  const [session, setSession] = React.useState(initSession);
  const [input, setInput] = React.useState('');
  const [aiTyping, setAiTyping] = React.useState(false);
  const [lastBreakdown, setLastBreakdown] = React.useState(null);
  const [showMemPanel, setShowMemPanel] = React.useState(!initSession || window.innerWidth > 768 ? true : false);
  const [strategy, setStrategyS] = React.useState(() => MemoryManager.getStrategy(user));
  const msgEnd = React.useRef(null);
  const toast = useToast();

  React.useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [session.rounds, aiTyping]);

  // Initial AI greeting if no rounds
  React.useEffect(() => {
    if (!session.rounds || session.rounds.length === 0) {
      const greeting = `**面试题目**\n\n**分类：** ${question.cat}　**难度：** ${question.difficulty}\n\n> ${question.q}\n\n请认真思考后作答。前 3 轮我会追问，第 4 轮给出综合点评。`;
      const newSession = { ...session, rounds: [{ role: 'ai', content: greeting, ts: Date.now() }] };
      setSession(newSession);
      MemoryManager.saveSession(user, newSession);
    }
  }, []);

  const setStrategy = (s) => { setStrategyS(s); MemoryManager.setStrategy(user, s); };

  const handleSend = async () => {
    if (!input.trim() || aiTyping) return;
    const apiKey = localStorage.getItem(`user_${user}_apikey`);
    if (!apiKey) { toast('请先设置 API Key', 'warning'); return; }

    const userInput = input.trim();
    setInput(''); setAiTyping(true);

    const userRoundsCount = (session.rounds || []).filter(r => r.role === 'user').length;
    const newRoundNum = userRoundsCount + 1;
    Tracker.track(user, `模拟面试第${newRoundNum}轮：${question.q.slice(0, 20)}...`);

    const systemPrompt = INTERVIEW_SYSTEM_PROMPT + `\n\n当前面试题目：${question.q}\n分类：${question.cat}\n当前是第${newRoundNum}轮回答。${newRoundNum >= 3 ? '请给出综合点评（包含评分、亮点、改进建议、参考框架和参考答案要点）。' : '请进行追问（1-2个有针对性的深入问题）。'}`;

    // Build messages with layered memory
    const { messages, workingRounds, breakdown, needsSummary, olderRoundsToSummarize } =
      MemoryManager.buildMessages(user, session, systemPrompt, userInput, { strategy });

    setLastBreakdown(breakdown);
    MemoryManager.logTokenUsage(user, breakdown.total, breakdown.fullTotal - breakdown.total);

    // Show user message immediately
    let updatedRounds = [...workingRounds];
    setSession(prev => ({ ...prev, rounds: updatedRounds }));

    let aiText = '';
    callDeepSeek(apiKey, messages,
      chunk => {
        aiText = chunk;
        setSession(prev => {
          const rounds = [...prev.rounds];
          const lastIdx = rounds.length - 1;
          if (rounds[lastIdx]?.role === 'ai' && rounds[lastIdx]?._streaming) {
            rounds[lastIdx] = { ...rounds[lastIdx], content: aiText };
          } else {
            rounds.push({ role: 'ai', content: aiText, ts: Date.now(), _streaming: true });
          }
          return { ...prev, rounds };
        });
      },
      async full => {
        // Finalize streaming
        let finalRounds = [...updatedRounds, { role: 'ai', content: full, ts: Date.now() }];
        let finalSession = { ...session, rounds: finalRounds };

        // Try to extract score from final review
        if (newRoundNum >= 3) {
          const scoreMatch = full.match(/总分[：:]\s*(\d+(?:\.\d+)?)/);
          if (scoreMatch) finalSession.final_score = Math.round(parseFloat(scoreMatch[1]) * 10);
          Tracker.updateStats(user, 'interview');
        }

        // Trigger summarization if needed
        if (needsSummary && olderRoundsToSummarize.length >= 2) {
          try {
            const newSummary = await MemoryManager.generateSummary(apiKey, session.summary, olderRoundsToSummarize);
            finalSession.summary = newSummary;
            finalSession.summary_round_count = finalRounds.length - MEMORY_STRATEGIES[strategy].recent - 1;
            toast(`已自动摘要 ${olderRoundsToSummarize.length} 轮对话`, 'info');
          } catch { /* skip */ }
        }

        setSession(finalSession);
        MemoryManager.saveSession(user, finalSession);
        setAiTyping(false);

        if (newRoundNum >= 3) {
          // After final review, allow user to close
          setTimeout(() => { onComplete && onComplete(finalSession); }, 100);
        }
      },
      err => {
        toast(err, 'error');
        setSession(prev => ({ ...prev, rounds: [...updatedRounds, { role: 'ai', content: `⚠️ ${err}`, ts: Date.now() }] }));
        setAiTyping(false);
      }
    );
  };

  const cat = question.cat;
  const profile = MemoryManager.getProfile(user);
  const cfg = MEMORY_STRATEGIES[strategy];

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Main chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: isMobile ? '10px 14px' : '12px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, minWidth: 0, flexWrap: 'wrap' }}>
            <Badge color="#f43f5e">{cat}</Badge>
            <Badge color={T.warning}>{question.difficulty}</Badge>
            <span style={{ fontSize: 13, color: T.textSec }}>第 {(session.rounds || []).filter(r => r.role === 'user').length} 轮</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            <Button variant="ghost" size="sm" onClick={() => setShowMemPanel(s => !s)}>
              {isMobile ? '🧠' : (showMemPanel ? '隐藏' : '显示') + '记忆面板'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onExit}>退出</Button>
          </div>
        </div>

        {/* Memory indicator strip */}
        {lastBreakdown && (
          <div style={{
            background: T.cyan + '10', borderBottom: `1px solid ${T.cyan}30`,
            padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11,
          }}>
            <div style={{ display: 'flex', gap: 12, color: T.textSec }}>
              <span>🧠 {cfg.label}</span>
              <span>预计 <strong style={{ color: T.text }}>{lastBreakdown.total}</strong> tokens</span>
            </div>
            <span style={{ color: T.success, fontWeight: 700 }}>
              ↓ 节省 {lastBreakdown.savings}% (vs 全量 {lastBreakdown.fullTotal})
            </span>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 16 : 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(session.rounds || []).map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: r.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: isMobile ? '88%' : '78%', padding: '12px 16px', borderRadius: 14,
                background: r.role === 'user' ? T.p700 + 'cc' : T.surface,
                border: `1px solid ${r.role === 'user' ? T.p600 + '60' : T.border}`,
                fontSize: 13, lineHeight: 1.75,
              }}>
                <MarkdownRender text={r.content} loading={false} />
              </div>
            </div>
          ))}
          {aiTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '12px 16px', borderRadius: 14, background: T.surface, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Spinner size={14} /><span style={{ fontSize: 12, color: T.textSec }}>面试官思考中...</span>
              </div>
            </div>
          )}
          <div ref={msgEnd} />
        </div>

        <div style={{ padding: isMobile ? '12px 14px calc(12px + env(safe-area-inset-bottom))' : '14px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="输入你的回答..."
            disabled={aiTyping}
            style={{ flex: 1, minWidth: 0, padding: '10px 14px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, color: T.text, fontSize: 14, outline: 'none' }} />
          <Button onClick={handleSend} disabled={aiTyping || !input.trim()} icon="send">{isMobile ? '' : '发送'}</Button>
        </div>
      </div>

      {/* Right: Memory panel */}
      {showMemPanel && (
        <div style={isMobile ? {
          position: 'fixed', inset: 0, zIndex: 130, background: T.bgAlt,
          padding: 16, paddingTop: 'calc(16px + env(safe-area-inset-top))', overflowY: 'auto',
        } : { width: 280, borderLeft: `1px solid ${T.border}`, background: T.bgAlt, padding: 16, overflowY: 'auto' }}
          className={isMobile ? 'anim-fade-in' : ''}>
          {isMobile && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>🧠 记忆面板</div>
              <button onClick={() => setShowMemPanel(false)} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textSec, cursor: 'pointer' }}><Icon name="close" size={18} /></button>
            </div>
          )}
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>🎚 记忆策略</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {Object.entries(MEMORY_STRATEGIES).map(([key, s]) => (
              <button key={key} onClick={() => setStrategy(key)} style={{
                padding: 8, borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                background: strategy === key ? T.p500 + '20' : T.surface,
                border: `1px solid ${strategy === key ? T.p500 + '60' : T.border}`,
                color: T.text,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{s.desc}</div>
              </button>
            ))}
          </div>

          {lastBreakdown && (
            <>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>📊 上次消耗分解</div>
              <div style={{ background: T.card, padding: 12, borderRadius: 10, fontSize: 11, color: T.textSec, marginBottom: 12 }}>
                <Row k="System Prompt" v={lastBreakdown.system} color={T.muted} />
                <Row k="用户画像" v={lastBreakdown.profile} color={T.cyan} />
                <Row k="早期摘要" v={lastBreakdown.summary} color={T.p400} />
                <Row k="最近原文" v={lastBreakdown.recent} color={T.warning} />
                <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 6, paddingTop: 6 }}>
                  <Row k="实际使用" v={lastBreakdown.total} color={T.success} bold />
                  <Row k="全量传递" v={lastBreakdown.fullTotal} color={T.error} />
                </div>
                <div style={{ background: T.success + '15', borderRadius: 6, padding: 6, textAlign: 'center', marginTop: 8, color: T.success, fontWeight: 700 }}>
                  节省 {lastBreakdown.savings}% · ≈¥{((lastBreakdown.fullTotal - lastBreakdown.total) * 0.000002).toFixed(4)}
                </div>
              </div>
            </>
          )}

          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🧬 用户画像</div>
          <div style={{ background: `linear-gradient(135deg, ${T.p600}25, ${T.cyan}15)`, padding: 12, borderRadius: 10, border: `1px solid ${T.p500}40`, fontSize: 11, color: T.textSec, lineHeight: 1.7 }}>
            {profile?.preferences?.length ? <div>📌 偏好：<span style={{ color: T.text }}>{profile.preferences.join('、')}</span></div> : <div style={{ color: T.muted }}>📌 偏好：暂无</div>}
            {profile?.strengths?.length ? <div>💪 强项：<span style={{ color: T.success }}>{profile.strengths.join('、')}</span></div> : <div style={{ color: T.muted }}>💪 强项：暂无</div>}
            {profile?.weaknesses?.length ? <div>⚠ 弱项：<span style={{ color: T.warning }}>{profile.weaknesses.join('、')}</span></div> : <div style={{ color: T.muted }}>⚠ 弱项：暂无</div>}
            <div style={{ fontSize: 9, color: T.muted, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${T.border}` }}>
              基于 {profile?.conversation_count || 0} 次对话 · {estimateTokens(MemoryManager.formatProfileTag(profile))} tokens
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const Row = ({ k, v, color, bold }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
    <span>{k}</span><span style={{ color, fontWeight: bold ? 700 : 600 }}>{v}</span>
  </div>
);

/* ─── Interview History List ─── */
const InterviewHistory = ({ user, onBack, onPickSession }) => {
  const isMobile = useIsMobile();
  const [sessions, setSessions] = React.useState(() => MemoryManager.getSessionsIndex(user));
  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!confirm('确认删除此会话？')) return;
    MemoryManager.deleteSession(user, id);
    setSessions(MemoryManager.getSessionsIndex(user));
  };
  return (
    <div className="page-enter" style={{ padding: isMobile ? '16px' : '24px 32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>面试会话历史</h2>
          <p style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>共 {sessions.length} 次面试</p>
        </div>
        <Button variant="secondary" onClick={onBack}>← 返回题库</Button>
      </div>
      {sessions.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40, color: T.muted }}>
          📚 暂无历史会话，去题库开始一场面试吧
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 }}>
          {sessions.map(s => (
            <Card key={s.id} hoverable onClick={() => onPickSession(s)} style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Badge color={T.cyan}>{s.category || '通用'}</Badge>
                {s.score && <Badge color={s.score >= 80 ? T.success : s.score >= 70 ? T.warning : T.error}>{s.score} 分</Badge>}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.5 }}>{s.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: T.muted }}>
                <span>{s.rounds} 轮 · {new Date(s.updated_at || s.created_at).toLocaleString('zh-CN').slice(0, 16)}</span>
                <button onClick={(e) => handleDelete(s.id, e)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 13 }}>🗑</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Daily Question (v2 + history nav) ─── */
const DailyPage = ({ user, onShowHistory }) => {
  const today = new Date().toISOString().slice(0, 10);
  const qIdx = Math.floor(Date.now() / 86400000) % DAILY_QUESTIONS.length;
  const todayQ = DAILY_QUESTIONS[qIdx];
  const [answer, setAnswer] = React.useState('');
  const [submitted, setSubmitted] = React.useState(() => localStorage.getItem(`user_${user}_daily_${today}`) === '1');
  const [aiReview, setAiReview] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const isMobile = useIsMobile();
  const toast = useToast();

  React.useEffect(() => {
    if (submitted) {
      setAnswer(localStorage.getItem(`user_${user}_daily_answer_${today}`) || '');
      const saved = localStorage.getItem(`user_${user}_daily_review_${today}`) || '';
      if (saved) setAiReview(saved);
    }
  }, []);

  const handleSubmit = () => {
    if (!answer.trim()) { toast('请先写下你的回答', 'warning'); return; }
    const apiKey = localStorage.getItem(`user_${user}_apikey`);
    if (!apiKey) { toast('请先设置 API Key', 'warning'); return; }
    setSubmitted(true); setAiLoading(true);
    localStorage.setItem(`user_${user}_daily_${today}`, '1');
    localStorage.setItem(`user_${user}_daily_answer_${today}`, answer);
    Tracker.track(user, `完成每日一问：${todayQ.q.slice(0, 20)}...`);

    callDeepSeek(apiKey, [
      { role: 'system', content: DAILY_REVIEW_PROMPT },
      { role: 'user', content: `题目：${todayQ.q}\n\n学员回答：${answer}` },
    ],
      chunk => setAiReview(chunk),
      full => {
        setAiReview(full); setAiLoading(false);
        localStorage.setItem(`user_${user}_daily_review_${today}`, full);
        Tracker.checkAchievements(user, Tracker.getStats(user));
      },
      err => { setAiReview(`⚠️ AI评分失败：${err}`); setAiLoading(false); }
    );
  };

  return (
    <div className="page-enter" style={{ padding: isMobile ? '16px' : '32px 36px', maxWidth: 800, height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 16 : 24, gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: T.warning + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="daily" size={22} color={T.warning} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>每日一问</h2>
            <p style={{ fontSize: 12, color: T.muted }}>{today} · 第 {qIdx + 1}/{DAILY_QUESTIONS.length} 题</p>
          </div>
        </div>
        <Button variant="secondary" onClick={onShowHistory}>📅 历史日历</Button>
      </div>

      <Card style={{ marginBottom: 24, borderLeft: `3px solid ${T.warning}`, background: `linear-gradient(135deg, ${T.card}, ${T.warning}08)` }}>
        <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.8 }}>{todayQ.q}</p>
      </Card>

      {!submitted ? (
        <>
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="写下你的思考和回答..."
            style={{ width: '100%', minHeight: 200, padding: 16, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, color: T.text, fontSize: 14, lineHeight: 1.8, resize: 'vertical', outline: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, alignItems: 'center' }}>
            <Button variant="ghost" size="sm" onClick={() => setShowHint(!showHint)}>{showHint ? '隐藏提示' : '查看提示'}</Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: T.muted }}>{answer.length} 字</span>
              <Button onClick={handleSubmit}>提交回答</Button>
            </div>
          </div>
          {showHint && (
            <Card style={{ marginTop: 14, borderColor: T.p500 + '30' }}>
              <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>
                <strong style={{ color: T.p400 }}>思考提示：</strong><br />{todayQ.hint}
              </div>
            </Card>
          )}
        </>
      ) : (
        <div>
          <Card style={{ marginBottom: 16, borderColor: T.success + '30', background: T.success + '08' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon name="check" size={18} color={T.success} />
              <span style={{ fontWeight: 700, color: T.success, fontSize: 14 }}>今日已完成</span>
            </div>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{answer}</div>
          </Card>
          {aiReview ? (
            <Card>
              <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                <MarkdownRender text={aiReview} loading={aiLoading} />
              </div>
            </Card>
          ) : aiLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.p400, padding: 20 }}>
              <Spinner size={16} /> AI 评分中...
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

/* ─── Dashboard (unchanged from v1, just re-exported) ─── */
const ACHIEVEMENTS = [
  { id:'first_login', name:'初入江湖', desc:'首次登录系统', color:T.p500 },
  { id:'first_tool', name:'工具达人', desc:'首次使用AI工具', color:T.cyan },
  { id:'vocab_5', name:'求知若渴', desc:'收藏5个生词', color:'#3b82f6' },
  { id:'interview_3', name:'面霸初成', desc:'完成3次模拟面试', color:'#f43f5e' },
  { id:'daily_7', name:'持之以恒', desc:'连续7天每日一问', color:T.warning },
  { id:'knowledge_all', name:'全知全能', desc:'浏览全部48个知识节点', color:'#a855f7' },
  { id:'tool_10', name:'效率大师', desc:'累计使用AI工具10次', color:'#f97316' },
];

const DashboardPage = ({ user, onNavigate }) => {
  const isMobile = useIsMobile();
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => { const iv = setInterval(() => forceUpdate(n => n + 1), 3000); return () => clearInterval(iv); }, []);

  const stats = Tracker.getStats(user);
  const tokenStats = MemoryManager.getTokenStats(user);
  const profile = MemoryManager.getProfile(user);
  const achievements = JSON.parse(localStorage.getItem(`user_${user}_achievements`) || '[]');
  const track = JSON.parse(localStorage.getItem(`user_${user}_track`) || '[]');

  const radarData = [
    { label: '产品策略', value: Math.min(100, (stats.knowledge || 0) * 12 + 20) },
    { label: '用户研究', value: Math.min(100, (stats.dictionary || 0) * 6 + 15) },
    { label: '数据分析', value: Math.min(100, (stats.tools || 0) * 12 + 15) },
    { label: '技术理解', value: Math.min(100, (stats.knowledge || 0) * 8 + 10) },
    { label: 'AI 产品', value: Math.min(100, (stats.tools || 0) * 10 + 25) },
    { label: '项目管理', value: Math.min(100, (stats.interview || 0) * 10 + 15) },
  ];

  return (
    <div className="page-enter" style={{ padding: isMobile ? '16px' : '28px 32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? 16 : 24, gap: 10 }}>
        <h2 style={{ fontSize: isMobile ? 19 : 22, fontWeight: 800 }}>成长仪表盘</h2>
        <Button variant="secondary" onClick={() => onNavigate && onNavigate('report')}>📄 查看成长报告</Button>
      </div>

      {/* Token savings banner */}
      {tokenStats.calls > 0 && (
        <Card style={{ marginBottom: 24, background: T.success + '10', border: `1px solid ${T.success}40` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>💰 分层记忆累计节省</div>
              <div style={{ fontSize: 11, color: T.textSec }}>已通过 {tokenStats.calls} 次智能调用为你节省了大量 Token</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: T.success }}>{tokenStats.totalSaved}</div>
              <div style={{ fontSize: 11, color: T.muted }}>tokens · ≈¥{(tokenStats.totalSaved * 0.000002).toFixed(3)}</div>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: '知识学习', val: stats.knowledge || 0, icon: 'knowledge', color: T.p500 },
          { label: '工具调用', val: stats.tools || 0, icon: 'tools', color: T.cyan },
          { label: '词典查阅', val: stats.dictionary || 0, icon: 'book', color: '#3b82f6' },
          { label: '面试练习', val: stats.interview || 0, icon: 'interview', color: '#f43f5e' },
        ].map((s, i) => (
          <Card key={i} style={{ textAlign: 'center', padding: 18 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.color + '15', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon name={s.icon} size={20} color={s.color} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}><AnimatedNumber value={s.val} /></div>
            <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <Card style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>能力雷达图</h3>
          <RadarChart data={radarData} size={260} />
        </Card>
        <Card style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>成就系统 <span style={{ fontSize: 12, color: T.muted, fontWeight: 400 }}>{achievements.length}/{ACHIEVEMENTS.length}</span></h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {ACHIEVEMENTS.map(a => {
              const unlocked = achievements.includes(a.id);
              return (
                <div key={a.id} style={{ padding: '12px 14px', borderRadius: T.radiusSm, background: unlocked ? a.color + '12' : T.surface, border: `1px solid ${unlocked ? a.color + '30' : T.border}`, opacity: unlocked ? 1 : 0.5 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: unlocked ? a.color : T.muted, marginBottom: 2 }}>{unlocked ? '✅ ' : '🔒 '}{a.name}</div>
                  <div style={{ fontSize: 10, color: T.muted }}>{a.desc}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* User profile card */}
      {(profile?.preferences?.length || profile?.strengths?.length || profile?.weaknesses?.length) ? (
        <Card style={{ marginBottom: 28, background: `linear-gradient(135deg, ${T.p600}15, ${T.cyan}10)`, border: `1px solid ${T.p500}30` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🧬 你的 PM 画像 <span style={{ fontSize: 11, color: T.muted, fontWeight: 400 }}>· 基于 {profile.conversation_count || 0} 次对话提炼</span></h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>📌 关注领域</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {profile.preferences?.length ? profile.preferences.map(p => <Badge key={p} color={T.p400}>{p}</Badge>) : <span style={{ fontSize: 11, color: T.muted }}>暂无</span>}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>💪 强项</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {profile.strengths?.length ? profile.strengths.map(p => <Badge key={p} color={T.success}>{p}</Badge>) : <span style={{ fontSize: 11, color: T.muted }}>暂无</span>}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>⚠ 待提升</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {profile.weaknesses?.length ? profile.weaknesses.map(p => <Badge key={p} color={T.warning}>{p}</Badge>) : <span style={{ fontSize: 11, color: T.muted }}>暂无</span>}
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <Card style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>学习轨迹 <span style={{ fontSize: 12, color: T.muted, fontWeight: 400 }}>最近 {Math.min(track.length, 15)} 条</span></h3>
        {track.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0', color: T.muted }}>
            <Icon name="chart" size={32} color={T.muted} style={{ marginBottom: 10, opacity: 0.5 }} />
            <div style={{ fontSize: 13 }}>开始使用后，这里会记录你的学习历程</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {track.slice(-15).reverse().map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: T.radiusSm, background: T.surface }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.p500, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: T.textSec, flexShrink: 0, minWidth: 130 }}>{t.time}</span>
                <span style={{ fontSize: 13 }}>{t.action}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

/* Canvas Radar (copied unchanged from v1) */
const RadarChart = ({ data, size = 260 }) => {
  const canvasRef = React.useRef(null);
  const cx = size / 2, cy = size / 2, maxR = size * 0.38, n = data.length;
  React.useEffect(() => {
    const cvs = canvasRef.current; if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    cvs.width = size * dpr; cvs.height = size * dpr;
    cvs.style.width = size + 'px'; cvs.style.height = size + 'px';
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, size, size);
    const getPos = (i, r) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }; };
    for (let ring = 1; ring <= 4; ring++) {
      const r = (ring / 4) * maxR; ctx.beginPath();
      for (let i = 0; i <= n; i++) { const p = getPos(i % n, r); i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }
      ctx.closePath(); ctx.strokeStyle = 'rgba(42,42,110,0.5)'; ctx.lineWidth = 1; ctx.stroke();
    }
    for (let i = 0; i < n; i++) { const p = getPos(i, maxR); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.strokeStyle = 'rgba(42,42,110,0.4)'; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.beginPath();
    data.forEach((d, i) => { const r = (d.value / 100) * maxR; const p = getPos(i, r); i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0, 'rgba(139,92,246,0.35)'); grad.addColorStop(1, 'rgba(139,92,246,0.08)');
    ctx.fillStyle = grad; ctx.fill(); ctx.strokeStyle = 'rgba(139,92,246,0.7)'; ctx.lineWidth = 2; ctx.stroke();
    data.forEach((d, i) => {
      const r = (d.value / 100) * maxR; const p = getPos(i, r);
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fillStyle = '#8b5cf6'; ctx.fill();
      ctx.shadowColor = '#8b5cf6'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fillStyle = '#a78bfa'; ctx.fill();
      ctx.shadowBlur = 0;
      const lp = getPos(i, maxR + 22); ctx.fillStyle = '#94a3b8'; ctx.font = '11px -apple-system, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.label, lp.x, lp.y);
      const vp = getPos(i, maxR + 36); ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 11px -apple-system, sans-serif'; ctx.fillText(d.value, vp.x, vp.y);
    });
  }, [data, size]);
  return <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />;
};

Object.assign(window, { InterviewPage, DailyPage, DashboardPage, ACHIEVEMENTS, RadarChart, DIFF_META, getDiff });
