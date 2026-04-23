'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Search, Edit, Eye, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockDailyProduction, type DailyProduction } from '@/lib/mock-data/production';
import { mockProducts } from '@/lib/mock-data/products';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO, addDaysISO } from '@/lib/date-restrictions';

export default function DailyProductionPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('daily-production'));
  const dateBounds = getDateBounds('today-only', user as any, {
    allowBackDatePermission: 'production.daily.allow-back-future',
    allowFutureDatePermission: 'production.daily.allow-back-future',
  });

  const [productions, setProductions] = useState<DailyProduction[]>(mockDailyProduction);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<DailyProduction | null>(null);
  
  const [formData, setFormData] = useState({
    productionDate: todayISO(),
    productId: '',
    plannedQty: '',
    producedQty: '0',
    shift: 'Morning' as DailyProduction['shift'],
    status: 'Pending' as DailyProduction['status'],
  });

  const filteredProductions = useMemo(() => {
    return productions.filter(p => {
      const matchesSearch =
        p.productionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.editUser.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      
      // Admin sees all. Non-admin users see their own records.
      if (isAdmin) {
        return matchesSearch && matchesStatus;
      }
      
      // For non-admin users, filter by date range (3 days back if not showing previous records)
      const matchesUser = p.editUser === user?.username || p.editUser === user?.email;
      if (!matchesUser) return false;
      
      if (!showPreviousRecords) {
        // Show only records from the last 3 days
        const threeDaysAgo = addDaysISO(-3);
        const matchesDate = p.productionDate >= threeDaysAgo;
        return matchesSearch && matchesStatus && matchesDate;
      }
      
      return matchesSearch && matchesStatus;
    });
  }, [productions, searchTerm, statusFilter, isAdmin, user, showPreviousRecords]);

  const totalPages = Math.ceil(filteredProductions.length / pageSize);
  const paginatedProductions = filteredProductions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddProduction = () => {
    const product = mockProducts.find(p => p.id === Number(formData.productId));
    const maxId = Math.max(...productions.map(p => p.id), 0);
    const newProduction: DailyProduction = {
      id: maxId + 1,
      productionNo: `PRO${String(2175 + maxId).padStart(7, '0')}`,
      productionDate: formData.productionDate,
      productId: Number(formData.productId),
      productCode: product?.code || '',
      productName: product?.description || '',
      plannedQty: Number(formData.plannedQty),
      producedQty: Number(formData.producedQty),
      status: 'Pending',
      shift: formData.shift,
      editUser: user?.username || 'Unknown',
      editDate: new Date().toLocaleString('en-US', { 
        month: '1-digit', 
        day: '1-digit', 
        year: 'numeric', 
        hour: '1-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }),
      approvedBy: undefined,
    };
    setProductions([newProduction, ...productions]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditProduction = () => {
    if (selectedProduction) {
      setProductions(productions.map(p =>
        p.id === selectedProduction.id
          ? {
              ...p,
              producedQty: Number(formData.producedQty),
              status: formData.status,
              editDate: new Date().toLocaleString(),
            }
          : p
      ));
      setShowEditModal(false);
      setSelectedProduction(null);
      resetForm();
    }
  };


  const resetForm = () => {
    setFormData({
      productionDate: todayISO(),
      productId: '',
      plannedQty: '',
      producedQty: '0',
      shift: 'Morning',
      status: 'Pending',
    });
  };

  const openEditModal = (production: DailyProduction) => {
    setSelectedProduction(production);
    setFormData({
      productionDate: production.productionDate,
      productId: String(production.productId),
      plannedQty: String(production.plannedQty),
      producedQty: String(production.producedQty),
      shift: production.shift,
      status: production.status,
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success" size="sm">Approved</Badge>;
      case 'Pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'Rejected':
        return <Badge variant="danger" size="sm">Rejected</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: 'productionDate',
      label: 'Production Date',
      render: (item: DailyProduction) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.productionDate.split('-').reverse().join('/')}</span>
      ),
    },
    {
      key: 'productionNo',
      label: 'Production No',
      render: (item: DailyProduction) => (
        <span className="font-semibold" style={{ color: pageTheme.secondaryColor }}>
          {item.productionNo}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: DailyProduction) => getStatusBadge(item.status),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: DailyProduction) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.editUser}</span>
      ),
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: DailyProduction) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.editDate}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: DailyProduction) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.approvedBy || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (item: DailyProduction) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => {
              setSelectedProduction(item);
              setShowViewModal(true);
            }}
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

  const renderProductionForm = (isEdit = false) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Production Date"
          type="date"
          value={formData.productionDate}
          onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
          min={dateBounds.min}
          max={dateBounds.max}
          helperText={dateBounds.helperText}
          fullWidth
          required
          disabled={isEdit}
        />
        <Select
          label="Shift"
          value={formData.shift}
          onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
          options={[
            { value: 'Morning', label: 'Morning Shift' },
            { value: 'Evening', label: 'Evening Shift' },
            { value: 'Night', label: 'Night Shift' },
          ]}
          fullWidth
          required
          disabled={isEdit}
        />
      </div>
      <Select
        label="Product"
        value={formData.productId}
        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
        options={mockProducts.filter(p => p.active).map(p => ({ value: p.id, label: `${p.code} - ${p.description}` }))}
        placeholder="Select product"
        fullWidth
        required
        disabled={isEdit}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Planned Quantity"
          type="number"
          value={formData.plannedQty}
          onChange={(e) => setFormData({ ...formData, plannedQty: e.target.value })}
          placeholder="0"
          fullWidth
          required
          disabled={isEdit}
        />
        <Input
          label="Produced Quantity"
          type="number"
          value={formData.producedQty}
          onChange={(e) => setFormData({ ...formData, producedQty: e.target.value })}
          placeholder="0"
          fullWidth
          required
        />
      </div>
      {isEdit && (
        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          options={[
            { value: 'Pending', label: 'Pending' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Rejected', label: 'Rejected' },
          ]}
          fullWidth
        />
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Production</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            History of Production
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
          <Button variant="primary" size="md" onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}>
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
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredProductions.length)} of {filteredProductions.length} entries
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Rejected', label: 'Rejected' },
                ]}
              />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid var(--input)' }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={paginatedProductions}
            columns={columns}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Production"
        size="lg"
      >
        {renderProductionForm(false)}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddProduction}>
            <Plus className="w-4 h-4 mr-2" />Create Production
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduction(null);
          resetForm();
        }}
        title="Update Production"
        size="lg"
      >
        {renderProductionForm(true)}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedProduction(null);
            resetForm();
          }}>Cancel</Button>
          <Button variant="primary" onClick={handleEditProduction}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedProduction(null);
        }}
        title="Production Details"
        size="md"
      >
        {selectedProduction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Production No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduction.productionNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedProduction.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Production Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {new Date(selectedProduction.productionDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Shift</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedProduction.shift}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {selectedProduction.productCode} - {selectedProduction.productName}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Planned Quantity</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduction.plannedQty}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Produced Quantity</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduction.producedQty}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit User / Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {selectedProduction.editUser} • {selectedProduction.editDate}
              </p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowViewModal(false);
            setSelectedProduction(null);
          }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
