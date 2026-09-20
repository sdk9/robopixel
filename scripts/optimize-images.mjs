import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDirectory = path.join(root, "src", "assets", "courses");
const lessonSourceDirectory = path.join(sourceDirectory, "industrial-lessons");
const outputDirectory = path.join(root, "public", "images");
const images = ["ubuntu", "cpp", "ros2", "industrial-robots"];
const lessonImages = [
  "lesson-articulated-arm",
  "lesson-scara",
  "lesson-delta",
  "lesson-cartesian",
  "lesson-humanoid",
  "lesson-cobot",
  "lesson-amr",
];

await mkdir(outputDirectory, { recursive: true });

for (const image of images) {
  const source = path.join(sourceDirectory, `${image}-pixel-art.png`);
  await Promise.all([
    sharp(source)
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(outputDirectory, `${image}-640.webp`)),
    sharp(source)
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(outputDirectory, `${image}-1280.webp`)),
  ]);
}

for (const image of lessonImages) {
  const source = path.join(lessonSourceDirectory, `${image}.png`);
  await Promise.all([
    sharp(source)
      .resize({ width: 640, withoutEnlargement: true, kernel: sharp.kernel.nearest })
      .webp({ quality: 82, smartSubsample: false })
      .toFile(path.join(outputDirectory, `${image}-640.webp`)),
    sharp(source)
      .resize({ width: 1280, withoutEnlargement: true, kernel: sharp.kernel.nearest })
      .webp({ quality: 84, smartSubsample: false })
      .toFile(path.join(outputDirectory, `${image}-1280.webp`)),
  ]);
}

await sharp(path.join(sourceDirectory, "industrial-robots-pixel-art.png"))
  .resize(1200, 630, { fit: "cover" })
  .webp({ quality: 84 })
  .toFile(path.join(outputDirectory, "codetherobot-social.webp"));
