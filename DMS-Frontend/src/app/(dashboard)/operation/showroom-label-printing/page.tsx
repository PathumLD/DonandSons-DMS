'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';
import { Printer, Download } from 'lucide-react';
import { mockShowrooms } from '@/lib/mock-data/showrooms';

export default function ShowroomLabelPrintingPage() {
  const [formData, setFormData] = useState({
    showroomId: '',
    labelType: 'qr',
    includeAddress: true,
    includePhone: true,
    quantity: '1',
  });

  const handlePrint = () => {
    console.log('Printing showroom labels:', formData);
    alert(`Printing ${formData.quantity} showroom label(s)`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Showroom Label Printing</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>Generate and print showroom identification labels</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Label Configuration</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select label="Showroom" value={formData.showroomId} onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })} options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} placeholder="Select showroom" fullWidth required />
              <Select label="Label Type" value={formData.labelType} onChange={(e) => setFormData({ ...formData, labelType: e.target.value })} options={[{ value: 'qr', label: 'QR Code Label' }, { value: 'barcode', label: 'Barcode Label' }, { value: 'simple', label: 'Simple Text Label' }]} fullWidth required />
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.includeAddress} onChange={(e) => setFormData({ ...formData, includeAddress: e.target.checked })} className="rounded" />
                  <span className="text-sm" style={{ color: '#374151' }}>Include Address</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.includePhone} onChange={(e) => setFormData({ ...formData, includePhone: e.target.checked })} className="rounded" />
                  <span className="text-sm" style={{ color: '#374151' }}>Include Phone Number</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Label Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8" style={{ borderColor: '#D1D5DB' }}>
              {formData.showroomId ? (
                <div className="p-6 bg-white rounded-lg shadow-md text-center space-y-2" style={{ border: '2px solid #C8102E' }}>
                  <div className="text-xs font-semibold" style={{ color: '#6B7280' }}>DON & SONS</div>
                  <div className="text-2xl font-bold" style={{ color: '#111827' }}>
                    {mockShowrooms.find(s => s.id === Number(formData.showroomId))?.name}
                  </div>
                  <div className="text-sm font-mono font-semibold" style={{ color: '#C8102E' }}>
                    {mockShowrooms.find(s => s.id === Number(formData.showroomId))?.code}
                  </div>
                  {formData.includeAddress && (
                    <div className="text-xs" style={{ color: '#6B7280' }}>
                      {mockShowrooms.find(s => s.id === Number(formData.showroomId))?.location}
                    </div>
                  )}
                  {formData.includePhone && (
                    <div className="text-xs" style={{ color: '#6B7280' }}>
                      {mockShowrooms.find(s => s.id === Number(formData.showroomId))?.phone}
                    </div>
                  )}
                  {formData.labelType === 'qr' && (
                    <div className="w-24 h-24 mx-auto mt-4 bg-gray-200 rounded"></div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Printer className="w-16 h-16 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>Select a showroom to preview the label</p>
                </div>
              )}
            </div>
            <div className="mt-6 space-y-3">
              <Button variant="primary" size="md" onClick={handlePrint} disabled={!formData.showroomId} fullWidth><Printer className="w-4 h-4 mr-2" />Print Label</Button>
              <Button variant="secondary" size="md" disabled={!formData.showroomId} fullWidth><Download className="w-4 h-4 mr-2" />Download as PDF</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
