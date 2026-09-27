require("dotenv").config();
(async () => {
  const key = process.env.OMKAR_API_KEY;
  const usernames = ["mr_awsy", "tiktok", "charlidamelio", "khaby.lame", "cristiano"];
  console.log("🧪 نجرب حسابات مختلفة...\n");
  for (const u of usernames) {
    const url = "https://tiktok-scraper.omkar.cloud/tiktok/users/videos?handle=" + u;
    try {
      const r = await fetch(url, { headers: { "API-Key": key } });
      const txt = await r.text();
      console.log("[" + r.status + "] " + u + " → " + txt.slice(0, 150).replace(/\n/g, " ") + "\n");
    } catch (e) {
      console.log("[ERR] " + u + " → " + e.message + "\n");
    }
  }
})();
