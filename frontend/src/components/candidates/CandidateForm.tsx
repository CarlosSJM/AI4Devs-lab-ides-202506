// ============================================================================
// CANDIDATE FORM COMPONENT - DESIGNED BY FRONTEND AGENT
// ============================================================================

import React, { useState } from 'react';
import { CreateCandidateDto, CreateCandidateEducationDto, CreateCandidateExperienceDto } from '../../types/candidate.types';
import { useForm } from '../../hooks/useForm';

interface CandidateFormProps {
  onSubmit: (data: CreateCandidateDto) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

// Validation function
const validateCandidate = (values: CreateCandidateDto) => {
  const errors: Partial<Record<keyof CreateCandidateDto, string>> = {};

  if (!values.firstName?.trim()) {
    errors.firstName = 'Nombre es requerido';
  }

  if (!values.lastName?.trim()) {
    errors.lastName = 'Apellido es requerido';
  }

  if (!values.email?.trim()) {
    errors.email = 'Email es requerido';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Email inválido';
  }

  if (values.phone && values.phone.length > 20) {
    errors.phone = 'Teléfono muy largo';
  }

  return errors;
};

export const CandidateForm: React.FC<CandidateFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const form = useForm<CreateCandidateDto>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      education: [],
      experience: [],
    },
    validate: validateCandidate,
    onSubmit: async (values) => {
      await onSubmit(values);
      form.reset();
      setUploadedFile(null);
    },
  });

  // Helper to get input props without the error property
  const getInputProps = (fieldName: keyof CreateCandidateDto) => {
    const { error, ...inputProps } = form.getFieldProps(fieldName);
    return inputProps;
  };

  // Education management
  const addEducation = () => {
    const newEducation: CreateCandidateEducationDto = {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
    };
    
    form.handleChange('education', [...(form.values.education || []), newEducation]);
  };

  const updateEducation = (index: number, education: CreateCandidateEducationDto) => {
    const updatedEducation = [...(form.values.education || [])];
    updatedEducation[index] = education;
    form.handleChange('education', updatedEducation);
  };

  const removeEducation = (index: number) => {
    const updatedEducation = form.values.education?.filter((_, i) => i !== index) || [];
    form.handleChange('education', updatedEducation);
  };

  // Experience management
  const addExperience = () => {
    const newExperience: CreateCandidateExperienceDto = {
      company: '',
      position: '',
      department: '',
      location: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
    };
    
    form.handleChange('experience', [...(form.values.experience || []), newExperience]);
  };

  const updateExperience = (index: number, experience: CreateCandidateExperienceDto) => {
    const updatedExperience = [...(form.values.experience || [])];
    updatedExperience[index] = experience;
    form.handleChange('experience', updatedExperience);
  };

  const removeExperience = (index: number) => {
    const updatedExperience = form.values.experience?.filter((_, i) => i !== index) || [];
    form.handleChange('experience', updatedExperience);
  };

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos PDF y DOCX');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe superar 5MB');
        return;
      }
      
      setUploadedFile(file);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-2xl font-semibold">Agregar Nuevo Candidato</h2>
        <p className="text-secondary text-sm mt-sm">
          Complete la información del candidato para agregarlo al sistema ATS
        </p>
      </div>

      <form onSubmit={form.handleSubmit} className="card-body">
        {/* Personal Information */}
        <section className="mb-lg">
          <h3 className="text-lg font-medium mb-md">Información Personal</h3>
          
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)' }}>
            <div className="form-field">
              <label htmlFor="firstName" className="form-label">Nombre *</label>
              <input
                {...getInputProps('firstName')}
                type="text"
                id="firstName"
                className={`form-input ${form.errors.firstName ? 'error' : ''}`}
                placeholder="Ingrese el nombre"
              />
              {form.errors.firstName && (
                <span className="form-error">{form.errors.firstName}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="lastName" className="form-label">Apellido *</label>
              <input
                {...getInputProps('lastName')}
                type="text"
                id="lastName"
                className={`form-input ${form.errors.lastName ? 'error' : ''}`}
                placeholder="Ingrese el apellido"
              />
              {form.errors.lastName && (
                <span className="form-error">{form.errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="grid mt-md" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)' }}>
            <div className="form-field">
              <label htmlFor="email" className="form-label">Email *</label>
              <input
                {...getInputProps('email')}
                type="email"
                id="email"
                className={`form-input ${form.errors.email ? 'error' : ''}`}
                placeholder="correo@ejemplo.com"
              />
              {form.errors.email && (
                <span className="form-error">{form.errors.email}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="phone" className="form-label">Teléfono</label>
              <input
                {...getInputProps('phone')}
                type="tel"
                id="phone"
                className="form-input"
                placeholder="+34 666 777 888"
              />
            </div>
          </div>

          <div className="form-field mt-md">
            <label htmlFor="address" className="form-label">Dirección</label>
            <textarea
              {...getInputProps('address')}
              id="address"
              rows={3}
              className="form-input"
              placeholder="Ingrese la dirección completa"
            />
          </div>

          <div className="form-field mt-md">
            <label htmlFor="notes" className="form-label">Notas</label>
            <textarea
              {...getInputProps('notes')}
              id="notes"
              rows={3}
              className="form-input"
              placeholder="Notas adicionales sobre el candidato"
            />
          </div>
        </section>

        {/* Education Section */}
        <section className="mb-lg">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-lg font-medium">Educación</h3>
            <button
              type="button"
              onClick={addEducation}
              className="btn btn-secondary btn-sm"
            >
              + Agregar Educación
            </button>
          </div>

          {form.values.education?.map((education, index) => (
            <div key={index} className="card mb-md" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              <div className="card-body">
                <div className="flex justify-between items-start mb-md">
                  <h4 className="font-medium">Educación {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="btn btn-error btn-sm"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                  <div className="form-field">
                    <label className="form-label">Institución *</label>
                    <input
                      type="text"
                      value={education.institution}
                      onChange={(e) => updateEducation(index, { ...education, institution: e.target.value })}
                      className="form-input"
                      placeholder="Universidad/Instituto"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Título</label>
                    <input
                      type="text"
                      value={education.degree || ''}
                      onChange={(e) => updateEducation(index, { ...education, degree: e.target.value })}
                      className="form-input"
                      placeholder="Licenciatura, Maestría, etc."
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Campo de Estudio</label>
                    <input
                      type="text"
                      value={education.fieldOfStudy || ''}
                      onChange={(e) => updateEducation(index, { ...education, fieldOfStudy: e.target.value })}
                      className="form-input"
                      placeholder="Ingeniería, Administración, etc."
                    />
                  </div>
                </div>

                <div className="grid mt-md" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
                  <div className="form-field">
                    <label className="form-label">Fecha Inicio</label>
                    <input
                      type="date"
                      value={education.startDate || ''}
                      onChange={(e) => updateEducation(index, { ...education, startDate: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Fecha Fin</label>
                    <input
                      type="date"
                      value={education.endDate || ''}
                      onChange={(e) => updateEducation(index, { ...education, endDate: e.target.value })}
                      className="form-input"
                      disabled={education.isCurrent}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      <input
                        type="checkbox"
                        checked={education.isCurrent}
                        onChange={(e) => updateEducation(index, { 
                          ...education, 
                          isCurrent: e.target.checked,
                          ...(e.target.checked && { endDate: '' })
                        })}
                        style={{ marginRight: 'var(--spacing-xs)' }}
                      />
                      Actualmente estudiando
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Experience Section */}
        <section className="mb-lg">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-lg font-medium">Experiencia Laboral</h3>
            <button
              type="button"
              onClick={addExperience}
              className="btn btn-secondary btn-sm"
            >
              + Agregar Experiencia
            </button>
          </div>

          {form.values.experience?.map((experience, index) => (
            <div key={index} className="card mb-md" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              <div className="card-body">
                <div className="flex justify-between items-start mb-md">
                  <h4 className="font-medium">Experiencia {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="btn btn-error btn-sm"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                  <div className="form-field">
                    <label className="form-label">Empresa *</label>
                    <input
                      type="text"
                      value={experience.company}
                      onChange={(e) => updateExperience(index, { ...experience, company: e.target.value })}
                      className="form-input"
                      placeholder="Nombre de la empresa"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Posición *</label>
                    <input
                      type="text"
                      value={experience.position}
                      onChange={(e) => updateExperience(index, { ...experience, position: e.target.value })}
                      className="form-input"
                      placeholder="Título del puesto"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Departamento</label>
                    <input
                      type="text"
                      value={experience.department || ''}
                      onChange={(e) => updateExperience(index, { ...experience, department: e.target.value })}
                      className="form-input"
                      placeholder="Desarrollo, Marketing, etc."
                    />
                  </div>
                </div>

                <div className="form-field mt-md">
                  <label className="form-label">Descripción</label>
                  <textarea
                    value={experience.description || ''}
                    onChange={(e) => updateExperience(index, { ...experience, description: e.target.value })}
                    rows={3}
                    className="form-input"
                    placeholder="Describa las responsabilidades y logros"
                  />
                </div>

                <div className="grid mt-md" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
                  <div className="form-field">
                    <label className="form-label">Fecha Inicio</label>
                    <input
                      type="date"
                      value={experience.startDate || ''}
                      onChange={(e) => updateExperience(index, { ...experience, startDate: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Fecha Fin</label>
                    <input
                      type="date"
                      value={experience.endDate || ''}
                      onChange={(e) => updateExperience(index, { ...experience, endDate: e.target.value })}
                      className="form-input"
                      disabled={experience.isCurrent}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      <input
                        type="checkbox"
                        checked={experience.isCurrent}
                        onChange={(e) => updateExperience(index, { 
                          ...experience, 
                          isCurrent: e.target.checked,
                          ...(e.target.checked && { endDate: '' })
                        })}
                        style={{ marginRight: 'var(--spacing-xs)' }}
                      />
                      Trabajo actual
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Document Upload */}
        <section className="mb-lg">
          <h3 className="text-lg font-medium mb-md">Documentos</h3>
          
          <div className="form-field">
            <label htmlFor="cv-upload" className="form-label">CV (PDF o DOCX, máximo 5MB)</label>
            <div
              className="card"
              style={{
                padding: 'var(--spacing-lg)',
                border: '2px dashed var(--color-border)',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: uploadedFile ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
              }}
              onClick={() => document.getElementById('cv-upload')?.click()}
            >
              {uploadedFile ? (
                <div>
                  <p className="font-medium">📄 {uploadedFile.name}</p>
                  <p className="text-sm text-muted">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                    className="btn btn-error btn-sm mt-sm"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <div>
                  <p>📄 Haga clic para seleccionar CV</p>
                  <p className="text-sm text-muted">PDF o DOCX, máximo 5MB</p>
                </div>
              )}
            </div>
            <input
              id="cv-upload"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </section>
      </form>

      {/* Form Actions */}
      <div className="card-footer">
        <div className="flex gap-md justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button
            onClick={form.handleSubmit}
            className="btn btn-primary"
            disabled={isSubmitting || !form.isValid}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" />
                Guardando...
              </>
            ) : (
              'Agregar Candidato'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};