const fs = require("fs");
let s = fs.readFileSync("index.js", "utf8");

if (s.includes("NOTIF_SCHEDULER_RUNNING")) {
  console.log("✅ موجود");
  process.exit(0);
}

const anchor = '    // كل 30 ثانية: نحدث المباريات الحية';
if (!s.includes(anchor)) { console.log("❌"); process.exit(1); }

const H = `    // ═══ Scheduler الإشعارات (كل 5 دقائق) ═══
    if (!global.NOTIF_SCHEDULER_RUNNING) {
      global.NOTIF_SCHEDULER_RUNNING = true;
      setTimeout(async () => {
        try { await checkNotifications(); } catch (e) { console.log("notif init err:", e.message); }
      }, 15000);
      setInterval(async () => {
        try { await checkNotifications(); } catch (e) { console.log("notif sched err:", e.message); }
      }, 5 * 60 * 1000);
      console.log("📢 Scheduler الإشعارات شغال (كل 5 دقائق)");
    }

    // كل 30 ثانية: نحدث المباريات الحية`;

s = s.replace(anchor, H);
fs.writeFileSync("index.js", s);
console.log("✅ أضفت Scheduler الإشعارات");
