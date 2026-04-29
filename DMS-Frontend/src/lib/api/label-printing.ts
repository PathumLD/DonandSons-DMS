import api from './api-client';

export interface LabelPrintRequest {
  id: string;
  displayNo: string;
  date: string;
  productId: string;
  productName: string;
  productCode: string;
  product?: {
    id: string;
    code: string;
    name: string;
    enableLabelPrint: boolean;
    allowFutureLabelPrint: boolean;
  };
  labelCount: number;
  startDate: string;
  expiryDays: number;
  priceOverride?: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedById?: string;
  approvedBy?: {
    id: string;
    username: string;
    fullName: string;
  };
  approvedByName?: string;
  approvedDate?: string;
  rejectedByName?: string;
  rejectedDate?: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById: string;
  updatedByName?: string;
}

export interface CreateLabelPrintRequestDto {
  date: string;
  productId: string;
  labelCount: number;
  startDate: string;
  expiryDays: number;
  priceOverride?: number;
}

export interface UpdateLabelPrintRequestDto {
  date: string;
  productId: string;
  labelCount: number;
  startDate: string;
  expiryDays: number;
  priceOverride?: number;
}

export interface LabelPrintRequestListResponse {
  labelPrintRequests: LabelPrintRequest[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface LabelPrintData {
  productCode: string;
  productName: string;
  startDate: string;
  expiryDate: string;
  price: number;
  batchNo?: string;
}

const BASE_URL = '/api/label-print-requests';

export const labelPrintingApi = {
  getAll: async (page = 1, pageSize = 10, filters?: {
    startDate?: string;
    endDate?: string;
    productId?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await api.get<any>(`${BASE_URL}?${params}`);
    const data = response.data.data || response.data;
    return {
      labelPrintRequests: data.LabelPrintRequests || data.labelPrintRequests || [],
      page: data.Page || data.page || page,
      pageSize: data.PageSize || data.pageSize || pageSize,
      totalPages: data.TotalPages || data.totalPages || 1,
      totalCount: data.TotalCount || data.totalCount || 0,
    };
  },

  getById: async (id: string) => {
    const response = await api.get<LabelPrintRequest>(`${BASE_URL}/${id}`);
    return response.data;
  },

  create: async (data: CreateLabelPrintRequestDto) => {
    const response = await api.post<LabelPrintRequest>(BASE_URL, data);
    return response.data;
  },

  update: async (id: string, data: UpdateLabelPrintRequestDto) => {
    const response = await api.put<LabelPrintRequest>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.post<LabelPrintRequest>(`${BASE_URL}/${id}/approve`);
    return response.data;
  },

  reject: async (id: string) => {
    const response = await api.post<LabelPrintRequest>(`${BASE_URL}/${id}/reject`);
    return response.data;
  },

  generatePrintData: async (requestId: string) => {
    const response = await api.get<LabelPrintData[]>(`/api/labels/print?requestId=${requestId}`);
    return response.data;
  },
};
