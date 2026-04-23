'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Users, Plus, Search, Edit, X, Check, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockUsers, mockRoles, type User } from '@/lib/mock-data/users';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    roleId: '',
    phone: '',
    password: '',
    confirmPassword: '',
    active: true,
  });

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleActive = (id: number) => {
    setUsers(users.map(u =>
      u.id === id ? { ...u, active: !u.active } : u
    ));
  };

  const handleAddUser = () => {
    const newUser: User = {
      id: Math.max(...users.map(u => u.id)) + 1,
      username: formData.username,
      fullName: formData.fullName,
      email: formData.email,
      roleId: Number(formData.roleId),
      role: mockRoles.find(r => r.id === Number(formData.roleId))?.name || '',
      phone: formData.phone,
      active: formData.active,
    };
    setUsers([newUser, ...users]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditUser = () => {
    if (selectedUser) {
      setUsers(users.map(u =>
        u.id === selectedUser.id
          ? {
              ...u,
              username: formData.username,
              fullName: formData.fullName,
              email: formData.email,
              roleId: Number(formData.roleId),
              role: mockRoles.find(r => r.id === Number(formData.roleId))?.name || '',
              phone: formData.phone,
              active: formData.active,
            }
          : u
      ));
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      roleId: '',
      phone: '',
      password: '',
      confirmPassword: '',
      active: true,
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      roleId: String(user.roleId),
      phone: user.phone,
      password: '',
      confirmPassword: '',
      active: user.active,
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'username',
      label: 'User Name',
      render: (item: User) => (
        <span className="font-medium" style={{ color: 'var(--foreground)' }}>
          <Users className="w-4 h-4 inline-block mr-2" style={{ color: 'var(--muted-foreground)' }} />
          {item.username}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'User Role',
      render: (item: User) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.role}</span>
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
            onClick={() => handleToggleActive(item.id)}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: '#DC2626', backgroundColor: '#FEF2F2' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
            title={item.active ? 'Delete' : 'Restore'}
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
          label="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="username"
          fullWidth
          required
          disabled={isEdit}
        />
        <Input
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Full name"
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
          required
        />
      </div>

      <Select
        label="Role"
        value={formData.roleId}
        onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
        options={mockRoles.filter(r => r.active).map(r => ({ value: r.id, label: r.name }))}
        placeholder="Select role"
        fullWidth
        required
      />

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
          checked={formData.active}
          onChange={(checked) => setFormData({ ...formData, active: checked })}
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
                Showing 1 to 10 of 57 entries
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
          <DataTable
            data={paginatedUsers}
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
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddUser}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
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
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditUser}>
            Save Changes
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
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            console.log('Resetting password for:', selectedUser);
            setShowResetPasswordModal(false);
            setSelectedUser(null);
            resetForm();
          }}>
            <Key className="w-4 h-4 mr-2" />
            Reset Password
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
