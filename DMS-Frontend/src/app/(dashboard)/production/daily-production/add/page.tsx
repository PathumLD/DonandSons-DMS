'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';
import { dailyProductionsApi } from '@/lib/api/daily-productions';
import { productsApi, type Product } from '@/lib/api/products';
import { shiftsApi, type Shift } from '@/lib/api/shifts';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getDateBounds, todayISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function AddDailyProductionPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const dateBounds = getDateBounds('today-only', user as any, {
    allowBackDatePermission: 'production:daily:allow-back-date',
    allowFutureDatePermission: 'production:daily:allow-future-date',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    productionDate: todayISO(),
    productId: '',
    plannedQty: '',
    producedQty: '0',
    shiftId: '',
    notes: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchShifts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll(1, 1000);
      const productsList = Array.isArray(response.products) ? response.products : [];
      setProducts(productsList.filter((p: Product) => p.isActive));
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    }
  };

  const fetchShifts = async () => {
    try {
      const data = await shiftsApi.getActive();
      setShifts(data);
      if (data.length > 0 && !formData.shiftId) {
        setFormData(prev => ({ ...prev, shiftId: data[0].id }));
      }
    } catch (error) {
      console.error('Failed to load shifts:', error);
      toast.error('Failed to load shifts');
      setShifts([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.plannedQty || !formData.shiftId) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await dailyProductionsApi.create({
        productionDate: formData.productionDate,
        productId: formData.productId,
        plannedQty: Number(formData.plannedQty),
        producedQty: Number(formData.producedQty),
        shiftId: formData.shiftId,
        notes: formData.notes || undefined,
      });
      toast.success('Production created successfully');
      router.push('/production/daily-production');
    } catch (error: any) {
      console.error('Failed to create production:', error);
      toast.error(error.response?.data?.message || 'Failed to create production');
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Add New Production</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create a new daily production entry
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Production Date"
                type="date"
                value={formData.productionDate}
                onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                min={dateBounds.min}
                max={dateBounds.max}
                helperText={dateBounds.helperText}
                fullWidth
                required
              />
              <Select
                label="Shift"
                value={formData.shiftId}
                onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                options={shifts.map(s => ({ value: s.id, label: s.name }))}
                placeholder="Select shift"
                fullWidth
                required
              />
            </div>
            <Select
              label="Product"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              options={products.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
              placeholder="Select product"
              fullWidth
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Planned Quantity"
                type="number"
                value={formData.plannedQty}
                onChange={(e) => setFormData({ ...formData, plannedQty: e.target.value })}
                placeholder="0"
                fullWidth
                required
              />
              <Input
                label="Produced Quantity"
                type="number"
                value={formData.producedQty}
                onChange={(e) => setFormData({ ...formData, producedQty: e.target.value })}
                placeholder="0"
                fullWidth
                required
              />
            </div>
            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes"
              fullWidth
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Production
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
