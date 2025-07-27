import dotenv from 'dotenv';
import cloudinary from '../config/cloudinary.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
export const standardResponse = (res, status, data = undefined, message = undefined, messages = undefined, obj = undefined) => {
  // const statusString = '';
  res.status(status).json({
    status: getStatus(status), message, data, messages, ...obj
  })
}


const getStatus = (status) => {
  if (status >= 200 && status <= 300) {
    return 'success'
  }
  return 'error'
}


export const getDateTime = () => {
  const now = new Date();

  const pad = n => String(n).padStart(2, '0');

  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ` +
    `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}


export const getMonth = () => {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}`;
}

export function getFutureTimeGMT(diff = 3600000) {
  const now = new Date();

  // Add 1 hour
  const future = new Date(now.getTime() + diff);

  // Get UTC parts
  const year = future.getUTCFullYear();
  const month = String(future.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-based
  const day = String(future.getUTCDate()).padStart(2, '0');
  const hours = String(future.getUTCHours()).padStart(2, '0');
  const minutes = String(future.getUTCMinutes()).padStart(2, '0');
  const seconds = String(future.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


export const generateCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}




export const deleteFile = async (fileName, res) => {
  if (!fileName) {
    return null
  }
  if (fileName == 'deleted') {
    return null
  }
  if (process.env.NODE_ENV !== 'production') {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    // if(!/^[\w\-.]+$/.test(fileName)){
    //     return standardResponse(res, 500, undefined, 'Failed', undefined);
    // }p
    const filePath = path.join(__dirname, '..', fileName);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting image ***************////////-:', err);
        return standardResponse(res, 500, undefined, 'Failed to delete image', undefined);
      }
      return true
    });
  }
  else {
    try {
      const result = await cloudinary.uploader.destroy(req.params.publicId);
      res.json(result);
    } catch (err) {
      console.error('Cloudinary delete error:', err);
      return standardResponse(res, 500, undefined, 'Failed to delete image', undefined);
    }
  }
}



export const getPaginationDb = async (sql, cursor, limit, lastId = null, where = '', queryParams = []) => {
  limit++
  let queryParams1 = [...queryParams, limit];
  let lastSql = ''
  if (lastId) {
    lastSql = ` && ${cursor} < ? `
    queryParams1.unshift(lastId)
    // console.log('lllllllllllllllllllllllllllllllllll'+lastId)
  }
  let where1 = `where 1 ${lastSql} ${where}`;
  let fullSql = `${sql} ${where1} ORDER BY ${cursor} DESC LIMIT ?`;
  // console.log(fullSql+'-----')
  // console.log(queryParams1)
  const [rows] = await db.query(fullSql, queryParams1);
  return rows;
}




// export const handleUpload = async (req, options = {}) => {
//   const {
//     allowedMimeTypes = [],
//     uploadsDir = 'uploads',
//   } = options;

//   const file = req.file;
//   if (!file) throw new Error('No file uploaded');

//   if (!allowedMimeTypes.includes(file.mimetype)) {
//     throw new Error('Unsupported file type');
//   }

//   if (process.env.NODE_ENV === 'production') {
//     // Upload to Cloudinary using memory buffer
//     const base64 = file.buffer.toString('base64');
//     const fileStr = `data:${file.mimetype};base64,${base64}`;

//     const result = await cloudinary.uploader.upload(fileStr, {
//       folder: 'uploads',
//       resource_type: 'auto',
//     });

//     return result.secure_url;
//   } else {
//     // Dev: return local path
//     return `/${uploadsDir}/${file.filename}`;
//   }
// };


// export const handleUpload = async (req) => {
//   const __dirname = path.dirname(fileURLToPath(import.meta.url));
//   const uploadsDir = path.join(__dirname, '..', 'uploads');

//   const file = req.file;
//   if (!file) throw new Error('No file uploaded');

//   if (process.env.NODE_ENV === 'production') {
//     const base64 = file.buffer.toString('base64');
//     const fileStr = `data:${file.mimetype};base64,${base64}`;

//     const result = await cloudinary.uploader.upload(fileStr, {
//       folder: 'uploads',
//       resource_type: 'auto',
//     });

//     return result.secure_url;
//   } else {
//     const ext = path.extname(file.originalname);
//     const filename = `${file.fieldname}-${uuidv4()}${ext}`;
//     const outputDir = path.resolve(uploadsDir); // ✅ resolve to absolute path
//     const filePath = path.join(outputDir, filename);

//     //  fs.mkdir(outputDir, { recursive: true }); // ✅ make sure dir exists
//      fs.writeFile(filePath, file.buffer);

//     return `/${uploadsDir}/${filename}`;
//   }
// };



// export const handleUpload = async (req, options = {}) => {
//   const __dirname = path.dirname(fileURLToPath(import.meta.url));
//   const uploadsDir = path.join(__dirname, '..', 'uploads');


//   const file = req.file;
//   if (!file) throw new Error('No file uploaded');

//   if (process.env.NODE_ENV === 'production') {
//     // Read from disk and upload to Cloudinary
//     const fileBuffer = await fs.readFile(file.path); // ✅ read from disk
//     const base64 = fileBuffer.toString('base64');
//     const fileStr = `data:${file.mimetype};base64,${base64}`;

//     const result = await cloudinary.uploader.upload(fileStr, {
//       folder: 'uploads',
//       resource_type: 'auto',
//     });

//     return result.secure_url;
//   } else {
//     // Dev: rename or move file
//     const ext = path.extname(file.originalname);
//     const filename = `${file.fieldname}-${uuidv4()}${ext}`;
//     const absoluteUploadsDir = path.resolve(uploadsDir);
//     const destPath = path.join(absoluteUploadsDir, filename);

//     console.log('Destination Path:', destPath);
//     console.log('Upload Path:', absoluteUploadsDir);
//     if (!uploadsDir || typeof uploadsDir !== 'string') {
//       throw new Error('uploadsDir must be a valid string path');
//     }
//      fs.mkdirSync(absoluteUploadsDir, { recursive: true });

//     const fileBuffer =  fs.readFileSync(file.path); // ✅ read from disk
//      fs.writeFileSync(destPath, fileBuffer);         // ✅ save to new path

//     return `/uploads/${filename}`;
//   }
// };




export const handleUpload = async (req, options = {}) => {
  const {
    uploadsDir = 'uploads',
  } = options;

  const file = req.file;
  if (!file || !file.buffer) {
    throw new Error('No file uploaded or file buffer missing');
  }

  if (process.env.NODE_ENV === 'production') {
    // Upload to Cloudinary
    const base64 = file.buffer.toString('base64');
    const fileStr = `data:${file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(fileStr, {
      folder: 'uploads',
      resource_type: 'auto',
    });

    return result.secure_url;
  } else {
    // Save to local disk
    const ext = path.extname(file.originalname) || '';
    const filename = `${file.fieldname}-${uuidv4()}${ext}`;
    const destPath = path.join(uploadsDir, filename);

    // Ensure upload folder exists
    fs.mkdirSync(uploadsDir, { recursive: true });

    // Write file to disk
    fs.writeFileSync(destPath, file.buffer);
    console.log('File saved to:', `/${uploadsDir}/${filename}`);
    return `/${uploadsDir}/${filename}`; // Return relative path for local use
  }
};




