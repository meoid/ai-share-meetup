function buildCollectCard(weekLabel) {
  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: `📅 ${weekLabel} AI 分享会` },
      template: 'blue',
    },
    elements: [
      {
        tag: 'markdown',
        content: '你好！本周四晚上有 AI 分享会，请填写以下信息：\n\n**1. 是否参加？**\n**2. 如果参加，你的报告主题是什么？**\n\n可以点击按钮快速回复，或直接打字告诉我 😊',
      },
      { tag: 'hr' },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: { tag: 'plain_text', content: '✅ 参加' },
            type: 'primary',
            value: { action: 'willing', willing: 'yes' },
          },
          {
            tag: 'button',
            text: { tag: 'plain_text', content: '❌ 不参加' },
            type: 'default',
            value: { action: 'willing', willing: 'no' },
          },
        ],
      },
      { tag: 'hr' },
      {
        tag: 'note',
        elements: [
          { tag: 'plain_text', content: '回复后可随时修改，以最后一次回复为准' },
        ],
      },
    ],
  };
}

function buildSummaryCard(weekLabel, bitableUrl) {
  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: `📊 ${weekLabel} 分享会汇总` },
      template: 'green',
    },
    elements: [
      {
        tag: 'markdown',
        content: `本周分享会意愿收集已完成，汇总数据已整理到多维表格：\n\n[👉 查看多维表格](${bitableUrl})`,
      },
    ],
  };
}

module.exports = { buildCollectCard, buildSummaryCard };
