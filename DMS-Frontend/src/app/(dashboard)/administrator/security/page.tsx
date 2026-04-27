'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Shield, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { securityPoliciesApi, type SecurityPolicy, type CreateSecurityPolicyDto, type UpdateSecurityPolicyDto } from '@/lib/api/security-policies';
import toast from 'react-hot-toast';

export default function SecurityPage() {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    policyKey: '',
    policyName: '',
    description: '',
    category: 'Authentication',
    policyValue: '',
    valueType: 'String',
    isEnforced: true,
    isSystemPolicy: false,
    severityLevel: 'Medium',
    lastReviewedAt: undefined as string | undefined,
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadPolicies();
  }, [currentPage, pageSize, searchTerm]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await securityPoliciesApi.getAll(currentPage, pageSize, searchTerm, undefined, undefined);
      setPolicies(response.securityPolicies);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load security policies');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (policy: SecurityPolicy) => {
    try {
      const updateData: UpdateSecurityPolicyDto = {
        policyKey: policy.policyKey,
        policyName: policy.policyName,
        description: policy.description,
        category: policy.category,
        policyValue: policy.policyValue,
        valueType: policy.valueType,
        isEnforced: policy.isEnforced,
        isSystemPolicy: policy.isSystemPolicy,
        severityLevel: policy.severityLevel,
        lastReviewedAt: policy.lastReviewedAt,
        sortOrder: policy.sortOrder,
        isActive: !policy.isActive,
      };
      await securityPoliciesApi.update(policy.id, updateData);
      toast.success(`Security policy ${policy.isActive ? 'deactivated' : 'activated'}`);
      loadPolicies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update policy');
    }
  };

  const handleAddPolicy = async () => {
    if (!formData.policyKey || !formData.policyName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const createData: CreateSecurityPolicyDto = {
        policyKey: formData.policyKey,
        policyName: formData.policyName,
        description: formData.description,
        category: formData.category,
        policyValue: formData.policyValue,
        valueType: formData.valueType,
        isEnforced: formData.isEnforced,
        isSystemPolicy: formData.isSystemPolicy,
        severityLevel: formData.severityLevel,
        lastReviewedAt: formData.lastReviewedAt,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };
      await securityPoliciesApi.create(createData);
      toast.success('Security policy created successfully');
      setShowAddModal(false);
      resetForm();
      loadPolicies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create policy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPolicy = async () => {
    if (!selectedPolicy || !formData.policyKey || !formData.policyName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const updateData: UpdateSecurityPolicyDto = {
        policyKey: formData.policyKey,
        policyName: formData.policyName,
        description: formData.description,
        category: formData.category,
        policyValue: formData.policyValue,
        valueType: formData.valueType,
        isEnforced: formData.isEnforced,
        isSystemPolicy: formData.isSystemPolicy,
        severityLevel: formData.severityLevel,
        lastReviewedAt: formData.lastReviewedAt,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };
      await securityPoliciesApi.update(selectedPolicy.id, updateData);
      toast.success('Security policy updated successfully');
      setShowEditModal(false);
      setSelectedPolicy(null);
      resetForm();
      loadPolicies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update policy');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      policyKey: '',
      policyName: '',
      description: '',
      category: 'Authentication',
      policyValue: '',
      valueType: 'String',
      isEnforced: true,
      isSystemPolicy: false,
      severityLevel: 'Medium',
      lastReviewedAt: undefined,
      sortOrder: 0,
      isActive: true,
    });
  };

  const openEditModal = (policy: SecurityPolicy) => {
    setSelectedPolicy(policy);
    setFormData({
      policyKey: policy.policyKey,
      policyName: policy.policyName,
      description: policy.description || '',
      category: policy.category,
      policyValue: policy.policyValue || '',
      valueType: policy.valueType,
      isEnforced: policy.isEnforced,
      isSystemPolicy: policy.isSystemPolicy,
      severityLevel: policy.severityLevel,
      lastReviewedAt: policy.lastReviewedAt,
      sortOrder: policy.sortOrder,
      isActive: policy.isActive,
    });
    setShowEditModal(true);
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'neutral';
      default: return 'neutral';
    }
  };

  const columns = [
    {
      key: 'policyKey',
      label: 'Policy Key',
      render: (item: SecurityPolicy) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.policyKey}
        </span>
      ),
    },
    {
      key: 'policyName',
      label: 'Policy Name',
      render: (item: SecurityPolicy) => (
        <div>
          <span className="font-medium">{item.policyName}</span>
          {item.description && (
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {item.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (item: SecurityPolicy) => (
        <Badge variant="neutral" size="sm">{item.category}</Badge>
      ),
    },
    {
      key: 'severityLevel',
      label: 'Severity',
      render: (item: SecurityPolicy) => (
        <Badge variant={getSeverityColor(item.severityLevel)} size="sm">{item.severityLevel || 'N/A'}</Badge>
      ),
    },
    {
      key: 'isEnforced',
      label: 'Enforced',
      render: (item: SecurityPolicy) => (
        item.isEnforced ? <Badge variant="success" size="sm">Enforced</Badge> : <Badge variant="neutral" size="sm">Not Enforced</Badge>
      ),
    },
    {
      key: 'isSystemPolicy',
      label: 'Type',
      render: (item: SecurityPolicy) => (
        item.isSystemPolicy ? <Badge variant="info" size="sm">System</Badge> : <Badge variant="neutral" size="sm">Custom</Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: SecurityPolicy) => (
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
      render: (item: SecurityPolicy) => (
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
          label="Policy Key"
          value={formData.policyKey}
          onChange={(e) => setFormData({ ...formData, policyKey: e.target.value })}
          placeholder="e.g., password_min_length"
          fullWidth
          required
        />
        <Input
          label="Policy Name"
          value={formData.policyName}
          onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
          placeholder="Minimum Password Length"
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
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)' }}
          >
            <option value="Authentication">Authentication</option>
            <option value="Authorization">Authorization</option>
            <option value="Password">Password</option>
            <option value="Session">Session</option>
            <option value="DataProtection">Data Protection</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Value Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.valueType}
            onChange={(e) => setFormData({ ...formData, valueType: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)' }}
          >
            <option value="String">String</option>
            <option value="Number">Number</option>
            <option value="Boolean">Boolean</option>
            <option value="JSON">JSON</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Policy Value"
          value={formData.policyValue}
          onChange={(e) => setFormData({ ...formData, policyValue: e.target.value })}
          placeholder="e.g., 8 for min length"
          fullWidth
        />
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Severity Level
          </label>
          <select
            value={formData.severityLevel}
            onChange={(e) => setFormData({ ...formData, severityLevel: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)' }}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Last Reviewed At"
          type="date"
          value={formData.lastReviewedAt || ''}
          onChange={(e) => setFormData({ ...formData, lastReviewedAt: e.target.value || undefined })}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Toggle
          checked={formData.isEnforced}
          onChange={(checked) => setFormData({ ...formData, isEnforced: checked })}
          label="Enforced"
        />
        <Toggle
          checked={formData.isSystemPolicy}
          onChange={(checked) => setFormData({ ...formData, isSystemPolicy: checked })}
          label="System Policy"
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
            <Shield className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Security Policies
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage security policies and configuration settings ({totalCount} policies)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Policy
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Security Policies</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search policies..."
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
              data={policies}
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
        title="Add Security Policy"
        size="lg"
      >
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddPolicy} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {submitting ? 'Adding...' : 'Add Policy'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPolicy(null);
          resetForm();
        }}
        title="Edit Security Policy"
        size="lg"
      >
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedPolicy(null);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditPolicy} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
