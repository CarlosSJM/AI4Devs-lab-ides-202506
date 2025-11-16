// ============================================================================
// CANDIDATE CONTROLLER - DESIGNED BY BACKEND AGENT
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { candidateService } from '../services/candidate.service';
import { validateCreateCandidate, validateUpdateCandidate, validateCandidateFilters, validateFileUpload } from '../utils/validation';
import { ValidationError, FileUploadError } from '../utils/errors';
import { ApiResponse } from '../types/candidate.types';

export const createCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = validateCreateCandidate(req.body);
    const candidate = await candidateService.createCandidate(validatedData);
    
    const response: ApiResponse = {
      success: true,
      message: 'Candidato creado exitosamente',
      data: candidate
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getCandidates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = validateCandidateFilters(req.query);
    const result = await candidateService.getCandidates(filters);
    
    const response: ApiResponse = {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCandidateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError('ID de candidato inválido');
    }
    
    const candidate = await candidateService.getCandidateById(id);
    
    const response: ApiResponse = {
      success: true,
      data: candidate
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError('ID de candidato inválido');
    }
    
    const validatedData = validateUpdateCandidate(req.body);
    const candidate = await candidateService.updateCandidate(id, validatedData);
    
    const response: ApiResponse = {
      success: true,
      message: 'Candidato actualizado exitosamente',
      data: candidate
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError('ID de candidato inválido');
    }
    
    const result = await candidateService.deleteCandidate(id);
    
    const response: ApiResponse = {
      success: true,
      message: result.message
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = parseInt(req.params.id);
    if (isNaN(candidateId)) {
      throw new ValidationError('ID de candidato inválido');
    }

    if (!req.file) {
      throw new FileUploadError('No se ha proporcionado ningún archivo');
    }

    // Validar archivo
    validateFileUpload(req.file);

    const documentType = req.body.documentType || 'cv';
    
    const fileData = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.originalname.split('.').pop()?.toLowerCase() || '',
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    };

    const document = await candidateService.uploadDocument(candidateId, fileData, documentType);
    
    const response: ApiResponse = {
      success: true,
      message: 'Documento subido exitosamente',
      data: document
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getCandidateDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = parseInt(req.params.id);
    if (isNaN(candidateId)) {
      throw new ValidationError('ID de candidato inválido');
    }
    
    const documents = await candidateService.getCandidateDocuments(candidateId);
    
    const response: ApiResponse = {
      success: true,
      data: documents
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = parseInt(req.params.id);
    const documentId = parseInt(req.params.documentId);
    
    if (isNaN(candidateId) || isNaN(documentId)) {
      throw new ValidationError('IDs inválidos');
    }
    
    const result = await candidateService.deleteDocument(candidateId, documentId);
    
    const response: ApiResponse = {
      success: true,
      message: result.message
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};