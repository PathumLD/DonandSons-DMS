import { apiClient } from './api-client';

export interface LabelTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  templateType?: string;
  widthMm: number;
  heightMm: number;
  layoutDesign?: string;
  fields?: string;
  fontSettings?: string;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLabelTemplateDto {
  code: string;
  name: string;
  description?: string;
  templateType?: string;
  widthMm: number;
  heightMm: number;
  layoutDesign?: string;
  fields?: string;
  fontSettings?: string;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface UpdateLabelTemplateDto extends CreateLabelTemplateDto {}

export interface LabelTemplatesResponse {
  labelTemplates: LabelTemplate[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const labelTemplatesApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    activeOnly?: boolean
  ): Promise<LabelTemplatesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (activeOnly !== undefined) params.append('activeOnly', activeOnly.toString());

    const response = await apiClient.get<LabelTemplatesResponse>(`/labeltemplates?${params}`);
    return response.data.data;
  },

  async getById(id: string): Promise<LabelTemplate> {
    const response = await apiClient.get<LabelTemplate>(`/labeltemplates/${id}`);
    return response.data.data;
  },

  async create(data: CreateLabelTemplateDto): Promise<LabelTemplate> {
    const response = await apiClient.post<LabelTemplate>('/labeltemplates', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateLabelTemplateDto): Promise<LabelTemplate> {
    const response = await apiClient.put<LabelTemplate>(`/labeltemplates/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/labeltemplates/${id}`);
  },
};
