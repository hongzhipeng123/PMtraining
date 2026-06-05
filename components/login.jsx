/* ── Login / Register Screen ── */
const LoginScreen = ({ onLogin }) => {
  const [tab, setTab] = React.useState('login');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPwd, setConfirmPwd] = React.useState('');
  const [apiKey, setApiKey] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [success, setSuccess] = React.useState('');

  const switchTab = t => { setTab(t); setErrors({}); setSuccess(''); };

  const handleRegister = () => {
    const e = {};
    if (!username.trim()) e.username = '请输入用户名';
    if (!password) e.password = '请输入密码';
    else if (password.length < 4) e.password = '密码至少4位';
    if (password !== confirmPwd) e.confirm = '两次密码不一致';
    if (Object.keys(e).length) { setErrors(e); return; }
    const users = JSON.parse(localStorage.getItem('pm_users') || '{}');
    if (users[username]) { setErrors({ username: '用户名已存在' }); return; }
    users[username] = btoa(password);
    localStorage.setItem('pm_users', JSON.stringify(users));
    if (apiKey.trim()) localStorage.setItem(`user_${username}_apikey`, apiKey.trim());
    localStorage.setItem(`user_${username}_stats`, JSON.stringify({ knowledge: 0, tools: 0, dictionary: 0, interview: 0 }));
    localStorage.setItem(`user_${username}_track`, '[]');
    localStorage.setItem(`user_${username}_achievements`, '[]');
    localStorage.setItem(`user_${username}_vocab_saved`, '[]');
    setSuccess('注册成功！');
    setTimeout(() => onLogin(username), 600);
  };

  const handleLogin = () => {
    const e = {};
    if (!username.trim()) e.username = '请输入用户名';
    if (!password) e.password = '请输入密码';
    if (Object.keys(e).length) { setErrors(e); return; }
    const users = JSON.parse(localStorage.getItem('pm_users') || '{}');
    if (!users[username] || users[username] !== btoa(password)) {
      setErrors({ password: '用户名或密码错误' }); return;
    }
    onLogin(username);
  };

  const handleKeyDown = e => { if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleRegister(); };

  const isMobile = useIsMobile();

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #06061a 0%, #0c0c28 40%, #12082e 70%, #06061a 100%)',
      overflow: 'hidden',
    }}>
      {/* Animated orbs */}
      <div className="login-orb" style={{ width: 400, height: 400, top: '-10%', left: '-5%', background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', animationDuration: '15s' }} />
      <div className="login-orb" style={{ width: 300, height: 300, bottom: '-5%', right: '-5%', background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', animationDuration: '18s', animationDelay: '-5s' }} />
      <div className="login-orb" style={{ width: 250, height: 250, top: '30%', right: '15%', background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', animationDuration: '20s', animationDelay: '-10s' }} />
      <div className="login-orb" style={{ width: 200, height: 200, bottom: '20%', left: '10%', background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)', animationDuration: '14s', animationDelay: '-3s' }} />
      <div className="login-orb" style={{ width: 350, height: 350, top: '60%', left: '50%', background: 'radial-gradient(circle, #6d28d9 0%, transparent 70%)', animationDuration: '22s', animationDelay: '-8s' }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: `linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Login Card */}
      <div style={{
        width: 420, maxWidth: '90vw', background: 'rgba(12,12,40,0.8)', backdropFilter: 'blur(24px)',
        borderRadius: 20, border: '1px solid rgba(139,92,246,0.2)',
        padding: isMobile ? '32px 22px' : '40px 36px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.1)',
        position: 'relative', zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.p600}, ${T.cyan})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            boxShadow: T.glow, fontSize: 24, fontWeight: 800, color: '#fff',
          }}>PM</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, letterSpacing: 1 }}>AI PM 修炼场</h1>
          <p style={{ fontSize: 13, color: T.muted, marginTop: 6 }}>系统化 PM 成长平台</p>
        </div>

        {/* Tabs */}
        <TabBar tabs={[{ key: 'login', label: '登录' }, { key: 'register', label: '注册' }]} active={tab} onChange={switchTab}
          style={{ marginBottom: 24 }} />

        {/* Success message */}
        {success && (
          <div style={{
            background: T.success + '15', border: `1px solid ${T.success}40`, borderRadius: T.radiusSm,
            padding: '10px 14px', marginBottom: 16, color: T.success, fontSize: 13, textAlign: 'center',
          }}>{success}</div>
        )}

        <div onKeyDown={handleKeyDown}>
          <Input label="用户名" value={username} onChange={setUsername} placeholder="请输入用户名" icon="knowledge" error={errors.username} />
          <Input label="密码" type="password" value={password} onChange={setPassword} placeholder="请输入密码" icon="key" error={errors.password} />
          {tab === 'register' && (
            <>
              <Input label="确认密码" type="password" value={confirmPwd} onChange={setConfirmPwd} placeholder="再次输入密码" icon="key" error={errors.confirm} />
              <Input label="DeepSeek API Key（可选）" value={apiKey} onChange={setApiKey} placeholder="sk-..." icon="settings" />
              <p style={{ fontSize: 11, color: T.muted, marginTop: -8, marginBottom: 16 }}>
                可稍后在设置中配置，用于解锁 AI 功能
              </p>
            </>
          )}
        </div>

        <Button variant="primary" size="lg" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          onClick={tab === 'login' ? handleLogin : handleRegister}>
          {tab === 'login' ? '登录' : '注册'}
        </Button>

        <p style={{ textAlign: 'center', fontSize: 12, color: T.muted, marginTop: 20 }}>
          {tab === 'login' ? '没有账号？' : '已有账号？'}
          <span style={{ color: T.p400, cursor: 'pointer', fontWeight: 600 }}
            onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}>
            {tab === 'login' ? ' 立即注册' : ' 去登录'}
          </span>
        </p>
      </div>
    </div>
  );
};

Object.assign(window, { LoginScreen });
