const llm = require('../llm/client');
const { SKILLS, SYSTEM_PROMPT } = require('../llm/skills');
const store = require('../store');
const feishu = require('../feishu/client');

async function run(userId, userName, text) {
  console.log(`[chat] ${userName}: ${text}`);

  const typingId = await feishu.sendTypingCard(userId);

  try {
    store.appendHistory(userId, 'user', text);

    const existing = store.getMemberReply(userId);
    const weekSummary = store.getWeekSummary();

    const contextInfo = [];
    if (existing) {
      contextInfo.push(`该用户当前记录：${existing.willing === 'yes' ? '参加' : '不参加'}${existing.topic ? `，主题「${existing.topic}」` : ''}`);
    }
    contextInfo.push(`本周已收集的回复：\n${weekSummary}`);

    const systemContent = SYSTEM_PROMPT + '\n\n## 当前状态\n' + contextInfo.join('\n');

    const history = store.getHistory(userId);
    const messages = [
      { role: 'system', content: systemContent },
      ...history.slice(-20),
    ];

    const result = await llm.chatWithTools(messages, SKILLS);
    let reply;

    if (result.type === 'tool_calls') {
      for (const call of result.toolCalls) {
        if (call.name === 'record_response') {
          const { willing, topic, notes } = call.args;
          store.setReply(userId, userName, willing, topic || '', notes || '');
          console.log(`[chat] 记录: ${userName} → ${willing}${topic ? `，主题「${topic}」` : ''}`);
        }
      }

      const followUp = await llm.chat([
        { role: 'system', content: systemContent },
        ...history.slice(-20),
        { role: 'assistant', content: result.content || '', tool_calls: result.toolCalls.map(c => ({ id: '1', type: 'function', function: { name: c.name, arguments: JSON.stringify(c.args) } })) },
        { role: 'tool', tool_call_id: '1', content: '已记录' },
      ]);
      reply = followUp.content || '好的，已记录！';
    } else {
      reply = result.content || '嗯，我在听～';
    }

    store.appendHistory(userId, 'assistant', reply);
    console.log(`[chat] 回复: ${reply}`);

    if (typingId) {
      await feishu.updateCardToText(typingId, reply);
    } else {
      await feishu.sendTextMessage(userId, reply);
    }

  } catch (e) {
    console.error(`[chat] LLM 错误:`, e.message);
    const errMsg = '抱歉，我暂时出了点问题，请稍后再试 🙏';
    if (typingId) {
      await feishu.updateCardToText(typingId, errMsg);
    } else {
      await feishu.sendTextMessage(userId, errMsg);
    }
  }
}

module.exports = { run };
