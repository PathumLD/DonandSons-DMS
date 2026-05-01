'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { disposalsApi } from '@/lib/api/disposals';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { productsApi, type Product } from '@/lib/api/products';
import ItemManagementTable, { type ItemManagementItem } from '@/components/operation/ItemManagementTable';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, todayISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function AddDisposalPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const dateBounds = getDateBounds('today-only', user as any);
  const pageTheme = useThemeStore((s) => s.getPageTheme('disposal'));

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    disposalDate: todayISO(),
    showroomId: '',
    notes: '',
  });

  const [disposalItems, setDisposalItems] = useState<ItemManagementItem[]>([]);

  const isFormValid = () => {
    return formData.disposalDate && formData.showroomId && disposalItems.length > 0;
  };

  useEffect(() => {
    fetchOutlets();
    fetchProducts();
  }, []);

  const fetchOutlets = async () => {
    try {
      const response = await outletsApi.getAll();
      setOutlets(response.outlets.filter(o => o.isActive));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load outlets');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll(1, 1000);
      setProducts(response.products.filter(p => p.isActive));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load products');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.showroomId) {
      toast.error('Please select a showroom');
      return;
    }

    if (disposalItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await disposalsApi.create({
        disposalDate: formData.disposalDate,
        outletId: formData.showroomId,
        notes: formData.notes,
        items: disposalItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          reason: item.reason || '',
        })),
      });
      toast.success('Disposal created successfully');
      router.push('/operation/disposal');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create disposal');
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Add New Disposal</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create a new product disposal record
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disposal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={<span>Disposal Date <span className="text-red-500">*</span></span>}
                type="date"
                value={formData.disposalDate}
                onChange={(e) => setFormData({ ...formData, disposalDate: e.target.value })}
                min={dateBounds.min}
                max={dateBounds.max}
                helperText={dateBounds.helperText}
                fullWidth
                required
              />
              <Select
                label={<span>Showroom <span className="text-red-500">*</span></span>}
                value={formData.showroomId}
                onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}
                options={outlets.map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
                placeholder="Select showroom"
                fullWidth
                required
              />
            </div>
            
            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              fullWidth
            />
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                Disposal Items <span className="text-red-500">*</span>
              </h3>
              <ItemManagementTable
                products={products}
                items={disposalItems}
                onItemsChange={setDisposalItems}
                showReason={true}
                reasonLabel="Reason *"
                reasonPlaceholder="Reason for disposal (required)"
                showUnitPrice={false}
                showTotal={false}
                primaryColor={pageTheme?.secondaryColor || '#C8102E'}
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
                    Create Disposal
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
