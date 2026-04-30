'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  KeyRound,
  Loader2,
  Save,
  Search,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProtectedPage } from '@/components/auth';
import { rolesApi, type Role } from '@/lib/api/roles';
import { permissionsApi, type Permission } from '@/lib/api/permissions';
import {
  ACTION_LABELS,
  ACTION_ORDER,
  PERMISSION_SECTIONS,
  type ActionKey,
  type SectionDef,
} from '@/lib/auth/permission-map';

/**
 * Roles & Permissions Admin
 *
 * Layout:
 *   - Left rail: list of roles (select one).
 *   - Main panel: Section-by-section grid that mirrors the sidebar.
 *     Each subsection is a row, each column is one action that exists for
 *     the subsection (View, Create, Edit, Delete, Approve, Reject, …).
 *
 * Saving sends the union of selected permission ids to
 * `POST /api/roles/:id/permissions`.
 */
export default function PermissionsPage() {
  return (
    <ProtectedPage permission="permissions:read">
      <PermissionsManager />
    </ProtectedPage>
  );
}

function PermissionsManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [originalIds, setOriginalIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingRolePerms, setLoadingRolePerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  /** Map permission code -> backend permission id (resolved from API). */
  const permissionByCode = useMemo(() => {
    const map = new Map<string, Permission>();
    for (const p of allPermissions) map.set(p.code, p);
    return map;
  }, [allPermissions]);

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (selectedRole) loadRolePermissions(selectedRole.id);
  }, [selectedRole]);

  async function loadInitial() {
    setLoading(true);
    try {
      const [rolesResp, perms] = await Promise.all([
        rolesApi.getAll(1, 200, '', true),
        permissionsApi.getAll(true),
      ]);
      setRoles(rolesResp.roles);
      setAllPermissions(perms);
      if (rolesResp.roles.length > 0) {
        setSelectedRole((curr) => curr ?? rolesResp.roles[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load roles & permissions');
    } finally {
      setLoading(false);
    }
  }

  async function loadRolePermissions(roleId: string) {
    setLoadingRolePerms(true);
    try {
      const role = await rolesApi.getById(roleId);
      const ids = new Set((role.permissions ?? []).map((p) => p.id));
      setSelectedIds(ids);
      setOriginalIds(new Set(ids));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load role permissions');
    } finally {
      setLoadingRolePerms(false);
    }
  }

  const hasChanges = useMemo(() => {
    if (selectedIds.size !== originalIds.size) return true;
    for (const id of selectedIds) if (!originalIds.has(id)) return true;
    return false;
  }, [selectedIds, originalIds]);

  /** Permission codes that exist in the backend but are not present in the
   *  canonical map. These are surfaced in an "Unmapped permissions" panel
   *  so admins can still grant/revoke them while developers update the map. */
  const unmappedPermissions = useMemo(() => {
    const known = new Set<string>();
    for (const section of PERMISSION_SECTIONS) {
      if (section.modulePermission) known.add(section.modulePermission);
      for (const sub of section.subsections) {
        for (const code of Object.values(sub.actions)) {
          if (code) known.add(code);
        }
      }
    }
    return allPermissions
      .filter((p) => !known.has(p.code))
      .sort((a, b) => a.module.localeCompare(b.module) || a.code.localeCompare(b.code));
  }, [allPermissions]);

  const filteredSections = useMemo(() => filterSections(PERMISSION_SECTIONS, search), [search]);

  function toggle(code: string | undefined, checked: boolean) {
    if (!code) return;
    const perm = permissionByCode.get(code);
    if (!perm) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(perm.id);
      else next.delete(perm.id);
      return next;
    });
  }

  function toggleMany(codes: (string | undefined)[], checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const code of codes) {
        if (!code) continue;
        const perm = permissionByCode.get(code);
        if (!perm) continue;
        if (checked) next.add(perm.id);
        else next.delete(perm.id);
      }
      return next;
    });
  }

  function isCodeChecked(code: string | undefined): boolean {
    if (!code) return false;
    const perm = permissionByCode.get(code);
    return perm ? selectedIds.has(perm.id) : false;
  }

  function isSubsectionFullyChecked(actions: (string | undefined)[]): boolean | 'partial' {
    const known = actions.filter((c): c is string => Boolean(c) && permissionByCode.has(c));
    if (known.length === 0) return false;
    const checked = known.filter(isCodeChecked).length;
    if (checked === 0) return false;
    if (checked === known.length) return true;
    return 'partial';
  }

  function toggleCollapsed(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await rolesApi.assignPermissions(selectedRole.id, Array.from(selectedIds));
      toast.success(`Saved ${selectedIds.size} permissions for ${selectedRole.name}`);
      setOriginalIds(new Set(selectedIds));
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setSelectedIds(new Set(originalIds));
  }

  function selectAllInSection(section: SectionDef, checked: boolean) {
    const codes: string[] = [];
    if (section.modulePermission) codes.push(section.modulePermission);
    for (const sub of section.subsections) {
      for (const code of Object.values(sub.actions)) {
        if (code) codes.push(code);
      }
    }
    toggleMany(codes, checked);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
            <KeyRound className="w-8 h-8" style={{ color: '#C8102E' }} />
            Roles & Permissions
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Pick a role on the left, then tick the actions it should be allowed
            to perform. Only checked actions will work for users assigned to
            this role.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && !saving && (
            <Button variant="ghost" size="sm" onClick={reset}>
              Discard
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={save}
            disabled={!hasChanges || saving || !selectedRole}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row min-h-[600px]">
              {/* Roles list */}
              <aside
                className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3
                    className="text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Roles
                  </h3>
                </div>
                <div className="p-2 space-y-1">
                  {roles.map((role) => {
                    const active = selectedRole?.id === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role)}
                        className="w-full text-left px-3 py-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: active ? '#3B82F6' : 'transparent',
                          color: active ? 'white' : 'var(--foreground)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {role.name}
                          </span>
                          {role.permissionCount !== undefined && (
                            <Badge variant={active ? 'neutral' : 'info'} size="sm">
                              {role.permissionCount}
                            </Badge>
                          )}
                        </div>
                        {role.description && (
                          <div className="text-xs mt-0.5 opacity-75">{role.description}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Permissions matrix */}
              <section className="flex-1 overflow-x-auto">
                {!selectedRole ? (
                  <EmptyState />
                ) : (
                  <div className="p-4 space-y-4">
                    {/* Header bar */}
                    <div
                      className="flex items-center justify-between gap-4 p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--muted)' }}
                    >
                      <div>
                        <div className="font-semibold" style={{ color: 'var(--foreground)' }}>
                          {selectedRole.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {selectedIds.size} permission{selectedIds.size === 1 ? '' : 's'} selected
                          {hasChanges && (
                            <span className="ml-2 text-orange-500 font-medium">
                              (unsaved changes)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="relative w-72">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: 'var(--muted-foreground)' }}
                        />
                        <input
                          type="text"
                          placeholder="Filter by section, page or permission…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 rounded-lg text-sm"
                          style={{ border: '1px solid var(--input)', backgroundColor: 'var(--card)' }}
                        />
                      </div>
                    </div>

                    {loadingRolePerms ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2
                          className="w-6 h-6 animate-spin"
                          style={{ color: 'var(--muted-foreground)' }}
                        />
                      </div>
                    ) : (
                      <>
                        {filteredSections.map((section) => (
                          <SectionRow
                            key={section.id}
                            section={section}
                            collapsed={collapsed.has(section.id)}
                            onToggleCollapse={() => toggleCollapsed(section.id)}
                            onSelectAll={(checked) => selectAllInSection(section, checked)}
                            isCodeChecked={isCodeChecked}
                            isSubsectionFullyChecked={isSubsectionFullyChecked}
                            toggleCode={toggle}
                            toggleMany={toggleMany}
                            permissionByCode={permissionByCode}
                          />
                        ))}

                        {unmappedPermissions.length > 0 && (
                          <UnmappedSection
                            permissions={unmappedPermissions}
                            selectedIds={selectedIds}
                            onToggle={(id, checked) =>
                              setSelectedIds((prev) => {
                                const next = new Set(prev);
                                if (checked) next.add(id);
                                else next.delete(id);
                                return next;
                              })
                            }
                          />
                        )}

                        {filteredSections.length === 0 && (
                          <div className="text-center py-12 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            No sections match your filter.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
//                              SUB-COMPONENTS
// ---------------------------------------------------------------------------

interface SectionRowProps {
  section: SectionDef;
  collapsed: boolean;
  onToggleCollapse(): void;
  onSelectAll(checked: boolean): void;
  isCodeChecked(code: string | undefined): boolean;
  isSubsectionFullyChecked(actions: (string | undefined)[]): boolean | 'partial';
  toggleCode(code: string | undefined, checked: boolean): void;
  toggleMany(codes: (string | undefined)[], checked: boolean): void;
  permissionByCode: Map<string, Permission>;
}

function SectionRow({
  section,
  collapsed,
  onToggleCollapse,
  onSelectAll,
  isCodeChecked,
  isSubsectionFullyChecked,
  toggleCode,
  toggleMany,
  permissionByCode,
}: SectionRowProps) {
  // Compute which action columns to show based on what subsections declare.
  const usedActions: ActionKey[] = useMemo(() => {
    const present = new Set<ActionKey>();
    for (const sub of section.subsections) {
      for (const key of Object.keys(sub.actions) as ActionKey[]) {
        present.add(key);
      }
    }
    return ACTION_ORDER.filter((a) => present.has(a));
  }, [section]);

  const sectionAllCodes = useMemo(() => {
    const codes: string[] = [];
    if (section.modulePermission) codes.push(section.modulePermission);
    for (const sub of section.subsections) {
      for (const c of Object.values(sub.actions)) if (c) codes.push(c);
    }
    return codes;
  }, [section]);

  const sectionFullyChecked = useMemo(() => {
    const known = sectionAllCodes.filter((c) => permissionByCode.has(c));
    if (known.length === 0) return false;
    const ticked = known.filter(isCodeChecked).length;
    if (ticked === 0) return false;
    if (ticked === known.length) return true;
    return 'partial' as const;
  }, [sectionAllCodes, permissionByCode, isCodeChecked]);

  const Icon = section.icon;

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        style={{ backgroundColor: 'var(--muted)' }}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-3">
          {collapsed ? (
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          )}
          <Icon className="w-4 h-4" style={{ color: '#C8102E' }} />
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {section.name}
          </span>
          <Badge variant="neutral" size="sm">
            {section.subsections.length} pages
          </Badge>
        </div>
        <label
          className="flex items-center gap-2 text-xs"
          style={{ color: 'var(--muted-foreground)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="w-4 h-4 cursor-pointer"
            style={{ accentColor: '#3B82F6' }}
            checked={sectionFullyChecked === true}
            ref={(el) => {
              if (el) el.indeterminate = sectionFullyChecked === 'partial';
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
          />
          Select all
        </label>
      </div>

      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--muted)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <th
                  className="text-left py-2 px-4 font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Page / Feature
                </th>
                {usedActions.map((a) => (
                  <th
                    key={a}
                    className="text-center py-2 px-3 font-medium whitespace-nowrap"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {ACTION_LABELS[a]}
                  </th>
                ))}
                <th
                  className="text-center py-2 px-3 font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  All
                </th>
              </tr>
            </thead>
            <tbody>
              {section.subsections.map((sub) => {
                const subCodes = Object.values(sub.actions).filter((c): c is string => Boolean(c));
                const subState = isSubsectionFullyChecked(subCodes);
                return (
                  <tr
                    key={sub.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td className="py-2 px-4">
                      <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                        {sub.name}
                      </div>
                      {sub.href && (
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {sub.href}
                        </div>
                      )}
                    </td>
                    {usedActions.map((action) => {
                      const code = sub.actions[action];
                      const known = code ? permissionByCode.has(code) : false;
                      const checked = isCodeChecked(code);
                      return (
                        <td key={action} className="text-center py-2 px-3">
                          {code ? (
                            <input
                              type="checkbox"
                              className="w-4 h-4 cursor-pointer"
                              style={{ accentColor: '#3B82F6' }}
                              checked={checked}
                              disabled={!known}
                              title={!known ? `Missing permission in DB: ${code}` : code}
                              onChange={(e) => toggleCode(code, e.target.checked)}
                            />
                          ) : (
                            <span
                              className="text-xs"
                              style={{ color: 'var(--muted-foreground)', opacity: 0.4 }}
                            >
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="text-center py-2 px-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: '#3B82F6' }}
                        checked={subState === true}
                        ref={(el) => {
                          if (el) el.indeterminate = subState === 'partial';
                        }}
                        onChange={(e) => toggleMany(subCodes, e.target.checked)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UnmappedSection({
  permissions,
  selectedIds,
  onToggle,
}: {
  permissions: Permission[];
  selectedIds: Set<string>;
  onToggle(id: string, checked: boolean): void;
}) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
            Other Permissions
          </span>
          <Badge variant="neutral" size="sm">
            {permissions.length}
          </Badge>
        </div>
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Permissions in the database that are not part of the current sidebar map.
        </span>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {permissions.map((perm) => (
          <label
            key={perm.id}
            className="flex items-start gap-2 text-sm cursor-pointer"
            style={{ color: 'var(--foreground)' }}
          >
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 cursor-pointer"
              style={{ accentColor: '#3B82F6' }}
              checked={selectedIds.has(perm.id)}
              onChange={(e) => onToggle(perm.id, e.target.checked)}
            />
            <span>
              <span className="font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {perm.code}
              </span>
              <br />
              <span className="text-xs">{perm.description || perm.name}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
      <Shield className="w-16 h-16 mb-4" style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
      <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
        Select a role to configure its permissions.
      </p>
    </div>
  );
}

function filterSections(sections: SectionDef[], query: string): SectionDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return sections;
  return sections
    .map((section) => {
      const sectionMatches = section.name.toLowerCase().includes(q);
      const filteredSubs = section.subsections.filter((sub) => {
        if (sectionMatches) return true;
        if (sub.name.toLowerCase().includes(q)) return true;
        if (sub.href?.toLowerCase().includes(q)) return true;
        for (const code of Object.values(sub.actions)) {
          if (code?.toLowerCase().includes(q)) return true;
        }
        return false;
      });
      if (filteredSubs.length === 0 && !sectionMatches) return null;
      return { ...section, subsections: sectionMatches ? section.subsections : filteredSubs };
    })
    .filter((s): s is SectionDef => s !== null);
}
