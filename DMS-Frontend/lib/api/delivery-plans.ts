import { apiClient } from './client';

export interface DeliveryPlanItem {
  id: string;
  deliveryPlanId: string;
  productId: string;
  productName: string;
  outletId: string;
  outletName: string;
  fullQuantity: number;
  miniQuantity: number;
  notes?: string;
}

export interface DeliveryPlan {
  id: string;
  planNo: string;
  planDate: string;
  deliveryTurnId: string;
  deliveryTurnName: string;
  dayTypeId: string;
  dayTypeName: string;
  status: string;
  useFreezerStock: boolean;
  excludedOutlets?: string[];
  excludedProducts?: string[];
  notes?: string;
  items: DeliveryPlanItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface DeliveryPlanListItem {
  id: string;
  planNo: string;
  planDate: string;
  deliveryTurnId: string;
  deliveryTurnName: string;
  dayTypeId: string;
  dayTypeName: string;
  status: string;
  useFreezerStock: boolean;
  totalItems: number;
  updatedAt: string;
}

export interface CreateDeliveryPlanDto {
  planNo: string;
  planDate: string;
  deliveryTurnId: string;
  dayTypeId: string;
  useFreezerStock?: boolean;
  excludedOutlets?: string[];
  excludedProducts?: string[];
  notes?: string;
}

export interface UpdateDeliveryPlanDto {
  planDate: string;
  deliveryTurnId: string;
  dayTypeId: string;
  useFreezerStock?: boolean;
  excludedOutlets?: string[];
  excludedProducts?: string[];
  notes?: string;
}

export interface BulkUpsertDeliveryPlanItemDto {
  id?: string;
  productId: string;
  outletId: string;
  fullQuantity: number;
  miniQuantity: number;
  notes?: string;
}

export const deliveryPlansApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
    status?: string;
    deliveryTurnId?: string;
  }) => {
    const response = await apiClient.get<{
      deliveryPlans: DeliveryPlanListItem[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>('/delivery-plans', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<DeliveryPlan>(`/delivery-plans/${id}`);
    return response.data;
  },

  getByPlanNo: async (planNo: string) => {
    const response = await apiClient.get<DeliveryPlan>(`/delivery-plans/by-plan-no/${planNo}`);
    return response.data;
  },

  create: async (data: CreateDeliveryPlanDto) => {
    const response = await apiClient.post<DeliveryPlan>('/delivery-plans', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDeliveryPlanDto) => {
    const response = await apiClient.put<DeliveryPlan>(`/delivery-plans/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/delivery-plans/${id}`);
    return response.data;
  },

  submit: async (id: string) => {
    const response = await apiClient.post<DeliveryPlan>(`/delivery-plans/${id}/submit`);
    return response.data;
  },

  bulkUpsertItems: async (id: string, items: BulkUpsertDeliveryPlanItemDto[]) => {
    const response = await apiClient.post<DeliveryPlanItem[]>(
      `/delivery-plans/${id}/items/bulk-upsert`,
      items
    );
    return response.data;
  },
};
