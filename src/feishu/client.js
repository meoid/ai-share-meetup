const lark = require('@larksuiteoapi/node-sdk');
const config = require('../config');

const client = new lark.Client({
  appId: config.feishu.appId,
  appSecret: config.feishu.appSecret,
  appType: lark.AppType.SelfBuild,
});

async function getChatMembers(chatId) {
  const members = [];
  let pageToken = '';

  do {
    const params = { chat_id: chatId, page_size: 100 };
    if (pageToken) params.page_token = pageToken;

    const resp = await client.im.chatMembers.get({ params });
    if (resp.code !== 0) {
      throw new Error(`获取群成员失败: ${resp.msg}`);
    }
    for (const m of (resp.data.items || [])) {
      members.push({
        openId: m.member_id,
        name: m.name,
      });
    }
    pageToken = resp.data.page_token || '';
  } while (pageToken);

  return members;
}

async function sendTextMessage(openId, text) {
  const resp = await client.im.message.create({
    params: { receive_id_type: 'open_id' },
    data: {
      receive_id: openId,
      msg_type: 'text',
      content: JSON.stringify({ text }),
    },
  });
  if (resp.code !== 0) {
    throw new Error(`发送消息失败: ${resp.msg}`);
  }
  return resp.data;
}

async function sendCardMessage(openId, card) {
  const resp = await client.im.message.create({
    params: { receive_id_type: 'open_id' },
    data: {
      receive_id: openId,
      msg_type: 'interactive',
      content: JSON.stringify(card),
    },
  });
  if (resp.code !== 0) {
    throw new Error(`发送卡片消息失败: ${resp.msg}`);
  }
  return resp.data;
}

async function sendChatMessage(chatId, text) {
  const resp = await client.im.message.create({
    params: { receive_id_type: 'chat_id' },
    data: {
      receive_id: chatId,
      msg_type: 'text',
      content: JSON.stringify({ text }),
    },
  });
  if (resp.code !== 0) {
    throw new Error(`发送群消息失败: ${resp.msg}`);
  }
  return resp.data;
}

async function getUserName(openId) {
  try {
    const resp = await client.contact.user.get({
      path: { user_id: openId },
      params: { user_id_type: 'open_id' },
    });
    if (resp.code === 0) {
      return resp.data.user.name;
    }
  } catch (e) {
    // ignore
  }
  return '未知用户';
}

module.exports = {
  client,
  getChatMembers,
  sendTextMessage,
  sendCardMessage,
  sendChatMessage,
  getUserName,
};
