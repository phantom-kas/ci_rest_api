// config/multer.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');

if (process.env.NODE_ENV !== 'production' && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// export const createUploadMiddleware = (allowedMimeTypes = []) => {
//   const isProd = process.env.NODE_ENV === 'production';

//   const storage = isProd
//     ? multer.memoryStorage() // 👈 keep in memory for Cloudinary
//     : multer.diskStorage({
//         destination: (_, __, cb) => cb(null, uploadDir),
//         filename: (_, file, cb) => {
//           const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
//           const ext = path.extname(file.originalname);
//           cb(null, `${file.fieldname}-${unique}${ext}`);
//         },
//       });

//   const fileFilter = (req, file, cb) => {
//     if (allowedMimeTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Unsupported file type'), false);
//     }
//   };

//   return multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   });
// };

// export const createUploadMiddleware = (allowedMimeTypes = [], uploadDir = 'uploads') => {
//   const storage = multer.diskStorage({
//     destination: (_, __, cb) => cb(null, uploadDir),
//     filename: (_, file, cb) => {
//       const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
//       const ext = path.extname(file.originalname);
//       cb(null, `${file.fieldname}-${unique}${ext}`);
//     },
//   });

//   const fileFilter = (req, file, cb) => {
//     if (allowedMimeTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Unsupported file type'), false);
//     }
//   };

//   return multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   });
// };





export const createUploadMiddleware = (allowedMimeTypes = []) => {
  const storage = {
    _handleFile(req, file, cb) {
      const chunks = [];
      file.stream.on('data', chunk => chunks.push(chunk));
      file.stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        file.buffer = buffer; // ⬅️ Attach buffer manually for later use
        cb(null, { buffer }); // ⬅️ This keeps multer happy
      });
      file.stream.on('error', cb);
    },
    _removeFile(req, file, cb) {
      delete file.buffer;
      cb(null);
    },
  };

  const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
};