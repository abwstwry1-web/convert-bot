(async () => {
  const username = "mr_awsy";
  console.log("🧪 اختبار...\n");
  const r = await fetch("https://www.tiktok.com/@" + username, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
  });
  const html = await r.text();

  const countMap = {};
  const regex = /(7\d{18})/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    countMap[m[1]] = (countMap[m[1]] || 0) + 1;
  }

  const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
  console.log("📊 أول 5 (الأكثر تكراراً):");
  sorted.slice(0, 5).forEach(([id, cnt], i) => {
    console.log("  " + (i+1) + ". " + id + " (تكرار: " + cnt + ")");
  });
})();
