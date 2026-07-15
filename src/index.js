const lark = require('@larksuiteoapi/node-sdk');
const config = require('./config');
const scheduler = require('./scheduler');
const handleReply = require('./skills/handleReply');
const { client, getUserName } = require('./feishu/client');

const wsClient = new lark.WSClient({
  appId: config.feishu.appId,
  appSecret: config.feishu.appSecret,
  eventDispatcher: new lark.EventDispatcher({}).register({
    'im.message.receive_v1': async (data) => {
      try {
        const msg = JSON.parse(data.message.content);
        const text = msg.text || '';
        const senderId = data.sender.sender_id.open_id;
        const chatType = data.message.chat_type;

        // 只处理私聊消息（用户回复收集邀请）
        if (chatType === 'p2p') {
          const userName = await getUserName(senderId);
          await handleReply.run(senderId, userName, text);
        }
      } catch (e) {
        console.error('[ws] 处理消息失败:', e.message);
      }
    },
    'card.action.trigger': async (data) => {
      try {
        const action = data.action.value;
        const userId = data.operator.open_id;
        const userName = await getUserName(userId);

        if (action.action === 'willing') {
          const { setReply } = require('./store');
          setReply(userId, userName, action.willing, '', '');

          const { sendTextMessage } = require('./feishu/client');
          const reply = action.willing === 'yes'
            ? '好的，已记录你参加本周分享会！请告诉我你的报告主题 😊'
            : '好的，已记录你不参加本周的分享会。如果改变主意随时告诉我～';
          await sendTextMessage(userId, reply);
        }
      } catch (e) {
        console.error('[ws] 处理卡片回调失败:', e.message);
      }
    },
  }),
});

async function main() {
  console.log('🤖 AI 分享会助手启动中...');
  console.log(`   LLM: ${config.llm.model} @ ${config.llm.baseUrl}`);

  scheduler.start();

  await wsClient.start();
  console.log('   飞书 WebSocket 已连接');
  console.log('✅ 助手已就绪，等待消息...\n');
}

main().catch((e) => {
  console.error('启动失败:', e);
  process.exit(1);
});
