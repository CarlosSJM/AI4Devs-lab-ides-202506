// ============================================================================
// CANDIDATE SERVICE - DESIGNED BY BACKEND AGENT
// ============================================================================

import { PrismaClient, Prisma } from '@prisma/client';
import { CreateCandidateDto, UpdateCandidateDto, CandidateFilters, PaginatedResult, FileUploadResult } from '../types/candidate.types';
import { NotFoundError, DuplicateError, DatabaseError } from '../utils/errors';

const prisma = new PrismaClient();

export class CandidateService {
  
  async createCandidate(data: CreateCandidateDto) {
    try {
      // Verificar email único
      const existingCandidate = await prisma.candidate.findUnique({
        where: { email: data.email }
      });

      if (existingCandidate) {
        throw new DuplicateError('email');
      }

      // Crear candidato con relaciones
      const candidate = await prisma.candidate.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          notes: data.notes,
          education: {
            create: data.education?.map(edu => ({
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy,
              startDate: edu.startDate ? new Date(edu.startDate) : null,
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              isCurrent: edu.isCurrent || false,
              gpa: edu.gpa ? new Prisma.Decimal(edu.gpa) : null,
              description: edu.description
            })) || []
          },
          experience: {
            create: data.experience?.map(exp => ({
              company: exp.company,
              position: exp.position,
              department: exp.department,
              location: exp.location,
              description: exp.description,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              isCurrent: exp.isCurrent || false,
              salary: exp.salary ? new Prisma.Decimal(exp.salary) : null,
              currency: exp.currency
            })) || []
          }
        },
        include: {
          education: {
            orderBy: { startDate: 'desc' }
          },
          experience: {
            orderBy: { startDate: 'desc' }
          },
          documents: true
        }
      });

      return candidate;
    } catch (error) {
      if (error instanceof DuplicateError) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new DuplicateError('email');
        }
      }
      throw new DatabaseError('Error al crear candidato');
    }
  }

  async getCandidates(filters: CandidateFilters): Promise<PaginatedResult<any>> {
    try {
      const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
      
      // Construir condiciones WHERE
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

      // Configurar ordenamiento
      const orderBy: Prisma.CandidateOrderByWithRelationInput = {
        [sortBy]: sortOrder
      };

      // Ejecutar consultas en paralelo
      const [candidates, total] = await prisma.$transaction([
        prisma.candidate.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
          include: {
            education: {
              orderBy: { startDate: 'desc' },
              take: 1 // Solo la más reciente para listado
            },
            experience: {
              orderBy: { startDate: 'desc' },
              take: 1 // Solo la más reciente para listado
            },
            documents: {
              where: { documentType: 'cv' },
              take: 1
            }
          }
        }),
        prisma.candidate.count({ where })
      ]);

      return {
        data: candidates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError('Error al obtener candidatos');
    }
  }

  async getCandidateById(id: number) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id },
        include: {
          education: {
            orderBy: { startDate: 'desc' }
          },
          experience: {
            orderBy: { startDate: 'desc' }
          },
          documents: {
            orderBy: { uploadedAt: 'desc' }
          }
        }
      });

      if (!candidate) {
        throw new NotFoundError('Candidato');
      }

      return candidate;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Error al obtener candidato');
    }
  }

  async updateCandidate(id: number, data: UpdateCandidateDto) {
    try {
      // Verificar que existe
      const existingCandidate = await this.getCandidateById(id);

      // Verificar email único si se está actualizando
      if (data.email && data.email !== existingCandidate.email) {
        const emailExists = await prisma.candidate.findUnique({
          where: { email: data.email }
        });
        if (emailExists) {
          throw new DuplicateError('email');
        }
      }

      const updatedCandidate = await prisma.candidate.update({
        where: { id },
        data,
        include: {
          education: {
            orderBy: { startDate: 'desc' }
          },
          experience: {
            orderBy: { startDate: 'desc' }
          },
          documents: {
            orderBy: { uploadedAt: 'desc' }
          }
        }
      });

      return updatedCandidate;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DuplicateError) {
        throw error;
      }
      throw new DatabaseError('Error al actualizar candidato');
    }
  }

  async deleteCandidate(id: number) {
    try {
      // Verificar que existe
      await this.getCandidateById(id);

      await prisma.candidate.delete({
        where: { id }
      });

      return { message: 'Candidato eliminado exitosamente' };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Error al eliminar candidato');
    }
  }

  async uploadDocument(candidateId: number, fileData: FileUploadResult, documentType: string = 'cv') {
    try {
      // Verificar que el candidato existe
      await this.getCandidateById(candidateId);

      const document = await prisma.candidateDocument.create({
        data: {
          candidateId,
          fileName: fileData.fileName,
          originalName: fileData.originalName,
          filePath: fileData.filePath,
          fileType: fileData.fileType,
          fileSize: fileData.fileSize,
          mimeType: fileData.mimeType,
          documentType
        }
      });

      return document;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Error al subir documento');
    }
  }

  async getCandidateDocuments(candidateId: number) {
    try {
      // Verificar que el candidato existe
      await this.getCandidateById(candidateId);

      const documents = await prisma.candidateDocument.findMany({
        where: { candidateId },
        orderBy: { uploadedAt: 'desc' }
      });

      return documents;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Error al obtener documentos');
    }
  }

  async deleteDocument(candidateId: number, documentId: number) {
    try {
      const document = await prisma.candidateDocument.findFirst({
        where: { id: documentId, candidateId }
      });

      if (!document) {
        throw new NotFoundError('Documento');
      }

      await prisma.candidateDocument.delete({
        where: { id: documentId }
      });

      return { message: 'Documento eliminado exitosamente', filePath: document.filePath };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Error al eliminar documento');
    }
  }
}

export const candidateService = new CandidateService();