import { apiClient } from './client';

export interface LabelSetting {
  id: string;
  settingKey: string;
  settingName: string;
  settingValue?: string;
  description?: string;
  category?: string;
  valueType: string;
  sortOrder: number;
  isSystemSetting: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLabelSettingDto {
  settingKey: string;
  settingName: string;
  settingValue?: string;
  description?: string;
  category?: string;
  valueType: string;
  sortOrder: number;
  isSystemSetting: boolean;
  isActive: boolean;
}

export interface UpdateLabelSettingDto extends CreateLabelSettingDto {}

export interface LabelSettingsResponse {
  labelSettings: LabelSetting[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const labelSettingsApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    category?: string,
    activeOnly?: boolean
  ): Promise<LabelSettingsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (activeOnly !== undefined) params.append('activeOnly', activeOnly.toString());

    const response = await apiClient.get<LabelSettingsResponse>(`/labelsettings?${params}`);
    return response.data.data;
  },

  async getById(id: string): Promise<LabelSetting> {
    const response = await apiClient.get<LabelSetting>(`/labelsettings/${id}`);
    return response.data.data;
  },

  async create(data: CreateLabelSettingDto): Promise<LabelSetting> {
    const response = await apiClient.post<LabelSetting>('/labelsettings', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateLabelSettingDto): Promise<LabelSetting> {
    const response = await apiClient.put<LabelSetting>(`/labelsettings/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/labelsettings/${id}`);
  },
};
