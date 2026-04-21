'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Calendar, Plus, Search, Edit, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockShowrooms } from '@/lib/mock-data/showrooms';

interface DeliveryPlan {
  id: number;
  planDate: string;
  showroomId: number;
  showroom: string;
  route: string;
  estimatedTime: string;
  driver: string;
  vehicle: string;
  status: 'Draft' | 'Active' | 'Completed';
}

const mockDeliveryPlans: DeliveryPlan[] = [
  { id: 1, planDate: '2026-04-22', showroomId: 1, showroom: 'Dalmeny', route: 'Route A', estimatedTime: '08:00', driver: 'Kamal Silva', vehicle: 'CAA-1234', status: 'Active' },
  { id: 2, planDate: '2026-04-22', showroomId: 2, showroom: 'Ragama', route: 'Route B', estimatedTime: '09:00', driver: 'Nimal Perera', vehicle: 'CAB-5678', status: 'Active' },
  { id: 3, planDate: '2026-04-21', showroomId: 1, showroom: 'Dalmeny', route: 'Route A', estimatedTime: '08:00', driver: 'Kamal Silva', vehicle: 'CAA-1234', status: 'Completed' },
];

export default function DeliveryPlanPage() {
  const [plans, setPlans] = useState<DeliveryPlan[]>(mockDeliveryPlans);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DeliveryPlan | null>(null);
  
  const [formData, setFormData] = useState({
    planDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    showroomId: '',
    route: '',
    estimatedTime: '',
    driver: '',
    vehicle: '',
  });

  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const matchesSearch = 
        p.showroom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.driver.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [plans, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPlans.length / pageSize);
  const paginatedPlans = filteredPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAdd = () => {
    const showroom = mockShowrooms.find(s => s.id === Number(formData.showroomId));
    const newPlan: DeliveryPlan = {
      id: Math.max(...plans.map(p => p.id)) + 1,
      planDate: formData.planDate,
      showroomId: Number(formData.showroomId),
      showroom: showroom?.name || '',
      route: formData.route,
      estimatedTime: formData.estimatedTime,
      driver: formData.driver,
      vehicle: formData.vehicle,
      status: 'Draft',
    };
    setPlans([newPlan, ...plans]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedPlan) {
      setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, ...formData, showroomId: Number(formData.showroomId), showroom: mockShowrooms.find(s => s.id === Number(formData.showroomId))?.name || '' } : p));
      setShowEditModal(false);
      setSelectedPlan(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({ planDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], showroomId: '', route: '', estimatedTime: '', driver: '', vehicle: '' });
  };

  const openEditModal = (plan: DeliveryPlan) => {
    setSelectedPlan(plan);
    setFormData({
      planDate: plan.planDate,
      showroomId: String(plan.showroomId),
      route: plan.route,
      estimatedTime: plan.estimatedTime,
      driver: plan.driver,
      vehicle: plan.vehicle,
    });
    setShowEditModal(true);
  };

  const columns = [
    { key: 'planDate', label: 'Plan Date', render: (item: DeliveryPlan) => <span className="font-medium">{new Date(item.planDate).toLocaleDateString()}</span> },
    { key: 'showroom', label: 'Showroom', render: (item: DeliveryPlan) => <span className="font-medium">{item.showroom}</span> },
    { key: 'route', label: 'Route' },
    { key: 'estimatedTime', label: 'Time' },
    { key: 'driver', label: 'Driver' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'status', label: 'Status', render: (item: DeliveryPlan) => {
      switch (item.status) {
        case 'Completed': return <Badge variant="success" size="sm">Completed</Badge>;
        case 'Active': return <Badge variant="primary" size="sm">Active</Badge>;
        default: return <Badge variant="neutral" size="sm">Draft</Badge>;
      }
    }},
    { key: 'actions', label: 'Actions', render: (item: DeliveryPlan) => (
      <div className="flex items-center space-x-2">
        {item.status === 'Draft' && <button onClick={() => openEditModal(item)} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Edit"><Edit className="w-4 h-4" /></button>}
        <button onClick={() => console.log('Copy plan:', item)} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Copy"><Copy className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Delivery Plan</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Plan and schedule daily deliveries ({filteredPlans.length} plans)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}><Plus className="w-4 h-4 mr-2" />Add Plan</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Delivery Plans</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Status' }, { value: 'Draft', label: 'Draft' }, { value: 'Active', label: 'Active' }, { value: 'Completed', label: 'Completed' }]} />
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

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Delivery Plan" size="lg">
        <div className="space-y-4">
          <Input label="Plan Date" type="date" value={formData.planDate} onChange={(e) => setFormData({ ...formData, planDate: e.target.value })} fullWidth required />
          <Select label="Showroom" value={formData.showroomId} onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })} options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} placeholder="Select showroom" fullWidth required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Route" value={formData.route} onChange={(e) => setFormData({ ...formData, route: e.target.value })} placeholder="Route A" fullWidth required />
            <Input label="Estimated Time" type="time" value={formData.estimatedTime} onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })} fullWidth required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Driver Name" value={formData.driver} onChange={(e) => setFormData({ ...formData, driver: e.target.value })} placeholder="Driver name" fullWidth required />
            <Input label="Vehicle No" value={formData.vehicle} onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })} placeholder="CAA-1234" fullWidth required />
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Plan</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedPlan(null); resetForm(); }} title="Edit Delivery Plan" size="lg">
        <div className="space-y-4">
          <Select label="Showroom" value={formData.showroomId} onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })} options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} fullWidth />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Route" value={formData.route} onChange={(e) => setFormData({ ...formData, route: e.target.value })} fullWidth />
            <Input label="Estimated Time" type="time" value={formData.estimatedTime} onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })} fullWidth />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Driver" value={formData.driver} onChange={(e) => setFormData({ ...formData, driver: e.target.value })} fullWidth />
            <Input label="Vehicle" value={formData.vehicle} onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })} fullWidth />
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedPlan(null); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
