const feishu = require('../feishu/client');
const { createWeeklyBitable } = require('../feishu/bitable');
const store = require('../store');
const config = require('../config');
const { getWeekLabel } = require('./collect');

async function run() {
  console.log(`[summarize] 开始汇总...`);

  const members = await feishu.getChatMembers(config.targetChatId);
  const replies = store.getReplies();

  const bitableUrl = await createWeeklyBitable(getWeekLabel(), replies, members);
  console.log(`[summarize] 多维表格已创建: ${bitableUrl}`);

  await feishu.sendTextMessage(
    config.adminOpenId,
    `📊 ${getWeekLabel()} 分享会汇总\n\n意愿收集已完成，查看多维表格：\n${bitableUrl}`
  );
  console.log(`[summarize] 汇总已发送给管理员`);
}

module.exports = { run };
