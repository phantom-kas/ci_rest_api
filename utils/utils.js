import dotenv from 'dotenv';
import cloudinary from '../config/cloudinary.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt'
import crypto from 'crypto';

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



export const getPaginationService = async (sql, cursor, limit, lastId = null, where = '', queryParams = [],order='') => {
  limit++
  let queryParams1 = [...queryParams, limit];
  let lastSql = ''
  if (lastId) {
    lastSql = ` && ${cursor} < ? `
    queryParams1.unshift(lastId)
    // console.log('lllllllllllllllllllllllllllllllllll'+lastId)
  }
  let where1 = `where 1 ${lastSql} ${where}`;
  let fullSql = `${sql} ${where1}  ORDER BY ${order} ${cursor} DESC LIMIT ?`;
  // console.log(fullSql+'-----')
  // console.log(queryParams1)
  const [rows] = await db.query(fullSql, queryParams1);
  return rows;
}




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




export const editImageInDbService = async (filename, id, tabel) => {
  const [result] = await db.query(`UPDATE ${tabel} set image = ? , __v = __v+1 where id = ? limit 1`, [filename, id],)
  if (result.affectedRows < 1) {
    return false
  }
  return true
}



export const getItemService = async (tabel,cols = '*', where = '1', params = undefined) => {
    const [rows] = await db.query(`SELECT ${cols} from ${tabel} where ${where}`, params);
    return rows;
}

export const editImageUtil = async (req, res, next, tabel) => {
  try {
    const id = req.params.id
    const item = await getItemService(tabel,' image ', '  id = ? limit 1 ', [id])
    await deleteFile(item[0]['image'], res);
    const fileUrl = await handleUpload(req);
    await editImageInDbService(fileUrl, id, tabel)
    return standardResponse(res, 200, {url:fileUrl}, ' Update Successfull')
  }
  catch (err) {
    next(err)
  }
}



export const hashToken = (tkn) => bcrypt.hash(tkn, 12)
export const compareTokens =(tkn1,tkn2)=> bcrypt.compare(tkn1, tkn2)

const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const algorithm = 'aes-256-cbc';

export const decrypt = (encrypted, ivHex) => {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const encrypt = (text) => {
  const iv = crypto.randomBytes(16); // unique per encryption
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'), // send this with metadata
  };
};
