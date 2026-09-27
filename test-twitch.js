(async () => {
  console.log("🧪 فحص Twitch endpoints...\n");
  
  // نجرب xqc
  const u = "xqc";
  
  // DecAPI
  console.log("📡 DecAPI uptime:");
  try {
    const r = await fetch("https://decapi.me/twitch/uptime/" + u);
    console.log("   " + (await r.text()));
  } catch (e) { console.log("   ❌ " + e.message); }

  console.log("\n📡 DecAPI status:");
  try {
    const r = await fetch("https://decapi.me/twitch/status/" + u);
    console.log("   " + (await r.text()));
  } catch (e) { console.log("   ❌ " + e.message); }

  // نجرب كذا حساب
  console.log("\n📡 فحص عدة حسابات:");
  const users = ["xqc", "kaicenat", "ninja", "trainwreckstv", "ishowspeed", "ludwig"];
  for (const user of users) {
    try {
      const r = await fetch("https://decapi.me/twitch/status/" + user);
      const txt = (await r.text()).trim();
      console.log("   " + user + " → " + txt.slice(0, 80));
    } catch (e) { console.log("   " + user + " ❌ " + e.message); }
    await new Promise(r => setTimeout(r, 200));
  }
})();
