import { apiClient } from './client';

export interface ImmediateOrder {
  id: string;
  orderNo: string;
  orderDate: string;
  deliveryTurnId: string;
  deliveryTurnName: string;
  outletId: string;
  outletName: string;
  productId: string;
  productName: string;
  fullQuantity: number;
  miniQuantity: number;
  requestedBy: string;
  reason: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface ImmediateOrderListItem {
  id: string;
  orderNo: string;
  orderDate: string;
  deliveryTurnId: string;
  deliveryTurnName: string;
  outletId: string;
  outletName: string;
  productId: string;
  productName: string;
  fullQuantity: number;
  miniQuantity: number;
  requestedBy: string;
  status: string;
  createdAt: string;
}

export interface CreateImmediateOrderDto {
  orderDate: string;
  deliveryTurnId: string;
  outletId: string;
  productId: string;
  fullQuantity: number;
  miniQuantity: number;
  requestedBy: string;
  reason: string;
}

export interface UpdateImmediateOrderDto {
  orderDate: string;
  deliveryTurnId: string;
  outletId: string;
  productId: string;
  fullQuantity: number;
  miniQuantity: number;
  requestedBy: string;
  reason: string;
}

export const immediateOrdersApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
    status?: string;
    outletId?: string;
    deliveryTurnId?: string;
  }) => {
    const response = await apiClient.get<{
      immediateOrders: ImmediateOrderListItem[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>('/immediate-orders', { params });
    return response.data;
  },

  getByDateAndTurn: async (date: string, turnId: string) => {
    const response = await apiClient.get<ImmediateOrderListItem[]>('/immediate-orders/by-date-turn', {
      params: { date, turnId }
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ImmediateOrder>(`/immediate-orders/${id}`);
    return response.data;
  },

  create: async (data: CreateImmediateOrderDto) => {
    const response = await apiClient.post<ImmediateOrder>('/immediate-orders', data);
    return response.data;
  },

  update: async (id: string, data: UpdateImmediateOrderDto) => {
    const response = await apiClient.put<ImmediateOrder>(`/immediate-orders/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/immediate-orders/${id}`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await apiClient.post<ImmediateOrder>(`/immediate-orders/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, reason: string) => {
    const response = await apiClient.post<ImmediateOrder>(`/immediate-orders/${id}/reject`, { reason });
    return response.data;
  },
};
