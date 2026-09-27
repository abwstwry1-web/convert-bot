require("dotenv").config();
(async () => {
  const key = process.env.OMKAR_API_KEY;
  console.log("🔑 Key: " + key.slice(0, 10) + "...\n");

  const username = "mr_awsy";
  const urls = [
    "https://tiktok-scraper.omkar.cloud/tiktok/user/posts?username=" + username,
    "https://tiktok-scraper.omkar.cloud/tiktok/user/posts?unique_id=" + username,
    "https://tiktok-scraper.omkar.cloud/tiktok/user?username=" + username,
    "https://tiktok-scraper.omkar.cloud/tiktok/user?unique_id=" + username,
  ];

  for (const url of urls) {
    console.log("\n📡 " + url);
    try {
      const r = await fetch(url, {
        headers: { "API-Key": key },
      });
      console.log("   Status: " + r.status);
      const txt = await r.text();
      console.log("   حجم: " + txt.length);
      console.log("   أول 500: " + txt.slice(0, 500).replace(/\n/g, " "));
    } catch (e) {
      console.log("   ❌ " + e.message);
    }
  }
})();
