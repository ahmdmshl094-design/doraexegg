import fs from 'fs';
import path from 'path';

export default async function ({ event}) {
  const { api} = global;
  const { threadID, author, logMessageData} = event;
  const { Threads, Users} = global.controllers;
  const getThread = (await Threads.get(threadID)) || {};
  const getThreadData = getThread.data || {};
  const getThreadInfo = getThread.info || {};
  const botID = api.getCurrentUserID();

  const authorName = (await Users.getInfo(author))?.name || author;

  const joinNameArray = [], mentions = [], warns = [];

  for (const participant of logMessageData.addedParticipants) {
    const uid = participant.userFbId;
    const joinName = participant.fullName;

    if (
      getThreadInfo.members.some(
        (mem) => mem.userID == uid && mem?.warns?.length>= 3
)
) {
      warns.push(uid);
      continue;
}

    joinNameArray.push(joinName);
    mentions.push({ id: uid, tag: joinName});
}

  // حذف الأعضاء المحذّرين
  for (const uid of warns) {
    await new Promise((resolve) => {
      api.removeUserFromGroup(uid, threadID, (err) => {
        if (err) return resolve();
        const username = logMessageData.addedParticipants.find(
          (i) => i.userFbId == uid
).fullName;
        api.sendMessage({
          body: `🚫 ${username} عندو 3 تحذيرات وتم طرده.`,
          mentions: [{ id: uid, tag: username}]
}, threadID, () => resolve());
});
});
}

  // رسالة الترحيب
  const oldMembersLength = getThreadInfo.members.length - joinNameArray.length;
  const newCount = joinNameArray.map((_, i) => i + oldMembersLength + 1);

  const welcomeText = (getThreadData?.joinMessage
? getThreadData.joinMessage
: `👋 مرحب بيكم يا زول!\n{members} دخلوا القروب.\nعددكم هسه {newCount} في {threadName}`
)
.replace(/\{members}/g, joinNameArray.join(", "))
.replace(/\{newCount}/g, newCount.join(", "))
.replace(/\{threadName}/g, getThreadInfo.name || threadID);

  const localImagePath = path.join(__dirname, 'p1.png');
  let attachment = null;

  if (fs.existsSync(localImagePath)) {
    try {
      attachment = fs.createReadStream(localImagePath);
} catch (err) {
      console.error("❌ فشل تحميل الصورة:", err);
}
}

  const finalMessage = {
    body: welcomeText,
    mentions,
...(attachment? { attachment}: {})
};

  if (joinNameArray.length> 0) {
    api.sendMessage(finalMessage, threadID, (err) => {
      if (err) console.error("❌ فشل إرسال رسالة الترحيب:", err);
});
}

  await Threads.updateInfo(threadID, {
    members: getThreadInfo.members,
    isSubscribed: true
});

  return;
}
