'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';
import { stockAdjustmentsApi } from '@/lib/api/stock-adjustments';
import { productsApi, type Product } from '@/lib/api/products';
import { todayISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function AddStockAdjustmentPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    adjustmentDate: todayISO(),
    productId: '',
    adjustmentType: 'Increase' as 'Increase' | 'Decrease',
    quantity: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchProducts();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.quantity || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await stockAdjustmentsApi.create({
        adjustmentDate: formData.adjustmentDate,
        productId: formData.productId,
        adjustmentType: formData.adjustmentType,
        quantity: Number(formData.quantity),
        reason: formData.reason,
        notes: formData.notes || undefined,
      });
      toast.success('Stock adjustment created successfully');
      router.push('/production/stock-adjustment');
    } catch (error: any) {
      console.error('Failed to create stock adjustment:', error);
      toast.error(error.response?.data?.message || 'Failed to create stock adjustment');
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Add Stock Adjustment</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create a new stock adjustment
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Adjustment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Adjustment Date"
              type="date"
              value={formData.adjustmentDate}
              onChange={(e) => setFormData({ ...formData, adjustmentDate: e.target.value })}
              fullWidth
              required
            />
            <Select
              label="Product"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              options={products.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
              placeholder="Select product"
              fullWidth
              required
            />
            <Select
              label="Adjustment Type"
              value={formData.adjustmentType}
              onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value as any })}
              options={[
                { value: 'Increase', label: 'Increase Stock' },
                { value: 'Decrease', label: 'Decrease Stock' }
              ]}
              fullWidth
              required
            />
            <Input
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="0"
              fullWidth
              required
            />
            <Input
              label="Reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Reason for adjustment..."
              fullWidth
              required
            />
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
                    Create Adjustment
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
