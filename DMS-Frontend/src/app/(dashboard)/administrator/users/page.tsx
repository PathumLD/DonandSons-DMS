'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Users, Plus, Search, Edit, X, Check, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usersApi, type User, type CreateUserRequest, type UpdateUserRequest } from '@/lib/api/users';
import { rolesApi, type Role } from '@/lib/api/roles';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roleIds: [] as string[],
    phone: '',
    password: '',
    confirmPassword: '',
    isActive: true,
  });

  // Fetch users from API
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [currentPage, pageSize, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll(currentPage, pageSize, searchTerm);
      setUsers(response.users);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await rolesApi.getAll(1, 100, '', true);
      setRoles(response.roles);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleToggleActive = async (user: User) => {
    try {
      const updateData: UpdateUserRequest = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isActive: !user.isActive,
      };
      await usersApi.update(user.id, updateData);
      await loadUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleAddUser = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      const createData: CreateUserRequest = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        password: formData.password,
        isActive: formData.isActive,
        roleIds: formData.roleIds,
      };
      await usersApi.create(createData);
      setShowAddModal(false);
      resetForm();
      await loadUsers();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      alert(error.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      const updateData: UpdateUserRequest = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        isActive: formData.isActive,
      };
      await usersApi.update(selectedUser.id, updateData);
      
      // Update roles if changed
      if (formData.roleIds.length > 0) {
        await usersApi.assignRoles(selectedUser.id, formData.roleIds);
      }

      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      await loadUsers();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      alert(error.response?.data?.error?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      await usersApi.resetPassword(selectedUser.id, formData.password);
      setShowResetPasswordModal(false);
      setSelectedUser(null);
      resetForm();
      alert('Password reset successfully');
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      alert(error.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      roleIds: [],
      phone: '',
      password: '',
      confirmPassword: '',
      isActive: true,
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleIds: user.roles.map(r => r.id),
      phone: user.phone || '',
      password: '',
      confirmPassword: '',
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  const openResetPasswordModal = (user: User) => {
    setSelectedUser(user);
    resetForm();
    setShowResetPasswordModal(true);
  };

  const columns = [
    {
      key: 'fullName',
      label: 'User Name',
      render: (item: User) => (
        <div>
          <div className="font-medium" style={{ color: 'var(--foreground)' }}>
            <Users className="w-4 h-4 inline-block mr-2" style={{ color: 'var(--muted-foreground)' }} />
            {item.fullName}
          </div>
          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.email}</div>
        </div>
      ),
    },
    {
      key: 'roles',
      label: 'User Roles',
      render: (item: User) => (
        <div className="flex flex-wrap gap-1">
          {item.roles.map(role => (
            <Badge key={role.id} variant="info" size="sm">{role.name}</Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: User) => (
        <Badge variant={item.isActive ? 'success' : 'danger'} size="sm">
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (item: User) => (
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
            onClick={() => openResetPasswordModal(item)}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: '#F59E0B', backgroundColor: '#FEF3C7' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDE68A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEF3C7'}
            title="Reset Password"
          >
            <Key className="w-4 h-4" />
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

  const renderUserForm = (isEdit = false) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          placeholder="John"
          fullWidth
          required
        />
        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          placeholder="Doe"
          fullWidth
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@donandson.com"
          fullWidth
          required
        />
        <Input
          label="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="077-1234567"
          fullWidth
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          Roles
        </label>
        <div className="space-y-2">
          {roles.map(role => (
            <label key={role.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.roleIds.includes(role.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, roleIds: [...formData.roleIds, role.id] });
                  } else {
                    setFormData({ ...formData, roleIds: formData.roleIds.filter(id => id !== role.id) });
                  }
                }}
                className="rounded"
              />
              <span>{role.name}</span>
            </label>
          ))}
        </div>
      </div>

      {!isEdit && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            fullWidth
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="••••••••"
            fullWidth
            required
          />
        </div>
      )}

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
            <Users className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Users & User Roles
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage system users, assign roles and capabilities. Only Admin can create users.
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
              <Badge variant="danger" size="sm">Users</Badge>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {loading ? 'Loading...' : `Showing ${((currentPage - 1) * pageSize) + 1} to ${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} entries`}
              </span>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search users..."
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
              Loading users...
            </div>
          ) : (
            <DataTable
              data={users}
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

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        size="lg"
      >
        {renderUserForm(false)}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddUser} disabled={submitting}>
            <Plus className="w-4 h-4 mr-2" />
            {submitting ? 'Adding...' : 'Add User'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
          resetForm();
        }}
        title="Edit User"
        size="lg"
      >
        {renderUserForm(true)}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditUser} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setSelectedUser(null);
          resetForm();
        }}
        title="Reset Password"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Reset password for <strong>{selectedUser.fullName}</strong> (@{selectedUser.username})
            </p>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="New Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                fullWidth
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                fullWidth
                required
              />
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowResetPasswordModal(false);
            setSelectedUser(null);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleResetPassword} disabled={submitting}>
            <Key className="w-4 h-4 mr-2" />
            {submitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
