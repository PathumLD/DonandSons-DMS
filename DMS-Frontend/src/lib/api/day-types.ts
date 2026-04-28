import apiClient from './api-client';

export interface DayType {
  id: string;
  code: string;
  name: string;
  description?: string;
  multiplier: number;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDayTypeDto {
  code: string;
  name: string;
  description?: string;
  multiplier: number;
  color?: string;
  isActive: boolean;
}

export interface UpdateDayTypeDto {
  code: string;
  name: string;
  description?: string;
  multiplier: number;
  color?: string;
  isActive: boolean;
}

export interface DayTypesResponse {
  dayTypes: DayType[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const dayTypesApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    activeOnly?: boolean
  ): Promise<DayTypesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (activeOnly !== undefined) params.append('activeOnly', activeOnly.toString());

    const response = await apiClient.get<DayTypesResponse>(`/api/day-types?${params}`);
    return response.data.data;
  },

  async getById(id: string): Promise<DayType> {
    const response = await apiClient.get<DayType>(`/api/day-types/${id}`);
    return response.data.data;
  },

  async create(data: CreateDayTypeDto): Promise<DayType> {
    const response = await apiClient.post<DayType>('/api/day-types', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateDayTypeDto): Promise<DayType> {
    const response = await apiClient.put<DayType>(`/api/day-types/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/day-types/${id}`);
  },
};
