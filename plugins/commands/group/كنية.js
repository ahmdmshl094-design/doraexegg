export const config = {
    name: "كنية",
    version: "0.0.1-xaviaBot-port",
    permissions: [1, 2],
    credits: "Mirai Team",
    description: "Đổi biệt danh ai đó",
    usage: "[name]",
    cooldowns: 3
};

export async function onCall({ message, args }) {
    const nickname = args.join(" ")
    const mention = Object.keys(message.mentions)[0];
    if (!mention) return global.api.changeNickname(`${nickname}`, message.threadID, message.senderID);
    if (mention[0]) return global.api.changeNickname(`${nickname.replace(message.mentions[mention], "")}`, message.threadID, mention);
}
