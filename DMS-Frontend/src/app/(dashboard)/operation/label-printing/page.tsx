'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Printer, Download } from 'lucide-react';
import { mockProducts } from '@/lib/mock-data/products';

export default function LabelPrintingPage() {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '1',
    startDate: new Date().toISOString().split('T')[0],
    expiryDays: '7',
    priceOverride: '',
  });

  const handlePrint = () => {
    console.log('Printing labels:', formData);
    alert(`Printing ${formData.quantity} label(s) for selected product`);
  };

  const handleDownload = () => {
    console.log('Downloading labels:', formData);
    alert(`Downloading ${formData.quantity} label(s) as PDF`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Label Printing</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>
          Generate and print product labels with pricing and expiry information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Label Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select
                label="Product"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                options={mockProducts.filter(p => p.active && p.enableLabelPrint).map(p => ({ value: p.id, label: `${p.code} - ${p.description}` }))}
                placeholder="Select product"
                fullWidth
                required
              />
              <Input
                label="Quantity (Number of Labels)"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="1"
                fullWidth
                required
              />
              <Input
                label="Production/Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                fullWidth
                required
              />
              <Input
                label="Expiry Days (from start date)"
                type="number"
                value={formData.expiryDays}
                onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
                placeholder="7"
                helperText="Number of days until product expires"
                fullWidth
                required
              />
              <Input
                label="Price Override (Optional)"
                type="number"
                step="0.01"
                value={formData.priceOverride}
                onChange={(e) => setFormData({ ...formData, priceOverride: e.target.value })}
                placeholder="Leave empty to use default price"
                helperText="Override the default product price"
                fullWidth
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Label Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8" style={{ borderColor: '#D1D5DB' }}>
              <div className="text-center space-y-4">
                {formData.productId ? (
                  <>
                    <div className="p-6 bg-white rounded-lg shadow-md" style={{ border: '2px solid #C8102E' }}>
                      <div className="text-center space-y-2">
                        <div className="text-xs font-semibold" style={{ color: '#6B7280' }}>DON & SONS</div>
                        <div className="text-lg font-bold" style={{ color: '#111827' }}>
                          {mockProducts.find(p => p.id === Number(formData.productId))?.description}
                        </div>
                        <div className="text-sm font-mono" style={{ color: '#6B7280' }}>
                          {mockProducts.find(p => p.id === Number(formData.productId))?.code}
                        </div>
                        <div className="text-2xl font-bold" style={{ color: '#C8102E' }}>
                          Rs. {formData.priceOverride || mockProducts.find(p => p.id === Number(formData.productId))?.unitPrice.toFixed(2)}
                        </div>
                        <div className="text-xs" style={{ color: '#6B7280' }}>
                          Mfg: {new Date(formData.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs" style={{ color: '#6B7280' }}>
                          Exp: {new Date(new Date(formData.startDate).getTime() + Number(formData.expiryDays) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      This is a preview of how the label will appear
                    </p>
                  </>
                ) : (
                  <div className="py-12">
                    <Printer className="w-16 h-16 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>
                      Select a product to preview the label
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                variant="primary"
                size="md"
                onClick={handlePrint}
                disabled={!formData.productId}
                fullWidth
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Labels
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleDownload}
                disabled={!formData.productId}
                fullWidth
              >
                <Download className="w-4 h-4 mr-2" />
                Download as PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Label Prints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { product: 'BR2 - Sandwich Bread Large', qty: 50, date: '2026-04-21 10:00', user: 'admin' },
              { product: 'BU12 - Fish Bun', qty: 30, date: '2026-04-21 09:45', user: 'admin' },
              { product: 'PZ8 - Chicken Pizza Large', qty: 20, date: '2026-04-21 09:30', user: 'operator1' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ border: '1px solid #E5E7EB' }}
              >
                <div>
                  <p className="font-medium" style={{ color: '#111827' }}>{item.product}</p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    {item.qty} labels • {item.date} • {item.user}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Reprint
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
