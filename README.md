# AI 分享会飞书助手

飞书机器人，自动管理每周 AI 分享会的全流程。

## 功能

- **周一 10:00** — 私聊群成员，收集参加意愿和报告主题
- **周三 15:00** — 汇总回复到飞书多维表格，发送给管理员
- **周四 14:00** — 群聊发送分享会提醒
- **实时** — 监听私聊回复，用 LLM 解析用户意图（支持随时修改）

## 架构

```
本地开发 (Qwen API)  ──push──→  GitHub  ←──pull──  公司部署 (Ollama Hermes)
```

LLM 后端使用 OpenAI 兼容 API，通过环境变量切换：
- **开发环境**：百炼 Qwen API
- **生产环境**：Ollama Hermes

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入飞书应用凭证和 LLM 配置

# 启动
npm start
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `FEISHU_APP_ID` | 飞书应用 App ID |
| `FEISHU_APP_SECRET` | 飞书应用 App Secret |
| `TARGET_CHAT_ID` | 目标群聊 ID |
| `ADMIN_OPEN_ID` | 管理员 open_id（接收汇总） |
| `LLM_BASE_URL` | LLM API 地址 |
| `LLM_API_KEY` | LLM API Key |
| `LLM_MODEL` | 模型名称 |

## 飞书应用权限

- `im:message` / `im:message:send_as_bot` — 消息收发
- `im:chat` — 获取群信息和成员
- `im:resource` — 资源访问
- `bitable:app` — 多维表格操作
- 事件订阅：`im.message.receive_v1`、`card.action.trigger`

## 项目结构

```
src/
├── index.js          # 入口：WebSocket + 调度器
├── config.js         # 配置
├── store.js          # JSON 数据存储
├── llm/
│   ├── client.js     # LLM 客户端（OpenAI 兼容）
│   └── skills.js     # Function calling 定义
├── feishu/
│   ├── client.js     # 飞书 API 封装
│   ├── bitable.js    # 多维表格操作
│   └── cards.js      # 消息卡片模板
├── skills/
│   ├── collect.js    # 周一收集
│   ├── summarize.js  # 周三汇总
│   ├── remind.js     # 周四提醒
│   └── handleReply.js # 回复解析（LLM skill）
└── scheduler/
    └── index.js      # 定时任务
```
