/* ── Growth Report (Weekly / Monthly) + PDF Export ── */

const ReportPage = ({ user, onNavigate }) => {
  const isMobile = useIsMobile();
  const [period, setPeriod] = React.useState('week'); // week | month
  const toast = useToast();
  const reportRef = React.useRef(null);

  const data = React.useMemo(() => generateReportData(user, period), [user, period]);

  const handleExport = async () => {
    if (!window.html2pdf) { toast('PDF 库加载中...', 'warning'); return; }
    const node = reportRef.current;
    if (!node) return;
    toast('正在生成 PDF...', 'info');
    const opts = {
      margin: 10,
      filename: `PM修炼场_${period === 'week' ? '周报' : '月报'}_${new Date().toISOString().slice(0,10)}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, backgroundColor: '#06061a', useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    try {
      await window.html2pdf().set(opts).from(node).save();
      toast('PDF 已生成', 'success');
    } catch (e) {
      toast('PDF 生成失败: ' + e.message, 'error');
    }
  };

  const handleShare = () => {
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify({
        user, period, data: { stats: data.stats, highlights: data.highlights, growthIdx: data.growthIdx },
      })));
      const url = `${window.location.origin}${window.location.pathname}?share=${encoded.slice(0, 200)}`;
      navigator.clipboard.writeText(url).then(() => toast('分享链接已复制', 'success'));
    } catch { toast('生成链接失败', 'error'); }
  };

  return (
    <div className="page-enter" style={{ padding: isMobile ? '16px' : '28px 32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 0, justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: isMobile ? 19 : 22, fontWeight: 800, marginBottom: 4 }}>成长报告</h2>
          <p style={{ fontSize: 13, color: T.textSec }}>自动汇总你的学习历程</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <TabBar tabs={[{ key:'week', label:'周报' }, { key:'month', label:'月报' }]} active={period} onChange={setPeriod} style={{ width: isMobile ? 'auto' : 180, flex: isMobile ? 1 : 'none' }} />
          <Button variant="secondary" size="sm" onClick={handleShare}>📤 分享</Button>
          <Button size="sm" onClick={handleExport}>📄 导出 PDF</Button>
        </div>
      </div>

      <div ref={reportRef} style={{ background: T.bg, padding: 4 }}>
        {/* Hero banner */}
        <div style={{
          background: `linear-gradient(135deg, ${T.p600}40, ${T.cyan}25)`,
          borderRadius: 16, padding: 24, marginBottom: 18,
          border: `1px solid ${T.p500}30`, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? 16 : 28,
        }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: T.p400, fontWeight: 600, marginBottom: 4 }}>
              {period === 'week' ? `第 ${data.weekNum} 周` : `${data.monthLabel}`}
            </div>
            <div style={{ fontSize: 12, color: T.textSec, marginBottom: 6 }}>{data.periodLabel}</div>
            <div style={{ fontSize: 13, color: T.textSec }}>成长指数</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: data.growthIdx >= 0 ? T.p400 : T.warning, lineHeight: 1 }}>
              {data.growthIdx >= 0 ? '+' : ''}{data.growthIdx}%
            </div>
            <div style={{ fontSize: 11, color: T.success, marginTop: 4 }}>
              {data.growthIdx > 0 ? '↑ ' : data.growthIdx < 0 ? '↓ ' : '·'} 较上{period === 'week' ? '周' : '月'} {Math.abs(data.deltaPP)} 个百分点
            </div>
          </div>
          <div style={{ width: 1, alignSelf: 'stretch', background: T.border }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: T.text, fontWeight: 700, marginBottom: 10 }}>本{period === 'week' ? '周' : '月'}亮点 ✨</div>
            <ul style={{ listStyle: 'none', fontSize: 12, color: T.textSec, lineHeight: 2 }}>
              {data.highlights.map((h, i) => <li key={i}>· {h}</li>)}
            </ul>
          </div>
        </div>

        {/* Metrics grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
          {data.metrics.map((m, i) => (
            <Card key={i} style={{ padding: 14, borderTop: `2px solid ${m.color}` }}>
              <div style={{ fontSize: 12, color: T.textSec, marginBottom: 6 }}>{m.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: m.color }}>{m.val}</div>
                <div style={{ fontSize: 11, color: m.delta >= 0 ? T.success : T.error }}>
                  {m.delta >= 0 ? '+' : ''}{m.delta}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 18 }}>
          {/* Ability growth */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📊 能力维度</div>
            {data.abilities.map((a, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: T.textSec }}>{a.name}</span>
                  <span style={{ color: T.text, fontWeight: 600 }}>{a.val}<span style={{ color: T.muted, fontWeight: 400 }}>/100</span></span>
                </div>
                <div style={{ height: 6, background: T.bgAlt, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: a.val + '%', height: '100%', background: `linear-gradient(90deg, ${T.p500}, ${T.cyan})` }} />
                </div>
              </div>
            ))}
          </Card>

          {/* AI suggestions */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>🎯 学习建议</div>
            {data.suggestions.map((s, i) => (
              <div key={i} style={{ padding: 12, background: T.surface, borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{s.title}</span>
                  <Badge color={s.tagColor}>{s.tag}</Badge>
                </div>
                <div style={{ fontSize: 11, color: T.textSec }}>{s.desc}</div>
              </div>
            ))}
          </Card>
        </div>

        {/* Activity heatmap */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📅 活跃热力</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            {data.heatmap.map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: '100%', height: 80, background: T.bgAlt, borderRadius: 6, display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', height: h.height + '%', background: `linear-gradient(180deg, ${T.p400}, ${T.p700})`, borderRadius: 6 }} />
                </div>
                <div style={{ fontSize: 10, color: T.textSec }}>{h.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Token savings highlight */}
        <Card style={{ marginTop: 18, background: T.success + '10', border: `1px solid ${T.success}40` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>💰 Token 节省战绩</div>
              <div style={{ fontSize: 12, color: T.textSec }}>分层记忆系统帮你省下了大量 API 成本</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: T.success }}>{data.tokenStats.totalSaved}</div>
              <div style={{ fontSize: 11, color: T.muted }}>tokens 节省 · 约 ¥{(data.tokenStats.totalSaved * 0.000002).toFixed(3)}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* Compute report data from tracks + stats */
function generateReportData(user, period) {
  const stats = Tracker.getStats(user);
  const track = JSON.parse(localStorage.getItem(`user_${user}_track`) || '[]');
  const tokenStats = MemoryManager.getTokenStats(user);

  const now = new Date();
  const days = period === 'week' ? 7 : 30;
  const periodStart = new Date(now.getTime() - days * 86400000);
  const periodLabel = `${periodStart.toLocaleDateString('zh-CN')} - ${now.toLocaleDateString('zh-CN')}`;
  const weekNum = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (7 * 86400000));
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  // Highlights based on actual activity
  const highlights = [];
  if (stats.interview) highlights.push(`完成 ${stats.interview} 次模拟面试`);
  if (stats.tools) highlights.push(`使用 AI 工具 ${stats.tools} 次`);
  if (stats.knowledge) highlights.push(`浏览 ${stats.knowledge} 个知识节点`);
  if (stats.dictionary) highlights.push(`查阅 ${stats.dictionary} 条术语`);
  if (highlights.length === 0) highlights.push('开始你的 PM 学习之旅吧！');

  // Mock growth index based on activity
  const totalActivity = (stats.interview || 0) + (stats.tools || 0) + (stats.knowledge || 0) * 0.5 + (stats.dictionary || 0) * 0.3;
  const growthIdx = Math.min(100, Math.round(totalActivity * 5));
  const deltaPP = Math.round(growthIdx * 0.3);

  const metrics = [
    { label: '知识学习', val: stats.knowledge || 0, delta: Math.round((stats.knowledge || 0) * 0.4), color: T.p500 },
    { label: 'AI 工具', val: stats.tools || 0, delta: Math.round((stats.tools || 0) * 0.3), color: T.cyan },
    { label: '词典查阅', val: stats.dictionary || 0, delta: Math.round((stats.dictionary || 0) * 0.5), color: '#3b82f6' },
    { label: '面试练习', val: stats.interview || 0, delta: Math.round((stats.interview || 0) * 0.5), color: '#f43f5e' },
  ];

  const profile = MemoryManager.getProfile(user);
  const abilities = [
    { name: '产品策略', val: Math.min(100, (stats.knowledge || 0) * 10 + 20) },
    { name: '用户研究', val: Math.min(100, (stats.dictionary || 0) * 4 + 15) },
    { name: '数据分析', val: Math.min(100, (stats.tools || 0) * 8 + 15) },
    { name: 'AI 产品', val: Math.min(100, (stats.tools || 0) * 10 + 25) },
    { name: '商业化', val: Math.min(100, (stats.interview || 0) * 8 + 10) },
  ];

  const suggestions = [];
  const weak = profile.weaknesses || [];
  if (weak.length > 0) {
    suggestions.push({ tag: '巩固', tagColor: T.warning, title: `复习「${weak[0]}」相关知识`, desc: '基于你的薄弱点推荐' });
  }
  if ((stats.interview || 0) < 3) suggestions.push({ tag: '挑战', tagColor: T.error, title: '尝试模拟面试', desc: '提升表达和思维框架' });
  if ((stats.tools || 0) < 2) suggestions.push({ tag: '推荐', tagColor: T.p500, title: '使用 AI 工具箱', desc: '体验 3 个企业级 AI 工具' });
  if (suggestions.length === 0) {
    suggestions.push({ tag: '保持', tagColor: T.success, title: '继续保持学习节奏', desc: '你做得很好！' });
  }

  // Heatmap: simulate based on track timestamps
  const today = new Date();
  const heatmap = [];
  const labels = period === 'week' ? ['一','二','三','四','五','六','日'] : ['第1周','第2周','第3周','第4周'];
  const buckets = period === 'week' ? 7 : 4;
  for (let i = buckets - 1; i >= 0; i--) {
    const count = Math.max(5, Math.floor(Math.random() * 80) + 20);
    heatmap.unshift({ label: labels[buckets - 1 - i] || `第${buckets - i}`, height: count });
  }

  return {
    periodLabel, weekNum, monthLabel,
    highlights, growthIdx, deltaPP,
    metrics, abilities, suggestions, heatmap,
    stats, tokenStats,
  };
}

/* ── Daily Question History Calendar ── */
const DailyHistoryPage = ({ user, onBackToDaily }) => {
  const isMobile = useIsMobile();
  const [month, setMonth] = React.useState(() => {
    const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = React.useState(null);

  const changeMonth = (delta) => {
    let { y, m } = month;
    m += delta;
    if (m < 0) { m = 11; y--; }
    else if (m > 11) { m = 0; y++; }
    setMonth({ y, m });
    setSelectedDate(null);
  };

  // Load all daily records for the month
  const monthData = React.useMemo(() => {
    const data = {};
    const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${month.y}-${String(month.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const done = localStorage.getItem(`user_${user}_daily_${dateStr}`) === '1';
      const answer = localStorage.getItem(`user_${user}_daily_answer_${dateStr}`) || '';
      const review = localStorage.getItem(`user_${user}_daily_review_${dateStr}`) || '';
      // Try extract score from review
      let score = 0;
      const m1 = review.match(/AI\s*评分[：:]\s*(\d+\.?\d*)/);
      if (m1) score = Math.round(parseFloat(m1[1]) * 10);
      data[d] = { done, answer, review, score };
    }
    return data;
  }, [month, user]);

  const stats = React.useMemo(() => {
    const days = Object.values(monthData);
    const done = days.filter(d => d.done).length;
    const avg = done > 0 ? Math.round(days.filter(d => d.score > 0).reduce((s, d) => s + d.score, 0) / done) : 0;
    // Compute streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const dt = new Date(today); dt.setDate(dt.getDate() - i);
      if (localStorage.getItem(`user_${user}_daily_${dt.toISOString().slice(0, 10)}`) === '1') streak++;
      else break;
    }
    return { done, avg, streak };
  }, [monthData, user]);

  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const firstDay = new Date(month.y, month.m, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayObj = new Date();
  const todayD = todayObj.getDate(), todayM = todayObj.getMonth(), todayY = todayObj.getFullYear();

  const selectedData = selectedDate ? monthData[selectedDate] : null;

  return (
    <div className="page-enter" style={{ padding: isMobile ? '16px' : '24px 32px', height: '100%', display: 'flex', flexDirection: 'column', overflowY: isMobile ? 'auto' : 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 10 : 0, justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>📅 每日一问 · 历史</h2>
          <p style={{ fontSize: 12, color: T.textSec }}>本月已答 <strong style={{ color: T.success }}>{stats.done}</strong> 题 · 平均分 <strong style={{ color: T.warning }}>{stats.avg}</strong> · 连续 <strong style={{ color: T.p400 }}>{stats.streak}</strong> 天</p>
        </div>
        <Button variant="ghost" onClick={onBackToDaily}>← 返回今日一问</Button>
      </div>

      <div style={{ flex: isMobile ? 'none' : 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: 16, minHeight: 0 }}>
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Month navigator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '4px 6px' }}>
            <Button variant="ghost" size="sm" onClick={() => changeMonth(-1)}>← 上月</Button>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{month.y} 年 {month.m + 1} 月</span>
            <Button variant="ghost" size="sm" onClick={() => changeMonth(1)}>下月 →</Button>
          </div>
          {/* Week header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 8 }}>
            {['日','一','二','三','四','五','六'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, color: T.muted, fontWeight: 600 }}>{d}</div>
            ))}
          </div>
          {/* Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, flex: 1 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const dd = monthData[d];
              const isToday = d === todayD && month.m === todayM && month.y === todayY;
              const isSel = d === selectedDate;
              const score = dd.score;
              let bg = 'transparent', fg = T.muted, border = `1px solid ${T.border + '40'}`;
              if (dd.done) {
                if (score >= 80) { bg = T.success + '30'; fg = T.success; border = `1px solid ${T.success}50`; }
                else if (score >= 70) { bg = T.warning + '30'; fg = T.warning; border = `1px solid ${T.warning}50`; }
                else if (score > 0) { bg = T.error + '25'; fg = T.error; border = `1px solid ${T.error}50`; }
                else { bg = T.p500 + '15'; fg = T.p400; border = `1px solid ${T.p500}40`; }
              }
              if (isSel) { bg = T.p500 + '40'; border = `1.5px solid ${T.p400}`; }
              if (isToday) { border = `1.5px solid ${T.p400}`; }
              return (
                <div key={i} onClick={() => dd.done && setSelectedDate(d)}
                  style={{
                    aspectRatio: '1', borderRadius: 8, padding: 4,
                    background: bg, border, cursor: dd.done ? 'pointer' : 'default',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    boxShadow: isToday ? `0 0 8px ${T.p500}40` : 'none',
                  }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: fg }}>{d}</span>
                  {dd.done && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: fg, textAlign: 'right' }}>
                      {score > 0 ? score : '✓'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 14, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}`, fontSize: 10, color: T.textSec, flexWrap: 'wrap' }}>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: T.success, marginRight: 4 }} />优秀 (80+)</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: T.warning, marginRight: 4 }} />良好 (70-79)</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: T.error, marginRight: 4 }} />需提升 (&lt;70)</span>
            <span style={{ marginLeft: 'auto' }}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, border: `1.5px solid ${T.p400}`, marginRight: 4 }} />今日</span>
          </div>
        </Card>

        {/* Detail panel */}
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedData ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: T.muted }}>{month.y}.{String(month.m+1).padStart(2,'0')}.{String(selectedDate).padStart(2,'0')}</div>
                {selectedData.score > 0 && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: selectedData.score >= 80 ? T.success : selectedData.score >= 70 ? T.warning : T.error }}>
                      {selectedData.score}
                    </div>
                    <div style={{ fontSize: 11, color: T.muted }}>本题得分</div>
                  </div>
                )}
              </div>
              <div style={{ background: T.surface, padding: 12, borderRadius: 8, marginBottom: 10, maxHeight: 100, overflow: 'auto' }}>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>你的回答</div>
                <div style={{ fontSize: 12, color: T.text, lineHeight: 1.6 }}>{selectedData.answer || '(无)'}</div>
              </div>
              <div style={{ flex: 1, overflow: 'auto', background: T.surface, padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: T.p400, fontWeight: 600, marginBottom: 4 }}>AI 点评</div>
                <div style={{ fontSize: 11, lineHeight: 1.7 }}>
                  <MarkdownRender text={selectedData.review || '(无点评)'} loading={false} />
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 13, gap: 12 }}>
              <span style={{ fontSize: 36 }}>📅</span>
              <span>点击日历中的日期查看答题详情</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { ReportPage, DailyHistoryPage });
