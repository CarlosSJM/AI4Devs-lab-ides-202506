// ============================================================================
// CANDIDATE FILTERS COMPONENT - DESIGNED BY FRONTEND AGENT
// ============================================================================

import React, { useState, useCallback } from 'react';
import { CandidateFilters, CandidateStatus } from '../../types/candidate.types';

interface CandidateFiltersProps {
  filters: CandidateFilters;
  onFiltersChange: (filters: Partial<CandidateFilters>) => void;
  onClear: () => void;
}

export const CandidateFiltersComponent: React.FC<CandidateFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    onFiltersChange({ search, page: 1 }); // Reset to page 1 when searching
  }, [onFiltersChange]);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as CandidateStatus | '';
    onFiltersChange({ 
      status: status || undefined, 
      page: 1 
    });
  }, [onFiltersChange]);

  const handleSortChange = useCallback((field: string, value: string) => {
    onFiltersChange({ [field]: value, page: 1 });
  }, [onFiltersChange]);

  const hasActiveFilters = filters.search || filters.status || 
                          filters.sortBy !== 'createdAt' || 
                          filters.sortOrder !== 'desc';

  return (
    <div className="card mb-lg">
      <div className="card-body">
        {/* Main search bar */}
        <div className="flex gap-md items-center mb-md">
          <div className="form-field" style={{ flex: 1 }}>
            <label htmlFor="search" className="form-label">Buscar candidatos</label>
            <div style={{ position: 'relative' }}>
              <input
                id="search"
                type="text"
                placeholder="Buscar por nombre, email..."
                value={filters.search || ''}
                onChange={handleSearchChange}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              >
                🔍
              </span>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="status" className="form-label">Estado</label>
            <select
              id="status"
              value={filters.status || ''}
              onChange={handleStatusChange}
              className="form-input"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="in_review">En Revisión</option>
              <option value="hired">Contratado</option>
              <option value="rejected">Rechazado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>

          <div className="flex gap-sm">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn btn-secondary btn-sm"
            >
              {isExpanded ? '➖ Menos filtros' : '➕ Más filtros'}
            </button>
            
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClear}
                className="btn btn-secondary btn-sm"
              >
                🗑️ Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Expanded filters */}
        {isExpanded && (
          <div className="grid gap-md" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="form-field">
              <label className="form-label">Ordenar por</label>
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleSortChange('sortBy', e.target.value)}
                className="form-input"
              >
                <option value="createdAt">Fecha de creación</option>
                <option value="lastName">Apellido</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Orden</label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleSortChange('sortOrder', e.target.value)}
                className="form-input"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Resultados por página</label>
              <select
                value={filters.limit || 10}
                onChange={(e) => handleSortChange('limit', e.target.value)}
                className="form-input"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-md" style={{ 
            padding: 'var(--spacing-sm)', 
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '0.875rem'
          }}>
            <span className="font-medium text-secondary">Filtros activos: </span>
            {filters.search && (
              <span className="text-primary">Búsqueda: "{filters.search}" </span>
            )}
            {filters.status && (
              <span className="text-primary">Estado: {filters.status} </span>
            )}
            {filters.sortBy !== 'createdAt' && (
              <span className="text-primary">Orden: {filters.sortBy} </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-sm mt-lg">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="btn btn-secondary btn-sm"
      >
        ← Anterior
      </button>

      {/* Page numbers */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="text-muted">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={`btn btn-sm ${
                currentPage === page ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="btn btn-secondary btn-sm"
      >
        Siguiente →
      </button>
    </div>
  );
};