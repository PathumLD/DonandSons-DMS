'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { InlineDetailPanel } from '@/components/ui/inline-detail-panel';
import Select from '@/components/ui/select';
import { Calendar, Plus, Eye, EyeOff, Edit, Loader2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { deliveryPlansApi, type DeliveryPlan } from '@/lib/api/delivery-plans';
import { toast } from 'sonner';

export default function DeliveryPlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<DeliveryPlan[]>([]);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedPlan, setSelectedPlan] = useState<DeliveryPlan | null>(null);

  useEffect(() => {
    loadPlans();
  }, [currentPage, pageSize, statusFilter]);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const response = await deliveryPlansApi.getAll(
        currentPage,
        pageSize,
        undefined,
        undefined,
        statusFilter || undefined
      );
      setPlans(response.deliveryPlans as any);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load delivery plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPlan = async (planId: string) => {
    try {
      await deliveryPlansApi.submit(planId);
      toast.success('Plan submitted successfully!');
      await loadPlans();
    } catch (error) {
      console.error('Error submitting plan:', error);
      toast.error('Failed to submit plan');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered': return <Badge variant="success" size="sm">Delivered</Badge>;
      case 'Completed': return <Badge variant="success" size="sm">Completed</Badge>;
      case 'InProduction': return <Badge variant="warning" size="sm">In Production</Badge>;
      case 'Draft': return <Badge variant="neutral" size="sm">Draft</Badge>;
      default: return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const getDayTypeBadge = (dayTypeName: string) => {
    const colors: { [key: string]: string } = {
      'Weekday': '#3B82F6',
      'Saturday': '#F59E0B',
      'Sunday': '#10B981',
      'Holiday': '#DC2626',
    };
    const color = colors[dayTypeName] || '#6B7280';
    return <span className="inline-flex items-center font-medium rounded-full px-2.5 py-1 text-xs text-white" style={{ backgroundColor: color }}>{dayTypeName}</span>;
  };

  const columns = [
    { 
      key: 'planDate', 
      label: 'Plan Date', 
      render: (item: any) => <span className="font-medium">{new Date(item.planDate).toLocaleDateString()}</span> 
    },
    { 
      key: 'planNo', 
      label: 'Plan No', 
      render: (item: any) => <span className="font-mono font-semibold" style={{ color: 'var(--brand-primary)' }}>{item.planNo}</span> 
    },
    { 
      key: 'dayType', 
      label: 'Day Type', 
      render: (item: any) => getDayTypeBadge(item.dayTypeName) 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (item: any) => getStatusBadge(item.status) 
    },
    { 
      key: 'totalItems', 
      label: 'Items', 
      render: (item: any) => <span className="font-medium">{item.totalItems || 0}</span> 
    },
    { 
      key: 'totalQuantity', 
      label: 'Total Qty', 
      render: (item: any) => <span className="font-medium">{item.totalQuantity || 0}</span> 
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (item: any) => (
        <div className="flex items-center space-x-2">
          <button 
            type="button" 
            onClick={() => {
              if (selectedPlan?.id === item.id) setSelectedPlan(null);
              else setSelectedPlan(item);
            }} 
            className="p-1.5 rounded transition-colors" 
            style={{ color: 'var(--muted-foreground)' }} 
            title={selectedPlan?.id === item.id ? 'Hide details' : 'View details'}
          >
            {selectedPlan?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          {item.status === 'Draft' && (
            <>
              <button 
                type="button" 
                onClick={() => router.push(`/dms/delivery-plan/edit/${item.id}`)} 
                className="p-1.5 rounded transition-colors" 
                style={{ color: 'var(--muted-foreground)' }} 
                title="Edit Items"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={() => handleSubmitPlan(item.id)} 
                className="p-1.5 rounded transition-colors" 
                style={{ color: 'var(--success)' }} 
                title="Submit"
              >
                <Check className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-primary)' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>Loading delivery plans...</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Delivery Plan Creation</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Create and manage delivery plans with auto-loaded defaults ({totalCount} plans)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => router.push('/dms/delivery-plan/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Delivery Plans</CardTitle>
            <div className="flex items-center space-x-3">
              <Select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
                options={[
                  { value: '', label: 'All Status' }, 
                  { value: 'Draft', label: 'Draft' }, 
                  { value: 'InProduction', label: 'In Production' }, 
                  { value: 'Completed', label: 'Completed' }, 
                  { value: 'Delivered', label: 'Delivered' }
                ]} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable 
            data={plans} 
            columns={columns} 
            currentPage={currentPage} 
            totalPages={totalPages} 
            pageSize={pageSize} 
            onPageChange={setCurrentPage} 
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} 
          />
        </CardContent>
      </Card>

      <InlineDetailPanel
        title="Delivery Plan Details"
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
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Plan Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selectedPlan.planDate).toLocaleDateString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Day Type</p>
                {getDayTypeBadge(selectedPlan.dayTypeName)}
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Freezer Stock</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedPlan.useFreezerStock ? 'Yes' : 'No'}</p>
              </div>
            </div>
            {selectedPlan.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selectedPlan.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </InlineDetailPanel>
    </div>
  );
}
