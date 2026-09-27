(async () => {
  console.log("🧪 Kick عبر CORS Proxy...\n");

  const proxies = [
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://api.codetabs.com/v1/proxy?quest=",
  ];

  const target = "https://kick.com/api/v2/channels/xqc";

  for (const proxy of proxies) {
    const url = proxy + encodeURIComponent(target);
    console.log("\n📡 " + proxy);
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      console.log("   Status: " + r.status);
      const txt = await r.text();
      if (txt.startsWith("{") || txt.startsWith("[")) {
        const j = JSON.parse(txt);
        console.log("   ✅ JSON!");
        console.log("   Live: " + (j.livestream?.is_live ? "🔴 LIVE" : "⚪ offline"));
        if (j.livestream?.is_live) {
          console.log("   Title: " + (j.livestream.session_title || "").slice(0, 50));
        }
      } else {
        console.log("   Preview: " + txt.slice(0, 150));
      }
    } catch (e) {
      console.log("   ❌ " + e.message);
    }
  }
})();
