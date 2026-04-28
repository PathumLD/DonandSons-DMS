import apiClient from './api-client';

export interface Approval {
  id: string;
  approvalType: string;
  entityId: string;
  entityReference?: string;
  requestedById: string;
  requestedByName: string;
  requestedByEmail?: string;
  requestedAt: string;
  status: string;
  approvedById?: string;
  approvedByName?: string;
  approvedByEmail?: string;
  approvedAt?: string;
  rejectionReason?: string;
  requestData?: string;
  priority: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateApprovalDto {
  approvalType: string;
  entityId: string;
  entityReference?: string;
  requestedById: string;
  requestData?: string;
  priority: number;
  notes?: string;
  isActive: boolean;
}

export interface ApproveApprovalDto {
  notes?: string;
}

export interface RejectApprovalDto {
  rejectionReason: string;
  notes?: string;
}

export interface ApprovalsResponse {
  approvals: Approval[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const approvalsApi = {
  async getPending(
    page: number = 1,
    pageSize: number = 50,
    approvalType?: string
  ): Promise<ApprovalsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (approvalType) params.append('approvalType', approvalType);

    const response = await apiClient.get<ApprovalsResponse>(`/api/approvals/pending?${params}`);
    return response.data.data;
  },

  async getAll(
    page: number = 1,
    pageSize: number = 50,
    approvalType?: string,
    status?: string
  ): Promise<ApprovalsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (approvalType) params.append('approvalType', approvalType);
    if (status) params.append('status', status);

    const response = await apiClient.get<ApprovalsResponse>(`/api/approvals?${params}`);
    return response.data.data;
  },

  async getById(id: string): Promise<Approval> {
    const response = await apiClient.get<Approval>(`/api/approvals/${id}`);
    return response.data.data;
  },

  async approve(id: string, data: ApproveApprovalDto): Promise<Approval> {
    const response = await apiClient.post<Approval>(`/api/approvals/${id}/approve`, data);
    return response.data.data;
  },

  async reject(id: string, data: RejectApprovalDto): Promise<Approval> {
    const response = await apiClient.post<Approval>(`/api/approvals/${id}/reject`, data);
    return response.data.data;
  },
};
