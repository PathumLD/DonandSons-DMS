'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { KeyRound, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { permissionsApi, type PermissionsByModule } from '@/lib/api/permissions';

export default function PermissionsPage() {
  const [groupedPermissions, setGroupedPermissions] = useState<PermissionsByModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await permissionsApi.getGroupedByModule(true);
      setGroupedPermissions(data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedPermissions;
    
    const searchLower = searchTerm.toLowerCase();
    return groupedPermissions
      .map(group => ({
        ...group,
        permissions: group.permissions.filter(p =>
          p.code.toLowerCase().includes(searchLower) ||
          p.module.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        )
      }))
      .filter(group => group.permissions.length > 0);
  }, [groupedPermissions, searchTerm]);


  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            <KeyRound className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Permission Management
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            View system permissions. Permissions are seeded and read-only.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">System Permissions</Badge>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {loading ? 'Loading...' : `${filteredGroups.reduce((acc, g) => acc + g.permissions.length, 0)} total permissions`}
              </span>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid var(--input)' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
              Loading permissions...
            </div>
          ) : (
            <div className="space-y-6">
              {filteredGroups.map(group => (
                <div key={group.module}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--foreground)' }}>
                    <Badge variant="primary" size="sm" className="mr-2">{group.module}</Badge>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      ({group.permissions.length} permissions)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.permissions.map(perm => (
                      <div
                        key={perm.id}
                        className="p-3 rounded-lg"
                        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                      >
                        <div className="font-mono text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                          {perm.code}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                          {perm.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
