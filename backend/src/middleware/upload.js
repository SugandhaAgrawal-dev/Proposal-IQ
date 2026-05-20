import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads (memory storage for Supabase upload)
const storage = multer.memoryStorage();

// File filter for RFP documents
const rfpFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
  }
};

// File filter for knowledge base documents
const knowledgeFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/markdown',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, DOCX, TXT, MD.'), false);
  }
};

// RFP upload middleware (single file, max 20MB)
export const uploadRFP = multer({
  storage,
  fileFilter: rfpFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
}).single('file');

// Knowledge base upload middleware (single file, max 20MB)
export const uploadKnowledge = multer({
  storage,
  fileFilter: knowledgeFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
}).single('file');

/**
 * Multer error handler
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 20MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

export default { uploadRFP, uploadKnowledge, handleUploadError };
