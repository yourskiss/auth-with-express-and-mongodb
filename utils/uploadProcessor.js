import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function processProfileImage(reqFile, existingProfilePicture, id) {
  const inputPath = path.join(__dirname, '../public/userprofile', reqFile.filename);
  const croppedFilename = `${id}-${reqFile.filename}`;
  const outputPath = path.join(__dirname, '../public/userprofile', croppedFilename);

  // Crop image to 300x300
  await sharp(inputPath)
    .resize(300, 300)
    .toFile(outputPath);

  // Delete original image
  fs.unlinkSync(inputPath);

  // Delete old profile picture if it exists
  if (existingProfilePicture?.filename) {
    const oldPath = path.join(__dirname, '../public/userprofile', existingProfilePicture.filename);
    fs.unlink(oldPath, err => {
      if (err) console.error("Failed to delete old photo:", err);
    });
  }

  return {
    url: `/userprofile/${croppedFilename}`,
    filename: croppedFilename,
    contentType: reqFile.mimetype
  };
}
