const fs = require("fs");
let s = fs.readFileSync("index.js", "utf8");
let log = [];

// ═══ 1) في checkNotifications ═══
const o1 = `      const content = sub.customMessage || null;
      await ch.send({ content: content, embeds: [embed] }).catch(() => {});`;
const n1 = `      const content = buildNotifContent(sub);
      await ch.send({ content: content, embeds: [embed] }).catch(() => {});`;
if (s.includes(o1)) { s = s.replace(o1, n1); log.push("check"); }

// ═══ 2) في المراجعة الفورية ═══
const o2 = `              const content = sub.customMessage || null;
              await ch.send({ content: content, embeds: [emb] }).catch(() => {});`;
const n2 = `              const content = buildNotifContent(sub);
              await ch.send({ content: content, embeds: [emb] }).catch(() => {});`;
if (s.includes(o2)) { s = s.replace(o2, n2); log.push("check-now"); }

fs.writeFileSync("index.js", s);
console.log("✅ " + log.join(", ") + " (" + log.length + ")");
