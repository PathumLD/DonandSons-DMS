import apiClient from './api-client';

export interface Outlet {
  id: string;
  code: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  contactPerson?: string;
  displayOrder: number; // ⭐ Rank column for numbering showrooms
  locationType?: string;
  hasVariants: boolean;
  isDeliveryPoint: boolean;
  defaultDeliveryTurnId?: string;
  defaultDeliveryTurnName?: string;
  latitude?: number;
  longitude?: number;
  operatingHours?: string;
  notes?: string;
  employeeCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOutletDto {
  code: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  contactPerson?: string;
  displayOrder: number;
  locationType?: string;
  hasVariants: boolean;
  isDeliveryPoint: boolean;
  defaultDeliveryTurnId?: string;
  latitude?: number;
  longitude?: number;
  operatingHours?: string;
  notes?: string;
  isActive: boolean;
}

export interface UpdateOutletDto {
  code: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  contactPerson?: string;
  displayOrder: number;
  locationType?: string;
  hasVariants: boolean;
  isDeliveryPoint: boolean;
  defaultDeliveryTurnId?: string;
  latitude?: number;
  longitude?: number;
  operatingHours?: string;
  notes?: string;
  isActive: boolean;
}

export interface OutletsResponse {
  outlets: Outlet[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const outletsApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    locationType?: string,
    activeOnly?: boolean
  ): Promise<OutletsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (locationType) params.append('locationType', locationType);
    if (activeOnly !== undefined) params.append('activeOnly', activeOnly.toString());

    const response = await apiClient.get<any>(`/api/outlets?${params}`);
    const data = response.data.data || response.data;
    return {
      outlets: data.Outlets || data.outlets || [],
      page: data.Page || data.page || page,
      pageSize: data.PageSize || data.pageSize || pageSize,
      totalPages: data.TotalPages || data.totalPages || 1,
      totalCount: data.TotalCount || data.totalCount || 0,
    };
  },

  async getById(id: string): Promise<Outlet> {
    const response = await apiClient.get<any>(`/api/outlets/${id}`);
    return response.data.data || response.data;
  },

  async create(data: CreateOutletDto): Promise<Outlet> {
    const response = await apiClient.post<any>('/api/outlets', data);
    return response.data.data || response.data;
  },

  async update(id: string, data: UpdateOutletDto): Promise<Outlet> {
    const response = await apiClient.put<any>(`/api/outlets/${id}`, data);
    return response.data.data || response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/outlets/${id}`);
  },
};
