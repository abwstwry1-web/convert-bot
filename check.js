require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits } = require("discord.js");

const GUILD_ID = "1515298513498542191";
const ONB_FILE = path.join(__dirname, "data", "onboarding.json");

console.log("=== فحص 1: ملف الأسئلة ===");
if (fs.existsSync(ONB_FILE)) {
  const data = JSON.parse(fs.readFileSync(ONB_FILE, "utf8"));
  console.log("✅ الملف موجود");
  console.log("   الحالة:", data.enabled ? "🟢 مفعّل" : "🔴 مطفي");
  console.log("   عدد الأسئلة:", data.questions?.length || 0);
  if (data.questions?.length) {
    data.questions.forEach((q, i) => {
      console.log("   " + (i + 1) + ". " + q.text + " (" + q.options.length + " خيارات)");
    });
  }
} else {
  console.log("❌ الملف مو موجود: " + ONB_FILE);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", async () => {
  console.log("");
  console.log("=== فحص 2: البوت ===");
  console.log("✅ شغال:", client.user.tag);

  const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
  if (!guild) { console.log("❌ ما كدرت اجيب السيرفر"); return process.exit(1); }

  console.log("");
  console.log("=== فحص 3: صلاحيات ===");
  const me = await guild.members.fetchMe();
  console.log("ManageRoles:", me.permissions.has("ManageRoles") ? "✅" : "❌");
  console.log("ManageGuild:", me.permissions.has("ManageGuild") ? "✅" : "❌");

  // فحص موقع الدور
  const botHighest = me.roles.highest.position;
  const roles = guild.roles.cache.sort((a, b) => b.position - a.position);
  console.log("");
  console.log("=== فحص 4: موقع دور البوت ===");
  console.log("أعلى دور للبوت: " + me.roles.highest.name + " (position: " + botHighest + ")");
  console.log("أعلى 5 أدوار بالسيرفر:");
  roles.slice(0, 5).forEach((r) => {
    const marker = r.position >= botHighest ? " ⚠️ فوق البوت" : "";
    console.log("   " + r.position + " — " + r.name + marker);
  });

  console.log("");
  console.log("=== فحص 5: الأعضاء الجدد ===");
  const members = await guild.members.fetch();
  const recent = members.filter((m) => !m.user.bot)
    .sort((a, b) => (b.joinedTimestamp || 0) - (a.joinedTimestamp || 0))
    .first(5);
  recent.forEach((m) => {
    const t = new Date(m.joinedTimestamp).toLocaleString("ar");
    console.log("   " + m.user.tag + " — دخل: " + t);
  });

  process.exit(0);
});

client.login(process.env.BOT_TOKEN);
