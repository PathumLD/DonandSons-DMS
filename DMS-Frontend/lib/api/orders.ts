import { apiClient } from './client';

export interface OrderItem {
  id: string;
  orderHeaderId: string;
  productId: string;
  productName: string;
  outletId: string;
  outletName: string;
  deliveryTurnId: string;
  deliveryTurnName: string;
  fullQuantity: number;
  miniQuantity: number;
  isExtra: boolean;
  isCustomized: boolean;
  customizationNotes?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  orderDate: string;
  deliveryPlanId?: string;
  deliveryPlanNo?: string;
  status: string;
  useFreezerStock: boolean;
  totalItems: number;
  notes?: string;
  items: OrderItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface OrderListItem {
  id: string;
  orderNo: string;
  orderDate: string;
  deliveryPlanId?: string;
  deliveryPlanNo?: string;
  status: string;
  useFreezerStock: boolean;
  totalItems: number;
  updatedAt: string;
}

export interface CreateOrderDto {
  orderNo: string;
  orderDate: string;
  deliveryPlanId?: string;
  useFreezerStock?: boolean;
  notes?: string;
}

export interface UpdateOrderDto {
  orderDate: string;
  deliveryPlanId?: string;
  useFreezerStock?: boolean;
  notes?: string;
}

export interface BulkUpsertOrderItemDto {
  id?: string;
  productId: string;
  outletId: string;
  deliveryTurnId: string;
  fullQuantity: number;
  miniQuantity: number;
  isExtra?: boolean;
  isCustomized?: boolean;
  customizationNotes?: string;
  notes?: string;
}

export const ordersApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
    status?: string;
    deliveryPlanId?: string;
  }) => {
    const response = await apiClient.get<{
      orders: OrderListItem[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>('/orders', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  getByOrderNo: async (orderNo: string) => {
    const response = await apiClient.get<Order>(`/orders/by-order-no/${orderNo}`);
    return response.data;
  },

  getByDateAndTurn: async (date: string, turnId: string) => {
    const response = await apiClient.get<OrderListItem[]>('/orders/by-date-turn', {
      params: { date, turnId }
    });
    return response.data;
  },

  create: async (data: CreateOrderDto) => {
    const response = await apiClient.post<Order>('/orders', data);
    return response.data;
  },

  update: async (id: string, data: UpdateOrderDto) => {
    const response = await apiClient.put<Order>(`/orders/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },

  submit: async (id: string) => {
    const response = await apiClient.post<Order>(`/orders/${id}/submit`);
    return response.data;
  },

  bulkUpsertItems: async (id: string, items: BulkUpsertOrderItemDto[]) => {
    const response = await apiClient.post<OrderItem[]>(`/orders/${id}/items/bulk-upsert`, items);
    return response.data;
  },
};
