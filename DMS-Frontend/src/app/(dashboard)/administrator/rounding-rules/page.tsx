'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Calculator, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { roundingRulesApi, type RoundingRule, type CreateRoundingRuleDto, type UpdateRoundingRuleDto } from '@/lib/api/rounding-rules';
import toast from 'react-hot-toast';

export default function RoundingRulesPage() {
  const [roundingRules, setRoundingRules] = useState<RoundingRule[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<RoundingRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    appliesTo: 'Product',
    roundingMethod: 'Nearest',
    decimalPlaces: 2,
    roundingIncrement: 1,
    minValue: undefined as number | undefined,
    maxValue: undefined as number | undefined,
    sortOrder: 0,
    isDefault: false,
    isActive: true,
  });

  useEffect(() => {
    loadRoundingRules();
  }, [currentPage, pageSize, searchTerm]);

  const loadRoundingRules = async () => {
    try {
      setLoading(true);
      const response = await roundingRulesApi.getAll(currentPage, pageSize, searchTerm, undefined, undefined);
      setRoundingRules(response.roundingRules);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load rounding rules');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (rule: RoundingRule) => {
    try {
      const updateData: UpdateRoundingRuleDto = {
        code: rule.code,
        name: rule.name,
        description: rule.description,
        appliesTo: rule.appliesTo,
        roundingMethod: rule.roundingMethod,
        decimalPlaces: rule.decimalPlaces,
        roundingIncrement: rule.roundingIncrement,
        minValue: rule.minValue,
        maxValue: rule.maxValue,
        sortOrder: rule.sortOrder,
        isDefault: rule.isDefault,
        isActive: !rule.isActive,
      };
      await roundingRulesApi.update(rule.id, updateData);
      toast.success(`Rounding rule ${rule.isActive ? 'deactivated' : 'activated'}`);
      loadRoundingRules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update rounding rule');
    }
  };

  const handleAddRule = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const createData: CreateRoundingRuleDto = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        appliesTo: formData.appliesTo,
        roundingMethod: formData.roundingMethod,
        decimalPlaces: formData.decimalPlaces,
        roundingIncrement: formData.roundingIncrement,
        minValue: formData.minValue,
        maxValue: formData.maxValue,
        sortOrder: formData.sortOrder,
        isDefault: formData.isDefault,
        isActive: formData.isActive,
      };
      await roundingRulesApi.create(createData);
      toast.success('Rounding rule created successfully');
      setShowAddModal(false);
      resetForm();
      loadRoundingRules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create rounding rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRule = async () => {
    if (!selectedRule || !formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const updateData: UpdateRoundingRuleDto = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        appliesTo: formData.appliesTo,
        roundingMethod: formData.roundingMethod,
        decimalPlaces: formData.decimalPlaces,
        roundingIncrement: formData.roundingIncrement,
        minValue: formData.minValue,
        maxValue: formData.maxValue,
        sortOrder: formData.sortOrder,
        isDefault: formData.isDefault,
        isActive: formData.isActive,
      };
      await roundingRulesApi.update(selectedRule.id, updateData);
      toast.success('Rounding rule updated successfully');
      setShowEditModal(false);
      setSelectedRule(null);
      resetForm();
      loadRoundingRules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update rounding rule');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      appliesTo: 'Product',
      roundingMethod: 'Nearest',
      decimalPlaces: 2,
      roundingIncrement: 1,
      minValue: undefined,
      maxValue: undefined,
      sortOrder: 0,
      isDefault: false,
      isActive: true,
    });
  };

  const openEditModal = (rule: RoundingRule) => {
    setSelectedRule(rule);
    setFormData({
      code: rule.code,
      name: rule.name,
      description: rule.description || '',
      appliesTo: rule.appliesTo,
      roundingMethod: rule.roundingMethod,
      decimalPlaces: rule.decimalPlaces,
      roundingIncrement: rule.roundingIncrement,
      minValue: rule.minValue,
      maxValue: rule.maxValue,
      sortOrder: rule.sortOrder,
      isDefault: rule.isDefault,
      isActive: rule.isActive,
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (item: RoundingRule) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Rule Name',
      render: (item: RoundingRule) => (
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
      key: 'appliesTo',
      label: 'Applies To',
      render: (item: RoundingRule) => (
        <Badge variant="neutral" size="sm">{item.appliesTo}</Badge>
      ),
    },
    {
      key: 'roundingMethod',
      label: 'Method',
      render: (item: RoundingRule) => (
        <span className="text-sm">{item.roundingMethod}</span>
      ),
    },
    {
      key: 'increment',
      label: 'Increment',
      render: (item: RoundingRule) => (
        <span className="text-sm font-mono">{item.roundingIncrement}</span>
      ),
    },
    {
      key: 'isDefault',
      label: 'Default',
      render: (item: RoundingRule) => (
        item.isDefault ? <Badge variant="info" size="sm">Default</Badge> : null
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: RoundingRule) => (
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
      render: (item: RoundingRule) => (
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

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Rule Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., RND001"
          fullWidth
          required
        />
        <Input
          label="Rule Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Standard Rounding"
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
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Applies To <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.appliesTo}
            onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)' }}
          >
            <option value="Product">Product</option>
            <option value="Price">Price</option>
            <option value="Quantity">Quantity</option>
            <option value="Total">Total</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Rounding Method <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.roundingMethod}
            onChange={(e) => setFormData({ ...formData, roundingMethod: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)' }}
          >
            <option value="Nearest">Nearest</option>
            <option value="Up">Up</option>
            <option value="Down">Down</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Decimal Places"
          type="number"
          value={formData.decimalPlaces.toString()}
          onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) || 0 })}
          fullWidth
          required
        />
        <Input
          label="Rounding Increment"
          type="number"
          step="0.01"
          value={formData.roundingIncrement.toString()}
          onChange={(e) => setFormData({ ...formData, roundingIncrement: parseFloat(e.target.value) || 1 })}
          fullWidth
          required
        />
        <Input
          label="Sort Order"
          type="number"
          value={formData.sortOrder.toString()}
          onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          fullWidth
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Min Value (Optional)"
          type="number"
          step="0.01"
          value={formData.minValue?.toString() || ''}
          onChange={(e) => setFormData({ ...formData, minValue: e.target.value ? parseFloat(e.target.value) : undefined })}
          fullWidth
        />
        <Input
          label="Max Value (Optional)"
          type="number"
          step="0.01"
          value={formData.maxValue?.toString() || ''}
          onChange={(e) => setFormData({ ...formData, maxValue: e.target.value ? parseFloat(e.target.value) : undefined })}
          fullWidth
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <Toggle
          checked={formData.isDefault}
          onChange={(checked) => setFormData({ ...formData, isDefault: checked })}
          label="Set as Default"
        />
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
            <Calculator className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Rounding Rules
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage rounding rules for prices and quantities ({totalCount} rules)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Rounding Rule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Rounding Rules List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search rounding rules..."
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
              data={roundingRules}
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

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Rounding Rule"
        size="lg"
      >
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddRule} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {submitting ? 'Adding...' : 'Add Rule'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRule(null);
          resetForm();
        }}
        title="Edit Rounding Rule"
        size="lg"
      >
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedRule(null);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditRule} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
