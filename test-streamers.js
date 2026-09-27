(async () => {
  console.log("🧪 فحص حسابات Kick و Twitch المشهورة...\n");

  // ═══ Kick - حسابات مشهورة ═══
  const kickUsers = ["xqc", "adinross", "trainwreckstv", "kaicenat", "ishowspeed", "amouranth"];
  console.log("🟢 Kick:");
  for (const u of kickUsers) {
    try {
      const r = await fetch("https://kick.com/api/v2/channels/" + u.toLowerCase(), {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!r.ok) { console.log("  ❌ " + u + " — " + r.status); continue; }
      const j = await r.json();
      const isLive = j.livestream && j.livestream.is_live;
      if (isLive) {
        console.log("  🔴 " + u + " LIVE! | " + (j.livestream.session_title || "").slice(0, 50));
        console.log("     Category: " + (j.livestream.categories?.[0]?.name || "?"));
        console.log("     Viewers: " + (j.livestream.viewer_count || 0));
      } else {
        console.log("  ⚪ " + u + " — offline");
      }
    } catch (e) {
      console.log("  ❌ " + u + " — " + e.message);
    }
  }

  // ═══ Twitch - حسابات مشهورة ═══
  const twitchUsers = ["xqc", "kaicenat", "ninja", "shroud", "pokimane", "hasanabi", "ludwig"];
  console.log("\n🟣 Twitch:");
  for (const u of twitchUsers) {
    try {
      const r = await fetch("https://decapi.me/twitch/uptime/" + u);
      if (!r.ok) { console.log("  ❌ " + u + " — " + r.status); continue; }
      const txt = (await r.text()).trim();
      if (txt.toLowerCase().includes("offline") || txt.toLowerCase().includes("error")) {
        console.log("  ⚪ " + u + " — offline");
      } else {
        // حي!
        const gR = await fetch("https://decapi.me/twitch/game/" + u);
        const tR = await fetch("https://decapi.me/twitch/title/" + u);
        const game = gR.ok ? (await gR.text()).trim() : "?";
        const title = tR.ok ? (await tR.text()).trim() : "?";
        console.log("  🔴 " + u + " LIVE! | " + txt);
        console.log("     Game: " + game);
        console.log("     Title: " + title.slice(0, 60));
      }
    } catch (e) {
      console.log("  ❌ " + u + " — " + e.message);
    }
    await new Promise(r => setTimeout(r, 300));
  }
})();
