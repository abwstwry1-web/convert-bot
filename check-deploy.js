const fs = require("fs");
const path = require("path");

console.log("═══════════════════════════════════════");
console.log("🔍 فحص تجهيز النشر");
console.log("═══════════════════════════════════════");
console.log("");

const DIR = __dirname;
let errors = [];
let warnings = [];
let passed = 0;

function checkFile(name, required = true) {
  const p = path.join(DIR, name);
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    if (stat.size === 0) {
      console.log("⚠️  " + name + " موجود بس فاضي (0 بايت)");
      warnings.push(name + " فاضي");
      return false;
    }
    console.log("✅ " + name + " موجود (" + stat.size + " بايت)");
    passed++;
    return true;
  } else {
    if (required) {
      console.log("❌ " + name + " غير موجود");
      errors.push(name + " ناقص");
    } else {
      console.log("⚠️  " + name + " اختياري - مو موجود");
      warnings.push(name + " اختياري");
    }
    return false;
  }
}

function checkContent(name, patterns) {
  const p = path.join(DIR, name);
  if (!fs.existsSync(p)) return;
  const content = fs.readFileSync(p, "utf8");
  for (const [desc, pattern] of patterns) {
    if (typeof pattern === "string") {
      if (content.includes(pattern)) {
        console.log("   ✅ " + desc);
        passed++;
      } else {
        console.log("   ❌ " + desc + " (ناقص)");
        errors.push(name + ": " + desc);
      }
    } else {
      if (pattern.test(content)) {
        console.log("   ✅ " + desc);
        passed++;
      } else {
        console.log("   ❌ " + desc + " (ناقص)");
        errors.push(name + ": " + desc);
      }
    }
  }
}

console.log("──── 📁 الملفات الأساسية ────");
console.log("");
checkFile("index.js");
checkFile(".env");
checkFile("package.json");
checkFile("package-lock.json", false);

console.log("");
console.log("──── 📁 ملفات النشر ────");
console.log("");
checkFile("Procfile");
checkFile(".gitignore");
checkFile("README.md");

console.log("");
console.log("──── 🔍 فحص محتوى package.json ────");
console.log("");
checkContent("package.json", [
  ["name موجود", '"name"'],
  ["version موجود", '"version"'],
  ["main = index.js", '"main": "index.js"'],
  ["scripts.start موجود", '"start"'],
  ["start = node index.js", '"start": "node index.js"'],
  ["engines.node موجود", '"engines"'],
  ["discord.js مثبتة", '"discord.js"'],
  ["dotenv مثبتة", '"dotenv"'],
  ["@napi-rs/canvas مثبتة", '"@napi-rs/canvas"'],
]);

console.log("");
console.log("──── 🔍 فحص محتوى Procfile ────");
console.log("");
checkContent("Procfile", [
  ["يبدأ بـ web:", "web:"],
  ["يحتوي node", "node"],
  ["يحتوي index.js", "index.js"],
]);

console.log("");
console.log("──── 🔍 فحص محتوى .gitignore ────");
console.log("");
checkContent(".gitignore", [
  ["يتجاهل node_modules", "node_modules"],
  ["يتجاهل .env", ".env"],
  ["يتجاهل data", "data"],
]);

console.log("");
console.log("──── 🔍 فحص محتوى .env ────");
console.log("");
checkContent(".env", [
  ["BOT_TOKEN موجود", "BOT_TOKEN="],
  ["OWNER_ID موجود", "OWNER_ID="],
  ["GIPHY_KEY موجود", "GIPHY_KEY="],
]);

console.log("");
console.log("──── 🔍 فحص index.js ────");
console.log("");
const idxPath = path.join(DIR, "index.js");
if (fs.existsSync(idxPath)) {
  const idx = fs.readFileSync(idxPath, "utf8");
  const checks = [
    ["client.login موجود", /client\.login/],
    ["mainPanel موجود", /function mainPanel/],
    ["checkNotifications موجود", /async function checkNotifications/],
    ["checkTikTokV2 موجود", /async function checkTikTokV2/],
    ["buildPanelEmbed موجود", /function buildPanelEmbed/],
  ];
  for (const [desc, pat] of checks) {
    if (pat.test(idx)) {
      console.log("✅ " + desc);
      passed++;
    } else {
      console.log("❌ " + desc);
      errors.push(desc);
    }
  }
}

console.log("");
console.log("──── 🔍 فحص صياغة index.js ────");
console.log("");
try {
  require("child_process").execSync("node -c " + idxPath, { stdio: "pipe" });
  console.log("✅ الصياغة سليمة");
  passed++;
} catch (e) {
  console.log("❌ خطأ صياغة:");
  console.log(e.stderr ? e.stderr.toString().split("\n").slice(0, 3).join("\n") : e.message);
  errors.push("خطأ صياغة");
}

console.log("");
console.log("──── 🔍 فحص node_modules ────");
console.log("");
const nm = path.join(DIR, "node_modules");
if (fs.existsSync(nm)) {
  const nmSize = fs.readdirSync(nm).length;
  console.log("✅ node_modules موجود (" + nmSize + " حزمة)");
  passed++;
  // نتأكد من المكتبات الأساسية
  for (const lib of ["discord.js", "dotenv", "@napi-rs/canvas"]) {
    if (fs.existsSync(path.join(nm, lib))) {
      console.log("   ✅ " + lib);
      passed++;
    } else {
      console.log("   ❌ " + lib + " ناقص");
      errors.push(lib);
    }
  }
} else {
  console.log("⚠️  node_modules مو موجود");
  warnings.push("node_modules ناقص — يحتاج npm install");
}

console.log("");
console.log("──── 🔍 فحص مجلد data ────");
console.log("");
const dataDir = path.join(DIR, "data");
if (fs.existsSync(dataDir)) {
  const files = fs.readdirSync(dataDir);
  console.log("✅ data/ موجود");
  for (const f of files) {
    const p = path.join(dataDir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      console.log("   📁 " + f + "/");
    } else {
      console.log("   📄 " + f + " (" + st.size + " بايت)");
    }
  }
  passed++;
} else {
  console.log("⚠️  data/ مو موجود");
  warnings.push("data/ ناقص");
}

console.log("");
console.log("═══════════════════════════════════════");
console.log("📊 الملخص النهائي");
console.log("═══════════════════════════════════════");
console.log("");
console.log("✅ نجح:      " + passed);
console.log("⚠️  تحذيرات: " + warnings.length);
console.log("❌ أخطاء:    " + errors.length);
console.log("");

if (errors.length === 0 && warnings.length === 0) {
  console.log("🎉 كل شي جاهز للنشر!");
  console.log("👉 روح github.com/new وسوي repository");
} else if (errors.length === 0) {
  console.log("💡 التحذيرات (اختيارية):");
  warnings.forEach(w => console.log("   • " + w));
  console.log("");
  console.log("✅ جاهز للنشر على GitHub!");
} else {
  console.log("🔴 أخطاء لازم تصلح:");
  errors.forEach(e => console.log("   • " + e));
  console.log("");
  console.log("📌 صلح الأخطاء وأعد الفحص");
}

console.log("");
console.log("═══════════════════════════════════════");
