// ============================================================================
// CANDIDATE ROUTES - DESIGNED BY BACKEND AGENT
// ============================================================================

import { Router } from 'express';
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  uploadDocument,
  getCandidateDocuments,
  deleteDocument
} from '../controllers/candidate.controller';
import { upload, handleMulterError } from '../middleware/upload.middleware';

const router = Router();

// ============================================================================
// CANDIDATE CRUD ROUTES
// ============================================================================

/**
 * @route   POST /api/candidates
 * @desc    Crear nuevo candidato
 * @access  Public (por ahora)
 * @body    { firstName, lastName, email, phone?, address?, education?, experience? }
 */
router.post('/', createCandidate);

/**
 * @route   GET /api/candidates
 * @desc    Obtener lista de candidatos con filtros y paginación
 * @access  Public (por ahora)
 * @query   page?, limit?, search?, status?, sortBy?, sortOrder?
 */
router.get('/', getCandidates);

/**
 * @route   GET /api/candidates/:id
 * @desc    Obtener candidato específico por ID
 * @access  Public (por ahora)
 * @params  id: number
 */
router.get('/:id', getCandidateById);

/**
 * @route   PUT /api/candidates/:id
 * @desc    Actualizar candidato existente
 * @access  Public (por ahora)
 * @params  id: number
 * @body    { firstName?, lastName?, email?, phone?, address?, status?, notes? }
 */
router.put('/:id', updateCandidate);

/**
 * @route   DELETE /api/candidates/:id
 * @desc    Eliminar candidato
 * @access  Public (por ahora)
 * @params  id: number
 */
router.delete('/:id', deleteCandidate);

// ============================================================================
// DOCUMENT MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/candidates/:id/documents
 * @desc    Subir documento para candidato (CV, cover letter, etc.)
 * @access  Public (por ahora)
 * @params  id: number (candidateId)
 * @body    FormData with file + documentType?
 */
router.post(
  '/:id/documents',
  upload.single('file'),
  handleMulterError,
  uploadDocument
);

/**
 * @route   GET /api/candidates/:id/documents
 * @desc    Obtener lista de documentos del candidato
 * @access  Public (por ahora)
 * @params  id: number (candidateId)
 */
router.get('/:id/documents', getCandidateDocuments);

/**
 * @route   DELETE /api/candidates/:id/documents/:documentId
 * @desc    Eliminar documento específico del candidato
 * @access  Public (por ahora)
 * @params  id: number (candidateId), documentId: number
 */
router.delete('/:id/documents/:documentId', deleteDocument);

export default router;