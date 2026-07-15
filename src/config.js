require('dotenv').config();

module.exports = {
  feishu: {
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
  },
  targetChatId: process.env.TARGET_CHAT_ID,
  adminOpenId: process.env.ADMIN_OPEN_ID,
  llm: {
    baseUrl: process.env.LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: process.env.LLM_API_KEY,
    model: process.env.LLM_MODEL || 'qwen-max',
  },
  dataDir: require('path').join(__dirname, '..', 'data'),
};
