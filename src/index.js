const lark = require('@larksuiteoapi/node-sdk');
const config = require('./config');
const scheduler = require('./scheduler');
const handleReply = require('./skills/handleReply');
const { getUserName, preloadMembers } = require('./feishu/client');

const processedMessages = new Set();

const eventDispatcher = new lark.EventDispatcher({}).register({
  'im.message.receive_v1': async (data) => {
    try {
      const messageId = data.message.message_id;
      if (processedMessages.has(messageId)) return;
      processedMessages.add(messageId);
      if (processedMessages.size > 1000) {
        const first = processedMessages.values().next().value;
        processedMessages.delete(first);
      }

      const msg = JSON.parse(data.message.content);
      const text = msg.text || '';
      const senderId = data.sender.sender_id.open_id;
      const chatType = data.message.chat_type;

      if (chatType === 'p2p') {
        const userName = getUserName(senderId);
        await handleReply.run(senderId, userName, text);
      }
    } catch (e) {
      console.error('[ws] 处理消息失败:', e.message);
    }
  },
});

const wsClient = new lark.WSClient({
  appId: config.feishu.appId,
  appSecret: config.feishu.appSecret,
});

async function main() {
  console.log('🤖 AI 分享会助手启动中...');
  console.log(`   LLM: ${config.llm.model} @ ${config.llm.baseUrl}`);

  await preloadMembers();
  scheduler.start();

  await wsClient.start({ eventDispatcher });
  console.log('   飞书 WebSocket 已连接');
  console.log('✅ 助手已就绪，等待消息...\n');
}

main().catch((e) => {
  console.error('启动失败:', e);
  process.exit(1);
});
