'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { ArrowLeft, Plus } from 'lucide-react';
import { outletEmployeesApi, type CreateOutletEmployeeDto } from '@/lib/api/outlet-employees';
import toast from 'react-hot-toast';

export default function AddShowroomEmployeePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    outletId: '',
    userId: '',
    designation: '',
    isManager: false,
    joinedDate: new Date().toISOString().split('T')[0],
    leftDate: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.outletId || !formData.userId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const createData: CreateOutletEmployeeDto = {
        outletId: formData.outletId,
        userId: formData.userId,
        designation: formData.designation,
        isManager: formData.isManager,
        joinedDate: formData.joinedDate,
        leftDate: formData.leftDate || undefined,
        isActive: formData.isActive,
      };
      await outletEmployeesApi.create(createData);
      toast.success('Employee added successfully');
      router.push('/administrator/showroom-employee');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Add Showroom Employee</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Assign a new employee to a showroom outlet
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Outlet ID"
                value={formData.outletId}
                onChange={(e) => setFormData({ ...formData, outletId: e.target.value })}
                placeholder="Enter outlet ID (GUID)"
                fullWidth
                required
              />
              <Input
                label="User ID"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                placeholder="Enter user ID (GUID)"
                fullWidth
                required
              />
            </div>

            <Input
              label="Designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g., Cashier, Sales Manager"
              fullWidth
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Joined Date"
                type="date"
                value={formData.joinedDate}
                onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                fullWidth
                required
              />
              <Input
                label="Left Date (Optional)"
                type="date"
                value={formData.leftDate}
                onChange={(e) => setFormData({ ...formData, leftDate: e.target.value })}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Toggle
                checked={formData.isManager}
                onChange={(checked) => setFormData({ ...formData, isManager: checked })}
                label="Is Manager"
              />
              <Toggle
                checked={formData.isActive}
                onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                label="Active Status"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
