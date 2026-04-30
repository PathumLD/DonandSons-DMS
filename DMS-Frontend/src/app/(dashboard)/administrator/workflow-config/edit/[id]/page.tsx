'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { ArrowLeft, Save } from 'lucide-react';
import { workflowConfigsApi, type UpdateWorkflowConfigDto } from '@/lib/api/workflow-configs';
import toast from 'react-hot-toast';

export default function EditWorkflowConfigPage() {
  const router = useRouter();
  const params = useParams();
  const configId = params.id as string;
  
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
    loadWorkflowConfig();
  }, [configId]);

  const loadWorkflowConfig = async () => {
    try {
      setLoading(true);
      const config = await workflowConfigsApi.getById(configId);
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
        timeoutHours: config.timeoutHours || 24,
        escalationConfig: config.escalationConfig || '',
        isEnabled: config.isEnabled,
        isActive: config.isActive,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load workflow config');
      router.push('/administrator/workflow-config');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name) {
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
      await workflowConfigsApi.update(configId, updateData);
      toast.success('Workflow configuration updated successfully');
      router.push('/administrator/workflow-config');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update workflow config');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p style={{ color: 'var(--muted-foreground)' }}>Loading workflow config...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Edit Workflow Configuration</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Update workflow configuration and approval process
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setFormData({ ...formData, timeoutHours: e.target.value ? parseInt(e.target.value) : 24 })}
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

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
