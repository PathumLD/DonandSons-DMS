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
import { disposalsApi, type Disposal } from '@/lib/api/disposals';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { isAdminUser, todayISO } from '@/lib/date-restrictions';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedPage } from '@/components/auth';
import toast from 'react-hot-toast';

export default function DisposalPage() {
  return (
    <ProtectedPage permission="operation:disposal:view">
      <DisposalPageContent />
    </ProtectedPage>
  );
}

function DisposalPageContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const { canAction } = usePermissions();
  const canCreate = canAction('/operation/disposal', 'create');
  const canEditDisposal = canAction('/operation/disposal', 'edit');
  const canApproveDisposal = canAction('/operation/disposal', 'approve');
  const canRejectDisposal = canAction('/operation/disposal', 'reject');
  const pageTheme = useThemeStore((s) => s.getPageTheme('disposal'));

  const [disposals, setDisposals] = useState<Disposal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDisposal, setSelectedDisposal] = useState<Disposal | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);

  useEffect(() => {
    fetchDisposals();
  }, [currentPage, pageSize, statusFilter]);

  const fetchDisposals = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await disposalsApi.getAll(currentPage, pageSize, filters);
      setDisposals(response.disposals || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load disposals');
      setDisposals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDisposals = useMemo(() => {
    const today = todayISO();
    return disposals.filter(d => {
      const matchesSearch = 
        d.disposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.outlet?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        isAdmin ||
        (d.createdById === user?.id && (showPreviousRecords || d.disposalDate === today));
      return matchesSearch && matchesRole;
    });
  }, [disposals, searchTerm, isAdmin, user, showPreviousRecords]);

  const paginatedDisposals = filteredDisposals;

  const handleSubmit = async (id: string) => {
    try {
      await disposalsApi.submit(id);
      toast.success('Disposal submitted for approval');
      fetchDisposals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit disposal');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await disposalsApi.approve(id);
      toast.success('Disposal approved successfully');
      fetchDisposals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve disposal');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await disposalsApi.reject(id);
      toast.success('Disposal rejected');
      fetchDisposals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject disposal');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'Rejected':
        return <Badge variant="danger" size="sm"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'Pending':
        return <Badge variant="warning" size="sm"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const columns = [
    {
      key: 'disposalDate',
      label: 'Disposal Date',
      render: (item: Disposal) => (
        <span className="font-medium">{new Date(item.disposalDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'disposalNo',
      label: 'Disposal No',
      render: (item: Disposal) => (
        <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#C8102E' }}>
          {item.disposalNo}
        </span>
      ),
    },
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: Disposal) => (
        <span className="font-medium">{item.outletName || item.outlet?.name || '-'}</span>
      ),
    },
    {
      key: 'totalItems',
      label: 'Items',
      render: (item: Disposal) => (
        <span className="font-semibold">{item.totalItems}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Disposal) => getStatusBadge(item.status),
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (item: Disposal) => (
        <span className="text-sm">{item.createdByName || '-'}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: Disposal) => (
        <span className="text-sm">{item.approvedByName || item.approvedBy?.fullName || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Disposal) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              try {
                if (selectedDisposal?.id === item.id) {
                  setSelectedDisposal(null);
                  return;
                }
                const fullDisposal = await disposalsApi.getById(item.id);
                setSelectedDisposal(fullDisposal);
              } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to load disposal details');
              }
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={selectedDisposal?.id === item.id ? 'Hide details' : 'View details'}
          >
            {selectedDisposal?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          {item.status === 'Draft' && canEditDisposal && (
            <>
              <button
                onClick={() => router.push(`/operation/disposal/edit/${item.id}`)}
                className="p-1.5 rounded transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSubmit(item.id)}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#3B82F6' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Submit for Approval"
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Disposal Management</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Track and manage product disposals ({filteredDisposals.length} records)
          </p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All records visible. Any date allowed.'
                : 'You see your own records for today only.'}
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
            <Button variant="primary" size="md" onClick={() => router.push('/operation/disposal/add')}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Disposal List</CardTitle>
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
                  { value: 'Rejected', label: 'Rejected' },
                ]}
              />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search disposals..."
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
              data={paginatedDisposals}
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
        title="Disposal Details"
        open={!!selectedDisposal}
        onClose={() => setSelectedDisposal(null)}
        contentClassName="max-w-[min(100%,56rem)]"
        footer={
          <Button variant="ghost" onClick={() => setSelectedDisposal(null)}>
            Close
          </Button>
        }
      >
        {selectedDisposal && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Disposal No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedDisposal.disposalNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedDisposal.status)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Disposal Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedDisposal.disposalDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedDisposal.outletName || selectedDisposal.outlet?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Items</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedDisposal.totalItems || 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created / Updated</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedDisposal.createdAt).toLocaleDateString()} • {new Date(selectedDisposal.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {selectedDisposal.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedDisposal.notes}</p>
              </div>
            )}
            
            {/* Disposal Items Table */}
            <div className="border-t pt-4">
              <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Disposal Items</h3>
              {selectedDisposal.items && selectedDisposal.items.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'var(--muted)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Quantity</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDisposal.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-3 text-sm">
                            {item.productCode || item.product?.code} - {item.productName || item.product?.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">{item.quantity.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">{item.reason || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t" style={{ backgroundColor: 'var(--muted)' }}>
                      <tr>
                        <td className="px-4 py-3 text-sm font-bold">Total</td>
                        <td className="px-4 py-3 text-sm text-right font-bold">
                          {selectedDisposal.items.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                          {selectedDisposal.items.length} items
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: 'var(--muted-foreground)' }}>
                  No items found
                </p>
              )}
            </div>
          </div>
        )}
      </InlineDetailPanel>
    </div>
  );
}
