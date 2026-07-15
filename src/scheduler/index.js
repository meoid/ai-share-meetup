const cron = require('node-cron');
const collect = require('../skills/collect');
const summarize = require('../skills/summarize');

function start() {
  // 周一 10:00 - 私聊收集意愿
  cron.schedule('0 10 * * 1', async () => {
    console.log('[scheduler] 触发: 周一收集');
    try { await collect.run(); }
    catch (e) { console.error('[scheduler] 收集任务失败:', e); }
  }, { timezone: 'Asia/Shanghai' });

  // 周二 15:00 - 汇总多维表格
  cron.schedule('0 15 * * 2', async () => {
    console.log('[scheduler] 触发: 周二汇总');
    try { await summarize.run(); }
    catch (e) { console.error('[scheduler] 汇总任务失败:', e); }
  }, { timezone: 'Asia/Shanghai' });

  console.log('[scheduler] 定时任务已启动 (周一10:00 收集 / 周二15:00 汇总)');
}

module.exports = { start };
