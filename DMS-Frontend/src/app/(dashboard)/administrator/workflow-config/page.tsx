'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Settings, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { workflowConfigsApi, type WorkflowConfig, type UpdateWorkflowConfigDto } from '@/lib/api/workflow-configs';
import toast from 'react-hot-toast';

export default function WorkflowConfigPage() {
  const router = useRouter();
  const [workflowConfigs, setWorkflowConfigs] = useState<WorkflowConfig[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

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
            onClick={() => router.push(`/administrator/workflow-config/edit/${item.id}`)}
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
        <Button variant="primary" size="md" onClick={() => router.push('/administrator/workflow-config/add')}>
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
    </div>
  );
}
