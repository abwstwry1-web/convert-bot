(async () => {
  const username = "mr_awsy";
  console.log("🧪 فحص live الآن...\n");

  const r = await fetch("https://www.tiktok.com/@" + username + "/live", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    redirect: "follow",
  });

  console.log("📡 Final URL: " + r.url);
  const html = await r.text();
  console.log("📄 Size: " + html.length);

  const isLivePage = r.url.includes("/live");
  console.log("\n🔍 Check 1: URL contains /live → " + isLivePage);

  const roomMatch = html.match(/"roomId":"(\d{15,25})"/);
  console.log("🔍 Check 2: roomId → " + (roomMatch ? roomMatch[1] : "ماكو"));

  // نجرب أنماط ثانية
  const pats = [
    /"roomId":"(\d+)"/g,
    /room_id=(\d+)/g,
    /"roomId":(\d+)/g,
  ];
  console.log("\n🔍 أنماط ثانية:");
  pats.forEach((p, i) => {
    const m = html.match(p);
    console.log("  " + (i+1) + ". " + (m ? m.slice(0, 3).join(", ") : "ماكو"));
  });

  // نتحقق من علامات live
  console.log("\n🔍 كلمات live:");
  console.log("  isLive: " + (html.includes('"isLive":true') ? "✅" : "❌"));
  console.log("  LIVE badge: " + (html.includes("LIVE") ? "✅" : "❌"));
  console.log("  live-detail: " + (html.includes("live-detail") ? "✅" : "❌"));
  console.log("  liveRoom: " + (html.includes("liveRoom") ? "✅" : "❌"));
})();
