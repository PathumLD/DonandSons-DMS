'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { stockBfApi } from '@/lib/api/stock-bf';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { productsApi, type Product } from '@/lib/api/products';
import ItemManagementTable, { type ItemManagementItem } from '@/components/operation/ItemManagementTable';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, todayISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function AddStockBFPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const pageTheme = useThemeStore((s) => s.getPageTheme('stock-bf'));
  const dateBounds = getDateBounds('back-3-no-future', user as any, {
    allowBackDatePermission: 'operation:stock-bf:allow-back-date',
    allowFutureDatePermission: 'operation:stock-bf:allow-future-date',
  });

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    bfDate: todayISO(),
    showroomId: '',
  });

  const [stockBfItems, setStockBfItems] = useState<ItemManagementItem[]>([]);

  const isFormValid = () => {
    return formData.bfDate && formData.showroomId && stockBfItems.length > 0;
  };

  useEffect(() => {
    if (!_hasHydrated) return;
    void fetchOutlets();
    void fetchProducts();
  }, [_hasHydrated]);

  const fetchOutlets = async () => {
    try {
      const response = await outletsApi.getAll(1, 1000);
      const list = Array.isArray(response.outlets) ? response.outlets : [];
      setOutlets(list.filter((o) => o.isActive !== false));
    } catch (error: any) {
      const msg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Failed to load showrooms';
      toast.error(msg);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll(1, 1000, undefined, undefined, true);
      const list = Array.isArray(response.products) ? response.products : [];
      setProducts(list.filter((p) => p.isActive !== false));
    } catch (error: any) {
      const msg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Failed to load products';
      toast.error(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.showroomId) {
      toast.error('Please select a showroom');
      return;
    }

    if (stockBfItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await stockBfApi.createBulk({
        bfDate: formData.bfDate,
        outletId: formData.showroomId,
        items: stockBfItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      toast.success(`${stockBfItems.length} Stock BF record(s) created — pending approval`);
      router.push('/operation/stock-bf');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create stock BF');
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Add New Stock BF</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create new opening stock balance records
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock BF Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="BF Date"
              type="date"
              value={formData.bfDate}
              onChange={(e) => setFormData({ ...formData, bfDate: e.target.value })}
              min={dateBounds.min}
              max={dateBounds.max}
              helperText={dateBounds.helperText}
              fullWidth
              required
            />
            
            <Select
              label="Showroom"
              value={formData.showroomId}
              onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}
              options={outlets.map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
              placeholder="Select showroom"
              fullWidth
              required
            />

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Products</h3>
              <ItemManagementTable
                products={products.map(p => ({ id: p.id, code: p.code, name: p.name }))}
                items={stockBfItems}
                onItemsChange={setStockBfItems}
                showUnitPrice={false}
                showReason={false}
                showTotal={true}
                primaryColor={pageTheme?.primaryColor}
              />
            </div>

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
                disabled={isSubmitting || !isFormValid()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Stock BF ({stockBfItems.length} products)
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
