const feishu = require('../feishu/client');
const { appendWeeklyRecords } = require('../feishu/bitable');
const store = require('../store');
const config = require('../config');
const { getWeekLabel } = require('./collect');

async function run() {
  console.log(`[summarize] 开始汇总...`);

  const members = await feishu.getChatMembers(config.targetChatId);
  const replies = store.getReplies();
  const weekLabel = getWeekLabel();

  const bitableUrl = await appendWeeklyRecords(weekLabel, replies, members);
  console.log(`[summarize] 多维表格已更新: ${bitableUrl}`);

  await feishu.sendTextMessage(
    config.adminOpenId,
    `📊 ${weekLabel} 分享会汇总\n\n意愿收集已完成，数据已追加到多维表格：\n${bitableUrl}`
  );
  console.log(`[summarize] 汇总已发送给管理员`);
}

module.exports = { run };
