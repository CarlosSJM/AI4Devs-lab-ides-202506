// ============================================================================
// CANDIDATES HOOK - DESIGNED BY FRONTEND AGENT
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { candidateService } from '../services/candidate.service';
import { 
  Candidate, 
  CandidateFilters, 
  CreateCandidateDto,
  UpdateCandidateDto 
} from '../types/candidate.types';

export const useCandidates = (initialFilters: CandidateFilters = {}) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CandidateFilters>(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch candidates with current filters
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await candidateService.getCandidates(filters);
      
      if (response.success && response.data) {
        setCandidates(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar candidatos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Update filters and refresh
  const updateFilters = useCallback((newFilters: Partial<CandidateFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 10 });
  }, []);

  // Create candidate
  const createCandidate = useCallback(async (data: CreateCandidateDto): Promise<Candidate> => {
    try {
      const response = await candidateService.createCandidate(data);
      
      if (response.success && response.data) {
        // Refresh list after creation
        fetchCandidates();
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Error al crear candidato');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear candidato';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCandidates]);

  // Update candidate
  const updateCandidate = useCallback(async (id: number, data: UpdateCandidateDto): Promise<Candidate> => {
    try {
      const response = await candidateService.updateCandidate(id, data);
      
      if (response.success && response.data) {
        // Update local state
        setCandidates(prev => 
          prev.map(candidate => 
            candidate.id === id ? response.data! : candidate
          )
        );
        return response.data;
      }
      
      throw new Error(response.error?.message || 'Error al actualizar candidato');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar candidato';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete candidate
  const deleteCandidate = useCallback(async (id: number): Promise<void> => {
    try {
      const response = await candidateService.deleteCandidate(id);
      
      if (response.success) {
        // Remove from local state
        setCandidates(prev => prev.filter(candidate => candidate.id !== id));
        
        // Refresh if current page becomes empty
        if (candidates.length === 1 && pagination.page > 1) {
          updateFilters({ page: pagination.page - 1 });
        }
      } else {
        throw new Error(response.error?.message || 'Error al eliminar candidato');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar candidato';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [candidates.length, pagination.page, updateFilters]);

  // Upload document
  const uploadDocument = useCallback(async (candidateId: number, file: File): Promise<void> => {
    try {
      const response = await candidateService.uploadDocument(candidateId, file);
      
      if (response.success) {
        // Update candidate in local state with new document
        setCandidates(prev =>
          prev.map(candidate =>
            candidate.id === candidateId
              ? { ...candidate, documents: [...candidate.documents, response.data!] }
              : candidate
          )
        );
      } else {
        throw new Error(response.error?.message || 'Error al subir documento');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir documento';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Effect to fetch candidates when filters change
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    // State
    candidates,
    loading,
    error,
    filters,
    pagination,
    
    // Actions
    fetchCandidates,
    updateFilters,
    clearFilters,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    uploadDocument,
    
    // Utilities
    setError: (error: string | null) => setError(error),
  };
};