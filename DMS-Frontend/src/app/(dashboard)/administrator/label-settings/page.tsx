'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Tag, Save } from 'lucide-react';

export default function LabelSettingsPage() {
  const [settings, setSettings] = useState({
    labelWidth: '100',
    labelHeight: '80',
    fontSize: '12',
    fontFamily: 'Arial',
    includeBarcode: true,
    includeQRCode: false,
    includeExpiry: true,
    includePrice: true,
    includeLogo: true,
    printerName: 'Default Printer',
    orientation: 'portrait',
    marginTop: '5',
    marginBottom: '5',
    marginLeft: '5',
    marginRight: '5',
  });

  const handleSave = () => {
    console.log('Saving label settings:', settings);
    alert('Label settings saved successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Label Settings</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Configure label printing parameters and layout</p>
        </div>
        <Button variant="primary" size="md" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Label Dimensions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Width (mm)" type="number" value={settings.labelWidth} onChange={(e) => setSettings({ ...settings, labelWidth: e.target.value })} fullWidth />
                  <Input label="Height (mm)" type="number" value={settings.labelHeight} onChange={(e) => setSettings({ ...settings, labelHeight: e.target.value })} fullWidth />
                </div>
                <Select label="Orientation" value={settings.orientation} onChange={(e) => setSettings({ ...settings, orientation: e.target.value })} options={[{ value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }]} fullWidth />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Font Settings</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select label="Font Family" value={settings.fontFamily} onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })} options={[{ value: 'Arial', label: 'Arial' }, { value: 'Helvetica', label: 'Helvetica' }, { value: 'Times New Roman', label: 'Times New Roman' }]} fullWidth />
                <Input label="Font Size (pt)" type="number" value={settings.fontSize} onChange={(e) => setSettings({ ...settings, fontSize: e.target.value })} fullWidth />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Margins (mm)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Top" type="number" value={settings.marginTop} onChange={(e) => setSettings({ ...settings, marginTop: e.target.value })} fullWidth />
                <Input label="Bottom" type="number" value={settings.marginBottom} onChange={(e) => setSettings({ ...settings, marginBottom: e.target.value })} fullWidth />
                <Input label="Left" type="number" value={settings.marginLeft} onChange={(e) => setSettings({ ...settings, marginLeft: e.target.value })} fullWidth />
                <Input label="Right" type="number" value={settings.marginRight} onChange={(e) => setSettings({ ...settings, marginRight: e.target.value })} fullWidth />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Label Content</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Toggle checked={settings.includeLogo} onChange={(checked) => setSettings({ ...settings, includeLogo: checked })} label="Include Company Logo" />
                <Toggle checked={settings.includeBarcode} onChange={(checked) => setSettings({ ...settings, includeBarcode: checked })} label="Include Barcode" />
                <Toggle checked={settings.includeQRCode} onChange={(checked) => setSettings({ ...settings, includeQRCode: checked })} label="Include QR Code" />
                <Toggle checked={settings.includePrice} onChange={(checked) => setSettings({ ...settings, includePrice: checked })} label="Include Price" />
                <Toggle checked={settings.includeExpiry} onChange={(checked) => setSettings({ ...settings, includeExpiry: checked })} label="Include Expiry Date" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Printer Configuration</CardTitle></CardHeader>
            <CardContent>
              <Input label="Printer Name" value={settings.printerName} onChange={(e) => setSettings({ ...settings, printerName: e.target.value })} placeholder="Default Printer" fullWidth />
              <div className="mt-4">
                <Button variant="secondary" size="sm" fullWidth>Test Print</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Label Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: '#D1D5DB' }}>
                <div className="inline-block p-4 bg-white rounded shadow-md" style={{ border: '2px solid #C8102E' }}>
                  {settings.includeLogo && <div className="text-xs font-bold mb-2" style={{ color: '#C8102E' }}>DON & SONS</div>}
                  <div className="text-sm font-bold mb-1">Sandwich Bread Large</div>
                  <div className="text-xs mb-2" style={{ color: '#6B7280' }}>BR2</div>
                  {settings.includePrice && <div className="text-lg font-bold" style={{ color: '#C8102E' }}>Rs. 280.00</div>}
                  {settings.includeExpiry && <div className="text-xs mt-2" style={{ color: '#6B7280' }}>Exp: 28/04/2026</div>}
                  {settings.includeBarcode && <div className="h-8 bg-gray-200 rounded mt-2"></div>}
                </div>
                <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>Preview based on current settings</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
