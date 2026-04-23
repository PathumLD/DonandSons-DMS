'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Calendar, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockShowrooms } from '@/lib/mock-data/showrooms';

interface ShowroomEmployee {
  id: number;
  employeeId: string;
  name: string;
  jobTitle: string;
  showroomId: number;
  showroom: string;
  phone: string;
  email: string;
  approved: boolean;
  active: boolean;
}

const mockEmployees: ShowroomEmployee[] = [
  { id: 1, employeeId: '001', name: 'Don', jobTitle: 'Cashier', showroomId: 1, showroom: 'Other', phone: '0771234567', email: 'don@donandson.com', approved: true, active: true },
  { id: 2, employeeId: '002', name: 'Other', jobTitle: 'Cashier', showroomId: 1, showroom: 'Other', phone: '0772345678', email: 'other@donandson.com', approved: true, active: true },
  { id: 3, employeeId: '002', name: 'N.A. Sarah', jobTitle: 'Cashier', showroomId: 2, showroom: 'Malabe', phone: '0773456789', email: 'sarah@donandson.com', approved: true, active: true },
  { id: 4, employeeId: '025', name: 'M.U.Ashoka Predeep', jobTitle: 'Cashier', showroomId: 3, showroom: 'Bandarawela', phone: '0774567890', email: 'ashoka@donandson.com', approved: true, active: true },
  { id: 5, employeeId: '04', name: 'K.R. Thilaksurathne', jobTitle: 'Cashier', showroomId: 4, showroom: 'Katanya', phone: '0775678901', email: 'thilak@donandson.com', approved: true, active: true },
  { id: 6, employeeId: '1216', name: 'A.M. Ganansha Kumara', jobTitle: 'Cashier', showroomId: 5, showroom: 'Dakgama', phone: '0776789012', email: 'ganansha@donandson.com', approved: true, active: true },
  { id: 7, employeeId: '1256', name: 'W. M. Laxmi Pradeep Kumara', jobTitle: 'Cashier', showroomId: 6, showroom: 'Dakgama BRG', phone: '0777890123', email: 'laxmi@donandson.com', approved: true, active: true },
  { id: 8, employeeId: '1210', name: 'Hansini Manjula Weerakkody', jobTitle: 'Cashier', showroomId: 7, showroom: 'Dakgama BRG', phone: '0778901234', email: 'hansini@donandson.com', approved: true, active: true },
  { id: 9, employeeId: '1320', name: 'P. Reethinika Udantha Jayarathna Ariyarathna', jobTitle: 'Cashier', showroomId: 8, showroom: 'Katanya', phone: '0779012345', email: 'reethinika@donandson.com', approved: true, active: true },
  { id: 10, employeeId: '1046', name: 'W. P. Harshana Wiharaga', jobTitle: 'Cashier', showroomId: 9, showroom: 'Kaduruwela', phone: '0770123456', email: 'harshana@donandson.com', approved: true, active: true },
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
    employeeId: '',
    name: '',
    jobTitle: '',
    showroomId: '',
    phone: '',
    email: '',
    approved: true,
    active: true,
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
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
      employeeId: formData.employeeId,
      name: formData.name,
      jobTitle: formData.jobTitle,
      showroomId: Number(formData.showroomId),
      showroom: showroom?.name || '',
      phone: formData.phone,
      email: formData.email,
      approved: formData.approved,
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
      employeeId: '',
      name: '',
      jobTitle: '',
      showroomId: '',
      phone: '',
      email: '',
      approved: true,
      active: true,
    });
  };

  const openEditModal = (employee: ShowroomEmployee) => {
    setSelectedEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      name: employee.name,
      jobTitle: employee.jobTitle,
      showroomId: String(employee.showroomId),
      phone: employee.phone,
      email: employee.email,
      approved: employee.approved,
      active: employee.active,
    });
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const columns = [
    { key: 'employeeId', label: 'Employee ID', render: (item: ShowroomEmployee) => <span className="font-mono" style={{ color: 'var(--muted-foreground)' }}>{item.employeeId}</span> },
    { key: 'name', label: 'Employee Name', render: (item: ShowroomEmployee) => <span className="font-medium" style={{ color: 'var(--foreground)' }}>{item.name}</span> },
    { key: 'showroom', label: 'Showroom', render: (item: ShowroomEmployee) => <span style={{ color: 'var(--muted-foreground)' }}>{item.showroom}</span> },
    { key: 'jobTitle', label: 'Job Title', render: (item: ShowroomEmployee) => <span style={{ color: 'var(--muted-foreground)' }}>{item.jobTitle}</span> },
    { key: 'approved', label: 'Approved', render: (item: ShowroomEmployee) => (
      <span style={{ color: '#10B981' }}>Approved</span>
    )},
    { key: 'actions', label: '', render: (item: ShowroomEmployee) => (
      <div className="flex items-center justify-end space-x-2">
        <button onClick={() => openEditModal(item)} className="p-1.5 rounded-full transition-colors" style={{ color: '#3B82F6', backgroundColor: '#EFF6FF' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'} title="Edit"><Edit className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-full transition-colors" style={{ color: '#DC2626', backgroundColor: '#FEF2F2' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'} title="Delete"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            <Calendar className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Showroom Calender
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Employee Information - List of showroom's employees
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Showing 1 to 10 of {filteredEmployees.length} entries
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={showroomFilter} onChange={(e) => { setShowroomFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Showrooms' }, ...mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: s.name }))]} />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--input)' }} />
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
            <Input label="Employee ID" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} placeholder="001" fullWidth required />
            <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" fullWidth required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Job Title" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} placeholder="Cashier" fullWidth required />
            <Select label="Showroom" value={formData.showroomId} onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })} options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} placeholder="Select showroom" fullWidth required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0771234567" fullWidth />
            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="employee@donandson.com" fullWidth />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Toggle checked={formData.approved} onChange={(checked) => setFormData({ ...formData, approved: checked })} label="Approved" />
            <Toggle checked={formData.active} onChange={(checked) => setFormData({ ...formData, active: checked })} label="Active" />
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Employee</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedEmployee(null); resetForm(); }} title="Edit Employee" size="lg">
        <div className="space-y-4">
          <Input label="Employee ID" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} fullWidth disabled />
          <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Job Title" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} fullWidth />
            <Select label="Showroom" value={formData.showroomId} onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })} options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: s.name }))} fullWidth />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth />
            <Input label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Toggle checked={formData.approved} onChange={(checked) => setFormData({ ...formData, approved: checked })} label="Approved" />
            <Toggle checked={formData.active} onChange={(checked) => setFormData({ ...formData, active: checked })} label="Active" />
          </div>
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
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Employee ID</p><p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedEmployee.employeeId}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>{selectedEmployee.approved ? <Badge variant="success" size="sm">Approved</Badge> : <Badge variant="neutral" size="sm">Pending</Badge>}</div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Full Name</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedEmployee.name}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Job Title</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedEmployee.jobTitle}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedEmployee.showroom}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Phone</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedEmployee.phone}</p></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Email</p><p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedEmployee.email}</p></div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Active</p>{selectedEmployee.active ? <Badge variant="success" size="sm">Active</Badge> : <Badge variant="neutral" size="sm">Inactive</Badge>}</div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedEmployee(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
