const feishu = require('../feishu/client');
const store = require('../store');
const config = require('../config');

function getWeekLabel() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()} 年第 ${weekNum} 周`;
}

async function run() {
  console.log(`[collect] 开始执行收集任务...`);

  store.resetWeek();

  const members = await feishu.getChatMembers(config.targetChatId);
  console.log(`[collect] 群成员 ${members.length} 人`);

  for (const member of members) {
    if (member.openId === config.adminOpenId) continue;
    try {
      store.clearHistory(member.openId);
      await feishu.sendTextMessage(member.openId,
        `嗨！本周四晚上有 AI 分享会 📅\n\n你参加吗？如果参加的话，打算分享什么主题？\n\n随时回复我就行～`
      );
      console.log(`[collect] 已发送给 ${member.name}`);
    } catch (e) {
      console.error(`[collect] 发送给 ${member.name} 失败:`, e.message);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`[collect] 收集任务完成`);
}

module.exports = { run, getWeekLabel };
