const fs = require("fs");
let s = fs.readFileSync("index.js", "utf8");
let log = [];

// ═══ 1) نحذف زر "مؤقت" من اللوحة ═══
const o1 = `\n  if (f.has("admin")) btns.push(new ButtonBuilder().setCustomId("panel_games_emoji").setLabel("مؤقت").setEmoji("🎮").setStyle(ButtonStyle.Primary));`;
if (s.includes(o1)) { s = s.replace(o1, ""); log.push("زر-مؤقت"); }

// ═══ 2) نحذف صلاحيات games من الخريطة ═══
const o2 = `panel_games_emoji:"admin", games_retry:"admin", games_add:"admin",`;
if (s.includes(o2)) { s = s.replace(o2, ""); log.push("صلاحيات"); }
else {
  const o2b = ` panel_games_emoji:"admin", games_retry:"admin", games_add:"admin",`;
  if (s.includes(o2b)) { s = s.replace(o2b, ""); log.push("صلاحيات"); }
  const o2c = `panel_games_emoji:"admin", games_retry:"admin", games_add:"admin", `;
  if (s.includes(o2c)) { s = s.replace(o2c, ""); log.push("صلاحيات"); }
}

// ═══ 3) نحذف GAMES_LIST و الدوال ═══
const blocks = [
  { start: "const GAMES_LIST = [", end: "const CATEGORY_HINTS" },
  { start: "function buildGameEmojiButtons", end: "function channelsMenuPanel" },
  { start: "async function sendGameEmojiPreview", end: "function channelsMenuPanel" },
  { start: "async function fetchGameEmojis", end: "function channelsMenuPanel" },
  { start: "async function searchGiphyLogo", end: "function channelsMenuPanel" },
  { start: "function buildGameEmojiPreview", end: "function channelsMenuPanel" },
  { start: "const LOGO_SOURCES", end: "const CATEGORY_HINTS" },
  { start: "const WIKI_TITLES", end: "const CATEGORY_HINTS" },
  { start: "const FALLBACK_EMOJI", end: "const CATEGORY_HINTS" },
];

for (const b of blocks) {
  const st = s.indexOf(b.start);
  if (st === -1) continue;
  // ندور أقرب نهاية قبل start
  const en = s.indexOf(b.end, st);
  if (en === -1 || en === st) continue;
  s = s.slice(0, st) + s.slice(en);
  log.push("حذف " + b.start.slice(0, 30));
}

// ═══ 4) نحذف معالجات الأزرار ═══
const handlers = [
  { name: "panel_games_emoji", next: '  if (id === "games_retry") {' },
  { name: "games_retry", next: '  if (id === "games_add") {' },
  { name: "games_add", next: '  if (id === "panel_add_roles") {' },
];

for (const h of handlers) {
  const st = s.indexOf('  if (id === "' + h.name + '") {');
  if (st === -1) continue;
  const en = s.indexOf(h.next, st);
  if (en === -1) continue;
  s = s.slice(0, st) + s.slice(en);
  log.push("حذف " + h.name);
}

// ═══ 5) نحذف أي بقايا ═══
s = s.replace(/\\n\\s*const FALLBACK_EMOJI = \\{[^}]*\\};?\\n/g, "");
s = s.replace(/\\n\\s*const LOGO_SOURCES = \\[[\\s\\S]*?\\];\\n/g, "");
s = s.replace(/\\n\\s*const WIKI_TITLES = \\{[\\s\\S]*?\\};\\n/g, "");

fs.writeFileSync("index.js", s);
console.log("✅ " + log.join(" | "));
