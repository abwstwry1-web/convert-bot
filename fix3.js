const fs = require("fs");
let s = fs.readFileSync("index.js", "utf8");

// ═══ نحدث معالج notif_edit_pick ليعطي خيارين ═══
const start = s.indexOf('    if (ps && ps.mode === "notif_edit_pick") {');
const end = s.indexOf('    if (ps && ps.mode === "notif_edit_text") {');
if (start === -1 || end === -1) { console.log("❌"); process.exit(1); }

const NEW = `    if (ps && ps.mode === "notif_edit_pick") {
      const n = parseInt(txt.trim());
      if (isNaN(n) || n < 1 || n > notifData.subs.length) {
        return message.reply("✍️ اكتب رقم صحيح (من 1 إلى " + notifData.subs.length + ")");
      }
      const sub = notifData.subs[n - 1];
      if (!sub) return message.reply("❌ ما لكيت الاشتراك");

      ps.mode = "notif_edit_choice";
      ps.editSubIndex = n - 1;
      sessions.set(uid, ps);

      const p = getPlatform(sub.platform);
      const tl = TYPE_LABELS[sub.type || "live"];
      const tpl = NOTIF_TEMPLATES[sub.platform + "_" + (sub.type || "live")];

      const previewDefault = tpl
        ? tpl.emoji + " **" + (sub.customName || sub.username) + "** " + tpl.text + " <@&" + tpl.role + ">"
        : "_ماكو قالب_";

      const e = buildPanelEmbed({
        icon: "✏️",
        title: "خيارات التعديل",
        color: p ? p.color : 0x5865f2,
        description:
          "### " + (p ? p.emoji : "") + " " + (p ? p.name : "?") + " • **" + sub.username + "** " + (tl ? tl.emoji : "") + "\\n\\n" +
          "**📝 القالب الافتراضي:**\\n> " + previewDefault + "\\n\\n" +
          "**✏️ اختار شنو تعدل:**\\n" +
          "> **1** = تعديل **اسم العرض** (يبدل اليوزر بالقالب)\\n" +
          "> **2** = كتابة **رسالة كاملة مخصصة** (بدون قالب)\\n" +
          "> **3** = رجوع للافتراضي\\n\\u200b",
        thumbnail: false,
      });
      return message.reply({ embeds: [e] });
    }

    if (ps && ps.mode === "notif_edit_choice") {
      const ch = txt.trim();
      const idx = ps.editSubIndex;
      const sub = notifData.subs[idx];
      if (!sub) return message.reply("❌ ما لكيت الاشتراك");

      if (ch === "1") {
        ps.mode = "notif_edit_name";
        sessions.set(uid, ps);
        return message.reply("✍️ اكتب **اسم العرض** الجديد (يبدل اليوزر في القالب):");
      }
      if (ch === "2") {
        ps.mode = "notif_edit_text";
        sessions.set(uid, ps);
        return message.reply("✍️ اكتب **الرسالة الكاملة** (بدون قالب، ما راح يكون فيه رتبة تلقائي):");
      }
      if (ch === "3") {
        delete sub.customName;
        delete sub.customMessage;
        saveNotifData();
        sessions.delete(uid);
        return message.reply("✅ تم الرجوع للقالب الافتراضي");
      }
      return message.reply("✍️ اكتب 1 أو 2 أو 3");
    }

    if (ps && ps.mode === "notif_edit_name") {
      const newName = txt.trim();
      if (newName.length === 0) return message.reply("✍️ اكتب اسم");
      if (newName.length > 100) return message.reply("⚠️ الحد 100 حرف");
      const idx = ps.editSubIndex;
      const sub = notifData.subs[idx];
      if (!sub) return message.reply("❌ ما لكيت الاشتراك");
      sub.customName = newName;
      saveNotifData();
      sessions.delete(uid);
      const finalMsg = buildNotifContent(sub);
      return message.reply({
        content: "✅ **تم حفظ الاسم!**\\n\\n**الشكل النهائي:**\\n" + (finalMsg || "_ماكو قالب_"),
      });
    }

`;

s = s.slice(0, start) + NEW + s.slice(end);
fs.writeFileSync("index.js", s);
console.log("✅ أضفت خيارات التعديل");
