require("dotenv").config();
(async () => {
  const token = process.env.APIFY_TOKEN;
  console.log("🔑 Token: " + token.slice(0, 15) + "...\n");

  const url = "https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=" + token;
  console.log("📡 إرسال طلب لجلب فيديوهات mr_awsy...\n");

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profiles: ["mr_awsy"],
        resultsPerPage: 10,
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
      }),
    });
    console.log("📊 Status: " + r.status);
    const j = await r.json();
    if (Array.isArray(j)) {
      console.log("✅ لقيت " + j.length + " فيديو:\n");
      j.slice(0, 5).forEach((v, i) => {
        console.log("  " + (i+1) + ". " + v.id);
        console.log("     Desc: " + (v.text || "").slice(0, 60));
        console.log("     Date: " + (v.createTime || "?"));
        console.log("");
      });
    } else {
      console.log("📊 الرد:", JSON.stringify(j).slice(0, 500));
    }
  } catch (e) {
    console.log("❌ خطأ: " + e.message);
  }
})();
