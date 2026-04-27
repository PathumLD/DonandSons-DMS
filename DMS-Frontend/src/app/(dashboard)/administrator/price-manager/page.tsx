'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { DollarSign, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { priceListsApi, type PriceList, type CreatePriceListDto, type UpdatePriceListDto } from '@/lib/api/price-lists';
import toast from 'react-hot-toast';

export default function PriceManagerPage() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    priceListType: 'Standard',
    currency: 'LKR',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: undefined as string | undefined,
    isDefault: false,
    priority: 0,
    isActive: true,
  });

  useEffect(() => {
    loadPriceLists();
  }, [currentPage, pageSize, searchTerm]);

  const loadPriceLists = async () => {
    try {
      setLoading(true);
      const response = await priceListsApi.getAll(currentPage, pageSize, searchTerm, undefined);
      setPriceLists(response.priceLists);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load price lists');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (priceList: PriceList) => {
    try {
      const updateData: UpdatePriceListDto = {
        code: priceList.code,
        name: priceList.name,
        description: priceList.description,
        priceListType: priceList.priceListType,
        currency: priceList.currency,
        effectiveFrom: priceList.effectiveFrom,
        effectiveTo: priceList.effectiveTo,
        isDefault: priceList.isDefault,
        priority: priceList.priority,
        isActive: !priceList.isActive,
      };
      await priceListsApi.update(priceList.id, updateData);
      toast.success(`Price list ${priceList.isActive ? 'deactivated' : 'activated'}`);
      loadPriceLists();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update price list');
    }
  };

  const handleAddPriceList = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const createData: CreatePriceListDto = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        priceListType: formData.priceListType,
        currency: formData.currency,
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo,
        isDefault: formData.isDefault,
        priority: formData.priority,
        isActive: formData.isActive,
      };
      await priceListsApi.create(createData);
      toast.success('Price list created successfully');
      setShowAddModal(false);
      resetForm();
      loadPriceLists();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create price list');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPriceList = async () => {
    if (!selectedPriceList || !formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const updateData: UpdatePriceListDto = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        priceListType: formData.priceListType,
        currency: formData.currency,
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo,
        isDefault: formData.isDefault,
        priority: formData.priority,
        isActive: formData.isActive,
      };
      await priceListsApi.update(selectedPriceList.id, updateData);
      toast.success('Price list updated successfully');
      setShowEditModal(false);
      setSelectedPriceList(null);
      resetForm();
      loadPriceLists();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update price list');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      priceListType: 'Standard',
      currency: 'LKR',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: undefined,
      isDefault: false,
      priority: 0,
      isActive: true,
    });
  };

  const openEditModal = (priceList: PriceList) => {
    setSelectedPriceList(priceList);
    setFormData({
      code: priceList.code,
      name: priceList.name,
      description: priceList.description || '',
      priceListType: priceList.priceListType || 'Standard',
      currency: priceList.currency,
      effectiveFrom: priceList.effectiveFrom.split('T')[0],
      effectiveTo: priceList.effectiveTo ? priceList.effectiveTo.split('T')[0] : undefined,
      isDefault: priceList.isDefault,
      priority: priceList.priority,
      isActive: priceList.isActive,
    });
    setShowEditModal(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (item: PriceList) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Price List Name',
      render: (item: PriceList) => (
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
      key: 'currency',
      label: 'Currency',
      render: (item: PriceList) => (
        <Badge variant="neutral" size="sm">{item.currency}</Badge>
      ),
    },
    {
      key: 'effectiveFrom',
      label: 'Effective From',
      render: (item: PriceList) => (
        <span className="text-sm">{formatDate(item.effectiveFrom)}</span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (item: PriceList) => (
        <span className="text-sm font-mono">{item.priority}</span>
      ),
    },
    {
      key: 'isDefault',
      label: 'Default',
      render: (item: PriceList) => (
        item.isDefault ? <Badge variant="info" size="sm">Default</Badge> : null
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: PriceList) => (
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
      render: (item: PriceList) => (
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
          label="Price List Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., PL001"
          fullWidth
          required
        />
        <Input
          label="Price List Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Standard Price List"
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
            Price List Type
          </label>
          <select
            value={formData.priceListType}
            onChange={(e) => setFormData({ ...formData, priceListType: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)' }}
          >
            <option value="Standard">Standard</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Retail">Retail</option>
            <option value="Special">Special</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Currency <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)' }}
          >
            <option value="LKR">LKR - Sri Lankan Rupee</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Effective From"
          type="date"
          value={formData.effectiveFrom}
          onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
          fullWidth
          required
        />
        <Input
          label="Effective To (Optional)"
          type="date"
          value={formData.effectiveTo || ''}
          onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value || undefined })}
          fullWidth
        />
        <Input
          label="Priority"
          type="number"
          value={formData.priority.toString()}
          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
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
            <DollarSign className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Price Manager
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage price lists and pricing strategies ({totalCount} price lists)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Price List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Price Lists</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search price lists..."
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
              data={priceLists}
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
        title="Add Price List"
        size="lg"
      >
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddPriceList} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {submitting ? 'Adding...' : 'Add Price List'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPriceList(null);
          resetForm();
        }}
        title="Edit Price List"
        size="lg"
      >
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedPriceList(null);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditPriceList} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
