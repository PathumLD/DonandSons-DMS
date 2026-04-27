'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Calendar, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { dayTypesApi, type DayType, type CreateDayTypeDto, type UpdateDayTypeDto } from '@/lib/api/day-types';
import toast from 'react-hot-toast';

export default function DayTypesPage() {
  const [dayTypes, setDayTypes] = useState<DayType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDayType, setSelectedDayType] = useState<DayType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    multiplier: 1.0,
    color: '#C8102E',
    isActive: true,
  });

  useEffect(() => {
    loadDayTypes();
  }, [currentPage, pageSize, searchTerm]);

  const loadDayTypes = async () => {
    try {
      setLoading(true);
      const response = await dayTypesApi.getAll(currentPage, pageSize, searchTerm, undefined);
      setDayTypes(response.dayTypes);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load day types');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (dayType: DayType) => {
    try {
      const updateData: UpdateDayTypeDto = {
        code: dayType.code,
        name: dayType.name,
        description: dayType.description,
        multiplier: dayType.multiplier,
        color: dayType.color,
        isActive: !dayType.isActive,
      };
      await dayTypesApi.update(dayType.id, updateData);
      toast.success(`Day type ${dayType.isActive ? 'deactivated' : 'activated'}`);
      loadDayTypes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update day type');
    }
  };

  const handleAddDayType = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const createData: CreateDayTypeDto = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        multiplier: formData.multiplier,
        color: formData.color,
        isActive: formData.isActive,
      };
      await dayTypesApi.create(createData);
      toast.success('Day type created successfully');
      setShowAddModal(false);
      resetForm();
      loadDayTypes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create day type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDayType = async () => {
    if (!selectedDayType || !formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const updateData: UpdateDayTypeDto = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        multiplier: formData.multiplier,
        color: formData.color,
        isActive: formData.isActive,
      };
      await dayTypesApi.update(selectedDayType.id, updateData);
      toast.success('Day type updated successfully');
      setShowEditModal(false);
      setSelectedDayType(null);
      resetForm();
      loadDayTypes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update day type');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      multiplier: 1.0,
      color: '#C8102E',
      isActive: true,
    });
  };

  const openEditModal = (dayType: DayType) => {
    setSelectedDayType(dayType);
    setFormData({
      code: dayType.code,
      name: dayType.name,
      description: dayType.description || '',
      multiplier: dayType.multiplier,
      color: dayType.color || '#C8102E',
      isActive: dayType.isActive,
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (item: DayType) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Day Type Name',
      render: (item: DayType) => (
        <div>
          <span className="font-medium">{item.name}</span>
          {item.description && (
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {item.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'multiplier',
      label: 'Multiplier',
      render: (item: DayType) => (
        <Badge variant="neutral" size="sm">{item.multiplier}x</Badge>
      ),
    },
    {
      key: 'color',
      label: 'Color',
      render: (item: DayType) => (
        <div className="flex items-center gap-2">
          {item.color && (
            <div
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: item.color }}
            />
          )}
          <span className="text-sm font-mono">{item.color}</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: DayType) => (
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
      render: (item: DayType) => (
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

  const renderDayTypeForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Day Type Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., HOL, WKD"
          fullWidth
          required
        />
        <Input
          label="Day Type Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Holiday, Weekend"
          fullWidth
          required
        />
      </div>
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Optional description"
        fullWidth
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Multiplier"
          type="number"
          step="0.1"
          value={formData.multiplier.toString()}
          onChange={(e) => setFormData({ ...formData, multiplier: parseFloat(e.target.value) || 1.0 })}
          fullWidth
          required
        />
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <Input
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#000000"
              fullWidth
            />
          </div>
        </div>
      </div>
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
            <Calendar className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Day Types
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage production day types for morning and afternoon schedules ({totalCount} types)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Day Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Day Type List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search day types..."
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
              data={dayTypes}
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
        title="Add New Day Type"
        size="md"
      >
        {renderDayTypeForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddDayType} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {submitting ? 'Adding...' : 'Add Day Type'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDayType(null);
          resetForm();
        }}
        title="Edit Day Type"
        size="md"
      >
        {renderDayTypeForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedDayType(null);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditDayType} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
