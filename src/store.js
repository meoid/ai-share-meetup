const fs = require('fs');
const path = require('path');
const config = require('./config');

class Store {
  constructor() {
    this.file = path.join(config.dataDir, 'replies.json');
    this.data = this._load();
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
    if (!this.data[key]) {
      this.data[key] = {};
    }
    return key;
  }

  setReply(userId, userName, willing, topic, notes) {
    const week = this._ensureWeek();
    const existing = this.data[week][userId];
    const now = new Date().toISOString();

    this.data[week][userId] = {
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
    return this.data[week] || {};
  }

  getMemberReply(userId) {
    const week = this._weekKey();
    return (this.data[week] || {})[userId] || null;
  }

  resetWeek() {
    const week = this._ensureWeek();
    this.data[week] = {};
    this._save();
  }

  getAllWeekData() {
    return this.data;
  }
}

module.exports = new Store();
