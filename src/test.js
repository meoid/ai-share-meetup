require('dotenv').config();
const llm = require('./llm/client');
const { SKILLS, SYSTEM_PROMPT } = require('./llm/skills');
const config = require('./config');

async function testLLM() {
  console.log(`测试 LLM 连接: ${config.llm.model} @ ${config.llm.baseUrl}\n`);

  const testReplies = [
    '好的，我这周分享 RAG 检索优化的实践',
    '这次就不参加了，太忙了',
    '来！主题还没想好，先报个名',
    '我今天请假了',
    '可以参加，讲讲 AI Agent 在企业落地的案例',
  ];

  for (const reply of testReplies) {
    console.log(`用户回复: "${reply}"`);
    try {
      const result = await llm.chatWithTools(
        [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: reply },
        ],
        SKILLS
      );

      if (result.type === 'tool_calls') {
        for (const call of result.toolCalls) {
          console.log(`  → ${call.name}:`, JSON.stringify(call.args));
        }
      } else {
        console.log(`  → 文本回复: ${result.content}`);
      }
    } catch (e) {
      console.error(`  → 错误: ${e.message}`);
    }
    console.log();
  }
}

testLLM();
