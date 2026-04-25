'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Ruler, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { uomsApi, UnitOfMeasure } from '@/lib/api/uoms';
import toast from 'react-hot-toast';

export default function UOMPage() {
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUOM, setSelectedUOM] = useState<UnitOfMeasure | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    loadUOMs();
  }, [currentPage, pageSize, searchTerm]);

  const loadUOMs = async () => {
    try {
      setLoading(true);
      const response = await uomsApi.getAll(currentPage, pageSize, searchTerm, undefined);
      setUoms(response.unitOfMeasures);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load unit of measures');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (uom: UnitOfMeasure) => {
    try {
      const updated = await uomsApi.update(uom.id, {
        ...uom,
        isActive: !uom.isActive,
      });
      toast.success(`Unit of measure ${updated.isActive ? 'activated' : 'deactivated'}`);
      loadUOMs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update unit of measure');
    }
  };

  const handleAddUOM = async () => {
    if (!formData.code || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await uomsApi.create(formData);
      toast.success('Unit of measure created successfully');
      setShowAddModal(false);
      resetForm();
      loadUOMs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create unit of measure');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUOM = async () => {
    if (!selectedUOM || !formData.code || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await uomsApi.update(selectedUOM.id, formData);
      toast.success('Unit of measure updated successfully');
      setShowEditModal(false);
      setSelectedUOM(null);
      resetForm();
      loadUOMs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update unit of measure');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ code: '', description: '', isActive: true });
  };

  const openEditModal = (uom: UnitOfMeasure) => {
    setSelectedUOM(uom);
    setFormData({
      code: uom.code,
      description: uom.description,
      isActive: uom.isActive,
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'code',
      label: 'UOM Code',
      render: (item: UnitOfMeasure) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (item: UnitOfMeasure) => (
        <span className="font-medium">{item.description}</span>
      ),
    },
    {
      key: 'productCount',
      label: 'Products',
      render: (item: UnitOfMeasure) => (
        <Badge variant="neutral" size="sm">{item.productCount}</Badge>
      ),
    },
    {
      key: 'ingredientCount',
      label: 'Ingredients',
      render: (item: UnitOfMeasure) => (
        <Badge variant="neutral" size="sm">{item.ingredientCount}</Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: UnitOfMeasure) => (
        item.isActive ? (
          <Badge variant="success" size="sm">Active</Badge>
        ) : (
          <Badge variant="danger" size="sm">Inactive</Badge>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: UnitOfMeasure) => (
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
            onClick={() => handleToggleActive(item)}
            className="p-1.5 rounded transition-colors"
            style={{ color: item.isActive ? '#DC2626' : '#10B981' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = item.isActive ? '#FEF2F2' : '#F0FDF4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={item.isActive ? 'Deactivate' : 'Activate'}
          >
            {item.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
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
        placeholder="e.g., KG, PC, LTR"
        fullWidth
        required
      />
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Full description"
        fullWidth
        required
      />
      <div className="pt-2">
        <Toggle
          checked={formData.isActive}
          onChange={(checked) => setFormData({ ...formData, isActive: checked })}
          label="Active Status"
        />
      </div>
    </div>
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Unit of Measures</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage unit of measures ({totalCount} units)
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
                placeholder="Search UOMs..."
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C8102E' }} />
            </div>
          ) : (
            <DataTable
              data={uoms}
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
          )}
        </CardContent>
      </Card>

      {/* Add UOM Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Unit of Measure"
        size="md"
      >
        {renderUOMForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddUOM} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
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
        title="Edit Unit of Measure"
        size="md"
      >
        {renderUOMForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedUOM(null);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditUOM} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
