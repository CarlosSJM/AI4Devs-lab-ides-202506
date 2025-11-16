// ============================================================================
// CANDIDATE API SERVICE - DESIGNED BY FRONTEND AGENT
// ============================================================================

import { 
  Candidate, 
  CreateCandidateDto, 
  UpdateCandidateDto, 
  CandidateFilters, 
  ApiResponse,
  CandidateDocument 
} from '../types/candidate.types';

class CandidateApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3010/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error en la solicitud');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============================================================================
  // CANDIDATE CRUD OPERATIONS
  // ============================================================================

  async getCandidates(filters: CandidateFilters = {}): Promise<ApiResponse<Candidate[]>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return this.request<Candidate[]>(`/candidates?${searchParams.toString()}`);
  }

  async getCandidateById(id: number): Promise<ApiResponse<Candidate>> {
    return this.request<Candidate>(`/candidates/${id}`);
  }

  async createCandidate(data: CreateCandidateDto): Promise<ApiResponse<Candidate>> {
    return this.request<Candidate>('/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCandidate(id: number, data: UpdateCandidateDto): Promise<ApiResponse<Candidate>> {
    return this.request<Candidate>(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCandidate(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/candidates/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // DOCUMENT OPERATIONS
  // ============================================================================

  async uploadDocument(
    candidateId: number, 
    file: File, 
    documentType: string = 'cv'
  ): Promise<ApiResponse<CandidateDocument>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    try {
      const response = await fetch(`${this.baseUrl}/candidates/${candidateId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al subir archivo');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  async getCandidateDocuments(candidateId: number): Promise<ApiResponse<CandidateDocument[]>> {
    return this.request<CandidateDocument[]>(`/candidates/${candidateId}/documents`);
  }

  async deleteDocument(candidateId: number, documentId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/candidates/${candidateId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request<any>('/', {
      headers: {},
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isValidFileType(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(file.type);
  }

  getMaxFileSize(): number {
    return 5 * 1024 * 1024; // 5MB
  }
}

export const candidateService = new CandidateApiService();