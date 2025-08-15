import axios from 'axios';

const config = {
  name: 'مشمش',
  version: '3.1',
  permissions: 0,
  credits: 'rapido + Copilot',
  description: 'مساعد ذكي بذاكرة مؤقتة لكل عضو ويدعم الصور، مع أمر نسيان',
  commandCategory: 'ai',
  usages: '[نص] أو [/ننسى] لمسح الذاكرة',
  cooldown: 5
};

// ذاكرة مؤقتة لكل عضو
const memory = {};

async function onCall({ message, args}) {
  const text = args.join(' ').trim();
  const { senderID, attachments, messageReply} = message;

  if (!text) return message.reply("👀 اها يا زول، عايز تقول شنو؟");

  // أمر نسيان
  if (text === "/ننسى") {
    delete memory[senderID];
    return message.reply("🧠 خلاص يا زول، نسيت كل حاجة. نبدأ من جديد.");
}

  // استخراج رابط الصورة من الرد أو المرفقات
  let imageUrl = null;
  if (messageReply?.attachments?.[0]?.type === "photo") {
    imageUrl = messageReply.attachments[0].url;
} else if (attachments?.[0]?.type === "photo") {
    imageUrl = attachments[0].url;
}

  // تجهيز المحادثة السابقة
  if (!memory[senderID]) memory[senderID] = [];
  memory[senderID].push(`👤 ${text}`);
  const prompt = memory[senderID].slice(-10).join("\n"); // آخر 10 رسائل فقط

  const apiURL = `https://rapido.zetsu.xyz/api/gemini?chat=${encodeURIComponent(prompt)}&uid=${senderID}${imageUrl? `&imageUrl=${encodeURIComponent(imageUrl)}`: ''}`;

  try {
    const res = await axios.get(apiURL);
    const response = res.data.response;

    memory[senderID].push(`🤖 مشمش: ${response}`);
    message.reply(response);
} catch (err) {
    console.error("❌ خطأ في الاتصال بالـ API:", err);
    message.reply("💥 حصلت مشكلة يا زول، جرب تاني.");
}
}

export default { config, onCall};
