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
import { gridConfigurationsApi, type GridConfiguration, type CreateGridConfigurationDto, type UpdateGridConfigurationDto } from '@/lib/api/grid-configurations';
import toast from 'react-hot-toast';

export default function GridConfigurationPage() {
  const [configurations, setConfigurations] = useState<GridConfiguration[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<GridConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    gridName: '',
    userId: undefined as string | undefined,
    configurationName: '',
    columnSettings: '',
    sortSettings: '',
    filterSettings: '',
    pageSize: 50,
    isDefault: false,
    isShared: false,
    isActive: true,
  });

  useEffect(() => {
    loadConfigurations();
  }, [currentPage, pageSize, searchTerm]);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const response = await gridConfigurationsApi.getAll(currentPage, pageSize, searchTerm, undefined, undefined);
      setConfigurations(response.gridConfigurations);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load grid configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (config: GridConfiguration) => {
    try {
      const updateData: UpdateGridConfigurationDto = {
        gridName: config.gridName,
        userId: config.userId,
        configurationName: config.configurationName,
        columnSettings: config.columnSettings,
        sortSettings: config.sortSettings,
        filterSettings: config.filterSettings,
        pageSize: config.pageSize,
        isDefault: config.isDefault,
        isShared: config.isShared,
        isActive: !config.isActive,
      };
      await gridConfigurationsApi.update(config.id, updateData);
      toast.success(`Configuration ${config.isActive ? 'deactivated' : 'activated'}`);
      loadConfigurations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update configuration');
    }
  };

  const handleAddConfiguration = async () => {
    if (!formData.gridName || !formData.configurationName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const createData: CreateGridConfigurationDto = {
        gridName: formData.gridName,
        userId: formData.userId,
        configurationName: formData.configurationName,
        columnSettings: formData.columnSettings,
        sortSettings: formData.sortSettings,
        filterSettings: formData.filterSettings,
        pageSize: formData.pageSize,
        isDefault: formData.isDefault,
        isShared: formData.isShared,
        isActive: formData.isActive,
      };
      await gridConfigurationsApi.create(createData);
      toast.success('Grid configuration created successfully');
      setShowAddModal(false);
      resetForm();
      loadConfigurations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create configuration');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditConfiguration = async () => {
    if (!selectedConfig || !formData.gridName || !formData.configurationName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const updateData: UpdateGridConfigurationDto = {
        gridName: formData.gridName,
        userId: formData.userId,
        configurationName: formData.configurationName,
        columnSettings: formData.columnSettings,
        sortSettings: formData.sortSettings,
        filterSettings: formData.filterSettings,
        pageSize: formData.pageSize,
        isDefault: formData.isDefault,
        isShared: formData.isShared,
        isActive: formData.isActive,
      };
      await gridConfigurationsApi.update(selectedConfig.id, updateData);
      toast.success('Grid configuration updated successfully');
      setShowEditModal(false);
      setSelectedConfig(null);
      resetForm();
      loadConfigurations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update configuration');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      gridName: '',
      userId: undefined,
      configurationName: '',
      columnSettings: '',
      sortSettings: '',
      filterSettings: '',
      pageSize: 50,
      isDefault: false,
      isShared: false,
      isActive: true,
    });
  };

  const openEditModal = (config: GridConfiguration) => {
    setSelectedConfig(config);
    setFormData({
      gridName: config.gridName,
      userId: config.userId,
      configurationName: config.configurationName || '',
      columnSettings: config.columnSettings || '',
      sortSettings: config.sortSettings || '',
      filterSettings: config.filterSettings || '',
      pageSize: config.pageSize || 50,
      isDefault: config.isDefault,
      isShared: config.isShared,
      isActive: config.isActive,
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'gridName',
      label: 'Grid Name',
      render: (item: GridConfiguration) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.gridName}
        </span>
      ),
    },
    {
      key: 'configurationName',
      label: 'Configuration Name',
      render: (item: GridConfiguration) => (
        <span className="font-medium">{item.configurationName || '-'}</span>
      ),
    },
    {
      key: 'pageSize',
      label: 'Page Size',
      render: (item: GridConfiguration) => (
        <Badge variant="neutral" size="sm">{item.pageSize || 50}</Badge>
      ),
    },
    {
      key: 'userId',
      label: 'User Specific',
      render: (item: GridConfiguration) => (
        item.userId ? <Badge variant="info" size="sm">User</Badge> : <Badge variant="neutral" size="sm">Global</Badge>
      ),
    },
    {
      key: 'isDefault',
      label: 'Default',
      render: (item: GridConfiguration) => (
        item.isDefault ? <Badge variant="info" size="sm">Default</Badge> : null
      ),
    },
    {
      key: 'isShared',
      label: 'Shared',
      render: (item: GridConfiguration) => (
        item.isShared ? <Badge variant="success" size="sm">Shared</Badge> : null
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: GridConfiguration) => (
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
      render: (item: GridConfiguration) => (
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
          label="Grid Name"
          value={formData.gridName}
          onChange={(e) => setFormData({ ...formData, gridName: e.target.value })}
          placeholder="e.g., OrderGrid, ProductGrid"
          fullWidth
          required
        />
        <Input
          label="Configuration Name"
          value={formData.configurationName}
          onChange={(e) => setFormData({ ...formData, configurationName: e.target.value })}
          placeholder="My Custom View"
          fullWidth
          required
        />
      </div>
      <Input
        label="User ID (Optional)"
        value={formData.userId || ''}
        onChange={(e) => setFormData({ ...formData, userId: e.target.value || undefined })}
        placeholder="Leave empty for global configuration"
        fullWidth
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Page Size"
          type="number"
          value={formData.pageSize.toString()}
          onChange={(e) => setFormData({ ...formData, pageSize: parseInt(e.target.value) || 50 })}
          fullWidth
        />
      </div>
      <Input
        label="Column Settings (JSON)"
        value={formData.columnSettings}
        onChange={(e) => setFormData({ ...formData, columnSettings: e.target.value })}
        placeholder='{"visible": ["col1", "col2"], "widths": {"col1": 100}}'
        fullWidth
      />
      <Input
        label="Sort Settings (JSON)"
        value={formData.sortSettings}
        onChange={(e) => setFormData({ ...formData, sortSettings: e.target.value })}
        placeholder='{"field": "name", "direction": "asc"}'
        fullWidth
      />
      <Input
        label="Filter Settings (JSON)"
        value={formData.filterSettings}
        onChange={(e) => setFormData({ ...formData, filterSettings: e.target.value })}
        placeholder='{"category": "bakery", "status": "active"}'
        fullWidth
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Toggle
          checked={formData.isDefault}
          onChange={(checked) => setFormData({ ...formData, isDefault: checked })}
          label="Set as Default"
        />
        <Toggle
          checked={formData.isShared}
          onChange={(checked) => setFormData({ ...formData, isShared: checked })}
          label="Shared Configuration"
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
            Grid Configuration
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage saved grid configurations, views, and preferences ({totalCount} configurations)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Configuration
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Grid Configurations</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search configurations..."
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
              data={configurations}
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
        title="Add Grid Configuration"
        size="lg"
      >
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddConfiguration} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {submitting ? 'Adding...' : 'Add Configuration'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedConfig(null);
          resetForm();
        }}
        title="Edit Grid Configuration"
        size="lg"
      >
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedConfig(null);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditConfiguration} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
