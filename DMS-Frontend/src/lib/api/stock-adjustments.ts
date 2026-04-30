import api from './api-client';

export interface StockAdjustment {
  id: string;
  adjustmentNo: string;
  adjustmentDate: string;
  productId: string;
  product?: {
    id: string;
    code: string;
    name: string;
  };
  adjustmentType: 'Increase' | 'Decrease';
  quantity: number;
  reason: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
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

export interface CreateStockAdjustmentDto {
  adjustmentDate: string;
  productId: string;
  adjustmentType: 'Increase' | 'Decrease';
  quantity: number;
  reason: string;
  notes?: string;
}

export interface UpdateStockAdjustmentDto {
  adjustmentDate: string;
  productId: string;
  adjustmentType: 'Increase' | 'Decrease';
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockAdjustmentListResponse {
  data: StockAdjustment[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

const BASE_URL = '/api/stock-adjustments';

export const stockAdjustmentsApi = {
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

  getByAdjustmentNo: async (adjustmentNo: string) => {
    const response = await api.get<StockAdjustment>(`${BASE_URL}/by-adjustment-no/${adjustmentNo}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateStockAdjustmentDto) => {
    const response = await api.post<StockAdjustment>(BASE_URL, data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: UpdateStockAdjustmentDto) => {
    const response = await api.put<StockAdjustment>(`${BASE_URL}/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data.data || response.data;
  },

  submit: async (id: string) => {
    const response = await api.post<StockAdjustment>(`${BASE_URL}/${id}/submit`);
    return response.data.data || response.data;
  },

  approve: async (id: string) => {
    const response = await api.post<StockAdjustment>(`${BASE_URL}/${id}/approve`);
    return response.data.data || response.data;
  },

  reject: async (id: string) => {
    const response = await api.post<StockAdjustment>(`${BASE_URL}/${id}/reject`);
    return response.data.data || response.data;
  },
};
