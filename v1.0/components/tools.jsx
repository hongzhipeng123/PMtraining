/* ── AI Toolbox + Dictionary (with real API integration) ── */

const TOOL_CONFIGS = {
  market: { title: '市场调研助手', desc: '输入产品方向，AI 生成12章节完整市场调研报告', placeholder: '例：分析 AI 客服市场，背景是公司在考虑做该方向', icon: 'search', color: T.p500, btnText: '开始调研' },
  competitor: { title: '竞品分析器', desc: '输入竞品名称或赛道，AI 生成12章节竞品分析报告', placeholder: '例：分析飞书、钉钉、企业微信的协同办公竞争格局', icon: 'chart', color: T.cyan, btnText: '开始分析' },
  prd: { title: 'PRD 生成器', desc: '输入产品需求，AI 生成完整 PRD 文档（含流程/验收标准）', placeholder: '例：设计一个AI写作助手，支持多种文体，面向内容创作者', icon: 'book', color: '#3b82f6', btnText: '生成 PRD' },
};

const ToolPage = ({ toolKey, user }) => {
  const config = TOOL_CONFIGS[toolKey];
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isDone, setIsDone] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState('');
  const toast = useToast();

  const handleGenerate = () => {
    if (!input.trim()) { toast('请填写需求描述', 'warning'); return; }
    const apiKey = localStorage.getItem(`user_${user}_apikey`);
    if (!apiKey || !apiKey.trim()) { setError('NO_KEY'); return; }

    setLoading(true); setOutput(''); setIsDone(false); setError('');
    Tracker.track(user, `使用${config.title}：${input.slice(0, 30)}...`);

    const messages = SKILL_PROMPTS[toolKey].buildMessages(input);
    callDeepSeek(apiKey, messages,
      chunk => setOutput(chunk),
      full => {
        setOutput(full); setIsDone(true); setLoading(false);
        Tracker.updateStats(user, 'tools');
      },
      err => {
        setError(err); setLoading(false);
        if (output) setIsDone(true); // partial output still usable
      }
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => { setCopied(true); toast('已复制到剪贴板', 'success'); setTimeout(() => setCopied(false), 2000); });
  };
  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/markdown' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `PM修炼场_${config.title}_${new Date().toISOString().slice(0,10)}.md`;
    a.click(); toast('文件已下载', 'success');
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '28px 32px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: config.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={config.icon} size={18} color={config.color} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>{config.title}</h2>
        </div>
        <p style={{ fontSize: 13, color: T.textSec }}>{config.desc}</p>
      </div>
      <div style={{ marginBottom: 16 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={config.placeholder}
          style={{ width: '100%', minHeight: 100, padding: 14, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, color: T.text, fontSize: 14, resize: 'vertical', outline: 'none', transition: T.transition, lineHeight: 1.7 }}
          onFocus={e => e.target.style.borderColor = T.p500} onBlur={e => e.target.style.borderColor = T.border} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span style={{ fontSize: 12, color: T.muted }}>{input.length} 字</span>
          <Button onClick={handleGenerate} disabled={loading} icon={loading ? undefined : 'send'} style={{ minWidth: 120 }}>
            {loading ? <><Spinner size={14} color="#fff" /> 生成中...</> : config.btnText}
          </Button>
        </div>
      </div>
      <div style={{ flex: 1, background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {error === 'NO_KEY' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: T.warning + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="key" size={24} color={T.warning} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>未设置 API Key</div>
              <div style={{ fontSize: 13, color: T.textSec }}>请先在设置中配置 DeepSeek API Key</div>
            </div>
            <Button variant="secondary" icon="settings" onClick={() => window.__openSettings && window.__openSettings()}>设置 API Key</Button>
          </div>
        ) : error && !output ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Icon name="close" size={32} color={T.error} />
            <div style={{ textAlign: 'center', maxWidth: 300 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.error, marginBottom: 4 }}>生成失败</div>
              <div style={{ fontSize: 13, color: T.textSec }}>{error}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleGenerate}>重试</Button>
          </div>
        ) : !output ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 14 }}>
            输入需求后点击生成，AI 将实时流式输出内容
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', fontSize: 14, lineHeight: 1.8 }}>
              <MarkdownRender text={output} loading={loading} />
              {error && <div style={{ marginTop: 12, padding: '8px 12px', background: T.error + '15', border: `1px solid ${T.error}30`, borderRadius: 8, fontSize: 12, color: T.error }}>⚠️ {error}</div>}
            </div>
            {isDone && (
              <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, animation: 'fadeIn 0.3s ease-out both' }}>
                <Button variant="secondary" size="sm" icon={copied ? 'check' : 'copy'} onClick={handleCopy}>{copied ? '已复制' : '复制 Markdown'}</Button>
                <Button variant="secondary" size="sm" icon="download" onClick={handleDownload}>下载 .md 文件</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ── Markdown Renderer ── */
const MarkdownRender = ({ text, loading }) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: 22, fontWeight: 800, color: T.text, marginTop: 16, marginBottom: 8 }}>{line.slice(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: 17, fontWeight: 700, color: T.p400, marginTop: 20, marginBottom: 6 }}>{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 14, marginBottom: 4 }}>{line.slice(4)}</h3>;
        if (line.startsWith('| ')) return <div key={i} style={{ fontSize: 12, fontFamily: 'monospace', color: T.textSec, padding: '2px 0' }}>{renderBold(line)}</div>;
        if (line.startsWith('- [ ] ')) return <div key={i} style={{ paddingLeft: 14, position: 'relative', marginBottom: 2 }}><span style={{ position: 'absolute', left: 0 }}>☐</span>{renderBold(line.slice(6))}</div>;
        if (line.startsWith('- [x] ')) return <div key={i} style={{ paddingLeft: 14, position: 'relative', marginBottom: 2 }}><span style={{ position: 'absolute', left: 0, color: T.success }}>☑</span>{renderBold(line.slice(6))}</div>;
        if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ paddingLeft: 14, position: 'relative', marginBottom: 2 }}><span style={{ position: 'absolute', left: 0, color: T.p400 }}>•</span>{renderBold(line.slice(2))}</div>;
        if (/^\d+\./.test(line)) return <div key={i} style={{ paddingLeft: 4, marginBottom: 2 }}>{renderBold(line)}</div>;
        if (line.startsWith('> ')) return <div key={i} style={{ paddingLeft: 12, borderLeft: `3px solid ${T.p500}40`, color: T.textSec, fontStyle: 'italic', marginBottom: 4 }}>{renderBold(line.slice(2))}</div>;
        if (line.startsWith('```')) return <div key={i} style={{ height: 1 }}></div>;
        if (line.startsWith('---')) return <hr key={i} style={{ border: 'none', borderTop: `1px solid ${T.border}`, margin: '12px 0' }} />;
        if (line.trim() === '') return <div key={i} style={{ height: 8 }}></div>;
        return <div key={i} style={{ marginBottom: 2, color: T.textSec }}>{renderBold(line)}</div>;
      })}
      {loading && <span style={{ animation: 'cursorBlink 1s infinite', color: T.p400, fontSize: 16 }}>▋</span>}
    </div>
  );
};

const renderBold = text => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((p, i) => p.startsWith('**') && p.endsWith('**') ? <strong key={i} style={{ color: T.text, fontWeight: 600 }}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>);
};

/* ── Dictionary ── */
const DICT_CATEGORIES = ['全部','产品基础','数据指标','技术概念','商业模式','用户研究','AI/ML','项目管理','设计思维','增长策略'];

const DICT_TERMS = [
  { term:'PMF', full:'Product-Market Fit', cat:'产品基础', def:'产品与市场需求的匹配程度。当40%+用户表示"如果不能用会非常失望"时，通常认为达到PMF。是产品从0到1最关键的验证节点。' },
  { term:'MVP', full:'Minimum Viable Product', cat:'产品基础', def:'最小可行产品，用最少的功能验证核心假设。核心是"可行"而非"最小"——必须能让用户体验到核心价值。' },
  { term:'用户故事', full:'User Story', cat:'产品基础', def:'以用户视角描述需求的轻量格式："作为[角色]，我想要[功能]，以便[价值]"。强调用户价值而非功能细节，是敏捷开发的需求载体。' },
  { term:'PRD', full:'Product Requirements Document', cat:'产品基础', def:'产品需求文档，详细描述功能规格、交互设计和验收标准。是PM与开发、设计团队的核心沟通文件。好的PRD让开发"读完就能干"。' },
  { term:'需求池', full:'Requirements Backlog', cat:'产品基础', def:'收集和管理所有产品需求的优先级列表。需求来源包括用户反馈、数据分析、竞品研究、业务战略等，需要定期清理过期需求。' },
  { term:'DAU/MAU', full:'Daily/Monthly Active Users', cat:'数据指标', def:'日活/月活用户数。DAU/MAU比率反映用户粘性：社交产品>50%算优秀，工具产品20-40%常见。注意区分"打开"和"有效使用"。' },
  { term:'留存率', full:'Retention Rate', cat:'数据指标', def:'用户在首次使用后持续回归的比例。次日留存衡量首次体验，7日留存衡量短期价值，30日留存衡量长期价值。提升留存ROI远高于拉新。' },
  { term:'LTV', full:'Life Time Value', cat:'数据指标', def:'用户生命周期价值，预测单个用户带来的总收入。基础公式：LTV = ARPU / 月流失率。LTV/CAC > 3表示健康的商业模型。' },
  { term:'CAC', full:'Customer Acquisition Cost', cat:'数据指标', def:'客户获取成本，获取一个新付费用户的平均花费。包含营销费用、销售成本等。CAC Payback Period（回本周期）< 12个月为SaaS行业健康标准。' },
  { term:'漏斗分析', full:'Funnel Analysis', cat:'数据指标', def:'追踪用户在关键路径各步骤的转化和流失。关注绝对流失量而非仅看转化率——高流量低转化的步骤可能是最大机会。' },
  { term:'ARPU', full:'Average Revenue Per User', cat:'数据指标', def:'每用户平均收入。ARPU = 总收入 / 活跃用户数。可按付费用户(ARPPU)和全量用户分别计算，两者差异反映付费渗透率。' },
  { term:'北极星指标', full:'North Star Metric', cat:'数据指标', def:'最能反映产品核心价值的单一指标，指引全团队方向。如Airbnb的"预订间夜数"、Spotify的"每周收听时长"。选择标准：反映用户价值+驱动营收。' },
  { term:'K因子', full:'K-Factor / Viral Coefficient', cat:'数据指标', def:'病毒传播系数，K = 每用户发出的邀请数 × 邀请转化率。K>1意味着自然增长，每个用户平均能带来超过1个新用户。' },
  { term:'API', full:'Application Programming Interface', cat:'技术概念', def:'应用程序接口，定义软件组件间的交互契约。PM需要理解API的输入输出、响应时间、并发能力和版本管理。' },
  { term:'SDK', full:'Software Development Kit', cat:'技术概念', def:'软件开发工具包，封装了API调用逻辑，让开发者更容易集成某个服务。如微信支付SDK、地图SDK。' },
  { term:'微服务', full:'Microservices', cat:'技术概念', def:'将应用拆分为小型独立服务，各自独立部署和扩展。优点是灵活扩展、故障隔离；缺点是运维复杂度增加。' },
  { term:'CI/CD', full:'Continuous Integration/Delivery', cat:'技术概念', def:'持续集成/持续交付。CI自动化代码合并和测试，CD自动化部署到生产环境。让团队能更频繁、更安全地发版。' },
  { term:'技术债务', full:'Technical Debt', cat:'技术概念', def:'为了短期速度而牺牲代码质量所积累的"欠债"。如同金融债务会产生利息——拖延处理会导致迭代速度越来越慢。' },
  { term:'SaaS', full:'Software as a Service', cat:'商业模式', def:'软件即服务，通过订阅方式交付云端软件。核心指标：MRR/ARR、Churn Rate、Net Revenue Retention。代表：Salesforce、Notion。' },
  { term:'PLG', full:'Product-Led Growth', cat:'商业模式', def:'产品驱动增长，以产品体验为核心获客手段。典型模式：Freemium、Free Trial。代表：Slack、Figma、Notion。降低对销售团队的依赖。' },
  { term:'飞轮效应', full:'Flywheel Effect', cat:'增长策略', def:'各环节相互增强形成的自我加速正向循环。如亚马逊飞轮：更多选择→更好体验→更多流量→更多卖家→更多选择。关键是找到"第一推动力"。' },
  { term:'A/B测试', full:'A/B Testing', cat:'用户研究', def:'将用户随机分组展示不同版本，通过统计方法比较效果差异。核心原则：每次只测一个变量、等样本量达标再看结果、注意新奇效应。' },
  { term:'用户画像', full:'User Persona', cat:'用户研究', def:'基于真实数据构建的目标用户虚拟代表。包含：基本信息、目标动机、痛点挫折、使用场景。2-4个核心画像足够，必须基于研究数据而非臆想。' },
  { term:'可用性测试', full:'Usability Testing', cat:'用户研究', def:'观察真实用户执行典型任务的过程，发现交互问题。5名用户即可发现80%问题。让用户"出声思考"，记录任务完成率和错误率。' },
  { term:'NPS', full:'Net Promoter Score', cat:'用户研究', def:'净推荐值。问用户"你有多大可能向朋友推荐本产品"（0-10分）。9-10分为推荐者，0-6分为贬损者。NPS = 推荐者% - 贬损者%。' },
  { term:'LLM', full:'Large Language Model', cat:'AI/ML', def:'大语言模型，基于Transformer架构的文本生成AI。核心概念：预训练、微调、涌现能力、上下文窗口、幻觉问题。主流模型：GPT、Claude、DeepSeek。' },
  { term:'RAG', full:'Retrieval-Augmented Generation', cat:'AI/ML', def:'检索增强生成，结合检索和生成提升AI准确性。流程：文档向量化→相似度检索→召回内容+问题→LLM生成。解决大模型知识过时和幻觉问题。' },
  { term:'Prompt工程', full:'Prompt Engineering', cat:'AI/ML', def:'设计和优化AI模型输入提示以获得最佳输出。核心技术：Zero-shot、Few-shot、Chain-of-Thought、角色扮演、结构化输出。是AI产品体验的核心。' },
  { term:'Agent', full:'AI Agent', cat:'AI/ML', def:'智能体，具备自主规划、推理和工具调用能力的AI系统。核心能力：任务规划、工具调用、记忆管理。产品设计关注：透明度、可控性、容错性。' },
  { term:'Fine-tuning', full:'模型微调', cat:'AI/ML', def:'在预训练模型基础上，用特定领域数据进一步训练，使模型适应特定任务。与RAG互补：Fine-tuning改变模型行为风格，RAG补充外部知识。' },
  { term:'Embedding', full:'向量嵌入', cat:'AI/ML', def:'将文本转换为高维向量表示，使语义相似的内容在向量空间中距离相近。是RAG、语义搜索、推荐系统的基础技术。' },
  { term:'Hallucination', full:'AI幻觉', cat:'AI/ML', def:'大模型生成看似合理但事实上不正确的内容。产品层面应对：引入RAG、显示置信度、支持用户反馈纠错、关键场景加人工审核。' },
  { term:'敏捷开发', full:'Agile Development', cat:'项目管理', def:'迭代式开发方法，强调快速交付和持续反馈。核心理念："工作的软件优于详尽的文档"。PM职责：管理Backlog、定义优先级、代表用户声音。' },
  { term:'Scrum', full:'Scrum Framework', cat:'项目管理', def:'最流行的敏捷框架。三个角色（PO/SM/团队）、五个事件（Sprint/Planning/Standup/Review/Retro）、三个产物（Product/Sprint Backlog/Increment）。' },
  { term:'OKR', full:'Objectives and Key Results', cat:'项目管理', def:'目标与关键结果框架。O是定性方向，KR是定量指标。完成70%即优秀（鼓励挑战性目标）。与KPI区别：OKR侧重突破，KPI侧重底线。' },
  { term:'设计冲刺', full:'Design Sprint', cat:'设计思维', def:'Google Ventures提出的5天设计方法：周一理解→周二发散→周三决策→周四原型→周五验证。适合在短时间内探索和验证产品方向。' },
  { term:'信息架构', full:'Information Architecture', cat:'设计思维', def:'组织和结构化信息的方法，让用户高效找到所需内容。常用方法：卡片分类法、树状测试。好的IA让用户"不用想就能找到"。' },
  { term:'交互设计', full:'Interaction Design', cat:'设计思维', def:'定义用户与产品之间的交互行为和反馈机制。核心原则：可见性、反馈、一致性、防错。目标：让交互自然、高效、愉悦。' },
  { term:'设计系统', full:'Design System', cat:'设计思维', def:'可复用组件和设计规范的集合，确保产品跨页面/跨平台的视觉和交互一致性。包含：色彩、字体、组件库、设计原则。代表：Ant Design、Material Design。' },
];

const DictionaryPage = ({ user }) => {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('全部');
  const [tab, setTab] = React.useState('all');
  const [selected, setSelected] = React.useState(null);
  const [aiExplain, setAiExplain] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);
  const [saved, setSaved] = React.useState(() => { try { return JSON.parse(localStorage.getItem(`user_${user}_vocab_saved`) || '[]'); } catch { return []; } });

  const toggleSave = term => {
    const next = saved.includes(term) ? saved.filter(t => t !== term) : [...saved, term];
    setSaved(next);
    localStorage.setItem(`user_${user}_vocab_saved`, JSON.stringify(next));
    Tracker.checkAchievements(user, Tracker.getStats(user));
  };

  const filtered = DICT_TERMS.filter(t => {
    if (tab === 'saved' && !saved.includes(t.term)) return false;
    if (category !== '全部' && t.cat !== category) return false;
    if (search && !t.term.toLowerCase().includes(search.toLowerCase()) && !t.full.toLowerCase().includes(search.toLowerCase()) && !t.def.includes(search)) return false;
    return true;
  });

  const handleSelect = term => {
    setSelected(term);
    setAiExplain(''); setAiLoading(true);
    Tracker.track(user, `查阅术语：${term.term}`);
    Tracker.updateStats(user, 'dictionary');

    const apiKey = localStorage.getItem(`user_${user}_apikey`);
    if (apiKey && apiKey.trim()) {
      const messages = [
        { role: 'system', content: DICT_SYSTEM_PROMPT },
        { role: 'user', content: `请用大白话解释PM术语「${term.term}」（${term.full}），基本定义：${term.def}` },
      ];
      callDeepSeek(apiKey, messages,
        chunk => setAiExplain(chunk),
        () => setAiLoading(false),
        err => {
          setAiExplain(`**${term.term}（${term.full}）**\n\n${term.def}\n\n⚠️ API调用失败：${err}`);
          setAiLoading(false);
        }
      );
    } else {
      setTimeout(() => {
        setAiExplain(`**${term.term}（${term.full}）**\n\n**定义：**\n${term.def}\n\n💡 配置 DeepSeek API Key 后可获取AI大白话解释和实战案例。`);
        setAiLoading(false);
      }, 300);
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ padding: '24px 28px 0', flexShrink: 0 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>产品名词百科</h2>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}><Input value={search} onChange={setSearch} placeholder="搜索术语..." icon="search" style={{ marginBottom: 0 }} /></div>
            <TabBar tabs={[{ key: 'all', label: `全部 (${DICT_TERMS.length})` }, { key: 'saved', label: `⭐ 生词本 (${saved.length})` }]} active={tab} onChange={setTab} style={{ width: 240 }} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {DICT_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '4px 12px', borderRadius: 20, border: `1px solid ${category === cat ? T.p500 : T.border}`, background: category === cat ? T.p500 + '20' : 'transparent', color: category === cat ? T.p400 : T.textSec, fontSize: 12, cursor: 'pointer', transition: T.transition, fontWeight: category === cat ? 600 : 400 }}>{cat}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px 28px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: T.muted }}>{tab === 'saved' ? '生词本为空，点击词条旁的 ☆ 收藏' : '没有匹配的术语'}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
              {filtered.map((t, i) => (
                <Card key={t.term} hoverable onClick={() => handleSelect(t)} style={{ padding: 16, animation: `fadeIn 0.2s ease-out ${Math.min(i * 0.03, 0.3)}s both`, borderColor: selected?.term === t.term ? T.p500 + '60' : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div><span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{t.term}</span><span style={{ fontSize: 11, color: T.muted, marginLeft: 8 }}>{t.full}</span></div>
                    <button onClick={e => { e.stopPropagation(); toggleSave(t.term); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: saved.includes(t.term) ? T.warning : T.muted, transition: T.transition }}>{saved.includes(t.term) ? '★' : '☆'}</button>
                  </div>
                  <Badge color={catColor(t.cat)} style={{ marginBottom: 6 }}>{t.cat}</Badge>
                  <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6 }}>{t.def.length > 60 ? t.def.slice(0, 60) + '...' : t.def}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      {selected && (
        <div style={{ width: 360, borderLeft: `1px solid ${T.border}`, background: T.bgAlt, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease-out both', flexShrink: 0 }}>
          <div style={{ padding: '20px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontWeight: 700, fontSize: 16 }}>{selected.term}</div><div style={{ fontSize: 12, color: T.muted }}>{selected.full}</div></div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer' }}><Icon name="close" size={18} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, fontSize: 13, lineHeight: 1.8 }}>
            {aiLoading && !aiExplain ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.p400 }}><Spinner size={16} /> AI 大白话解释生成中...</div>
            ) : <MarkdownRender text={aiExplain} loading={aiLoading} />}
          </div>
        </div>
      )}
    </div>
  );
};

const catColor = cat => {
  const map = { '产品基础':T.p500, '数据指标':T.cyan, '技术概念':'#3b82f6', '商业模式':'#f97316', '用户研究':'#10b981', 'AI/ML':'#a855f7', '项目管理':'#f43f5e', '设计思维':'#f59e0b', '增长策略':'#06b6d4' };
  return map[cat] || T.p500;
};

Object.assign(window, { ToolPage, MarkdownRender, renderBold, DictionaryPage, TOOL_CONFIGS, DICT_TERMS });
