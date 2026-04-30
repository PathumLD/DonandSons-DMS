'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';
import { productionCancelsApi } from '@/lib/api/production-cancels';
import { productsApi, type Product } from '@/lib/api/products';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getDateBounds, todayISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function AddProductionCancelPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const dateBounds = getDateBounds('today-only', user as any, {
    allowBackDatePermission: 'production:cancel:allow-back-date',
    allowFutureDatePermission: 'production:cancel:allow-future-date',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    cancelDate: todayISO(),
    productionNo: '',
    productId: '',
    cancelledQty: '',
    reason: '',
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
    
    if (!formData.productionNo || !formData.productId || !formData.cancelledQty || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await productionCancelsApi.create({
        cancelDate: formData.cancelDate,
        productionNo: formData.productionNo,
        productId: formData.productId,
        cancelledQty: Number(formData.cancelledQty),
        reason: formData.reason,
      });
      toast.success('Production cancellation created successfully');
      router.push('/production/production-cancel');
    } catch (error: any) {
      console.error('Failed to create production cancellation:', error);
      toast.error(error.response?.data?.message || 'Failed to create production cancellation');
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Request Production Cancel</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create a new production cancellation request
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production Cancellation Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Cancel Date"
              type="date"
              value={formData.cancelDate}
              onChange={(e) => setFormData({ ...formData, cancelDate: e.target.value })}
              min={dateBounds.min}
              max={dateBounds.max}
              helperText={dateBounds.helperText}
              fullWidth
              required
            />
            <Input
              label="Production No"
              value={formData.productionNo}
              onChange={(e) => setFormData({ ...formData, productionNo: e.target.value })}
              placeholder="PRO0000001"
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
            <Input
              label="Cancelled Quantity"
              type="number"
              value={formData.cancelledQty}
              onChange={(e) => setFormData({ ...formData, cancelledQty: e.target.value })}
              placeholder="0"
              fullWidth
              required
            />
            <Input
              label="Cancellation Reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Reason for cancellation..."
              fullWidth
              required
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
                {isSubmitting ? 'Submitting...' : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Request
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
