const feishu = require('../feishu/client');
const { buildSummaryCard } = require('../feishu/cards');
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

  const card = buildSummaryCard(getWeekLabel(), bitableUrl);
  await feishu.sendCardMessage(config.adminOpenId, card);
  console.log(`[summarize] 汇总卡片已发送给管理员`);
}

module.exports = { run };
