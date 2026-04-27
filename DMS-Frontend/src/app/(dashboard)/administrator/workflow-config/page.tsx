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
import { workflowConfigsApi, type WorkflowConfig, type CreateWorkflowConfigDto, type UpdateWorkflowConfigDto } from '@/lib/api/workflow-configs';
import toast from 'react-hot-toast';

export default function WorkflowConfigPage() {
  const [workflowConfigs, setWorkflowConfigs] = useState<WorkflowConfig[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<WorkflowConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    entityType: 'Production',
    workflowType: 'Approval',
    requiresApproval: true,
    approvalLevels: 1,
    autoApproveThreshold: undefined as number | undefined,
    approvalSteps: '',
    notificationSettings: '',
    timeoutHours: 24,
    escalationConfig: '',
    isEnabled: true,
    isActive: true,
  });

  useEffect(() => {
    loadWorkflowConfigs();
  }, [currentPage, pageSize, searchTerm]);

  const loadWorkflowConfigs = async () => {
    try {
      setLoading(true);
      const response = await workflowConfigsApi.getAll(currentPage, pageSize, searchTerm, undefined, undefined);
      setWorkflowConfigs(response.workflowConfigs);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load workflow configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (config: WorkflowConfig) => {
    try {
      const updateData: UpdateWorkflowConfigDto = {
        code: config.code,
        name: config.name,
        description: config.description,
        entityType: config.entityType,
        workflowType: config.workflowType,
        requiresApproval: config.requiresApproval,
        approvalLevels: config.approvalLevels,
        autoApproveThreshold: config.autoApproveThreshold,
        approvalSteps: config.approvalSteps,
        notificationSettings: config.notificationSettings,
        timeoutHours: config.timeoutHours,
        escalationConfig: config.escalationConfig,
        isEnabled: config.isEnabled,
        isActive: !config.isActive,
      };
      await workflowConfigsApi.update(config.id, updateData);
      toast.success(`Workflow config ${config.isActive ? 'deactivated' : 'activated'}`);
      loadWorkflowConfigs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update workflow config');
    }
  };

  const handleAddConfig = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const createData: CreateWorkflowConfigDto = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        entityType: formData.entityType,
        workflowType: formData.workflowType,
        requiresApproval: formData.requiresApproval,
        approvalLevels: formData.approvalLevels,
        autoApproveThreshold: formData.autoApproveThreshold,
        approvalSteps: formData.approvalSteps,
        notificationSettings: formData.notificationSettings,
        timeoutHours: formData.timeoutHours,
        escalationConfig: formData.escalationConfig,
        isEnabled: formData.isEnabled,
        isActive: formData.isActive,
      };
      await workflowConfigsApi.create(createData);
      toast.success('Workflow configuration created successfully');
      setShowAddModal(false);
      resetForm();
      loadWorkflowConfigs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create workflow config');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditConfig = async () => {
    if (!selectedConfig || !formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const updateData: UpdateWorkflowConfigDto = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        entityType: formData.entityType,
        workflowType: formData.workflowType,
        requiresApproval: formData.requiresApproval,
        approvalLevels: formData.approvalLevels,
        autoApproveThreshold: formData.autoApproveThreshold,
        approvalSteps: formData.approvalSteps,
        notificationSettings: formData.notificationSettings,
        timeoutHours: formData.timeoutHours,
        escalationConfig: formData.escalationConfig,
        isEnabled: formData.isEnabled,
        isActive: formData.isActive,
      };
      await workflowConfigsApi.update(selectedConfig.id, updateData);
      toast.success('Workflow configuration updated successfully');
      setShowEditModal(false);
      setSelectedConfig(null);
      resetForm();
      loadWorkflowConfigs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update workflow config');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      entityType: 'Production',
      workflowType: 'Approval',
      requiresApproval: true,
      approvalLevels: 1,
      autoApproveThreshold: undefined,
      approvalSteps: '',
      notificationSettings: '',
      timeoutHours: 24,
      escalationConfig: '',
      isEnabled: true,
      isActive: true,
    });
  };

  const openEditModal = (config: WorkflowConfig) => {
    setSelectedConfig(config);
    setFormData({
      code: config.code,
      name: config.name,
      description: config.description || '',
      entityType: config.entityType,
      workflowType: config.workflowType,
      requiresApproval: config.requiresApproval,
      approvalLevels: config.approvalLevels,
      autoApproveThreshold: config.autoApproveThreshold,
      approvalSteps: config.approvalSteps || '',
      notificationSettings: config.notificationSettings || '',
      timeoutHours: config.timeoutHours,
      escalationConfig: config.escalationConfig || '',
      isEnabled: config.isEnabled,
      isActive: config.isActive,
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (item: WorkflowConfig) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Workflow Name',
      render: (item: WorkflowConfig) => (
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
      key: 'entityType',
      label: 'Entity Type',
      render: (item: WorkflowConfig) => (
        <Badge variant="neutral" size="sm">{item.entityType}</Badge>
      ),
    },
    {
      key: 'requiresApproval',
      label: 'Requires Approval',
      render: (item: WorkflowConfig) => (
        item.requiresApproval ? (
          <Badge variant="warning" size="sm">Yes ({item.approvalLevels} level{item.approvalLevels > 1 ? 's' : ''})</Badge>
        ) : (
          <Badge variant="neutral" size="sm">No</Badge>
        )
      ),
    },
    {
      key: 'isEnabled',
      label: 'Enabled',
      render: (item: WorkflowConfig) => (
        item.isEnabled ? <Badge variant="success" size="sm">Enabled</Badge> : <Badge variant="danger" size="sm">Disabled</Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: WorkflowConfig) => (
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
      render: (item: WorkflowConfig) => (
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
          label="Workflow Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., WF001"
          fullWidth
          required
        />
        <Input
          label="Workflow Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Production Approval"
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
            Entity Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.entityType}
            onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)' }}
          >
            <option value="Production">Production</option>
            <option value="Delivery">Delivery</option>
            <option value="Order">Order</option>
            <option value="Inventory">Inventory</option>
            <option value="Transfer">Transfer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Workflow Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.workflowType}
            onChange={(e) => setFormData({ ...formData, workflowType: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)' }}
          >
            <option value="Approval">Approval</option>
            <option value="Review">Review</option>
            <option value="Notification">Notification</option>
            <option value="Sequential">Sequential</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Approval Levels"
          type="number"
          value={formData.approvalLevels.toString()}
          onChange={(e) => setFormData({ ...formData, approvalLevels: parseInt(e.target.value) || 1 })}
          fullWidth
          required
        />
        <Input
          label="Auto Approve Threshold"
          type="number"
          step="0.01"
          value={formData.autoApproveThreshold?.toString() || ''}
          onChange={(e) => setFormData({ ...formData, autoApproveThreshold: e.target.value ? parseFloat(e.target.value) : undefined })}
          fullWidth
        />
        <Input
          label="Timeout (Hours)"
          type="number"
          value={formData.timeoutHours?.toString() || ''}
          onChange={(e) => setFormData({ ...formData, timeoutHours: e.target.value ? parseInt(e.target.value) : undefined })}
          fullWidth
        />
      </div>
      <Input
        label="Approval Steps (JSON)"
        value={formData.approvalSteps}
        onChange={(e) => setFormData({ ...formData, approvalSteps: e.target.value })}
        placeholder='[{"step": 1, "role": "Manager"}]'
        fullWidth
      />
      <Input
        label="Notification Settings (JSON)"
        value={formData.notificationSettings}
        onChange={(e) => setFormData({ ...formData, notificationSettings: e.target.value })}
        placeholder='{"email": true, "sms": false}'
        fullWidth
      />
      <Input
        label="Escalation Config (JSON)"
        value={formData.escalationConfig}
        onChange={(e) => setFormData({ ...formData, escalationConfig: e.target.value })}
        placeholder='{"escalateTo": "Admin", "afterHours": 48}'
        fullWidth
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Toggle
          checked={formData.requiresApproval}
          onChange={(checked) => setFormData({ ...formData, requiresApproval: checked })}
          label="Requires Approval"
        />
        <Toggle
          checked={formData.isEnabled}
          onChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
          label="Enabled"
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
            Workflow Configuration
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage workflow configurations and approval processes ({totalCount} workflows)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Workflow
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Workflow Configurations</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search workflows..."
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
              data={workflowConfigs}
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
        title="Add Workflow Configuration"
        size="lg"
      >
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddConfig} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {submitting ? 'Adding...' : 'Add Workflow'}
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
        title="Edit Workflow Configuration"
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
          <Button variant="primary" onClick={handleEditConfig} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
