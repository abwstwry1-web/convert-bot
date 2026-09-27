(async () => {
  const username = "mr_awsy";
  console.log("🧪 فحص حالة Live الرسمية...\n");

  // endpoint رسمي من TikTok
  const urls = [
    "https://www.tiktok.com/api-live/user/room/?aid=1988&uniqueId=" + username,
    "https://www.tiktok.com/api-live/user/room/?aid=1988&unique_id=" + username,
    "https://www.tiktok.com/api-live/user/room/?aid=1988&uniqueId=" + username + "&sourceType=54",
  ];

  for (const url of urls) {
    console.log("\n📡 " + url);
    try {
      const r = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://www.tiktok.com/",
        },
      });
      console.log("   Status: " + r.status);
      const txt = await r.text();
      console.log("   Response: " + txt.slice(0, 500));
    } catch (e) {
      console.log("   ❌ " + e.message);
    }
  }
})();
