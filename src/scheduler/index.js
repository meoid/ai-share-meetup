const cron = require('node-cron');
const collect = require('../skills/collect');
const summarize = require('../skills/summarize');
const remind = require('../skills/remind');

function start() {
  // 周一 10:00 - 私聊收集意愿
  cron.schedule('0 10 * * 1', async () => {
    console.log('[scheduler] 触发: 周一收集');
    try { await collect.run(); }
    catch (e) { console.error('[scheduler] 收集任务失败:', e); }
  }, { timezone: 'Asia/Shanghai' });

  // 周三 15:00 - 汇总多维表格
  cron.schedule('0 15 * * 3', async () => {
    console.log('[scheduler] 触发: 周三汇总');
    try { await summarize.run(); }
    catch (e) { console.error('[scheduler] 汇总任务失败:', e); }
  }, { timezone: 'Asia/Shanghai' });

  // 周四 14:00 - 群聊提醒
  cron.schedule('0 14 * * 4', async () => {
    console.log('[scheduler] 触发: 周四提醒');
    try { await remind.run(); }
    catch (e) { console.error('[scheduler] 提醒任务失败:', e); }
  }, { timezone: 'Asia/Shanghai' });

  console.log('[scheduler] 定时任务已启动 (周一10:00 / 周三15:00 / 周四14:00)');
}

module.exports = { start };
