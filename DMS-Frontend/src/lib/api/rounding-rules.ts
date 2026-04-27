import { apiClient } from './client';

export interface RoundingRule {
  id: string;
  code: string;
  name: string;
  description?: string;
  appliesTo: string;
  roundingMethod: string;
  decimalPlaces: number;
  roundingIncrement: number;
  minValue?: number;
  maxValue?: number;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRoundingRuleDto {
  code: string;
  name: string;
  description?: string;
  appliesTo: string;
  roundingMethod: string;
  decimalPlaces: number;
  roundingIncrement: number;
  minValue?: number;
  maxValue?: number;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface UpdateRoundingRuleDto extends CreateRoundingRuleDto {}

export interface RoundingRulesResponse {
  roundingRules: RoundingRule[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const roundingRulesApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    appliesTo?: string,
    activeOnly?: boolean
  ): Promise<RoundingRulesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (appliesTo) params.append('appliesTo', appliesTo);
    if (activeOnly !== undefined) params.append('activeOnly', activeOnly.toString());

    const response = await apiClient.get<RoundingRulesResponse>(`/roundingrules?${params}`);
    return response.data.data;
  },

  async getById(id: string): Promise<RoundingRule> {
    const response = await apiClient.get<RoundingRule>(`/roundingrules/${id}`);
    return response.data.data;
  },

  async create(data: CreateRoundingRuleDto): Promise<RoundingRule> {
    const response = await apiClient.post<RoundingRule>('/roundingrules', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateRoundingRuleDto): Promise<RoundingRule> {
    const response = await apiClient.put<RoundingRule>(`/roundingrules/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/roundingrules/${id}`);
  },
};
