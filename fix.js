const fs = require("fs");
let s = fs.readFileSync("index.js", "utf8");

// نعدل وصف Kick بحيث يبين التحذير
const oldDesc = '{ id: "kick", name: "Kick", emoji: "🟢", color: 0x53fc18, desc: "اسم المستخدم", types: ["live"] }';
const newDesc = '{ id: "kick", name: "Kick", emoji: "🟢", color: 0x53fc18, desc: "⚠️ محجوب بالعراق — يحتاج VPN", types: ["live"] }';

if (s.includes(oldDesc)) {
  s = s.replace(oldDesc, newDesc);
  fs.writeFileSync("index.js", s);
  console.log("✅ أضفت التحذير لـ Kick");
} else {
  console.log("❌ ما لكيت Kick line");
  // نبحث عن kick
  const lines = s.split("\n");
  lines.forEach((l, i) => {
    if (l.includes('id: "kick"') || l.includes("id: 'kick'")) {
      console.log("  سطر " + (i+1) + ": " + l.trim());
    }
  });
}
