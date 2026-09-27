const fs = require("fs");
let s = fs.readFileSync("index.js", "utf8");
let log = [];

// imports
const o1 = `  ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require("discord.js");`;
const n1 = `  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
} = require("discord.js");`;
if (s.includes(o1) && !s.includes("StringSelectMenuBuilder")) { s = s.replace(o1, n1); log.push("imports"); }

// members Map
const o2 = `const ALLOWED = [OWNER_ID, "1273804388930031690"];`;
const n2 = `const ALLOWED = [OWNER_ID, "1273804388930031690"];
const members = new Map();`;
if (s.includes(o2) && !s.includes("const members = new Map()")) { s = s.replace(o2, n2); log.push("members"); }

// helpers + mainPanel
const o3 = `const isAllowed = (id) => ALLOWED.includes(id);

function mainPanel() {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🎛️ لوحة التحكم")
    .setDescription("هلا بيك 👋\\nاختار شنو تريد تسوي:")
    .setFooter({ text: "MRBOT" });
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("panel_convert").setLabel("تحويل صور").setEmoji("🖼️").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("panel_stickers").setLabel("حذف ملصقات وايموجي").setEmoji("🗑️").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("panel_giphy").setLabel("بحث ملصقات").setEmoji("🔎").setStyle(ButtonStyle.Primary),
  );
  return { embeds: [embed], components: [row] };
}`;

const n3 = `function getFeatures(uid) {
  if (ALLOWED.includes(uid)) return new Set(["convert", "delete", "giphy", "admin"]);
  const m = members.get(uid);
  return m ? new Set(m.features) : null;
}

function isAllowed(id) {
  return ALLOWED.includes(id) || members.has(id);
}

function hasFeature(uid, feat) {
  const f = getFeatures(uid);
  return f ? f.has(feat) : false;
}

function checkFeature(id, uid) {
  if (!id) return true;
  if (id === "panel_back" || id.startsWith("stk_page_")) return true;
  if (id.startsWith("cat_")) return hasFeature(uid, "giphy");
  const map = {
    panel_convert: "convert",
    conv_emoji: "convert", conv_emoji_static: "convert",
    conv_sticker: "convert", conv_sticker_static: "convert",
    conv_more: "convert", conv_reset: "convert",
    panel_stickers: "delete", list_stickers: "delete", list_emojis: "delete",
    stk_delete_selected: "delete", stk_delete_all: "delete",
    panel_giphy: "giphy", giphy_retry: "giphy",
    panel_add_member: "admin",
    member_features: "admin", member_confirm: "admin", member_cancel: "admin",
  };
  const f = map[id];
  if (!f) return true;
  return hasFeature(uid, f);
}

function buildMemberPanel(pending) {
  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("➕ إضافة عضو")
    .setDescription(
      "👤 العضو: **" + pending.tag + "**\\n" +
      "🆔 \\\`" + pending.id + "\\\`\\n\\n" +
      "اختار الأنظمة الي تريد تفعّلها له:"
    );
  const menu = new StringSelectMenuBuilder()
    .setCustomId("member_features")
    .setPlaceholder("اختار الأنظمة")
    .setMinValues(1)
    .setMaxValues(3);
  menu.addOptions(
    new StringSelectMenuOptionBuilder().setLabel("تحويل صور").setValue("convert").setEmoji("🖼️").setDefault(pending.features.includes("convert")),
    new StringSelectMenuOptionBuilder().setLabel("حذف ملصقات وايموجي").setValue("delete").setEmoji("🗑️").setDefault(pending.features.includes("delete")),
    new StringSelectMenuOptionBuilder().setLabel("بحث ملصقات").setValue("giphy").setEmoji("🔎").setDefault(pending.features.includes("giphy")),
  );
  const row1 = new ActionRowBuilder().addComponents(menu);
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("member_confirm").setLabel("تأكيد وإرسال").setEmoji("✅").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("member_cancel").setLabel("إلغاء").setEmoji("✖️").setStyle(ButtonStyle.Danger),
  );
  return { embeds: [embed], components: [row1, row2] };
}

function mainPanel(uid) {
  const f = getFeatures(uid) || new Set();
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🎛️ لوحة التحكم")
    .setDescription("هلا بيك 👋\\nاختار شنو تريد تسوي:")
    .setFooter({ text: "MRBOT" });
  const buttons = [];
  if (f.has("convert")) buttons.push(new ButtonBuilder().setCustomId("panel_convert").setLabel("تحويل صور").setEmoji("🖼️").setStyle(ButtonStyle.Primary));
  if (f.has("delete")) buttons.push(new ButtonBuilder().setCustomId("panel_stickers").setLabel("حذف ملصقات وايموجي").setEmoji("🗑️").setStyle(ButtonStyle.Secondary));
  if (f.has("giphy")) buttons.push(new ButtonBuilder().setCustomId("panel_giphy").setLabel("بحث ملصقات").setEmoji("🔎").setStyle(ButtonStyle.Primary));
  if (f.has("admin")) buttons.push(new ButtonBuilder().setCustomId("panel_add_member").setLabel("إضافة عضو").setEmoji("➕").setStyle(ButtonStyle.Success));
  const rows = [];
  for (let i = 0; i < buttons.length; i += 5) rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
  if (rows.length === 0) rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("noop").setLabel("ما عندك صلاحيات").setStyle(ButtonStyle.Secondary).setDisabled(true)
  ));
  return { embeds: [embed], components: rows };
}`;
if (s.includes(o3)) { s = s.replace(o3, n3); log.push("mainPanel"); }

fs.writeFileSync("index.js", s);
console.log("✅ " + log.join(", ") + " (" + log.length + "/3)");
