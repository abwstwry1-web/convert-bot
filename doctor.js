require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits } = require("discord.js");

const GUILD_ID = "1515298513498542191";
const BOT_DIR = __dirname;

const COLORS = {
  reset: "\x1b[0m", red: "\x1b[31m", green: "\x1b[32m",
  yellow: "\x1b[33m", blue: "\x1b[34m", cyan: "\x1b[36m",
  gray: "\x1b[90m", bold: "\x1b[1m",
};

function ok(msg) { console.log(COLORS.green + "✅ " + msg + COLORS.reset); }
function bad(msg) { console.log(COLORS.red + "❌ " + msg + COLORS.reset); }
function warn(msg) { console.log(COLORS.yellow + "⚠️  " + msg + COLORS.reset); }
function info(msg) { console.log(COLORS.cyan + "ℹ️  " + msg + COLORS.reset); }
function title(msg) { console.log("\n" + COLORS.bold + COLORS.blue + "━━━ " + msg + " ━━━" + COLORS.reset); }
function sub(msg) { console.log(COLORS.gray + "   " + msg + COLORS.reset); }

const issues = [];

async function timeout(promise, ms, name) {
  let timer;
  const t = new Promise((_, rej) => { timer = setTimeout(() => rej(new Error("TIMEOUT")), ms); });
  try { return await Promise.race([promise, t]); }
  finally { clearTimeout(timer); }
}

async function main() {
  console.log(COLORS.bold + "\n🩺 فحص صحة البوت - Doctor\n" + COLORS.reset);

  // ═══════════ 1) الملفات ═══════════
  title("1) الملفات");

  const files = [
    { name: "index.js", min: 5000 },
    { name: "package.json", min: 100 },
    { name: ".env", min: 30 },
  ];

  for (const f of files) {
    const p = path.join(BOT_DIR, f.name);
    if (!fs.existsSync(p)) {
      bad(f.name + " — مو موجود");
      issues.push({ file: f.name, line: "-", problem: "الملف غير موجود" });
    } else {
      const size = fs.statSync(p).size;
      if (size < f.min) {
        warn(f.name + " — حجمه صغير (" + size + " بايت)");
        issues.push({ file: f.name, line: "-", problem: "حجم صغير: " + size });
      } else {
        ok(f.name + " (" + size + " بايت)");
      }
    }
  }

  const dataDir = path.join(BOT_DIR, "data");
  if (!fs.existsSync(dataDir)) {
    warn("data/ — مو موجود (راح ينشأ تلقائي)");
    fs.mkdirSync(dataDir, { recursive: true });
  } else {
    ok("data/ موجود");
  }

  // ═══════════ 2) المكتبات ═══════════
  title("2) المكتبات");

  const modules = ["discord.js", "dotenv"];
  for (const m of modules) {
    const p = path.join(BOT_DIR, "node_modules", m);
    if (fs.existsSync(p)) ok(m + " مثبتة");
    else {
      bad(m + " — مو مثبتة");
      issues.push({ file: "package.json", line: "-", problem: "المكتبة " + m + " ناقصة" });
    }
  }

  // ═══════════ 3) .env ═══════════
  title("3) الإعدادات (.env)");

  const envPath = path.join(BOT_DIR, ".env");
  if (!fs.existsSync(envPath)) {
    bad(".env مو موجود");
    issues.push({ file: ".env", line: "-", problem: "الملف غير موجود" });
  } else {
    const env = fs.readFileSync(envPath, "utf8").split("\n");
    let tokenLine = -1, ownerLine = -1, giphyLine = -1;
    env.forEach((l, i) => {
      if (l.startsWith("BOT_TOKEN=")) tokenLine = i + 1;
      if (l.startsWith("OWNER_ID=")) ownerLine = i + 1;
      if (l.startsWith("GIPHY_KEY=")) giphyLine = i + 1;
    });

    if (tokenLine === -1) {
      bad("BOT_TOKEN — مو موجود");
      issues.push({ file: ".env", line: "?", problem: "BOT_TOKEN ناقص" });
    } else if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN.length < 50) {
      bad("BOT_TOKEN — غلط (قصير)");
      issues.push({ file: ".env", line: tokenLine, problem: "التوكن قصير أو غلط" });
    } else {
      ok("BOT_TOKEN موجود (سطر " + tokenLine + ", طول " + process.env.BOT_TOKEN.length + ")");
    }

    if (ownerLine === -1) {
      bad("OWNER_ID — مو موجود");
    } else {
      ok("OWNER_ID = " + process.env.OWNER_ID + " (سطر " + ownerLine + ")");
    }

    if (giphyLine === -1) {
      warn("GIPHY_KEY — مو موجود (البحث ما يشتغل)");
    } else if (!process.env.GIPHY_KEY || process.env.GIPHY_KEY.length < 10) {
      bad("GIPHY_KEY — غلط (سطر " + giphyLine + ")");
      issues.push({ file: ".env", line: giphyLine, problem: "GIPHY_KEY غلط" });
    } else {
      ok("GIPHY_KEY موجود (سطر " + giphyLine + ", طول " + process.env.GIPHY_KEY.length + ")");
    }
  }

  // ═══════════ 4) صياغة index.js ═══════════
  title("4) صياغة index.js");

  try {
    const { execSync } = require("child_process");
    execSync("node -c " + path.join(BOT_DIR, "index.js"), { stdio: "pipe" });
    ok("ماكو أخطاء صياغة");
  } catch (e) {
    bad("خطأ صياغة في index.js:");
    sub(e.stderr ? e.stderr.toString().split("\n").slice(0, 3).join("\n   ") : e.message);
    issues.push({ file: "index.js", line: "?", problem: "خطأ صياغة" });
  }

  // ═══════════ 5) الاتصال بديسكورد ═══════════
  title("5) الاتصال بديسكورد");

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  let connected = false;
  try {
    await timeout(new Promise((res, rej) => {
      client.once("clientReady", res);
      client.once("ready", res);
      client.once("error", rej);
      client.login(process.env.BOT_TOKEN).catch(rej);
    }), 15000, "login");
    connected = true;
    ok("اتصال ناجح — " + client.user.tag);
  } catch (e) {
    bad("فشل الاتصال: " + e.message);
    if (e.message === "TIMEOUT") {
      sub("→ يمكن الشبكة تحجب Discord، جرب VPN");
      issues.push({ file: "الشبكة", line: "-", problem: "Discord API ما يرد — جرب VPN" });
    } else if (e.message.includes("token")) {
      sub("→ التوكن غلط، تأكد من .env");
      issues.push({ file: ".env", line: "BOT_TOKEN", problem: "التوكن غلط" });
    }
    process.exit(1);
  }

  // ═══════════ 6) السيرفر ═══════════
  title("6) السيرفر");

  let guild;
  try {
    guild = await timeout(client.guilds.fetch(GUILD_ID), 8000, "fetch guild");
    ok("وصلنا: " + guild.name);
  } catch (e) {
    bad("ما وصلنا للسيرفر: " + e.message);
    sub("→ تأكد من GUILD_ID بالكود: " + GUILD_ID);
    issues.push({ file: "index.js", line: "GUILD_ID", problem: "السيرفر غير موجود أو البوت مو عضو فيه" });
    process.exit(1);
  }

  // ═══════════ 7) صلاحيات البوت ═══════════
  title("7) صلاحيات البوت");

  const me = await guild.members.fetchMe();
  const perms = [
    { name: "ManageExpressions", needed: true },
    { name: "ManageRoles", needed: false },
    { name: "SendMessages", needed: true },
    { name: "AttachFiles", needed: true },
    { name: "EmbedLinks", needed: true },
  ];

  for (const p of perms) {
    if (me.permissions.has(p.name)) ok(p.name);
    else {
      if (p.needed) {
        bad(p.name + " — ناقصة (مهمة!)");
        issues.push({ file: "Discord Roles", line: "-", problem: "صلاحية ناقصة: " + p.name });
      } else warn(p.name + " — ناقصة");
    }
  }

  // ═══════════ 8) الإيموجيات ═══════════
  title("8) الإيموجيات");

  await guild.emojis.fetch().catch(() => {});
  const tier = guild.premiumTier;
  const limits = { 0: 50, 1: 100, 2: 150, 3: 250 };
  const max = limits[tier] ?? 50;
  const current = guild.emojis.cache.size;

  info("عدد الحالي: " + current + " / " + max + " (مستوى " + tier + ")");
  const free = max - current;
  if (free > 0) ok("عندك " + free + " خانة فاضية");
  else {
    bad("الخزنة ممتلئة!");
    issues.push({ file: "السيرفر", line: "-", problem: "خزنة الإيموجي ممتلئة" });
  }

  // ═══════════ 9) اختبار إضافة إيموجي ═══════════
  title("9) اختبار إضافة إيموجي");

  const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const startTime = Date.now();
  try {
    const em = await timeout(guild.emojis.create({
      attachment: tinyPng,
      name: "doctor_" + Date.now(),
    }), 20000, "create emoji");
    const dur = Date.now() - startTime;
    ok("نجح! (" + dur + "ms)");
    await em.delete().catch(() => {});
    ok("حُذف الاختبار");
  } catch (e) {
    const dur = Date.now() - startTime;
    if (e.message === "TIMEOUT") {
      bad("معلّق! ما رد خلال 20 ثانية");
      sub("→ السبب: Rate Limit من ديسكورد");
      sub("→ الحل: انتظر 2-4 ساعات بدون محاولات");
      issues.push({ file: "Discord Rate Limit", line: "-", problem: "البوت محظور مؤقتاً من إنشاء إيموجي" });
    } else {
      bad("فشل: " + e.message);
      if (e.code === 50035) {
        sub("→ الحجم أو الصيغة مرفوضة");
        issues.push({ file: "Discord API", line: "-", problem: "الحجم/الصيغة مرفوضة" });
      } else {
        issues.push({ file: "Discord API", line: "-", problem: e.message });
      }
    }
  }

  // ═══════════ 10) Giphy ═══════════
  title("10) Giphy API");

  if (!process.env.GIPHY_KEY) {
    warn("GIPHY_KEY مو موجود — نتخطى");
  } else {
    try {
      const r = await timeout(fetch("https://api.giphy.com/v1/gifs/trending?api_key=" + process.env.GIPHY_KEY + "&limit=1"), 10000, "giphy");
      const j = await r.json();
      if (j.data && j.data.length) ok("Giphy شغال");
      else {
        bad("Giphy رد غلط");
        issues.push({ file: "Giphy", line: "-", problem: "GIPHY_KEY غلط أو منتهي" });
      }
    } catch (e) {
      bad("Giphy: " + e.message);
      issues.push({ file: "Giphy", line: "-", problem: e.message });
    }
  }

  // ═══════════ 11) الترجمة ═══════════
  title("11) خدمة الترجمة (MyMemory)");

  try {
    const r = await timeout(fetch("https://api.mymemory.translated.net/get?q=cat&langpair=en|ar"), 8000, "translate");
    const j = await r.json();
    if (j.responseData && j.responseData.translatedText) ok("الترجمة شغالة: cat → " + j.responseData.translatedText);
    else warn("الترجمة رد غلط");
  } catch (e) {
    warn("الترجمة: " + e.message + " (مو مشكلة كبيرة)");
  }

  // ═══════════ الملخص ═══════════
  title("📊 الملخص");

  if (issues.length === 0) {
    console.log(COLORS.green + COLORS.bold + "\n🎉 كل شي تمام! ماكو مشاكل.\n" + COLORS.reset);
  } else {
    console.log(COLORS.red + COLORS.bold + "\n⚠️ عدد المشاكل: " + issues.length + "\n" + COLORS.reset);
    issues.forEach((iss, i) => {
      console.log(COLORS.bold + (i + 1) + ". " + COLORS.reset + COLORS.cyan + iss.file + COLORS.reset +
        (iss.line !== "-" ? " (سطر " + iss.line + ")" : "") + ": " + iss.problem);
    });
    console.log("");
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(COLORS.red + "\n💥 خطأ غير متوقع: " + e.message + COLORS.reset);
  console.error(e.stack);
  process.exit(1);
});
