'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ArrowLeft, Plus, Loader2, Zap } from 'lucide-react';
import { immediateOrdersApi, type CreateImmediateOrderDto } from '@/lib/api/immediate-orders';
import { productsApi, type Product } from '@/lib/api/products';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { deliveryTurnsApi, type DeliveryTurn } from '@/lib/api/delivery-turns';
import { toast } from 'sonner';

export default function AddImmediateOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [deliveryTurns, setDeliveryTurns] = useState<DeliveryTurn[]>([]);
  
  const [formData, setFormData] = useState<CreateImmediateOrderDto>({
    outletId: '',
    productId: '',
    deliveryTurnId: '',
    orderDate: new Date().toISOString().split('T')[0],
    quantity: 0,
    notes: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, outletsRes, turnsRes] = await Promise.all([
        productsApi.getAll(1, 100, undefined, undefined, true),
        outletsApi.getAll(1, 100, undefined, undefined, true),
        deliveryTurnsApi.getAll(1, 100, undefined, true),
      ]);

      setProducts(productsRes.products);
      setOutlets(outletsRes.outlets);
      setDeliveryTurns(turnsRes.deliveryTurns);

      if (outletsRes.outlets.length > 0) {
        setFormData(prev => ({ ...prev, outletId: outletsRes.outlets[0].id }));
      }
      if (turnsRes.deliveryTurns.length > 0) {
        setFormData(prev => ({ ...prev, deliveryTurnId: turnsRes.deliveryTurns[0].id }));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await immediateOrdersApi.create(formData);
      
      toast.success('Immediate order created successfully!');
      router.push('/dms/immediate-orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create immediate order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p style={{ color: 'var(--muted-foreground)' }}>Loading...</p>
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Add Immediate Order</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create a new immediate order for urgent requests
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Order Date" 
              type="date" 
              value={formData.orderDate} 
              onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })} 
              fullWidth 
              required 
            />
            
            <Select 
              label="Outlet" 
              value={formData.outletId} 
              onChange={(e) => setFormData({ ...formData, outletId: e.target.value })} 
              options={outlets.map(o => ({ value: o.id, label: o.name }))} 
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
              label="Delivery Turn" 
              value={formData.deliveryTurnId} 
              onChange={(e) => setFormData({ ...formData, deliveryTurnId: e.target.value })} 
              options={deliveryTurns.map(t => ({ value: t.id, label: t.name }))} 
              fullWidth 
              required 
            />
            
            <Input 
              label="Quantity" 
              type="number" 
              min="0" 
              value={formData.quantity.toString()} 
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} 
              placeholder="0" 
              fullWidth 
              required 
            />
            
            <Input 
              label="Notes" 
              value={formData.notes} 
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
              placeholder="Special instructions or notes..." 
              fullWidth 
            />
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-warn-box)', border: '1px solid var(--dms-warn-box-border)' }}>
              <div className="flex items-start space-x-2">
                <Zap className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-primary)' }} />
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--dms-notes-title)' }}>Immediate Order</p>
                  <p className="text-sm" style={{ color: 'var(--dms-notes-fg)' }}>
                    This order requires approval before production. It will be produced immediately once approved.
                  </p>
                </div>
              </div>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Order
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
