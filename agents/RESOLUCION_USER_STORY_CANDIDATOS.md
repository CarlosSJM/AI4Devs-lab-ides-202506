# 🎯 Resolución User Story: "Añadir Candidato al Sistema"

## 📋 Análisis del Product Manager Agent

### Historia de Usuario Original
```
Como reclutador,
Quiero tener la capacidad de añadir candidatos al sistema ATS,
Para que pueda gestionar sus datos y procesos de selección de manera eficiente.
```

### Análisis y Descomposición

#### 🔍 Complejidad Detectada: **ALTA**
- **Estimación**: 5-8 días de desarrollo
- **Story Points**: 13
- **Riesgo**: Medio (primera feature del sistema)

#### 📝 Especificaciones Técnicas Generadas

### TICKET #1: [DB] Modelo de Datos para Candidatos
**Asignado a: Database Architect Agent**
**Prioridad: CRÍTICA** (Bloqueante para otros tickets)

#### Descripción
Crear el modelo de datos completo para gestión de candidatos en el sistema ATS.

#### Tareas Específicas
```sql
-- Modelo principal
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Educación
CREATE TABLE candidate_education (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255),
  field_of_study VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE
);

-- Experiencia laboral
CREATE TABLE candidate_experience (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE
);

-- Documentos (CV, etc.)
CREATE TABLE candidate_documents (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### Esquema Prisma
```prisma
model Candidate {
  id          Int       @id @default(autoincrement())
  firstName   String    @map("first_name") @db.VarChar(100)
  lastName    String    @map("last_name") @db.VarChar(100)
  email       String    @unique @db.VarChar(255)
  phone       String?   @db.VarChar(20)
  address     String?
  status      String    @default("active") @db.VarChar(50)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  education   CandidateEducation[]
  experience  CandidateExperience[]
  documents   CandidateDocument[]
  
  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@map("candidates")
}

model CandidateEducation {
  id            Int       @id @default(autoincrement())
  candidateId   Int       @map("candidate_id")
  institution   String    @db.VarChar(255)
  degree        String?   @db.VarChar(255)
  fieldOfStudy  String?   @map("field_of_study") @db.VarChar(255)
  startDate     DateTime? @map("start_date") @db.Date
  endDate       DateTime? @map("end_date") @db.Date
  isCurrent     Boolean   @default(false) @map("is_current")
  
  candidate     Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  
  @@map("candidate_education")
}

model CandidateExperience {
  id          Int       @id @default(autoincrement())
  candidateId Int       @map("candidate_id")
  company     String    @db.VarChar(255)
  position    String    @db.VarChar(255)
  description String?
  startDate   DateTime? @map("start_date") @db.Date
  endDate     DateTime? @map("end_date") @db.Date
  isCurrent   Boolean   @default(false) @map("is_current")
  
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  
  @@map("candidate_experience")
}

model CandidateDocument {
  id          Int      @id @default(autoincrement())
  candidateId Int      @map("candidate_id")
  fileName    String   @map("file_name") @db.VarChar(255)
  filePath    String   @map("file_path") @db.VarChar(500)
  fileType    String   @map("file_type") @db.VarChar(50)
  fileSize    Int?     @map("file_size")
  uploadedAt  DateTime @default(now()) @map("uploaded_at")
  
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  
  @@map("candidate_documents")
}
```

#### Comandos de Implementación
```bash
# 1. Crear migración
npx prisma migrate dev --name add_candidates_model

# 2. Generar cliente
npx prisma generate

# 3. Verificar
npx prisma studio
```

---

### TICKET #2: [BACKEND] API Gestión de Candidatos
**Asignado a: Backend Developer Agent**
**Prioridad: ALTA** (Depende de TICKET #1)

#### Endpoints Requeridos
```typescript
// POST /api/candidates - Crear candidato
// GET /api/candidates - Listar candidatos (con filtros)
// GET /api/candidates/:id - Obtener candidato específico
// PUT /api/candidates/:id - Actualizar candidato
// DELETE /api/candidates/:id - Eliminar candidato
// POST /api/candidates/:id/documents - Subir documento
// GET /api/candidates/:id/documents - Listar documentos
```

#### Implementación Backend

```typescript
// types/candidate.types.ts
export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: CandidateEducationDto[];
  experience?: CandidateExperienceDto[];
}

export interface CandidateEducationDto {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface CandidateExperienceDto {
  company: string;
  position: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

// services/candidate.service.ts
import { PrismaClient } from '@prisma/client';
import { CreateCandidateDto, UpdateCandidateDto } from '../types/candidate.types';

const prisma = new PrismaClient();

export class CandidateService {
  async createCandidate(data: CreateCandidateDto): Promise<Candidate> {
    return await prisma.candidate.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        education: {
          create: data.education || []
        },
        experience: {
          create: data.experience || []
        }
      },
      include: {
        education: true,
        experience: true,
        documents: true
      }
    });
  }

  async getCandidates(filters: CandidateFilters): Promise<PaginatedResult<Candidate>> {
    const { page = 1, limit = 10, search, status } = filters;
    
    const where: Prisma.CandidateWhereInput = {
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(status && { status })
    };

    const [data, total] = await prisma.$transaction([
      prisma.candidate.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          education: true,
          experience: true,
          documents: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.candidate.count({ where })
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getCandidateById(id: number): Promise<Candidate | null> {
    return await prisma.candidate.findUnique({
      where: { id },
      include: {
        education: true,
        experience: true,
        documents: true
      }
    });
  }
}

// controllers/candidate.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CandidateService } from '../services/candidate.service';
import { validateCandidateInput } from '../utils/validation';

const candidateService = new CandidateService();

export const createCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = validateCandidateInput(req.body);
    const candidate = await candidateService.createCandidate(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Candidato creado exitosamente',
      data: candidate
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      search: req.query.search as string,
      status: req.query.status as string
    };
    
    const result = await candidateService.getCandidates(filters);
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

// routes/candidate.routes.ts
import { Router } from 'express';
import { 
  createCandidate, 
  getCandidates, 
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  uploadDocument
} from '../controllers/candidate.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticateToken); // Todas las rutas requieren autenticación

router.post('/', createCandidate);
router.get('/', getCandidates);
router.get('/:id', getCandidateById);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);
router.post('/:id/documents', upload.single('file'), uploadDocument);

export default router;

// utils/validation.ts
import { z } from 'zod';

const CandidateEducationSchema = z.object({
  institution: z.string().min(1, 'Institución requerida'),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional()
});

const CandidateExperienceSchema = z.object({
  company: z.string().min(1, 'Empresa requerida'),
  position: z.string().min(1, 'Posición requerida'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional()
});

export const CandidateSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido').max(100),
  lastName: z.string().min(1, 'Apellido requerido').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  education: z.array(CandidateEducationSchema).optional(),
  experience: z.array(CandidateExperienceSchema).optional()
});

export const validateCandidateInput = (data: unknown): CreateCandidateDto => {
  return CandidateSchema.parse(data);
};
```

#### Configuración de Upload de Archivos
```typescript
// middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import { AppError } from '../utils/errors';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/candidates/documents');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'INVALID_FILE_TYPE', 'Solo se permiten archivos PDF y DOCX'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
```

---

### TICKET #3: [FRONTEND] Dashboard y Formulario de Candidatos
**Asignado a: Frontend Developer Agent**
**Prioridad: ALTA** (Depende de TICKET #2)

#### Componentes Requeridos
```typescript
// components/candidates/CandidateForm.tsx
// components/candidates/CandidateList.tsx
// components/candidates/CandidateCard.tsx
// pages/CandidatesPage.tsx
// pages/AddCandidatePage.tsx
```

#### Implementación Frontend

```typescript
// types/candidate.types.ts
export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  createdAt: string;
  education: CandidateEducation[];
  experience: CandidateExperience[];
  documents: CandidateDocument[];
}

export interface CandidateEducation {
  id: number;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface CandidateExperience {
  id: number;
  company: string;
  position: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
}

// components/candidates/CandidateForm.tsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CandidateSchema } from '../../utils/validation';
import { candidateService } from '../../services/candidate.service';

interface CandidateFormProps {
  onSuccess?: (candidate: Candidate) => void;
  onCancel?: () => void;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({ onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateCandidateDto>({
    resolver: zodResolver(CandidateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      education: [],
      experience: []
    }
  });

  const {
    fields: educationFields,
    append: addEducation,
    remove: removeEducation
  } = useFieldArray({
    control,
    name: 'education'
  });

  const {
    fields: experienceFields,
    append: addExperience,
    remove: removeExperience
  } = useFieldArray({
    control,
    name: 'experience'
  });

  const onSubmit = async (data: CreateCandidateDto) => {
    setIsSubmitting(true);
    try {
      const candidate = await candidateService.createCandidate(data);
      
      // Subir archivo si existe
      if (uploadedFile && candidate.id) {
        await candidateService.uploadDocument(candidate.id, uploadedFile);
      }
      
      // Mostrar mensaje de éxito
      toast.success('Candidato agregado exitosamente');
      
      onSuccess?.(candidate);
      reset();
      setUploadedFile(null);
    } catch (error) {
      toast.error(error.message || 'Error al agregar candidato');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo y tamaño
      if (!file.type.includes('pdf') && !file.type.includes('document')) {
        toast.error('Solo se permiten archivos PDF y DOCX');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no debe superar 5MB');
        return;
      }
      setUploadedFile(file);
    }
  };

  return (
    <div className="candidate-form">
      <div className="form-header">
        <h2>Agregar Nuevo Candidato</h2>
        <p>Complete la información del candidato para agregarlo al sistema ATS</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form">
        {/* Información Personal */}
        <section className="form-section">
          <h3>Información Personal</h3>
          
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="firstName">Nombre *</label>
              <input
                {...register('firstName')}
                type="text"
                id="firstName"
                className={errors.firstName ? 'error' : ''}
                placeholder="Ingrese el nombre"
              />
              {errors.firstName && (
                <span className="error-message">{errors.firstName.message}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="lastName">Apellido *</label>
              <input
                {...register('lastName')}
                type="text"
                id="lastName"
                className={errors.lastName ? 'error' : ''}
                placeholder="Ingrese el apellido"
              />
              {errors.lastName && (
                <span className="error-message">{errors.lastName.message}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="email">Email *</label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={errors.email ? 'error' : ''}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="phone">Teléfono</label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="address">Dirección</label>
            <textarea
              {...register('address')}
              id="address"
              rows={3}
              placeholder="Ingrese la dirección completa"
            />
          </div>
        </section>

        {/* Educación */}
        <section className="form-section">
          <div className="section-header">
            <h3>Educación</h3>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => addEducation({ 
                institution: '', 
                degree: '', 
                fieldOfStudy: '', 
                isCurrent: false 
              })}
            >
              + Agregar Educación
            </button>
          </div>

          {educationFields.map((field, index) => (
            <div key={field.id} className="dynamic-section">
              <div className="section-controls">
                <button
                  type="button"
                  className="btn-danger-small"
                  onClick={() => removeEducation(index)}
                >
                  ✕ Eliminar
                </button>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Institución *</label>
                  <input
                    {...register(`education.${index}.institution`)}
                    type="text"
                    placeholder="Universidad/Instituto"
                  />
                </div>

                <div className="form-field">
                  <label>Título</label>
                  <input
                    {...register(`education.${index}.degree`)}
                    type="text"
                    placeholder="Licenciatura, Maestría, etc."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Campo de Estudio</label>
                  <input
                    {...register(`education.${index}.fieldOfStudy`)}
                    type="text"
                    placeholder="Ingeniería, Administración, etc."
                  />
                </div>

                <div className="form-field">
                  <label>
                    <input
                      {...register(`education.${index}.isCurrent`)}
                      type="checkbox"
                    />
                    Actualmente estudiando
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Fecha Inicio</label>
                  <input
                    {...register(`education.${index}.startDate`)}
                    type="date"
                  />
                </div>

                <div className="form-field">
                  <label>Fecha Fin</label>
                  <input
                    {...register(`education.${index}.endDate`)}
                    type="date"
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Experiencia Laboral */}
        <section className="form-section">
          <div className="section-header">
            <h3>Experiencia Laboral</h3>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => addExperience({ 
                company: '', 
                position: '', 
                description: '', 
                isCurrent: false 
              })}
            >
              + Agregar Experiencia
            </button>
          </div>

          {experienceFields.map((field, index) => (
            <div key={field.id} className="dynamic-section">
              <div className="section-controls">
                <button
                  type="button"
                  className="btn-danger-small"
                  onClick={() => removeExperience(index)}
                >
                  ✕ Eliminar
                </button>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Empresa *</label>
                  <input
                    {...register(`experience.${index}.company`)}
                    type="text"
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div className="form-field">
                  <label>Posición *</label>
                  <input
                    {...register(`experience.${index}.position`)}
                    type="text"
                    placeholder="Título del puesto"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Descripción</label>
                <textarea
                  {...register(`experience.${index}.description`)}
                  rows={3}
                  placeholder="Describa las responsabilidades y logros"
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Fecha Inicio</label>
                  <input
                    {...register(`experience.${index}.startDate`)}
                    type="date"
                  />
                </div>

                <div className="form-field">
                  <label>Fecha Fin</label>
                  <input
                    {...register(`experience.${index}.endDate`)}
                    type="date"
                  />
                </div>

                <div className="form-field">
                  <label>
                    <input
                      {...register(`experience.${index}.isCurrent`)}
                      type="checkbox"
                    />
                    Trabajo actual
                  </label>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Carga de Documentos */}
        <section className="form-section">
          <h3>Documentos</h3>
          
          <div className="file-upload">
            <label htmlFor="cv-upload" className="file-upload-label">
              <div className="upload-area">
                {uploadedFile ? (
                  <div className="file-info">
                    <span>📄 {uploadedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="remove-file"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span>📄 Seleccionar CV (PDF o DOCX)</span>
                    <small>Máximo 5MB</small>
                  </div>
                )}
              </div>
            </label>
            <input
              id="cv-upload"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </section>

        {/* Botones de Acción */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
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
      </form>
    </div>
  );
};

// components/candidates/CandidateList.tsx
import React from 'react';
import { Candidate } from '../../types/candidate.types';
import { CandidateCard } from './CandidateCard';

interface CandidateListProps {
  candidates: Candidate[];
  isLoading?: boolean;
  onEdit?: (candidate: Candidate) => void;
  onDelete?: (id: number) => void;
  onView?: (candidate: Candidate) => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  isLoading,
  onEdit,
  onDelete,
  onView
}) => {
  if (isLoading) {
    return (
      <div className="candidate-list loading">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="candidate-card skeleton">
            <div className="skeleton-avatar" />
            <div className="skeleton-content">
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h3>No hay candidatos aún</h3>
        <p>Comienza agregando tu primer candidato al sistema</p>
      </div>
    );
  }

  return (
    <div className="candidate-list">
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

// pages/CandidatesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateList } from '../components/candidates/CandidateList';
import { candidateService } from '../services/candidate.service';
import { useAsync } from '../hooks/useAsync';

export const CandidatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const { 
    data: candidatesData, 
    loading, 
    error, 
    refetch 
  } = useAsync(() => 
    candidateService.getCandidates({
      search: searchTerm,
      status: statusFilter || undefined
    }), 
    [searchTerm, statusFilter]
  );

  const handleAddCandidate = () => {
    navigate('/candidates/new');
  };

  const handleEditCandidate = (candidate: Candidate) => {
    navigate(`/candidates/${candidate.id}/edit`);
  };

  const handleViewCandidate = (candidate: Candidate) => {
    navigate(`/candidates/${candidate.id}`);
  };

  const handleDeleteCandidate = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este candidato?')) {
      try {
        await candidateService.deleteCandidate(id);
        toast.success('Candidato eliminado exitosamente');
        refetch();
      } catch (error) {
        toast.error('Error al eliminar candidato');
      }
    }
  };

  if (error) {
    return (
      <div className="error-state">
        <h3>Error al cargar candidatos</h3>
        <p>{error.message}</p>
        <button onClick={refetch} className="btn-primary">
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div className="candidates-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Candidatos</h1>
          <p>Administra todos los candidatos en tu sistema ATS</p>
        </div>
        
        <button
          onClick={handleAddCandidate}
          className="btn-primary"
          data-testid="add-candidate-btn"
        >
          + Agregar Candidato
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-filter">
          <label htmlFor="search">Buscar candidatos</label>
          <input
            id="search"
            type="text"
            placeholder="Buscar por nombre, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="status-filter">
          <label htmlFor="status">Estado</label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-select"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="in_review">En Revisión</option>
            <option value="hired">Contratado</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>
      </div>

      {/* Lista de Candidatos */}
      <div className="candidates-content">
        <CandidateList
          candidates={candidatesData?.data || []}
          isLoading={loading}
          onEdit={handleEditCandidate}
          onDelete={handleDeleteCandidate}
          onView={handleViewCandidate}
        />

        {/* Paginación */}
        {candidatesData?.pagination && candidatesData.pagination.totalPages > 1 && (
          <div className="pagination">
            {/* Componente de paginación */}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

### TICKET #4: [QA] Tests y Validaciones
**Asignado a: QA Engineer Agent**

#### Tests Backend
```typescript
// tests/candidate.service.test.ts
describe('CandidateService', () => {
  beforeEach(async () => {
    await prisma.candidate.deleteMany();
  });

  describe('createCandidate', () => {
    it('should create candidate with valid data', async () => {
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '+1234567890'
      };

      const candidate = await candidateService.createCandidate(candidateData);

      expect(candidate.firstName).toBe(candidateData.firstName);
      expect(candidate.email).toBe(candidateData.email);
    });

    it('should throw error for duplicate email', async () => {
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com'
      };

      await candidateService.createCandidate(candidateData);

      await expect(
        candidateService.createCandidate(candidateData)
      ).rejects.toThrow('Email already exists');
    });
  });
});

// tests/candidate.controller.test.ts
describe('POST /api/candidates', () => {
  it('should create candidate successfully', async () => {
    const candidateData = {
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana@example.com'
    };

    const response = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${testToken}`)
      .send(candidateData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(candidateData.email);
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${testToken}`)
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

#### Tests Frontend
```typescript
// tests/CandidateForm.test.tsx
describe('CandidateForm', () => {
  const mockOnSuccess = jest.fn();

  it('renders all required fields', () => {
    render(<CandidateForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<CandidateForm onSuccess={mockOnSuccess} />);

    fireEvent.click(screen.getByText(/agregar candidato/i));

    await waitFor(() => {
      expect(screen.getByText(/nombre requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/apellido requerido/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockCreate = jest.spyOn(candidateService, 'createCandidate').mockResolvedValue(mockCandidate);

    render(<CandidateForm onSuccess={mockOnSuccess} />);

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Juan');
    await userEvent.type(screen.getByLabelText(/apellido/i), 'Pérez');
    await userEvent.type(screen.getByLabelText(/email/i), 'juan@example.com');

    fireEvent.click(screen.getByText(/agregar candidato/i));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        education: [],
        experience: []
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
```

---

### TICKET #5: [SECURITY] Seguridad y Privacidad
**Asignado a: Security Agent**

#### Medidas de Seguridad
```typescript
// middleware/security.middleware.ts
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting específico para candidates
export const candidateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // máximo 50 requests por IP
  message: 'Demasiadas solicitudes desde esta IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware de seguridad general
export const securityMiddleware = [
  helmet(), // Headers de seguridad
  candidateRateLimit
];

// Validación de archivos
export const validateFileUpload = (file: Express.Multer.File) => {
  const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (!allowedMimes.includes(file.mimetype)) {
    throw new AppError(400, 'INVALID_FILE_TYPE', 'Tipo de archivo no permitido');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new AppError(400, 'FILE_TOO_LARGE', 'El archivo excede el tamaño máximo');
  }
};
```

---

### TICKET #6: [DEVOPS] Configuración y Despliegue
**Asignado a: DevOps Agent**

#### Docker y Configuración
```dockerfile
# Dockerfile.backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3010
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml (actualizado)
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./uploads:/app/uploads

  backend:
    build: ./backend
    ports:
      - "3010:3010"
    environment:
      DATABASE_URL: "postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}"
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: "http://localhost:3010/api"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 📈 Plan de Implementación

### Fase 1: Base (Días 1-2)
1. **DB Agent**: Crear modelos y migraciones
2. **Backend Agent**: Endpoints básicos CRUD
3. **DevOps Agent**: Configurar entorno local

### Fase 2: Core (Días 3-4)
1. **Backend Agent**: Validaciones y upload de archivos
2. **Frontend Agent**: Formulario básico y lista
3. **Security Agent**: Implementar medidas básicas

### Fase 3: Polish (Día 5)
1. **Frontend Agent**: UI/UX final y responsive
2. **QA Agent**: Tests completos
3. **DevOps Agent**: Preparar producción

### Fase 4: Deploy (Día 6)
1. **QA Agent**: Tests E2E
2. **Security Agent**: Auditoría final
3. **DevOps Agent**: Despliegue

---

## 🎯 Comandos para Usar con Claude Code

```bash
# Iniciar desarrollo
claude-agent pm start "User Story: Añadir Candidato al Sistema"

# Implementar tickets específicos
claude-agent db implement "TICKET-001 Modelo de datos candidatos"
claude-agent backend implement "TICKET-002 API gestión candidatos"
claude-agent frontend implement "TICKET-003 Dashboard y formulario"

# Verificar progreso
claude-agent status --detailed

# Deploy cuando esté listo
claude-agent devops deploy staging
```

Este enfoque multi-agente asegura que cada parte del sistema sea desarrollada por un especialista, con coordinación central del PM Agent y validación continua de QA y Security.