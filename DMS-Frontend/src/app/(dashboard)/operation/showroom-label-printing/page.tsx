'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Printer } from 'lucide-react';
import { mockShowrooms } from '@/lib/mock-data/showrooms';

/**
 * 4.ix Showroom Label Printing
 *
 * Per spec:
 *  - Print Showroom Code Name as a label.
 *  - User selects showroom from dropdown and can add custom text.
 */

export default function ShowroomLabelPrintingPage() {
  const activeShowrooms = mockShowrooms.filter((s) => s.active);

  const [formData, setFormData] = useState({
    showroomCode: '',
    text1: '',
    text2: '',
    labelCount: '1',
  });

  const handleSubmit = () => {
    if (!formData.showroomCode) {
      alert('Please select a showroom code');
      return;
    }
    if (!formData.labelCount || Number(formData.labelCount) < 1) {
      alert('Please enter a valid label count');
      return;
    }
    alert(`Submitting label print request for ${formData.showroomCode} - ${formData.labelCount} label(s)`);
    // Reset form after submit
    setFormData({
      showroomCode: '',
      text1: '',
      text2: '',
      labelCount: '1',
    });
  };

  const selectedShowroom = activeShowrooms.find(s => String(s.id) === formData.showroomCode);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>New Showroom Label Print Request</h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Print Showroom Code Name labels. Select showroom and customize label text.
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Label Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select
                label="Showroom Code"
                value={formData.showroomCode}
                onChange={(e) => setFormData({ ...formData, showroomCode: e.target.value })}
                options={activeShowrooms.map((s) => ({ 
                  value: s.id, 
                  label: `${s.code} - ${s.name}` 
                }))}
                placeholder="Select showroom"
                fullWidth
                required
              />

              <Input
                label="Text 1"
                value={formData.text1}
                onChange={(e) => setFormData({ ...formData, text1: e.target.value })}
                placeholder={selectedShowroom?.code || 'Text 1'}
                fullWidth
              />

              <Input
                label="Text 2"
                value={formData.text2}
                onChange={(e) => setFormData({ ...formData, text2: e.target.value })}
                placeholder="Text 2"
                fullWidth
              />

              <Input
                label="Label Count"
                type="number"
                min="1"
                value={formData.labelCount}
                onChange={(e) => setFormData({ ...formData, labelCount: e.target.value })}
                placeholder="Label Count"
                fullWidth
                required
              />

              <div className="pt-4 flex justify-end">
                <Button 
                  variant="primary" 
                  size="md" 
                  onClick={handleSubmit}
                  disabled={!formData.showroomCode || !formData.labelCount}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {formData.showroomCode && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Label Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="p-6 bg-white rounded-lg shadow-md text-center space-y-2" style={{ border: '2px solid #C8102E', minWidth: '250px' }}>
                  <div className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>DON & SONS</div>
                  <div className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {selectedShowroom?.name || 'Showroom'}
                  </div>
                  <div className="text-base font-mono font-semibold" style={{ color: '#C8102E' }}>
                    {selectedShowroom?.code || ''}
                  </div>
                  {formData.text1 && (
                    <div className="text-sm" style={{ color: 'var(--foreground)' }}>{formData.text1}</div>
                  )}
                  {formData.text2 && (
                    <div className="text-sm" style={{ color: 'var(--foreground)' }}>{formData.text2}</div>
                  )}
                  <div className="text-xs pt-2" style={{ color: 'var(--muted-foreground)' }}>
                    Quantity: {formData.labelCount}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
