// ============================================================================
// ERROR MIDDLEWARE - DESIGNED BY BACKEND AGENT
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../types/candidate.types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let response: ApiResponse;

  // Error de validación con Zod
  if (err instanceof ZodError) {
    response = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }
    };
    res.status(400).json(response);
    return;
  }

  // Errores personalizados de la aplicación
  if (err instanceof AppError) {
    response = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details })
      }
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Error no controlado
  console.error('Unexpected error:', err);
  
  response = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    }
  };
  
  res.status(500).json(response);
};

// Middleware para capturar rutas no encontradas
export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta ${req.method} ${req.path} no encontrada`
    }
  };
  
  res.status(404).json(response);
};