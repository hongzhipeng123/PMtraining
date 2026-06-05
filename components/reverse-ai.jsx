/* ── AI Reverse Questioning Mode ──
   Replaces direct generation with 3-question Socratic clarification flow. */

const REVERSE_QUESTIONS = {
  market: {
    title: '市场调研 · 反向追问',
    icon: 'search',
    color: '#8b5cf6',
    questions: [
      { key: 'user', label: '目标用户与场景', hint: '面向哪类企业/角色？什么使用场景？核心痛点是什么？', desc: '清晰定义谁会在什么时候用，才不会做出"假需求"' },
      { key: 'value', label: '差异化价值', hint: '凭什么用户选你而非现有方案？你的独特优势是什么？', desc: '没有差异化的产品只能打价格战' },
      { key: 'scope', label: '调研范围与目的', hint: '是验证可行性？找市场切入点？还是做投资决策？', desc: '不同目的对应不同的研究深度与角度' },
    ],
  },
  competitor: {
    title: '竞品分析 · 反向追问',
    icon: 'chart',
    color: '#06b6d4',
    questions: [
      { key: 'self', label: '我方产品定位', hint: '你的产品定位是什么？想用这份分析做什么决策？', desc: '没有自身定位，就无法判断"竞品"的相关性' },
      { key: 'rivals', label: '竞品选择标准', hint: '为什么选这些竞品？是同赛道、替代品、还是参考标杆？', desc: '"竞品"定义不同，分析结论完全不同' },
      { key: 'focus', label: '重点关注维度', hint: '最想了解：产品功能/商业模式/增长策略/技术架构？', desc: '聚焦比全面更有价值' },
    ],
  },
  prd: {
    title: 'PRD 生成 · 反向追问',
    icon: 'book',
    color: '#3b82f6',
    questions: [
      { key: 'user', label: '目标用户画像', hint: '是谁？什么场景下使用？最核心的痛点和需求是什么？', desc: '回归"为谁解决什么问题"的本源' },
      { key: 'value', label: '核心价值/差异化', hint: '相比现有方案，你的产品凭什么赢？护城河在哪？', desc: '没差异化的 PRD 只是"功能列表"' },
      { key: 'mvp', label: 'MVP 边界', hint: '此版本必须有什么 / 可以暂时没有什么？资源约束？', desc: 'PM 真正的能力是"砍需求"' },
    ],
  },
};

const ReverseQuestionFlow = ({ toolKey, initialInput, onComplete, onSkip, user }) => {
  const config = REVERSE_QUESTIONS[toolKey];
  const isMobile = useIsMobile();
  const [stepIdx, setStepIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [currentInput, setCurrentInput] = React.useState('');
  const [aiSuggest, setAiSuggest] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);
  const toast = useToast();

  const currentQ = config.questions[stepIdx];
  const isLast = stepIdx === config.questions.length - 1;

  const askAIToAnswer = async () => {
    const apiKey = localStorage.getItem(`user_${user}_apikey`);
    if (!apiKey) { toast('请先设置 API Key', 'warning'); return; }
    setAiLoading(true); setAiSuggest('');
    try {
      const result = await callDeepSeekSync(apiKey, [
        { role: 'system', content: '你是 PM 思考助手。基于初始需求，给出一个具体、专业的答案作为参考（不超过80字）。直接输出答案，不要解释。' },
        { role: 'user', content: `初始需求：${initialInput}\n\n请回答这个澄清问题：${currentQ.label}\n问题描述：${currentQ.hint}` },
      ]);
      setAiSuggest(result.trim());
    } catch (err) {
      toast(`AI 建议失败: ${err.message}`, 'error');
    }
    setAiLoading(false);
  };

  const useAISuggestion = () => {
    setCurrentInput(aiSuggest);
    setAiSuggest('');
  };

  const handleNext = () => {
    if (!currentInput.trim()) { toast('请填写或跳过', 'warning'); return; }
    const nextAnswers = { ...answers, [currentQ.key]: currentInput.trim() };
    setAnswers(nextAnswers);
    if (isLast) {
      onComplete(initialInput, nextAnswers);
    } else {
      setStepIdx(stepIdx + 1);
      setCurrentInput(''); setAiSuggest('');
    }
  };

  const handleSkipStep = () => {
    const nextAnswers = { ...answers, [currentQ.key]: '(用户跳过此问题)' };
    setAnswers(nextAnswers);
    if (isLast) onComplete(initialInput, nextAnswers);
    else { setStepIdx(stepIdx + 1); setCurrentInput(''); setAiSuggest(''); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top: pedagogy banner */}
      <div style={{
        margin: '0 0 20px', padding: 16, borderRadius: 12,
        background: `linear-gradient(135deg, ${T.p700}30, ${T.cyan}15)`,
        border: `1px solid ${T.p500}40`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 24 }}>🎯</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>先问清楚，再动手</div>
          <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6 }}>
            优秀 PM 不会拿到需求就开始写。让我们先用 3 个关键问题理清思路 —— 这才是 PM 真正的核心能力。
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onSkip}>跳过追问</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: isMobile ? 14 : 20, flex: 1, minHeight: 0 }}>
        {/* Left: current Q */}
        <Card style={{ display: 'flex', flexDirection: 'column', order: isMobile ? 2 : 0 }}>
          {/* Initial input recap */}
          <div style={{ background: T.cyan + '10', padding: 10, borderRadius: 8, border: `1px solid ${T.cyan}30`, marginBottom: 14, fontSize: 12 }}>
            <div style={{ fontSize: 11, color: T.cyan, fontWeight: 600, marginBottom: 4 }}>📝 你的需求</div>
            <div style={{ color: T.textSec, lineHeight: 1.6 }}>{initialInput}</div>
          </div>

          {/* Current question */}
          <div style={{ background: T.surface, padding: 16, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: T.p500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
              }}>{stepIdx + 1}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.p400, marginBottom: 4 }}>{currentQ.label}</div>
                <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.7 }}>{currentQ.hint}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: T.muted, padding: '8px 12px', background: T.bg, borderRadius: 6, borderLeft: `2px solid ${T.p400}`, marginTop: 8 }}>
              💡 <em>{currentQ.desc}</em>
            </div>
          </div>

          {/* AI suggestion */}
          {aiSuggest && (
            <div style={{
              padding: 12, borderRadius: 8, background: T.cyan + '10',
              border: `1px dashed ${T.cyan}50`, marginBottom: 12,
              animation: 'fadeIn 0.3s ease-out both',
            }}>
              <div style={{ fontSize: 11, color: T.cyan, fontWeight: 600, marginBottom: 6 }}>🤖 AI 参考答案</div>
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.7, marginBottom: 8 }}>{aiSuggest}</div>
              <Button variant="ghost" size="sm" onClick={useAISuggestion}>使用此答案</Button>
            </div>
          )}

          {/* Answer input */}
          <textarea
            value={currentInput} onChange={e => setCurrentInput(e.target.value)}
            placeholder="写下你的思考..."
            style={{
              flex: 1, minHeight: 100, padding: 14, background: T.surface,
              border: `1px solid ${T.border}`, borderRadius: T.radiusSm, color: T.text,
              fontSize: 13, resize: 'none', outline: 'none', lineHeight: 1.7,
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" size="sm" onClick={askAIToAnswer} disabled={aiLoading}>
                {aiLoading ? <Spinner size={12} /> : '🤖'} 请 AI 帮我想
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSkipStep}>跳过本题</Button>
            </div>
            <Button onClick={handleNext} size="md">
              {isLast ? '完成 · 生成方案 →' : '下一题 →'}
            </Button>
          </div>
        </Card>

        {/* Right: progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, order: isMobile ? 1 : 0 }}>
          <Card style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📋 澄清进度</div>
            {config.questions.map((q, i) => {
              const state = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'todo';
              const color = state === 'done' ? T.success : state === 'active' ? T.p500 : T.muted;
              return (
                <div key={q.key} style={{
                  padding: 10, borderRadius: 8, marginBottom: 6,
                  background: state === 'active' ? T.p500 + '15' : state === 'done' ? T.success + '10' : 'transparent',
                  border: `1px solid ${state === 'active' ? T.p500 + '60' : state === 'done' ? T.success + '40' : T.border}`,
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, background: color,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>{state === 'done' ? '✓' : i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: state === 'active' ? T.p400 : state === 'done' ? T.success : T.text }}>{q.label}</div>
                    {state === 'done' && answers[q.key] && (
                      <div style={{ fontSize: 10, color: T.muted, marginTop: 4, lineHeight: 1.5,
                        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>{answers[q.key]}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { REVERSE_QUESTIONS, ReverseQuestionFlow });
