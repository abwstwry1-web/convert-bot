require("dotenv").config();
(async () => {
  const key = process.env.OMKAR_API_KEY;
  const username = "mr_awsy";
  console.log("🧪 اختبار OMKAR API...\n");

  const url = "https://tiktok-scraper.omkar.cloud/tiktok/users/videos?handle=" + username + "&max_results=5";
  const r = await fetch(url, { headers: { "API-Key": key } });
  console.log("📡 Status: " + r.status);
  const j = await r.json();
  if (j.videos && j.videos.length > 0) {
    console.log("✅ لقيت " + j.videos.length + " فيديو:");
    j.videos.slice(0, 5).forEach((v, i) => {
      console.log("  " + (i+1) + ". ID: " + v.video_id + " | " + (v.caption || "").slice(0, 40));
    });
  } else {
    console.log("📊 النتيجة:", JSON.stringify(j).slice(0, 300));
  }
})();
