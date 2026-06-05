/* ── Theme & Shared UI Components ── */
const T = {
  bg:'#06061a', bgAlt:'#0c0c28', surface:'#12123a', surfaceHover:'#1a1a50',
  card:'#16164a', border:'#2a2a6e', borderHover:'#3d3d8e',
  p300:'#c4b5fd', p400:'#a78bfa', p500:'#8b5cf6', p600:'#7c3aed', p700:'#6d28d9',
  cyan:'#06b6d4', cyanLight:'#22d3ee',
  text:'#e2e8f0', textSec:'#94a3b8', muted:'#64748b',
  success:'#10b981', warning:'#f59e0b', error:'#ef4444',
  radius:12, radiusSm:8, radiusLg:16,
  glow:'0 0 24px rgba(139,92,246,0.35)', glowSm:'0 0 12px rgba(139,92,246,0.25)',
  transition:'0.25s cubic-bezier(0.4,0,0.2,1)',
};

/* ── Responsive hooks ── */
const useMediaQuery = (query) => {
  const [matches, setMatches] = React.useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = e => setMatches(e.matches);
    setMatches(mql.matches);
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);
    return () => { if (mql.removeEventListener) mql.removeEventListener('change', handler); else mql.removeListener(handler); };
  }, [query]);
  return matches;
};
const useIsMobile = () => useMediaQuery('(max-width: 768px)');

/* ── SVG Icon paths ── */
const ICONS = {
  home: 'M3 12l9-8 9 8v9a1 1 0 01-1 1h-5v-5h-4v5H5a1 1 0 01-1-1v-9z',
  knowledge: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
  tools: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  book: 'M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14zm2.5-.5H20v-2H6.5a.5.5 0 000 1z',
  interview: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z',
  daily: 'M11 7h2v6h-2zm0 8h2v2h-2zm1-17C5.4 -2 0 4.4 0 12s5.4 14 12 14 12-5.4 12-12S18.6-2 12-2zm0 24c-5.5 0-10-4.5-10-10S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z',
  dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.61 3.61 0 0112 15.6z',
  logout: 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
  collapse: 'M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z',
  expand: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z',
  search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  starOutline: 'M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z',
  copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  send: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z',
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  key: 'M12.65 10A5.99 5.99 0 007 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 005.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
  trophy: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
  chart: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z',
};

const Icon = ({ name, size = 20, color, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color || 'currentColor'}
    style={{ flexShrink: 0, ...style }}>
    <path d={ICONS[name] || ''} />
  </svg>
);

/* ── Button ── */
const Button = ({ children, variant = 'primary', size = 'md', icon, disabled, onClick, style = {} }) => {
  const [hov, setHov] = React.useState(false);
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600, borderRadius: T.radiusSm, transition: T.transition, opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap', flexShrink: 0,
    fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14,
    padding: size === 'sm' ? '6px 14px' : size === 'lg' ? '12px 28px' : '9px 20px',
    ...style,
  };
  const variants = {
    primary: { background: hov ? T.p600 : T.p500, color: '#fff', boxShadow: hov ? T.glow : 'none' },
    secondary: { background: hov ? T.surfaceHover : T.surface, color: T.text, border: `1px solid ${hov ? T.borderHover : T.border}` },
    ghost: { background: hov ? 'rgba(139,92,246,0.1)' : 'transparent', color: hov ? T.p400 : T.textSec },
    danger: { background: hov ? '#dc2626' : T.error, color: '#fff' },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}>
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
};

/* ── Input ── */
const Input = ({ label, type = 'text', value, onChange, placeholder, icon, error, style = {} }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: T.textSec, fontWeight: 500 }}>{label}</label>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: T.surface, border: `1px solid ${error ? T.error : focused ? T.p500 : T.border}`,
        borderRadius: T.radiusSm, padding: '0 12px', transition: T.transition,
        boxShadow: focused ? T.glowSm : 'none',
      }}>
        {icon && <Icon name={icon} size={16} color={T.muted} />}
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none', color: T.text,
            padding: '10px 0', fontSize: 14, width: '100%',
          }} />
      </div>
      {error && <div style={{ fontSize: 12, color: T.error, marginTop: 4 }}>{error}</div>}
    </div>
  );
};

/* ── Card ── */
const Card = ({ children, hoverable, onClick, style = {}, className = '' }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <div className={className} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.card, borderRadius: T.radius, border: `1px solid ${hov && hoverable ? T.borderHover : T.border}`,
        padding: 20, transition: T.transition, cursor: hoverable ? 'pointer' : 'default',
        transform: hov && hoverable ? 'translateY(-2px)' : 'none',
        boxShadow: hov && hoverable ? T.glowSm : 'none', ...style,
      }}>
      {children}
    </div>
  );
};

/* ── Badge ── */
const Badge = ({ children, color = T.p500, style = {} }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 600, background: color + '22', color: color, whiteSpace: 'nowrap', ...style,
  }}>{children}</span>
);

/* ── Modal ── */
const Modal = ({ open, onClose, title, children, width = 440 }) => {
  const isMobile = useIsMobile();
  if (!open) return null;
  const mobileShell = {
    background: T.bgAlt, borderTopLeftRadius: T.radiusLg, borderTopRightRadius: T.radiusLg,
    borderTop: `1px solid ${T.border}`, width: '100%', maxWidth: '100%', maxHeight: '92vh',
    overflow: 'auto', padding: '24px 18px calc(24px + env(safe-area-inset-bottom))',
    boxShadow: '0 -12px 48px rgba(0,0,0,0.5)',
  };
  const desktopShell = {
    background: T.bgAlt, borderRadius: T.radiusLg, border: `1px solid ${T.border}`,
    width, maxWidth: '90vw', maxHeight: '80vh', overflow: 'auto', padding: 28,
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  };
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    }} className="anim-fade-in" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={isMobile ? mobileShell : desktopShell}
        className={isMobile ? 'anim-slide-up-sheet' : 'anim-fade-in-scale'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: 4,
          }}><Icon name="close" size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* ── Tab Bar ── */
const TabBar = ({ tabs, active, onChange, style = {} }) => (
  <div style={{ display: 'flex', gap: 2, background: T.surface, borderRadius: T.radiusSm, padding: 3, ...style }}>
    {tabs.map(tab => (
      <button key={tab.key} onClick={() => onChange(tab.key)} style={{
        flex: 1, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer',
        fontSize: 13, fontWeight: 600, transition: T.transition,
        background: active === tab.key ? T.p500 : 'transparent',
        color: active === tab.key ? '#fff' : T.textSec,
      }}>{tab.label}</button>
    ))}
  </div>
);

/* ── Loading Spinner ── */
const Spinner = ({ size = 20, color = T.p500 }) => (
  <div style={{
    width: size, height: size, border: `2px solid ${T.border}`, borderTopColor: color,
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  }} />
);

/* ── Toast system ── */
const ToastContext = React.createContext();
const useToast = () => React.useContext(ToastContext);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);
  const addToast = React.useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);
  const colors = { success: T.success, error: T.error, warning: T.warning, info: T.p500 };
  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-stack" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: T.card, border: `1px solid ${colors[t.type]}`, borderRadius: T.radiusSm,
            padding: '10px 18px', color: T.text, fontSize: 13, boxShadow: `0 0 16px ${colors[t.type]}33`,
            animation: 'slideInRight 0.3s ease-out both', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors[t.type] }} />
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/* ── Typewriter effect hook ── */
const useTypewriter = (text, speed = 15) => {
  const [displayed, setDisplayed] = React.useState('');
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    if (!text) { setDisplayed(''); setDone(false); return; }
    setDisplayed(''); setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i += 1 + Math.floor(Math.random() * 2);
      if (i >= text.length) { setDisplayed(text); setDone(true); clearInterval(iv); }
      else setDisplayed(text.slice(0, i));
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return [displayed, done];
};

/* ── Stat Counter animation ── */
const AnimatedNumber = ({ value, duration = 1200 }) => {
  const [current, setCurrent] = React.useState(0);
  React.useEffect(() => {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCurrent(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return current;
};

/* Export all */
Object.assign(window, {
  T, ICONS, Icon, Button, Input, Card, Badge, Modal, TabBar, Spinner,
  ToastContext, ToastProvider, useToast, useTypewriter, AnimatedNumber,
  useMediaQuery, useIsMobile,
});
