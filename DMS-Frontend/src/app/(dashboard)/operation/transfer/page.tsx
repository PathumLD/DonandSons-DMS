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
import { transfersApi, type Transfer } from '@/lib/api/transfers';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { isAdminUser, addDaysISO, getDateBounds } from '@/lib/date-restrictions';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedPage } from '@/components/auth';
import toast from 'react-hot-toast';

export default function TransferPage() {
  return (
    <ProtectedPage permission="operation:transfer:view">
      <TransferPageContent />
    </ProtectedPage>
  );
}

function TransferPageContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const { canAction } = usePermissions();
  const canCreate = canAction('/operation/transfer', 'create');
  const canEditTransfer = canAction('/operation/transfer', 'edit');
  const pageTheme = useThemeStore((s) => s.getPageTheme('transfer'));
  const dateBounds = getDateBounds('transfer', user as any, {
    allowBackDatePermission: 'operation:transfer:allow-back-date',
    allowFutureDatePermission: 'operation:transfer:allow-future-date',
  });

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, [currentPage, pageSize, statusFilter]);

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await transfersApi.getAll(currentPage, pageSize, filters);
      setTransfers(response.transfers || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load transfers');
      setTransfers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransfers = useMemo(() => {
    const minDate = dateBounds.min || addDaysISO(-3);
    return transfers.filter(t => {
      const matchesSearch = 
        t.transferNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.fromOutlet?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.toOutlet?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        isAdmin ||
        (t.createdById === user?.id && (showPreviousRecords || t.transferDate >= minDate));
      return matchesSearch && matchesRole;
    });
  }, [transfers, searchTerm, isAdmin, user, showPreviousRecords, dateBounds]);

  const paginatedTransfers = filteredTransfers;

  const handleSubmit = async (id: string) => {
    try {
      await transfersApi.submit(id);
      toast.success('Transfer submitted for approval');
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit transfer');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await transfersApi.approve(id);
      toast.success('Transfer approved successfully');
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve transfer');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await transfersApi.reject(id);
      toast.success('Transfer rejected');
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject transfer');
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
      key: 'transferDate',
      label: 'Transfer Date',
      render: (item: Transfer) => (
        <span className="font-medium">{new Date(item.transferDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'transferNo',
      label: 'Transfer No',
      render: (item: Transfer) => (
        <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#C8102E' }}>
          {item.transferNo}
        </span>
      ),
    },
    {
      key: 'fromShowroom',
      label: 'From Showroom',
      render: (item: Transfer) => (
        <span className="font-medium">{item.fromOutletName || item.fromOutlet?.name || '-'}</span>
      ),
    },
    {
      key: 'toShowroom',
      label: 'To Showroom',
      render: (item: Transfer) => (
        <span className="font-medium">{item.toOutletName || item.toOutlet?.name || '-'}</span>
      ),
    },
    {
      key: 'totalItems',
      label: 'Items',
      render: (item: Transfer) => (
        <span className="font-semibold">{item.totalItems}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Transfer) => getStatusBadge(item.status),
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (item: Transfer) => (
        <span className="text-sm">{item.createdByName || '-'}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: Transfer) => (
        <span className="text-sm">{item.approvedByName || item.approvedBy?.fullName || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Transfer) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              try {
                if (selectedTransfer?.id === item.id) {
                  setSelectedTransfer(null);
                  return;
                }
                const fullTransfer = await transfersApi.getById(item.id);
                setSelectedTransfer(fullTransfer);
              } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to load transfer details');
              }
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={selectedTransfer?.id === item.id ? 'Hide details' : 'View details'}
          >
            {selectedTransfer?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          {item.status === 'Draft' && canEditTransfer && (
            <>
              <button
                onClick={() => router.push(`/operation/transfer/edit/${item.id}`)}
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Stock Transfer</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Transfer products between showrooms ({filteredTransfers.length} transfers)
          </p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All records visible. Any date allowed.'
                : 'You see your own transfers. Back date up to 3 days, no future date.'}
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
            <Button variant="primary" size="md" onClick={() => router.push('/operation/transfer/add')}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Transfer List</CardTitle>
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
                  placeholder="Search transfers..."
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
              data={paginatedTransfers}
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
        title="Transfer Details"
        open={!!selectedTransfer}
        onClose={() => setSelectedTransfer(null)}
        contentClassName="max-w-[min(100%,56rem)]"
        footer={
          <Button variant="ghost" onClick={() => setSelectedTransfer(null)}>
            Close
          </Button>
        }
      >
        {selectedTransfer && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Transfer No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedTransfer.transferNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedTransfer.status)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Transfer Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedTransfer.transferDate).toLocaleDateString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>From Showroom</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedTransfer.fromOutletName || selectedTransfer.fromOutlet?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>To Showroom</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedTransfer.toOutletName || selectedTransfer.toOutlet?.name || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Items</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedTransfer.totalItems || 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created / Updated</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedTransfer.createdAt).toLocaleDateString()} • {new Date(selectedTransfer.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {selectedTransfer.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedTransfer.notes}</p>
              </div>
            )}
            
            {/* Transfer Items Table */}
            <div className="border-t pt-4">
              <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Transfer Items</h3>
              {selectedTransfer.items && selectedTransfer.items.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'var(--muted)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransfer.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-3 text-sm">
                            {item.productCode || item.product?.code} - {item.productName || item.product?.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">{item.quantity.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t" style={{ backgroundColor: 'var(--muted)' }}>
                      <tr>
                        <td className="px-4 py-3 text-sm font-bold">Total</td>
                        <td className="px-4 py-3 text-sm text-right font-bold">
                          {selectedTransfer.items.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-sm text-center text-muted-foreground">
                          {selectedTransfer.items.length} items
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
