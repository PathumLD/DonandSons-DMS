'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Factory, Plus, Search, Edit, Eye, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockDailyProduction, type DailyProduction } from '@/lib/mock-data/production';
import { mockProducts } from '@/lib/mock-data/products';

export default function DailyProductionPage() {
  const [productions, setProductions] = useState<DailyProduction[]>(mockDailyProduction);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<DailyProduction | null>(null);
  
  const [formData, setFormData] = useState({
    productionDate: new Date().toISOString().split('T')[0],
    productId: '',
    plannedQty: '',
    producedQty: '0',
    shift: 'Morning' as const,
    status: 'Planned' as const,
  });

  const filteredProductions = useMemo(() => {
    return productions.filter(p => {
      const matchesSearch = 
        p.productionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [productions, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredProductions.length / pageSize);
  const paginatedProductions = filteredProductions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddProduction = () => {
    const product = mockProducts.find(p => p.id === Number(formData.productId));
    const newProduction: DailyProduction = {
      id: Math.max(...productions.map(p => p.id)) + 1,
      productionNo: `PRD-2026-${String(productions.length + 1).padStart(3, '0')}`,
      productionDate: formData.productionDate,
      productId: Number(formData.productId),
      productCode: product?.code || '',
      productName: product?.description || '',
      plannedQty: Number(formData.plannedQty),
      producedQty: Number(formData.producedQty),
      status: formData.status,
      shift: formData.shift,
      editUser: 'prod_supervisor',
      editDate: new Date().toLocaleString(),
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

  const handleCancel = (id: number) => {
    setProductions(productions.map(p =>
      p.id === id ? { ...p, status: 'Cancelled' } : p
    ));
  };

  const resetForm = () => {
    setFormData({
      productionDate: new Date().toISOString().split('T')[0],
      productId: '',
      plannedQty: '',
      producedQty: '0',
      shift: 'Morning',
      status: 'Planned',
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
      case 'Completed':
        return <Badge variant="success" size="sm">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="warning" size="sm">In Progress</Badge>;
      case 'Planned':
        return <Badge variant="primary" size="sm">Planned</Badge>;
      case 'Cancelled':
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: 'productionDate',
      label: 'Production Date',
      render: (item: DailyProduction) => (
        <span className="font-medium">{new Date(item.productionDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'productionNo',
      label: 'Production No',
      render: (item: DailyProduction) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.productionNo}
        </span>
      ),
    },
    {
      key: 'productCode',
      label: 'Product Code',
      render: (item: DailyProduction) => (
        <span className="font-mono">{item.productCode}</span>
      ),
    },
    {
      key: 'productName',
      label: 'Product Name',
      render: (item: DailyProduction) => (
        <span className="font-medium">{item.productName}</span>
      ),
    },
    {
      key: 'shift',
      label: 'Shift',
    },
    {
      key: 'plannedQty',
      label: 'Planned Qty',
      render: (item: DailyProduction) => (
        <span className="font-semibold">{item.plannedQty}</span>
      ),
    },
    {
      key: 'producedQty',
      label: 'Produced Qty',
      render: (item: DailyProduction) => (
        <span className="font-semibold" style={{ color: item.producedQty >= item.plannedQty ? '#10B981' : '#F59E0B' }}>
          {item.producedQty}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: DailyProduction) => getStatusBadge(item.status),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: DailyProduction) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedProduction(item);
              setShowViewModal(true);
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {(item.status === 'Planned' || item.status === 'In Progress') && (
            <>
              <button
                onClick={() => openEditModal(item)}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCancel(item.id)}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#DC2626' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Cancel"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
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
            { value: 'Planned', label: 'Planned' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' },
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
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Daily Production</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Track daily production activities ({filteredProductions.length} records)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Production
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Production List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'Planned', label: 'Planned' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Cancelled', label: 'Cancelled' },
                ]}
              />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search production..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #D1D5DB' }}
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
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Production No</p>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedProduction.productionNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</p>
                {getStatusBadge(selectedProduction.status)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Production Date</p>
                <p className="text-sm" style={{ color: '#111827' }}>
                  {new Date(selectedProduction.productionDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Shift</p>
                <p className="text-sm" style={{ color: '#111827' }}>{selectedProduction.shift}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Product</p>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                {selectedProduction.productCode} - {selectedProduction.productName}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Planned Quantity</p>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedProduction.plannedQty}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Produced Quantity</p>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedProduction.producedQty}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Edit User / Date</p>
              <p className="text-sm" style={{ color: '#111827' }}>
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
