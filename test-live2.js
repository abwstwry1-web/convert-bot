(async () => {
  const username = "mr_awsy";
  const url = "https://www.tiktok.com/api-live/user/room/?aid=1988&uniqueId=" + username + "&sourceType=54";
  
  const r = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://www.tiktok.com/",
    },
  });
  const j = await r.json();
  
  console.log("📊 Status Code: " + j.statusCode);
  console.log("📊 Message: " + j.message);
  console.log("\n📋 كل المفاتيح في data:");
  if (j.data) {
    Object.keys(j.data).forEach((k) => console.log("  - " + k));
    
    console.log("\n📋 محتوى data:");
    console.log(JSON.stringify(j.data, null, 2).slice(0, 2000));
  }
})();
