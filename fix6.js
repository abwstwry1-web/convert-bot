const fs = require("fs");
let s = fs.readFileSync("index.js", "utf8");

if (s.includes("async function checkNotifications")) {
  console.log("✅ موجود");
  process.exit(0);
}

const anchor = "async function updateLiveMatches() {";
if (!s.includes(anchor)) { console.log("❌"); process.exit(1); }

const H = `async function checkNotifications() {
  if (!notifData.subs || !notifData.subs.length) return;
  console.log("📢 فحص الإشعارات (" + notifData.subs.length + ")...");

  for (const sub of notifData.subs) {
    try {
      const result = await checkPlatform(sub.platform, sub.username);
      if (!result) continue;

      // إذا جديد
      if (sub.lastContentId && sub.lastContentId === result.id) continue;
      if (!sub.lastContentId) {
        sub.lastContentId = result.id;
        saveNotifData();
        continue;
      }

      sub.lastContentId = result.id;
      saveNotifData();

      const p = getPlatform(sub.platform);
      const guild = client.guilds.cache.get(GUILD_ID);
      if (!guild) continue;
      const ch = guild.channels.cache.get(sub.channelId) || await guild.channels.fetch(sub.channelId).catch(() => null);
      if (!ch) continue;

      const isLive = result.type === "live";
      const embed = new EmbedBuilder()
        .setColor(p ? p.color : 0x5865f2)
        .setAuthor({ name: (p ? p.emoji + " " + p.name : "منصة") + " • " + (isLive ? "بث مباشر" : "محتوى جديد") })
        .setTitle((isLive ? "🔴 مباشر الآن! " : "🎬 ") + result.title.slice(0, 200))
        .setURL(result.url)
        .setDescription(
          "**" + (p ? p.emoji : "") + " " + result.channelName + "**\\n\\n" +
          (isLive && result.game ? "🎮 **اللعبة:** " + result.game + "\\n" : "") +
          (isLive && result.viewers ? "👁️ **المشاهدين:** " + result.viewers + "\\n" : "") +
          "\\n" + (isLive ? "**[🎥 ادخل للبث](" + result.url + ")**" : "**[▶️ شاهد الفيديو](" + result.url + ")**")
        )
        .setFooter({ text: "MRBOT Notifications" })
        .setTimestamp();

      await ch.send({ content: isLive ? "🔴 **@" + sub.username + " بدأ البث!**" : "🎬 **@" + sub.username + " نشر محتوى جديد!**", embeds: [embed] }).catch(() => {});
      console.log("✅ أرسلت إشعار: " + sub.username + " (" + sub.platform + ")");
    } catch (e) {
      console.log("notif err [" + sub.username + "]: " + e.message);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

async function updateLiveMatches() {`;

s = s.replace(anchor, H);
fs.writeFileSync("index.js", s);
console.log("✅ أضفت checkNotifications");
