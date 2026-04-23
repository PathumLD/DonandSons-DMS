'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Shield, Plus, Search, Edit, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockRoles, type Role } from '@/lib/mock-data/users';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    active: true,
  });

  const filteredRoles = useMemo(() => {
    return roles.filter(r =>
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  const totalPages = Math.ceil(filteredRoles.length / pageSize);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleActive = (id: number) => {
    setRoles(roles.map(r =>
      r.id === id ? { ...r, active: !r.active } : r
    ));
  };

  const handleAddRole = () => {
    const newRole: Role = {
      id: Math.max(...roles.map(r => r.id)) + 1,
      ...formData,
    };
    setRoles([newRole, ...roles]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditRole = () => {
    if (selectedRole) {
      setRoles(roles.map(r =>
        r.id === selectedRole.id ? { ...r, ...formData } : r
      ));
      setShowEditModal(false);
      setSelectedRole(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      active: true,
    });
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setFormData(role);
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'name',
      label: '',
      render: (item: Role) => (
        <span className="font-medium" style={{ color: 'var(--foreground)' }}>
          <Shield className="w-4 h-4 inline-block mr-2" style={{ color: 'var(--muted-foreground)' }} />
          {item.name}
        </span>
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

  const renderRoleForm = () => (
    <div className="space-y-4">
      <Input
        label="Role Code"
        value={formData.code}
        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
        placeholder="e.g., ADMIN, MANAGER"
        fullWidth
        required
      />
      <Input
        label="Role Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Full role name"
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
          <DataTable
            data={paginatedRoles}
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

      {/* Add Role Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Role"
        size="md"
      >
        {renderRoleForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddRole}>
            <Plus className="w-4 h-4 mr-2" />
            Add Role
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
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditRole}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
