/* ── Main App v2.0: Sidebar + Routing + Cmd+K + Memory Settings ── */

const NAV_ITEMS = [
  { key:'home', label:'首页', icon:'home' },
  { key:'knowledge', label:'知识图谱', icon:'knowledge' },
  { type:'divider', label:'AI 工具箱' },
  { key:'market', label:'市场调研', icon:'search' },
  { key:'competitor', label:'竞品分析', icon:'chart' },
  { key:'prd', label:'PRD 生成', icon:'book' },
  { type:'divider', label:'学习中心' },
  { key:'dictionary', label:'名词百科', icon:'book' },
  { key:'interview', label:'模拟面试', icon:'interview' },
  { key:'daily', label:'每日一问', icon:'daily' },
  { type:'divider', label:'个人' },
  { key:'dashboard', label:'成长仪表盘', icon:'dashboard' },
  { key:'report', label:'成长报告', icon:'chart' },
];

const Sidebar = ({ active, onNavigate, collapsed, onToggle, user, onLogout, onOpenSettings, onOpenCmdK, isMobile, mobileOpen, onCloseMobile }) => (
  <div style={{
    width: isMobile ? 270 : (collapsed ? 64 : 220), height: '100%', background: T.bgAlt,
    borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column',
    transition: isMobile ? 'transform 0.3s cubic-bezier(0.4,0,0.2,1)' : 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
    flexShrink: 0, overflow: 'hidden',
    position: isMobile ? 'fixed' : 'relative',
    top: 0, left: 0, bottom: 0, zIndex: 90,
    transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
    paddingTop: isMobile ? 'env(safe-area-inset-top)' : 0,
    boxShadow: isMobile && mobileOpen ? '8px 0 40px rgba(0,0,0,0.5)' : 'none',
  }}>
    {isMobile && (
      <button onClick={onCloseMobile} style={{ position: 'absolute', top: 'calc(16px + env(safe-area-inset-top))', right: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.textSec, zIndex: 5 }}>
        <Icon name="close" size={16} />
      </button>
    )}
    <div style={{ padding: collapsed ? '20px 12px' : '20px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${T.p600}, ${T.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', boxShadow: T.glowSm }}>PM</div>
      {!collapsed && <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}><div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>AI PM 修炼场</div><div style={{ fontSize: 10, color: T.muted }}>v2.0</div></div>}
    </div>
    {!collapsed && (
      <div style={{ padding: '10px 12px 4px' }}>
        <div onClick={onOpenCmdK} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', borderRadius: 8, background: T.surface,
          border: `1px solid ${T.border}`, cursor: 'pointer', transition: T.transition,
        }}>
          <Icon name="search" size={14} color={T.muted} />
          <span style={{ flex: 1, fontSize: 12, color: T.muted }}>快速搜索...</span>
          <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, background: T.bg, color: T.muted, fontFamily: 'monospace', border: `1px solid ${T.border}` }}>⌘K</span>
        </div>
      </div>
    )}
    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
      {NAV_ITEMS.map((item, i) => {
        if (item.type === 'divider') {
          if (collapsed) return <div key={i} style={{ height: 1, background: T.border, margin: '8px 12px' }} />;
          return <div key={i} style={{ padding: '12px 16px 4px', fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</div>;
        }
        return <NavItem key={item.key} item={item} active={active === item.key} collapsed={collapsed} onClick={() => onNavigate(item.key)} />;
      })}
    </div>
    <div style={{ padding: '8px 0', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
      <NavItem item={{ key:'settings', label:'设置', icon:'settings' }} collapsed={collapsed} onClick={onOpenSettings} />
      <div style={{ padding: collapsed ? '10px 12px' : '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg, ${T.p500}, ${T.p700})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{(user || 'U')[0].toUpperCase()}</div>
        {!collapsed && <div style={{ flex: 1, overflow: 'hidden' }}><div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user}</div></div>}
        {!collapsed && <button onClick={onLogout} title="退出登录" style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: 4, flexShrink: 0 }}><Icon name="logout" size={16} /></button>}
      </div>
    </div>
    <button onClick={onToggle} style={{ display: isMobile ? 'none' : 'flex', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'absolute', top: 28, right: -12, zIndex: 20, color: T.textSec, boxShadow: T.glowSm }}>
      <Icon name={collapsed ? 'expand' : 'collapse'} size={14} />
    </button>
  </div>
);

const NavItem = ({ item, active, collapsed, onClick }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      data-tooltip={collapsed ? item.label : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: collapsed ? '10px 0' : '9px 16px', justifyContent: collapsed ? 'center' : 'flex-start',
        margin: collapsed ? '2px 8px' : '2px 8px', borderRadius: 8, cursor: 'pointer', transition: T.transition,
        background: active ? T.p500 + '18' : hov ? T.surfaceHover : 'transparent',
        color: active ? T.p400 : hov ? T.text : T.textSec, position: 'relative',
      }}>
      {active && <div style={{ position: 'absolute', left: collapsed ? '50%' : 0, bottom: collapsed ? -2 : '50%', width: collapsed ? 20 : 3, height: collapsed ? 3 : 20, transform: collapsed ? 'translateX(-50%)' : 'translateY(50%)', background: T.p500, borderRadius: 2 }} />}
      <Icon name={item.icon} size={18} />
      {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, whiteSpace: 'nowrap' }}>{item.label}</span>}
    </div>
  );
};

/* ── Mobile Top Bar ── */
const MobileTopBar = ({ onOpenMenu, onOpenCmdK, user }) => (
  <div style={{
    height: 56, flexShrink: 0, background: T.bgAlt, borderBottom: `1px solid ${T.border}`,
    display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
    paddingTop: 'env(safe-area-inset-top)', boxSizing: 'content-box',
    position: 'sticky', top: 0, zIndex: 50,
  }}>
    <button onClick={onOpenMenu} aria-label="菜单" style={{ background: 'none', border: 'none', color: T.text, cursor: 'pointer', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg, ${T.p600}, ${T.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>PM</div>
      <span style={{ fontSize: 15, fontWeight: 800, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>AI PM 修炼场</span>
    </div>
    <button onClick={onOpenCmdK} aria-label="搜索" style={{ background: 'none', border: 'none', color: T.textSec, cursor: 'pointer', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name="search" size={20} />
    </button>
  </div>
);

/* ── Settings Modal (v2: + Memory + Data) ── */
const SettingsModal = ({ open, onClose, user }) => {
  const [tab, setTab] = React.useState('api');
  const [apiKey, setApiKey] = React.useState(() => localStorage.getItem(`user_${user}_apikey`) || '');
  const [saved, setSaved] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState('');
  const [strategy, setStrategyS] = React.useState(() => MemoryManager.getStrategy(user));
  const toast = useToast();

  const handleSave = () => {
    localStorage.setItem(`user_${user}_apikey`, apiKey.trim());
    setSaved(true); toast('设置已保存', 'success');
    setTimeout(() => { setSaved(false); onClose(); }, 600);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) { toast('请先填写 API Key', 'warning'); return; }
    setTesting(true); setTestResult('');
    try {
      const result = await callDeepSeekSync(apiKey.trim(), [{ role: 'user', content: '回复"连接成功"' }]);
      setTestResult('✅ ' + result.slice(0, 50));
      toast('API Key 验证成功', 'success');
    } catch (err) {
      setTestResult('❌ ' + err.message);
      toast('验证失败', 'error');
    }
    setTesting(false);
  };

  const handleExport = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`user_${user}_`) || key === 'pm_users') {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `PM修炼场_备份_${user}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast('数据已导出', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        let count = 0;
        Object.entries(data).forEach(([k, v]) => {
          if (typeof v === 'string') { localStorage.setItem(k, v); count++; }
        });
        toast(`已导入 ${count} 项数据，刷新生效`, 'success');
        setTimeout(() => location.reload(), 800);
      } catch (err) { toast('导入失败: 文件格式错误', 'error'); }
    };
    reader.readAsText(file);
  };

  const handleClearMemory = () => {
    if (!confirm('确认清除所有会话记忆和用户画像？此操作不可恢复。')) return;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(`user_${user}_session_`) || k.startsWith(`user_${user}_sessions_index`) ||
          k === `user_${user}_profile` || k === `user_${user}_token_log`) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    toast(`已清除 ${keys.length} 项记忆数据`, 'success');
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="设置" width={520}>
      <TabBar tabs={[
        { key: 'api', label: 'API Key' },
        { key: 'memory', label: '记忆策略' },
        { key: 'data', label: '数据管理' },
      ]} active={tab} onChange={setTab} style={{ marginBottom: 20 }} />

      {tab === 'api' && (
        <>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>DeepSeek API Key</h4>
          <Input value={apiKey} onChange={setApiKey} placeholder="sk-..." icon="key" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.6, marginBottom: 12 }}>
            在 <a href="https://platform.deepseek.com/" target="_blank" style={{ color: T.p400 }}>DeepSeek 开放平台</a> 获取。Key 仅存储在本地浏览器。
          </p>
          {testResult && <div style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, background: T.surface, marginBottom: 12, color: testResult.startsWith('✅') ? T.success : T.error }}>{testResult}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="ghost" onClick={handleTest} disabled={testing}>{testing ? '测试中...' : '测试连接'}</Button>
            <Button variant="secondary" onClick={onClose}>取消</Button>
            <Button onClick={handleSave} icon={saved ? 'check' : 'key'}>{saved ? '已保存' : '保存'}</Button>
          </div>
        </>
      )}

      {tab === 'memory' && (
        <>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>分层记忆策略</h4>
          <p style={{ fontSize: 11, color: T.muted, marginBottom: 14, lineHeight: 1.6 }}>
            控制 AI 对话中包含多少历史上下文。策略越完整，AI 越懂你，但 Token 消耗越高。
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {Object.entries(MEMORY_STRATEGIES).map(([key, s]) => (
              <button key={key} onClick={() => { setStrategyS(key); MemoryManager.setStrategy(user, key); toast('已切换策略', 'success'); }} style={{
                padding: 14, borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                background: strategy === key ? T.p500 + '20' : T.surface,
                border: `1px solid ${strategy === key ? T.p500 + '60' : T.border}`,
                color: T.text,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: T.textSec }}>{s.desc} · 保留最近 {s.recent} 轮{s.useSummary ? ' + 自动摘要' : ''}</div>
              </button>
            ))}
          </div>
          <div style={{ background: T.success + '10', padding: 12, borderRadius: 8, fontSize: 11, color: T.success, border: `1px solid ${T.success}30` }}>
            💡 提示：分层记忆系统让长对话不再爆 Token，平均可节省 60-90% 的成本。
          </div>
        </>
      )}

      {tab === 'data' && (
        <>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>数据管理</h4>
          <div style={{ marginBottom: 12 }}>
            <Button variant="secondary" icon="download" onClick={handleExport} style={{ width: '100%', justifyContent: 'center' }}>
              📥 导出所有数据（备份）
            </Button>
            <p style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>导出全部学习数据为 JSON 文件，可用于跨设备迁移。</p>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block' }}>
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                padding: '9px 20px', background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: T.radiusSm, color: T.text, cursor: 'pointer', fontSize: 14, fontWeight: 600,
              }}>
                <Icon name="copy" size={16} /> 📤 导入数据（恢复）
              </span>
            </label>
            <p style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>导入备份的 JSON 文件，会覆盖当前数据。</p>
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 16, paddingTop: 16 }}>
            <Button variant="danger" onClick={handleClearMemory} style={{ width: '100%', justifyContent: 'center' }}>
              🗑 清除所有会话记忆
            </Button>
            <p style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>会清除：用户画像、会话历史、Token 日志。其他数据保留。</p>
          </div>
        </>
      )}
    </Modal>
  );
};

/* ── Root App ── */
const App = () => {
  const [user, setUser] = React.useState(() => sessionStorage.getItem('currentUser'));
  const [page, setPage] = React.useState('home');
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [cmdKOpen, setCmdKOpen] = React.useState(false);
  const [pageKey, setPageKey] = React.useState(0);
  const isMobile = useIsMobile();

  const navigate = p => { setPage(p); setPageKey(k => k + 1); setDrawerOpen(false); };

  const handleLogin = username => {
    sessionStorage.setItem('currentUser', username);
    setUser(username);
    Tracker.track(username, '登录系统');
    const achs = JSON.parse(localStorage.getItem(`user_${username}_achievements`) || '[]');
    if (!achs.includes('first_login')) {
      achs.push('first_login');
      localStorage.setItem(`user_${username}_achievements`, JSON.stringify(achs));
    }
  };

  const handleLogout = () => {
    Tracker.track(user, '退出登录');
    sessionStorage.removeItem('currentUser');
    setUser(null); setPage('home');
  };

  React.useEffect(() => {
    window.__openSettings = () => setSettingsOpen(true);
    return () => { delete window.__openSettings; };
  }, []);

  // Cmd+K shortcut listener
  React.useEffect(() => {
    if (!user) return;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdKOpen(o => !o);
      }
      if (e.key === 'Escape' && cmdKOpen) setCmdKOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [user, cmdKOpen]);

  const stats = React.useMemo(() => user ? Tracker.getStats(user) : {}, [user, page, pageKey]);

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage user={user} stats={stats} onNavigate={navigate} />;
      case 'knowledge': return <KnowledgePage user={user} />;
      case 'market': case 'competitor': case 'prd':
        return <ToolPage key={page} toolKey={page} user={user} />;
      case 'dictionary': return <DictionaryPage user={user} />;
      case 'interview': return <InterviewPage user={user} onNavToReport={() => navigate('report')} />;
      case 'daily': return <DailyPage user={user} onShowHistory={() => navigate('daily-history')} />;
      case 'daily-history': return <DailyHistoryPage user={user} onBackToDaily={() => navigate('daily')} />;
      case 'dashboard': return <DashboardPage user={user} onNavigate={navigate} />;
      case 'report': return <ReportPage user={user} onNavigate={navigate} />;
      default: return <HomePage user={user} stats={stats} onNavigate={navigate} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', width: '100vw', background: T.bg, position: 'relative', overflow: 'hidden' }}>
      {isMobile && <MobileTopBar onOpenMenu={() => setDrawerOpen(true)} onOpenCmdK={() => setCmdKOpen(true)} user={user} />}
      {isMobile && drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)', zIndex: 80 }} className="anim-fade-in" />
      )}
      <Sidebar active={page} onNavigate={navigate} collapsed={isMobile ? false : collapsed} onToggle={() => setCollapsed(c => !c)}
        user={user} onLogout={handleLogout}
        onOpenSettings={() => { setSettingsOpen(true); setDrawerOpen(false); }}
        onOpenCmdK={() => { setCmdKOpen(true); setDrawerOpen(false); }}
        isMobile={isMobile} mobileOpen={drawerOpen} onCloseMobile={() => setDrawerOpen(false)} />
      <main key={pageKey} style={{ flex: 1, overflow: 'hidden', position: 'relative', minWidth: 0, minHeight: 0 }}>{renderPage()}</main>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} />
      <CmdKPalette open={cmdKOpen} onClose={() => setCmdKOpen(false)} onNavigate={navigate} user={user} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ToastProvider><App /></ToastProvider>);
