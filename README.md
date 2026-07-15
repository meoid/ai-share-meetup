# AI 分享会飞书助手

飞书机器人，自动管理每周 AI 分享会的收集与汇总流程。

## 功能

- **周一 10:00** — 私聊群成员，收集参加意愿和报告主题
- **周二 15:00** — 汇总回复到飞书多维表格，发送给管理员
- **全程 LLM 对话** — 用户私聊机器人时，LLM 理解意图、自然回复、自动记录意愿和主题
- **多轮对话** — 每个用户独立上下文，支持随时修改回复
- **💭 思考指示器** — LLM 处理时显示"思考中"卡片，完成后替换为回复

## 架构

```
本地开发 (百炼 Qwen API)  ──push──→  GitHub  ←──pull──  公司部署 (Ollama Hermes)
```

LLM 后端使用 OpenAI 兼容 API，通过环境变量切换，无需改代码。

## 快速开始

```bash
npm install
cp .env.example .env   # 编辑 .env 填入凭证
npm start
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `FEISHU_APP_ID` | 飞书应用 App ID |
| `FEISHU_APP_SECRET` | 飞书应用 App Secret |
| `TARGET_CHAT_ID` | 目标群聊 ID（`oc_xxx`） |
| `ADMIN_OPEN_ID` | 管理员 open_id（接收汇总卡片） |
| `LLM_BASE_URL` | LLM API 地址 |
| `LLM_API_KEY` | LLM API Key |
| `LLM_MODEL` | 模型名称 |

### 开发环境（百炼 Qwen）

```bash
LLM_BASE_URL=https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
LLM_API_KEY=sk-xxx
LLM_MODEL=qwen3.7-max
```

### 生产环境（Ollama Hermes）

```bash
LLM_BASE_URL=http://localhost:11434/v1
LLM_API_KEY=ollama
LLM_MODEL=hermes3
```

## 飞书应用配置

### 权限

- `im:message` / `im:message:send_as_bot` — 消息收发
- `im:chat` — 获取群信息和成员
- `im:resource` — 资源访问
- `bitable:app` — 多维表格操作

### 事件订阅

- `im.message.receive_v1` — 接收用户消息
- 订阅方式：长连接（WebSocket）

## 项目结构

```
src/
├── index.js              # 入口：WebSocket 连接 + 调度器
├── config.js             # 环境变量配置
├── store.js              # JSON 数据存储（意愿记录 + 对话历史）
├── test.js               # LLM function calling 测试脚本
├── llm/
│   ├── client.js         # LLM 客户端（OpenAI 兼容 API）
│   └── skills.js         # Function calling 定义 + System Prompt
├── feishu/
│   ├── client.js         # 飞书 API 封装（消息、成员、typing card）
│   └── bitable.js        # 多维表格创建与写入
├── skills/
│   ├── collect.js        # 周一收集（私聊群成员）
│   ├── summarize.js      # 周二汇总（建多维表格 + 发卡片）
│   └── handleReply.js    # LLM 对话处理（意图解析 + 自然回复）
└── scheduler/
    └── index.js          # 定时任务（node-cron）
```
