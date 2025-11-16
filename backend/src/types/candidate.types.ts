// ============================================================================
// CANDIDATE TYPES - DESIGNED BY BACKEND AGENT
// ============================================================================

export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  education?: CreateCandidateEducationDto[];
  experience?: CreateCandidateExperienceDto[];
}

export interface UpdateCandidateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: CandidateStatus;
}

export interface CreateCandidateEducationDto {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  gpa?: number;
  description?: string;
}

export interface CreateCandidateExperienceDto {
  company: string;
  position: string;
  department?: string;
  location?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  salary?: number;
  currency?: string;
}

export interface CandidateFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: CandidateStatus;
  sortBy?: 'createdAt' | 'lastName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export type CandidateStatus = 'active' | 'in_review' | 'hired' | 'rejected' | 'archived';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface FileUploadResult {
  fileName: string;
  originalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
}