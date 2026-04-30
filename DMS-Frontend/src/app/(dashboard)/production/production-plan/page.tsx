'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { InlineDetailPanel } from '@/components/ui/inline-detail-panel';
import { Plus, Search, Edit, Eye, EyeOff, Check, Play, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Select from '@/components/ui/select';
import { productionPlansApi, type ProductionPlan } from '@/lib/api/production-plans';
import { useAuthStore } from '@/lib/stores/auth-store';
import { isAdminUser } from '@/lib/date-restrictions';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedPage } from '@/components/auth';
import toast from 'react-hot-toast';

export default function ProductionPlanPage() {
  return (
    <ProtectedPage permission="production:plan:view">
      <ProductionPlanPageContent />
    </ProtectedPage>
  );
}

function ProductionPlanPageContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const { canAction } = usePermissions();
  const canCreate = canAction('/production/production-plan', 'create');
  const canEditPlan = canAction('/production/production-plan', 'edit');
  const canApprovePlan = canAction('/production/production-plan', 'approve');

  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, statusFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      
      const response = await productionPlansApi.getAll(currentPage, pageSize, filters);
      setPlans(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error('Failed to load production plans:', error);
      toast.error('Failed to load production plans');
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await productionPlansApi.approve(id);
      toast.success('Production plan approved successfully');
      fetchData();
    } catch (error: any) {
      console.error('Failed to approve production plan:', error);
      toast.error(error.response?.data?.message || 'Failed to approve production plan');
    }
  };

  const handleStart = async (id: string) => {
    try {
      await productionPlansApi.start(id);
      toast.success('Production plan started successfully');
      fetchData();
    } catch (error: any) {
      console.error('Failed to start production plan:', error);
      toast.error(error.response?.data?.message || 'Failed to start production plan');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await productionPlansApi.complete(id);
      toast.success('Production plan completed successfully');
      fetchData();
    } catch (error: any) {
      console.error('Failed to complete production plan:', error);
      toast.error(error.response?.data?.message || 'Failed to complete production plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this production plan?')) return;

    try {
      await productionPlansApi.delete(id);
      toast.success('Production plan deleted successfully');
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete production plan:', error);
      toast.error(error.response?.data?.message || 'Failed to delete production plan');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return <Badge variant="success" size="sm">Completed</Badge>;
      case 'InProgress': return <Badge variant="warning" size="sm">In Progress</Badge>;
      case 'Approved': return <Badge variant="success" size="sm">Approved</Badge>;
      default: return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High': return <Badge variant="danger" size="sm">High</Badge>;
      case 'Low': return <Badge variant="neutral" size="sm">Low</Badge>;
      default: return <Badge variant="warning" size="sm">Medium</Badge>;
    }
  };

  const filteredPlans = Array.isArray(plans) ? plans.filter(p => {
    const matchesSearch = searchTerm === '' || 
      p.planNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.createdByName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) : [];

  const columns = [
    {
      key: 'planDate',
      label: 'Plan Date',
      render: (item: ProductionPlan) => (
        <span style={{ color: 'var(--muted-foreground)' }}>
          {new Date(item.planDate).toLocaleDateString('en-GB')}
        </span>
      ),
    },
    {
      key: 'planNo',
      label: 'Plan No',
      render: (item: ProductionPlan) => (
        <span className="font-semibold" style={{ color: '#C8102E' }}>
          {item.planNo}
        </span>
      ),
    },
    {
      key: 'product',
      label: 'Product',
      render: (item: ProductionPlan) => (
        <span style={{ color: 'var(--foreground)' }}>
          {item.product?.code} - {item.product?.name}
        </span>
      ),
    },
    {
      key: 'plannedQty',
      label: 'Planned Qty',
      render: (item: ProductionPlan) => (
        <span style={{ color: 'var(--foreground)' }}>{item.plannedQty}</span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (item: ProductionPlan) => getPriorityBadge(item.priority),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: ProductionPlan) => getStatusBadge(item.status),
    },
    {
      key: 'actions',
      label: '',
      render: (item: ProductionPlan) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => {
              if (selectedPlan?.id === item.id) setSelectedPlan(null);
              else setSelectedPlan(item);
            }}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title={selectedPlan?.id === item.id ? 'Hide details' : 'View details'}
          >
            {selectedPlan?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          {(item.status === 'Draft' || item.status === 'Approved') && canEditPlan && (
            <button
              onClick={() => router.push(`/production/production-plan/edit/${item.id}`)}
              className="p-1.5 rounded-full transition-colors"
              style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {item.status === 'Draft' && canApprovePlan && (
            <button
              onClick={() => handleApprove(item.id)}
              className="p-1.5 rounded-full transition-colors"
              style={{ color: '#10b981', backgroundColor: '#d1fae5' }}
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {item.status === 'Approved' && (
            <button
              onClick={() => handleStart(item.id)}
              className="p-1.5 rounded-full transition-colors"
              style={{ color: '#3b82f6', backgroundColor: '#dbeafe' }}
              title="Start Production"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          {item.status === 'InProgress' && (
            <button
              onClick={() => handleComplete(item.id)}
              className="p-1.5 rounded-full transition-colors"
              style={{ color: '#10b981', backgroundColor: '#d1fae5' }}
              title="Complete"
            >
              <CheckCircle className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Production Plan</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage Production Planning
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canCreate && (
            <Button variant="primary" size="md" onClick={() => router.push('/production/production-plan/add')}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
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
                  { value: 'Approved', label: 'Approved' }, 
                  { value: 'InProgress', label: 'In Progress' }, 
                  { value: 'Completed', label: 'Completed' }
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
              data={filteredPlans}
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
        title="Production Plan Details"
        open={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        footer={
          <Button variant="ghost" onClick={() => setSelectedPlan(null)}>
            Close
          </Button>
        }
      >
        {selectedPlan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Plan No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedPlan.planNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedPlan.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Plan Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {new Date(selectedPlan.planDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Priority</p>
                {getPriorityBadge(selectedPlan.priority)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {selectedPlan.product?.code} - {selectedPlan.product?.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Planned Quantity</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedPlan.plannedQty}</p>
            </div>
            {selectedPlan.reference && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reference</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.reference}</p>
              </div>
            )}
            {selectedPlan.comment && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Comment</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.comment}</p>
              </div>
            )}
            {selectedPlan.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created By / Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {selectedPlan.createdByName} • {new Date(selectedPlan.createdAt).toLocaleString()}
              </p>
            </div>
            {selectedPlan.approvedBy && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved By / Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {selectedPlan.approvedBy.fullName} • {selectedPlan.approvedDate ? new Date(selectedPlan.approvedDate).toLocaleString() : '-'}
                </p>
              </div>
            )}
          </div>
        )}
      </InlineDetailPanel>
    </div>
  );
}
