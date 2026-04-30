'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Shield, Plus, Search, Edit, X, Key, Users, ChevronDown, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usersApi, type User, type UpdateUserRequest } from '@/lib/api/users';
import { rolesApi, type Role, type UpdateRoleRequest } from '@/lib/api/roles';
import { permissionsApi, type Permission, type PermissionsByModule } from '@/lib/api/permissions';
import toast from 'react-hot-toast';

interface ModulePermissions {
  module: string;
  view: Permission[];
  create: Permission[];
  update: Permission[];
  delete: Permission[];
}

type PermissionScope = 'all' | 'team' | 'own' | 'none';

type TabType = 'users' | 'permissions';

export default function SecurityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'users');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersTotalCount, setUsersTotalCount] = useState(0);
  const [usersSearchTerm, setUsersSearchTerm] = useState('');
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(10);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesTotalCount, setRolesTotalCount] = useState(0);
  const [rolesSearchTerm, setRolesSearchTerm] = useState('');
  const [rolesCurrentPage, setRolesCurrentPage] = useState(1);
  const [rolesPageSize, setRolesPageSize] = useState(10);

  // Permissions state
  const [permissionsRoles, setPermissionsRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [groupedPermissions, setGroupedPermissions] = useState<PermissionsByModule[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update URL when tab changes. The "permissions" tab now redirects to the
  // dedicated /administrator/permissions page (which uses the canonical
  // sidebar-driven matrix UI with full View/Create/Edit/Delete/Approve/Reject
  // support). Keeping a thin redirect here so existing bookmarks still work.
  const handleTabChange = (tab: TabType) => {
    if (tab === 'permissions') {
      router.replace('/administrator/permissions');
      return;
    }
    setActiveTab(tab);
    router.push(`/administrator/security?tab=${tab}`, { scroll: false });
  };

  // Auto-redirect if user lands here with ?tab=permissions
  useEffect(() => {
    if (tabParam === 'permissions') {
      router.replace('/administrator/permissions');
    }
  }, [tabParam, router]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'permissions') {
      loadPermissionsData();
    }
  }, [activeTab, usersCurrentPage, usersPageSize, usersSearchTerm]);

  useEffect(() => {
    if (selectedRole && activeTab === 'permissions') {
      loadRolePermissions();
    }
  }, [selectedRole]);

  // Users functions
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await usersApi.getAll(usersCurrentPage, usersPageSize, usersSearchTerm);
      setUsers(response.users);
      setUsersTotalCount(response.totalCount);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleToggleUserActive = async (user: User) => {
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

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setUserSubmitting(true);
      await usersApi.resetPassword(selectedUser.id, resetPasswordData.password);
      setShowResetPasswordModal(false);
      setSelectedUser(null);
      setResetPasswordData({ password: '', confirmPassword: '' });
      alert('Password reset successfully');
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      alert(error.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setUserSubmitting(false);
    }
  };

  const openResetPasswordModal = (user: User) => {
    setSelectedUser(user);
    setResetPasswordData({ password: '', confirmPassword: '' });
    setShowResetPasswordModal(true);
  };

  // Roles functions
  const loadRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await rolesApi.getAll(rolesCurrentPage, rolesPageSize, rolesSearchTerm);
      setRoles(response.roles);
      setRolesTotalCount(response.totalCount);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleToggleRoleActive = async (role: Role) => {
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

  // Permissions functions
  const loadPermissionsData = async () => {
    try {
      setPermissionsLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        rolesApi.getAll(1, 100, '', true),
        permissionsApi.getGroupedByModule(true)
      ]);
      setPermissionsRoles(rolesData.roles);
      setGroupedPermissions(permissionsData);
      if (rolesData.roles.length > 0 && !selectedRole) {
        setSelectedRole(rolesData.roles[0]);
      }
    } catch (error) {
      console.error('Failed to load permissions data:', error);
      toast.error('Failed to load roles and permissions');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const loadRolePermissions = async () => {
    if (!selectedRole) return;
    try {
      const roleDetails = await rolesApi.getById(selectedRole.id);
      const permissionIds = new Set(roleDetails.permissions?.map(p => p.id) || []);
      setRolePermissions(permissionIds);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load role permissions:', error);
      toast.error('Failed to load role permissions');
    }
  };

  const organizedPermissions: ModulePermissions[] = (() => {
    const modules = new Map<string, ModulePermissions>();
    
    groupedPermissions.forEach(group => {
      if (!modules.has(group.module)) {
        modules.set(group.module, {
          module: group.module,
          view: [],
          create: [],
          update: [],
          delete: []
        });
      }
      
      const modulePerms = modules.get(group.module)!;
      group.permissions.forEach(perm => {
        const code = perm.code.toLowerCase();
        if (code.includes('.view') || code.includes('.read')) {
          modulePerms.view.push(perm);
        } else if (code.includes('.create') || code.includes('.add')) {
          modulePerms.create.push(perm);
        } else if (code.includes('.update') || code.includes('.edit')) {
          modulePerms.update.push(perm);
        } else if (code.includes('.delete') || code.includes('.remove')) {
          modulePerms.delete.push(perm);
        } else {
          modulePerms.view.push(perm);
        }
      });
    });
    
    return Array.from(modules.values()).sort((a, b) => a.module.localeCompare(b.module));
  })();

  const toggleAllInModule = (permissions: Permission[], checked: boolean) => {
    setRolePermissions(prev => {
      const next = new Set(prev);
      permissions.forEach(p => {
        if (checked) {
          next.add(p.id);
        } else {
          next.delete(p.id);
        }
      });
      return next;
    });
    setHasChanges(true);
  };

  const isAllChecked = (permissions: Permission[]) => {
    return permissions.length > 0 && permissions.every(p => rolePermissions.has(p.id));
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      await rolesApi.assignPermissions(selectedRole.id, Array.from(rolePermissions));
      toast.success('Permissions updated successfully');
      setHasChanges(false);
    } catch (error: any) {
      console.error('Failed to save permissions:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  // Columns for users table
  const usersColumns = [
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
      label: 'User Role',
      render: (item: User) => (
        <div className="flex flex-wrap gap-1">
          {item.roles.map(role => (
            <Badge key={role.id} variant="info" size="sm">{role.name}</Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (item: User) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => router.push(`/administrator/users/edit/${item.id}`)}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openResetPasswordModal(item)}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title="Reset Password"
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleUserActive(item)}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title={item.isActive ? 'Deactivate' : 'Activate'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Columns for roles table
  const rolesColumns = [
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
      key: 'actions',
      label: '',
      render: (item: Role) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => router.push(`/administrator/roles/edit/${item.id}`)}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleRoleActive(item)}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title={item.isActive ? 'Deactivate' : 'Activate'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const usersTotalPages = Math.ceil(usersTotalCount / usersPageSize);
  const rolesTotalPages = Math.ceil(rolesTotalCount / rolesPageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            <Shield className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Users & User Roles
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {activeTab === 'users'
              ? 'Manage system users, assign roles and capabilities. Only Admin can create users.'
              : 'Configure which menus and actions each role can access. Read = menu visibility.'}
          </p>
        </div>
        {activeTab === 'users' && (
          <Button variant="primary" size="md" onClick={() => router.push('/administrator/users/add')}>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ borderBottom: '2px solid var(--border)' }}>
        <button
          onClick={() => handleTabChange('users')}
          className="px-4 py-2 font-medium transition-colors"
          style={{
            color: activeTab === 'users' ? '#C8102E' : 'var(--muted-foreground)',
            borderBottom: activeTab === 'users' ? '2px solid #C8102E' : 'none',
            marginBottom: '-2px',
          }}
        >
          <Users className="w-4 h-4 inline-block mr-2" />
          User accounts
        </button>
        <button
          onClick={() => handleTabChange('permissions')}
          className="px-4 py-2 font-medium transition-colors"
          style={{
            color: activeTab === 'permissions' ? '#C8102E' : 'var(--muted-foreground)',
            borderBottom: activeTab === 'permissions' ? '2px solid #C8102E' : 'none',
            marginBottom: '-2px',
          }}
        >
          <Shield className="w-4 h-4 inline-block mr-2" />
          Roles & permissions
        </button>
      </div>

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {usersLoading ? 'Loading...' : `Showing ${((usersCurrentPage - 1) * usersPageSize) + 1} to ${Math.min(usersCurrentPage * usersPageSize, usersTotalCount)} of ${usersTotalCount} entries`}
                </span>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={usersSearchTerm}
                  onChange={(e) => {
                    setUsersSearchTerm(e.target.value);
                    setUsersCurrentPage(1);
                  }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid var(--input)' }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {usersLoading ? (
              <div className="p-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                Loading users...
              </div>
            ) : (
              <DataTable
                data={users}
                columns={usersColumns}
                currentPage={usersCurrentPage}
                totalPages={usersTotalPages}
                pageSize={usersPageSize}
                onPageChange={setUsersCurrentPage}
                onPageSizeChange={(size) => {
                  setUsersPageSize(size);
                  setUsersCurrentPage(1);
                }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Permissions Tab Content */}
      {activeTab === 'permissions' && (
        <Card>
          <CardContent className="p-0">
            {permissionsLoading ? (
              <div className="p-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                Loading roles and permissions...
              </div>
            ) : (
              <>
                <div className="flex flex-col lg:flex-row min-h-[600px]">
                  {/* Sidebar - Role Selector */}
                  <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted/5)' }}>
                    <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                      <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                        Select Role
                      </h3>
                    </div>
                    <div className="p-2">
                      {permissionsRoles.map(role => (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role)}
                          className="w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors"
                          style={{
                            backgroundColor: selectedRole?.id === role.id ? '#3B82F6' : 'transparent',
                            color: selectedRole?.id === role.id ? 'white' : 'var(--foreground)',
                          }}
                        >
                          <div className="font-medium text-sm">{role.name}</div>
                          {role.description && (
                            <div className="text-xs mt-0.5 opacity-70">{role.description}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Content - Permissions Table */}
                  <div className="flex-1 overflow-x-auto">
                    {!selectedRole ? (
                      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                        <Shield className="w-16 h-16 mb-4" style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
                        <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
                          Select a role to configure its permissions.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted/5)' }}>
                          <div>
                            <h3 className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                              Configure which menus and actions each role can access. <strong>Read</strong> = menu visibility.
                            </h3>
                          </div>
                          {hasChanges && (
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={savePermissions}
                              disabled={saving}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                          )}
                        </div>
                        
                        <table className="w-full">
                          <thead>
                            <tr style={{ backgroundColor: 'var(--muted/5)', borderBottom: '2px solid var(--border)' }}>
                              <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                                Module / Menu
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                                View / Menu Access
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                                Create
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                                Update
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                                Delete
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {organizedPermissions.map((modulePerms, index) => (
                              <tr 
                                key={modulePerms.module}
                                style={{ 
                                  borderBottom: '1px solid var(--border)',
                                  backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--muted/3)'
                                }}
                              >
                                <td className="py-3 px-4">
                                  <div className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                                    {modulePerms.module}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isAllChecked(modulePerms.view)}
                                      onChange={(e) => toggleAllInModule(modulePerms.view, e.target.checked)}
                                      className="w-4 h-4 cursor-pointer"
                                      style={{ accentColor: '#3B82F6' }}
                                    />
                                    {modulePerms.view.length > 1 && (
                                      <div className="relative inline-block">
                                        <select
                                          className="text-xs px-2 py-1 rounded appearance-none cursor-pointer pr-6"
                                          style={{ 
                                            color: 'var(--muted-foreground)',
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--border)'
                                          }}
                                          onChange={(e) => {
                                            // Handle scope selection
                                          }}
                                        >
                                          <option value="all">All</option>
                                          <option value="team">Team</option>
                                          <option value="own">Own</option>
                                        </select>
                                        <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isAllChecked(modulePerms.create)}
                                      onChange={(e) => toggleAllInModule(modulePerms.create, e.target.checked)}
                                      className="w-4 h-4 cursor-pointer"
                                      style={{ accentColor: '#3B82F6' }}
                                    />
                                    {modulePerms.create.length > 1 && (
                                      <div className="relative inline-block">
                                        <select
                                          className="text-xs px-2 py-1 rounded appearance-none cursor-pointer pr-6"
                                          style={{ 
                                            color: 'var(--muted-foreground)',
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--border)'
                                          }}
                                        >
                                          <option value="all">All</option>
                                          <option value="team">Team</option>
                                          <option value="own">Own</option>
                                        </select>
                                        <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isAllChecked(modulePerms.update)}
                                      onChange={(e) => toggleAllInModule(modulePerms.update, e.target.checked)}
                                      className="w-4 h-4 cursor-pointer"
                                      style={{ accentColor: '#3B82F6' }}
                                    />
                                    {modulePerms.update.length > 1 && (
                                      <div className="relative inline-block">
                                        <select
                                          className="text-xs px-2 py-1 rounded appearance-none cursor-pointer pr-6"
                                          style={{ 
                                            color: 'var(--muted-foreground)',
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--border)'
                                          }}
                                        >
                                          <option value="all">All</option>
                                          <option value="team">Team</option>
                                          <option value="own">Own</option>
                                        </select>
                                        <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isAllChecked(modulePerms.delete)}
                                      onChange={(e) => toggleAllInModule(modulePerms.delete, e.target.checked)}
                                      className="w-4 h-4 cursor-pointer"
                                      style={{ accentColor: '#3B82F6' }}
                                    />
                                    {modulePerms.delete.length > 1 && (
                                      <div className="relative inline-block">
                                        <select
                                          className="text-xs px-2 py-1 rounded appearance-none cursor-pointer pr-6"
                                          style={{ 
                                            color: 'var(--muted-foreground)',
                                            backgroundColor: 'transparent',
                                            border: '1px solid var(--border)'
                                          }}
                                        >
                                          <option value="all">All</option>
                                          <option value="team">Team</option>
                                          <option value="own">Own</option>
                                        </select>
                                        <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Footer Note */}
                        <div className="p-4 border-t text-center text-xs" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted/5)', color: 'var(--muted-foreground)' }}>
                          User and role changes apply immediately for new sessions. Protect production admin accounts from accidental deletion.
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setSelectedUser(null);
          setResetPasswordData({ password: '', confirmPassword: '' });
        }}
        title="Reset Password"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Reset password for <strong>{selectedUser.fullName}</strong> ({selectedUser.email})
            </p>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="New Password"
                type="password"
                value={resetPasswordData.password}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                placeholder="••••••••"
                fullWidth
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={resetPasswordData.confirmPassword}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
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
            setResetPasswordData({ password: '', confirmPassword: '' });
          }} disabled={userSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleResetPassword} disabled={userSubmitting}>
            <Key className="w-4 h-4 mr-2" />
            {userSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
