require("dotenv").config();
(async () => {
  const key = process.env.OMKAR_API_KEY;
  console.log("🔑 Key: " + key.slice(0, 10) + "...\n");

  const username = "mr_awsy";
  // نجرب عدة endpoints
  const urls = [
    "https://tiktok-scraper.omkar.cloud/tiktok/user/posts?username=" + username + "&limit=5",
    "https://tiktok-scraper.omkar.cloud/tiktok/user/posts?unique_id=" + username,
    "https://tiktok-scraper.omkar.cloud/tiktok/user?username=" + username,
    "https://api.omkar.cloud/tiktok/user/posts?username=" + username,
  ];

  for (const url of urls) {
    console.log("\n📡 " + url);
    try {
      const r = await fetch(url, {
        headers: { "x-api-key": key, "Authorization": "Bearer " + key },
      });
      console.log("   Status: " + r.status);
      const txt = await r.text();
      console.log("   حجم: " + txt.length);
      console.log("   أول 300: " + txt.slice(0, 300).replace(/\n/g, " "));
    } catch (e) {
      console.log("   ❌ " + e.message);
    }
  }
})();
