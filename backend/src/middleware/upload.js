import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getUploadPath = () => process.env.UPLOAD_PATH || './uploads';

const itemsDir = path.join(getUploadPath(), 'items');
const avatarsDir = path.join(getUploadPath(), 'avatars');
const chatsDir = path.join(getUploadPath(), 'chats');

ensureDir(itemsDir);
ensureDir(avatarsDir);
ensureDir(chatsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = itemsDir;
    if (file.fieldname === 'avatar') dest = avatarsDir;
    if (file.fieldname === 'image' && req.originalUrl.includes('chat')) dest = chatsDir;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'), false);
  }
};

const limits = {
  fileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520', 10) // 20MB default
};

const upload = multer({ storage, fileFilter, limits });

export const uploadItemImages = upload.array('images', 5);
export const uploadAvatar = upload.single('avatar');
export const uploadChatImage = upload.single('image');
