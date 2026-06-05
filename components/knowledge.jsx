/* ── Knowledge Graph Page (refactored to use data-knowledge + real API) ── */

/* ── Mastery State Manager ── */
const MASTERY_STATES = { mastered: { label: '已掌握', icon: '✓', color: '#10b981' },
  learning: { label: '学习中', icon: '◐', color: '#f59e0b' },
  todo:     { label: '待学习', icon: '○', color: '#64748b' } };
const Mastery = {
  getAll(user) {
    try { return JSON.parse(localStorage.getItem(`user_${user}_kg_mastery`) || '{}'); }
    catch { return {}; }
  },
  get(user, nodeName) { return Mastery.getAll(user)[nodeName] || 'todo'; },
  set(user, nodeName, state) {
    const all = Mastery.getAll(user);
    if (state === 'todo') delete all[nodeName];
    else all[nodeName] = state;
    localStorage.setItem(`user_${user}_kg_mastery`, JSON.stringify(all));
  },
  counts(user) {
    const all = Mastery.getAll(user);
    let mastered = 0, learning = 0;
    Object.values(all).forEach(s => { if (s === 'mastered') mastered++; else if (s === 'learning') learning++; });
    return { mastered, learning, todo: 48 - mastered - learning };
  },
  countsByDomain(user) {
    const all = Mastery.getAll(user);
    const result = {};
    (window.KNOWLEDGE_TREE || []).forEach(d => {
      let m = 0, l = 0;
      d.children.forEach(c => {
        const s = all[c.name];
        if (s === 'mastered') m++;
        else if (s === 'learning') l++;
      });
      result[d.id] = { mastered: m, learning: l, total: d.children.length };
    });
    return result;
  },
};

/* ── Home Page ── */
const HomePage = ({ user, stats, onNavigate }) => {
  const quickLinks = [
    { icon: 'knowledge', label: '知识图谱', desc: '8大能力域，48个知识点', page: 'knowledge', color: T.p500 },
    { icon: 'tools', label: 'AI 工具箱', desc: '市调·竞品·PRD 一键生成', page: 'market', color: T.cyan },
    { icon: 'book', label: '名词百科', desc: '35条PM核心术语速查', page: 'dictionary', color: '#3b82f6' },
    { icon: 'interview', label: '模拟面试', desc: `${INTERVIEW_QUESTIONS.length}题AI面试官陪练`, page: 'interview', color: '#f43f5e' },
  ];
  const st = stats || { knowledge: 0, tools: 0, dictionary: 0, interview: 0 };
  const todayIdx = Math.floor(Date.now() / 86400000) % DAILY_QUESTIONS.length;
  const todayQ = DAILY_QUESTIONS[todayIdx];
  const isMobile = useIsMobile();
  return (
    <div className="page-enter" style={{ padding: isMobile ? '20px 16px' : '32px 36px', maxWidth: 1100, overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: isMobile ? 24 : 32 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, marginBottom: 6 }}>
          欢迎回来，<span style={{ color: T.p400 }}>{user}</span>
        </h1>
        <p style={{ color: T.textSec, fontSize: 14 }}>继续你的 PM 修炼之旅</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 12 : 16, marginBottom: isMobile ? 24 : 32 }}>
        {[
          { label: '知识学习', val: st.knowledge, color: T.p500 },
          { label: '工具调用', val: st.tools, color: T.cyan },
          { label: '词典查阅', val: st.dictionary, color: '#3b82f6' },
          { label: '面试练习', val: st.interview, color: '#f43f5e' },
        ].map((s, i) => (
          <Card key={i} style={{ textAlign: 'center', borderTop: `2px solid ${s.color}` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}><AnimatedNumber value={s.val} /></div>
            <div style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: T.text }}>快速开始</h3>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 14, marginBottom: isMobile ? 24 : 32 }}>
        {quickLinks.map((q, i) => (
          <Card key={i} hoverable onClick={() => onNavigate(q.page)}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18, animation: `slideInUp 0.3s ease-out ${i * 0.05}s both` }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: q.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={q.icon} size={22} color={q.color} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{q.label}</div>
              <div style={{ fontSize: 12, color: T.textSec }}>{q.desc}</div>
            </div>
          </Card>
        ))}
      </div>
      <Card style={{ background: `linear-gradient(135deg, ${T.p700}30, ${T.card})`, borderColor: T.p500 + '40' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Badge color={T.p400}>每日一问</Badge>
          <span style={{ fontSize: 12, color: T.muted }}>今日话题</span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.7 }}>{todayQ.q}</p>
        <Button variant="ghost" size="sm" style={{ marginTop: 12 }} onClick={() => onNavigate('daily')}>去回答 →</Button>
      </Card>
    </div>
  );
};

/* ── Mind Map (unchanged logic, uses KNOWLEDGE_TREE from data-knowledge.jsx) ── */
const MindMap = ({ onSelectNode, user, masteryVersion }) => {
  const [expanded, setExpanded] = React.useState({});
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [scale, setScale] = React.useState(1);
  const cx = 500, cy = 380, mainRadius = 250, subRadius = 130;
  const toggleExpand = id => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const getMainPos = idx => {
    const angle = (idx / KNOWLEDGE_TREE.length) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(angle) * mainRadius, y: cy + Math.sin(angle) * mainRadius };
  };
  const getSubPos = (pi, ci, total) => {
    const pa = (pi / KNOWLEDGE_TREE.length) * Math.PI * 2 - Math.PI / 2;
    const spread = Math.PI * 0.45, start = pa - spread / 2;
    const angle = start + (ci / (total - 1 || 1)) * spread;
    const p = getMainPos(pi);
    return { x: p.x + Math.cos(angle) * subRadius, y: p.y + Math.sin(angle) * subRadius };
  };
  const onMD = e => { if (e.target.closest('.mind-node')) return; setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const onMM = e => { if (!dragging) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const onMU = () => setDragging(false);
  const onWh = e => { e.preventDefault(); setScale(s => Math.max(0.4, Math.min(2, s - e.deltaY * 0.001))); };

  return (
    <div onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU} onWheel={onWh}
      style={{ width: '100%', height: '100%', overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab', position: 'relative', background: `radial-gradient(ellipse at center, ${T.bgAlt} 0%, ${T.bg} 100%)` }}>
      <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10, display: 'flex', gap: 6 }}>
        <button onClick={() => setScale(s => Math.min(2, s + 0.2))} style={zoomBtnStyle}>+</button>
        <button onClick={() => setScale(1)} style={zoomBtnStyle}>{Math.round(scale * 100)}%</button>
        <button onClick={() => setScale(s => Math.max(0.4, s - 0.2))} style={zoomBtnStyle}>−</button>
      </div>
      <div style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: '500px 380px', transition: dragging ? 'none' : 'transform 0.15s ease', width: 1000, height: 760, position: 'absolute', left: 'calc(50% - 500px)', top: 'calc(50% - 380px)' }}>
        <svg width="1000" height="760" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          {KNOWLEDGE_TREE.map((node, i) => {
            const pos = getMainPos(i);
            return (
              <React.Fragment key={node.id}>
                <line x1={cx} y1={cy} x2={pos.x} y2={pos.y} stroke={node.color} strokeWidth={2} strokeOpacity={0.4} />
                {expanded[node.id] && node.children.map((_, ci) => {
                  const sub = getSubPos(i, ci, node.children.length);
                  return <line key={ci} x1={pos.x} y1={pos.y} x2={sub.x} y2={sub.y} stroke={node.color} strokeWidth={1.5} strokeOpacity={0.3} style={{ animation: 'fadeIn 0.3s ease-out both', animationDelay: `${ci * 0.04}s` }} />;
                })}
              </React.Fragment>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', left: cx - 60, top: cy - 30, width: 120, height: 60, background: `linear-gradient(135deg, ${T.p600}, ${T.p700})`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 32px ${T.p500}50`, border: `2px solid ${T.p400}60`, animation: 'glowPulse 3s ease-in-out infinite', zIndex: 5 }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: '#fff', textAlign: 'center' }}>PM 能力模型</span>
        </div>
        {KNOWLEDGE_TREE.map((node, i) => {
          const pos = getMainPos(i);
          const isExp = expanded[node.id];
          return (
            <React.Fragment key={node.id}>
              <MindNode x={pos.x - 52} y={pos.y - 22} color={node.color} label={node.label} expanded={isExp} onClick={() => toggleExpand(node.id)} />
              {isExp && node.children.map((child, ci) => {
                const sub = getSubPos(i, ci, node.children.length);
                const mastery = user ? Mastery.get(user, child.name) : 'todo';
                return <MindLeaf key={ci} x={sub.x - 42} y={sub.y - 16} color={node.color} label={child.name} delay={ci * 0.04}
                  mastery={mastery}
                  onClick={() => onSelectNode && onSelectNode(child.name, node.label)} />;
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
const zoomBtnStyle = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, width: 36, height: 36, cursor: 'pointer', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const MindNode = ({ x, y, color, label, expanded, onClick }) => { const [hov, setHov] = React.useState(false); return (<div className="mind-node" onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ position: 'absolute', left: x, top: y, width: 104, height: 44, background: hov ? color + '30' : color + '18', border: `1.5px solid ${color}${hov ? '90' : '50'}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: T.transition, zIndex: 10, boxShadow: hov ? `0 0 20px ${color}40` : 'none', transform: hov ? 'scale(1.08)' : 'scale(1)' }}><span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span><span style={{ fontSize: 10, color, opacity: 0.7 }}>{expanded ? '−' : '+'}</span></div>); };
const MindLeaf = ({ x, y, color, label, delay, mastery, onClick }) => {
  const [hov, setHov] = React.useState(false);
  const ms = MASTERY_STATES[mastery] || MASTERY_STATES.todo;
  const dim = mastery === 'todo';
  return (
    <div className="mind-node" onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute', left: x, top: y, minWidth: 84, height: 32, padding: '0 10px',
        background: hov ? color + '20' : T.surface,
        border: `1px solid ${mastery === 'mastered' ? ms.color + '60' : color + (hov ? '60' : '30')}`,
        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        cursor: 'pointer', transition: T.transition, zIndex: 8, whiteSpace: 'nowrap',
        animation: `nodeExpand 0.3s ease-out ${delay}s both`,
        boxShadow: hov ? `0 0 12px ${color}30` : 'none',
        opacity: dim ? 0.75 : 1,
      }}>
      <span style={{ fontSize: 11, color: ms.color, fontWeight: 700, lineHeight: 1 }}>{ms.icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: hov ? color : T.textSec }}>{label}</span>
    </div>
  );
};

/* ── Mobile List View (replaces the mind map on small screens) ── */
const KnowledgeListView = ({ user, onSelectNode, masteryVersion }) => {
  const [open, setOpen] = React.useState(() => (KNOWLEDGE_TREE[0] ? { [KNOWLEDGE_TREE[0].id]: true } : {}));
  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {KNOWLEDGE_TREE.map(domain => {
          const isOpen = !!open[domain.id];
          let m = 0, l = 0;
          domain.children.forEach(c => { const s = Mastery.get(user, c.name); if (s === 'mastered') m++; else if (s === 'learning') l++; });
          return (
            <div key={domain.id} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, borderLeft: `3px solid ${domain.color}`, overflow: 'hidden' }}>
              <div onClick={() => setOpen(p => ({ ...p, [domain.id]: !p[domain.id] }))}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', cursor: 'pointer' }}>
                <span style={{ fontSize: 18 }}>{domain.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: domain.color }}>{domain.label}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{m} 已掌握 · {l} 学习中 · 共 {domain.children.length}</div>
                </div>
                <span style={{ fontSize: 14, color: T.muted, transform: isOpen ? 'rotate(90deg)' : 'none', transition: T.transition }}>›</span>
              </div>
              {isOpen && (
                <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {domain.children.map(child => {
                    const ms = MASTERY_STATES[Mastery.get(user, child.name)] || MASTERY_STATES.todo;
                    return (
                      <div key={child.name} onClick={() => onSelectNode(child.name, domain.label)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, cursor: 'pointer' }}>
                        <span style={{ fontSize: 13, color: ms.color, fontWeight: 700, lineHeight: 1, flexShrink: 0 }}>{ms.icon}</span>
                        <span style={{ fontSize: 13, color: T.text, flex: 1 }}>{child.name}</span>
                        <span style={{ fontSize: 11, color: T.muted, flexShrink: 0 }}>{ms.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Knowledge Page ── */
const KnowledgePage = ({ user }) => {
  const [selectedNode, setSelectedNode] = React.useState(null);
  const [aiExplain, setAiExplain] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('graph');
  const [masteryVer, setMasteryVer] = React.useState(0);
  const isMobile = useIsMobile();
  const toast = useToast();

  const counts = React.useMemo(() => Mastery.counts(user), [user, masteryVer]);
  const byDomain = React.useMemo(() => Mastery.countsByDomain(user), [user, masteryVer]);

  const setMastery = (name, state) => {
    Mastery.set(user, name, state);
    setMasteryVer(v => v + 1);
    toast(`已标记为「${MASTERY_STATES[state].label}」`, 'success');
  };

  // Find detail from static data first, then call API if connected
  const findStaticDetail = (name) => {
    for (const cat of KNOWLEDGE_TREE) {
      for (const child of cat.children) {
        if (child.name === name) return child.detail;
      }
    }
    return null;
  };

  const handleSelectNode = (name, category) => {
    setSelectedNode({ name, category });
    setAiLoading(true);
    setAiExplain('');

    // Track
    Tracker.track(user, `查看知识点：${name}`);
    Tracker.updateStats(user, 'knowledge');
    Tracker.trackKnowledgeBrowse(user, name);
    // Auto-mark as learning if untouched
    if (Mastery.get(user, name) === 'todo') {
      setTimeout(() => { Mastery.set(user, name, 'learning'); setMasteryVer(v => v + 1); }, 800);
    }

    // Try static data first
    const staticDetail = findStaticDetail(name);
    const apiKey = localStorage.getItem(`user_${user}_apikey`);

    if (apiKey && apiKey.trim()) {
      // Use real API for richer explanation
      const messages = [
        { role: 'system', content: KNOWLEDGE_SYSTEM_PROMPT },
        { role: 'user', content: `请深入讲解产品经理知识点「${name}」（所属领域：${category}）。` },
      ];
      callDeepSeek(apiKey, messages,
        chunk => setAiExplain(chunk),
        full => { setAiExplain(full); setAiLoading(false); },
        err => {
          // Fallback to static
          setAiExplain(staticDetail || `**${name}**\n\n${name}是${category}领域的核心知识点。\n\n⚠️ API调用失败：${err}\n\n请检查API Key设置。`);
          setAiLoading(false);
        }
      );
    } else {
      // Use static data
      setTimeout(() => {
        setAiExplain(staticDetail || `**${name}**\n\n${name}是${category}领域的核心知识点。\n\n💡 配置 DeepSeek API Key 后可获取更详细的AI解析。`);
        setAiLoading(false);
      }, 300);
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: isMobile ? '14px 16px 0' : '20px 28px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 10 : 0, justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-end', marginBottom: 14 }}>
            <TabBar tabs={[{ key: 'graph', label: isMobile ? '知识点' : '知识图谱' }, { key: 'topics', label: 'AI 专题' }, { key: 'cases', label: '经典案例' }, { key: 'mastery', label: '掌握进度' }]} active={activeTab} onChange={setActiveTab} style={{ width: isMobile ? '100%' : 400 }} />
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: T.textSec, justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
              <span><span style={{ color: T.success, fontWeight: 700 }}>✓ {counts.mastered}</span> 已掌握</span>
              <span><span style={{ color: T.warning, fontWeight: 700 }}>◐ {counts.learning}</span> 学习中</span>
              <span><span style={{ color: T.muted, fontWeight: 700 }}>○ {counts.todo}</span> 待学习</span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 'graph' && (isMobile
            ? <KnowledgeListView user={user} onSelectNode={handleSelectNode} masteryVersion={masteryVer} />
            : <MindMap onSelectNode={handleSelectNode} user={user} masteryVersion={masteryVer} />)}
          {activeTab === 'topics' && (
            <div style={{ padding: isMobile ? 16 : 28, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))', gap: isMobile ? 12 : 16, overflowY: 'auto', height: '100%' }}>
              {AI_TOPICS.map((t, i) => (
                <Card key={i} hoverable onClick={() => handleSelectNode(t.title, 'AI专题')} style={{ borderLeft: `3px solid ${t.color}`, animation: `slideInUp 0.3s ease-out ${i * 0.05}s both` }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6 }}>{t.desc}</div>
                </Card>
              ))}
            </div>
          )}
          {activeTab === 'mastery' && (
            <div style={{ padding: isMobile ? 16 : 28, overflowY: 'auto', height: '100%' }}>
              <Card style={{ marginBottom: 18, background: `linear-gradient(135deg, ${T.p600}15, ${T.cyan}10)`, border: `1px solid ${T.p500}30` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>整体进度</div>
                    <div style={{ fontSize: 11, color: T.textSec }}>距离「全知全能」勋章还差 <strong style={{ color: T.warning }}>{48 - counts.mastered}</strong> 个</div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: T.p400 }}>{Math.round(counts.mastered / 48 * 100)}%</div>
                </div>
                <div style={{ height: 8, background: T.bg, borderRadius: 4, overflow: 'hidden', display: 'flex', marginTop: 12 }}>
                  <div style={{ width: `${counts.mastered / 48 * 100}%`, background: T.success }} />
                  <div style={{ width: `${counts.learning / 48 * 100}%`, background: T.warning }} />
                </div>
              </Card>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 12 }}>
                {KNOWLEDGE_TREE.map(domain => {
                  const c = byDomain[domain.id] || { mastered: 0, learning: 0, total: 6 };
                  return (
                    <Card key={domain.id} style={{ padding: 14, borderLeft: `3px solid ${domain.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14 }}>{domain.icon}</span>
                          <span style={{ fontWeight: 700, fontSize: 13, color: domain.color }}>{domain.label}</span>
                        </div>
                        <span style={{ fontSize: 11, color: T.muted }}>{c.mastered}/{c.total}</span>
                      </div>
                      <div style={{ height: 4, background: T.bg, borderRadius: 2, overflow: 'hidden', marginBottom: 12, display: 'flex' }}>
                        <div style={{ width: `${c.mastered / c.total * 100}%`, background: T.success }} />
                        <div style={{ width: `${c.learning / c.total * 100}%`, background: T.warning }} />
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {domain.children.map(node => {
                          const ms = Mastery.get(user, node.name);
                          const meta = MASTERY_STATES[ms];
                          return (
                            <span key={node.name} onClick={() => handleSelectNode(node.name, domain.label)} style={{
                              fontSize: 10, padding: '3px 8px', borderRadius: 12, cursor: 'pointer',
                              background: meta.color + '15', color: meta.color,
                              border: `1px solid ${meta.color}30`,
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}>
                              <span>{meta.icon}</span>{node.name}
                            </span>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedNode && (
        <div style={isMobile ? {
          position: 'fixed', left: 0, right: 0, bottom: 0, top: '12%', zIndex: 120,
          borderTopLeftRadius: 18, borderTopRightRadius: 18, borderTop: `1px solid ${T.border}`,
          background: T.bgAlt, display: 'flex', flexDirection: 'column',
          boxShadow: '0 -12px 48px rgba(0,0,0,0.55)', paddingBottom: 'env(safe-area-inset-bottom)',
        } : { width: 380, borderLeft: `1px solid ${T.border}`, background: T.bgAlt, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease-out both', flexShrink: 0 }}
          className={isMobile ? 'anim-slide-up-sheet' : ''}>
          <div style={{ padding: '20px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>{selectedNode.category}</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedNode.name}</div>
            </div>
            <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer' }}><Icon name="close" size={isMobile ? 22 : 18} /></button>
          </div>
          {/* Mastery selector */}
          <div style={{ padding: '10px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 6 }}>
            {Object.entries(MASTERY_STATES).map(([key, m]) => {
              const active = Mastery.get(user, selectedNode.name) === key;
              return (
                <button key={key} onClick={() => setMastery(selectedNode.name, key)} style={{
                  flex: 1, padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
                  background: active ? m.color + '25' : T.surface,
                  border: `1px solid ${active ? m.color + '60' : T.border}`,
                  color: active ? m.color : T.textSec,
                  fontSize: 11, fontWeight: active ? 700 : 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}>
                  <span>{m.icon}</span>{m.label}
                </button>
              );
            })}
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto', fontSize: 13, lineHeight: 1.8, color: T.textSec }}>
            {aiLoading && !aiExplain ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.p400 }}><Spinner size={16} /> AI 解析中...</div>
            ) : (
              <MarkdownRender text={aiExplain} loading={aiLoading} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { HomePage, KnowledgePage, Mastery, MASTERY_STATES });
