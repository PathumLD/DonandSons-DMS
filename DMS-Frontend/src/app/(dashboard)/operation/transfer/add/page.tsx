'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { transfersApi } from '@/lib/api/transfers';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { productsApi, type Product } from '@/lib/api/products';
import ItemManagementTable, { type ItemManagementItem } from '@/components/operation/ItemManagementTable';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, todayISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function AddTransferPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('transfer'));
  const dateBounds = getDateBounds('back-3-no-future', user as any, {
    allowBackDatePermission: 'operation:transfer:allow-back-date',
    allowFutureDatePermission: 'operation:transfer:allow-future-date',
  });

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferItems, setTransferItems] = useState<ItemManagementItem[]>([]);
  
  const [formData, setFormData] = useState({
    transferDate: todayISO(),
    fromShowroomId: '',
    toShowroomId: '',
    notes: '',
  });

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

  const isFormValid = () => {
    return formData.transferDate && formData.fromShowroomId && formData.toShowroomId && 
           formData.fromShowroomId !== formData.toShowroomId && transferItems.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fromShowroomId || !formData.toShowroomId) {
      toast.error('Please select both showrooms');
      return;
    }

    if (formData.fromShowroomId === formData.toShowroomId) {
      toast.error('From and To outlets must be different');
      return;
    }

    if (transferItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await transfersApi.create({
        transferDate: formData.transferDate,
        fromOutletId: formData.fromShowroomId,
        toOutletId: formData.toShowroomId,
        notes: formData.notes,
        items: transferItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      toast.success('Transfer created successfully');
      router.push('/operation/transfer');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create transfer');
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
          onClick={() => router.push('/operation/transfer')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Transfers
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Add New Transfer
        </h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Create a new stock transfer between showrooms
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Transfer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label={<span>Transfer Date <span className="text-red-500">*</span></span>}
              type="date"
              value={formData.transferDate}
              onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
              min={dateBounds.min}
              max={dateBounds.max}
              helperText={dateBounds.helperText}
              fullWidth
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={<span>From Showroom <span className="text-red-500">*</span></span>}
                value={formData.fromShowroomId}
                onChange={(e) => setFormData({ ...formData, fromShowroomId: e.target.value })}
                options={outlets.filter(o => o.id !== formData.toShowroomId).map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
                placeholder="Select source showroom"
                fullWidth
                required
              />
              <Select
                label={<span>To Showroom <span className="text-red-500">*</span></span>}
                value={formData.toShowroomId}
                onChange={(e) => setFormData({ ...formData, toShowroomId: e.target.value })}
                options={outlets.filter(o => o.id !== formData.fromShowroomId).map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
                placeholder="Select destination showroom"
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
                Transfer Items <span className="text-red-500">*</span>
              </h3>
              <ItemManagementTable
                products={products}
                items={transferItems}
                onItemsChange={setTransferItems}
                showReason={false}
                showUnitPrice={false}
                showTotal={false}
                primaryColor={pageTheme?.secondaryColor || '#C8102E'}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/operation/transfer')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !isFormValid()}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? 'Creating...' : 'Create Transfer'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
