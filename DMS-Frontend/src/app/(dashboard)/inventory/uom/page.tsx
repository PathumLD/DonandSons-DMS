'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Ruler, Plus, Search, Edit, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockUOMs } from '@/lib/mock-data/products';

interface UOM {
  id: number;
  code: string;
  description: string;
  active: boolean;
}

export default function UOMPage() {
  const [uoms, setUoms] = useState<UOM[]>(mockUOMs);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUOM, setSelectedUOM] = useState<UOM | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    active: true,
  });

  const filteredUOMs = useMemo(() => {
    return uoms.filter(uom =>
      uom.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uom.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uoms, searchTerm]);

  const totalPages = Math.ceil(filteredUOMs.length / pageSize);
  const paginatedUOMs = filteredUOMs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleActive = (id: number) => {
    setUoms(uoms.map(u =>
      u.id === id ? { ...u, active: !u.active } : u
    ));
  };

  const handleAddUOM = () => {
    const newUOM: UOM = {
      id: Math.max(...uoms.map(u => u.id)) + 1,
      code: formData.code,
      description: formData.description,
      active: formData.active,
    };
    setUoms([newUOM, ...uoms]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditUOM = () => {
    if (selectedUOM) {
      setUoms(uoms.map(u =>
        u.id === selectedUOM.id
          ? { ...u, code: formData.code, description: formData.description, active: formData.active }
          : u
      ));
      setShowEditModal(false);
      setSelectedUOM(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({ code: '', description: '', active: true });
  };

  const openEditModal = (uom: UOM) => {
    setSelectedUOM(uom);
    setFormData({
      code: uom.code,
      description: uom.description,
      active: uom.active,
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'code',
      label: 'UOM Code',
      render: (item: UOM) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (item: UOM) => (
        <span className="font-medium">{item.description}</span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      render: (item: UOM) => (
        item.active ? (
          <Badge variant="success" size="sm">Active</Badge>
        ) : (
          <Badge variant="danger" size="sm">Inactive</Badge>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: UOM) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleActive(item.id)}
            className="p-1.5 rounded transition-colors"
            style={{ color: item.active ? '#DC2626' : '#10B981' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = item.active ? '#FEF2F2' : '#F0FDF4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={item.active ? 'Deactivate' : 'Activate'}
          >
            {item.active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  const renderUOMForm = () => (
    <div className="space-y-4">
      <Input
        label="UOM Code"
        value={formData.code}
        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
        placeholder="e.g., Kg, L, Nos"
        fullWidth
        required
      />
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Full unit name"
        fullWidth
        required
      />
      <div className="pt-2">
        <Toggle
          checked={formData.active}
          onChange={(checked) => setFormData({ ...formData, active: checked })}
          label="Active Status"
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Unit of Measure (UOM)</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage unit of measure ({filteredUOMs.length} units)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add UOM
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>UOM List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search UOM..."
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
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={paginatedUOMs}
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

      {/* Add UOM Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New UOM"
        size="md"
      >
        {renderUOMForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddUOM}>
            <Plus className="w-4 h-4 mr-2" />
            Add UOM
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit UOM Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUOM(null);
          resetForm();
        }}
        title="Edit UOM"
        size="md"
      >
        {renderUOMForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedUOM(null);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditUOM}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
