const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "data");
const LOG_FILE = path.join(LOG_DIR, "events.jsonl");
const MAX_LINES = 500;

function ensureDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function log(level, category, message, meta) {
  ensureDir();
  const entry = {
    t: new Date().toISOString(),
    level,
    cat: category,
    msg: message,
    meta: meta || null,
  };
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
    // نقلم الملف إذا صار كبير
    const content = fs.readFileSync(LOG_FILE, "utf8").split("\n").filter(Boolean);
    if (content.length > MAX_LINES) {
      fs.writeFileSync(LOG_FILE, content.slice(-MAX_LINES).join("\n") + "\n");
    }
  } catch (e) {}
}

module.exports = {
  info: (c, m, meta) => log("info", c, m, meta),
  warn: (c, m, meta) => log("warn", c, m, meta),
  error: (c, m, meta) => log("error", c, m, meta),
  read: () => {
    try {
      if (!fs.existsSync(LOG_FILE)) return [];
      return fs.readFileSync(LOG_FILE, "utf8").split("\n").filter(Boolean).map((l) => {
        try { return JSON.parse(l); } catch { return null; }
      }).filter(Boolean);
    } catch { return []; }
  },
  clear: () => { try { fs.writeFileSync(LOG_FILE, ""); } catch {} },
};
