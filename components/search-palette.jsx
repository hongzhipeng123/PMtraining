/* ── Cmd+K Global Search Palette ── */

const CmdKPalette = ({ open, onClose, onNavigate, user }) => {
  const isMobile = useIsMobile();
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    if (open) { setQuery(''); setSelected(0); }
  }, [open]);

  /* Build searchable index */
  const allItems = React.useMemo(() => {
    const items = [];
    // Knowledge nodes
    (window.KNOWLEDGE_TREE || []).forEach(domain => {
      items.push({ type: '能力域', icon: '🧠', title: domain.label, sub: `${domain.children?.length || 0} 个知识点`,
        action: () => onNavigate('knowledge') });
      (domain.children || []).forEach(child => {
        const name = typeof child === 'string' ? child : child.name;
        items.push({ type: '知识点', icon: '📚', title: name, sub: domain.label,
          action: () => onNavigate('knowledge') });
      });
    });
    // Dictionary terms
    (window.DICT_TERMS || []).forEach(t => {
      items.push({ type: '术语', icon: '📖', title: t.term, sub: `${t.full} · ${t.cat}`,
        action: () => onNavigate('dictionary') });
    });
    // Interview questions
    (window.INTERVIEW_QUESTIONS || []).forEach((q, i) => {
      items.push({ type: '面试题', icon: '🎤', title: q.q.slice(0, 50), sub: `${q.cat} · ${q.difficulty}级`,
        action: () => onNavigate('interview') });
    });
    // Tools
    [
      { key: 'market', label: '市场调研助手', desc: 'AI 生成市场报告' },
      { key: 'competitor', label: '竞品分析器', desc: 'AI 生成竞品报告' },
      { key: 'prd', label: 'PRD 生成器', desc: 'AI 生成需求文档' },
    ].forEach(t => {
      items.push({ type: '工具', icon: '🛠', title: t.label, sub: t.desc,
        action: () => onNavigate(t.key) });
    });
    // Pages
    [
      { key: 'home', label: '首页', desc: '快速导航' },
      { key: 'dashboard', label: '成长仪表盘', desc: '查看学习进度' },
      { key: 'daily', label: '每日一问', desc: '今日话题' },
      { key: 'report', label: '成长报告', desc: '周/月度总结' },
    ].forEach(p => {
      items.push({ type: '页面', icon: '📍', title: p.label, sub: p.desc, action: () => onNavigate(p.key) });
    });
    // Recent sessions
    if (user) {
      (MemoryManager.getSessionsIndex(user) || []).slice(0, 5).forEach(s => {
        items.push({ type: '历史会话', icon: '🕐', title: s.title || '未命名会话',
          sub: `${s.category || ''} · ${s.score ? s.score + '分' : '进行中'}`,
          action: () => onNavigate('interview') });
      });
    }
    return items;
  }, [user, open]);

  const matched = React.useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 8); // initial: show top items
    const q = query.toLowerCase();
    return allItems.filter(it =>
      it.title.toLowerCase().includes(q) || it.sub.toLowerCase().includes(q) || it.type.includes(q)
    ).slice(0, 20);
  }, [query, allItems]);

  /* Group by type */
  const grouped = React.useMemo(() => {
    const g = {};
    matched.forEach(item => { (g[item.type] = g[item.type] || []).push(item); });
    return g;
  }, [matched]);

  /* Flatten for keyboard nav */
  const flatItems = matched;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(flatItems.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(0, s - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (flatItems[selected]) { flatItems[selected].action(); onClose(); } }
  };

  if (!open) return null;

  let runningIdx = 0;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      paddingTop: isMobile ? 'calc(8px + env(safe-area-inset-top))' : 80,
      paddingLeft: isMobile ? 8 : 0, paddingRight: isMobile ? 8 : 0,
    }} className="anim-fade-in">
      <div onClick={e => e.stopPropagation()} style={{
        width: 640, maxWidth: isMobile ? '100%' : '90vw', background: T.bgAlt, borderRadius: 16,
        border: `1px solid ${T.p500}40`, boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 40px ${T.p500}30`,
        overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: isMobile ? '88vh' : '70vh',
      }} className="anim-fade-in-scale">
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderBottom: `1px solid ${T.border}` }}>
          <Icon name="search" size={18} color={T.p400} />
          <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            placeholder="搜索术语、知识点、面试题、工具..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: T.text, fontSize: 16 }} />
          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: T.surface, color: T.muted, fontFamily: 'monospace', border: `1px solid ${T.border}` }}>esc</span>
        </div>
        {/* Results */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {flatItems.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: T.muted, fontSize: 13 }}>未找到匹配结果</div>
          ) : (
            Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div style={{ padding: '8px 12px 4px', fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {type} · {items.length}
                </div>
                {items.map(it => {
                  const myIdx = runningIdx++;
                  const isSel = myIdx === selected;
                  return (
                    <div key={myIdx} onClick={() => { it.action(); onClose(); }}
                      onMouseEnter={() => setSelected(myIdx)}
                      style={{
                        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                        background: isSel ? T.p500 + '25' : 'transparent',
                        border: `1px solid ${isSel ? T.p500 + '60' : 'transparent'}`,
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                      <span style={{ fontSize: 16 }}>{it.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</div>
                        <div style={{ fontSize: 11, color: T.textSec, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.sub}</div>
                      </div>
                      {isSel && <span style={{ fontSize: 10, color: T.p400 }}>↵</span>}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
        {/* Footer */}
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.border}`, display: isMobile ? 'none' : 'flex', justifyContent: 'space-between', fontSize: 10, color: T.muted }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span><kbd style={kbdStyle}>↑</kbd><kbd style={kbdStyle}>↓</kbd> 导航</span>
            <span><kbd style={kbdStyle}>↵</kbd> 选择</span>
            <span><kbd style={kbdStyle}>esc</kbd> 关闭</span>
          </div>
          <div>{flatItems.length} 条结果</div>
        </div>
      </div>
    </div>
  );
};

const kbdStyle = {
  display: 'inline-block', padding: '1px 5px', background: T.surface, borderRadius: 3,
  fontSize: 9, fontFamily: 'monospace', color: T.textSec, margin: '0 2px',
  border: `1px solid ${T.border}`,
};

Object.assign(window, { CmdKPalette });
