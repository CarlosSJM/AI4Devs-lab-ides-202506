// ============================================================================
// CANDIDATE LIST COMPONENT - DESIGNED BY FRONTEND AGENT
// ============================================================================

import React from 'react';
import { Candidate, CandidateStatus } from '../../types/candidate.types';

interface CandidateListProps {
  candidates: Candidate[];
  isLoading?: boolean;
  onEdit?: (candidate: Candidate) => void;
  onDelete?: (id: number) => void;
  onView?: (candidate: Candidate) => void;
}

const getStatusColor = (status: CandidateStatus): string => {
  switch (status) {
    case 'active':
      return 'var(--color-info)';
    case 'in_review':
      return 'var(--color-warning)';
    case 'hired':
      return 'var(--color-success)';
    case 'rejected':
      return 'var(--color-error)';
    case 'archived':
      return 'var(--color-secondary)';
    default:
      return 'var(--color-secondary)';
  }
};

const getStatusLabel = (status: CandidateStatus): string => {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'in_review':
      return 'En Revisión';
    case 'hired':
      return 'Contratado';
    case 'rejected':
      return 'Rechazado';
    case 'archived':
      return 'Archivado';
    default:
      return status;
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const CandidateCard: React.FC<{
  candidate: Candidate;
  onEdit?: (candidate: Candidate) => void;
  onDelete?: (id: number) => void;
  onView?: (candidate: Candidate) => void;
}> = ({ candidate, onEdit, onDelete, onView }) => {
  const mostRecentEducation = candidate.education?.[0];
  const mostRecentExperience = candidate.experience?.[0];
  const hasDocuments = candidate.documents?.length > 0;

  return (
    <div className="card">
      <div className="card-body">
        {/* Header with name and status */}
        <div className="flex items-center justify-between mb-md">
          <div>
            <h3 className="text-lg font-semibold">
              {candidate.firstName} {candidate.lastName}
            </h3>
            <p className="text-secondary text-sm">{candidate.email}</p>
          </div>
          <div
            className="text-sm font-medium"
            style={{
              color: getStatusColor(candidate.status),
              backgroundColor: `${getStatusColor(candidate.status)}20`,
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--border-radius-md)',
            }}
          >
            {getStatusLabel(candidate.status)}
          </div>
        </div>

        {/* Contact info */}
        <div className="mb-md">
          {candidate.phone && (
            <p className="text-sm text-secondary">📞 {candidate.phone}</p>
          )}
          {candidate.address && (
            <p className="text-sm text-secondary">📍 {candidate.address}</p>
          )}
        </div>

        {/* Recent experience/education */}
        <div className="grid gap-sm mb-md" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {mostRecentExperience && (
            <div>
              <h4 className="font-medium text-sm">Experiencia Reciente</h4>
              <p className="text-sm">
                {mostRecentExperience.position} en {mostRecentExperience.company}
              </p>
            </div>
          )}
          {mostRecentEducation && (
            <div>
              <h4 className="font-medium text-sm">Educación</h4>
              <p className="text-sm">
                {mostRecentEducation.degree || 'Estudios'} en {mostRecentEducation.institution}
              </p>
            </div>
          )}
        </div>

        {/* Documents indicator */}
        {hasDocuments && (
          <div className="mb-md">
            <span className="text-sm text-success">
              📎 {candidate.documents.length} documento(s) adjunto(s)
            </span>
          </div>
        )}

        {/* Footer with date and actions */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">
            Creado {formatDate(candidate.createdAt)}
          </span>
          
          <div className="flex gap-sm">
            {onView && (
              <button
                onClick={() => onView(candidate)}
                className="btn btn-secondary btn-sm"
              >
                Ver Detalles
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(candidate)}
                className="btn btn-secondary btn-sm"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm('¿Está seguro de que desea eliminar este candidato?')) {
                    onDelete(candidate.id);
                  }
                }}
                className="btn btn-error btn-sm"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton
const CandidateCardSkeleton: React.FC = () => (
  <div className="card">
    <div className="card-body">
      <div 
        className="mb-md"
        style={{
          height: '20px',
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--border-radius-sm)',
          animation: 'pulse 1.5s ease-in-out infinite alternate'
        }}
      />
      <div 
        className="mb-md"
        style={{
          height: '16px',
          width: '60%',
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--border-radius-sm)',
          animation: 'pulse 1.5s ease-in-out infinite alternate'
        }}
      />
      <div 
        style={{
          height: '16px',
          width: '40%',
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--border-radius-sm)',
          animation: 'pulse 1.5s ease-in-out infinite alternate'
        }}
      />
    </div>
  </div>
);

// Empty state
const EmptyState: React.FC = () => (
  <div className="text-center" style={{ padding: 'var(--spacing-2xl)' }}>
    <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>👥</div>
    <h3 className="text-xl font-semibold mb-md">No hay candidatos aún</h3>
    <p className="text-secondary">
      Comienza agregando tu primer candidato al sistema ATS
    </p>
  </div>
);

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  isLoading,
  onEdit,
  onDelete,
  onView,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-md" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <CandidateCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (candidates.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-md" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
};

// Add pulse animation to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { opacity: 0.6; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(style);