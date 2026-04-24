'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Shield, Plus, Search, Edit, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { rolesApi, type Role, type CreateRoleRequest, type UpdateRoleRequest } from '@/lib/api/roles';
import { permissionsApi, type Permission } from '@/lib/api/permissions';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    permissionIds: [] as string[],
  });

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, [currentPage, pageSize, searchTerm]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await rolesApi.getAll(currentPage, pageSize, searchTerm);
      setRoles(response.roles);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const perms = await permissionsApi.getAll(true);
      setPermissions(perms);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleToggleActive = async (role: Role) => {
    try {
      const updateData: UpdateRoleRequest = {
        name: role.name,
        description: role.description,
        isActive: !role.isActive,
      };
      await rolesApi.update(role.id, updateData);
      await loadRoles();
    } catch (error: any) {
      console.error('Failed to toggle role status:', error);
      alert(error.response?.data?.error?.message || 'Failed to update role status');
    }
  };

  const handleAddRole = async () => {
    try {
      setSubmitting(true);
      const createData: CreateRoleRequest = {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        permissionIds: formData.permissionIds,
      };
      await rolesApi.create(createData);
      setShowAddModal(false);
      resetForm();
      await loadRoles();
    } catch (error: any) {
      console.error('Failed to create role:', error);
      alert(error.response?.data?.error?.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;

    try {
      setSubmitting(true);
      const updateData: UpdateRoleRequest = {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
      };
      await rolesApi.update(selectedRole.id, updateData);

      if (formData.permissionIds.length > 0) {
        await rolesApi.assignPermissions(selectedRole.id, formData.permissionIds);
      }

      setShowEditModal(false);
      setSelectedRole(null);
      resetForm();
      await loadRoles();
    } catch (error: any) {
      console.error('Failed to update role:', error);
      alert(error.response?.data?.error?.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true,
      permissionIds: [],
    });
  };

  const openEditModal = async (role: Role) => {
    setSelectedRole(role);
    
    // Fetch full role details with permissions
    try {
      const fullRole = await rolesApi.getById(role.id);
      setFormData({
        name: fullRole.name,
        description: fullRole.description,
        isActive: fullRole.isActive,
        permissionIds: fullRole.permissions?.map(p => p.id) || [],
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Failed to load role details:', error);
      alert('Failed to load role details');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Role Name',
      render: (item: Role) => (
        <div>
          <div className="font-medium" style={{ color: 'var(--foreground)' }}>
            <Shield className="w-4 h-4 inline-block mr-2" style={{ color: 'var(--muted-foreground)' }} />
            {item.name}
          </div>
          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.description}</div>
        </div>
      ),
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (item: Role) => (
        <Badge variant="info" size="sm">{item.permissionCount || 0} permissions</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Role) => (
        <Badge variant={item.isActive ? 'success' : 'danger'} size="sm">
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (item: Role) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: '#3B82F6', backgroundColor: '#EFF6FF' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleActive(item)}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: '#DC2626', backgroundColor: '#FEF2F2' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
            title={item.isActive ? 'Deactivate' : 'Activate'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const renderRoleForm = () => (
    <div className="space-y-4">
      <Input
        label="Role Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g., Sales Manager, Production Manager"
        fullWidth
        required
      />
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Brief description of role"
        fullWidth
      />
      
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          Permissions
        </label>
        <div className="max-h-64 overflow-y-auto space-y-2 p-2 rounded-lg" style={{ border: '1px solid var(--input)' }}>
          {permissions.map(perm => (
            <label key={perm.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.permissionIds.includes(perm.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, permissionIds: [...formData.permissionIds, perm.id] });
                  } else {
                    setFormData({ ...formData, permissionIds: formData.permissionIds.filter(id => id !== perm.id) });
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">
                <strong>{perm.code}</strong> - {perm.description}
              </span>
            </label>
          ))}
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            <Shield className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Roles & Capabilities
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage user roles, capabilities and permission groups. Only Admin can create and assign.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="danger" size="sm">Roles and Capabilities</Badge>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search roles..."
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
            <div className="p-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
              Loading roles...
            </div>
          ) : (
            <DataTable
              data={roles}
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

      {/* Add Role Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Role"
        size="md"
      >
        {renderRoleForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddRole} disabled={submitting}>
            <Plus className="w-4 h-4 mr-2" />
            {submitting ? 'Adding...' : 'Add Role'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRole(null);
          resetForm();
        }}
        title="Edit Role"
        size="md"
      >
        {renderRoleForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedRole(null);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditRole} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
