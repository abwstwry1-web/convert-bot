const fs = require("fs");
let s = fs.readFileSync("index.js", "utf8");
let log = [];

// ═══ 1) في السكرابر الأصلي ═══
const o1 = `      await ch.send({ embeds: [embed] }).catch(() => {});`;
const n1 = `      const content = sub.customMessage || null;
      await ch.send({ content: content, embeds: [embed] }).catch(() => {});`;
if (s.includes(o1)) { s = s.replace(o1, n1); log.push("main"); }

// ═══ 2) في المراجعة الفورية ═══
const o2 = `              await ch.send({ embeds: [emb] }).catch(() => {});`;
const n2 = `              const content = sub.customMessage || null;
              await ch.send({ content: content, embeds: [emb] }).catch(() => {});`;
if (s.includes(o2)) { s = s.replace(o2, n2); log.push("checknow"); }

// ═══ 3) نتأكد ما بقى محتوى قديم ═══
s = s.replace(/await ch\.send\(\{ content: isLive \? "[^"]*" : "[^"]*", embeds: \[embed\] \}\)\.catch\(\(\) => \{\}\);/g,
  'await ch.send({ content: sub.customMessage || null, embeds: [embed] }).catch(() => {});');

s = s.replace(/await ch\.send\(\{\s*content: isLive \? "[^"]*" : "[^"]*",\s*embeds: \[emb\],\s*\}\)\.catch\(\(\) => \{\}\);/g,
  'await ch.send({ content: sub.customMessage || null, embeds: [emb] }).catch(() => {});');

fs.writeFileSync("index.js", s);
console.log("✅ " + log.join(", ") + " (" + log.length + ")");
