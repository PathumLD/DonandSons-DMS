'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Search, Eye, Edit, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO, addDaysISO } from '@/lib/date-restrictions';

interface ProductionCancel {
  id: number;
  cancelNo: string;
  cancelDate: string;
  productionNo: string;
  productCode: string;
  productName: string;
  plannedQty: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  editUser: string;
  editDate: string;
  approvedBy?: string;
}

const mockProductionCancels: ProductionCancel[] = [
  { id: 1, cancelNo: 'PRO0000019', cancelDate: '2026-01-06', productionNo: 'PRD-2026-015', productCode: 'BU15', productName: 'Chicken Bun', plannedQty: 200, reason: 'Ingredient shortage', status: 'Approved', editUser: 'Hilary', editDate: '1/10/2026 11:48 AM', approvedBy: '-' },
  { id: 2, cancelNo: 'PRO0000018', cancelDate: '2026-01-08', productionNo: 'PRD-2026-018', productCode: 'PZ8', productName: 'Chicken Pizza Large', plannedQty: 30, reason: 'Equipment malfunction', status: 'Approved', editUser: 'Hilary', editDate: '1/10/2026 11:38 27 AM', approvedBy: '-' },
  { id: 3, cancelNo: 'PRO0000017', cancelDate: '2026-01-07', productionNo: 'PRD-2026-017', productCode: 'BR2', productName: 'Sandwich Bread', plannedQty: 150, reason: 'Quality issue', status: 'Approved', editUser: 'Dulan', editDate: '1/8/2026 10:21:11 AM', approvedBy: '-' },
  { id: 4, cancelNo: 'PRO0000016', cancelDate: '2026-01-07', productionNo: 'PRD-2026-016', productCode: 'BU12', productName: 'Fish Bun', plannedQty: 100, reason: 'Machine breakdown', status: 'Approved', editUser: 'Dulan', editDate: '1/8/2026 10:32 31 AM', approvedBy: '-' },
  { id: 5, cancelNo: 'PRO0000015', cancelDate: '2026-01-06', productionNo: 'PRD-2026-014', productCode: 'BR9', productName: 'Kurakkan Slice', plannedQty: 80, reason: 'Ingredient shortage', status: 'Approved', editUser: 'Dulan', editDate: '1/7/2026 11:14 18 AM', approvedBy: '-' },
  { id: 6, cancelNo: 'PRO0000014', cancelDate: '2026-01-06', productionNo: 'PRD-2026-013', productCode: 'CK1', productName: 'Chocolate Cake', plannedQty: 50, reason: 'Power outage', status: 'Approved', editUser: 'Dulan', editDate: '1/7/2026 11:19 30 AM', approvedBy: '-' },
  { id: 7, cancelNo: 'PRO0000013', cancelDate: '2026-01-05', productionNo: 'PRD-2026-012', productCode: 'PZ5', productName: 'Vegetable Pizza', plannedQty: 60, reason: 'Staff shortage', status: 'Approved', editUser: 'Dulan', editDate: '1/6/2026 10:53 57 AM', approvedBy: '-' },
  { id: 8, cancelNo: 'PRO0000012', cancelDate: '2026-01-05', productionNo: 'PRD-2026-011', productCode: 'BU8', productName: 'Egg Bun', plannedQty: 120, reason: 'Raw material delay', status: 'Approved', editUser: 'Dulan', editDate: '1/6/2026 10:40 51 AM', approvedBy: '-' },
  { id: 9, cancelNo: 'PRO0000011', cancelDate: '2026-01-04', productionNo: 'PRD-2026-010', productCode: 'BR3', productName: 'Whole Wheat Bread', plannedQty: 90, reason: 'Equipment malfunction', status: 'Approved', editUser: 'Dulan', editDate: '1/5/2026 3:52 31 PM', approvedBy: '-' },
  { id: 10, cancelNo: 'PRO0000010', cancelDate: '2026-01-03', productionNo: 'PRD-2026-009', productCode: 'BR5', productName: 'Butter Cake', plannedQty: 70, reason: 'Quality issue', status: 'Approved', editUser: 'Dulan', editDate: '1/5/2026 8:25 01 AM', approvedBy: '-' },
];

export default function ProductionCancelPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('production-cancel'));
  const dateBounds = getDateBounds('today-only', user as any, {
    allowBackDatePermission: 'production.cancel.allow-back-future',
    allowFutureDatePermission: 'production.cancel.allow-back-future',
  });

  const [cancels, setCancels] = useState<ProductionCancel[]>(mockProductionCancels);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCancel, setSelectedCancel] = useState<ProductionCancel | null>(null);
  
  const [formData, setFormData] = useState({
    cancelDate: todayISO(),
    productionNo: '',
    reason: '',
  });

  const filteredCancels = useMemo(() => {
    return cancels.filter(c => {
      const matchesSearch =
        c.cancelNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.productionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.editUser.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || c.status === statusFilter;
      
      // Admin sees all. Non-admin users see their own records.
      if (isAdmin) {
        return matchesSearch && matchesStatus;
      }
      
      // For non-admin users, filter by date range (3 days back if not showing previous records)
      const userFullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
      const matchesUser =
        user != null && (c.editUser === user.email || c.editUser === userFullName);
      if (!matchesUser) return false;
      
      if (!showPreviousRecords) {
        // Show only records from the last 3 days
        const threeDaysAgo = addDaysISO(-3);
        const matchesDate = c.cancelDate >= threeDaysAgo;
        return matchesSearch && matchesStatus && matchesDate;
      }
      
      return matchesSearch && matchesStatus;
    });
  }, [cancels, searchTerm, statusFilter, isAdmin, user, showPreviousRecords]);

  const totalPages = Math.ceil(filteredCancels.length / pageSize);
  const paginatedCancels = filteredCancels.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAdd = () => {
    const maxId = Math.max(...cancels.map(c => c.id), 0);
    const newCancel: ProductionCancel = {
      id: maxId + 1,
      cancelNo: `PRO${String(20 + maxId).padStart(7, '0')}`,
      cancelDate: formData.cancelDate,
      productionNo: formData.productionNo,
      productCode: 'BR2',
      productName: 'Sandwich Bread Large',
      plannedQty: 500,
      reason: formData.reason,
      status: 'Pending',
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
      approvedBy: undefined,
    };
    setCancels([newCancel, ...cancels]);
    setShowAddModal(false);
    resetForm();
  };

  const handleApprove = (id: number) => {
    setCancels(cancels.map(c =>
      c.id === id ? { ...c, status: 'Approved', approvedBy: 'Manager' } : c
    ));
  };

  const resetForm = () => {
    setFormData({
      cancelDate: todayISO(),
      productionNo: '',
      reason: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="success" size="sm">Approved</Badge>;
      case 'Rejected': return <Badge variant="danger" size="sm">Rejected</Badge>;
      default: return <Badge variant="warning" size="sm">Pending</Badge>;
    }
  };

  const openEditModal = (cancel: ProductionCancel) => {
    setSelectedCancel(cancel);
    setShowViewModal(true);
  };

  const columns = [
    {
      key: 'cancelDate',
      label: 'Cancelled Date',
      render: (item: ProductionCancel) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.cancelDate.split('-').reverse().join('/')}</span>
      ),
    },
    {
      key: 'cancelNo',
      label: 'Cancelled No',
      render: (item: ProductionCancel) => (
        <span className="font-semibold" style={{ color: pageTheme.secondaryColor }}>
          {item.cancelNo}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: ProductionCancel) => getStatusBadge(item.status),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: ProductionCancel) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.editUser}</span>
      ),
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: ProductionCancel) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.editDate}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: ProductionCancel) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.approvedBy || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (item: ProductionCancel) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => { setSelectedCancel(item); setShowViewModal(true); }}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status === 'Pending' && (
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
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Production Cancellation</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            History of Production Cancellation
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
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredCancels.length)} of {filteredCancels.length} entries
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
                options={[
                  { value: '', label: 'All Status' }, 
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
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" 
                  style={{ border: '1px solid var(--input)' }} 
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedCancels} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Request Production Cancel" size="lg">
        <div className="space-y-4">
          <Input
            label="Cancel Date"
            type="date"
            value={formData.cancelDate}
            onChange={(e) => setFormData({ ...formData, cancelDate: e.target.value })}
            min={dateBounds.min}
            max={dateBounds.max}
            helperText={dateBounds.helperText}
            fullWidth
            required
          />
          <Input label="Production No" value={formData.productionNo} onChange={(e) => setFormData({ ...formData, productionNo: e.target.value })} placeholder="PRD-2026-XXX" fullWidth required />
          <Input label="Cancellation Reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason for cancellation..." fullWidth required />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Submit Request</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedCancel(null); }} title="Production Cancellation Details" size="md">
        {selectedCancel && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Cancelled No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCancel.cancelNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedCancel.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Cancelled Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancel.cancelDate.split('-').reverse().join('/')}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Production No</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancel.productionNo}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancel.productCode} - {selectedCancel.productName}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Planned Quantity</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedCancel.plannedQty}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Reason</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancel.reason}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit User</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancel.editUser}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancel.editDate}</p>
              </div>
            </div>
            {selectedCancel.approvedBy && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved/Rejected By</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedCancel.approvedBy}</p>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedCancel(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
