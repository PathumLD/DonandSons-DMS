'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { InlineDetailPanel } from '@/components/ui/inline-detail-panel';
import { Plus, Search, Edit, Eye, EyeOff, History, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Select from '@/components/ui/select';
import { dailyProductionsApi, type DailyProduction } from '@/lib/api/daily-productions';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { isAdminUser } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';
import { ProtectedPage, PermissionButton } from '@/components/auth';

export default function DailyProductionPage() {
  return (
    <ProtectedPage permission="production:daily:view">
      <DailyProductionPageContent />
    </ProtectedPage>
  );
}

function DailyProductionPageContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('daily-production'));

  const [productions, setProductions] = useState<DailyProduction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProduction, setSelectedProduction] = useState<DailyProduction | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, statusFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await dailyProductionsApi.getAll(currentPage, pageSize, filters);
      setProductions(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error('Failed to load productions:', error);
      toast.error('Failed to load production data');
      setProductions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await dailyProductionsApi.approve(id);
      toast.success('Production approved successfully');
      fetchData();
    } catch (error: any) {
      console.error('Failed to approve production:', error);
      toast.error(error.response?.data?.message || 'Failed to approve production');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await dailyProductionsApi.reject(id);
      toast.success('Production rejected successfully');
      fetchData();
    } catch (error: any) {
      console.error('Failed to reject production:', error);
      toast.error(error.response?.data?.message || 'Failed to reject production');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this production?')) return;

    try {
      await dailyProductionsApi.delete(id);
      toast.success('Production deleted successfully');
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete production:', error);
      toast.error(error.response?.data?.message || 'Failed to delete production');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success" size="sm">Approved</Badge>;
      case 'Pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'Rejected':
        return <Badge variant="danger" size="sm">Rejected</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const filteredProductions = Array.isArray(productions) ? productions.filter(p => {
    const matchesSearch = searchTerm === '' || 
      p.productionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.createdByName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) : [];

  const columns = [
    {
      key: 'productionDate',
      label: 'Production Date',
      render: (item: DailyProduction) => (
        <span style={{ color: 'var(--muted-foreground)' }}>
          {new Date(item.productionDate).toLocaleDateString('en-GB')}
        </span>
      ),
    },
    {
      key: 'productionNo',
      label: 'Production No',
      render: (item: DailyProduction) => (
        <span className="font-semibold" style={{ color: pageTheme.secondaryColor }}>
          {item.productionNo}
        </span>
      ),
    },
    {
      key: 'product',
      label: 'Product',
      render: (item: DailyProduction) => (
        <span style={{ color: 'var(--foreground)' }}>
          {item.product?.code} - {item.product?.name}
        </span>
      ),
    },
    {
      key: 'shift',
      label: 'Shift',
      render: (item: DailyProduction) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.shift}</span>
      ),
    },
    {
      key: 'quantities',
      label: 'Planned / Produced',
      render: (item: DailyProduction) => (
        <span style={{ color: 'var(--foreground)' }}>
          {item.plannedQty} / {item.producedQty}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: DailyProduction) => getStatusBadge(item.status),
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (item: DailyProduction) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.createdByName || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (item: DailyProduction) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => {
              if (selectedProduction?.id === item.id) setSelectedProduction(null);
              else setSelectedProduction(item);
            }}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title={selectedProduction?.id === item.id ? 'Hide details' : 'View details'}
          >
            {selectedProduction?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          {item.status === 'Pending' && (
            <>
              <button
                onClick={() => router.push(`/production/daily-production/edit/${item.id}`)}
                className="p-1.5 rounded-full transition-colors"
                style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="p-1.5 rounded-full transition-colors"
                    style={{ color: '#10b981', backgroundColor: '#d1fae5' }}
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="p-1.5 rounded-full transition-colors"
                    style={{ color: '#ef4444', backgroundColor: '#fee2e2' }}
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Production</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            History of Production
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="md" onClick={() => router.push('/production/daily-production/add')}>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {isLoading ? 'Loading...' : `Showing ${totalCount} entries`}
              </span>
            </div>
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
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid var(--input)' }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <DataTable
              data={filteredProductions}
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
        title="Production Details"
        open={!!selectedProduction}
        onClose={() => setSelectedProduction(null)}
        footer={
          <Button variant="ghost" onClick={() => setSelectedProduction(null)}>
            Close
          </Button>
        }
      >
        {selectedProduction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Production No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduction.productionNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedProduction.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Production Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {new Date(selectedProduction.productionDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Shift</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedProduction.shift}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {selectedProduction.product?.code} - {selectedProduction.product?.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Planned Quantity</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduction.plannedQty}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Produced Quantity</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduction.producedQty}</p>
              </div>
            </div>
            {selectedProduction.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedProduction.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created By / Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {selectedProduction.createdByName} • {new Date(selectedProduction.createdAt).toLocaleString()}
              </p>
            </div>
            {selectedProduction.approvedBy && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved By / Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedProduction.approvedBy.fullName} • {selectedProduction.approvedDate ? new Date(selectedProduction.approvedDate).toLocaleString() : '-'}
                </p>
              </div>
            )}
          </div>
        )}
      </InlineDetailPanel>
    </div>
  );
}
