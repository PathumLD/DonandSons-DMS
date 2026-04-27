import apiClient from './client';

export interface DeliveryTurn {
  id: string;
  code: string;
  name: string;
  description?: string;
  time: string;
  timeFormatted: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDeliveryTurnDto {
  code: string;
  name: string;
  description?: string;
  time: string;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdateDeliveryTurnDto {
  code: string;
  name: string;
  description?: string;
  time: string;
  displayOrder: number;
  isActive: boolean;
}

export interface DeliveryTurnsResponse {
  deliveryTurns: DeliveryTurn[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const deliveryTurnsApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    activeOnly?: boolean
  ): Promise<DeliveryTurnsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (activeOnly !== undefined) params.append('activeOnly', activeOnly.toString());

    const response = await apiClient.get<DeliveryTurnsResponse>(`/api/delivery-turns?${params}`);
    return response.data.data;
  },

  async getById(id: string): Promise<DeliveryTurn> {
    const response = await apiClient.get<DeliveryTurn>(`/api/delivery-turns/${id}`);
    return response.data.data;
  },

  async create(data: CreateDeliveryTurnDto): Promise<DeliveryTurn> {
    const response = await apiClient.post<DeliveryTurn>('/api/delivery-turns', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateDeliveryTurnDto): Promise<DeliveryTurn> {
    const response = await apiClient.put<DeliveryTurn>(`/api/delivery-turns/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/delivery-turns/${id}`);
  },
};
