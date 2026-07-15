const config = require('../config');

class LLMClient {
  constructor() {
    this.baseUrl = config.llm.baseUrl;
    this.apiKey = config.llm.apiKey;
    this.model = config.llm.model;
  }

  async chat(messages, tools = null) {
    const body = {
      model: this.model,
      messages,
    };
    if (tools && tools.length > 0) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }

    const resp = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`LLM API error ${resp.status}: ${errText}`);
    }

    const data = await resp.json();
    return data.choices[0].message;
  }

  async chatWithTools(messages, tools) {
    const message = await this.chat(messages, tools);

    if (message.tool_calls && message.tool_calls.length > 0) {
      const results = [];
      for (const call of message.tool_calls) {
        results.push({
          name: call.function.name,
          args: JSON.parse(call.function.arguments),
        });
      }
      return { type: 'tool_calls', toolCalls: results, content: message.content };
    }

    return { type: 'text', content: message.content };
  }

  async simpleChat(userMessage, systemPrompt = '') {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userMessage });
    const result = await this.chat(messages);
    return result.content;
  }
}

module.exports = new LLMClient();
