/* ── Improvement Direction UI Mockups ── */

const C = {
  bg: '#06061a', bgAlt: '#0c0c28', surface: '#12123a', card: '#16164a',
  border: '#2a2a6e', borderHover: '#3d3d8e',
  p400: '#a78bfa', p500: '#8b5cf6', p600: '#7c3aed',
  cyan: '#06b6d4', cyanLight: '#22d3ee', blue: '#3b82f6',
  text: '#e2e8f0', textSec: '#94a3b8', muted: '#64748b',
  success: '#10b981', warning: '#f59e0b', error: '#ef4444',
};

const baseStyle = {
  background: C.bg, color: C.text, width: '100%', height: '100%', fontSize: 13,
  padding: 0, overflow: 'hidden', position: 'relative',
};

/* ─── ① AI 对话记忆（分层记忆 + Token 节省）─── */
const MockAIMemory = () => (
  <div style={{ ...baseStyle, display: 'flex' }}>
    {/* History sidebar */}
    <div style={{ width: 240, background: C.bgAlt, borderRight: `1px solid ${C.border}`, padding: 14, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>面试历史</span>
        <button style={btnSmall(C.p500, '#fff', 11, 10)}>+ 新建</button>
      </div>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>今天</div>
      <SessionItem active title="AI产品PMF评估" date="14:32" tags={['AI产品']} score={87} />
      <div style={{ fontSize: 10, color: C.muted, margin: '10px 0 6px' }}>昨天</div>
      <SessionItem title="数据指标体系设计" date="20:15" tags={['数据']} score={72} />
      <SessionItem title="竞品分析方法" date="11:08" tags={['竞争']} score={91} />
      <div style={{ fontSize: 10, color: C.muted, margin: '10px 0 6px' }}>本周</div>
      <SessionItem title="冷启动策略" date="周一" tags={['增长']} score={65} />

      {/* User profile card */}
      <div style={{ marginTop: 'auto', padding: 12, background: `linear-gradient(135deg, ${C.p600}25, ${C.cyan}15)`, borderRadius: 10, border: `1px solid ${C.p500}40` }}>
        <div style={{ fontSize: 10, color: C.p400, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>🧬 你的 PM 画像</div>
        <div style={{ fontSize: 10, color: C.textSec, lineHeight: 1.7 }}>
          <div>📌 偏好：<span style={{ color: C.text }}>To B 产品</span></div>
          <div>💪 强项：<span style={{ color: C.success }}>用户研究</span></div>
          <div>⚠ 弱项：<span style={{ color: C.warning }}>数据指标设计</span></div>
        </div>
        <div style={{ fontSize: 9, color: C.muted, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
          基于 12 次对话提炼 · 仅 28 tokens
        </div>
      </div>
    </div>

    {/* Chat area */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar with memory indicator */}
      <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>AI产品PMF评估 · 第 8 轮</div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>分层记忆已加载 · 预计本轮消耗 380 tokens</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button style={btnSmall(C.surface, C.text, 11, 10)}>📊 记忆面板</button>
          <button style={btnSmall(C.surface, C.text, 11, 10)}>导出</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: 16, overflow: 'hidden', display: 'flex', gap: 12 }}>
        {/* Left: Conversation */}
        <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          {/* Memory loaded banner */}
          <div style={{ background: C.cyan + '10', border: `1px solid ${C.cyan}40`, borderRadius: 8, padding: 10, fontSize: 11, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🧠</span>
            <div style={{ flex: 1, color: C.textSec, lineHeight: 1.5 }}>
              <span style={{ color: C.cyan, fontWeight: 600 }}>已注入记忆：</span>
              用户画像 + 本会话第 1-4 轮摘要 + 最近 3 轮原文
            </div>
            <span style={{ fontSize: 10, color: C.success, fontWeight: 700 }}>↓ 节省 71%</span>
          </div>

          {/* Compressed history pill */}
          <div style={{
            padding: '6px 12px', borderRadius: 12, background: C.bgAlt, border: `1px dashed ${C.border}`,
            fontSize: 10, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'center',
          }}>
            ⊞ 第 1-4 轮已折叠为摘要（节省 1240 tokens）· 点击展开
          </div>

          {/* Last message - AI */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: C.p500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700 }}>AI</div>
            <div style={{ flex: 1, background: C.surface, borderRadius: 10, padding: 10, fontSize: 11, lineHeight: 1.7 }}>
              你之前提到用 LTV/CAC 评估，但<span style={{ background: C.p500 + '30', color: C.p400, padding: '0 5px', borderRadius: 3, fontSize: 10 }}>结合你画像里"To B 偏好"</span>，请问：To B 场景下的 LTV 计算有哪些特殊考量？
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: 6, padding: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
            <div style={{ flex: 1, color: C.muted, fontSize: 11, padding: '4px 6px' }}>输入回答...</div>
            <button style={btnSmall(C.p500, '#fff', 11, 12)}>发送</button>
          </div>
        </div>

        {/* Right: Token Usage Panel */}
        <div style={{ width: 220, background: C.card, borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, color: C.text }}>🎚 本轮 Token 消耗</div>

          {/* Token breakdown */}
          <div style={{ fontSize: 10, color: C.textSec, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span>用户画像（标签）</span><span style={{ color: C.cyan, fontWeight: 600 }}>28</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span>早期对话摘要</span><span style={{ color: C.p400, fontWeight: 600 }}>180</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span>最近 3 轮原文</span><span style={{ color: C.warning, fontWeight: 600 }}>172</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 3px', marginTop: 4, borderTop: `1px solid ${C.border}` }}>
              <span style={{ color: C.text, fontWeight: 700 }}>本轮总消耗</span>
              <span style={{ color: C.text, fontWeight: 700 }}>380</span>
            </div>
          </div>

          {/* Compare bar */}
          <div style={{ background: C.bgAlt, borderRadius: 6, padding: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>对比：全量传递</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.error, marginBottom: 2 }}>1,320 <span style={{ fontSize: 10, color: C.muted, fontWeight: 400 }}>tokens</span></div>
            <div style={{ height: 4, background: C.bg, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: C.error }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: C.muted, marginBottom: 4 }}>实际使用：分层</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.success, marginBottom: 2 }}>380 <span style={{ fontSize: 10, color: C.muted, fontWeight: 400 }}>tokens</span></div>
            <div style={{ height: 4, background: C.bg, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '29%', height: '100%', background: C.success }} />
            </div>
          </div>

          <div style={{ background: C.success + '15', border: `1px solid ${C.success}40`, borderRadius: 6, padding: 8, fontSize: 11, color: C.success, fontWeight: 600, textAlign: 'center' }}>
            节省 71% · 约 ¥0.012
          </div>

          {/* Settings */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>记忆策略</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.textSec, cursor: 'pointer' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: C.p500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>✓</span>
                启用画像记忆
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.textSec, cursor: 'pointer' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: C.p500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>✓</span>
                自动摘要（&gt;6轮）
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.muted, cursor: 'pointer' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, border: `1px solid ${C.border}` }}></span>
                跨会话引用
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SessionItem = ({ active, title, date, tags, score }) => (
  <div style={{
    padding: 10, borderRadius: 8, marginBottom: 4, cursor: 'pointer',
    background: active ? C.p500 + '20' : 'transparent',
    border: active ? `1px solid ${C.p500}40` : '1px solid transparent',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: active ? C.p400 : C.text }}>{title}</span>
      {score && <span style={{ fontSize: 10, color: score >= 80 ? C.success : score >= 70 ? C.warning : C.error, fontWeight: 700 }}>{score}</span>}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {tags.map(t => <span key={t} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: C.border, color: C.textSec }}>{t}</span>)}
      </div>
      <span style={{ fontSize: 10, color: C.muted }}>{date}</span>
    </div>
  </div>
);

/* ─── ② 成长报告 ─── */
const MockGrowthReport = () => (
  <div style={{ ...baseStyle, padding: 28, overflowY: 'auto' }}>
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 11, color: C.p400, fontWeight: 600, marginBottom: 4 }}>WEEKLY REPORT · 第 23 周</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>你的 PM 修炼周报</div>
        <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>2026.06.01 - 2026.06.07</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnSmall(C.surface, C.text)}>📤 分享</button>
        <button style={btnSmall(C.p500, '#fff')}>📄 导出 PDF</button>
      </div>
    </div>

    {/* Top score banner */}
    <div style={{ background: `linear-gradient(135deg, ${C.p600}40, ${C.cyan}25)`, borderRadius: 16, padding: 20, marginBottom: 18, border: `1px solid ${C.p500}30`, display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: C.textSec, marginBottom: 4 }}>本周成长指数</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: C.p400, lineHeight: 1 }}>+18%</div>
        <div style={{ fontSize: 11, color: C.success, marginTop: 4 }}>↑ 较上周提升 6 个百分点</div>
      </div>
      <div style={{ width: 1, alignSelf: 'stretch', background: C.border }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 8 }}>本周亮点 ✨</div>
        <ul style={{ listStyle: 'none', fontSize: 12, color: C.textSec, lineHeight: 1.9 }}>
          <li>· 完成 <strong style={{ color: C.text }}>5 次</strong>模拟面试，平均分提升 <strong style={{ color: C.success }}>12 分</strong></li>
          <li>· 在 <strong style={{ color: C.text }}>AI 产品</strong>能力域有显著突破，掌握 4 个新知识点</li>
          <li>· 连续 <strong style={{ color: C.text }}>7 天</strong>完成每日一问，解锁「持之以恒」勋章</li>
        </ul>
      </div>
    </div>

    {/* Metrics grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
      {[
        { label: '知识学习', val: 23, delta: '+8', color: C.p500 },
        { label: 'AI 工具', val: 14, delta: '+3', color: C.cyan },
        { label: '词典查阅', val: 32, delta: '+12', color: C.blue },
        { label: '面试练习', val: 5, delta: '+2', color: C.error },
      ].map((m, i) => (
        <div key={i} style={{ background: C.card, borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, borderTop: `2px solid ${m.color}` }}>
          <div style={{ fontSize: 11, color: C.textSec, marginBottom: 6 }}>{m.label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: m.color }}>{m.val}</div>
            <div style={{ fontSize: 11, color: C.success }}>{m.delta}</div>
          </div>
        </div>
      ))}
    </div>

    {/* Two cols */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
      {/* Ability heatmap */}
      <div style={{ background: C.card, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📊 能力维度增长</div>
        {[
          { name: 'AI 产品', val: 85, prev: 62 },
          { name: '数据分析', val: 72, prev: 58 },
          { name: '产品策略', val: 68, prev: 65 },
          { name: '用户研究', val: 54, prev: 48 },
          { name: '商业化', val: 41, prev: 32 },
        ].map((a, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <span style={{ color: C.textSec }}>{a.name}</span>
              <span style={{ color: C.text, fontWeight: 600 }}>{a.val}<span style={{ color: C.muted, fontWeight: 400 }}> / 100</span> <span style={{ color: C.success, fontSize: 10 }}>+{a.val - a.prev}</span></span>
            </div>
            <div style={{ height: 6, background: C.bgAlt, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: a.prev + '%', background: C.muted + '40' }} />
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: a.val + '%', background: `linear-gradient(90deg, ${C.p500}, ${C.cyan})` }} />
            </div>
          </div>
        ))}
      </div>

      {/* AI suggestions */}
      <div style={{ background: C.card, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>🎯 AI 学习建议</div>
        {[
          { tag: '推荐', color: C.p500, title: '深入学习「漏斗分析」', desc: '数据分析维度还有提升空间' },
          { tag: '巩固', color: C.cyan, title: '复习「用户访谈方法」', desc: '上次面试中表现一般' },
          { tag: '挑战', color: C.warning, title: '尝试「商业模式画布」', desc: '该领域使用次数为 0' },
        ].map((s, i) => (
          <div key={i} style={{ padding: 10, background: C.bgAlt, borderRadius: 8, marginBottom: 8, border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{s.title}</span>
              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: s.color + '20', color: s.color, fontWeight: 600 }}>{s.tag}</span>
            </div>
            <div style={{ fontSize: 11, color: C.textSec }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Activity timeline */}
    <div style={{ background: C.card, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📅 本周活跃热力图</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        {['一','二','三','四','五','六','日'].map((d, i) => {
          const h = [70,45,90,60,80,30,50][i];
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: '100%', height: 80, background: C.bgAlt, borderRadius: 6, position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', height: h + '%', background: `linear-gradient(180deg, ${C.p400}, ${C.p600})`, borderRadius: 6, boxShadow: `0 0 8px ${C.p500}40` }} />
              </div>
              <div style={{ fontSize: 10, color: C.textSec }}>周{d}</div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

/* ─── ③ AI 反向追问（替代原 AI 输出对比）─── */
const MockAIReverse = () => (
  <div style={{ ...baseStyle, padding: 24, display: 'flex', flexDirection: 'column' }}>
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>PRD 生成器 · 反向追问模式</div>
      <div style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
        🎯 先问清楚，再动手
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: C.p500 + '20', color: C.p400, fontWeight: 600 }}>训练 PM 思维</span>
      </div>
      <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>AI 不直接给方案，而是引导你想清楚 3 个关键问题</div>
    </div>

    {/* Two columns */}
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, overflow: 'hidden' }}>
      {/* Left: Conversation */}
      <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>需求澄清对话</span>
          <span style={{ fontSize: 10, color: C.muted }}>进度 2/3</span>
        </div>
        <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto', minHeight: 0 }}>
          {/* Initial input */}
          <div style={{ background: C.cyan + '15', borderRadius: 8, padding: 10, border: `1px solid ${C.cyan}30`, fontSize: 11, lineHeight: 1.6 }}>
            <div style={{ fontSize: 10, color: C.cyan, fontWeight: 600, marginBottom: 4 }}>📝 你的初始需求</div>
            设计一个面向新手的 AI 写作工具
          </div>

          {/* AI Q1 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: C.p500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 700 }}>1</div>
            <div style={{ flex: 1, background: C.surface, borderRadius: 8, padding: 10, fontSize: 11, lineHeight: 1.6 }}>
              <div style={{ color: C.p400, fontWeight: 600, marginBottom: 4 }}>问题 1 · 用户画像</div>
              「新手」是什么样的？是<strong style={{ color: C.text }}>从未写过文章</strong>的纯小白，还是<strong style={{ color: C.text }}>有写作基础但缺方法</strong>的进阶者？
            </div>
          </div>

          {/* User A1 */}
          <div style={{ display: 'flex', gap: 8, flexDirection: 'row-reverse' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: C.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 700 }}>我</div>
            <div style={{ flex: 1, background: C.cyan + '15', borderRadius: 8, padding: 10, fontSize: 11, lineHeight: 1.6 }}>
              是有基础但缺方法的进阶者，比如想写小红书但不会起标题的人
            </div>
          </div>

          {/* AI Q2 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: C.p500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 700 }}>2</div>
            <div style={{ flex: 1, background: C.surface, borderRadius: 8, padding: 10, fontSize: 11, lineHeight: 1.6 }}>
              <div style={{ color: C.p400, fontWeight: 600, marginBottom: 4 }}>问题 2 · 核心价值</div>
              用户为什么会用你的产品而不是 ChatGPT？你的<strong style={{ color: C.text }}>差异化护城河</strong>是什么？
            </div>
          </div>

          {/* User typing */}
          <div style={{ display: 'flex', gap: 8, flexDirection: 'row-reverse' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: C.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 700 }}>我</div>
            <div style={{ flex: 1, background: C.surface, borderRadius: 8, padding: 10, fontSize: 11, color: C.muted, fontStyle: 'italic', border: `1px dashed ${C.border}` }}>
              输入中...<span style={{ animation: 'blink 1s infinite' }}>|</span>
            </div>
          </div>
        </div>

        <div style={{ padding: 10, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 6 }}>
          <div style={{ flex: 1, background: C.bgAlt, borderRadius: 6, padding: '6px 10px', fontSize: 11, color: C.text }}>专注小红书博主，提供爆款标题工厂...</div>
          <button style={btnSmall(C.p500, '#fff', 11, 12)}>发送</button>
        </div>
      </div>

      {/* Right: Why this approach + Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Pedagogy banner */}
        <div style={{ background: `linear-gradient(135deg, ${C.p600}25, ${C.bgAlt})`, borderRadius: 10, padding: 14, border: `1px solid ${C.p500}40` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.p400, marginBottom: 6 }}>💡 为什么这样设计？</div>
          <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7 }}>
            优秀的 PM <strong style={{ color: C.text }}>先问清楚</strong>，再动手。这个模式训练你养成<strong style={{ color: C.p400 }}>"先思考、后输出"</strong>的习惯，而不是依赖 AI 直接给答案。
          </div>
        </div>

        {/* Clarification progress */}
        <div style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.border}`, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>📋 需求澄清进度</div>
          {[
            { num: 1, label: '目标用户画像', desc: '是谁、什么场景、什么痛点', done: true },
            { num: 2, label: '差异化护城河', desc: '凭什么能赢过对手', done: false, active: true },
            { num: 3, label: '商业模式', desc: '如何变现、单元经济模型', done: false },
          ].map((q, i) => (
            <div key={i} style={{
              padding: 10, borderRadius: 8, marginBottom: 6,
              background: q.active ? C.p500 + '15' : q.done ? C.success + '10' : 'transparent',
              border: `1px solid ${q.active ? C.p500 + '60' : q.done ? C.success + '40' : C.border}`,
              display: 'flex', gap: 10,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: q.done ? C.success : q.active ? C.p500 : C.surface,
                color: q.done || q.active ? '#fff' : C.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
              }}>{q.done ? '✓' : q.num}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: q.active ? C.p400 : q.done ? C.success : C.text }}>{q.label}</div>
                <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>{q.desc}</div>
              </div>
            </div>
          ))}

          {/* CTA */}
          <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
            <button style={{
              width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${C.p500}60`,
              background: C.p500 + '20', color: C.p400, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }} disabled>
              ⏳ 完成所有问题后生成 PRD
            </button>
            <div style={{ fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 8 }}>
              或 <span style={{ color: C.p400, cursor: 'pointer', textDecoration: 'underline' }}>跳过追问直接生成</span>（不推荐）
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ─── ④ 知识图谱掌握进度 ─── */
const MockKnowledgeMastery = () => (
  <div style={{ ...baseStyle, padding: 24, display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>知识图谱 · 学习地图</div>
        <div style={{ fontSize: 11, color: C.textSec, marginTop: 4 }}>已掌握 12 / 48 个知识点 · 完成度 25%</div>
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 5, background: C.success, marginRight: 6, verticalAlign: 'middle' }} />已掌握 12</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 5, background: C.warning, marginRight: 6, verticalAlign: 'middle' }} />学习中 8</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 5, background: C.muted, marginRight: 6, verticalAlign: 'middle' }} />待学习 28</span>
      </div>
    </div>

    {/* Overall progress bar */}
    <div style={{ background: C.card, borderRadius: 10, padding: 16, marginBottom: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>整体进度</div>
      <div style={{ display: 'flex', height: 20, borderRadius: 10, overflow: 'hidden', background: C.bgAlt }}>
        <div style={{ width: '25%', background: `linear-gradient(90deg, ${C.success}, #34d399)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff' }}>25%</div>
        <div style={{ width: '17%', background: C.warning, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff' }}>17%</div>
        <div style={{ flex: 1 }} />
      </div>
    </div>

    {/* Categories with progress */}
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, overflow: 'hidden' }}>
      {[
        { name: '产品策略', icon: '📋', color: C.p500, mastered: 3, learning: 1, total: 6, items: [
          { name: '商业模式画布', s: 'mastered' },
          { name: '市场定位', s: 'mastered' },
          { name: '竞争分析', s: 'mastered' },
          { name: 'OKR制定', s: 'learning' },
          { name: '增长策略', s: 'todo' },
          { name: '产品路线图', s: 'todo' },
        ]},
        { name: '数据分析', icon: '📊', color: C.success, mastered: 4, learning: 2, total: 6, items: [
          { name: 'DAU/MAU', s: 'mastered' },
          { name: '留存分析', s: 'mastered' },
          { name: '漏斗分析', s: 'mastered' },
          { name: '指标体系', s: 'mastered' },
          { name: '同期群分析', s: 'learning' },
          { name: '归因分析', s: 'learning' },
        ]},
        { name: 'AI 产品', icon: '🤖', color: '#a855f7', mastered: 2, learning: 3, total: 6, items: [
          { name: '大语言模型', s: 'mastered' },
          { name: 'Prompt工程', s: 'mastered' },
          { name: 'RAG架构', s: 'learning' },
          { name: '智能体Agent', s: 'learning' },
          { name: 'AI产品设计', s: 'learning' },
          { name: '模型评测', s: 'todo' },
        ]},
        { name: '用户研究', icon: '🔍', color: C.cyan, mastered: 3, learning: 2, total: 6, items: [
          { name: '用户画像', s: 'mastered' },
          { name: 'A/B测试', s: 'mastered' },
          { name: '用户访谈', s: 'mastered' },
          { name: '可用性测试', s: 'learning' },
          { name: '问卷设计', s: 'learning' },
          { name: '用户旅程图', s: 'todo' },
        ]},
      ].map((cat, i) => (
        <div key={i} style={{ background: C.card, borderRadius: 12, padding: 12, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: cat.color }}>{cat.name}</span>
            </div>
            <span style={{ fontSize: 11, color: C.textSec }}>{cat.mastered}/{cat.total}</span>
          </div>
          {/* progress mini */}
          <div style={{ height: 4, background: C.bgAlt, borderRadius: 2, overflow: 'hidden', marginBottom: 10, display: 'flex' }}>
            <div style={{ width: `${(cat.mastered / cat.total) * 100}%`, background: C.success }} />
            <div style={{ width: `${(cat.learning / cat.total) * 100}%`, background: C.warning }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cat.items.map((it, k) => {
              const color = it.s === 'mastered' ? C.success : it.s === 'learning' ? C.warning : C.muted;
              const icon = it.s === 'mastered' ? '✓' : it.s === 'learning' ? '◐' : '○';
              return (
                <span key={k} style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 12,
                  background: color + '15', color, border: `1px solid ${color}30`,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <span>{icon}</span>{it.name}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── ⑤ 面试题难度分级 ─── */
const MockInterviewLevels = () => (
  <div style={{ ...baseStyle, padding: 24, display: 'flex', flexDirection: 'column' }}>
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 18, fontWeight: 700 }}>模拟面试 · 题库</div>
      <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>按难度和领域筛选，循序渐进挑战</div>
    </div>

    {/* Filters */}
    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 4, background: C.card, padding: 4, borderRadius: 10 }}>
        {[
          { label: '全部', active: false },
          { label: '🟢 入门', count: 12, color: C.success, active: false },
          { label: '🟡 进阶', count: 11, color: C.warning, active: true },
          { label: '🔴 资深', count: 5, color: C.error, active: false },
        ].map((f, i) => (
          <button key={i} style={{
            padding: '6px 14px', border: 'none', borderRadius: 8, cursor: 'pointer',
            background: f.active ? C.p500 : 'transparent', color: f.active ? '#fff' : C.textSec,
            fontSize: 12, fontWeight: 600,
          }}>{f.label} {f.count && <span style={{ opacity: 0.7, fontSize: 10 }}>({f.count})</span>}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1 }}>
        {['产品策略', 'AI产品', '数据分析', '用户研究'].map((tag, i) => (
          <span key={i} style={{
            padding: '4px 10px', borderRadius: 12, background: C.card,
            border: `1px solid ${C.border}`, fontSize: 11, color: C.textSec, cursor: 'pointer',
          }}>{tag}</span>
        ))}
      </div>
    </div>

    {/* Recommendation banner */}
    <div style={{ background: `linear-gradient(135deg, ${C.p600}30, ${C.cyan}20)`, borderRadius: 10, padding: 12, marginBottom: 14, border: `1px solid ${C.p500}40`, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 18 }}>🎯</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.p400 }}>AI 推荐挑战</div>
        <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>你已通过 8 道入门题，建议尝试 <strong style={{ color: C.text }}>「设计一个 PMF 验证方案」</strong>（进阶 · 数据分析）</div>
      </div>
      <button style={btnSmall(C.p500, '#fff')}>开始挑战 →</button>
    </div>

    {/* Question cards */}
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, overflow: 'auto' }}>
      {[
        { lv: 'easy', title: '什么是 MVP？请举例说明', tags: ['产品基础'], completed: true, score: 85 },
        { lv: 'easy', title: '如何理解用户画像？', tags: ['用户研究'], completed: true, score: 78 },
        { lv: 'mid', title: '设计一个内容产品的指标体系', tags: ['数据分析'], completed: false },
        { lv: 'mid', title: 'AI 客服产品的 PMF 验证方案', tags: ['AI产品', '产品策略'], completed: false, recommended: true },
        { lv: 'mid', title: '如何评估一个 To B SaaS 的 LTV', tags: ['商业化', '数据'], completed: false },
        { lv: 'hard', title: '设计一个 AI Agent 的评测体系', tags: ['AI产品', '高级'], completed: false, locked: true },
      ].map((q, i) => {
        const lvMap = { easy: { color: C.success, label: '入门', icon: '🟢' }, mid: { color: C.warning, label: '进阶', icon: '🟡' }, hard: { color: C.error, label: '资深', icon: '🔴' } };
        const lv = lvMap[q.lv];
        return (
          <div key={i} style={{
            background: q.recommended ? C.p500 + '15' : C.card, borderRadius: 10, padding: 12,
            border: `1px solid ${q.recommended ? C.p500 : C.border}`, opacity: q.locked ? 0.5 : 1,
            cursor: q.locked ? 'not-allowed' : 'pointer',
            boxShadow: q.recommended ? `0 0 12px ${C.p500}30` : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: lv.color, fontWeight: 600 }}>{lv.icon} {lv.label}</span>
              {q.completed && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: C.success + '20', color: C.success }}>已完成 · {q.score}分</span>}
              {q.recommended && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: C.p500, color: '#fff', fontWeight: 600 }}>推荐</span>}
              {q.locked && <span style={{ fontSize: 10, color: C.muted }}>🔒 锁定</span>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, lineHeight: 1.5 }}>{q.title}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {q.tags.map(t => <span key={t} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: C.bgAlt, color: C.textSec }}>{t}</span>)}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ─── ⑥ 每日一问历史 ─── */
const MockDailyHistory = () => {
  const days = Array.from({ length: 35 }, (_, i) => i - 6);
  return (
    <div style={{ ...baseStyle, padding: 24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>每日一问 · 答题历史</div>
          <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>2026 年 6 月 · 已答 18 题 · 平均分 76 · 当前连续 7 天</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnSmall(C.surface, C.text)}>← 5月</button>
          <button style={btnSmall(C.surface, C.text)}>7月 →</button>
        </div>
      </div>

      {/* Calendar + side panel */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, overflow: 'hidden' }}>
        {/* Calendar */}
        <div style={{ background: C.card, borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
          {/* Week header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 10 }}>
            {['日','一','二','三','四','五','六'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, color: C.muted, fontWeight: 600 }}>{d}</div>
            ))}
          </div>
          {/* Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, flex: 1 }}>
            {days.map((d, i) => {
              const inMonth = d >= 1 && d <= 30;
              const today = d === 4;
              // mock scores
              const states = { 1:90, 2:85, 3:70, 4:82, 5:65, 6:78, 7:88, 8:75, 9:0, 10:72, 11:85, 12:90, 13:60, 14:80, 15:0, 16:78, 17:82, 18:65 };
              const score = states[d];
              const hasAnswer = score && score > 0;
              const today_active = today;
              return (
                <div key={i} style={{
                  aspectRatio: '1', borderRadius: 8, padding: 6,
                  background: today_active ? C.p500 : hasAnswer ? C.card : 'transparent',
                  border: today_active ? `1.5px solid ${C.p400}` : hasAnswer ? `1px solid ${C.border}` : '1px solid transparent',
                  opacity: inMonth ? 1 : 0.2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between',
                  cursor: hasAnswer ? 'pointer' : 'default', position: 'relative',
                  boxShadow: today_active ? `0 0 12px ${C.p500}50` : 'none',
                }}>
                  <span style={{ fontSize: 11, color: today_active ? '#fff' : C.textSec, fontWeight: 600 }}>{inMonth ? d : ''}</span>
                  {hasAnswer && (
                    <div style={{ alignSelf: 'flex-end' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: today_active ? '#fff' : score >= 80 ? C.success : score >= 70 ? C.warning : C.error,
                      }}>{score}</span>
                    </div>
                  )}
                  {hasAnswer && (
                    <div style={{ position: 'absolute', bottom: 4, left: 4, width: 4, height: 4, borderRadius: 2,
                      background: score >= 80 ? C.success : score >= 70 ? C.warning : C.error }} />
                  )}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.textSec }}>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: C.success, marginRight: 4 }} />优秀 (80+)</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: C.warning, marginRight: 4 }} />良好 (70-79)</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: C.error, marginRight: 4 }} />需提升 (&lt;70)</span>
            <span style={{ marginLeft: 'auto' }}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, border: `1.5px solid ${C.p400}`, marginRight: 4 }} />今日</span>
          </div>
        </div>

        {/* Side detail */}
        <div style={{ background: C.card, borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>6月3日 · 周三</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>如何评估 AI 产品的 PMF？</div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12, padding: 10, background: C.bgAlt, borderRadius: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.warning }}>82</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.textSec }}>本题得分</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>超越 76% 用户</div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: C.textSec, marginBottom: 4, fontWeight: 600 }}>你的答案：</div>
          <div style={{ fontSize: 11, color: C.text, padding: 10, background: C.bgAlt, borderRadius: 6, marginBottom: 10, lineHeight: 1.6, maxHeight: 80, overflow: 'hidden' }}>
            我会从用户需求、技术可行性和商业模式三个维度分析。首先验证目标用户的核心痛点是否真实存在...
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: C.p400, marginBottom: 4 }}>AI 点评：</div>
          <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.7, flex: 1, overflow: 'hidden' }}>
            ✓ 框架完整，三维度分析符合标准方法论<br/>
            ✓ 提及了「40% 用户失望」的经典 PMF 指标<br/>
            ⚠ 缺少对 AI 产品特性的具体讨论<br/>
            ⚠ 商业模式部分可以更深入
          </div>

          <button style={{ ...btnSmall(C.surface, C.text), marginTop: 12, width: '100%', padding: '8px 14px' }}>📥 查看完整点评</button>
        </div>
      </div>
    </div>
  );
};

/* ─── ⑦ Cmd+K 全局搜索 ─── */
const MockCmdK = () => (
  <div style={{ ...baseStyle, background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bgAlt} 100%)` }}>
    {/* Faded background (page) */}
    <div style={{ padding: 24, opacity: 0.3, filter: 'blur(2px)' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, height: 40, background: C.surface, borderRadius: 8 }} />
        <div style={{ width: 120, height: 40, background: C.surface, borderRadius: 8 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
        {[...Array(6)].map((_, i) => <div key={i} style={{ height: 120, background: C.card, borderRadius: 10 }} />)}
      </div>
    </div>

    {/* Backdrop */}
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />

    {/* Cmd+K modal */}
    <div style={{
      position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)',
      width: 640, background: C.bgAlt, borderRadius: 16,
      border: `1px solid ${C.p500}40`, boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 40px ${C.p500}30`,
      overflow: 'hidden',
    }}>
      {/* Search input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill={C.p400}><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input style={{
          flex: 1, background: 'none', border: 'none', outline: 'none', color: C.text,
          fontSize: 16,
        }} placeholder="搜索术语、知识点、工具、面试题..." defaultValue="LTV" />
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: C.surface, color: C.muted, fontFamily: 'monospace' }}>esc</span>
      </div>

      {/* Results */}
      <div style={{ maxHeight: 380, padding: 8 }}>
        {/* Group: 术语 */}
        <div style={{ padding: '8px 12px', fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1 }}>术语 · 2 个匹配</div>
        <ResultItem icon="📖" title="LTV" subtitle="Life Time Value · 用户生命周期价值" tag="数据指标" highlight />
        <ResultItem icon="📖" title="LTV/CAC 比率" subtitle="用户价值与获客成本的健康度指标" tag="数据指标" />

        <div style={{ padding: '8px 12px', fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1, marginTop: 6 }}>知识点 · 1 个匹配</div>
        <ResultItem icon="🧠" title="LTV 预估方法" subtitle="3种主流计算方法对比：历史平均法、Cohort法、预测模型法" tag="商业化" />

        <div style={{ padding: '8px 12px', fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1, marginTop: 6 }}>面试题 · 1 个匹配</div>
        <ResultItem icon="🎤" title="如何评估一个 To B SaaS 的 LTV" subtitle="进阶 · 商业化" tag="🟡 进阶" />

        <div style={{ padding: '8px 12px', fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1, marginTop: 6 }}>历史记录</div>
        <ResultItem icon="🕐" title="上次查看：6月2日「LTV 优化策略」" subtitle="点击恢复对话" tag="" />
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 18px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.muted }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span><kbd style={kbdStyle}>↑</kbd><kbd style={kbdStyle}>↓</kbd> 导航</span>
          <span><kbd style={kbdStyle}>↵</kbd> 选择</span>
          <span><kbd style={kbdStyle}>tab</kbd> 切换分类</span>
        </div>
        <div>powered by AI</div>
      </div>
    </div>
  </div>
);

const ResultItem = ({ icon, title, subtitle, tag, highlight }) => (
  <div style={{
    padding: '10px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
    background: highlight ? C.p500 + '20' : 'transparent',
    border: highlight ? `1px solid ${C.p500}40` : '1px solid transparent',
  }}>
    <span style={{ fontSize: 16 }}>{icon}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</div>
      <div style={{ fontSize: 11, color: C.textSec, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</div>
    </div>
    {tag && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: C.surface, color: C.textSec, flexShrink: 0 }}>{tag}</span>}
  </div>
);

const kbdStyle = {
  display: 'inline-block', padding: '1px 5px', background: C.surface, borderRadius: 3,
  fontSize: 9, fontFamily: 'monospace', color: C.textSec, margin: '0 2px',
  border: `1px solid ${C.border}`,
};

/* helper */
const btnSmall = (bg, color = C.text, fs = 12, pad = 14) => ({
  background: bg, color, border: 'none', padding: `6px ${pad}px`, borderRadius: 8,
  fontSize: fs, fontWeight: 600, cursor: 'pointer',
});

Object.assign(window, {
  MockAIMemory, MockGrowthReport, MockAIReverse,
  MockKnowledgeMastery, MockInterviewLevels,
  MockDailyHistory, MockCmdK,
});
