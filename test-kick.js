(async () => {
  console.log("🧪 فحص Kick endpoints...\n");
  const urls = [
    "https://kick.com/api/v2/channels/xqc",
    "https://kick.com/api/v1/channels/xqc",
    "https://api.kick.com/public/v1/channels?slug=xqc",
    "https://kick.com/api/v2/channels/xQc",
  ];
  for (const url of urls) {
    console.log("\n📡 " + url);
    try {
      const r = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
      });
      console.log("   Status: " + r.status);
      const txt = await r.text();
      console.log("   Preview: " + txt.slice(0, 200));
    } catch (e) {
      console.log("   ❌ " + e.message);
    }
  }
})();
