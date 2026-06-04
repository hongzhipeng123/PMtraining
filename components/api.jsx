/* ── DeepSeek API 封装 + 数据追踪系统 ── */

/**
 * 流式调用 DeepSeek API
 * @param {string} apiKey
 * @param {Array} messages - [{role:'system'|'user'|'assistant', content:'...'}]
 * @param {Function} onChunk - (partialText) => void
 * @param {Function} onDone - (fullText) => void
 * @param {Function} onError - (errorMsg) => void
 */
const callDeepSeek = async (apiKey, messages, onChunk, onDone, onError) => {
  if (!apiKey) { onError('未设置 API Key，请在设置中配置'); return; }
  try {
    const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '');
      if (resp.status === 401) { onError('API Key 无效，请检查设置'); return; }
      if (resp.status === 402) { onError('API 余额不足，请充值'); return; }
      if (resp.status === 429) { onError('请求过于频繁，请稍后重试'); return; }
      onError(`API 请求失败 (${resp.status})：${errBody.slice(0, 100)}`);
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onChunk(fullText);
          }
        } catch (e) { /* skip malformed chunks */ }
      }
    }
    onDone(fullText);
  } catch (err) {
    if (err.name === 'AbortError') { onError('请求已取消'); return; }
    onError(`网络错误：${err.message || '请检查网络连接'}`);
  }
};

/**
 * 非流式调用（用于短回答如面试追问）
 */
const callDeepSeekSync = async (apiKey, messages) => {
  if (!apiKey) throw new Error('未设置 API Key');
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
  if (!resp.ok) {
    if (resp.status === 401) throw new Error('API Key 无效');
    if (resp.status === 429) throw new Error('请求过于频繁');
    throw new Error(`API 请求失败 (${resp.status})`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
};

/* ── 数据追踪系统 ── */
const Tracker = {
  track(user, action) {
    if (!user) return;
    const key = `user_${user}_track`;
    const track = JSON.parse(localStorage.getItem(key) || '[]');
    track.push({ time: new Date().toLocaleString('zh-CN'), action });
    localStorage.setItem(key, JSON.stringify(track.slice(-40)));
  },

  updateStats(user, dimension) {
    if (!user) return;
    const key = `user_${user}_stats`;
    const stats = JSON.parse(localStorage.getItem(key) || '{}');
    stats[dimension] = (stats[dimension] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(stats));
    // Check achievements after every stat update
    Tracker.checkAchievements(user, stats);
  },

  getStats(user) {
    try { return JSON.parse(localStorage.getItem(`user_${user}_stats`) || '{}'); }
    catch { return {}; }
  },

  checkAchievements(user, stats) {
    const key = `user_${user}_achievements`;
    const achs = JSON.parse(localStorage.getItem(key) || '[]');
    const add = id => { if (!achs.includes(id)) { achs.push(id); changed = true; } };
    let changed = false;

    // first_login is set at login time
    if ((stats.tools || 0) >= 1) add('first_tool');
    if ((stats.interview || 0) >= 3) add('interview_3');
    if ((stats.tools || 0) >= 10) add('tool_10');

    // Check saved vocab count
    const saved = JSON.parse(localStorage.getItem(`user_${user}_vocab_saved`) || '[]');
    if (saved.length >= 5) add('vocab_5');

    // Check daily streak
    const today = new Date();
    let streak = 0;
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().slice(0, 10);
      if (localStorage.getItem(`user_${user}_daily_${dateStr}`) === '1') streak++;
      else break;
    }
    if (streak >= 7) add('daily_7');

    // Check knowledge browsed count
    const browsed = JSON.parse(localStorage.getItem(`user_${user}_knowledge_browsed`) || '[]');
    if (browsed.length >= 48) add('knowledge_all');

    if (changed) localStorage.setItem(key, JSON.stringify(achs));
  },

  trackKnowledgeBrowse(user, nodeName) {
    if (!user) return;
    const key = `user_${user}_knowledge_browsed`;
    const browsed = JSON.parse(localStorage.getItem(key) || '[]');
    if (!browsed.includes(nodeName)) {
      browsed.push(nodeName);
      localStorage.setItem(key, JSON.stringify(browsed));
    }
  },
};

Object.assign(window, { callDeepSeek, callDeepSeekSync, Tracker });
