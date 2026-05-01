'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { productionCancelsApi, type ProductionCancel } from '@/lib/api/production-cancels';
import { productsApi, type Product } from '@/lib/api/products';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getDateBounds } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function EditProductionCancelPage() {
  const router = useRouter();
  const params = useParams();
  const cancelId = params.id as string;
  const user = useAuthStore((s) => s.user);
  const dateBounds = getDateBounds('today-only', user as any, {
    allowBackDatePermission: 'production:cancel:allow-back-date',
    allowFutureDatePermission: 'production:cancel:allow-future-date',
  });

  const [cancel, setCancel] = useState<ProductionCancel | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    cancelDate: '',
    productionNo: '',
    productId: '',
    cancelledQty: '',
    reason: '',
  });

  useEffect(() => {
    fetchCancel();
    fetchProducts();
  }, [cancelId]);

  const fetchCancel = async () => {
    try {
      setLoading(true);
      const data = await productionCancelsApi.getById(cancelId);
      setCancel(data);
      setFormData({
        cancelDate: data.cancelDate,
        productionNo: data.productionNo,
        productId: data.productId,
        cancelledQty: String(data.cancelledQty),
        reason: data.reason,
      });
    } catch (error: any) {
      console.error('Failed to load production cancellation:', error);
      toast.error(error.response?.data?.message || 'Failed to load production cancellation');
      router.push('/production/production-cancel');
    } finally {
      setLoading(false);
    }
  };

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

    try {
      setIsSubmitting(true);
      await productionCancelsApi.update(cancelId, {
        cancelDate: formData.cancelDate,
        productionNo: formData.productionNo,
        productId: formData.productId,
        cancelledQty: Number(formData.cancelledQty),
        reason: formData.reason,
      });
      toast.success('Production cancellation updated successfully');
      router.push('/production/production-cancel');
    } catch (error: any) {
      console.error('Failed to update production cancellation:', error);
      toast.error(error.response?.data?.message || 'Failed to update production cancellation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p style={{ color: 'var(--muted-foreground)' }}>Loading production cancellation...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Edit Production Cancel</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Update production cancellation information
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
              disabled
            />
            <Input
              label="Production No"
              value={formData.productionNo}
              onChange={(e) => setFormData({ ...formData, productionNo: e.target.value })}
              placeholder="PRO0000001"
              fullWidth
              required
              disabled
            />
            <Select
              label="Product"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              options={products.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
              placeholder="Select product"
              fullWidth
              required
              disabled
            />
            <Input
              label="Cancelled Quantity"
              type="number"
              value={formData.cancelledQty}
              onChange={(e) => setFormData({ ...formData, cancelledQty: e.target.value })}
              placeholder="0"
              fullWidth
              required
              disabled
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
                {isSubmitting ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
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
