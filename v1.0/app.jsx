/* ── Main App: Sidebar + Routing ── */

const NAV_ITEMS = [
  { key:'home', label:'首页', icon:'home', group:'main' },
  { key:'knowledge', label:'知识图谱', icon:'knowledge', group:'main' },
  { type:'divider', label:'AI 工具箱', group:'tools' },
  { key:'market', label:'市场调研', icon:'search', group:'tools' },
  { key:'competitor', label:'竞品分析', icon:'chart', group:'tools' },
  { key:'prd', label:'PRD 生成', icon:'book', group:'tools' },
  { type:'divider', label:'学习中心', group:'learn' },
  { key:'dictionary', label:'名词百科', icon:'book', group:'learn' },
  { key:'interview', label:'模拟面试', icon:'interview', group:'learn' },
  { key:'daily', label:'每日一问', icon:'daily', group:'learn' },
  { type:'divider', label:'个人', group:'personal' },
  { key:'dashboard', label:'成长仪表盘', icon:'dashboard', group:'personal' },
];

const Sidebar = ({ active, onNavigate, collapsed, onToggle, user, onLogout, onOpenSettings }) => (
  <div style={{
    width: collapsed ? 64 : 220, height: '100%', background: T.bgAlt,
    borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column',
    transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)', flexShrink: 0, overflow: 'hidden',
  }}>
    <div style={{ padding: collapsed ? '20px 12px' : '20px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${T.p600}, ${T.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', boxShadow: T.glowSm }}>PM</div>
      {!collapsed && <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}><div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>AI PM 修炼场</div><div style={{ fontSize: 10, color: T.muted }}>v1.0</div></div>}
    </div>
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
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
    <button onClick={onToggle} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'absolute', top: 28, right: -12, zIndex: 20, color: T.textSec, boxShadow: T.glowSm }}>
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

/* ── Settings Modal ── */
const SettingsModal = ({ open, onClose, user }) => {
  const [apiKey, setApiKey] = React.useState(() => localStorage.getItem(`user_${user}_apikey`) || '');
  const [saved, setSaved] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState('');
  const toast = useToast();

  const handleSave = () => {
    localStorage.setItem(`user_${user}_apikey`, apiKey.trim());
    setSaved(true); toast('API Key 已保存', 'success');
    setTimeout(() => { setSaved(false); onClose(); }, 600);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) { toast('请先填写 API Key', 'warning'); return; }
    setTesting(true); setTestResult('');
    try {
      const result = await callDeepSeekSync(apiKey.trim(), [
        { role: 'user', content: '回复"连接成功"两个字即可' },
      ]);
      setTestResult('✅ ' + result.slice(0, 50));
      toast('API Key 验证成功', 'success');
    } catch (err) {
      setTestResult('❌ ' + err.message);
      toast('API Key 验证失败', 'error');
    }
    setTesting(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="设置">
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: T.text }}>DeepSeek API Key</h4>
        <Input label="" value={apiKey} onChange={setApiKey} placeholder="sk-..." icon="key" style={{ marginBottom: 8 }} />
        <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.6, marginBottom: 12 }}>
          在 <a href="https://platform.deepseek.com/" target="_blank" style={{ color: T.p400 }}>DeepSeek 开放平台</a> 获取 API Key。Key 仅存储在本地浏览器中，不会上传到任何服务器。
        </p>
        {testResult && <div style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, background: T.surface, marginBottom: 12, color: testResult.startsWith('✅') ? T.success : T.error }}>{testResult}</div>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Button variant="ghost" onClick={handleTest} disabled={testing}>{testing ? '测试中...' : '测试连接'}</Button>
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={handleSave} icon={saved ? 'check' : 'key'}>{saved ? '已保存' : '保存'}</Button>
      </div>
    </Modal>
  );
};

/* ── Root App ── */
const App = () => {
  const [user, setUser] = React.useState(() => sessionStorage.getItem('currentUser'));
  const [page, setPage] = React.useState('home');
  const [collapsed, setCollapsed] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [pageKey, setPageKey] = React.useState(0);

  const navigate = p => { setPage(p); setPageKey(k => k + 1); };

  const handleLogin = username => {
    sessionStorage.setItem('currentUser', username);
    setUser(username);
    Tracker.track(username, '登录系统');
    // Auto-unlock first achievement
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

  const stats = React.useMemo(() => {
    if (!user) return {};
    return Tracker.getStats(user);
  }, [user, page, pageKey]);

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage user={user} stats={stats} onNavigate={navigate} />;
      case 'knowledge': return <KnowledgePage user={user} />;
      case 'market': case 'competitor': case 'prd':
        return <ToolPage key={page} toolKey={page} user={user} />;
      case 'dictionary': return <DictionaryPage user={user} />;
      case 'interview': return <InterviewPage user={user} />;
      case 'daily': return <DailyPage user={user} />;
      case 'dashboard': return <DashboardPage user={user} />;
      default: return <HomePage user={user} stats={stats} onNavigate={navigate} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: T.bg, position: 'relative' }}>
      <Sidebar active={page} onNavigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} user={user} onLogout={handleLogout} onOpenSettings={() => setSettingsOpen(true)} />
      <main key={pageKey} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{renderPage()}</main>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ToastProvider><App /></ToastProvider>);
