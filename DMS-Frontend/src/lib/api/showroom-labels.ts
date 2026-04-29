import api from './api-client';

export interface ShowroomLabelRequest {
  id: string;
  outletId: string;
  outletCode: string;
  outletName: string;
  text1: string;
  text2?: string;
  labelCount: number;
  requestDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface CreateShowroomLabelRequestDto {
  outletId: string;
  text1: string;
  text2?: string;
  labelCount: number;
}

const BASE_URL = '/api/showroom-label-requests';

export const showroomLabelsApi = {
  getAll: async (page = 1, pageSize = 10, outletId?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (outletId) params.append('outletId', outletId);

    const response = await api.get<any>(`${BASE_URL}?${params}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string) => {
    const response = await api.get<any>(`${BASE_URL}/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateShowroomLabelRequestDto) => {
    const response = await api.post<any>(BASE_URL, data);
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<any>(`${BASE_URL}/${id}`);
    return response.data.data || response.data;
  },
};
