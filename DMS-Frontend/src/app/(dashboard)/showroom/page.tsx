'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Store, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { outletsApi, type Outlet, type CreateOutletDto, type UpdateOutletDto } from '@/lib/api/outlets';
import toast from 'react-hot-toast';

export default function ShowroomPage() {
  const [showrooms, setShowrooms] = useState<Outlet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedShowroom, setSelectedShowroom] = useState<Outlet | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreateOutletDto & { isActive?: boolean }>>({
    code: '',
    name: '',
    address: '',
    phone: '',
    contactPerson: '',
    operatingHours: '',
    displayOrder: 0,
    hasVariants: true,
    isDeliveryPoint: true,
    isActive: true,
  });

  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');

  useEffect(() => {
    loadShowrooms();
  }, [currentPage, pageSize, searchTerm]);

  const loadShowrooms = async () => {
    try {
      setLoading(true);
      const response = await outletsApi.getAll(currentPage, pageSize, searchTerm, undefined, true);
      setShowrooms(response.outlets);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load showrooms');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleToggleActive = async (outlet: Outlet) => {
    try {
      const updateData: UpdateOutletDto = {
        code: outlet.code,
        name: outlet.name,
        address: outlet.address,
        phone: outlet.phone,
        contactPerson: outlet.contactPerson,
        displayOrder: outlet.displayOrder,
        hasVariants: outlet.hasVariants,
        isDeliveryPoint: outlet.isDeliveryPoint,
        isActive: !outlet.isActive,
      };
      await outletsApi.update(outlet.id, updateData);
      toast.success(`Outlet ${outlet.isActive ? 'deactivated' : 'activated'} successfully`);
      loadShowrooms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update outlet');
    }
  };

  const handleAddShowroom = async () => {
    try {
      setSubmitting(true);
      // Combine opening and closing times
      const operatingHours = openingTime && closingTime 
        ? `${openingTime} - ${closingTime}` 
        : formData.operatingHours;

      const createData: CreateOutletDto = {
        code: formData.code!,
        name: formData.name!,
        address: formData.address!,
        phone: formData.phone,
        contactPerson: formData.contactPerson,
        operatingHours: operatingHours,
        displayOrder: formData.displayOrder || 0,
        hasVariants: formData.hasVariants ?? true,
        isDeliveryPoint: formData.isDeliveryPoint ?? true,
      };
      await outletsApi.create(createData);
      toast.success('Outlet created successfully');
      setShowAddModal(false);
      resetForm();
      loadShowrooms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create outlet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditShowroom = async () => {
    if (selectedShowroom) {
      try {
        setSubmitting(true);
        // Combine opening and closing times
        const operatingHours = openingTime && closingTime 
          ? `${openingTime} - ${closingTime}` 
          : formData.operatingHours;

        const updateData: UpdateOutletDto = {
          code: formData.code!,
          name: formData.name!,
          address: formData.address!,
          phone: formData.phone,
          contactPerson: formData.contactPerson,
          operatingHours: operatingHours,
          displayOrder: formData.displayOrder || 0,
          hasVariants: formData.hasVariants ?? true,
          isDeliveryPoint: formData.isDeliveryPoint ?? true,
          isActive: formData.isActive ?? true,
        };
        await outletsApi.update(selectedShowroom.id, updateData);
        toast.success('Outlet updated successfully');
        setShowEditModal(false);
        setSelectedShowroom(null);
        resetForm();
        loadShowrooms();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to update outlet');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      address: '',
      phone: '',
      contactPerson: '',
      operatingHours: '',
      displayOrder: 0,
      hasVariants: true,
      isDeliveryPoint: true,
      isActive: true,
    });
    setOpeningTime('');
    setClosingTime('');
  };

  const openEditModal = (showroom: Outlet) => {
    setSelectedShowroom(showroom);
    setFormData({
      code: showroom.code,
      name: showroom.name,
      address: showroom.address,
      phone: showroom.phone,
      contactPerson: showroom.contactPerson,
      operatingHours: showroom.operatingHours,
      displayOrder: showroom.displayOrder,
      hasVariants: showroom.hasVariants,
      isDeliveryPoint: showroom.isDeliveryPoint,
      isActive: showroom.isActive,
    });
    
    // Parse operating hours if it exists (e.g., "08:00 - 20:00")
    if (showroom.operatingHours) {
      const times = showroom.operatingHours.split('-').map(t => t.trim());
      if (times.length === 2) {
        setOpeningTime(times[0]);
        setClosingTime(times[1]);
      }
    }
    
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (item: Outlet) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'displayOrder',
      label: 'Display Order',
      render: (item: Outlet) => (
        <span className="font-medium text-center block">{item.displayOrder}</span>
      ),
    },
    {
      key: 'name',
      label: 'Showroom Name',
      render: (item: Outlet) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    {
      key: 'address',
      label: 'Location',
    },
    {
      key: 'contactPerson',
      label: 'Manager',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: Outlet) => (
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
      render: (item: Outlet) => (
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

  const renderShowroomForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Showroom Code"
          value={formData.code || ''}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., DAL, RAG"
          fullWidth
          required
        />
        <Input
          label="Showroom Name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Full showroom name"
          fullWidth
          required
        />
      </div>

      <Input
        label="Address"
        value={formData.address || ''}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        placeholder="Full address"
        fullWidth
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="011-2345678"
          fullWidth
        />
        <Input
          label="Contact Person"
          value={formData.contactPerson || ''}
          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
          placeholder="Manager name"
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Opening Time"
          type="time"
          value={openingTime}
          onChange={(e) => setOpeningTime(e.target.value)}
          fullWidth
          required
        />
        <Input
          label="Closing Time"
          type="time"
          value={closingTime}
          onChange={(e) => setClosingTime(e.target.value)}
          fullWidth
          required
        />
        <Input
          label="Display Order"
          type="number"
          value={formData.displayOrder?.toString() || '0'}
          onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
          placeholder="0"
          fullWidth
        />
      </div>

      <div className="pt-2">
        <Toggle
          checked={formData.isActive ?? true}
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Showrooms</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage showroom locations ({totalCount} outlets)
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C8102E' }} />
            </div>
          ) : (
            <DataTable
              data={showrooms}
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

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Showroom"
        size="lg"
      >
        {renderShowroomForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddShowroom} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {submitting ? 'Adding...' : 'Add Showroom'}
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
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditShowroom} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
