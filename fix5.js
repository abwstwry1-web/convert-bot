const fs = require("fs");
let s = fs.readFileSync("index.js", "utf8");

if (s.includes('notif_username"')) {
  console.log("✅ موجود");
  process.exit(0);
}

const anchor = "    // ---- Giphy: اسم البحث ----";
if (!s.includes(anchor)) { console.log("❌ ما لكيت anchor"); process.exit(1); }

const H = `    // ═══ الإشعارات: استقبال اسم المستخدم ═══
    if (ps && ps.mode === "notif_username") {
      const uname = txt.trim().replace(/^@/, "");
      if (uname.length < 2) return message.reply("✍️ اكتب اسم مستخدم صحيح");
      ps.notifUsername = uname;
      ps.mode = "notif_channel";
      sessions.set(uid, ps);

      const p = getPlatform(ps.platform);
      const e = buildPanelEmbed({
        icon: p.emoji,
        title: "اختر الروم",
        color: p.color,
        description:
          "### " + p.emoji + " " + p.name + " • **" + uname + "**\\n" +
          "> **اكتب ID الروم** اللي يرسل فيه الإشعار\\n" +
          "> اضغط يمين على الروم → Copy Channel ID\\n\\u200b",
        thumbnail: false,
      });
      return message.reply({ embeds: [e] });
    }

    // ═══ الإشعارات: استقبال ID الروم ═══
    if (ps && ps.mode === "notif_channel") {
      const cid = txt.replace(/[^0-9]/g, "");
      if (!/^\\d{17,20}$/.test(cid)) return message.reply("✍️ اكتب ID روم صحيح (17-20 رقم)");
      let guild = client.guilds.cache.get(GUILD_ID);
      if (!guild) guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
      if (!guild) return message.reply("❌ ما كدرت اوصل للسيرفر");
      const ch = guild.channels.cache.get(cid) || await guild.channels.fetch(cid).catch(() => null);
      if (!ch) return message.reply("❌ ما لكيت هذا الروم");

      // نتحقق أن المستخدم موجود
      const wait = await message.reply("⏳ جاري التحقق من الحساب...");
      const testResult = await checkPlatform(ps.platform, ps.notifUsername);
      const p = getPlatform(ps.platform);

      // نضيف الاشتراك (حتى لو ما كان نشط الآن — نراقبه مستقبل)
      const newSub = {
        id: "sub_" + Date.now(),
        platform: ps.platform,
        username: ps.notifUsername,
        channelId: cid,
        lastContentId: testResult ? testResult.id : null,
        addedAt: Date.now(),
        addedBy: uid,
      };
      notifData.subs.push(newSub);
      saveNotifData();
      sessions.delete(uid);

      const e = buildPanelEmbed({
        icon: "✅",
        title: "تم إضافة الاشتراك",
        color: 0x57f287,
        description:
          "### ✅ تم بنجاح\\n" +
          "> " + p.emoji + " **" + p.name + "** • **" + ps.notifUsername + "**\\n" +
          "> 📍 الروم: <#" + cid + ">\\n" +
          "> 🕐 المراقبة: **كل 5 دقائق**\\n\\u200b",
        fields: [
          { name: "📌 الحالة", value: testResult ? "> 🟢 الحساب موجود" : "> ⚠️ ما كدرت أتحقق — راح نراقبه", inline: false },
        ],
        thumbnail: false,
        footer: "MRBOT Notifications",
      });
      return wait.edit({ content: "", embeds: [e] });
    }

    // ---- Giphy: اسم البحث ----`;

s = s.replace(anchor, H);
fs.writeFileSync("index.js", s);
console.log("✅ أضفت استقبال المستخدم والروم");
