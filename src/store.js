const fs = require('fs');
const path = require('path');
const config = require('./config');

class Store {
  constructor() {
    this.file = path.join(config.dataDir, 'data.json');
    this.data = this._load();
    this.MAX_HISTORY = 20;
  }

  _load() {
    try {
      if (fs.existsSync(this.file)) {
        return JSON.parse(fs.readFileSync(this.file, 'utf-8'));
      }
    } catch (e) {
      console.error('读取数据文件失败:', e.message);
    }
    return {};
  }

  _save() {
    fs.mkdirSync(config.dataDir, { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
  }

  _weekKey() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }

  _ensureWeek() {
    const key = this._weekKey();
    if (!this.data.weeks) this.data.weeks = {};
    if (!this.data.weeks[key]) this.data.weeks[key] = {};
    return key;
  }

  // === 意愿记录 ===

  setReply(userId, userName, willing, topic, notes) {
    const week = this._ensureWeek();
    const existing = this.data.weeks[week][userId];
    const now = new Date().toISOString();

    this.data.weeks[week][userId] = {
      userId,
      userName,
      willing,
      topic: topic || '',
      notes: notes || '',
      firstReplyAt: existing ? existing.firstReplyAt : now,
      lastModifiedAt: now,
    };
    this._save();
  }

  getReplies() {
    const week = this._weekKey();
    return (this.data.weeks || {})[week] || {};
  }

  getMemberReply(userId) {
    const week = this._weekKey();
    return ((this.data.weeks || {})[week] || {})[userId] || null;
  }

  resetWeek() {
    const week = this._ensureWeek();
    this.data.weeks[week] = {};
    this._save();
  }

  // === 对话历史 ===

  getHistory(userId) {
    if (!this.data.history) this.data.history = {};
    return this.data.history[userId] || [];
  }

  appendHistory(userId, role, content) {
    if (!this.data.history) this.data.history = {};
    if (!this.data.history[userId]) this.data.history[userId] = [];

    this.data.history[userId].push({ role, content });

    if (this.data.history[userId].length > this.MAX_HISTORY * 2) {
      this.data.history[userId] = this.data.history[userId].slice(-this.MAX_HISTORY * 2);
    }
    this._save();
  }

  clearHistory(userId) {
    if (this.data.history) {
      delete this.data.history[userId];
      this._save();
    }
  }

  // === 查询辅助 ===

  getWeekSummary() {
    const replies = this.getReplies();
    const lines = [];
    for (const r of Object.values(replies)) {
      const status = r.willing === 'yes' ? '参加' : '不参加';
      lines.push(`${r.userName}: ${status}${r.topic ? `，主题「${r.topic}」` : ''}`);
    }
    return lines.length > 0 ? lines.join('\n') : '暂无回复';
  }
}

module.exports = new Store();
