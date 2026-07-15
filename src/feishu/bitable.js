const { client } = require('./client');

async function createBitable(name) {
  const resp = await client.bitable.app.create({
    data: { name, folder_token: '' },
  });
  if (resp.code !== 0) {
    throw new Error(`创建多维表格失败: ${resp.msg}`);
  }
  return {
    appToken: resp.data.app.app_token,
    url: resp.data.app.url,
  };
}

async function getDefaultTable(appToken) {
  const resp = await client.bitable.appTable.list({
    path: { app_token: appToken },
  });
  if (resp.code !== 0 || !resp.data.items?.length) {
    throw new Error(`获取数据表失败: ${resp.msg}`);
  }
  return resp.data.items[0].table_id;
}

async function setupFields(appToken, tableId) {
  const fields = [
    { field_name: '姓名', type: 1 },
    { field_name: '是否参加', type: 3, property: { options: [
      { name: '参加' }, { name: '不参加' }, { name: '未回复' },
    ]}},
    { field_name: '报告主题', type: 1 },
    { field_name: '首次回复时间', type: 5 },
    { field_name: '最后修改时间', type: 5 },
    { field_name: '备注', type: 1 },
  ];

  const existing = await client.bitable.appTableField.list({
    path: { app_token: appToken, table_id: tableId },
  });
  const existingNames = new Set((existing.data?.items || []).map(f => f.field_name));

  for (const field of fields) {
    if (!existingNames.has(field.field_name)) {
      await client.bitable.appTableField.create({
        path: { app_token: appToken, table_id: tableId },
        data: field,
      });
    }
  }
}

async function deleteDefaultFields(appToken, tableId) {
  try {
    const existing = await client.bitable.appTableField.list({
      path: { app_token: appToken, table_id: tableId },
    });
    const keep = new Set(['姓名', '是否参加', '报告主题', '首次回复时间', '最后修改时间', '备注']);
    for (const field of (existing.data?.items || [])) {
      if (!keep.has(field.field_name)) {
        await client.bitable.appTableField.delete({
          path: { app_token: appToken, table_id: tableId, field_id: field.field_id },
        });
      }
    }
  } catch (e) {
    // ignore cleanup errors
  }
}

async function insertRecords(appToken, tableId, replies, allMembers) {
  const records = [];

  for (const member of allMembers) {
    const reply = replies[member.openId];
    const fields = {
      '姓名': member.name,
      '是否参加': reply ? (reply.willing === 'yes' ? '参加' : '不参加') : '未回复',
      '报告主题': reply?.topic || '',
      '备注': reply?.notes || '',
    };
    if (reply?.firstReplyAt) {
      fields['首次回复时间'] = new Date(reply.firstReplyAt).getTime();
    }
    if (reply?.lastModifiedAt) {
      fields['最后修改时间'] = new Date(reply.lastModifiedAt).getTime();
    }
    records.push({ fields });
  }

  if (records.length === 0) return;

  const resp = await client.bitable.appTableRecord.batchCreate({
    path: { app_token: appToken, table_id: tableId },
    data: { records },
  });
  if (resp.code !== 0) {
    throw new Error(`写入记录失败: ${resp.msg}`);
  }
}

async function createWeeklyBitable(weekLabel, replies, allMembers) {
  const name = `AI 分享会 - ${weekLabel}`;
  const { appToken, url } = await createBitable(name);
  const tableId = await getDefaultTable(appToken);
  await deleteDefaultFields(appToken, tableId);
  await setupFields(appToken, tableId);
  await insertRecords(appToken, tableId, replies, allMembers);
  return url;
}

module.exports = { createWeeklyBitable };
