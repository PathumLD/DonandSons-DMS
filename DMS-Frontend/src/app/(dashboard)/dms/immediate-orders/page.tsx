'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, Plus, Search, Eye, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockImmediateOrders, mockOrderProducts, mockDeliveryPlans, type ImmediateOrder } from '@/lib/mock-data/dms-orders';

export default function ImmediateOrdersPage() {
  const [orders, setOrders] = useState<ImmediateOrder[]>(mockImmediateOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ImmediateOrder | null>(null);
  
  const [formData, setFormData] = useState({
    orderDate: new Date().toISOString().split('T')[0],
    productId: '',
    qtyFull: '',
    qtyMini: '',
    isCustomized: false,
    customizationNotes: '',
    deliveryPlanId: '',
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAdd = () => {
    const product = mockOrderProducts.find(p => p.id === Number(formData.productId));
    if (!product) return;
    
    const newOrder: ImmediateOrder = {
      id: Math.max(...orders.map(o => o.id)) + 1,
      orderNo: `IO-2026-${String(orders.length + 1).padStart(3, '0')}`,
      orderDate: formData.orderDate,
      productId: Number(formData.productId),
      productCode: product.code,
      productName: product.name,
      qtyFull: Number(formData.qtyFull),
      qtyMini: Number(formData.qtyMini),
      isCustomized: formData.isCustomized,
      customizationNotes: formData.customizationNotes || undefined,
      status: 'Pending',
      requestedBy: 'cashier1',
      deliveryPlanId: formData.deliveryPlanId ? Number(formData.deliveryPlanId) : undefined,
    };
    setOrders([newOrder, ...orders]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      orderDate: new Date().toISOString().split('T')[0],
      productId: '',
      qtyFull: '',
      qtyMini: '',
      isCustomized: false,
      customizationNotes: '',
      deliveryPlanId: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed': return <Badge variant="success" size="sm">Confirmed</Badge>;
      case 'Cancelled': return <Badge variant="danger" size="sm">Cancelled</Badge>;
      default: return <Badge variant="warning" size="sm">Pending</Badge>;
    }
  };

  const columns = [
    { key: 'orderDate', label: 'Order Date', render: (item: ImmediateOrder) => <span className="font-medium">{new Date(item.orderDate).toLocaleDateString()}</span> },
    { key: 'orderNo', label: 'Order No', render: (item: ImmediateOrder) => <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>{item.orderNo}</span> },
    { key: 'product', label: 'Product', render: (item: ImmediateOrder) => <span>{item.productCode} - {item.productName}</span> },
    { key: 'qtyFull', label: 'Qty Full', render: (item: ImmediateOrder) => <span className="font-semibold">{item.qtyFull}</span> },
    { key: 'qtyMini', label: 'Qty Mini', render: (item: ImmediateOrder) => <span className="font-semibold">{item.qtyMini}</span> },
    { key: 'isCustomized', label: 'Customized', render: (item: ImmediateOrder) => item.isCustomized ? <Badge variant="warning" size="sm">★ Custom</Badge> : <span className="text-xs" style={{ color: '#9CA3AF' }}>Standard</span> },
    { key: 'status', label: 'Status', render: (item: ImmediateOrder) => getStatusBadge(item.status) },
    { key: 'actions', label: 'Actions', render: (item: ImmediateOrder) => (
      <div className="flex items-center space-x-2">
        <button onClick={() => { setSelectedOrder(item); setShowViewModal(true); }} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="View"><Eye className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Immediate Orders</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Quick order management for urgent requests ({filteredOrders.length} orders)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}><Plus className="w-4 h-4 mr-2" />Add Order</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Immediate Orders</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Status' }, { value: 'Pending', label: 'Pending' }, { value: 'Confirmed', label: 'Confirmed' }, { value: 'Cancelled', label: 'Cancelled' }]} />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedOrders} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Immediate Order" size="lg">
        <div className="space-y-4">
          <Input label="Order Date" type="date" value={formData.orderDate} onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })} fullWidth required />
          
          <Select label="Product" value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} options={mockOrderProducts.filter(p => p.isIncluded).map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))} placeholder="Select product" fullWidth required />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity Full" type="number" min="0" value={formData.qtyFull} onChange={(e) => setFormData({ ...formData, qtyFull: e.target.value })} placeholder="0" fullWidth required />
            <Input label="Quantity Mini" type="number" min="0" value={formData.qtyMini} onChange={(e) => setFormData({ ...formData, qtyMini: e.target.value })} placeholder="0" fullWidth />
          </div>
          
          <Checkbox checked={formData.isCustomized} onChange={(checked) => setFormData({ ...formData, isCustomized: checked })} label="Is Customized Order" />
          
          {formData.isCustomized && (
            <Input label="Customization Notes" value={formData.customizationNotes} onChange={(e) => setFormData({ ...formData, customizationNotes: e.target.value })} placeholder="Special instructions or customizations..." fullWidth multiline />
          )}
          
          <Select label="Link to Delivery Plan (Optional)" value={formData.deliveryPlanId} onChange={(e) => setFormData({ ...formData, deliveryPlanId: e.target.value })} options={[{ value: '', label: 'Standalone Order' }, ...mockDeliveryPlans.filter(p => p.status !== 'Delivered').map(p => ({ value: p.id, label: `${p.planNo} - ${p.dayType} ${p.deliveryTurn}` }))]} fullWidth />
          
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEF3C4', border: '1px solid #FFD100' }}>
            <div className="flex items-start space-x-2">
              <Zap className="w-5 h-5 mt-0.5" style={{ color: '#C8102E' }} />
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#78350F' }}>Immediate Order</p>
                <p className="text-sm" style={{ color: '#92400E' }}>
                  Quantities from this order will be included in the Grand Total and will be produced immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Order</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedOrder(null); }} title="Order Details" size="md">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Order No</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedOrder.orderNo}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</p>{getStatusBadge(selectedOrder.status)}</div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Product</p><p className="text-sm" style={{ color: '#111827' }}>{selectedOrder.productCode} - {selectedOrder.productName}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Quantity Full</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedOrder.qtyFull}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Quantity Mini</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedOrder.qtyMini}</p></div>
            </div>
            {selectedOrder.isCustomized && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFBEB' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#78350F' }}>★ Customization Notes</p>
                <p className="text-sm" style={{ color: '#92400E' }}>{selectedOrder.customizationNotes}</p>
              </div>
            )}
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Requested By</p><p className="text-sm" style={{ color: '#111827' }}>{selectedOrder.requestedBy}</p></div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedOrder(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
