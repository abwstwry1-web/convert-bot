(async () => {
  const username = "mr_awsy";
  console.log("🧪 اختبار TikTok scraper المتقدم...\n");

  try {
    const r = await fetch("https://www.tiktok.com/@" + username, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    console.log("📡 Status:", r.status);
    const html = await r.text();
    console.log("📄 Size:", html.length);

    // ═══ نجرب نستخرج من __UNIVERSAL_DATA_FOR_REHYDRATION__ ═══
    const match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    if (match) {
      console.log("✅ لقيت Universal Data script");
      const data = JSON.parse(match[1]);
      const userModule = data["__DEFAULT_SCOPE__"]?.["webapp.user-detail"];
      const userInfo = userModule?.userInfo;
      if (userInfo) {
        console.log("👤 المستخدم:", userInfo.user.nickname, "(@" + userInfo.user.uniqueId + ")");
        console.log("📊 متابعين:", userInfo.stats.followerCount);
        console.log("🎬 فيديوهات:", userInfo.stats.videoCount);
        
        const itemList = userInfo.itemList || [];
        console.log("\n📹 أول 5 فيديوهات:");
        for (const item of itemList.slice(0, 5)) {
          console.log("   • ID:", item.id, "| Desc:", (item.desc || "").slice(0, 50));
        }
      }
    } else {
      console.log("❌ ماكو Universal Data");
    }

    // ═══ نجرب نستخرج من SIGI_STATE ═══
    const sigiMatch = html.match(/<script id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/);
    if (sigiMatch) {
      console.log("\n✅ لقيت SIGI_STATE script");
      try {
        const data = JSON.parse(sigiMatch[1]);
        const items = data.ItemModule || {};
        const ids = Object.keys(items);
        console.log("📊 فيديوهات:", ids.length);
        console.log("📹 أول ID:", ids[0] || "ماكو");
      } catch (e) {
        console.log("⚠️ SIGI parse error:", e.message);
      }
    } else {
      console.log("❌ ماكو SIGI_STATE");
    }

    // ═══ meta og:video ═══
    const ogVideo = html.match(/<meta property="og:video" content="([^"]+)"/);
    if (ogVideo) console.log("\n🎬 og:video:", ogVideo[1].slice(0, 100));
    const ogDesc = html.match(/<meta property="og:description" content="([^"]+)"/);
    if (ogDesc) console.log("📝 og:description:", ogDesc[1].slice(0, 100));

    // ═══ نبحث عن كل IDs ═══
    const allIds = [...new Set([...html.matchAll(/"(7\d{18})"/g)].map(m => m[1]))];
    console.log("\n📊 كل الأرقام اللي تشبه IDs:", allIds.slice(0, 10).join(", ") || "ماكو");

  } catch (e) {
    console.log("❌ خطأ:", e.message);
  }
})();
