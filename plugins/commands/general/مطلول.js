import { createCanvas, loadImage} from "canvas";
import fs from "fs-extra";
import path from "path";
import axios from "axios";

async function getAvatarUrl(userID) {
  try {
    const res = await axios.post("https://www.facebook.com/api/graphql/", null, {
      params: {
        doc_id: "5341536295888250",
        variables: JSON.stringify({ height: 400, scale: 1, userID, width: 400})
}
});
    return res.data.data.profile.profile_picture.uri;
} catch {
    return "https://i.ibb.co/bBSpr5v/143086968-2856368904622192-1959732218791162458-n.png";
}
}

export async function makeCenteredImage({ userID}) {
  await fs.ensureDir(global.cachePath);

  const avatarUrl = await getAvatarUrl(userID);
  const avatarPath = path.join(global.cachePath, `centered_${userID}.png`);
  await global.downloadFile(avatarPath, avatarUrl);

  const overlayURL = "https://i.postimg.cc/vmFqjkw8/467471884-1091680152417037-7359182676446817237-n.jpg";
  const overlayPath = path.join(global.cachePath, "overlay_template.png");
  await global.downloadFile(overlayPath, overlayURL);

  const overlayImg = await loadImage(overlayPath);
  const avatarImg = await loadImage(avatarPath);

  const canvas = createCanvas(overlayImg.width, overlayImg.height);
  const ctx = canvas.getContext("2d");

  // رسم الخلفية
  ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);

  // إعدادات الصورة في المنتصف
  const avatarSize = overlayImg.width / 2;
  const x = overlayImg.width / 2 - avatarSize / 2;
  const y = overlayImg.height / 2 - avatarSize / 2 - 25;

  // رسم الصورة بشكل دائري
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatarImg, x, y, avatarSize, avatarSize);
  ctx.restore();

  // بوردر أبيض حول الصورة
  ctx.beginPath();
  ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  const outputPath = path.join(global.cachePath, `centered_result_${userID}.png`);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputPath, buffer);

  fs.unlinkSync(avatarPath);
  fs.unlinkSync(overlayPath);

  return outputPath;
}
