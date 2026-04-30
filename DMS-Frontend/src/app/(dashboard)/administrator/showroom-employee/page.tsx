'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Users, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { outletEmployeesApi, type OutletEmployee, type UpdateOutletEmployeeDto } from '@/lib/api/outlet-employees';
import toast from 'react-hot-toast';

export default function ShowroomEmployeePage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<OutletEmployee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, [currentPage, pageSize, searchTerm]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await outletEmployeesApi.getAll(
        currentPage,
        pageSize,
        undefined,
        undefined,
        searchTerm,
        undefined
      );
      setEmployees(response.outletEmployees);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load outlet employees');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (employee: OutletEmployee) => {
    try {
      const updateData: UpdateOutletEmployeeDto = {
        outletId: employee.outletId,
        userId: employee.userId,
        designation: employee.designation,
        isManager: employee.isManager,
        joinedDate: employee.joinedDate,
        leftDate: employee.leftDate,
        isActive: !employee.isActive,
      };
      await outletEmployeesApi.update(employee.id, updateData);
      toast.success(`Employee ${employee.isActive ? 'deactivated' : 'activated'}`);
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    }
  };

  const columns = [
    {
      key: 'userName',
      label: 'Employee Name',
      render: (item: OutletEmployee) => (
        <div>
          <span className="font-medium">{item.userName}</span>
          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {item.userEmail}
          </div>
        </div>
      ),
    },
    {
      key: 'outletName',
      label: 'Outlet',
      render: (item: OutletEmployee) => (
        <div>
          <span className="font-medium">{item.outletName}</span>
          {item.outletCode && (
            <div className="text-xs font-mono" style={{ color: '#C8102E' }}>
              {item.outletCode}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'designation',
      label: 'Designation',
      render: (item: OutletEmployee) => (
        <span>{item.designation || '-'}</span>
      ),
    },
    {
      key: 'isManager',
      label: 'Manager',
      render: (item: OutletEmployee) => (
        item.isManager ? (
          <Badge variant="info" size="sm">Manager</Badge>
        ) : (
          <Badge variant="neutral" size="sm">Staff</Badge>
        )
      ),
    },
    {
      key: 'joinedDate',
      label: 'Joined Date',
      render: (item: OutletEmployee) => (
        <span className="text-sm">{new Date(item.joinedDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: OutletEmployee) => (
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
      render: (item: OutletEmployee) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/administrator/showroom-employee/edit/${item.id}`)}
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

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            <Users className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Showroom Employees
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage employee assignments to showroom outlets ({totalCount} employees)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => router.push('/administrator/showroom-employee/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Employee List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search employees..."
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
              data={employees}
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
    </div>
  );
}
