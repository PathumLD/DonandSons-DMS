'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Calendar, Plus, Search, Eye, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockDeliveryPlans, type DeliveryPlan, getDefaultQuantitiesForDayType } from '@/lib/mock-data/dms-orders';

export default function DeliveryPlanPage() {
  const [plans, setPlans] = useState<DeliveryPlan[]>(mockDeliveryPlans);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DeliveryPlan | null>(null);
  
  const [formData, setFormData] = useState({
    planDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dayType: 'Weekday' as const,
    deliveryTurn: '5:00 AM' as const,
  });

  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const matchesSearch = 
        p.planNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dayType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [plans, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPlans.length / pageSize);
  const paginatedPlans = filteredPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAdd = () => {
    const newPlan: DeliveryPlan = {
      id: Math.max(...plans.map(p => p.id)) + 1,
      planNo: `DP-2026-${String(plans.length + 1).padStart(3, '0')}`,
      planDate: formData.planDate,
      dayType: formData.dayType,
      deliveryTurn: formData.deliveryTurn,
      status: 'Draft',
      createdBy: 'admin',
      createdAt: new Date().toLocaleString(),
    };
    setPlans([newPlan, ...plans]);
    setShowAddModal(false);
    resetForm();
    
    // In real app, would auto-load default quantities here
    alert(`Plan created! Default quantities for ${formData.dayType} have been auto-loaded.`);
  };

  const resetForm = () => {
    setFormData({
      planDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      dayType: 'Weekday',
      deliveryTurn: '5:00 AM',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered': return <Badge variant="success" size="sm">Delivered</Badge>;
      case 'InProduction': return <Badge variant="warning" size="sm">In Production</Badge>;
      case 'Confirmed': return <Badge variant="primary" size="sm">Confirmed</Badge>;
      default: return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const getDayTypeBadge = (dayType: string) => {
    const colors: { [key: string]: string } = {
      'Weekday': '#3B82F6',
      'Saturday': '#F59E0B',
      'Sunday': '#10B981',
      'Holiday': '#DC2626',
      'Special Event': '#8B5CF6',
    };
    return <span className="inline-flex items-center font-medium rounded-full px-2.5 py-1 text-xs text-white" style={{ backgroundColor: colors[dayType] || '#6B7280' }}>{dayType}</span>;
  };

  const columns = [
    { key: 'planDate', label: 'Plan Date', render: (item: DeliveryPlan) => <span className="font-medium">{new Date(item.planDate).toLocaleDateString()}</span> },
    { key: 'planNo', label: 'Plan No', render: (item: DeliveryPlan) => <span className="font-mono font-semibold" style={{ color: 'var(--brand-primary)' }}>{item.planNo}</span> },
    { key: 'dayType', label: 'Day Type', render: (item: DeliveryPlan) => getDayTypeBadge(item.dayType) },
    { key: 'deliveryTurn', label: 'Delivery Turn', render: (item: DeliveryPlan) => <span className="font-medium">{item.deliveryTurn}</span> },
    { key: 'status', label: 'Status', render: (item: DeliveryPlan) => getStatusBadge(item.status) },
    { key: 'createdBy', label: 'Created By' },
    { key: 'actions', label: 'Actions', render: (item: DeliveryPlan) => (
      <div className="flex items-center space-x-2">
        <button type="button" onClick={() => { setSelectedPlan(item); setShowViewModal(true); }} className="p-1.5 rounded transition-colors" style={{ color: 'var(--muted-foreground)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="View"><Eye className="w-4 h-4" /></button>
        {item.status === 'Draft' && <button type="button" className="p-1.5 rounded transition-colors" style={{ color: 'var(--muted-foreground)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Edit"><Edit className="w-4 h-4" /></button>}
      </div>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Delivery Plan Creation</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Create and manage delivery plans with auto-loaded defaults ({filteredPlans.length} plans)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}><Plus className="w-4 h-4 mr-2" />Create Plan</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Delivery Plans</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Status' }, { value: 'Draft', label: 'Draft' }, { value: 'Confirmed', label: 'Confirmed' }, { value: 'InProduction', label: 'In Production' }, { value: 'Delivered', label: 'Delivered' }]} />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input type="text" placeholder="Search plans..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--input)' }} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedPlans} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Delivery Plan" size="md">
        <div className="space-y-4">
          <Input label="Plan Date" type="date" value={formData.planDate} onChange={(e) => setFormData({ ...formData, planDate: e.target.value })} helperText="Future dates only (max 3 days ahead)" fullWidth required />
          
          <Select label="Day Type" value={formData.dayType} onChange={(e) => setFormData({ ...formData, dayType: e.target.value as any })} options={[{ value: 'Weekday', label: 'Weekday (Mon-Fri)' }, { value: 'Saturday', label: 'Saturday' }, { value: 'Sunday', label: 'Sunday' }, { value: 'Holiday', label: 'Holiday / Special Event' }, { value: 'Special Event', label: 'Special Event' }]} helperText="Determines which default quantities will be auto-loaded" fullWidth required />
          
          <Select label="Delivery Turn" value={formData.deliveryTurn} onChange={(e) => setFormData({ ...formData, deliveryTurn: e.target.value as any })} options={[{ value: '5:00 AM', label: '5:00 AM (First Turn)' }, { value: '10:30 AM', label: '10:30 AM (Second Turn)' }, { value: '3:30 PM', label: '3:30 PM (Third Turn)' }]} fullWidth required />
          
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-notes)', border: '1px solid var(--dms-notes-border)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--dms-notes-title)' }}>Auto-Load Information</p>
            <p className="text-sm" style={{ color: 'var(--dms-notes-fg)' }}>
              Default outlet quantities for <strong>{formData.dayType}</strong> will be automatically loaded when you create this plan. You can modify quantities after creation.
            </p>
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Create Plan</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedPlan(null); }} title="Delivery Plan Details" size="md">
        {selectedPlan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Plan No</p><p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedPlan.planNo}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>{getStatusBadge(selectedPlan.status)}</div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Plan Date</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selectedPlan.planDate).toLocaleDateString()}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Day Type</p>{getDayTypeBadge(selectedPlan.dayType)}</div>
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Delivery Turn</p><p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedPlan.deliveryTurn}</p></div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created By</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.createdBy} • {selectedPlan.createdAt}</p></div>
            
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Workflow Status</p>
              <div className="flex items-center space-x-2">
                {['Draft', 'Confirmed', 'InProduction', 'Delivered'].map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div
                      className="px-3 py-1 rounded text-xs font-medium"
                      style={
                        selectedPlan.status === s
                          ? { backgroundColor: 'var(--dms-success-callout)', color: 'var(--dms-green-fg)' }
                          : { backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }
                      }
                    >
                      {s}
                    </div>
                    {i < 3 && <div className="w-6 h-px mx-1" style={{ backgroundColor: 'var(--border)' }}></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedPlan(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
