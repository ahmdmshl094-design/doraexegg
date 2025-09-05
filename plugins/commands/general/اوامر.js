import fs from "fs";
import axios from "axios";

const config = {
  name: "اوامر",
  _name: { "ar_SY": "الاوامر" },
  aliases: ["cmds", "مساعدة"],
  version: "1.0.4",
  description: "عرض جميع الأوامر أو تفاصيل أمر معين",
  usage: "[اسم الأمر] (اختياري)",
  credits: "حمودي سان 🇸🇩 <babasnfor505@gmail.com>"
};

const langData = {
  "ar_SY": {
    "help.list": "{list}",
    "help.commandNotExists": "❌ الأمر {command} غير موجود.",
    "help.commandDetails":
      "◆ الاسم: {name}\n" +
      "◆ الأسماء المستعارة: {aliases}\n" +
      "◆ الوصف: {description}\n" +
      "◆ الاستخدام: {usage}\n" +
      "◆ الصلاحيات المطلوبة: {permissions}\n" +
      "◆ الفئة: {category}\n" +
      "◆ وقت الانتظار: {cooldown} ثانية\n" +
      "◆ المطور: حمودي سان 🇸🇩 <babasnfor505@gmail.com>",

    "permissions": {
      "0": "عضو عادي",
      "1": "مشرف مجموعة",
      "2": "مشرف البوت",
      "ADMIN": "المطور"
    },

    "categories": {
      "GENERAL": "عام",
      "TOOLS": "أدوات",
      "ECONOMY": "اقتصاد",
      "MEDIA": "وسائط",
      "GROUP": "مجموعة",
      "AI": "ذكاء اصطناعي"
    }
  }
};

// استرجاع اسم الأمر من الأسماء المستعارة
function getCommandName(commandName) {
  if (global.plugins.commandsAliases.has(commandName)) return commandName;
  for (let [key, value] of global.plugins.commandsAliases) {
    if (value === commandName) return key;
  }
  return null;
}

// عرض تفاصيل الأمر بالعربية
function showCommandDetails(command) {
  if (!command) return langData["ar_SY"]["help.commandNotExists"].replace("{command}", "");

  const permissions = command.permissions?.map(p => langData["ar_SY"].permissions[p] || p).join(", ") || "لا توجد";
  const category = langData["ar_SY"].categories[command.category] || command.category || "عام";
  const aliases = command.aliases?.join(", ") || "لا توجد";

  return langData["ar_SY"]["help.commandDetails"]
    .replace("{name}", command.name)
    .replace("{aliases}", aliases)
    .replace("{description}", command.description || "لا يوجد وصف")
    .replace("{usage}", command.usage || "لا يوجد استخدام")
    .replace("{permissions}", permissions)
    .replace("{category}", category)
    .replace("{cooldown}", command.cooldown || "0");
}

// عرض قائمة جميع الأوامر
function listAllCommands(commands) {
  if (!commands || commands.length === 0) return "❌ لا توجد أوامر متاحة.";

  const list = commands.map(cmd => `• ${cmd.name} (${cmd.aliases?.join(", ") || "لا توجد"}): ${cmd.description}`).join("\n");
  return langData["ar_SY"]["help.list"].replace("{list}", list);
}

// مثال على الاستخدام مع البوت
async function handleHelpCommand(input, allCommands) {
  if (!input) {
    // عرض كل الأوامر
    return listAllCommands(allCommands);
  } else {
    // عرض تفاصيل أمر محدد
    const cmdName = getCommandName(input);
    const command = allCommands.find(c => c.name === cmdName);
    return showCommandDetails(command);
  }
}

export { config, langData, getCommandName, showCommandDetails, listAllCommands, handleHelpCommand };
