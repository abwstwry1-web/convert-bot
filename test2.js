(async () => {
  console.log("🧪 اختبار RSSHub لـ TikTok...");
  const username = "mr_awsy";
  const urls = [
    "https://rsshub.app/tiktok/user/@" + username,
    "https://rsshub.app/tiktok/user/" + username,
  ];
  for (const url of urls) {
    console.log("\n📡 " + url);
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MRBOT/2.0)" }
      });
      console.log("📊 حالة:", r.status);
      if (r.ok) {
        const xml = await r.text();
        console.log("📄 حجم:", xml.length, "حرف");
        if (xml.includes("<item>") || xml.includes("<entry>")) {
          console.log("✅ لقيت فيديوهات!");
          const matches = [...xml.matchAll(/<link>([^<]+)<\/link>/g)].map(m => m[1]);
          console.log("📊 أول 3 روابط:");
          matches.slice(0, 3).forEach(m => console.log("   " + m));
        } else {
          console.log("⚠️ ماكو فيديوهات");
          console.log(xml.slice(0, 300));
        }
      }
    } catch (e) {
      console.log("❌ خطأ:", e.message);
    }
  }
})();
