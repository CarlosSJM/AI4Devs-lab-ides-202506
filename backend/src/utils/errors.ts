// ============================================================================
// ERROR HANDLING - DESIGNED BY BACKEND AGENT
// ============================================================================

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational = true,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(404, 'NOT_FOUND', `${resource} no encontrado`);
  }
}

export class DuplicateError extends AppError {
  constructor(field: string) {
    super(409, 'DUPLICATE_ERROR', `Ya existe un registro con este ${field}`);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(500, 'DATABASE_ERROR', message, true, details);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string) {
    super(400, 'FILE_UPLOAD_ERROR', message);
  }
}