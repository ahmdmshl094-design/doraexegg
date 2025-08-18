import axios from 'axios';

const config = {
  name: "جبتي",
  description: "دردشة ذكية (نصوص، صور، صوت)",
  usage: "ai [سؤالك/صور/صوت]",
  credits: "Perplexity",
  cooldown: 5
};

async function onCall({ message, args, senderID, attachments}) {
  let query = args.join(" ").trim();
  let extraMedia = "";

  if (attachments && attachments.length) {
    let urls = attachments
.filter(a => a.type === "photo" || a.type === "audio")
.map(a => a.url);
    if (urls.length) extraMedia = "\n[media]: " + urls.join(", ");
}

  if (!query &&!extraMedia.length) {
    return message.reply("اهلا كيف برو 🐢");
}

  let prompt = query + extraMedia;

  try {
    const res = await axios.get(
      `https://rapido.zetsu.xyz/api/gpt4-1?query=${encodeURIComponent(prompt)}&uid=${senderID}`
);

    let replyText = res.data?.response || "ما لقيت جواب...";
    let finalMsg = ` ❴ \n${replyText}\n ❵`;
    message.reply(finalMsg);

} catch (e) {
    console.error(e);
    message.reply("😔 حصل خطأ في الاتصال بالذكاء الاصطناعي!");
}
}

export default {
  config,
  onCall
};
