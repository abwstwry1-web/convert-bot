const fs = require("fs");

(async () => {
  console.log("══════ التخزين المحلي ══════\n");
  const p = "./data/notifications.json";
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const s of d.subs) {
    console.log("• " + s.platform + " | " + s.username);
    console.log("  lastContentId: " + (s.lastContentId || "فاضي"));
  }

  console.log("\n══════ TikTok Live ══════\n");
  const username = "mr_awsy";
  try {
    const r = await fetch("https://www.tiktok.com/@" + username, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await r.text();
    console.log("📡 Status:", r.status);
    console.log("📄 Size:", html.length);

    const uniMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    if (uniMatch) {
      const data = JSON.parse(uniMatch[1]);
      const u = data["__DEFAULT_SCOPE__"]?.["webapp.user-detail"]?.userInfo;
      if (u) {
        console.log("\n👤 " + u.user.nickname + " (@" + u.user.uniqueId + ")");
        console.log("🎬 فيديوهات: " + u.stats.videoCount);
        console.log("📊 itemList: " + (u.itemList?.length || 0) + " عناصر");
        if (u.itemList && u.itemList.length > 0) {
          console.log("\n📹 الفيديوهات:");
          u.itemList.slice(0, 3).forEach((it, i) => {
            console.log("  " + (i+1) + ". ID: " + it.id);
            console.log("     Desc: " + (it.desc || "").slice(0, 60));
          });
        }
      }
    } else {
      console.log("❌ ما لكيت Universal Data");
    }

    // كل IDs
    const ids = [...new Set([...html.matchAll(/"video\/(\d{19})"/g)].map((m) => m[1]))];
    console.log("\n🔍 كل IDs موجودة بالصفحة:");
    ids.slice(0, 5).forEach((id, i) => console.log("  " + (i+1) + ". " + id));
  } catch (e) {
    console.log("❌ خطأ:", e.message);
  }
})();
