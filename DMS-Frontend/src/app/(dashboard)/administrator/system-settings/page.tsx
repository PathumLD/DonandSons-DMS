'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Settings, Save, RefreshCw } from 'lucide-react';

export default function SystemSettingsPage() {
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
    // TODO: Implement save functionality
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>System Settings</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Configure system-wide preferences and parameters
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

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
    </div>
  );
}
