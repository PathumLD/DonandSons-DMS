'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { InlineDetailPanel } from '@/components/ui/inline-detail-panel';
import { Plus, Search, Edit, Eye, EyeOff, CheckCircle, XCircle, Clock, Info, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Select from '@/components/ui/select';
import { deliveryReturnsApi, type DeliveryReturn } from '@/lib/api/delivery-returns';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { isAdminUser, todayISO } from '@/lib/date-restrictions';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedPage } from '@/components/auth';
import toast from 'react-hot-toast';

export default function DeliveryReturnPage() {
  return (
    <ProtectedPage permission="operation:delivery-return:view">
      <DeliveryReturnPageContent />
    </ProtectedPage>
  );
}

function DeliveryReturnPageContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const { canAction } = usePermissions();
  const canCreate = canAction('/operation/delivery-return', 'create');
  const canEditReturn = canAction('/operation/delivery-return', 'edit');
  const pageTheme = useThemeStore((s) => s.getPageTheme('delivery-return'));

  const [returns, setReturns] = useState<DeliveryReturn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<DeliveryReturn | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, [currentPage, pageSize, statusFilter]);

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await deliveryReturnsApi.getAll(currentPage, pageSize, filters);
      setReturns(response.deliveryReturns || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load delivery returns');
      setReturns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReturns = useMemo(() => {
    const today = todayISO();
    return returns.filter(r => {
      const matchesSearch = 
        r.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.outletName || r.outlet?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        isAdmin ||
        (r.createdById === user?.id && (showPreviousRecords || r.returnDate === today));
      return matchesSearch && matchesRole;
    });
  }, [returns, searchTerm, isAdmin, user, showPreviousRecords]);

  const paginatedReturns = filteredReturns;

  const handleSubmit = async (id: string) => {
    try {
      await deliveryReturnsApi.submit(id);
      toast.success('Delivery return submitted for approval');
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit delivery return');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await deliveryReturnsApi.approve(id);
      toast.success('Delivery return approved successfully');
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve delivery return');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await deliveryReturnsApi.reject(id);
      toast.success('Delivery return rejected');
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject delivery return');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Processed':
        return <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'Pending':
        return <Badge variant="warning" size="sm"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const formatApproverCell = (item: DeliveryReturn) => {
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
    return <span className="text-sm">-</span>;
  };

  const columns = [
    {
      key: 'returnDate',
      label: 'Return Date',
      render: (item: DeliveryReturn) => (
        <span className="font-medium">{new Date(item.returnDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'returnNo',
      label: 'Return No',
      render: (item: DeliveryReturn) => (
        <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#C8102E' }}>
          {item.returnNo}
        </span>
      ),
    },
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: DeliveryReturn) => (
        <span className="font-medium">{item.outletName || item.outlet?.name || '-'}</span>
      ),
    },
    {
      key: 'deliveredDate',
      label: 'Delivered Date',
      render: (item: DeliveryReturn) => (
        <span className="text-sm">{item.deliveredDate ? new Date(item.deliveredDate).toLocaleDateString() : '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: DeliveryReturn) => getStatusBadge(item.status),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: DeliveryReturn) => (
        <span className="text-sm">{item.updatedByName || '-'}</span>
      ),
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: DeliveryReturn) => (
        <span className="text-sm">{new Date(item.updatedAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: DeliveryReturn) => formatApproverCell(item),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: DeliveryReturn) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              try {
                const detail = await deliveryReturnsApi.getById(item.id);
                const data = detail.data || detail;
                if (selectedReturn?.id === item.id) {
                  setSelectedReturn(null);
                  return;
                }
                setSelectedReturn(data);
              } catch (error) {
                toast.error('Failed to load delivery return details');
              }
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            title={selectedReturn?.id === item.id ? 'Hide details' : 'View details'}
          >
            {selectedReturn?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          {item.status === 'Draft' && canEditReturn && (
            <>
              <button
                onClick={() => router.push(`/operation/delivery-return/edit/${item.id}`)}
                className="p-1.5 rounded transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSubmit(item.id)}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#3B82F6' }}
                title="Submit"
              >
                <Clock className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Delivery Returns</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage product returns from deliveries ({filteredReturns.length} returns)
          </p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All records visible. Any date allowed.'
                : 'You see your own returns for today only.'}
            </Badge>
          </div>
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
            <Button variant="primary" size="md" onClick={() => router.push('/operation/delivery-return/add')}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Delivery Return List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Processed', label: 'Processed' },
                ]}
              />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search returns..."
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            </div>
          ) : (
            <DataTable
              data={paginatedReturns}
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
        title="Delivery Return Details"
        open={!!selectedReturn}
        onClose={() => setSelectedReturn(null)}
        footer={
          <Button variant="ghost" onClick={() => setSelectedReturn(null)}>
            Close
          </Button>
        }
      >
        {selectedReturn && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Return No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedReturn.returnNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedReturn.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Return Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {new Date(selectedReturn.returnDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivered Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedReturn.deliveredDate ? new Date(selectedReturn.deliveredDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery No</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedReturn.deliveryNo}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedReturn.outletName || selectedReturn.outlet?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Items</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedReturn.totalItems}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reason</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedReturn.reason}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created / Updated</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedReturn.createdAt).toLocaleDateString()} • {new Date(selectedReturn.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {selectedReturn.approvedByName && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved By</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedReturn.approvedByName} • {selectedReturn.approvedDate ? new Date(selectedReturn.approvedDate).toLocaleDateString() : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </InlineDetailPanel>
    </div>
  );
}
