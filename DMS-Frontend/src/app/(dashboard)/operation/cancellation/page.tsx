'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { InlineDetailPanel } from '@/components/ui/inline-detail-panel';
import { Plus, Search, Eye, EyeOff, Edit, Info, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Select from '@/components/ui/select';
import { cancellationsApi, type Cancellation } from '@/lib/api/cancellations';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO, addDaysISO } from '@/lib/date-restrictions';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedPage } from '@/components/auth';
import toast from 'react-hot-toast';

export default function CancellationPage() {
  return (
    <ProtectedPage permission="operation:cancellation:view">
      <CancellationPageContent />
    </ProtectedPage>
  );
}

function CancellationPageContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const { canAction } = usePermissions();
  const canCreate = canAction('/operation/cancellation', 'create');
  const canEditCancellation = canAction('/operation/cancellation', 'edit');
  const pageTheme = useThemeStore((s) => s.getPageTheme('cancellation'));

  const [cancellations, setCancellations] = useState<Cancellation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCancellation, setSelectedCancellation] = useState<Cancellation | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);

  useEffect(() => {
    fetchCancellations();
  }, [currentPage, pageSize, statusFilter]);

  const fetchCancellations = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await cancellationsApi.getAll(currentPage, pageSize, filters);
      setCancellations(response.cancellations || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load cancellations');
      setCancellations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCancellations = useMemo(() => {
    const minDate = addDaysISO(-3);
    return cancellations.filter(c => {
      const matchesSearch =
        c.cancellationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.outletName || c.outlet?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        isAdmin ||
        (c.createdById === user?.id && (showPreviousRecords || c.cancellationDate >= minDate));
      return matchesSearch && matchesRole;
    });
  }, [cancellations, searchTerm, isAdmin, user, showPreviousRecords]);

  const paginatedCancellations = filteredCancellations;

  const handleApprove = async (id: string) => {
    try {
      await cancellationsApi.approve(id);
      toast.success('Cancellation approved successfully');
      fetchCancellations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve cancellation');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await cancellationsApi.reject(id);
      toast.success('Cancellation rejected');
      fetchCancellations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject cancellation');
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

  const formatApproverCell = (item: Cancellation) => {
    if (item.status === 'Approved' && item.approvedByName) {
      const date = item.approvedDate ? new Date(item.approvedDate).toLocaleDateString() : '';
      return (
        <span className="text-sm">
          {item.approvedByName} {date && `- ${date}`}
        </span>
      );
    }
    if (item.status === 'Rejected' && item.rejectedByName) {
      const date = item.rejectedDate ? new Date(item.rejectedDate).toLocaleDateString() : '';
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
      key: 'cancellationDate',
      label: 'Cancellation Date',
      render: (item: Cancellation) => (
        <span className="font-medium">{new Date(item.cancellationDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'cancellationNo',
      label: 'Cancellation No',
      render: (item: Cancellation) => (
        <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#C8102E' }}>
          {item.cancellationNo}
        </span>
      ),
    },
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: Cancellation) => (
        <span className="font-medium">{item.outletName || item.outlet?.name || '-'}</span>
      ),
    },
    {
      key: 'deliveredDate',
      label: 'Delivered Date',
      render: (item: Cancellation) => (
        <span className="text-sm">{item.deliveredDate ? new Date(item.deliveredDate).toLocaleDateString() : '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Cancellation) => getStatusBadge(item.status),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: Cancellation) => (
        <span className="text-sm">{item.updatedByName || '-'}</span>
      ),
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: Cancellation) => (
        <span className="text-sm">{new Date(item.updatedAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: Cancellation) => formatApproverCell(item),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Cancellation) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              try {
                const detail = await cancellationsApi.getById(item.id);
                const data = detail.data || detail;
                if (selectedCancellation?.id === item.id) {
                  setSelectedCancellation(null);
                  return;
                }
                setSelectedCancellation(data);
              } catch (error) {
                toast.error('Failed to load cancellation details');
              }
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={selectedCancellation?.id === item.id ? 'Hide details' : 'View details'}
          >
            {selectedCancellation?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          {item.status === 'Pending' && canEditCancellation && (
            <button
              onClick={() => router.push(`/operation/cancellation/edit/${item.id}`)}
              className="p-1.5 rounded transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Delivery Cancellation</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage delivery cancellation requests ({filteredCancellations.length} cancellations)
          </p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All records visible. Any date allowed.'
                : 'You see your own cancellations. Back date up to 3 days.'}
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
            <Button variant="primary" size="md" onClick={() => router.push('/operation/cancellation/add')}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Cancellation List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Rejected', label: 'Rejected' },
                ]}
              />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search cancellations..."
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
              data={paginatedCancellations}
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
        title="Cancellation Details"
        open={!!selectedCancellation}
        onClose={() => setSelectedCancellation(null)}
        footer={
          <Button variant="ghost" onClick={() => setSelectedCancellation(null)}>
            Close
          </Button>
        }
      >
        {selectedCancellation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Cancellation No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCancellation.cancellationNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedCancellation.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Cancellation Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {new Date(selectedCancellation.cancellationDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivered Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedCancellation.deliveredDate ? new Date(selectedCancellation.deliveredDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery No</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCancellation.deliveryNo}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCancellation.outletName || selectedCancellation.outlet?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reason</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancellation.reason}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created / Updated</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedCancellation.createdAt).toLocaleDateString()} • {new Date(selectedCancellation.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {(selectedCancellation.approvedByName || selectedCancellation.rejectedByName) && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved/Rejected By</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedCancellation.status === 'Approved' && selectedCancellation.approvedByName && 
                    `${selectedCancellation.approvedByName} • ${selectedCancellation.approvedDate ? new Date(selectedCancellation.approvedDate).toLocaleDateString() : ''}`
                  }
                  {selectedCancellation.status === 'Rejected' && selectedCancellation.rejectedByName && 
                    `${selectedCancellation.rejectedByName} • ${selectedCancellation.rejectedDate ? new Date(selectedCancellation.rejectedDate).toLocaleDateString() : ''}`
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
