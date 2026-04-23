'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Store, Plus, Search, Edit, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockShowrooms, type Showroom } from '@/lib/mock-data/showrooms';

export default function ShowroomPage() {
  const [showrooms, setShowrooms] = useState<Showroom[]>(mockShowrooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedShowroom, setSelectedShowroom] = useState<Showroom | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: '',
    phone: '',
    manager: '',
    openingTime: '',
    closingTime: '',
    active: true,
  });

  const filteredShowrooms = useMemo(() => {
    return showrooms.filter(s =>
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [showrooms, searchTerm]);

  const totalPages = Math.ceil(filteredShowrooms.length / pageSize);
  const paginatedShowrooms = filteredShowrooms.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleActive = (id: number) => {
    setShowrooms(showrooms.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  const handleAddShowroom = () => {
    const newShowroom: Showroom = {
      id: Math.max(...showrooms.map(s => s.id)) + 1,
      ...formData,
    };
    setShowrooms([newShowroom, ...showrooms]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditShowroom = () => {
    if (selectedShowroom) {
      setShowrooms(showrooms.map(s =>
        s.id === selectedShowroom.id ? { ...s, ...formData } : s
      ));
      setShowEditModal(false);
      setSelectedShowroom(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      location: '',
      phone: '',
      manager: '',
      openingTime: '',
      closingTime: '',
      active: true,
    });
  };

  const openEditModal = (showroom: Showroom) => {
    setSelectedShowroom(showroom);
    setFormData(showroom);
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (item: Showroom) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Showroom Name',
      render: (item: Showroom) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
    },
    {
      key: 'manager',
      label: 'Manager',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'active',
      label: 'Status',
      render: (item: Showroom) => (
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
      render: (item: Showroom) => (
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

  const renderShowroomForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Showroom Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., DAL, RAG"
          fullWidth
          required
        />
        <Input
          label="Showroom Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Full showroom name"
          fullWidth
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Address or area"
          fullWidth
          required
        />
        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="011-2345678"
          fullWidth
          required
        />
      </div>

      <Input
        label="Manager Name"
        value={formData.manager}
        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
        placeholder="Full name"
        fullWidth
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Opening Time"
          type="time"
          value={formData.openingTime}
          onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
          fullWidth
          required
        />
        <Input
          label="Closing Time"
          type="time"
          value={formData.closingTime}
          onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
          fullWidth
          required
        />
      </div>

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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Showrooms</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage showroom locations ({filteredShowrooms.length} outlets)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Showroom
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Showroom List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search showrooms..."
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
            data={paginatedShowrooms}
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

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Showroom"
        size="lg"
      >
        {renderShowroomForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddShowroom}>
            <Plus className="w-4 h-4 mr-2" />
            Add Showroom
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedShowroom(null);
          resetForm();
        }}
        title="Edit Showroom"
        size="lg"
      >
        {renderShowroomForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedShowroom(null);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditShowroom}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
