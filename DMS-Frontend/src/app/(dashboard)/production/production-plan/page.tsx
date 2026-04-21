'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Calendar, Plus, Search, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockProductionPlans, type ProductionPlan } from '@/lib/mock-data/production';
import { mockProducts } from '@/lib/mock-data/products';

export default function ProductionPlanPage() {
  const [plans, setPlans] = useState<ProductionPlan[]>(mockProductionPlans);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);
  
  const [formData, setFormData] = useState({
    planDate: new Date().toISOString().split('T')[0],
    productId: '',
    plannedQty: '',
    priority: 'Medium' as const,
    notes: '',
  });

  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const matchesSearch = 
        p.planNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [plans, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPlans.length / pageSize);
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAdd = () => {
    const product = mockProducts.find(p => p.id === Number(formData.productId));
    const newPlan: ProductionPlan = {
      id: Math.max(...plans.map(p => p.id)) + 1,
      planNo: `PLAN-2026-${String(plans.length + 1).padStart(3, '0')}`,
      planDate: formData.planDate,
      productId: Number(formData.productId),
      productCode: product?.code || '',
      productName: product?.description || '',
      plannedQty: Number(formData.plannedQty),
      priority: formData.priority,
      status: 'Draft',
      notes: formData.notes,
    };
    setPlans([newPlan, ...plans]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedPlan) {
      setPlans(plans.map(p =>
        p.id === selectedPlan.id
          ? { ...p, plannedQty: Number(formData.plannedQty), priority: formData.priority, notes: formData.notes }
          : p
      ));
      setShowEditModal(false);
      setSelectedPlan(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      planDate: new Date().toISOString().split('T')[0],
      productId: '',
      plannedQty: '',
      priority: 'Medium',
      notes: '',
    });
  };

  const openEditModal = (plan: ProductionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      planDate: plan.planDate,
      productId: String(plan.productId),
      plannedQty: String(plan.plannedQty),
      priority: plan.priority,
      notes: plan.notes || '',
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return <Badge variant="success" size="sm">Completed</Badge>;
      case 'In Progress': return <Badge variant="warning" size="sm">In Progress</Badge>;
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

  const columns = [
    { key: 'planDate', label: 'Plan Date', render: (item: ProductionPlan) => <span className="font-medium">{new Date(item.planDate).toLocaleDateString()}</span> },
    { key: 'planNo', label: 'Plan No', render: (item: ProductionPlan) => <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>{item.planNo}</span> },
    { key: 'productCode', label: 'Product Code' },
    { key: 'productName', label: 'Product Name' },
    { key: 'plannedQty', label: 'Planned Qty', render: (item: ProductionPlan) => <span className="font-semibold">{item.plannedQty}</span> },
    { key: 'priority', label: 'Priority', render: (item: ProductionPlan) => getPriorityBadge(item.priority) },
    { key: 'status', label: 'Status', render: (item: ProductionPlan) => getStatusBadge(item.status) },
    {
      key: 'actions', label: 'Actions', render: (item: ProductionPlan) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => { setSelectedPlan(item); setShowViewModal(true); }} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="View"><Eye className="w-4 h-4" /></button>
          {item.status === 'Draft' && <button onClick={() => openEditModal(item)} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Edit"><Edit className="w-4 h-4" /></button>}
        </div>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Production Plan</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Plan and schedule production activities ({filteredPlans.length} plans)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}><Plus className="w-4 h-4 mr-2" />Add Plan</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Production Plans</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Status' }, { value: 'Draft', label: 'Draft' }, { value: 'Approved', label: 'Approved' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Completed', label: 'Completed' }]} />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input type="text" placeholder="Search plans..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedPlans} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Production Plan" size="lg">
        <div className="space-y-4">
          <Input label="Plan Date" type="date" value={formData.planDate} onChange={(e) => setFormData({ ...formData, planDate: e.target.value })} fullWidth required />
          <Select label="Product" value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} options={mockProducts.filter(p => p.active).map(p => ({ value: p.id, label: `${p.code} - ${p.description}` }))} placeholder="Select product" fullWidth required />
          <Input label="Planned Quantity" type="number" value={formData.plannedQty} onChange={(e) => setFormData({ ...formData, plannedQty: e.target.value })} placeholder="0" fullWidth required />
          <Select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} options={[{ value: 'High', label: 'High Priority' }, { value: 'Medium', label: 'Medium Priority' }, { value: 'Low', label: 'Low Priority' }]} fullWidth required />
          <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes..." fullWidth />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Plan</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedPlan(null); resetForm(); }} title="Edit Production Plan" size="lg">
        <div className="space-y-4">
          <Input label="Planned Quantity" type="number" value={formData.plannedQty} onChange={(e) => setFormData({ ...formData, plannedQty: e.target.value })} fullWidth />
          <Select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} options={[{ value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }]} fullWidth />
          <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} fullWidth />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedPlan(null); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedPlan(null); }} title="Plan Details" size="md">
        {selectedPlan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Plan No</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedPlan.planNo}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</p>{getStatusBadge(selectedPlan.status)}</div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Product</p><p className="text-sm" style={{ color: '#111827' }}>{selectedPlan.productCode} - {selectedPlan.productName}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Planned Quantity</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedPlan.plannedQty}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Priority</p>{getPriorityBadge(selectedPlan.priority)}</div>
            </div>
            {selectedPlan.notes && <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Notes</p><p className="text-sm" style={{ color: '#111827' }}>{selectedPlan.notes}</p></div>}
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedPlan(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
