// ============================================================================
// VALIDATION SCHEMAS - DESIGNED BY BACKEND AGENT
// ============================================================================

import { z } from 'zod';

// Esquemas base
const CandidateEducationSchema = z.object({
  institution: z.string().min(1, 'Institución requerida').max(255),
  degree: z.string().max(255).optional(),
  fieldOfStudy: z.string().max(255).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional().default(false),
  gpa: z.number().min(0).max(4).optional(),
  description: z.string().optional()
});

const CandidateExperienceSchema = z.object({
  company: z.string().min(1, 'Empresa requerida').max(255),
  position: z.string().min(1, 'Posición requerida').max(255),
  department: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional().default(false),
  salary: z.number().min(0).optional(),
  currency: z.string().length(3).optional()
});

// Esquema principal para crear candidato
export const CreateCandidateSchema = z.object({
  firstName: z.string()
    .min(1, 'Nombre requerido')
    .max(100, 'Nombre muy largo')
    .trim(),
  lastName: z.string()
    .min(1, 'Apellido requerido')
    .max(100, 'Apellido muy largo')
    .trim(),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muy largo')
    .toLowerCase(),
  phone: z.string()
    .max(20, 'Teléfono muy largo')
    .optional(),
  address: z.string()
    .max(1000, 'Dirección muy larga')
    .optional(),
  notes: z.string()
    .max(2000, 'Notas muy largas')
    .optional(),
  education: z.array(CandidateEducationSchema).optional().default([]),
  experience: z.array(CandidateExperienceSchema).optional().default([])
});

// Esquema para actualizar candidato
export const UpdateCandidateSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  email: z.string().email().max(255).toLowerCase().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(['active', 'in_review', 'hired', 'rejected', 'archived']).optional()
});

// Esquema para filtros de búsqueda
export const CandidateFiltersSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val) || 10, 100) : 10),
  search: z.string().optional(),
  status: z.enum(['active', 'in_review', 'hired', 'rejected', 'archived']).optional(),
  sortBy: z.enum(['createdAt', 'lastName', 'email']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Funciones de validación
export const validateCreateCandidate = (data: unknown) => {
  return CreateCandidateSchema.parse(data);
};

export const validateUpdateCandidate = (data: unknown) => {
  return UpdateCandidateSchema.parse(data);
};

export const validateCandidateFilters = (data: unknown) => {
  return CandidateFiltersSchema.parse(data);
};

// Validación de archivos
export const validateFileUpload = (file: Express.Multer.File) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
  ];

  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Tipo de archivo no permitido. Solo PDF y DOCX.');
  }

  if (file.size > maxSize) {
    throw new Error('Archivo demasiado grande. Máximo 5MB.');
  }

  return true;
};