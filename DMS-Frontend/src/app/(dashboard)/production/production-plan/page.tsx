'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Search, Edit, Eye, History, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockProductionPlans, type ProductionPlan } from '@/lib/mock-data/production';
import { mockProducts } from '@/lib/mock-data/products';
import { useAuthStore } from '@/lib/stores/auth-store';
import { isAdminUser, addDaysISO } from '@/lib/date-restrictions';

export default function ProductionPlanPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const [plans, setPlans] = useState<ProductionPlan[]>(mockProductionPlans);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);
  
  const [formData, setFormData] = useState({
    planDate: new Date().toISOString().split('T')[0],
    productId: '',
    plannedQty: '',
    priority: 'Medium' as ProductionPlan['priority'],
    notes: '',
  });

  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const matchesSearch = 
        p.planNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.editUser.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      
      // Admin sees all. Non-admin users see their own records.
      if (isAdmin) {
        return matchesSearch && matchesStatus;
      }
      
      // For non-admin users, filter by date range (3 days back if not showing previous records)
      const userFullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
      const matchesUser =
        user != null && (p.editUser === user.email || p.editUser === userFullName);
      if (!matchesUser) return false;
      
      if (!showPreviousRecords) {
        // Show only records from the last 3 days
        const threeDaysAgo = addDaysISO(-3);
        const matchesDate = p.planDate >= threeDaysAgo;
        return matchesSearch && matchesStatus && matchesDate;
      }
      
      return matchesSearch && matchesStatus;
    });
  }, [plans, searchTerm, statusFilter, isAdmin, user, showPreviousRecords]);

  const totalPages = Math.ceil(filteredPlans.length / pageSize);
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAdd = () => {
    const product = mockProducts.find(p => p.id === Number(formData.productId));
    const maxId = Math.max(...plans.map(p => p.id), 0);
    const newPlan: ProductionPlan = {
      id: maxId + 1,
      planNo: `PRJ${String(12662 + maxId).padStart(7, '0')}`,
      planDate: formData.planDate,
      productId: Number(formData.productId),
      productCode: product?.code || '',
      productName: product?.description || '',
      plannedQty: Number(formData.plannedQty),
      priority: formData.priority,
      status: 'Approved',
      notes: formData.notes,
      editUser: user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'Unknown',
      editDate: new Date().toLocaleString('en-US', { 
        month: 'numeric', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }),
      reference: '3:00 am',
      comment: '-',
      approvedBy: '-',
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

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this production plan?')) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  const columns = [
    {
      key: 'planDate',
      label: 'Plan Date',
      render: (item: ProductionPlan) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.planDate.split('-').reverse().join('/')}</span>
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
      key: 'status',
      label: 'Status',
      render: (item: ProductionPlan) => getStatusBadge(item.status),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: ProductionPlan) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.editUser}</span>
      ),
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: ProductionPlan) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.editDate}</span>
      ),
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (item: ProductionPlan) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.reference}</span>
      ),
    },
    {
      key: 'comment',
      label: 'Comment',
      render: (item: ProductionPlan) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.comment}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: ProductionPlan) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.approvedBy || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (item: ProductionPlan) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => { setSelectedPlan(item); setShowViewModal(true); }}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: '#DC2626', backgroundColor: '#FEF2F2' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
            History of Production Plan
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isAdmin && (
            <Button 
              variant="ghost" 
              size="md" 
              onClick={() => setShowPreviousRecords(!showPreviousRecords)}
            >
              <History className="w-4 h-4 mr-2" />
              Show Previous Records
            </Button>
          )}
          <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
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
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPlans.length)} of {filteredPlans.length} entries
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
                  { value: 'In Progress', label: 'In Progress' }, 
                  { value: 'Completed', label: 'Completed' }
                ]} 
              />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input 
                  type="text" 
                  placeholder="Search:" 
                  value={searchTerm} 
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" 
                  style={{ border: '1px solid var(--input)' }} 
                />
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

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedPlan(null); }} title="Production Plan Details" size="md">
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
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.planDate.split('-').reverse().join('/')}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Priority</p>
                {getPriorityBadge(selectedPlan.priority)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.productCode} - {selectedPlan.productName}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Planned Quantity</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedPlan.plannedQty}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit User</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.editUser}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.editDate}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reference</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.reference}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Comment</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.comment}</p>
            </div>
            {selectedPlan.approvedBy && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved/Rejected By</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.approvedBy}</p>
              </div>
            )}
            {selectedPlan.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.notes}</p>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedPlan(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
