'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Permission } from '@/lib/api/permissions';

interface PermissionsSelectorProps {
  permissions: Permission[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

interface GroupedPermission {
  module: string;
  permissions: Permission[];
}

export default function PermissionsSelector({
  permissions,
  selectedIds,
  onChange,
}: PermissionsSelectorProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const groups = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);

    // Sort permissions within each module by displayOrder
    Object.keys(groups).forEach((module) => {
      groups[module].sort((a, b) => a.displayOrder - b.displayOrder);
    });

    // Convert to array and sort by module name
    return Object.entries(groups)
      .map(([module, perms]) => ({ module, permissions: perms }))
      .sort((a, b) => a.module.localeCompare(b.module));
  }, [permissions]);

  // Filter by module and search term
  const filteredGroups = useMemo(() => {
    let filtered = groupedPermissions;

    // Filter by selected module
    if (selectedModule !== 'all') {
      filtered = filtered.filter((group) => group.module === selectedModule);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (perm) =>
            perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            perm.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            perm.code.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      })).filter((group) => group.permissions.length > 0);
    }

    return filtered;
  }, [groupedPermissions, selectedModule, searchTerm]);

  const totalPermissions = permissions.length;
  const selectedCount = selectedIds.length;

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const expandAll = () => {
    setExpandedModules(new Set(filteredGroups.map((g) => g.module)));
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
  };

  const isModuleSelected = (modulePerms: Permission[]) => {
    return modulePerms.every((perm) => selectedIds.includes(perm.id));
  };

  const isModulePartiallySelected = (modulePerms: Permission[]) => {
    const selectedInModule = modulePerms.filter((perm) => selectedIds.includes(perm.id));
    return selectedInModule.length > 0 && selectedInModule.length < modulePerms.length;
  };

  const toggleModulePermissions = (modulePerms: Permission[]) => {
    const moduleIds = modulePerms.map((p) => p.id);
    const allSelected = modulePerms.every((perm) => selectedIds.includes(perm.id));

    if (allSelected) {
      // Deselect all in module
      onChange(selectedIds.filter((id) => !moduleIds.includes(id)));
    } else {
      // Select all in module
      const newSelected = [...selectedIds];
      moduleIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      onChange(newSelected);
    }
  };

  const togglePermission = (permId: string) => {
    if (selectedIds.includes(permId)) {
      onChange(selectedIds.filter((id) => id !== permId));
    } else {
      onChange([...selectedIds, permId]);
    }
  };

  const selectAllPermissions = () => {
    onChange(permissions.map((p) => p.id));
  };

  const clearAllPermissions = () => {
    onChange([]);
  };

  // Extract operation name from permission name (e.g., "Create Ingredients" -> "Create")
  const getOperationFromName = (name: string): string => {
    const operations = ['Create', 'Update', 'Delete', 'View', 'Read', 'Manage', 'Execute', 'Approve', 'Cancel'];
    for (const op of operations) {
      if (name.startsWith(op)) return op;
    }
    return name.split(' ')[0] || name;
  };

  // Extract entity name from permission name (e.g., "Create Ingredients" -> "Ingredients")
  const getEntityFromName = (name: string): string => {
    const operation = getOperationFromName(name);
    return name.replace(operation, '').trim();
  };

  return (
    <div className="space-y-3">
      {/* Header with counts */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          Permissions
        </div>
        <Badge variant="info" size="sm">
          {selectedCount} of {totalPermissions} selected
        </Badge>
      </div>

      {/* Role module tag info */}
      <div className="text-xs p-2 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
        Role module tag: <strong>Restaurant</strong> — list below shows all catalog permissions unless you filter.
      </div>

      {/* Filter and Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Module Filter */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
            Filter list by module
          </label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)', backgroundColor: 'var(--background)' }}
          >
            <option value="all">All modules ({totalPermissions} permissions)</option>
            {groupedPermissions.map((group) => (
              <option key={group.module} value={group.module}>
                {group.module} ({group.permissions.length})
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
              style={{ border: '1px solid var(--input)' }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCount === totalPermissions}
              onChange={(e) => {
                if (e.target.checked) {
                  selectAllPermissions();
                } else {
                  clearAllPermissions();
                }
              }}
              className="rounded"
            />
            <span className="text-sm font-medium">Select All ({totalPermissions} permissions)</span>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs px-3 py-1.5 rounded transition-colors"
            style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs px-3 py-1.5 rounded transition-colors"
            style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
          >
            Collapse all
          </button>
          <button
            type="button"
            onClick={clearAllPermissions}
            className="text-xs px-3 py-1.5 rounded transition-colors"
            style={{ color: '#DC2626', backgroundColor: '#FEF2F2' }}
          >
            Clear selected
          </button>
        </div>
      </div>

      {/* Permissions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
        {filteredGroups.map((group) => {
          const isExpanded = expandedModules.has(group.module);
          const isSelected = isModuleSelected(group.permissions);
          const isPartiallySelected = isModulePartiallySelected(group.permissions);

          return (
            <div
              key={group.module}
              className="border rounded-lg overflow-hidden"
              style={{ borderColor: 'var(--border)' }}
            >
              {/* Module Header */}
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <div className="flex items-center gap-2 flex-1" onClick={() => toggleModule(group.module)}>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                  )}
                  <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                    {group.module}
                  </span>
                  <Badge variant="secondary" size="sm">
                    {group.permissions.filter((p) => selectedIds.includes(p.id)).length}/{group.permissions.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleModule(group.module);
                    }}
                    className="text-xs px-2 py-1 rounded underline"
                    style={{ color: '#3B82F6' }}
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isPartiallySelected;
                        }
                      }}
                      onChange={() => toggleModulePermissions(group.permissions)}
                      className="rounded"
                    />
                    <span className="text-xs font-medium">Select All</span>
                  </label>
                </div>
              </div>

              {/* Module Permissions */}
              {isExpanded && (
                <div className="p-4" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.permissions.map((perm) => {
                      const operation = getOperationFromName(perm.name);
                      const entity = getEntityFromName(perm.name);

                      return (
                        <label
                          key={perm.id}
                          className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="rounded mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                              {operation}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              {entity || perm.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="lg:col-span-2 text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
            <p className="text-sm">No permissions found</p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs mt-2 underline"
                style={{ color: '#3B82F6' }}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
