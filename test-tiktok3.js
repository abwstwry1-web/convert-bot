(async () => {
  const username = "mr_awsy";
  console.log("🧪 اختبار TikTok...\n");
  const r = await fetch("https://www.tiktok.com/@" + username, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
  });
  const html = await r.text();
  console.log("📄 حجم:", html.length);

  const ids = [...new Set([...html.matchAll(/(7\d{18})/g)].map((m) => m[1]))];
  console.log("🔍 عدد الـ IDs:", ids.length);
  console.log("📌 أول 5 IDs:");
  ids.slice(0, 5).forEach((id, i) => console.log("  " + (i+1) + ". " + id));

  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/);
  console.log("\n🔗 og:url:", ogUrl ? ogUrl[1] : "ماكو");

  const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/);
  console.log("📝 og:title:", ogTitle ? ogTitle[1] : "ماكو");
})();
