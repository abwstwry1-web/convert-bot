require("dotenv").config();
(async () => {
  const key = process.env.OMKAR_API_KEY;
  const u = "mr_awsy";
  console.log("🧪 نجرب معاملات مختلفة...\n");

  const params = ["handle", "username", "unique_id", "user", "user_id", "name"];
  for (const p of params) {
    const url = "https://tiktok-scraper.omkar.cloud/tiktok/users/videos?" + p + "=" + u;
    try {
      const r = await fetch(url, { headers: { "API-Key": key } });
      const txt = await r.text();
      const preview = txt.slice(0, 200).replace(/\n/g, " ");
      console.log("[" + r.status + "] " + p + " → " + preview.slice(0, 150) + "\n");
    } catch (e) {
      console.log("[ERR] " + p + " → " + e.message + "\n");
    }
  }

  // نجرب POST
  console.log("\n═══ POST ═══\n");
  try {
    const r = await fetch("https://tiktok-scraper.omkar.cloud/tiktok/users/videos", {
      method: "POST",
      headers: { "API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ handle: u }),
    });
    const txt = await r.text();
    console.log("[" + r.status + "] POST → " + txt.slice(0, 200));
  } catch (e) { console.log("POST err:", e.message); }
})();
