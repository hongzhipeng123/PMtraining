/* ── Growth Dashboard + Interview + Daily Question (real API) ── */

/* ── Interview Page ── */
const InterviewPage = ({ user }) => {
  const [category, setCategory] = React.useState('全部');
  const [currentQ, setCurrentQ] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [aiTyping, setAiTyping] = React.useState(false);
  const [round, setRound] = React.useState(0);
  const msgEnd = React.useRef(null);
  const toast = useToast();

  const pickQuestion = (cat) => {
    const pool = INTERVIEW_QUESTIONS.filter(q => cat === '全部' || q.cat === cat);
    const q = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQ(q);
    setMessages([{ role: 'ai', text: `**面试题目**\n\n**分类：** ${q.cat}　**难度：** ${q.difficulty}\n\n> ${q.q}\n\n请认真思考后作答，我会根据你的回答进行追问。前3轮只追问不给答案，之后给出综合点评。` }]);
    setRound(0); setInput('');
  };

  React.useEffect(() => { if (msgEnd.current) msgEnd.current.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim() || aiTyping) return;
    const apiKey = localStorage.getItem(`user_${user}_apikey`);
    if (!apiKey) { toast('请先设置 API Key', 'warning'); return; }

    const userMsg = input;
    const newMsgs = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMsgs);
    setInput(''); setAiTyping(true);
    const newRound = round + 1;
    setRound(newRound);

    Tracker.track(user, `模拟面试第${newRound}轮：${currentQ.q.slice(0, 20)}...`);

    // Build conversation history for API
    const apiMessages = [
      { role: 'system', content: INTERVIEW_SYSTEM_PROMPT + `\n\n当前面试题目：${currentQ.q}\n分类：${currentQ.cat}\n难度：${currentQ.difficulty}\n当前是第${newRound}轮回答。${newRound >= 3 ? '请给出综合点评（包含评分、亮点、改进建议、参考框架和参考答案要点）。' : '请进行追问（1-2个有针对性的深入问题）。'}` },
    ];
    // Add conversation history
    for (const msg of newMsgs) {
      if (msg.role === 'user') apiMessages.push({ role: 'user', content: msg.text });
      else if (msg.role === 'ai') apiMessages.push({ role: 'assistant', content: msg.text });
    }

    let aiText = '';
    callDeepSeek(apiKey, apiMessages,
      chunk => { aiText = chunk; },
      full => {
        setMessages(prev => [...prev, { role: 'ai', text: full }]);
        setAiTyping(false);
        if (newRound >= 3) {
          Tracker.updateStats(user, 'interview');
        }
      },
      err => {
        setMessages(prev => [...prev, { role: 'ai', text: `⚠️ AI回复失败：${err}\n\n请检查API Key或网络后重试。` }]);
        setAiTyping(false);
      }
    );
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!currentQ ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${T.p600}, #f43f5e)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.glow }}>
            <Icon name="interview" size={32} color="#fff" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>模拟面试官</h2>
            <p style={{ color: T.textSec, fontSize: 14 }}>选择面试方向，AI 面试官将抽题并进行多轮追问</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {INTERVIEW_CATS.map(cat => (
              <Button key={cat} variant={category === cat ? 'primary' : 'secondary'} size="sm" onClick={() => setCategory(cat)}>{cat}</Button>
            ))}
          </div>
          <Button size="lg" onClick={() => pickQuestion(category)}>开始面试</Button>
          <p style={{ fontSize: 12, color: T.muted, maxWidth: 400, textAlign: 'center', lineHeight: 1.7 }}>
            题库共 {INTERVIEW_QUESTIONS.length} 题 · AI 将在前3轮追问，之后给出综合点评
          </p>
        </div>
      ) : (
        <>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Badge color="#f43f5e">{currentQ.cat}</Badge>
              <Badge color={T.warning}>{currentQ.difficulty}</Badge>
              <span style={{ fontSize: 13, color: T.textSec }}>第 {round} 轮</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => pickQuestion(category)}>换题</Button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: `${msg.role === 'user' ? 'slideInRight' : 'slideInLeft'} 0.3s ease-out both` }}>
                <div style={{ maxWidth: '75%', padding: '14px 18px', borderRadius: 14, background: msg.role === 'user' ? T.p700 + 'cc' : T.surface, border: `1px solid ${msg.role === 'user' ? T.p600 + '60' : T.border}`, fontSize: 13, lineHeight: 1.8 }}>
                  <MarkdownRender text={msg.text} loading={false} />
                </div>
              </div>
            ))}
            {aiTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'fadeIn 0.3s ease-out both' }}>
                <div style={{ padding: '14px 18px', borderRadius: 14, background: T.surface, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Spinner size={14} /> <span style={{ fontSize: 13, color: T.textSec }}>面试官思考中...</span>
                </div>
              </div>
            )}
            <div ref={msgEnd} />
          </div>
          <div style={{ padding: '14px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, flexShrink: 0 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} placeholder="输入你的回答..." disabled={aiTyping}
              style={{ flex: 1, padding: '10px 14px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, color: T.text, fontSize: 14, outline: 'none' }} />
            <Button onClick={handleSend} disabled={aiTyping || !input.trim()} icon="send">发送</Button>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Daily Question ── */
const DailyPage = ({ user }) => {
  const today = new Date().toISOString().slice(0, 10);
  const qIdx = Math.floor(Date.now() / 86400000) % DAILY_QUESTIONS.length;
  const todayQ = DAILY_QUESTIONS[qIdx];
  const [answer, setAnswer] = React.useState('');
  const [submitted, setSubmitted] = React.useState(() => localStorage.getItem(`user_${user}_daily_${today}`) === '1');
  const [aiReview, setAiReview] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const toast = useToast();

  // Load saved answer if submitted
  React.useEffect(() => {
    if (submitted) {
      const savedAnswer = localStorage.getItem(`user_${user}_daily_answer_${today}`) || '';
      setAnswer(savedAnswer);
      const savedReview = localStorage.getItem(`user_${user}_daily_review_${today}`) || '';
      if (savedReview) setAiReview(savedReview);
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

    const messages = [
      { role: 'system', content: DAILY_REVIEW_PROMPT },
      { role: 'user', content: `题目：${todayQ.q}\n\n学员回答：${answer}` },
    ];
    callDeepSeek(apiKey, messages,
      chunk => setAiReview(chunk),
      full => {
        setAiReview(full); setAiLoading(false);
        localStorage.setItem(`user_${user}_daily_review_${today}`, full);
        Tracker.checkAchievements(user, Tracker.getStats(user));
      },
      err => {
        setAiReview(`⚠️ AI评分失败：${err}\n\n请检查API Key后刷新页面重试。`);
        setAiLoading(false);
      }
    );
  };

  return (
    <div className="page-enter" style={{ padding: '32px 36px', maxWidth: 800, height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: T.warning + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="daily" size={22} color={T.warning} />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>每日一问</h2>
          <p style={{ fontSize: 12, color: T.muted }}>{today}　第 {qIdx + 1}/{DAILY_QUESTIONS.length} 题</p>
        </div>
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
            <Card style={{ marginTop: 14, borderColor: T.p500 + '30', animation: 'fadeIn 0.3s ease-out both' }}>
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
            <Card style={{ animation: 'fadeIn 0.4s ease-out both' }}>
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

/* ── Growth Dashboard ── */
const ACHIEVEMENTS = [
  { id:'first_login', name:'初入江湖', desc:'首次登录系统', color:T.p500 },
  { id:'first_tool', name:'工具达人', desc:'首次使用AI工具', color:T.cyan },
  { id:'vocab_5', name:'求知若渴', desc:'收藏5个生词', color:'#3b82f6' },
  { id:'interview_3', name:'面霸初成', desc:'完成3次模拟面试', color:'#f43f5e' },
  { id:'daily_7', name:'持之以恒', desc:'连续7天每日一问', color:T.warning },
  { id:'knowledge_all', name:'全知全能', desc:'浏览全部48个知识节点', color:'#a855f7' },
  { id:'tool_10', name:'效率大师', desc:'累计使用AI工具10次', color:'#f97316' },
];

const DashboardPage = ({ user }) => {
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => { const iv = setInterval(() => forceUpdate(n => n + 1), 2000); return () => clearInterval(iv); }, []);

  const stats = Tracker.getStats(user);
  const achievements = React.useMemo(() => { try { return JSON.parse(localStorage.getItem(`user_${user}_achievements`) || '[]'); } catch { return []; } }, [user]);
  const track = React.useMemo(() => { try { return JSON.parse(localStorage.getItem(`user_${user}_track`) || '[]'); } catch { return []; } }, [user]);

  const radarData = [
    { label: '产品策略', value: Math.min(100, (stats.knowledge || 0) * 12 + 20) },
    { label: '用户研究', value: Math.min(100, (stats.dictionary || 0) * 6 + 15) },
    { label: '数据分析', value: Math.min(100, (stats.tools || 0) * 12 + 15) },
    { label: '技术理解', value: Math.min(100, (stats.knowledge || 0) * 8 + 10) },
    { label: 'AI 产品', value: Math.min(100, (stats.tools || 0) * 10 + 25) },
    { label: '项目管理', value: Math.min(100, (stats.interview || 0) * 10 + 15) },
  ];

  return (
    <div className="page-enter" style={{ padding: '28px 32px', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>成长仪表盘</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
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
                <div key={a.id} style={{ padding: '12px 14px', borderRadius: T.radiusSm, background: unlocked ? a.color + '12' : T.surface, border: `1px solid ${unlocked ? a.color + '30' : T.border}`, opacity: unlocked ? 1 : 0.5, transition: T.transition }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: unlocked ? a.color : T.muted, marginBottom: 2 }}>{unlocked ? '✅ ' : '🔒 '}{a.name}</div>
                  <div style={{ fontSize: 10, color: T.muted }}>{a.desc}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

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

/* ── Canvas Radar Chart ── */
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

Object.assign(window, { InterviewPage, DailyPage, DashboardPage, RadarChart });
