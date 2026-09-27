require("dotenv").config();
(async () => {
  const key = process.env.OMKAR_API_KEY;
  const u = "mr_awsy";
  console.log("🧪 نبحث عن الـ endpoint الصح...\n");

  const urls = [
    "https://tiktok-scraper.omkar.cloud/tiktok/users/videos?handle=" + u,
    "https://tiktok-scraper.omkar.cloud/tiktok/user/videos?handle=" + u,
    "https://tiktok-scraper.omkar.cloud/tiktok/user/videos?username=" + u,
    "https://tiktok-scraper.omkar.cloud/tiktok/users/posts?handle=" + u,
    "https://tiktok-scraper.omkar.cloud/tiktok/posts?handle=" + u,
    "https://tiktok-scraper.omkar.cloud/tiktok/user/posts?handle=" + u,
    "https://tiktok-scraper.omkar.cloud/tiktok/scrape/user?handle=" + u,
    "https://tiktok-scraper.omkar.cloud/tiktok/info?handle=" + u,
    "https://tiktok-scraper.omkar.cloud/tiktok?handle=" + u,
    "https://tiktok-scraper.omkar.cloud/user/videos?handle=" + u,
    "https://tiktok-scraper.omkar.cloud/api/user/videos?handle=" + u,
    "https://tiktok-scraper.omkar.cloud/",
  ];

  for (const url of urls) {
    try {
      const r = await fetch(url, { headers: { "API-Key": key } });
      const txt = await r.text();
      const preview = txt.slice(0, 150).replace(/\n/g, " ");
      console.log("[" + r.status + "] " + url.replace("https://tiktok-scraper.omkar.cloud", ""));
      console.log("     " + preview + "\n");
    } catch (e) {
      console.log("[ERR] " + url + "\n     " + e.message + "\n");
    }
  }
})();
