(async () => {
  const username = "mr_awsy";
  console.log("🧪 اختبار خدمات TikTok...\n");

  const apis = [
    { name: "tikwm.com (GET)", url: "https://tikwm.com/api/user/posts?unique_id=" + username + "&count=5" },
    { name: "tikwm.com (POST)", url: "https://tikwm.com/api/user/posts", method: "POST", body: "unique_id=" + username + "&count=5" },
    { name: "tikwm alt", url: "https://www.tikwm.com/api/user/posts?unique_id=" + username + "&count=5" },
    { name: "RapidAPI free", url: "https://tiktok-scraper7.p.rapidapi.com/user/posts?unique_id=" + username + "&count=5" },
  ];

  for (const api of apis) {
    console.log("\n📡 " + api.name);
    console.log("   " + api.url);
    try {
      const opts = {
        method: api.method || "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
      };
      if (api.body) {
        opts.body = api.body;
        opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
      }
      const r = await fetch(api.url, opts);
      console.log("   Status: " + r.status);
      const ct = r.headers.get("content-type") || "";
      console.log("   Content-Type: " + ct);
      const txt = await r.text();
      console.log("   حجم: " + txt.length);
      console.log("   أول 200: " + txt.slice(0, 200).replace(/\n/g, " "));
    } catch (e) {
      console.log("   ❌ " + e.message);
    }
  }
})();
