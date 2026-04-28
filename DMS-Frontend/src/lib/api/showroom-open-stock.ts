import api from './api-client';

export interface ShowroomOpenStock {
  id: string;
  outletId: string;
  outlet: {
    id: string;
    code: string;
    name: string;
  };
  stockAsAt: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById: string;
}

export interface CreateShowroomOpenStockDto {
  outletId: string;
  stockAsAt: string;
}

export interface UpdateShowroomOpenStockDto {
  stockAsAt: string;
}

const BASE_URL = '/api/showroom-open-stocks';

export const showroomOpenStockApi = {
  getAll: async () => {
    const response = await api.get<ShowroomOpenStock[]>(BASE_URL);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ShowroomOpenStock>(`${BASE_URL}/${id}`);
    return response.data;
  },

  getByOutletId: async (outletId: string) => {
    const response = await api.get<ShowroomOpenStock>(`${BASE_URL}/by-outlet/${outletId}`);
    return response.data;
  },

  create: async (data: CreateShowroomOpenStockDto) => {
    const response = await api.post<ShowroomOpenStock>(BASE_URL, data);
    return response.data;
  },

  update: async (id: string, data: UpdateShowroomOpenStockDto) => {
    const response = await api.put<ShowroomOpenStock>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};
