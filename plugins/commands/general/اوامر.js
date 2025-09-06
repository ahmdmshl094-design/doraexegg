import fs from "fs";
import axios from "axios";

const config = {
  name: "اوامر",
  _name: {
    "ar_SY": "الاوامر"
  },
  aliases: ["cmds", "مساعدة"],
  version: "1.0.5",
  description: "عرض جميع الأوامر أو تفاصيل أمر معين",
  usage: "[اسم الأمر] (اختياري)",
  credits: "حمودي سان 🇸🇩"
};

const langData = {
  "ar_SY": {
    "help.list": "{list}",
    "help.commandNotExists": "❌ الأمر {command} غير موجود.",
    "help.commandDetails": ` ◆ الاسم: {name}\n ◆ الأسماء المستعارة: {aliases}\n ◆ الوصف: {description}\n ◆ الاستخدام: {usage}\n ◆ الصلاحيات: {permissions}\n ◆ الفئة: {category}\n ◆ وقت الانتظار: {cooldown} ثانية\n ◆ المطور: حمودي سان 🇸🇩`,
    "0": "عضو",
    "1": "إدارة المجموعة",
    "2": "إدارة البوت",
    "ADMIN": "المطور",
    "GENERAL": "عضو",
    "TOOLS": "أدوات",
    "ECONOMY": "اقتصاد",
    "MEDIA": "وسائط",
    "GROUP": "مجموعة",
    "AI": "ذكاء"
  }
};

function getCommandName(commandName) {
  if (global.plugins.commandsAliases.has(commandName)) return commandName;
  for (let [key, value] of global.plugins.commandsAliases) {
    if (value.includes(commandName)) return key;
  }
  return null;
}

async function ensureImageExists() {
  const folderPath = "./cache";
  const filePath = `${folderPath}/botW.jpg`;
  const imageUrl = "https://i.postimg.cc/sDwzm8XB/Messenger-creation-1069310175245840.jpg";

  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
  if (!fs.existsSync(filePath)) {
    const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(data));
  }

  return fs.createReadStream(filePath);
}

async function onCall({ message, args, getLang, userPermissions, prefix }) {
  const { commandsConfig } = global.plugins;
  const commandName = args[0]?.toLowerCase();
  const language = message?.thread?.data?.language || global.config.LANGUAGE || 'ar_SY';

  if (!commandName) {
    let commands = {};

    for (const [key, value] of commandsConfig.entries()) {
      if (value.isHidden) continue;
      if (value.isAbsolute && !global.config?.ABSOLUTES.includes(message.senderID)) continue;
      if (!value.permissions?.some(p => userPermissions.includes(p))) continue;

      let category = value.category || "GENERAL";
      if (langData[language][category.toUpperCase()]) {
        category = langData[language][category.toUpperCase()];
      }

      if (!commands[category]) commands[category] = [];
      const displayName = value._name?.[language] || key;
      commands[category].push(displayName);
    }

    // بداية العرض باستايل دورا
    let list = "📖 دورا تقول: هل ترون أوامر؟ قولو: أوامر 👏👏 أحسنتم\n\n";

    for (const [category, cmds] of Object.entries(commands)) {
      list += ` 🌸 ❴ ${category} ❵\n\n`;
      for (let i = 0; i < cmds.length; i += 4) {
        const row = cmds.slice(i, i + 4).map(cmd => `✨ ${cmd}`).join("   ");
        list += `${row}\n———————————————\n`;
      }
      list += "\n";
    }

    const total = Object.values(commands).reduce((sum, arr) => sum + arr.length, 0);
    list += `———————————————\n`;
    list += ` 🎀 مجموع الأوامر: ${total}\n`;
    list += ` 👩‍💻 المطور: حمودي سان 🇸🇩\n`;
    list += ` 💖 دورا تحبكم 💋\n`;
    list += `———————————————\n`;
    list += ` 🔎 استخدم: ${prefix}اوامر + اسم الأمر لرؤية التفاصيل\n`;

    const imageStream = await ensureImageExists();
    return message.reply({ body: getLang("help.list", { list }), attachment: imageStream });
  }

  const command = commandsConfig.get(getCommandName(commandName));
  if (!command) return message.reply(getLang("help.commandNotExists", { command: commandName }));

  const isHidden = !!command.isHidden;
  const isUserValid = !command.isAbsolute || global.config?.ABSOLUTES.includes(message.senderID);
  const isPermissionValid = command.permissions?.some(p => userPermissions.includes(p));
  if (isHidden || !isUserValid || !isPermissionValid) {
    return message.reply(getLang("help.commandNotExists", { command: commandName }));
  }

  let category = command.category || "GENERAL";
  if (langData[language][category.toUpperCase()]) {
    category = langData[language][category.toUpperCase()];
  }

  message.reply(getLang("help.commandDetails", {
    name: command.name,
    aliases: command.aliases?.join(", ") || "لا يوجد",
    version: command.version || "1.0.0",
    description: command.description || "لا يوجد وصف",
    usage: `${prefix}${commandName} ${command.usage || ""}`,
    permissions: command.permissions.map(p => getLang(String(p))).join(", "),
    category,
    cooldown: command.cooldown || 3,
    credits: command.credits || "حمودي سان 🇸🇩"
  }).replace(/^ +/gm, ''));
}

export default {
  config,
  langData,
  onCall
};
