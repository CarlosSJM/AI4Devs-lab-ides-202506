// ============================================================================
// UPLOAD MIDDLEWARE - DESIGNED BY BACKEND AGENT
// ============================================================================

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { FileUploadError } from '../utils/errors';

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads/candidates');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generar nombre único: timestamp-candidateId-random-originalname
    const candidateId = req.params.id || 'unknown';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    const fileName = `${timestamp}-${candidateId}-${randomString}-${baseName}${extension}`;
    cb(null, fileName);
  }
});

// Filtro de archivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new FileUploadError('Tipo de archivo no permitido. Solo se permiten archivos PDF y DOCX.'));
  }
};

// Configuración de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware para manejar errores de multer
export const handleMulterError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return next(new FileUploadError('El archivo es demasiado grande. Tamaño máximo: 5MB'));
      case 'LIMIT_UNEXPECTED_FILE':
        return next(new FileUploadError('Campo de archivo inesperado'));
      default:
        return next(new FileUploadError(`Error de upload: ${error.message}`));
    }
  }
  next(error);
};