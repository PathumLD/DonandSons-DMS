import { apiClient } from './client';

export interface DefaultQuantity {
  id: string;
  outletId: string;
  outletName: string;
  dayTypeId: string;
  dayTypeName: string;
  productId: string;
  productName: string;
  fullQuantity: number;
  miniQuantity: number;
  updatedAt: string;
  isActive: boolean;
  createdAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface CreateDefaultQuantityDto {
  outletId: string;
  dayTypeId: string;
  productId: string;
  fullQuantity: number;
  miniQuantity: number;
}

export interface UpdateDefaultQuantityDto {
  fullQuantity: number;
  miniQuantity: number;
}

export interface BulkUpsertDefaultQuantityDto {
  id?: string;
  outletId: string;
  dayTypeId: string;
  productId: string;
  fullQuantity: number;
  miniQuantity: number;
}

export const defaultQuantitiesApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    outletId?: string;
    dayTypeId?: string;
    productId?: string;
  }) => {
    const response = await apiClient.get<{
      defaultQuantities: DefaultQuantity[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>('/default-quantities', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<DefaultQuantity>(`/default-quantities/${id}`);
    return response.data;
  },

  getByCompositeKey: async (outletId: string, dayTypeId: string, productId: string) => {
    const response = await apiClient.get<DefaultQuantity>('/default-quantities/by-key', {
      params: { outletId, dayTypeId, productId }
    });
    return response.data;
  },

  create: async (data: CreateDefaultQuantityDto) => {
    const response = await apiClient.post<DefaultQuantity>('/default-quantities', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDefaultQuantityDto) => {
    const response = await apiClient.put<DefaultQuantity>(`/default-quantities/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/default-quantities/${id}`);
    return response.data;
  },

  bulkUpsert: async (items: BulkUpsertDefaultQuantityDto[]) => {
    const response = await apiClient.post<DefaultQuantity[]>('/default-quantities/bulk-upsert', items);
    return response.data;
  },
};
