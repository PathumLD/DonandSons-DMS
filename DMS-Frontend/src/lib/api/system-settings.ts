import apiClient from './client';

export interface SystemSetting {
  id: string;
  settingKey: string;
  settingName: string;
  settingValue?: string;
  settingType: string;
  description?: string;
  category?: string;
  isSystemSetting: boolean;
  isEncrypted: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSystemSettingDto {
  settingKey: string;
  settingName: string;
  settingValue?: string;
  settingType: string;
  description?: string;
  category?: string;
  isSystemSetting: boolean;
  isEncrypted: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdateSystemSettingDto {
  settingKey: string;
  settingName: string;
  settingValue?: string;
  settingType: string;
  description?: string;
  category?: string;
  isSystemSetting: boolean;
  isEncrypted: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface SystemSettingsResponse {
  settings: SystemSetting[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const systemSettingsApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    category?: string,
    search?: string,
    activeOnly?: boolean
  ): Promise<SystemSettingsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (activeOnly !== undefined) params.append('activeOnly', activeOnly.toString());

    const response = await apiClient.get<SystemSettingsResponse>(`/api/system-settings?${params}`);
    return response.data.data;
  },

  async getById(id: string): Promise<SystemSetting> {
    const response = await apiClient.get<SystemSetting>(`/api/system-settings/${id}`);
    return response.data.data;
  },

  async getByKey(key: string): Promise<SystemSetting> {
    const response = await apiClient.get<SystemSetting>(`/api/system-settings/key/${key}`);
    return response.data.data;
  },

  async create(data: CreateSystemSettingDto): Promise<SystemSetting> {
    const response = await apiClient.post<SystemSetting>('/api/system-settings', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateSystemSettingDto): Promise<SystemSetting> {
    const response = await apiClient.put<SystemSetting>(`/api/system-settings/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/system-settings/${id}`);
  },
};
