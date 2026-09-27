require("dotenv").config();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const GUILD_ID = "1515298513498542191";
const OWNER_ID = process.env.OWNER_ID;
const DIR = __dirname;

const problems = [];
const results = [];
const ok = (m) => results.push("✅ " + m);
const warn = (m) => results.push("⚠️ " + m);
const bad = (m) => { results.push("❌ " + m); problems.push(m); };
const crit = (m) => { results.push("🔥 " + m); problems.push(m); };
const kv = (k, v) => results.push("   " + k + ": " + v);
const h1 = (m) => results.push("\n━━━ " + m + " ━━━");

function timeout(p, ms) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), ms))]);
}

async function runDiag() {
  h1("1) النظام");
  kv("Node", process.version);
  kv("منصة", os.platform() + " " + os.arch());
  kv("ذاكرة حرة", Math.round(os.freemem() / 1024 / 1024) + " MB");

  h1("2) الملفات");
  for (const f of [{ n: "index.js", min: 5000 }, { n: "package.json", min: 100 }, { n: ".env", min: 30 }]) {
    const p = path.join(DIR, f.n);
    if (!fs.existsSync(p)) { bad(f.n + " غير موجود"); continue; }
    const s = fs.statSync(p);
    const h = crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex").slice(0, 8);
    ok(f.n + " [" + s.size + "b | md5:" + h + "]");
  }

  h1("3) الإعدادات");
  process.env.BOT_TOKEN && process.env.BOT_TOKEN.length > 60 ? ok("BOT_TOKEN") : crit("BOT_TOKEN غلط");
  process.env.OWNER_ID && /^\d{17,20}$/.test(process.env.OWNER_ID) ? ok("OWNER_ID = " + process.env.OWNER_ID) : warn("OWNER_ID غلط");
  process.env.GIPHY_KEY ? ok("GIPHY_KEY") : warn("GIPHY_KEY ناقص");

  h1("4) المكتبات");
  for (const m of ["discord.js", "dotenv"]) {
    fs.existsSync(path.join(DIR, "node_modules", m)) ? ok(m) : crit(m + " ناقصة");
  }

  h1("5) صياغة الكود");
  try {
    require("child_process").execSync("node -c " + path.join(DIR, "index.js"), { stdio: "pipe" });
    ok("ماكو أخطاء صياغة");
  } catch (e) {
    crit("خطأ صياغة!");
    if (e.stderr) results.push(e.stderr.toString().split("\n").slice(0, 3).join("\n"));
  }

  h1("6) الوظائف");
  const code = fs.readFileSync(path.join(DIR, "index.js"), "utf8");
  for (const fn of ["mainPanel", "checkFeature", "handleConvert", "searchGiphy", "fetchGameEmojis"]) {
    (code.includes("function " + fn) || code.includes("async function " + fn)) ? ok(fn) : warn(fn + " ناقصة");
  }
  for (const hd of ["panel_convert", "panel_stickers_menu", "panel_giphy", "panel_add_member", "panel_add_roles", "panel_games_emoji"]) {
    code.includes('"' + hd + '"') ? ok(hd) : warn(hd + " مو موجود");
  }

  h1("7) الشبكة");
  for (const t of [
    { n: "Discord", u: "https://discord.com/api/v10/gateway" },
    { n: "Giphy", u: "https://api.giphy.com/v1/gifs/trending?api_key=" + (process.env.GIPHY_KEY || "x") + "&limit=1" },
    { n: "Wikipedia", u: "https://en.wikipedia.org/w/api.php?action=query&format=json&titles=Test" },
    { n: "wsrv.nl", u: "https://wsrv.nl/?url=https://google.com/favicon.ico&w=32" },
  ]) {
    const t0 = Date.now();
    try {
      const r = await timeout(fetch(t.u), 8000);
      (r.ok || r.status < 500) ? ok(t.n + " (" + (Date.now() - t0) + "ms)") : warn(t.n + " رد " + r.status);
    } catch (e) { bad(t.n + ": " + e.message); }
  }

  h1("8) الاتصال بديسكورد");
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  try {
    await timeout(new Promise((res, rej) => {
      client.once("clientReady", res);
      client.once("ready", res);
      client.once("error", rej);
      client.login(process.env.BOT_TOKEN).catch(rej);
    }), 15000);
    ok("موصول — " + client.user.tag);
  } catch (e) {
    crit("فشل الاتصال: " + e.message);
    return { client: null, guild: null };
  }

  h1("9) السيرفر");
  let guild;
  try {
    guild = await timeout(client.guilds.fetch(GUILD_ID), 8000);
    ok("وصلنا: " + guild.name);
    kv("الأعضاء", guild.memberCount);
    kv("المستوى", "Tier " + guild.premiumTier);
  } catch (e) {
    crit("ما وصلنا: " + e.message);
    return { client, guild: null };
  }

  h1("10) الصلاحيات");
  await guild.members.fetchMe();
  const me = guild.members.me;
  for (const p of ["ManageExpressions", "ManageRoles", "SendMessages", "AttachFiles", "EmbedLinks"]) {
    me.permissions.has(p) ? ok(p) : warn(p + " ناقصة");
  }

  h1("11) الإيموجيات");
  await Promise.all([guild.emojis.fetch().catch(() => {}), guild.stickers.fetch().catch(() => {})]);
  const lim = { 0: 50, 1: 100, 2: 150, 3: 250 };
  const free = (lim[guild.premiumTier] || 50) - guild.emojis.cache.size;
  kv("إيموجيات", guild.emojis.cache.size + " / " + (lim[guild.premiumTier] || 50));
  kv("ملصقات", guild.stickers.cache.size);
  free > 0 ? ok(free + " خانة فاضية") : crit("الخزنة ممتلئة!");

  h1("12) اختبار إنشاء إيموجي");
  const t0 = Date.now();
  let rateLimited = false;
  try {
    const em = await timeout(guild.emojis.create({
      attachment: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      name: "diag_" + Date.now(),
    }), 15000);
    ok("الإضافة شغالة (" + (Date.now() - t0) + "ms)");
    await em.delete().catch(() => {});
    ok("حُذف الاختبار");
  } catch (e) {
    rateLimited = true;
    if (e.message === "TIMEOUT") {
      crit("محظور (Rate Limit)");
      results.push("   → انتظر 2-6 ساعات بدون محاولات إضافة");
    } else bad("فشل: " + e.message);
  }

  h1("13) Giphy");
  if (!process.env.GIPHY_KEY) warn("ماكو مفتاح");
  else {
    try {
      const r = await timeout(fetch("https://api.giphy.com/v1/gifs/trending?api_key=" + process.env.GIPHY_KEY + "&limit=1"), 8000);
      const j = await r.json();
      j.data && j.data.length ? ok("شغال") : bad("مفتاح غلط");
    } catch (e) { bad(e.message); }
  }

  h1("14) الترجمة");
  try {
    const r = await timeout(fetch("https://api.mymemory.translated.net/get?q=cat&langpair=en|ar"), 8000);
    const j = await r.json();
    j.responseData && j.responseData.translatedText ? ok("شغالة: cat → " + j.responseData.translatedText) : warn("رد غلط");
  } catch (e) { warn(e.message); }

  return { client, guild, rateLimited };
}

async function main() {
  console.log("\n🩺 جاري الفحص...\n");
  const { client, guild, rateLimited } = await runDiag();

  const summary = [
    "═══ تقرير MRBOT Doctor ═══",
    "التاريخ: " + new Date().toLocaleString("ar"),
    "السيرفر: " + (guild ? guild.name + " (" + GUILD_ID + ")" : "غير معروف"),
    "الحالة: " + (problems.length === 0 ? "🟢 ممتاز" : "⚠️ " + problems.length + " مشكلة"),
    rateLimited ? "⚠️ Rate Limit: نعم" : "✅ Rate Limit: لا",
    "",
    results.join("\n"),
    "",
    "═══ المشاكل ═══",
    problems.length === 0 ? "✅ ماكو مشاكل" : problems.map((p, i) => (i + 1) + ". " + p).join("\n"),
  ].join("\n");

  fs.writeFileSync(path.join(DIR, "diag-report.txt"), summary);

  console.log(summary);

  // ندز للخاص
  if (client && guild) {
    try {
      const user = await client.users.fetch(OWNER_ID);
      const dm = await user.createDM();
      const color = problems.length === 0 ? 0x57f287 : 0xffaa00;

      const embeds = [
        new EmbedBuilder()
          .setColor(color)
          .setTitle("🩺 تقرير الفحص")
          .setDescription(
            "🏠 **" + guild.name + "**\n" +
            "🕐 " + new Date().toLocaleString("ar") + "\n\n" +
            (problems.length === 0 ? "🎉 **كل شي تمام!**" : "⚠️ **" + problems.length + " مشكلة**")
          )
          .setFooter({ text: "MRBOT Doctor" })
          .setTimestamp(),
      ];

      const chunks = [];
      const lines = results.join("\n").split("\n");
      for (let i = 0; i < lines.length; i += 30) {
        const c = lines.slice(i, i + 30).join("\n");
        if (c.trim()) chunks.push(c);
      }
      for (const c of chunks.slice(0, 8)) {
        embeds.push(new EmbedBuilder().setColor(0x5865f2).setDescription(c.slice(0, 4000)));
      }

      if (problems.length > 0) {
        embeds.push(new EmbedBuilder().setColor(0xff6b6b).setTitle("🔥 المشاكل")
          .setDescription(problems.map((p, i) => (i + 1) + ". " + p).join("\n").slice(0, 3900)));
      }

      for (let i = 0; i < embeds.length; i += 10) {
        await dm.send({ embeds: embeds.slice(i, i + 10) });
        await new Promise((r) => setTimeout(r, 400));
      }
      console.log("\n📩 التقرير وصل للخاص في ديسكورد ✅");
    } catch (e) {
      console.log("\n⚠️ ما كدرت ادز للخاص: " + e.message);
    }
  }

  process.exit(0);
}

main().catch((e) => {
  console.log("💥 خطأ: " + e.message);
  process.exit(1);
});
