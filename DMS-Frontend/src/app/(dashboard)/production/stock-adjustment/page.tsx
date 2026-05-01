'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { InlineDetailPanel } from '@/components/ui/inline-detail-panel';
import { Plus, Search, Edit, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Select from '@/components/ui/select';
import { stockAdjustmentsApi, type StockAdjustment } from '@/lib/api/stock-adjustments';
import ProtectedPage from '@/components/auth/ProtectedPage';
import PermissionButton from '@/components/auth/PermissionButton';
import WorkflowButtons from '@/components/auth/WorkflowButtons';
import toast from 'react-hot-toast';

export default function StockAdjustmentPage() {
  const router = useRouter();
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, statusFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await stockAdjustmentsApi.getAll(currentPage, pageSize, filters);
      setAdjustments(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error('Failed to load stock adjustments:', error);
      toast.error('Failed to load stock adjustments');
      setAdjustments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      setIsSubmitting(true);
      await stockAdjustmentsApi.submit(id);
      toast.success('Stock adjustment submitted for approval');
      fetchData();
    } catch (error: any) {
      console.error('Failed to submit stock adjustment:', error);
      toast.error(error.response?.data?.message || 'Failed to submit stock adjustment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stock adjustment?')) return;

    try {
      await stockAdjustmentsApi.delete(id);
      toast.success('Stock adjustment deleted successfully');
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete stock adjustment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete stock adjustment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="success" size="sm">Approved</Badge>;
      case 'Rejected': return <Badge variant="danger" size="sm">Rejected</Badge>;
      case 'Pending': return <Badge variant="warning" size="sm">Pending</Badge>;
      default: return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const filteredAdjustments = Array.isArray(adjustments) ? adjustments.filter(a => {
    const matchesSearch = searchTerm === '' || 
      a.adjustmentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.product?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.createdByName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) : [];

  const columns = [
    {
      key: 'adjustmentDate',
      label: 'Date',
      render: (item: StockAdjustment) => (
        <span style={{ color: 'var(--muted-foreground)' }}>
          {new Date(item.adjustmentDate).toLocaleDateString('en-GB')}
        </span>
      ),
    },
    {
      key: 'adjustmentNo',
      label: 'Adjustment No',
      render: (item: StockAdjustment) => (
        <span className="font-semibold" style={{ color: '#C8102E' }}>
          {item.adjustmentNo}
        </span>
      ),
    },
    {
      key: 'product',
      label: 'Product',
      render: (item: StockAdjustment) => (
        <span style={{ color: 'var(--foreground)' }}>
          {item.product?.code} - {item.product?.name}
        </span>
      ),
    },
    {
      key: 'adjustmentType',
      label: 'Type',
      render: (item: StockAdjustment) => (
        <Badge variant={item.adjustmentType === 'Increase' ? 'success' : 'danger'} size="sm">
          {item.adjustmentType}
        </Badge>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (item: StockAdjustment) => (
        <span style={{ color: 'var(--foreground)' }}>{item.quantity}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: StockAdjustment) => getStatusBadge(item.status),
    },
    {
      key: 'actions',
      label: '',
      render: (item: StockAdjustment) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => {
              if (selectedAdjustment?.id === item.id) setSelectedAdjustment(null);
              else setSelectedAdjustment(item);
            }}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title={selectedAdjustment?.id === item.id ? 'Hide details' : 'View details'}
          >
            {selectedAdjustment?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          {item.status === 'Draft' && (
            <PermissionButton
              permission="production:stock-adjustment:update"
              onClick={() => router.push(`/production/stock-adjustment/edit/${item.id}`)}
              variant="ghost"
              size="sm"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </PermissionButton>
          )}
          <WorkflowButtons
            module="production:stock-adjustment"
            status={item.status as any}
            onSubmit={() => handleSubmit(item.id)}
            isLoading={isSubmitting}
          />
        </div>
      ),
    },
  ];

  return (
    <ProtectedPage permission="production:stock-adjustment:view">
      <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Stock Adjustment</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage Production Stock Adjustments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionButton
            permission="production:stock-adjustment:create"
            variant="primary"
            size="md"
            onClick={() => router.push('/production/stock-adjustment/add')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </PermissionButton>
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
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
                options={[
                  { value: '', label: 'All Status' }, 
                  { value: 'Draft', label: 'Draft' }, 
                  { value: 'Pending', label: 'Pending' }, 
                  { value: 'Approved', label: 'Approved' }, 
                  { value: 'Rejected', label: 'Rejected' }
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
              data={filteredAdjustments}
              columns={columns}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          )}
        </CardContent>
      </Card>

      <InlineDetailPanel
        title="Stock Adjustment Details"
        open={!!selectedAdjustment}
        onClose={() => setSelectedAdjustment(null)}
        footer={
          <Button variant="ghost" onClick={() => setSelectedAdjustment(null)}>
            Close
          </Button>
        }
      >
        {selectedAdjustment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Adjustment No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedAdjustment.adjustmentNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedAdjustment.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Adjustment Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {new Date(selectedAdjustment.adjustmentDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Type</p>
                <Badge variant={selectedAdjustment.adjustmentType === 'Increase' ? 'success' : 'danger'} size="sm">
                  {selectedAdjustment.adjustmentType}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {selectedAdjustment.product?.code} - {selectedAdjustment.product?.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Quantity</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedAdjustment.quantity}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reason</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedAdjustment.reason}</p>
            </div>
            {selectedAdjustment.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedAdjustment.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created By / Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {selectedAdjustment.createdByName} • {new Date(selectedAdjustment.createdAt).toLocaleString()}
              </p>
            </div>
            {selectedAdjustment.approvedBy && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved By / Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedAdjustment.approvedBy.fullName} • {selectedAdjustment.approvedDate ? new Date(selectedAdjustment.approvedDate).toLocaleString() : '-'}
                </p>
              </div>
            )}
          </div>
        )}
      </InlineDetailPanel>
      </div>
    </ProtectedPage>
  );
}
