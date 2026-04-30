import api from './api-client';

export interface ProductionCancel {
  id: string;
  cancelNo: string;
  cancelDate: string;
  productionNo: string;
  productId: string;
  product?: {
    id: string;
    code: string;
    name: string;
  };
  cancelledQty: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedById?: string;
  approvedByName?: string;
  approvedBy?: {
    id: string;
    username: string;
    fullName: string;
  };
  approvedDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdByName?: string;
  updatedById: string;
  updatedByName?: string;
}

export interface CreateProductionCancelDto {
  cancelDate: string;
  productionNo: string;
  productId: string;
  cancelledQty: number;
  reason: string;
}

export interface UpdateProductionCancelDto {
  cancelDate: string;
  productionNo: string;
  productId: string;
  cancelledQty: number;
  reason: string;
}

export interface ProductionCancelListResponse {
  data: ProductionCancel[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

const BASE_URL = '/api/production-cancels';

export const productionCancelsApi = {
  getAll: async (page = 1, pageSize = 10, filters?: {
    fromDate?: string;
    toDate?: string;
    productId?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await api.get<any>(`${BASE_URL}?${params}`);
    const data = response.data.data || response.data;
    const items = data.Data || data.data || data;
    return {
      data: Array.isArray(items) ? items : [],
      page: data.Page || data.page || page,
      pageSize: data.PageSize || data.pageSize || pageSize,
      totalPages: data.TotalPages || data.totalPages || 1,
      totalCount: data.TotalCount || data.totalCount || 0,
    };
  },

  getById: async (id: string) => {
    const response = await api.get<any>(`${BASE_URL}/${id}`);
    return response.data.data || response.data;
  },

  getByCancelNo: async (cancelNo: string) => {
    const response = await api.get<ProductionCancel>(`${BASE_URL}/by-cancel-no/${cancelNo}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateProductionCancelDto) => {
    const response = await api.post<ProductionCancel>(BASE_URL, data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: UpdateProductionCancelDto) => {
    const response = await api.put<ProductionCancel>(`${BASE_URL}/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data.data || response.data;
  },

  approve: async (id: string) => {
    const response = await api.post<ProductionCancel>(`${BASE_URL}/${id}/approve`);
    return response.data.data || response.data;
  },

  reject: async (id: string) => {
    const response = await api.post<ProductionCancel>(`${BASE_URL}/${id}/reject`);
    return response.data.data || response.data;
  },
};
