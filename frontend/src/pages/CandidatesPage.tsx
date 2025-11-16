// ============================================================================
// CANDIDATES PAGE - DESIGNED BY FRONTEND AGENT
// ============================================================================

import React, { useState } from 'react';
import { useCandidates } from '../hooks/useCandidates';
import { useToast, ToastContainer } from '../components/common/Toast';
import { CandidateList } from '../components/candidates/CandidateList';
import { CandidateForm } from '../components/candidates/CandidateForm';
import { CandidateFiltersComponent, Pagination } from '../components/candidates/CandidateFilters';
import { CreateCandidateDto, Candidate } from '../types/candidate.types';

export const CandidatesPage: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
  
  const { toast, toasts, removeToast } = useToast();
  
  const {
    candidates,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    clearFilters,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    uploadDocument,
    setError,
  } = useCandidates();

  // Handle create candidate
  const handleCreateCandidate = async (data: CreateCandidateDto) => {
    try {
      await createCandidate(data);
      setShowAddForm(false);
      toast.success('Candidato creado exitosamente');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear candidato');
      throw err; // Re-throw to prevent form reset
    }
  };

  // Handle update candidate
  const handleUpdateCandidate = async (data: any) => {
    if (!editingCandidate) return;
    
    try {
      await updateCandidate(editingCandidate.id, data);
      setEditingCandidate(null);
      toast.success('Candidato actualizado exitosamente');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar candidato');
    }
  };

  // Handle delete candidate
  const handleDeleteCandidate = async (id: number) => {
    try {
      await deleteCandidate(id);
      toast.success('Candidato eliminado exitosamente');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar candidato');
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  // Clear error when user takes action
  const handleClearError = () => {
    setError(null);
  };

  // Show add form
  const handleShowAddForm = () => {
    setShowAddForm(true);
    setEditingCandidate(null);
    setViewingCandidate(null);
  };

  // Cancel form
  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingCandidate(null);
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-2xl)' }}>
      {/* Page Header */}
      <header className="mb-xl">
        <div className="flex items-center justify-between mb-md">
          <div>
            <h1 className="text-2xl font-semibold">Gestión de Candidatos</h1>
            <p className="text-secondary">
              Administra todos los candidatos en tu sistema ATS
            </p>
          </div>
          
          {!showAddForm && !editingCandidate && (
            <button
              onClick={handleShowAddForm}
              className="btn btn-primary"
            >
              ➕ Agregar Candidato
            </button>
          )}
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid gap-md mb-lg" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="card">
              <div className="card-body text-center">
                <div className="text-2xl font-semibold text-primary">
                  {pagination.total}
                </div>
                <div className="text-sm text-secondary">
                  Total Candidatos
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body text-center">
                <div className="text-2xl font-semibold text-warning">
                  {candidates.filter(c => c.status === 'in_review').length}
                </div>
                <div className="text-sm text-secondary">
                  En Revisión
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body text-center">
                <div className="text-2xl font-semibold text-success">
                  {candidates.filter(c => c.status === 'hired').length}
                </div>
                <div className="text-sm text-secondary">
                  Contratados
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Error Display */}
      {error && (
        <div className="card mb-lg" style={{ borderColor: 'var(--color-error)' }}>
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-md">
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <h3 className="font-medium text-error">Error</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
              <button
                onClick={handleClearError}
                className="btn btn-secondary btn-sm"
              >
                ✕ Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Candidate Form */}
      {showAddForm && (
        <div className="mb-xl">
          <CandidateForm
            onSubmit={handleCreateCandidate}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Edit Candidate Form */}
      {editingCandidate && (
        <div className="mb-xl">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">
                Editar Candidato: {editingCandidate.firstName} {editingCandidate.lastName}
              </h2>
            </div>
            <div className="card-body">
              {/* Simple edit form for basic fields */}
              <div className="grid gap-md" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div className="form-field">
                  <label className="form-label">Estado</label>
                  <select
                    value={editingCandidate.status}
                    onChange={(e) => handleUpdateCandidate({ status: e.target.value })}
                    className="form-input"
                  >
                    <option value="active">Activo</option>
                    <option value="in_review">En Revisión</option>
                    <option value="hired">Contratado</option>
                    <option value="rejected">Rechazado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button
                onClick={() => setEditingCandidate(null)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate List View */}
      {!showAddForm && !editingCandidate && (
        <>
          {/* Filters */}
          <CandidateFiltersComponent
            filters={filters}
            onFiltersChange={updateFilters}
            onClear={clearFilters}
          />

          {/* Loading State */}
          {loading && !candidates.length && (
            <div className="text-center" style={{ padding: 'var(--spacing-2xl)' }}>
              <div className="spinner" style={{ width: '2rem', height: '2rem' }} />
              <p className="mt-md text-secondary">Cargando candidatos...</p>
            </div>
          )}

          {/* Candidates List */}
          <CandidateList
            candidates={candidates}
            isLoading={loading && !candidates.length}
            onEdit={(candidate) => setEditingCandidate(candidate)}
            onDelete={handleDeleteCandidate}
            onView={(candidate) => setViewingCandidate(candidate)}
          />

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />

          {/* Results Summary */}
          {!loading && candidates.length > 0 && (
            <div className="text-center mt-lg">
              <p className="text-sm text-secondary">
                Mostrando {candidates.length} de {pagination.total} candidatos
                {filters.search && ` (filtrados por "${filters.search}")`}
              </p>
            </div>
          )}
        </>
      )}

      {/* Candidate Detail Modal (simplified) */}
      {viewingCandidate && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--spacing-md)',
          }}
          onClick={() => setViewingCandidate(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">
                  {viewingCandidate.firstName} {viewingCandidate.lastName}
                </h2>
                <button
                  onClick={() => setViewingCandidate(null)}
                  className="btn btn-secondary btn-sm"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-md">
                <div>
                  <h3 className="font-medium mb-sm">Información de Contacto</h3>
                  <p>📧 {viewingCandidate.email}</p>
                  {viewingCandidate.phone && <p>📞 {viewingCandidate.phone}</p>}
                  {viewingCandidate.address && <p>📍 {viewingCandidate.address}</p>}
                </div>

                {viewingCandidate.education?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-sm">Educación</h3>
                    {viewingCandidate.education.map((edu, index) => (
                      <div key={edu.id} className="mb-sm">
                        <p className="font-medium">{edu.institution}</p>
                        {edu.degree && <p className="text-sm">{edu.degree}</p>}
                        {edu.fieldOfStudy && <p className="text-sm text-secondary">{edu.fieldOfStudy}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {viewingCandidate.experience?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-sm">Experiencia</h3>
                    {viewingCandidate.experience.map((exp, index) => (
                      <div key={exp.id} className="mb-sm">
                        <p className="font-medium">{exp.position} en {exp.company}</p>
                        {exp.description && <p className="text-sm text-secondary">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {viewingCandidate.documents?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-sm">Documentos</h3>
                    {viewingCandidate.documents.map((doc) => (
                      <div key={doc.id} className="text-sm">
                        📄 {doc.originalName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onCloseToast={removeToast} />
    </div>
  );
};