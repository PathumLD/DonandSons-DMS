import api from './api-client';

export interface OperationApprovalItem {
  id: string;
  approvalType: string;
  referenceNo: string;
  requestDate: string;
  outletName: string;
  status: string;
  requestedByName?: string;
  description?: string;
  totalValue?: number;
  itemCount?: number;
}

export interface OperationApprovalsSummary {
  deliveries: OperationApprovalItem[];
  transfers: OperationApprovalItem[];
  disposals: OperationApprovalItem[];
  cancellations: OperationApprovalItem[];
  labelPrintRequests: OperationApprovalItem[];
  stockBFs: OperationApprovalItem[];
  deliveryReturns: OperationApprovalItem[];
  totalPendingCount: number;
}

const BASE_URL = '/api/operation-approvals';

export const operationApprovalsApi = {
  getPending: async () => {
    const response = await api.get<any>(`${BASE_URL}/pending`);
    return response.data.data || response.data;
  },
};
