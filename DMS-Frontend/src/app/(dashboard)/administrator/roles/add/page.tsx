'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { ArrowLeft, Plus } from 'lucide-react';
import { rolesApi, type CreateRoleRequest } from '@/lib/api/roles';
import { permissionsApi, type Permission } from '@/lib/api/permissions';
import PermissionsSelector from '@/components/roles/PermissionsSelector';
import toast from 'react-hot-toast';

export default function AddRolePage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    permissionIds: [] as string[],
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const perms = await permissionsApi.getAll(true);
      setPermissions(perms);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const createData: CreateRoleRequest = {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        permissionIds: formData.permissionIds,
      };
      await rolesApi.create(createData);
      toast.success('Role created successfully');
      router.push('/administrator/roles');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Failed to create role';
      toast.error(errorMsg);
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Add New Role</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create a new role and assign permissions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Role Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sales Manager"
                fullWidth
                required
              />
              <div className="flex items-end">
                <Toggle
                  checked={formData.isActive}
                  onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  label="Active"
                />
              </div>
            </div>

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of role"
              fullWidth
            />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <PermissionsSelector
              permissions={permissions}
              selectedIds={formData.permissionIds}
              onChange={(selectedIds) => setFormData({ ...formData, permissionIds: selectedIds })}
            />

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
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
                {submitting ? 'Creating...' : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Role
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
