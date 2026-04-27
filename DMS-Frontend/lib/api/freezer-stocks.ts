import { apiClient } from './client';

export interface FreezerStock {
  id: string;
  productId: string;
  productName: string;
  productionSectionId: string;
  productionSectionName: string;
  currentStock: number;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface FreezerStockListItem {
  id: string;
  productId: string;
  productName: string;
  productionSectionId: string;
  productionSectionName: string;
  currentStock: number;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export interface FreezerStockHistory {
  id: string;
  freezerStockId: string;
  transactionDate: string;
  transactionType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceNo?: string;
  createdAt: string;
  createdById?: string;
}

export interface AdjustFreezerStockDto {
  productId: string;
  productionSectionId: string;
  quantity: number;
  transactionType: 'Addition' | 'Deduction' | 'Adjustment' | 'Transfer';
  reason: string;
  referenceNo?: string;
}

export const freezerStocksApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    productId?: string;
    productionSectionId?: string;
  }) => {
    const response = await apiClient.get<{
      freezerStocks: FreezerStockListItem[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>('/freezer-stocks', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<FreezerStock>(`/freezer-stocks/${id}`);
    return response.data;
  },

  getCurrentStock: async (productId: string, productionSectionId: string) => {
    const response = await apiClient.get<FreezerStock>('/freezer-stocks/current', {
      params: { productId, productionSectionId }
    });
    return response.data;
  },

  adjustStock: async (data: AdjustFreezerStockDto) => {
    const response = await apiClient.post<FreezerStock>('/freezer-stocks/adjust', data);
    return response.data;
  },

  getHistory: async (
    productId: string,
    productionSectionId: string,
    fromDate?: string,
    toDate?: string
  ) => {
    const response = await apiClient.get<FreezerStockHistory[]>('/freezer-stocks/history', {
      params: { productId, productionSectionId, fromDate, toDate }
    });
    return response.data;
  },
};
