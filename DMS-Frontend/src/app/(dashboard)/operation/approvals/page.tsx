'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { operationApprovalsApi, type OperationApprovalItem, type OperationApprovalsSummary } from '@/lib/api/operation-approvals';
import { deliveriesApi, type Delivery } from '@/lib/api/deliveries';
import { transfersApi, type Transfer } from '@/lib/api/transfers';
import { disposalsApi, type Disposal } from '@/lib/api/disposals';
import { cancellationsApi, type Cancellation } from '@/lib/api/cancellations';
import { labelPrintingApi } from '@/lib/api/label-printing';
import { stockBfApi } from '@/lib/api/stock-bf';
import { deliveryReturnsApi } from '@/lib/api/delivery-returns';
import { useThemeStore } from '@/lib/stores/theme-store';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { usePermissions } from '@/hooks/usePermissions';
import toast from 'react-hot-toast';

const APPROVAL_TYPE_PERMISSIONS: Record<string, { approve: string; reject: string }> = {
  Delivery: { approve: 'operation:delivery:approve', reject: 'operation:delivery:reject' },
  Transfer: { approve: 'operation:transfer:approve', reject: 'operation:transfer:reject' },
  Disposal: { approve: 'operation:disposal:approve', reject: 'operation:disposal:reject' },
  Cancellation: { approve: 'operation:cancellation:approve', reject: 'operation:cancellation:reject' },
  LabelPrintRequest: { approve: 'operation:label-printing:approve', reject: 'operation:label-printing:reject' },
  StockBF: { approve: 'operation:stock-bf:approve', reject: 'operation:stock-bf:reject' },
  DeliveryReturn: { approve: 'operation:delivery-return:approve', reject: 'operation:delivery-return:reject' },
};


type ApprovalType = 'deliveries' | 'transfers' | 'disposals' | 'cancellations' | 'labelPrintRequests' | 'stockBFs' | 'deliveryReturns';

type ApprovalArrayKey = 'deliveries' | 'transfers' | 'disposals' | 'cancellations' | 'labelPrintRequests' | 'stockBFs' | 'deliveryReturns';

interface ApprovalTypeOption {
  value: ApprovalType;
  label: string;
  key: ApprovalArrayKey;
}

const APPROVAL_TYPES: ApprovalTypeOption[] = [
  { value: 'deliveries', label: 'Deliveries', key: 'deliveries' },
  { value: 'transfers', label: 'Transfers', key: 'transfers' },
  { value: 'disposals', label: 'Disposals', key: 'disposals' },
  { value: 'cancellations', label: 'Cancellations', key: 'cancellations' },
  { value: 'labelPrintRequests', label: 'Label Print Requests', key: 'labelPrintRequests' },
  { value: 'stockBFs', label: 'Stock BF', key: 'stockBFs' },
  { value: 'deliveryReturns', label: 'Delivery Returns', key: 'deliveryReturns' },
];

export default function OperationApprovalsPage() {
  const { can } = usePermissions();
  const [summary, setSummary] = useState<OperationApprovalsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set());
  const [selectedType, setSelectedType] = useState<ApprovalType>('deliveries');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<OperationApprovalItem | null>(null);
  const [detailsData, setDetailsData] = useState<Delivery | Transfer | Disposal | Cancellation | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const pageTheme = useThemeStore((s) => s.getPageTheme('operation'));

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setIsLoading(true);
      const data = await operationApprovalsApi.getPending();
      setSummary(data);
      
      const firstNonEmptySection = 
        data.deliveries?.length > 0 ? 'deliveries' :
        data.transfers?.length > 0 ? 'transfers' :
        data.disposals?.length > 0 ? 'disposals' :
        data.cancellations?.length > 0 ? 'cancellations' :
        data.labelPrintRequests?.length > 0 ? 'labelPrintRequests' :
        data.stockBFs?.length > 0 ? 'stockBFs' :
        data.deliveryReturns?.length > 0 ? 'deliveryReturns' :
        'deliveries';
      
      setSelectedType(firstNonEmptySection as ApprovalType);
    } catch (error: any) {
      console.error('Failed to load pending approvals:', error);
      toast.error(error.response?.data?.message || 'Failed to load pending approvals');
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (item: OperationApprovalItem) => {
    // If clicking the same item, collapse it
    if (expandedItemId === item.id) {
      setExpandedItemId(null);
      setSelectedApproval(null);
      setDetailsData(null);
      return;
    }

    try {
      setIsLoadingDetails(true);
      setExpandedItemId(item.id);
      setSelectedApproval(item);
      setDetailsData(null); // Clear previous data
      
      let data;
      switch (item.approvalType) {
        case 'Delivery':
          data = await deliveriesApi.getById(item.id);
          break;
        case 'Transfer':
          data = await transfersApi.getById(item.id);
          break;
        case 'Disposal':
          data = await disposalsApi.getById(item.id);
          break;
        case 'Cancellation':
          data = await cancellationsApi.getById(item.id);
          break;
        default:
          toast.error('Details view not available for this approval type');
          setExpandedItemId(null);
          setSelectedApproval(null);
          return;
      }
      
      setDetailsData(data);
    } catch (error: any) {
      console.error('Failed to load details:', error);
      toast.error(error.response?.data?.message || 'Failed to load approval details');
      setExpandedItemId(null);
      setSelectedApproval(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleApprove = async (type: string, id: string) => {
    try {
      setSubmittingIds(prev => new Set(prev).add(id));
      
      switch (type) {
        case 'Delivery':
          await deliveriesApi.approve(id);
          break;
        case 'Transfer':
          await transfersApi.approve(id);
          break;
        case 'Disposal':
          await disposalsApi.approve(id);
          break;
        case 'Cancellation':
          await cancellationsApi.approve(id);
          break;
        case 'Label Print':
          await labelPrintingApi.approve(id);
          break;
        case 'Stock BF':
          await stockBfApi.approve(id);
          break;
        case 'Delivery Return':
          await deliveryReturnsApi.approve(id);
          break;
        default:
          throw new Error('Unknown approval type');
      }
      
      toast.success(`${type} approved successfully`);
      // Close expanded details
      setExpandedItemId(null);
      setSelectedApproval(null);
      setDetailsData(null);
      fetchPendingApprovals();
    } catch (error: any) {
      console.error('Failed to approve:', error);
      toast.error(error.response?.data?.message || `Failed to approve ${type.toLowerCase()}`);
    } finally {
      setSubmittingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const handleReject = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to reject this ${type.toLowerCase()}? This action cannot be undone.`)) {
      return;
    }

    try {
      setSubmittingIds(prev => new Set(prev).add(id));
      
      switch (type) {
        case 'Delivery':
          await deliveriesApi.reject(id);
          break;
        case 'Transfer':
          await transfersApi.reject(id);
          break;
        case 'Disposal':
          await disposalsApi.reject(id);
          break;
        case 'Cancellation':
          await cancellationsApi.reject(id);
          break;
        case 'Label Print':
          await labelPrintingApi.reject(id);
          break;
        case 'Stock BF':
          await stockBfApi.reject(id);
          break;
        case 'Delivery Return':
          await deliveryReturnsApi.reject(id);
          break;
        default:
          throw new Error('Unknown approval type');
      }
      
      toast.success(`${type} rejected`);
      // Close expanded details
      setExpandedItemId(null);
      setSelectedApproval(null);
      setDetailsData(null);
      fetchPendingApprovals();
    } catch (error: any) {
      console.error('Failed to reject:', error);
      toast.error(error.response?.data?.message || `Failed to reject ${type.toLowerCase()}`);
    } finally {
      setSubmittingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const primaryColor = pageTheme?.primaryColor || '#C8102E';

  const currentTypeOption = APPROVAL_TYPES.find(t => t.value === selectedType);
  const currentItems = summary ? (summary[currentTypeOption?.key || 'deliveries'] || []) : [];
  const currentTypeLabel = currentTypeOption?.label || 'Approval';
  const currentApprovalType = 
    selectedType === 'deliveries' ? 'Delivery' :
    selectedType === 'transfers' ? 'Transfer' :
    selectedType === 'disposals' ? 'Disposal' :
    selectedType === 'cancellations' ? 'Cancellation' :
    selectedType === 'labelPrintRequests' ? 'Label Print' :
    selectedType === 'stockBFs' ? 'Stock BF' :
    'Delivery Return';

  const columns = [
    {
      key: 'referenceNo',
      label: 'Reference No',
      render: (item: OperationApprovalItem) => {
        const isExpanded = expandedItemId === item.id;
        return (
          <button
            onClick={() => handleViewDetails(item)}
            className="font-mono font-semibold hover:underline cursor-pointer text-left flex items-center gap-2 px-2 py-1 rounded transition-all"
            style={{ 
              color: isExpanded ? '#dc2626' : primaryColor,
              fontWeight: isExpanded ? 'bold' : 'semibold',
              backgroundColor: isExpanded ? '#fee2e2' : 'transparent'
            }}
          >
            <span style={{ color: isExpanded ? '#dc2626' : 'transparent' }}>▼</span>
            {item.referenceNo}
          </button>
        );
      },
    },
    {
      key: 'requestDate',
      label: 'Date',
      render: (item: OperationApprovalItem) => (
        <span className="font-medium">{new Date(item.requestDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'outletName',
      label: 'Outlet / Details',
      render: (item: OperationApprovalItem) => (
        <div>
          <span className="font-medium">{item.outletName || '-'}</span>
          {item.description && (
            <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {item.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (item: OperationApprovalItem) => (
        <span className="font-semibold">{item.itemCount ?? '-'}</span>
      ),
    },
    {
      key: 'value',
      label: 'Value',
      render: (item: OperationApprovalItem) => (
        item.totalValue !== null && item.totalValue !== undefined ? (
          <span className="font-semibold">Rs. {item.totalValue.toLocaleString()}</span>
        ) : (
          <span>-</span>
        )
      ),
    },
    {
      key: 'requestedBy',
      label: 'Requested By',
      render: (item: OperationApprovalItem) => (
        <span className="text-sm">{item.requestedByName || '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: OperationApprovalItem) => {
        const isExpanded = expandedItemId === item.id;
        return (
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="sm">
              <Clock className="w-3 h-3 mr-1" />
              {item.status}
            </Badge>
            {isExpanded && (
              <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                ● Viewing
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <ProtectedPage 
      permission="operation:approvals:view"
      deniedMessage="You do not have permission to view operation approvals. Please contact your administrator."
    >
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            <Clock className="w-8 h-8 inline-block mr-3" style={{ color: primaryColor }} />
            Operation Approvals
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Review and manage pending operation approvals
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
          </div>
        ) : !summary || summary.totalPendingCount === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center">
                <CheckCircle className="w-16 h-16 mb-4" style={{ color: 'var(--muted-foreground)' }} />
                <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>No pending approvals</p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>All operations have been processed</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CardTitle>Pending Approvals</CardTitle>
                  <Badge variant="warning" size="md">
                    <Clock className="w-3 h-3 mr-1" />
                    {summary.totalPendingCount} Total
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                    Approval Type:
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as ApprovalType)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer min-w-[240px]"
                    style={{ 
                      border: `2px solid ${primaryColor}`,
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)'
                    }}
                  >
                    {APPROVAL_TYPES.map(type => {
                      const count = summary[type.key]?.length || 0;
                      return (
                        <option key={type.value} value={type.value}>
                          {type.label} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {currentItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="w-16 h-16 mb-4" style={{ color: 'var(--muted-foreground)' }} />
                  <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                    No pending {currentTypeLabel.toLowerCase()}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    All {currentTypeLabel.toLowerCase()} have been processed
                  </p>
                </div>
              ) : (
                <DataTable
                  data={currentItems}
                  columns={columns}
                  currentPage={1}
                  totalPages={1}
                  pageSize={currentItems.length}
                  onPageChange={() => {}}
                  onPageSizeChange={() => {}}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Inline Details View */}
        {expandedItemId && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedApproval ? `${selectedApproval.approvalType} Details - ${selectedApproval.referenceNo}` : 'Details'}
                </CardTitle>
                <button
                  onClick={() => {
                    setExpandedItemId(null);
                    setSelectedApproval(null);
                    setDetailsData(null);
                  }}
                  className="text-sm px-3 py-1 rounded hover:bg-gray-100"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Close
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
                </div>
              ) : detailsData && selectedApproval ? (
                <>
                  <div className="space-y-6">
                    {selectedApproval.approvalType === 'Delivery' && (
                      <DeliveryDetailsView delivery={detailsData as Delivery} primaryColor={primaryColor} />
                    )}
                    {selectedApproval.approvalType === 'Transfer' && (
                      <TransferDetailsView transfer={detailsData as Transfer} primaryColor={primaryColor} />
                    )}
                    {selectedApproval.approvalType === 'Disposal' && (
                      <DisposalDetailsView disposal={detailsData as Disposal} primaryColor={primaryColor} />
                    )}
                    {selectedApproval.approvalType === 'Cancellation' && (
                      <CancellationDetailsView cancellation={detailsData as Cancellation} primaryColor={primaryColor} />
                    )}
                  </div>
                  
                  {(() => {
                    const perms = APPROVAL_TYPE_PERMISSIONS[selectedApproval.approvalType];
                    const canApproveType = perms ? can(perms.approve) : false;
                    const canRejectType = perms ? can(perms.reject) : false;
                    
                    if (!canApproveType && !canRejectType) {
                      return (
                        <div className="flex items-center justify-center gap-3 pt-6 mt-6 border-t">
                          <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                            <XCircle className="w-5 h-5" style={{ color: '#b45309' }} />
                            <div>
                              <p className="text-sm font-semibold" style={{ color: '#b45309' }}>
                                You do not have permission to approve or reject this {selectedApproval.approvalType.toLowerCase()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                        {canRejectType && (
                          <Button
                            variant="danger"
                            onClick={() => {
                              handleReject(selectedApproval.approvalType, selectedApproval.id);
                              setExpandedItemId(null);
                              setSelectedApproval(null);
                              setDetailsData(null);
                            }}
                            disabled={submittingIds.has(selectedApproval.id)}
                          >
                            {submittingIds.has(selectedApproval.id) ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        )}
                        {canApproveType && (
                          <button
                            onClick={() => {
                              handleApprove(selectedApproval.approvalType, selectedApproval.id);
                              setExpandedItemId(null);
                              setSelectedApproval(null);
                              setDetailsData(null);
                            }}
                            disabled={submittingIds.has(selectedApproval.id)}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white hover:opacity-90"
                            style={{ backgroundColor: '#16a34a' }}
                          >
                            {submittingIds.has(selectedApproval.id) ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approve
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedPage>
  );
}

function DeliveryDetailsView({ delivery, primaryColor }: { delivery: Delivery; primaryColor: string }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery No</p>
          <p className="text-sm font-semibold" style={{ color: primaryColor }}>
            {delivery.deliveryNo}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery Date</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {new Date(delivery.deliveryDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
          <Badge variant="warning" size="sm">
            <Clock className="w-3 h-3 mr-1" />
            Pending Approval
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {delivery.outletName || delivery.outlet?.name || '-'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Requested By</p>
          <p className="text-sm" style={{ color: 'var(--foreground)' }}>
            {delivery.createdByName} • {new Date(delivery.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Items</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{delivery.totalItems || 0}</p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Value</p>
          <p className="text-2xl font-bold" style={{ color: primaryColor }}>
            Rs. {(delivery.totalValue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {delivery.notes && (
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
          <p className="text-sm p-3 rounded-lg" style={{ color: 'var(--foreground)', backgroundColor: 'var(--muted)' }}>
            {delivery.notes}
          </p>
        </div>
      )}

      {delivery.items && delivery.items.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Delivery Items</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Product</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {delivery.items.map((item: any, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {item.productName || item.product?.name || 'Unknown Product'}
                        </p>
                        {item.product?.code && (
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.product.code}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--foreground)' }}>
                      {Number(item.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right" style={{ color: 'var(--foreground)' }}>
                      Rs. {Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold" style={{ color: 'var(--foreground)' }}>
                      Rs. {Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t" style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--foreground)' }}>Total</td>
                  <td className="px-4 py-3 text-sm text-right font-bold" style={{ color: 'var(--foreground)' }}>
                    {delivery.totalItems || 0} items
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-right font-bold" style={{ color: primaryColor }}>
                    Rs. {(delivery.totalValue || 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function TransferDetailsView({ transfer, primaryColor }: { transfer: Transfer; primaryColor: string }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Transfer No</p>
          <p className="text-sm font-semibold" style={{ color: primaryColor }}>
            {transfer.transferNo}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Transfer Date</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {new Date(transfer.transferDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
          <Badge variant="warning" size="sm">
            <Clock className="w-3 h-3 mr-1" />
            Pending Approval
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>From Outlet</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {transfer.fromOutletName || transfer.fromOutlet?.name || '-'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>To Outlet</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {transfer.toOutletName || transfer.toOutlet?.name || '-'}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Requested By</p>
        <p className="text-sm" style={{ color: 'var(--foreground)' }}>
          {transfer.createdByName} • {new Date(transfer.createdAt).toLocaleString()}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Items</p>
        <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{transfer.totalItems || 0}</p>
      </div>

      {transfer.notes && (
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
          <p className="text-sm p-3 rounded-lg" style={{ color: 'var(--foreground)', backgroundColor: 'var(--muted)' }}>
            {transfer.notes}
          </p>
        </div>
      )}

      {transfer.items && transfer.items.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Transfer Items</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Product</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {transfer.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {item.productName || item.product?.name || 'Unknown Product'}
                        </p>
                        {item.product?.code && (
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.product.code}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--foreground)' }}>
                      {Number(item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function DisposalDetailsView({ disposal, primaryColor }: { disposal: Disposal; primaryColor: string }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Disposal No</p>
          <p className="text-sm font-semibold" style={{ color: primaryColor }}>
            {disposal.disposalNo}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Disposal Date</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {new Date(disposal.disposalDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
          <Badge variant="warning" size="sm">
            <Clock className="w-3 h-3 mr-1" />
            Pending Approval
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Outlet</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {disposal.outletName || disposal.outlet?.name || '-'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Requested By</p>
          <p className="text-sm" style={{ color: 'var(--foreground)' }}>
            {disposal.createdByName} • {new Date(disposal.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Items</p>
        <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{disposal.totalItems || 0}</p>
      </div>

      {disposal.notes && (
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
          <p className="text-sm p-3 rounded-lg" style={{ color: 'var(--foreground)', backgroundColor: 'var(--muted)' }}>
            {disposal.notes}
          </p>
        </div>
      )}

      {disposal.items && disposal.items.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Disposal Items</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Product</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {disposal.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {item.productName || item.product?.name || 'Unknown Product'}
                        </p>
                        {item.product?.code && (
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.product.code}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: 'var(--foreground)' }}>
                      {Number(item.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground)' }}>
                      {item.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function CancellationDetailsView({ cancellation, primaryColor }: { cancellation: Cancellation; primaryColor: string }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Cancellation No</p>
          <p className="text-sm font-semibold" style={{ color: primaryColor }}>
            {cancellation.cancellationNo}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Cancellation Date</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {new Date(cancellation.cancellationDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
          <Badge variant="warning" size="sm">
            <Clock className="w-3 h-3 mr-1" />
            Pending Approval
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery No</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {cancellation.deliveryNo}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Outlet</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {cancellation.outletName || cancellation.outlet?.name || '-'}
          </p>
        </div>
      </div>

      {cancellation.deliveredDate && (
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivered Date</p>
          <p className="text-sm" style={{ color: 'var(--foreground)' }}>
            {new Date(cancellation.deliveredDate).toLocaleDateString()}
          </p>
        </div>
      )}

      <div>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Requested By</p>
        <p className="text-sm" style={{ color: 'var(--foreground)' }}>
          {cancellation.createdByName} • {new Date(cancellation.createdAt).toLocaleString()}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reason</p>
        <p className="text-sm p-3 rounded-lg" style={{ color: 'var(--foreground)', backgroundColor: 'var(--muted)' }}>
          {cancellation.reason || '-'}
        </p>
      </div>
    </>
  );
}
