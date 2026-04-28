import { apiClient } from './api-client';

export interface PriceList {
  id: string;
  code: string;
  name: string;
  description?: string;
  priceListType?: string;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isDefault: boolean;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePriceListDto {
  code: string;
  name: string;
  description?: string;
  priceListType?: string;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isDefault: boolean;
  priority: number;
  isActive: boolean;
}

export interface UpdatePriceListDto extends CreatePriceListDto {}

export interface PriceListsResponse {
  priceLists: PriceList[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const priceListsApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    activeOnly?: boolean
  ): Promise<PriceListsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (activeOnly !== undefined) params.append('activeOnly', activeOnly.toString());

    const response = await apiClient.get<PriceListsResponse>(`/pricelists?${params}`);
    return response.data.data;
  },

  async getById(id: string): Promise<PriceList> {
    const response = await apiClient.get<PriceList>(`/pricelists/${id}`);
    return response.data.data;
  },

  async create(data: CreatePriceListDto): Promise<PriceList> {
    const response = await apiClient.post<PriceList>('/pricelists', data);
    return response.data.data;
  },

  async update(id: string, data: UpdatePriceListDto): Promise<PriceList> {
    const response = await apiClient.put<PriceList>(`/pricelists/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/pricelists/${id}`);
  },
};
