const fs = require("fs");
const p = "./data/notifications.json";
if (fs.existsSync(p)) {
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  d.subs.forEach((s) => { s.lastContentId = null; delete s.knownIds; });
  fs.writeFileSync(p, JSON.stringify(d, null, 2));
  console.log("✅ نظفت");
}
