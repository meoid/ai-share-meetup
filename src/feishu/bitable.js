const { client } = require('./client');
const store = require('../store');

const FIELDS = [
  { field_name: '周次', type: 1 },
  { field_name: '姓名', type: 1 },
  { field_name: '是否参加', type: 3, property: { options: [
    { name: '参加' }, { name: '不参加' }, { name: '未回复' },
  ]}},
  { field_name: '报告主题', type: 1 },
  { field_name: '首次回复时间', type: 5 },
  { field_name: '最后修改时间', type: 5 },
  { field_name: '备注', type: 1 },
];

async function createBitable(name) {
  const resp = await client.bitable.app.create({ data: { name } });
  if (resp.code !== 0) throw new Error(`创建多维表格失败: ${resp.msg}`);
  return { appToken: resp.data.app.app_token, url: resp.data.app.url };
}

async function getDefaultTable(appToken) {
  const resp = await client.bitable.appTable.list({ path: { app_token: appToken } });
  if (resp.code !== 0 || !resp.data.items?.length) throw new Error(`获取数据表失败: ${resp.msg}`);
  return resp.data.items[0].table_id;
}

async function setupFields(appToken, tableId) {
  const existing = await client.bitable.appTableField.list({
    path: { app_token: appToken, table_id: tableId },
  });
  const existingNames = new Set((existing.data?.items || []).map(f => f.field_name));
  const keep = new Set(FIELDS.map(f => f.field_name));

  // 删除不需要的默认字段
  for (const field of (existing.data?.items || [])) {
    if (!keep.has(field.field_name)) {
      await client.bitable.appTableField.delete({
        path: { app_token: appToken, table_id: tableId, field_id: field.field_id },
      });
    }
  }

  // 添加缺少的字段
  for (const field of FIELDS) {
    if (!existingNames.has(field.field_name)) {
      await client.bitable.appTableField.create({
        path: { app_token: appToken, table_id: tableId },
        data: field,
      });
    }
  }
}

async function clearDefaultRows(appToken, tableId) {
  try {
    const resp = await client.bitable.appTableRecord.list({
      path: { app_token: appToken, table_id: tableId },
      params: { page_size: 100 },
    });
    if (resp.code === 0 && resp.data.items?.length > 0) {
      const recordIds = resp.data.items.map(r => r.record_id);
      await client.bitable.appTableRecord.batchDelete({
        path: { app_token: appToken, table_id: tableId },
        data: { records: recordIds },
      });
    }
  } catch (e) {
    // ignore
  }
}

async function insertRecords(appToken, tableId, weekLabel, replies, allMembers) {
  const records = [];

  for (const member of allMembers) {
    const reply = replies[member.openId];
    const fields = {
      '周次': weekLabel,
      '姓名': member.name,
      '是否参加': reply ? (reply.willing === 'yes' ? '参加' : '不参加') : '未回复',
      '报告主题': reply?.topic || '',
      '备注': reply?.notes || '',
    };
    if (reply?.firstReplyAt) fields['首次回复时间'] = new Date(reply.firstReplyAt).getTime();
    if (reply?.lastModifiedAt) fields['最后修改时间'] = new Date(reply.lastModifiedAt).getTime();
    records.push({ fields });
  }

  if (records.length === 0) return;

  const resp = await client.bitable.appTableRecord.batchCreate({
    path: { app_token: appToken, table_id: tableId },
    data: { records },
  });
  if (resp.code !== 0) throw new Error(`写入记录失败: ${resp.msg}`);
}

async function getOrCreateBitable() {
  const saved = store.getBitableInfo();

  if (saved) {
    console.log(`[bitable] 使用已有表格: ${saved.appToken}`);
    return saved;
  }

  console.log(`[bitable] 首次创建多维表格...`);
  const { appToken, url } = await createBitable('AI 分享会记录');
  const tableId = await getDefaultTable(appToken);
  await setupFields(appToken, tableId);
  await clearDefaultRows(appToken, tableId);
  store.setBitableInfo(appToken, tableId, url);
  return { appToken, tableId, url };
}

async function appendWeeklyRecords(weekLabel, replies, allMembers) {
  const { appToken, tableId, url } = await getOrCreateBitable();
  await insertRecords(appToken, tableId, weekLabel, replies, allMembers);
  return url;
}

module.exports = { appendWeeklyRecords };
