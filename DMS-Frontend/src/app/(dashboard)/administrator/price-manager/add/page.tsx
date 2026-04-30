'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { ArrowLeft, Plus } from 'lucide-react';
import { priceListsApi, type CreatePriceListDto } from '@/lib/api/price-lists';
import toast from 'react-hot-toast';

export default function AddPriceListPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    priceListType: 'Standard',
    currency: 'LKR',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: undefined as string | undefined,
    isDefault: false,
    priority: 0,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const createData: CreatePriceListDto = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        priceListType: formData.priceListType,
        currency: formData.currency,
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo,
        isDefault: formData.isDefault,
        priority: formData.priority,
        isActive: formData.isActive,
      };
      await priceListsApi.create(createData);
      toast.success('Price list created successfully');
      router.push('/administrator/price-manager');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create price list');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Add New Price List</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create a new price list for pricing management
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price List Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price List Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., PL001"
                fullWidth
                required
              />
              <Input
                label="Price List Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Standard Price List"
                fullWidth
                required
              />
            </div>

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              fullWidth
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Price List Type
                </label>
                <select
                  value={formData.priceListType}
                  onChange={(e) => setFormData({ ...formData, priceListType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid var(--input)' }}
                >
                  <option value="Standard">Standard</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Retail">Retail</option>
                  <option value="Special">Special</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid var(--input)' }}
                >
                  <option value="LKR">LKR - Sri Lankan Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Effective From"
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                fullWidth
                required
              />
              <Input
                label="Effective To (Optional)"
                type="date"
                value={formData.effectiveTo || ''}
                onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value || undefined })}
                fullWidth
              />
              <Input
                label="Priority"
                type="number"
                value={formData.priority.toString()}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Toggle
                checked={formData.isDefault}
                onChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                label="Set as Default"
              />
              <Toggle
                checked={formData.isActive}
                onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                label="Active Status"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Price List
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
