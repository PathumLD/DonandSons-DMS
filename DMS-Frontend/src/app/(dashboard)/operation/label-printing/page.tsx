'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { InlineDetailPanel } from '@/components/ui/inline-detail-panel';
import { Printer, CheckCircle, XCircle, Clock, Plus, Search, Loader2, Sun, Eye, EyeOff, Edit } from 'lucide-react';
import { labelPrintingApi, type LabelPrintRequest } from '@/lib/api/label-printing';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { todayISO, isAdminUser } from '@/lib/date-restrictions';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedPage } from '@/components/auth';
import toast from 'react-hot-toast';

export default function LabelPrintingPage() {
  return (
    <ProtectedPage permission="operation:label-printing:view">
      <LabelPrintingPageContent />
    </ProtectedPage>
  );
}

function LabelPrintingPageContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const { canAction } = usePermissions();
  const canCreate = canAction('/operation/label-printing', 'create');
  const canEditLabel = canAction('/operation/label-printing', 'edit');
  const canPrintLabel = canAction('/operation/label-printing', 'print');
  const pageTheme = useThemeStore((s) => s.getPageTheme('label-printing'));

  const [labelRequests, setLabelRequests] = useState<LabelPrintRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LabelPrintRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [currentPage, pageSize]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await labelPrintingApi.getAll(currentPage, pageSize);
      setLabelRequests(response.labelPrintRequests || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load label print requests');
      setLabelRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    const today = todayISO();
    return labelRequests.filter(req => {
      const matchesSearch =
        req.displayNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.productCode || req.product?.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.productName || req.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        isAdmin ||
        (req.createdById === user?.id && (showPreviousRecords || req.date >= today));
      return matchesSearch && matchesRole;
    });
  }, [labelRequests, searchTerm, isAdmin, user, showPreviousRecords]);

  const paginatedRequests = filteredRequests;

  const handleApprove = async (id: string) => {
    try {
      await labelPrintingApi.approve(id);
      toast.success('Label print request approved');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await labelPrintingApi.reject(id);
      toast.success('Label print request rejected');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    }
  };

  const handlePrint = async (id: string) => {
    try {
      await labelPrintingApi.generatePrintData(id);
      toast.success('Print data generated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate print data');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'Rejected':
        return <Badge variant="danger" size="sm"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="warning" size="sm"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const formatApproverCell = (item: LabelPrintRequest) => {
    if (item.status === 'Approved' && item.approvedByName) {
      const date = item.approvedDate
        ? new Date(item.approvedDate).toLocaleDateString()
        : '';
      return (
        <span className="text-sm">
          {item.approvedByName} {date && `- ${date}`}
        </span>
      );
    }
    if (item.status === 'Rejected' && item.rejectedByName) {
      const date = item.rejectedDate
        ? new Date(item.rejectedDate).toLocaleDateString()
        : '';
      return (
        <span className="text-sm">
          {item.rejectedByName} {date && `- ${date}`}
        </span>
      );
    }
    return <span className="text-sm">-</span>;
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (item: LabelPrintRequest) => (
        <span className="font-medium">{new Date(item.date).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'displayNo',
      label: 'Display No',
      render: (item: LabelPrintRequest) => (
        <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#C8102E' }}>
          {item.displayNo}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: LabelPrintRequest) => getStatusBadge(item.status),
    },
    {
      key: 'product',
      label: 'Product',
      render: (item: LabelPrintRequest) => (
        <div>
          <span className="font-medium">{item.productCode || item.product?.code} - {item.productName || item.product?.name || '-'}</span>
          {item.product?.allowFutureLabelPrint && (
            <Sun className="inline w-3 h-3 ml-1" style={{ color: '#F59E0B' }} title="Future label print allowed" />
          )}
        </div>
      ),
    },
    {
      key: 'labelCount',
      label: 'Label Count',
      render: (item: LabelPrintRequest) => (
        <span className="font-semibold">{item.labelCount}</span>
      ),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: LabelPrintRequest) => (
        <span className="text-sm">{item.updatedByName || '-'}</span>
      ),
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: LabelPrintRequest) => (
        <span className="text-sm">{new Date(item.updatedAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: LabelPrintRequest) => formatApproverCell(item),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: LabelPrintRequest) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              try {
                const detail = await labelPrintingApi.getById(item.id);
                const data = detail.data || detail;
                if (selectedRequest?.id === item.id) {
                  setSelectedRequest(null);
                  return;
                }
                setSelectedRequest(data);
              } catch (error) {
                toast.error('Failed to load label print request details');
              }
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={selectedRequest?.id === item.id ? 'Hide details' : 'View details'}
          >
            {selectedRequest?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          {item.status === 'Pending' && canEditLabel && (
            <>
              <button
                onClick={() => router.push(`/operation/label-printing/edit/${item.id}`)}
                className="p-1.5 rounded transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
            </>
          )}
          {item.status === 'Approved' && canPrintLabel && (
            <button
              onClick={() => handlePrint(item.id)}
              className="p-1.5 rounded transition-colors"
              style={{ color: 'var(--primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Print Labels"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Label Printing</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage product label printing requests ({filteredRequests.length} requests)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {!isAdmin && (
            <Button
              variant={showPreviousRecords ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setShowPreviousRecords(!showPreviousRecords)}
            >
              {showPreviousRecords ? 'Hide Previous Records' : 'Show Previous Records'}
            </Button>
          )}
          {canCreate && (
            <Button variant="primary" size="md" onClick={() => router.push('/operation/label-printing/add')}>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Label Print Requests</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid var(--input)' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            </div>
          ) : (
            <DataTable
              data={paginatedRequests}
              columns={columns}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>

      <InlineDetailPanel
        title="Label Print Request Details"
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        footer={
          <Button variant="ghost" onClick={() => setSelectedRequest(null)}>
            Close
          </Button>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Request No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedRequest.displayNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedRequest.status)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedRequest.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {selectedRequest.productCode || selectedRequest.product?.code} - {selectedRequest.productName || selectedRequest.product?.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Label Count</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedRequest.labelCount}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Start Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedRequest.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Expiry Days</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedRequest.expiryDays}</p>
            </div>
            {selectedRequest.priceOverride && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Price Override</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedRequest.priceOverride}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created / Updated</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedRequest.createdAt).toLocaleDateString()} • {new Date(selectedRequest.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {(selectedRequest.approvedByName || selectedRequest.rejectedByName) && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved/Rejected By</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedRequest.status === 'Approved' && selectedRequest.approvedByName && 
                    `${selectedRequest.approvedByName} • ${selectedRequest.approvedDate ? new Date(selectedRequest.approvedDate).toLocaleDateString() : ''}`
                  }
                  {selectedRequest.status === 'Rejected' && selectedRequest.rejectedByName && 
                    `${selectedRequest.rejectedByName} • ${selectedRequest.rejectedDate ? new Date(selectedRequest.rejectedDate).toLocaleDateString() : ''}`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </InlineDetailPanel>
    </div>
  );
}
