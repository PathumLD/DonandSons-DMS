'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Printer, Loader2 } from 'lucide-react';
import { showroomLabelsApi } from '@/lib/api/showroom-labels';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import toast from 'react-hot-toast';

export default function ShowroomLabelPrintingPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    showroomId: '',
    labelCount: '1',
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

  const handleSubmit = async () => {
    if (!formData.showroomId) {
      toast.error('Please select a showroom');
      return;
    }
    if (!formData.labelCount || Number(formData.labelCount) < 1) {
      toast.error('Please enter a valid label count');
      return;
    }

    try {
      setIsLoading(true);
      await showroomLabelsApi.generatePrintData(formData.showroomId);
      toast.success(`Label print data generated for ${formData.labelCount} label(s)`);
      setFormData({
        showroomId: '',
        labelCount: '1',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate label print data');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOutlet = outlets.find(o => o.id === formData.showroomId);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Showroom Label Printing
        </h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Print Showroom Code Name labels. Select showroom and generate labels.
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
                label="Showroom"
                value={formData.showroomId}
                onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}
                options={outlets.map((o) => ({ 
                  value: o.id, 
                  label: `${o.code} - ${o.name}` 
                }))}
                placeholder="Select showroom"
                fullWidth
                required
              />

              <Input
                label="Label Count"
                type="number"
                min="1"
                value={formData.labelCount}
                onChange={(e) => setFormData({ ...formData, labelCount: e.target.value })}
                placeholder="Number of labels to print"
                fullWidth
                required
              />

              {selectedOutlet && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    Label Preview
                  </p>
                  <div className="p-4 bg-white rounded border-2 border-dashed border-gray-300 text-center">
                    <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                      {selectedOutlet.code}
                    </p>
                    <p className="text-lg font-medium mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      {selectedOutlet.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.showroomId}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Printer className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? 'Generating...' : 'Generate Labels'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <p>1. Select the showroom from the dropdown menu</p>
            <p>2. Enter the number of labels you want to print</p>
            <p>3. Click "Generate Labels" to create the print data</p>
            <p>4. The system will prepare the labels with the showroom code and name</p>
            <p>5. Print labels will be ready for your label printer</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
