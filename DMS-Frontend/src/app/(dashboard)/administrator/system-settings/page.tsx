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
import { systemSettingsApi, type SystemSetting, type CreateSystemSettingDto, type UpdateSystemSettingDto } from '@/lib/api/system-settings';
import toast from 'react-hot-toast';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    settingKey: '',
    settingName: '',
    settingValue: '',
    settingType: 'String',
    description: '',
    category: 'General',
    isSystemSetting: false,
    isEncrypted: false,
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadSettings();
  }, [currentPage, pageSize, searchTerm]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await systemSettingsApi.getAll(currentPage, pageSize, undefined, searchTerm, undefined);
      setSettings(response.settings);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (setting: SystemSetting) => {
    try {
      const updateData: UpdateSystemSettingDto = {
        settingKey: setting.settingKey,
        settingName: setting.settingName,
        settingValue: setting.settingValue,
        settingType: setting.settingType,
        description: setting.description,
        category: setting.category,
        isSystemSetting: setting.isSystemSetting,
        isEncrypted: setting.isEncrypted,
        displayOrder: setting.displayOrder,
        isActive: !setting.isActive,
      };
      await systemSettingsApi.update(setting.id, updateData);
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
      const createData: CreateSystemSettingDto = {
        settingKey: formData.settingKey,
        settingName: formData.settingName,
        settingValue: formData.settingValue,
        settingType: formData.settingType,
        description: formData.description,
        category: formData.category,
        isSystemSetting: formData.isSystemSetting,
        isEncrypted: formData.isEncrypted,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      };
      await systemSettingsApi.create(createData);
      toast.success('System setting created successfully');
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
      const updateData: UpdateSystemSettingDto = {
        settingKey: formData.settingKey,
        settingName: formData.settingName,
        settingValue: formData.settingValue,
        settingType: formData.settingType,
        description: formData.description,
        category: formData.category,
        isSystemSetting: formData.isSystemSetting,
        isEncrypted: formData.isEncrypted,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      };
      await systemSettingsApi.update(selectedSetting.id, updateData);
      toast.success('System setting updated successfully');
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
      settingType: 'String',
      description: '',
      category: 'General',
      isSystemSetting: false,
      isEncrypted: false,
      displayOrder: 0,
      isActive: true,
    });
  };

  const openEditModal = (setting: SystemSetting) => {
    setSelectedSetting(setting);
    setFormData({
      settingKey: setting.settingKey,
      settingName: setting.settingName,
      settingValue: setting.settingValue || '',
      settingType: setting.settingType,
      description: setting.description || '',
      category: setting.category || 'General',
      isSystemSetting: setting.isSystemSetting,
      isEncrypted: setting.isEncrypted,
      displayOrder: setting.displayOrder,
      isActive: setting.isActive,
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'settingKey',
      label: 'Setting Key',
      render: (item: SystemSetting) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.settingKey}
        </span>
      ),
    },
    {
      key: 'settingName',
      label: 'Setting Name',
      render: (item: SystemSetting) => (
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
      render: (item: SystemSetting) => (
        <span className="text-sm font-mono">{item.isEncrypted ? '********' : (item.settingValue || '-')}</span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (item: SystemSetting) => (
        <Badge variant="neutral" size="sm">{item.category || 'General'}</Badge>
      ),
    },
    {
      key: 'isSystemSetting',
      label: 'Type',
      render: (item: SystemSetting) => (
        item.isSystemSetting ? <Badge variant="warning" size="sm">System</Badge> : <Badge variant="neutral" size="sm">Custom</Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: SystemSetting) => (
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
      render: (item: SystemSetting) => (
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
          label="Setting Key"
          value={formData.settingKey}
          onChange={(e) => setFormData({ ...formData, settingKey: e.target.value })}
          placeholder="e.g., app.session_timeout"
          fullWidth
          required
        />
        <Input
          label="Setting Name"
          value={formData.settingName}
          onChange={(e) => setFormData({ ...formData, settingName: e.target.value })}
          placeholder="Session Timeout"
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
            Setting Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.settingType}
            onChange={(e) => setFormData({ ...formData, settingType: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)' }}
          >
            <option value="String">String</option>
            <option value="Number">Number</option>
            <option value="Boolean">Boolean</option>
            <option value="JSON">JSON</option>
            <option value="Password">Password</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)' }}
          >
            <option value="General">General</option>
            <option value="Security">Security</option>
            <option value="Email">Email</option>
            <option value="Database">Database</option>
            <option value="API">API</option>
          </select>
        </div>
      </div>
      <Input
        label="Setting Value"
        value={formData.settingValue}
        onChange={(e) => setFormData({ ...formData, settingValue: e.target.value })}
        placeholder="Setting value"
        fullWidth
      />
      <Input
        label="Display Order"
        type="number"
        value={formData.displayOrder.toString()}
        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
        fullWidth
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Toggle
          checked={formData.isSystemSetting}
          onChange={(checked) => setFormData({ ...formData, isSystemSetting: checked })}
          label="System Setting"
        />
        <Toggle
          checked={formData.isEncrypted}
          onChange={(checked) => setFormData({ ...formData, isEncrypted: checked })}
          label="Encrypted"
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
            <Settings className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            System Settings
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage system-wide configuration settings ({totalCount} settings)
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
            <CardTitle>System Settings</CardTitle>
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
        title="Add System Setting"
        size="lg"
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
        title="Edit System Setting"
        size="lg"
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
