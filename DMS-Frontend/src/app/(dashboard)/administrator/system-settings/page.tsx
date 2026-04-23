'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Save, RefreshCw, Shield, Lock, Unlock, Plus, Trash2, AlertTriangle, Settings2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { isAdminUser } from '@/lib/date-restrictions';

interface UserDateRange {
  id: number;
  username: string;
  module: 'Delivery' | 'Disposal' | 'Transfer' | 'Stock BF' | 'Cancellation' | 'Delivery Return' | 'Label Printing';
  backDays: number;
  futureDays: number;
}

interface DayLockEntry {
  id: number;
  date: string;
  reason: string;
  lockedBy: string;
  lockedAt: string;
}

interface SystemAdminSetting {
  name: string;
  value: number;
  description: string;
}

export default function SystemSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const { pageThemes, setPageTheme, resetPageTheme } = useThemeStore();

  const [userDateRanges, setUserDateRanges] = useState<UserDateRange[]>([
    { id: 1, username: 'manager.colombo', module: 'Delivery', backDays: 7, futureDays: 14 },
    { id: 2, username: 'manager.kandy', module: 'Transfer', backDays: 3, futureDays: 0 },
  ]);
  const [newRange, setNewRange] = useState<{ username: string; module: UserDateRange['module']; backDays: string; futureDays: string }>({
    username: '',
    module: 'Delivery',
    backDays: '0',
    futureDays: '0',
  });

  const [lockedDays, setLockedDays] = useState<DayLockEntry[]>([
    { id: 1, date: '2026-04-01', reason: 'Month-end closing', lockedBy: 'admin', lockedAt: '2026-04-02 18:00' },
  ]);
  const [newLock, setNewLock] = useState({ date: '', reason: '' });

  const [systemAdminSettings, setSystemAdminSettings] = useState<SystemAdminSetting[]>([
    { 
      name: 'Dispose Date Change', 
      value: 0, 
      description: 'Allow to non-admin users to change Dispose Date in Disposal - [0 - Disallow, 1- Allow ]' 
    },
    { 
      name: 'Delivered Date Change', 
      value: 0, 
      description: 'Allow to non-admin users to change Delivered Date in Disposal - [0 - Disallow, 1- Allow ]' 
    },
    { 
      name: 'Block the current date in Stock BF', 
      value: 1, 
      description: 'Block the current date in Stock BF for non-admin users [0 - Disable, 1- Enable ]' 
    },
    { 
      name: 'Day Locking for non-admins', 
      value: 1, 
      description: '0- Disable to lock non-admins, 1- Allow to lock non-admins' 
    },
    { 
      name: 'Day UnLocking for non-admins', 
      value: 0, 
      description: '0- Disable to Unlock for non-admins, 1- Allow to Unlock non-admins' 
    },
  ]);
  const [editingSetting, setEditingSetting] = useState<{ name: string; value: number } | null>(null);

  const [settings, setSettings] = useState({
    companyName: 'Don & Sons (Pvt) Ltd',
    companyAddress: 'Malabe, Sri Lanka',
    companyPhone: '011-1234567',
    companyEmail: 'info@donandson.com',
    currency: 'LKR',
    taxRate: '0',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24',
    language: 'en',
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlert: true,
    lowStockThreshold: '50',
    sessionTimeout: '30',
    maxLoginAttempts: '5',
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
  };

  const handleAddRange = () => {
    if (!newRange.username) return;
    setUserDateRanges([
      ...userDateRanges,
      {
        id: Math.max(0, ...userDateRanges.map(r => r.id)) + 1,
        username: newRange.username,
        module: newRange.module,
        backDays: Number(newRange.backDays || 0),
        futureDays: Number(newRange.futureDays || 0),
      },
    ]);
    setNewRange({ username: '', module: 'Delivery', backDays: '0', futureDays: '0' });
  };

  const handleRemoveRange = (id: number) => {
    setUserDateRanges(userDateRanges.filter(r => r.id !== id));
  };

  const handleLockDay = () => {
    if (!newLock.date || !newLock.reason) return;
    setLockedDays([
      ...lockedDays,
      {
        id: Math.max(0, ...lockedDays.map(l => l.id)) + 1,
        date: newLock.date,
        reason: newLock.reason,
        lockedBy: user?.email || 'admin',
        lockedAt: new Date().toLocaleString(),
      },
    ]);
    setNewLock({ date: '', reason: '' });
  };

  const handleUnlockDay = (id: number) => {
    setLockedDays(lockedDays.filter(l => l.id !== id));
  };

  const handleUpdateSetting = (name: string, newValue: number) => {
    setSystemAdminSettings(prev =>
      prev.map(s => s.name === name ? { ...s, value: newValue } : s)
    );
    setEditingSetting(null);
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: '#DC2626' }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Admin Access Required</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              System Settings are only visible to administrators (per requirement 6.iii).
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>System Settings</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Configure system-wide preferences and parameters
          </p>
          <div className="mt-2">
            <Badge variant="primary" size="sm">
              <Shield className="w-3 h-3 mr-1" />
              Admin only
            </Badge>
          </div>
        </div>
        <Button variant="primary" size="md" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" style={{ color: '#C8102E' }} />
            System Administration Settings
          </CardTitle>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Core system settings that control date restrictions, locking behavior, and user permissions (Requirement 6.iii).
          </p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>Name</th>
                  <th className="text-center px-4 py-3 font-medium" style={{ color: 'var(--foreground)', width: '120px' }}>Value</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>Description</th>
                  <th className="text-center px-4 py-3 font-medium" style={{ color: 'var(--foreground)', width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {systemAdminSettings.map((setting, idx) => (
                  <tr key={setting.name} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{setting.name}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge 
                        variant={setting.value === 1 ? 'success' : 'neutral'} 
                        size="sm"
                      >
                        {setting.value}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{setting.description}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setEditingSetting({ name: setting.name, value: setting.value })}
                        className="p-1.5 rounded-md transition-colors inline-flex items-center justify-center"
                        style={{ color: '#3B82F6', backgroundColor: '#EFF6FF' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                        title="Edit Setting"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Date Range Overrides</CardTitle>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Override the default Back/Future date ranges allowed for individual users in specific modules.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <Input
                label="Username"
                value={newRange.username}
                onChange={(e) => setNewRange({ ...newRange, username: e.target.value })}
                placeholder="user.name"
                fullWidth
              />
              <Select
                label="Module"
                value={newRange.module}
                onChange={(e) => setNewRange({ ...newRange, module: e.target.value as UserDateRange['module'] })}
                options={[
                  { value: 'Delivery', label: 'Delivery' },
                  { value: 'Disposal', label: 'Disposal' },
                  { value: 'Transfer', label: 'Transfer' },
                  { value: 'Stock BF', label: 'Stock BF' },
                  { value: 'Cancellation', label: 'Cancellation' },
                  { value: 'Delivery Return', label: 'Delivery Return' },
                  { value: 'Label Printing', label: 'Label Printing' },
                ]}
                fullWidth
              />
              <Input
                label="Back Days"
                type="number"
                value={newRange.backDays}
                onChange={(e) => setNewRange({ ...newRange, backDays: e.target.value })}
                min="0"
                fullWidth
              />
              <Input
                label="Future Days"
                type="number"
                value={newRange.futureDays}
                onChange={(e) => setNewRange({ ...newRange, futureDays: e.target.value })}
                min="0"
                fullWidth
              />
              <Button variant="primary" onClick={handleAddRange}>
                <Plus className="w-4 h-4 mr-2" />Add
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: 'var(--muted)' }}>
                  <tr>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>Username</th>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>Module</th>
                    <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>Back Days</th>
                    <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>Future Days</th>
                    <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userDateRanges.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 py-6 text-center" style={{ color: 'var(--muted-foreground)' }}>No overrides configured.</td></tr>
                  ) : (
                    userDateRanges.map(r => (
                      <tr key={r.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                        <td className="px-3 py-2 font-medium">{r.username}</td>
                        <td className="px-3 py-2"><Badge variant="primary" size="sm">{r.module}</Badge></td>
                        <td className="px-3 py-2 text-right">{r.backDays}</td>
                        <td className="px-3 py-2 text-right">{r.futureDays}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => handleRemoveRange(r.id)}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: '#DC2626' }}
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Day Lock / Unlock</CardTitle>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Locked days reject any new entries (even from Admin) per requirement 6.viii.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <Input
                label="Date to Lock"
                type="date"
                value={newLock.date}
                onChange={(e) => setNewLock({ ...newLock, date: e.target.value })}
                fullWidth
              />
              <Input
                label="Reason"
                value={newLock.reason}
                onChange={(e) => setNewLock({ ...newLock, reason: e.target.value })}
                placeholder="e.g. Audit closing"
                fullWidth
              />
              <Button variant="primary" onClick={handleLockDay}>
                <Lock className="w-4 h-4 mr-2" />Lock Day
              </Button>
            </div>
            <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
              <p className="text-xs" style={{ color: '#92400E' }}>
                Once a day is locked, no entries can be added or modified for that date in any module — even by Admin.
              </p>
            </div>
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: 'var(--muted)' }}>
                  <tr>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>Date</th>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>Reason</th>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>Locked By</th>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>Locked At</th>
                    <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lockedDays.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 py-6 text-center" style={{ color: 'var(--muted-foreground)' }}>No locked days.</td></tr>
                  ) : (
                    lockedDays.map(l => (
                      <tr key={l.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                        <td className="px-3 py-2 font-medium">{new Date(l.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2">{l.reason}</td>
                        <td className="px-3 py-2">{l.lockedBy}</td>
                        <td className="px-3 py-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>{l.lockedAt}</td>
                        <td className="px-3 py-2 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleUnlockDay(l.id)}>
                            <Unlock className="w-3 h-3 mr-1" />Unlock
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Page Theme Colors (Color Coding)</CardTitle>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Customize theme colors for operation pages. Changes apply to page titles, primary buttons, and navigation highlights.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'delivery', label: 'Delivery' },
              { key: 'disposal', label: 'Disposal' },
              { key: 'transfer', label: 'Transfer' },
              { key: 'stock-bf', label: 'Stock BF' },
              { key: 'cancellation', label: 'Cancellation' },
              { key: 'delivery-return', label: 'Delivery Return' },
              { key: 'label-printing', label: 'Label Printing' },
              { key: 'daily-production', label: 'Daily Production' },
              { key: 'production-cancel', label: 'Production Cancel' },
            ].map((page) => {
              const theme = pageThemes[page.key];
              return (
                <div key={page.key} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center p-3 rounded-lg" style={{ border: '1px solid var(--border)' }}>
                  <div className="font-medium" style={{ color: 'var(--foreground)' }}>{page.label}</div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Primary Color:</label>
                    <input
                      type="color"
                      value={theme?.primaryColor || '#3B82F6'}
                      onChange={(e) => setPageTheme(page.key, { ...theme, primaryColor: e.target.value })}
                      className="w-12 h-8 rounded border cursor-pointer"
                      style={{ border: '1px solid var(--input)' }}
                    />
                    <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{theme?.primaryColor || '#3B82F6'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Accent Color:</label>
                    <input
                      type="color"
                      value={theme?.secondaryColor || '#C8102E'}
                      onChange={(e) => setPageTheme(page.key, { ...theme, secondaryColor: e.target.value })}
                      className="w-12 h-8 rounded border cursor-pointer"
                      style={{ border: '1px solid var(--input)' }}
                    />
                    <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{theme?.secondaryColor || '#C8102E'}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => resetPageTheme(page.key)}>
                    Reset
                  </Button>
                </div>
              );
            })}
            <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#3B82F6' }} />
              <p className="text-xs" style={{ color: '#1E40AF' }}>
                <strong>Color Coding (Requirement 4.i):</strong> Primary color applies to page headings and primary buttons. 
                Accent color applies to reference numbers (e.g., Delivery No, Disposal No) and navigation menu highlights.
                Example: If you set Delivery page to Red (#FF0000), the blue elements will become red.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Company Name"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              fullWidth
            />
            <Input
              label="Company Address"
              value={settings.companyAddress}
              onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
              fullWidth
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={settings.companyPhone}
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                fullWidth
              />
              <Input
                label="Email Address"
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                fullWidth
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Currency"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                options={[
                  { value: 'LKR', label: 'LKR - Sri Lankan Rupee' },
                  { value: 'USD', label: 'USD - US Dollar' },
                  { value: 'EUR', label: 'EUR - Euro' },
                ]}
                fullWidth
              />
              <Select
                label="Date Format"
                value={settings.dateFormat}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                ]}
                fullWidth
              />
              <Select
                label="Time Format"
                value={settings.timeFormat}
                onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                options={[
                  { value: '12', label: '12 Hour' },
                  { value: '24', label: '24 Hour' },
                ]}
                fullWidth
              />
            </div>
            <Input
              label="Tax Rate (%)"
              type="number"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
              placeholder="0"
              fullWidth
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Toggle
              checked={settings.emailNotifications}
              onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              label="Enable Email Notifications"
            />
            <Toggle
              checked={settings.smsNotifications}
              onChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
              label="Enable SMS Notifications"
            />
            <div className="pt-2">
              <Toggle
                checked={settings.lowStockAlert}
                onChange={(checked) => setSettings({ ...settings, lowStockAlert: checked })}
                label="Low Stock Alerts"
              />
              {settings.lowStockAlert && (
                <div className="mt-3">
                  <Input
                    label="Low Stock Threshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => setSettings({ ...settings, lowStockThreshold: e.target.value })}
                    placeholder="50"
                    helperText="Alert when stock falls below this quantity"
                    fullWidth
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Session Timeout (minutes)"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                helperText="Auto-logout after inactivity"
                fullWidth
              />
              <Input
                label="Max Login Attempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
                helperText="Account locks after this many failed attempts"
                fullWidth
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Backup & Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Toggle
              checked={settings.autoBackup}
              onChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
              label="Enable Automatic Backup"
            />
            <div className="flex items-center space-x-3 pt-2">
              <Button variant="secondary" size="md">
                <RefreshCw className="w-4 h-4 mr-2" />
                Backup Now
              </Button>
              <Button variant="ghost" size="md">
                View Backup History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit System Setting Modal */}
      <Modal
        isOpen={editingSetting !== null}
        onClose={() => setEditingSetting(null)}
        title="Edit System Setting"
        size="md"
      >
        {editingSetting && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                {editingSetting.name}
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
                {systemAdminSettings.find(s => s.name === editingSetting.name)?.description}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
                Value
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="settingValue"
                    checked={editingSetting.value === 0}
                    onChange={() => setEditingSetting({ ...editingSetting, value: 0 })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>0 - Disabled / Disallow</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="settingValue"
                    checked={editingSetting.value === 1}
                    onChange={() => setEditingSetting({ ...editingSetting, value: 1 })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>1 - Enabled / Allow</span>
                </label>
              </div>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setEditingSetting(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (editingSetting) {
                handleUpdateSetting(editingSetting.name, editingSetting.value);
              }
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Setting
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
