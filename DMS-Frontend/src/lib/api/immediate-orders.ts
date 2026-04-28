import apiClient, { type ApiEnvelope } from './api-client';

export interface ImmediateOrder {
  id: string;
  outletId: string;
  outletName: string;
  productId: string;
  productName: string;
  deliveryTurnId: string;
  deliveryTurnName: string;
  orderDate: string;
  quantity: number;
  status: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface ImmediateOrderList {
  id: string;
  outletName: string;
  productName: string;
  deliveryTurnName: string;
  orderDate: string;
  quantity: number;
  status: string;
  requestedAt: string;
}

export interface CreateImmediateOrderDto {
  outletId: string;
  productId: string;
  deliveryTurnId: string;
  orderDate: string;
  quantity: number;
  notes?: string;
}

export interface UpdateImmediateOrderDto {
  outletId: string;
  productId: string;
  deliveryTurnId: string;
  orderDate: string;
  quantity: number;
  notes?: string;
}

export interface ImmediateOrdersResponse {
  immediateOrders: ImmediateOrderList[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const immediateOrdersApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    fromDate?: string,
    toDate?: string,
    status?: string,
    outletId?: string,
    deliveryTurnId?: string
  ): Promise<ImmediateOrdersResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (status) params.append('status', status);
    if (outletId) params.append('outletId', outletId);
    if (deliveryTurnId) params.append('deliveryTurnId', deliveryTurnId);

    const response = await apiClient.get<ApiEnvelope<ImmediateOrdersResponse>>(
      `/api/immediate-orders?${params}`
    );
    return response.data.data;
  },

  async getByDateAndTurn(date: string, turnId: string): Promise<ImmediateOrderList[]> {
    const params = new URLSearchParams();
    params.append('date', date);
    params.append('turnId', turnId);

    const response = await apiClient.get<ApiEnvelope<ImmediateOrderList[]>>(
      `/api/immediate-orders/by-date-turn?${params}`
    );
    return response.data.data;
  },

  async getById(id: string): Promise<ImmediateOrder> {
    const response = await apiClient.get<ApiEnvelope<ImmediateOrder>>(
      `/api/immediate-orders/${id}`
    );
    return response.data.data;
  },

  async create(data: CreateImmediateOrderDto): Promise<ImmediateOrder> {
    const response = await apiClient.post<ApiEnvelope<ImmediateOrder>>(
      '/api/immediate-orders',
      data
    );
    return response.data.data;
  },

  async update(id: string, data: UpdateImmediateOrderDto): Promise<ImmediateOrder> {
    const response = await apiClient.put<ApiEnvelope<ImmediateOrder>>(
      `/api/immediate-orders/${id}`,
      data
    );
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/immediate-orders/${id}`);
  },

  async approve(id: string): Promise<ImmediateOrder> {
    const response = await apiClient.post<ApiEnvelope<ImmediateOrder>>(
      `/api/immediate-orders/${id}/approve`
    );
    return response.data.data;
  },

  async reject(id: string, reason: string): Promise<ImmediateOrder> {
    const response = await apiClient.post<ApiEnvelope<ImmediateOrder>>(
      `/api/immediate-orders/${id}/reject`,
      { reason }
    );
    return response.data.data;
  },
};
