import { apiClient } from './client';

export interface RecipeTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeTemplateDto {
  code: string;
  name: string;
  description?: string;
  categoryId?: string;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateRecipeTemplateDto extends CreateRecipeTemplateDto {}

export interface RecipeTemplatesResponse {
  recipeTemplates: RecipeTemplate[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const recipeTemplatesApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    activeOnly?: boolean
  ): Promise<RecipeTemplatesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (activeOnly !== undefined) params.append('activeOnly', activeOnly.toString());

    const response = await apiClient.get<RecipeTemplatesResponse>(`/recipetemplates?${params}`);
    return response.data.data;
  },

  async getById(id: string): Promise<RecipeTemplate> {
    const response = await apiClient.get<RecipeTemplate>(`/recipetemplates/${id}`);
    return response.data.data;
  },

  async create(dto: CreateRecipeTemplateDto): Promise<RecipeTemplate> {
    const response = await apiClient.post<RecipeTemplate>('/recipetemplates', dto);
    return response.data.data;
  },

  async update(id: string, dto: UpdateRecipeTemplateDto): Promise<RecipeTemplate> {
    const response = await apiClient.put<RecipeTemplate>(`/recipetemplates/${id}`, dto);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/recipetemplates/${id}`);
  },
};
