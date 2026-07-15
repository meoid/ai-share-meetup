const SKILLS = [
  {
    type: 'function',
    function: {
      name: 'parse_sharing_reply',
      description: '解析用户对分享会邀请的回复，提取参加意愿和报告主题',
      parameters: {
        type: 'object',
        properties: {
          willing: {
            type: 'string',
            enum: ['yes', 'no'],
            description: '用户是否愿意参加分享会。yes=参加，no=不参加',
          },
          topic: {
            type: 'string',
            description: '用户提出的报告主题。如果用户未提及或不愿参加，返回空字符串',
          },
          notes: {
            type: 'string',
            description: '用户回复中的补充说明或备注。没有则返回空字符串',
          },
        },
        required: ['willing'],
      },
    },
  },
];

const SYSTEM_PROMPT = `你是一个 AI 分享会助手的后端解析模块。你的任务是分析用户的回复内容，提取出结构化的信息。

背景：用户之前收到了分享会邀请，被问到"是否参加本周的 AI 分享会"以及"如果参加，报告主题是什么"。

请根据用户的回复，调用 parse_sharing_reply 函数提取信息。注意：
- 用户可能用各种方式表达意愿（"好的"、"没问题"、"来不了"、"这次算了"等）
- 主题可能是一句话描述，保留原意即可
- 如果用户只回答了是否参加但没提主题，topic 留空
- 如果用户的回复完全无关（比如问天气），仍然尝试判断是否包含分享会相关信息`;

module.exports = { SKILLS, SYSTEM_PROMPT };
