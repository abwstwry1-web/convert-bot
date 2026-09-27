(async () => {
  const users = ["hasanabi", "pokimane", "shroud", "tarik", "sodapoppin", "asmongold", "forsen", "summit1g", "lirik", "gaules", "auronplay", "ibai", "rubius"];
  console.log("🟣 فحص Twitch...\n");
  let liveCount = 0;
  for (const u of users) {
    try {
      const r = await fetch("https://decapi.me/twitch/uptime/" + u);
      const txt = (await r.text()).trim();
      if (txt.toLowerCase().includes("offline")) {
        console.log("  ⚪ " + u);
      } else {
        liveCount++;
        console.log("  🔴 " + u + " | " + txt);
      }
    } catch (e) {
      console.log("  ❌ " + u + " — " + e.message);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  console.log("\n📊 LIVE: " + liveCount + " / " + users.length);
})();
