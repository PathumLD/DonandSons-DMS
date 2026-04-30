'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { InlineDetailPanel } from '@/components/ui/inline-detail-panel';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Zap, Plus, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { immediateOrdersApi, type ImmediateOrder } from '@/lib/api/immediate-orders';
import { toast } from 'sonner';

export default function ImmediateOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ImmediateOrder[]>([]);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [viewOrder, setViewOrder] = useState<ImmediateOrder | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectOrder, setRejectOrder] = useState<ImmediateOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadOrders();
  }, [currentPage, pageSize, statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await immediateOrdersApi.getAll(
        currentPage,
        pageSize,
        undefined,
        undefined,
        statusFilter || undefined
      );
      setOrders(response.immediateOrders as any);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load immediate orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    try {
      await immediateOrdersApi.approve(orderId);
      toast.success('Order approved successfully!');
      await loadOrders();
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error('Failed to approve order');
    }
  };

  const handleReject = async () => {
    if (!rejectOrder) return;
    
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setIsSubmitting(true);
      await immediateOrdersApi.reject(rejectOrder.id, rejectReason);
      
      toast.success('Order rejected successfully!');
      setShowRejectModal(false);
      setRejectOrder(null);
      setRejectReason('');
      await loadOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to reject order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="success" size="sm">Approved</Badge>;
      case 'Rejected': return <Badge variant="danger" size="sm">Rejected</Badge>;
      case 'Completed': return <Badge variant="success" size="sm">Completed</Badge>;
      default: return <Badge variant="warning" size="sm">Pending</Badge>;
    }
  };

  const columns = [
    { 
      key: 'orderDate', 
      label: 'Order Date', 
      render: (item: any) => <span className="font-medium">{new Date(item.orderDate).toLocaleDateString()}</span> 
    },
    { 
      key: 'outlet', 
      label: 'Outlet', 
      render: (item: any) => <span>{item.outletName}</span> 
    },
    { 
      key: 'product', 
      label: 'Product', 
      render: (item: any) => <span>{item.productName}</span> 
    },
    { 
      key: 'turn', 
      label: 'Turn', 
      render: (item: any) => <span>{item.deliveryTurnName}</span> 
    },
    { 
      key: 'quantity', 
      label: 'Quantity', 
      render: (item: any) => <span className="font-semibold">{item.quantity}</span> 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (item: any) => getStatusBadge(item.status) 
    },
    { 
      key: 'requestedAt', 
      label: 'Requested', 
      render: (item: any) => <span className="text-xs">{new Date(item.requestedAt).toLocaleString()}</span> 
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (item: any) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              if (viewOrder?.id === item.id) setViewOrder(null);
              else setViewOrder(item);
            }} 
            className="p-1.5 rounded transition-colors" 
            style={{ color: 'var(--muted-foreground)' }} 
            title={viewOrder?.id === item.id ? 'Hide details' : 'View details'}
          >
            {viewOrder?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          {item.status === 'Pending' && (
            <>
              <button 
                onClick={() => handleApprove(item.id)} 
                className="p-1.5 rounded transition-colors" 
                style={{ color: 'var(--success)' }} 
                title="Approve"
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setRejectOrder(item); setShowRejectModal(true); }} 
                className="p-1.5 rounded transition-colors" 
                style={{ color: 'var(--destructive)' }} 
                title="Reject"
              >
                <X className="w-4 h-4" />
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
          <p style={{ color: 'var(--muted-foreground)' }}>Loading immediate orders...</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Immediate Orders</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Quick order management for urgent requests ({totalCount} orders)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => router.push('/dms/immediate-orders/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Immediate Orders</CardTitle>
            <div className="flex items-center space-x-3">
              <Select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
                options={[
                  { value: '', label: 'All Status' }, 
                  { value: 'Pending', label: 'Pending' }, 
                  { value: 'Approved', label: 'Approved' }, 
                  { value: 'Rejected', label: 'Rejected' },
                  { value: 'Completed', label: 'Completed' }
                ]} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable 
            data={orders} 
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
        title="Order Details"
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        footer={
          <Button variant="ghost" onClick={() => setViewOrder(null)}>
            Close
          </Button>
        }
      >
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(viewOrder.status)}
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Order Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(viewOrder.orderDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Outlet</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{viewOrder.outletName}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{viewOrder.productName}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery Turn</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{viewOrder.deliveryTurnName}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Quantity</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{viewOrder.quantity}</p>
            </div>
            {viewOrder.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{viewOrder.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Requested By</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{viewOrder.requestedBy}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Requested At</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(viewOrder.requestedAt).toLocaleString()}</p>
            </div>
            {viewOrder.status === 'Rejected' && viewOrder.rejectionReason && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--destructive-bg)', border: '1px solid var(--destructive)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--destructive)' }}>Rejection Reason</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{viewOrder.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
      </InlineDetailPanel>

      <Modal isOpen={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectOrder(null); setRejectReason(''); }} title="Reject Order" size="md">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Please provide a reason for rejecting this order:
          </p>
          <Input 
            label="Rejection Reason" 
            value={rejectReason} 
            onChange={(e) => setRejectReason(e.target.value)} 
            placeholder="Enter rejection reason..." 
            fullWidth 
            required 
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowRejectModal(false); setRejectOrder(null); setRejectReason(''); }} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Reject Order
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
