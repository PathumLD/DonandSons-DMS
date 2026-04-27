'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Zap, Plus, Search, Eye, Check, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { immediateOrdersApi, type ImmediateOrder, type CreateImmediateOrderDto } from '@/lib/api/immediate-orders';
import { productsApi, type Product } from '@/lib/api/products';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { deliveryTurnsApi, type DeliveryTurn } from '@/lib/api/delivery-turns';
import { toast } from 'sonner';

export default function ImmediateOrdersPage() {
  const [orders, setOrders] = useState<ImmediateOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [deliveryTurns, setDeliveryTurns] = useState<DeliveryTurn[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ImmediateOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const [formData, setFormData] = useState<CreateImmediateOrderDto>({
    outletId: '',
    productId: '',
    deliveryTurnId: '',
    orderDate: new Date().toISOString().split('T')[0],
    quantity: 0,
    notes: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [currentPage, pageSize, statusFilter]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, outletsRes, turnsRes] = await Promise.all([
        productsApi.getAll(1, 100, undefined, undefined, true),
        outletsApi.getAll(1, 100, undefined, undefined, true),
        deliveryTurnsApi.getAll(1, 100, undefined, true),
      ]);

      setProducts(productsRes.products);
      setOutlets(outletsRes.outlets);
      setDeliveryTurns(turnsRes.deliveryTurns);

      if (outletsRes.outlets.length > 0) {
        setFormData(prev => ({ ...prev, outletId: outletsRes.outlets[0].id }));
      }
      if (turnsRes.deliveryTurns.length > 0) {
        setFormData(prev => ({ ...prev, deliveryTurnId: turnsRes.deliveryTurns[0].id }));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await immediateOrdersApi.getAll(
        currentPage,
        pageSize,
        undefined,
        undefined,
        statusFilter || undefined
      );
      setOrders(response.immediateOrders);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load immediate orders');
    }
  };

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      await immediateOrdersApi.create(formData);
      
      toast.success('Immediate order created successfully!');
      setShowAddModal(false);
      resetForm();
      await loadOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create immediate order');
    } finally {
      setIsSubmitting(false);
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
    if (!selectedOrder) return;
    
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setIsSubmitting(true);
      await immediateOrdersApi.reject(selectedOrder.id, rejectReason);
      
      toast.success('Order rejected successfully!');
      setShowRejectModal(false);
      setSelectedOrder(null);
      setRejectReason('');
      await loadOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to reject order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      outletId: outlets[0]?.id || '',
      productId: '',
      deliveryTurnId: deliveryTurns[0]?.id || '',
      orderDate: new Date().toISOString().split('T')[0],
      quantity: 0,
      notes: '',
    });
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
            onClick={() => { setSelectedOrder(item); setShowViewModal(true); }} 
            className="p-1.5 rounded transition-colors" 
            style={{ color: 'var(--muted-foreground)' }} 
            title="View"
          >
            <Eye className="w-4 h-4" />
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
                onClick={() => { setSelectedOrder(item); setShowRejectModal(true); }} 
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
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
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

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Immediate Order" size="md">
        <div className="space-y-4">
          <Input 
            label="Order Date" 
            type="date" 
            value={formData.orderDate} 
            onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })} 
            fullWidth 
            required 
          />
          
          <Select 
            label="Outlet" 
            value={formData.outletId} 
            onChange={(e) => setFormData({ ...formData, outletId: e.target.value })} 
            options={outlets.map(o => ({ value: o.id, label: o.name }))} 
            fullWidth 
            required 
          />
          
          <Select 
            label="Product" 
            value={formData.productId} 
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })} 
            options={products.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))} 
            placeholder="Select product" 
            fullWidth 
            required 
          />

          <Select 
            label="Delivery Turn" 
            value={formData.deliveryTurnId} 
            onChange={(e) => setFormData({ ...formData, deliveryTurnId: e.target.value })} 
            options={deliveryTurns.map(t => ({ value: t.id, label: t.name }))} 
            fullWidth 
            required 
          />
          
          <Input 
            label="Quantity" 
            type="number" 
            min="0" 
            value={formData.quantity.toString()} 
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} 
            placeholder="0" 
            fullWidth 
            required 
          />
          
          <Input 
            label="Notes" 
            value={formData.notes} 
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
            placeholder="Special instructions or notes..." 
            fullWidth 
          />
          
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-warn-box)', border: '1px solid var(--dms-warn-box-border)' }}>
            <div className="flex items-start space-x-2">
              <Zap className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-primary)' }} />
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--dms-notes-title)' }}>Immediate Order</p>
                <p className="text-sm" style={{ color: 'var(--dms-notes-fg)' }}>
                  This order requires approval before production. It will be produced immediately once approved.
                </p>
              </div>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdd} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Order
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedOrder(null); }} title="Order Details" size="md">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Order Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Outlet</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedOrder.outletName}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedOrder.productName}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery Turn</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedOrder.deliveryTurnName}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Quantity</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedOrder.quantity}</p>
            </div>
            {selectedOrder.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedOrder.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Requested By</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedOrder.requestedBy}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Requested At</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selectedOrder.requestedAt).toLocaleString()}</p>
            </div>
            {selectedOrder.status === 'Rejected' && selectedOrder.rejectionReason && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--destructive-bg)', border: '1px solid var(--destructive)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--destructive)' }}>Rejection Reason</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedOrder.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedOrder(null); }}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showRejectModal} onClose={() => { setShowRejectModal(false); setSelectedOrder(null); setRejectReason(''); }} title="Reject Order" size="md">
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
          <Button variant="ghost" onClick={() => { setShowRejectModal(false); setSelectedOrder(null); setRejectReason(''); }} disabled={isSubmitting}>
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
