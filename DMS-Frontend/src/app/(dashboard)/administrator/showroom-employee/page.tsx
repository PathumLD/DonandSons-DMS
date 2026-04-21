'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Users, Plus, Search, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockShowrooms } from '@/lib/mock-data/showrooms';

interface ShowroomEmployee {
  id: number;
  employeeNo: string;
  name: string;
  position: string;
  showroomId: number;
  showroom: string;
  phone: string;
  email: string;
  joinDate: string;
  active: boolean;
}

const mockEmployees: ShowroomEmployee[] = [
  { id: 1, employeeNo: 'EMP001', name: 'Mary Fernando', position: 'Cashier', showroomId: 1, showroom: 'Dalmeny', phone: '0771234567', email: 'mary@donandson.com', joinDate: '2024-01-15', active: true },
  { id: 2, employeeNo: 'EMP002', name: 'John Silva', position: 'Cashier', showroomId: 2, showroom: 'Ragama', phone: '0772345678', email: 'john@donandson.com', joinDate: '2024-02-20', active: true },
  { id: 3, employeeNo: 'EMP003', name: 'Sarah Perera', position: 'Sales Assistant', showroomId: 1, showroom: 'Dalmeny', phone: '0773456789', email: 'sarah@donandson.com', joinDate: '2024-03-10', active: true },
  { id: 4, employeeNo: 'EMP004', name: 'David Kumar', position: 'Manager', showroomId: 3, showroom: 'Ranala', phone: '0774567890', email: 'david@donandson.com', joinDate: '2023-11-05', active: false },
];

export default function ShowroomEmployeePage() {
  const [employees, setEmployees] = useState<ShowroomEmployee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [showroomFilter, setShowroomFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<ShowroomEmployee | null>(null);
  
  const [formData, setFormData] = useState({
    employeeNo: '',
    name: '',
    position: '',
    showroomId: '',
    phone: '',
    email: '',
    joinDate: new Date().toISOString().split('T')[0],
    active: true,
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employeeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesShowroom = !showroomFilter || String(e.showroomId) === showroomFilter;
      return matchesSearch && matchesShowroom;
    });
  }, [employees, searchTerm, showroomFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAdd = () => {
    const showroom = mockShowrooms.find(s => s.id === Number(formData.showroomId));
    const newEmployee: ShowroomEmployee = {
      id: Math.max(...employees.map(e => e.id)) + 1,
      employeeNo: formData.employeeNo,
      name: formData.name,
      position: formData.position,
      showroomId: Number(formData.showroomId),
      showroom: showroom?.name || '',
      phone: formData.phone,
      email: formData.email,
      joinDate: formData.joinDate,
      active: formData.active,
    };
    setEmployees([newEmployee, ...employees]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedEmployee) {
      const showroom = mockShowrooms.find(s => s.id === Number(formData.showroomId));
      setEmployees(employees.map(e =>
        e.id === selectedEmployee.id
          ? { ...e, ...formData, showroomId: Number(formData.showroomId), showroom: showroom?.name || '' }
          : e
      ));
      setShowEditModal(false);
      setSelectedEmployee(null);
      resetForm();
    }
  };

  const handleToggleActive = (id: number) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, active: !e.active } : e));
  };

  const resetForm = () => {
    setFormData({
      employeeNo: '',
      name: '',
      position: '',
      showroomId: '',
      phone: '',
      email: '',
      joinDate: new Date().toISOString().split('T')[0],
      active: true,
    });
  };

  const openEditModal = (employee: ShowroomEmployee) => {
    setSelectedEmployee(employee);
    setFormData({
      employeeNo: employee.employeeNo,
      name: employee.name,
      position: employee.position,
      showroomId: String(employee.showroomId),
      phone: employee.phone,
      email: employee.email,
      joinDate: employee.joinDate,
      active: employee.active,
    });
    setShowEditModal(true);
  };

  const columns = [
    { key: 'employeeNo', label: 'Employee No', render: (item: ShowroomEmployee) => <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>{item.employeeNo}</span> },
    { key: 'name', label: 'Name', render: (item: ShowroomEmployee) => <span className="font-medium">{item.name}</span> },
    { key: 'position', label: 'Position' },
    { key: 'showroom', label: 'Showroom' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'active', label: 'Status', render: (item: ShowroomEmployee) => (
      <button onClick={() => handleToggleActive(item.id)}>
        {item.active ? <Badge variant="success" size="sm">Active</Badge> : <Badge variant="neutral" size="sm">Inactive</Badge>}
      </button>
    )},
    { key: 'actions', label: 'Actions', render: (item: ShowroomEmployee) => (
      <div className="flex items-center space-x-2">
        <button onClick={() => { setSelectedEmployee(item); setShowViewModal(true); }} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="View"><Eye className="w-4 h-4" /></button>
        <button onClick={() => openEditModal(item)} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Edit"><Edit className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Showroom Employees</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Manage showroom staff members ({filteredEmployees.length} employees)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}><Plus className="w-4 h-4 mr-2" />Add Employee</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Employee List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={showroomFilter} onChange={(e) => { setShowroomFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Showrooms' }, ...mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: s.name }))]} />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedEmployees} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Employee" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Employee No" value={formData.employeeNo} onChange={(e) => setFormData({ ...formData, employeeNo: e.target.value })} placeholder="EMP001" fullWidth required />
            <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" fullWidth required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="Cashier" fullWidth required />
            <Select label="Showroom" value={formData.showroomId} onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })} options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} placeholder="Select showroom" fullWidth required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0771234567" fullWidth required />
            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="employee@donandson.com" fullWidth required />
          </div>
          <Input label="Join Date" type="date" value={formData.joinDate} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} fullWidth required />
          <Toggle checked={formData.active} onChange={(checked) => setFormData({ ...formData, active: checked })} label="Active" />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Employee</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedEmployee(null); resetForm(); }} title="Edit Employee" size="lg">
        <div className="space-y-4">
          <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} fullWidth />
            <Select label="Showroom" value={formData.showroomId} onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })} options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: s.name }))} fullWidth />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth />
            <Input label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth />
          </div>
          <Toggle checked={formData.active} onChange={(checked) => setFormData({ ...formData, active: checked })} label="Active" />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedEmployee(null); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedEmployee(null); }} title="Employee Details" size="md">
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Employee No</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedEmployee.employeeNo}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</p>{selectedEmployee.active ? <Badge variant="success" size="sm">Active</Badge> : <Badge variant="neutral" size="sm">Inactive</Badge>}</div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Full Name</p><p className="text-sm" style={{ color: '#111827' }}>{selectedEmployee.name}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Position</p><p className="text-sm" style={{ color: '#111827' }}>{selectedEmployee.position}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Showroom</p><p className="text-sm" style={{ color: '#111827' }}>{selectedEmployee.showroom}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Phone</p><p className="text-sm" style={{ color: '#111827' }}>{selectedEmployee.phone}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Email</p><p className="text-sm" style={{ color: '#111827' }}>{selectedEmployee.email}</p></div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Join Date</p><p className="text-sm" style={{ color: '#111827' }}>{new Date(selectedEmployee.joinDate).toLocaleDateString()}</p></div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedEmployee(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
