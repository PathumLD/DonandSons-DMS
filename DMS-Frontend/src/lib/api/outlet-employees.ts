import apiClient from './api-client';

export interface OutletEmployee {
  id: string;
  outletId: string;
  outletName: string;
  outletCode?: string;
  userId: string;
  userName: string;
  userEmail: string;
  designation?: string;
  isManager: boolean;
  joinedDate: string;
  leftDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOutletEmployeeDto {
  outletId: string;
  userId: string;
  designation?: string;
  isManager: boolean;
  joinedDate: string;
  leftDate?: string;
  isActive: boolean;
}

export interface UpdateOutletEmployeeDto {
  outletId: string;
  userId: string;
  designation?: string;
  isManager: boolean;
  joinedDate: string;
  leftDate?: string;
  isActive: boolean;
}

export interface OutletEmployeesResponse {
  outletEmployees: OutletEmployee[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const outletEmployeesApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    outletId?: string,
    userId?: string,
    search?: string,
    activeOnly?: boolean
  ): Promise<OutletEmployeesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (outletId) params.append('outletId', outletId);
    if (userId) params.append('userId', userId);
    if (search) params.append('search', search);
    if (activeOnly !== undefined) params.append('activeOnly', activeOnly.toString());

    const response = await apiClient.get<OutletEmployeesResponse>(`/api/outlet-employees?${params}`);
    return response.data.data;
  },

  async getById(id: string): Promise<OutletEmployee> {
    const response = await apiClient.get<OutletEmployee>(`/api/outlet-employees/${id}`);
    return response.data.data;
  },

  async create(data: CreateOutletEmployeeDto): Promise<OutletEmployee> {
    const response = await apiClient.post<OutletEmployee>('/api/outlet-employees', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateOutletEmployeeDto): Promise<OutletEmployee> {
    const response = await apiClient.put<OutletEmployee>(`/api/outlet-employees/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/outlet-employees/${id}`);
  },
};
