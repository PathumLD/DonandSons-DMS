import { apiClient } from './client';

export interface WorkflowConfig {
  id: string;
  code: string;
  name: string;
  description?: string;
  entityType: string;
  workflowType: string;
  requiresApproval: boolean;
  approvalLevels: number;
  autoApproveThreshold?: number;
  approvalSteps?: string;
  notificationSettings?: string;
  timeoutHours?: number;
  escalationConfig?: string;
  isEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWorkflowConfigDto {
  code: string;
  name: string;
  description?: string;
  entityType: string;
  workflowType: string;
  requiresApproval: boolean;
  approvalLevels: number;
  autoApproveThreshold?: number;
  approvalSteps?: string;
  notificationSettings?: string;
  timeoutHours?: number;
  escalationConfig?: string;
  isEnabled: boolean;
  isActive: boolean;
}

export interface UpdateWorkflowConfigDto extends CreateWorkflowConfigDto {}

export interface WorkflowConfigsResponse {
  workflowConfigs: WorkflowConfig[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const workflowConfigsApi = {
  async getAll(
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    entityType?: string,
    activeOnly?: boolean
  ): Promise<WorkflowConfigsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (entityType) params.append('entityType', entityType);
    if (activeOnly !== undefined) params.append('activeOnly', activeOnly.toString());

    const response = await apiClient.get<WorkflowConfigsResponse>(`/workflowconfigs?${params}`);
    return response.data.data;
  },

  async getById(id: string): Promise<WorkflowConfig> {
    const response = await apiClient.get<WorkflowConfig>(`/workflowconfigs/${id}`);
    return response.data.data;
  },

  async create(data: CreateWorkflowConfigDto): Promise<WorkflowConfig> {
    const response = await apiClient.post<WorkflowConfig>('/workflowconfigs', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateWorkflowConfigDto): Promise<WorkflowConfig> {
    const response = await apiClient.put<WorkflowConfig>(`/workflowconfigs/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/workflowconfigs/${id}`);
  },
};
