const llm = require('../llm/client');
const { SKILLS, SYSTEM_PROMPT } = require('../llm/skills');
const store = require('../store');
const feishu = require('../feishu/client');

async function run(userId, userName, text) {
  console.log(`[handleReply] 收到 ${userName} 的回复: ${text}`);

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ];

    const result = await llm.chatWithTools(messages, SKILLS);

    if (result.type === 'tool_calls') {
      for (const call of result.toolCalls) {
        if (call.name === 'parse_sharing_reply') {
          const { willing, topic, notes } = call.args;
          store.setReply(userId, userName, willing, topic || '', notes || '');
          console.log(`[handleReply] 已记录: ${userName} - 意愿=${willing}, 主题=${topic || '无'}`);

          const reply = willing === 'yes'
            ? `好的，已记录！${topic ? `你的报告主题是「${topic}」，` : ''}随时可以修改哦 😊`
            : '好的，已记录你不参加本周的分享会。如果改变主意随时告诉我～';
          await feishu.sendTextMessage(userId, reply);
          return;
        }
      }
    }

    await feishu.sendTextMessage(userId, '不好意思，我没有理解你的意思。请告诉我你是否参加本周的分享会，以及你的报告主题 😊');
  } catch (e) {
    console.error(`[handleReply] LLM 解析失败:`, e.message);
    await feishu.sendTextMessage(userId, '处理你的回复时遇到了问题，请稍后再试或联系管理员。');
  }
}

module.exports = { run };
