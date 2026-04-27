'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Settings, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { labelSettingsApi, type LabelSetting, type CreateLabelSettingDto, type UpdateLabelSettingDto } from '@/lib/api/label-settings';
import toast from 'react-hot-toast';

export default function LabelSettingsPage() {
  const [settings, setSettings] = useState<LabelSetting[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<LabelSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    settingKey: '',
    settingName: '',
    settingValue: '',
    description: '',
    category: '',
    valueType: 'string',
    sortOrder: 0,
    isSystemSetting: false,
    isActive: true,
  });

  useEffect(() => {
    loadSettings();
  }, [currentPage, pageSize, searchTerm]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await labelSettingsApi.getAll(currentPage, pageSize, searchTerm, undefined, undefined);
      setSettings(response.labelSettings);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load label settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (setting: LabelSetting) => {
    try {
      const updateData: UpdateLabelSettingDto = {
        ...setting,
        isActive: !setting.isActive,
      };
      await labelSettingsApi.update(setting.id, updateData);
      toast.success(`Setting ${setting.isActive ? 'deactivated' : 'activated'}`);
      loadSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update setting');
    }
  };

  const handleAddSetting = async () => {
    if (!formData.settingKey || !formData.settingName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await labelSettingsApi.create(formData);
      toast.success('Setting created successfully');
      setShowAddModal(false);
      resetForm();
      loadSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create setting');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSetting = async () => {
    if (!selectedSetting || !formData.settingKey || !formData.settingName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await labelSettingsApi.update(selectedSetting.id, formData);
      toast.success('Setting updated successfully');
      setShowEditModal(false);
      setSelectedSetting(null);
      resetForm();
      loadSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update setting');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      settingKey: '',
      settingName: '',
      settingValue: '',
      description: '',
      category: '',
      valueType: 'string',
      sortOrder: 0,
      isSystemSetting: false,
      isActive: true,
    });
  };

  const openEditModal = (setting: LabelSetting) => {
    setSelectedSetting(setting);
    setFormData({
      settingKey: setting.settingKey,
      settingName: setting.settingName,
      settingValue: setting.settingValue || '',
      description: setting.description || '',
      category: setting.category || '',
      valueType: setting.valueType,
      sortOrder: setting.sortOrder,
      isSystemSetting: setting.isSystemSetting,
      isActive: setting.isActive,
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'settingKey',
      label: 'Setting Key',
      render: (item: LabelSetting) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.settingKey}
        </span>
      ),
    },
    {
      key: 'settingName',
      label: 'Setting Name',
      render: (item: LabelSetting) => (
        <div>
          <span className="font-medium">{item.settingName}</span>
          {item.description && (
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {item.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'settingValue',
      label: 'Value',
      render: (item: LabelSetting) => (
        <span className="text-sm font-mono">{item.settingValue || '-'}</span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (item: LabelSetting) => (
        item.category ? <Badge variant="neutral" size="sm">{item.category}</Badge> : null
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: LabelSetting) => (
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
      render: (item: LabelSetting) => (
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
          {!item.isSystemSetting && (
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
          )}
        </div>
      ),
    },
  ];

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Setting Key"
          value={formData.settingKey}
          onChange={(e) => setFormData({ ...formData, settingKey: e.target.value })}
          placeholder="e.g., LABEL_FONT_SIZE"
          fullWidth
          required
          disabled={selectedSetting?.isSystemSetting}
        />
        <Input
          label="Setting Name"
          value={formData.settingName}
          onChange={(e) => setFormData({ ...formData, settingName: e.target.value })}
          placeholder="Label Font Size"
          fullWidth
          required
        />
      </div>
      <Input
        label="Setting Value"
        value={formData.settingValue}
        onChange={(e) => setFormData({ ...formData, settingValue: e.target.value })}
        placeholder="Value"
        fullWidth
      />
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Optional description"
        fullWidth
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g., Display"
          fullWidth
        />
        <Input
          label="Value Type"
          value={formData.valueType}
          onChange={(e) => setFormData({ ...formData, valueType: e.target.value })}
          placeholder="string, number, boolean"
          fullWidth
        />
        <Input
          label="Sort Order"
          type="number"
          value={formData.sortOrder.toString()}
          onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          fullWidth
        />
      </div>
      <div className="pt-2">
        <Toggle
          checked={formData.isActive}
          onChange={(checked) => setFormData({ ...formData, isActive: checked })}
          label="Active Status"
          disabled={selectedSetting?.isSystemSetting}
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
            <Settings className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Label Settings
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Configure label printing settings and preferences ({totalCount} settings)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Setting
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Label Settings List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search settings..."
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
              data={settings}
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
        title="Add Label Setting"
        size="md"
      >
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddSetting} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {submitting ? 'Adding...' : 'Add Setting'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSetting(null);
          resetForm();
        }}
        title="Edit Label Setting"
        size="md"
      >
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedSetting(null);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSetting} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
