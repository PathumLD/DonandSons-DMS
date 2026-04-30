import api from './api-client';

export interface ProductionPlan {
  id: string;
  planNo: string;
  planDate: string;
  productId: string;
  product?: {
    id: string;
    code: string;
    name: string;
  };
  plannedQty: number;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Approved' | 'InProgress' | 'Completed';
  reference?: string;
  comment?: string;
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

export interface CreateProductionPlanDto {
  planDate: string;
  productId: string;
  plannedQty: number;
  priority: 'Low' | 'Medium' | 'High';
  reference?: string;
  comment?: string;
  notes?: string;
}

export interface UpdateProductionPlanDto {
  planDate: string;
  productId: string;
  plannedQty: number;
  priority: 'Low' | 'Medium' | 'High';
  reference?: string;
  comment?: string;
  notes?: string;
}

export interface ProductionPlanListResponse {
  data: ProductionPlan[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

const BASE_URL = '/api/production-plans';

export const productionPlansApi = {
  getAll: async (page = 1, pageSize = 10, filters?: {
    fromDate?: string;
    toDate?: string;
    productId?: string;
    status?: string;
    priority?: string;
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    
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

  getByPlanNo: async (planNo: string) => {
    const response = await api.get<ProductionPlan>(`${BASE_URL}/by-plan-no/${planNo}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateProductionPlanDto) => {
    const response = await api.post<ProductionPlan>(BASE_URL, data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: UpdateProductionPlanDto) => {
    const response = await api.put<ProductionPlan>(`${BASE_URL}/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data.data || response.data;
  },

  approve: async (id: string) => {
    const response = await api.post<ProductionPlan>(`${BASE_URL}/${id}/approve`);
    return response.data.data || response.data;
  },

  start: async (id: string) => {
    const response = await api.post<ProductionPlan>(`${BASE_URL}/${id}/start`);
    return response.data.data || response.data;
  },

  complete: async (id: string) => {
    const response = await api.post<ProductionPlan>(`${BASE_URL}/${id}/complete`);
    return response.data.data || response.data;
  },
};
