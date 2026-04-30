'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Printer, Loader2 } from 'lucide-react';
import { showroomLabelsApi } from '@/lib/api/showroom-labels';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { ProtectedPage } from '@/components/auth';
import toast from 'react-hot-toast';

export default function ShowroomLabelPrintingPage() {
  return (
    <ProtectedPage permission="operation:showroom-label-printing:view">
      <ShowroomLabelPrintingPageContent />
    </ProtectedPage>
  );
}

function ShowroomLabelPrintingPageContent() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    showroomCode: '',
    text1: '',
    text2: '',
    labelCount: '',
  });

  useEffect(() => {
    fetchOutlets();
  }, []);

  const fetchOutlets = async () => {
    try {
      const response = await outletsApi.getAll();
      setOutlets(response.outlets.filter(o => o.isActive));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load outlets');
    }
  };

  const handleShowroomChange = (showroomCode: string) => {
    const selectedOutlet = outlets.find(o => o.code === showroomCode);
    setFormData({
      ...formData,
      showroomCode,
      text1: showroomCode, // Auto-fill Text 1 with showroom code
    });
  };

  const handleSubmit = async () => {
    if (!formData.showroomCode) {
      toast.error('Please select a showroom');
      return;
    }
    if (!formData.text1) {
      toast.error('Text 1 is required');
      return;
    }
    if (!formData.labelCount || Number(formData.labelCount) < 1) {
      toast.error('Please enter a valid label count');
      return;
    }

    const selectedOutlet = outlets.find(o => o.code === formData.showroomCode);
    if (!selectedOutlet) {
      toast.error('Selected showroom not found');
      return;
    }

    try {
      setIsLoading(true);
      await showroomLabelsApi.create({
        outletId: selectedOutlet.id,
        text1: formData.text1,
        text2: formData.text2 || undefined,
        labelCount: Number(formData.labelCount),
      });
      toast.success(`Showroom label request created for ${formData.labelCount} label(s)`);
      setFormData({
        showroomCode: '',
        text1: '',
        text2: '',
        labelCount: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create label request');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOutlet = outlets.find(o => o.code === formData.showroomCode);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Showroom Label Printing
        </h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Print Showroom Code Name labels. Select showroom code from list.
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>New Showroom Label Print Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select
                label="Showroom Code"
                value={formData.showroomCode}
                onChange={(e) => handleShowroomChange(e.target.value)}
                options={outlets.map((o) => ({ 
                  value: o.code, 
                  label: o.code
                }))}
                placeholder="Select showroom code"
                fullWidth
                required
              />

              <Input
                label="Text 1"
                type="text"
                value={formData.text1}
                onChange={(e) => setFormData({ ...formData, text1: e.target.value })}
                placeholder="Enter text 1"
                fullWidth
                required
              />

              <Input
                label="Text 2"
                type="text"
                value={formData.text2}
                onChange={(e) => setFormData({ ...formData, text2: e.target.value })}
                placeholder="Enter text 2 (optional)"
                fullWidth
              />

              <Input
                label="Label Count"
                type="number"
                min="1"
                value={formData.labelCount}
                onChange={(e) => setFormData({ ...formData, labelCount: e.target.value })}
                placeholder="Enter label count"
                fullWidth
                required
              />

              {selectedOutlet && formData.text1 && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    Label Preview
                  </p>
                  <div className="p-4 bg-white rounded border-2 border-dashed border-gray-300 text-center">
                    <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                      {formData.text1}
                    </p>
                    {formData.text2 && (
                      <p className="text-lg font-medium mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        {formData.text2}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.showroomCode || !formData.text1 || !formData.labelCount}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Printer className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
