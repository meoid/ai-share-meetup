const feishu = require('../feishu/client');
const config = require('../config');

async function run() {
  console.log(`[remind] 发送群聊提醒...`);
  await feishu.sendChatMessage(
    config.targetChatId,
    '📢 今晚有 AI 分享会，请大家准时参加！'
  );
  console.log(`[remind] 提醒已发送`);
}

module.exports = { run };
