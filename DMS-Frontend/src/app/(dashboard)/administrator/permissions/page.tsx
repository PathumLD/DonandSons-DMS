'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { KeyRound, Plus, Search, Edit, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockPermissions, type Permission } from '@/lib/mock-data/users';

const modules = [
  { value: 'Dashboard', label: 'Dashboard' },
  { value: 'Products', label: 'Products' },
  { value: 'Delivery', label: 'Delivery' },
  { value: 'Disposal', label: 'Disposal' },
  { value: 'Reports', label: 'Reports' },
  { value: 'Settings', label: 'Settings' },
  { value: 'Users', label: 'Users' },
];

const actions = [
  { value: 'VIEW', label: 'View' },
  { value: 'CREATE', label: 'Create' },
  { value: 'EDIT', label: 'Edit' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'EXPORT', label: 'Export' },
  { value: 'MANAGE', label: 'Manage' },
];

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  
  const [formData, setFormData] = useState({
    module: '',
    action: '',
    description: '',
    active: true,
  });

  const filteredPermissions = useMemo(() => {
    return permissions.filter(p =>
      p.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.action.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [permissions, searchTerm]);

  const totalPages = Math.ceil(filteredPermissions.length / pageSize);
  const paginatedPermissions = filteredPermissions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleActive = (id: number) => {
    setPermissions(permissions.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const handleAddPermission = () => {
    const newPermission: Permission = {
      id: Math.max(...permissions.map(p => p.id)) + 1,
      ...formData,
    };
    setPermissions([newPermission, ...permissions]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditPermission = () => {
    if (selectedPermission) {
      setPermissions(permissions.map(p =>
        p.id === selectedPermission.id ? { ...p, ...formData } : p
      ));
      setShowEditModal(false);
      setSelectedPermission(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      module: '',
      action: '',
      description: '',
      active: true,
    });
  };

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormData(permission);
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'module',
      label: 'Module',
      render: (item: Permission) => (
        <span className="font-medium">{item.module}</span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (item: Permission) => (
        <Badge variant="primary" size="sm">{item.action}</Badge>
      ),
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'active',
      label: 'Status',
      render: (item: Permission) => (
        item.active ? (
          <Badge variant="success" size="sm">Active</Badge>
        ) : (
          <Badge variant="danger" size="sm">Inactive</Badge>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Permission) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 rounded transition-colors"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleActive(item.id)}
            className="p-1.5 rounded transition-colors"
            style={{ color: item.active ? '#DC2626' : '#10B981' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = item.active ? '#FEF2F2' : '#F0FDF4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={item.active ? 'Deactivate' : 'Activate'}
          >
            {item.active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  const renderPermissionForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Module"
          value={formData.module}
          onChange={(e) => setFormData({ ...formData, module: e.target.value })}
          options={modules}
          placeholder="Select module"
          fullWidth
          required
        />
        <Select
          label="Action"
          value={formData.action}
          onChange={(e) => setFormData({ ...formData, action: e.target.value })}
          options={actions}
          placeholder="Select action"
          fullWidth
          required
        />
      </div>
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Brief description of permission"
        fullWidth
      />
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
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Permission Management</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Manage system permissions ({filteredPermissions.length} permissions)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Permission
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Permission List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid #D1D5DB' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={paginatedPermissions}
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

      {/* Add Permission Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Permission"
        size="md"
      >
        {renderPermissionForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddPermission}>
            <Plus className="w-4 h-4 mr-2" />
            Add Permission
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Permission Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPermission(null);
          resetForm();
        }}
        title="Edit Permission"
        size="md"
      >
        {renderPermissionForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedPermission(null);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditPermission}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
