// middleware/uploadPP.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/userprofile');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
   // const basename = path.basename(file.originalname, ext).replace(/\s+/g, '-');
   // const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
   // const unique = `${randomNumber}-${Date.now()}${ext}`;
    const unique = `${Date.now()}${ext}`;
    cb(null, unique);
  }
});

function imageFileFilter(req, file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype.toLowerCase());
  const ext = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && ext) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png) are allowed'));
  }
}

const uploadPP = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: imageFileFilter
});

export default uploadPP;
