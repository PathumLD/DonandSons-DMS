'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Package, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { sectionConsumablesApi, type SectionConsumable, type CreateSectionConsumableDto, type UpdateSectionConsumableDto } from '@/lib/api/section-consumables';
import toast from 'react-hot-toast';

export default function SectionConsumablesPage() {
  const [consumables, setConsumables] = useState<SectionConsumable[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConsumable, setSelectedConsumable] = useState<SectionConsumable | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    productionSectionId: '',
    ingredientId: '',
    quantityPerUnit: 1,
    formula: '',
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    loadConsumables();
  }, [currentPage, pageSize, searchTerm]);

  const loadConsumables = async () => {
    try {
      setLoading(true);
      const response = await sectionConsumablesApi.getAll(
        currentPage,
        pageSize,
        undefined,
        undefined,
        searchTerm,
        undefined
      );
      setConsumables(response.sectionConsumables);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load section consumables');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (consumable: SectionConsumable) => {
    try {
      const updateData: UpdateSectionConsumableDto = {
        productionSectionId: consumable.productionSectionId,
        ingredientId: consumable.ingredientId,
        quantityPerUnit: consumable.quantityPerUnit,
        formula: consumable.formula,
        notes: consumable.notes,
        isActive: !consumable.isActive,
      };
      await sectionConsumablesApi.update(consumable.id, updateData);
      toast.success(`Section consumable ${consumable.isActive ? 'deactivated' : 'activated'}`);
      loadConsumables();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update section consumable');
    }
  };

  const handleAddConsumable = async () => {
    if (!formData.productionSectionId || !formData.ingredientId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const createData: CreateSectionConsumableDto = {
        productionSectionId: formData.productionSectionId,
        ingredientId: formData.ingredientId,
        quantityPerUnit: formData.quantityPerUnit,
        formula: formData.formula,
        notes: formData.notes,
        isActive: formData.isActive,
      };
      await sectionConsumablesApi.create(createData);
      toast.success('Section consumable created successfully');
      setShowAddModal(false);
      resetForm();
      loadConsumables();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create section consumable');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditConsumable = async () => {
    if (!selectedConsumable || !formData.productionSectionId || !formData.ingredientId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const updateData: UpdateSectionConsumableDto = {
        productionSectionId: formData.productionSectionId,
        ingredientId: formData.ingredientId,
        quantityPerUnit: formData.quantityPerUnit,
        formula: formData.formula,
        notes: formData.notes,
        isActive: formData.isActive,
      };
      await sectionConsumablesApi.update(selectedConsumable.id, updateData);
      toast.success('Section consumable updated successfully');
      setShowEditModal(false);
      setSelectedConsumable(null);
      resetForm();
      loadConsumables();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update section consumable');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productionSectionId: '',
      ingredientId: '',
      quantityPerUnit: 1,
      formula: '',
      notes: '',
      isActive: true,
    });
  };

  const openEditModal = (consumable: SectionConsumable) => {
    setSelectedConsumable(consumable);
    setFormData({
      productionSectionId: consumable.productionSectionId,
      ingredientId: consumable.ingredientId,
      quantityPerUnit: consumable.quantityPerUnit,
      formula: consumable.formula || '',
      notes: consumable.notes || '',
      isActive: consumable.isActive,
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'productionSectionName',
      label: 'Production Section',
      render: (item: SectionConsumable) => (
        <span className="font-medium">{item.productionSectionName}</span>
      ),
    },
    {
      key: 'ingredientName',
      label: 'Ingredient / Consumable',
      render: (item: SectionConsumable) => (
        <div>
          <span className="font-medium">{item.ingredientName}</span>
          {item.ingredientCode && (
            <div className="text-xs font-mono" style={{ color: '#C8102E' }}>
              {item.ingredientCode}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'quantityPerUnit',
      label: 'Qty Per Unit',
      render: (item: SectionConsumable) => (
        <Badge variant="neutral" size="sm">{item.quantityPerUnit}</Badge>
      ),
    },
    {
      key: 'formula',
      label: 'Formula',
      render: (item: SectionConsumable) => (
        <span className="text-sm font-mono">{item.formula || '-'}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: SectionConsumable) => (
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
      render: (item: SectionConsumable) => (
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

  const renderConsumableForm = () => (
    <div className="space-y-4">
      <Input
        label="Production Section ID"
        value={formData.productionSectionId}
        onChange={(e) => setFormData({ ...formData, productionSectionId: e.target.value })}
        placeholder="Enter production section ID (GUID)"
        fullWidth
        required
      />
      <Input
        label="Ingredient ID"
        value={formData.ingredientId}
        onChange={(e) => setFormData({ ...formData, ingredientId: e.target.value })}
        placeholder="Enter ingredient ID (GUID)"
        fullWidth
        required
      />
      <Input
        label="Quantity Per Unit"
        type="number"
        step="0.01"
        value={formData.quantityPerUnit.toString()}
        onChange={(e) => setFormData({ ...formData, quantityPerUnit: parseFloat(e.target.value) || 1 })}
        fullWidth
        required
      />
      <Input
        label="Formula"
        value={formData.formula}
        onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
        placeholder="Optional formula"
        fullWidth
      />
      <Input
        label="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        placeholder="Optional notes"
        fullWidth
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            <Package className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Section Consumables
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage non-ingredient consumables per production section ({totalCount} consumables)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Consumable
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Section Consumables List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search consumables..."
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
              data={consumables}
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

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Section Consumable"
        size="md"
      >
        {renderConsumableForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddConsumable} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {submitting ? 'Adding...' : 'Add Consumable'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedConsumable(null);
          resetForm();
        }}
        title="Edit Section Consumable"
        size="md"
      >
        {renderConsumableForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedConsumable(null);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditConsumable} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
