'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { deliveryPlansApi } from '@/lib/api/delivery-plans';
import { dayTypesApi, type DayType } from '@/lib/api/day-types';
import { productsApi, type Product } from '@/lib/api/products';
import { deliveryTurnsApi, type DeliveryTurn } from '@/lib/api/delivery-turns';
import { defaultQuantitiesApi } from '@/lib/api/default-quantities';
import { toast } from 'sonner';

export default function AddDeliveryPlanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dayTypes, setDayTypes] = useState<DayType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryTurns, setDeliveryTurns] = useState<DeliveryTurn[]>([]);
  
  const [formData, setFormData] = useState(() => ({
    planDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dayTypeId: '',
    useFreezerStock: false,
    notes: '',
  }));

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [dayTypesRes, productsRes, turnsRes] = await Promise.all([
        dayTypesApi.getAll(1, 100, undefined, true),
        productsApi.getAll(1, 100, undefined, undefined, true),
        deliveryTurnsApi.getAll(1, 100, undefined, true),
      ]);

      setDayTypes(dayTypesRes.dayTypes);
      setProducts(productsRes.products);
      setDeliveryTurns(turnsRes.deliveryTurns);

      if (dayTypesRes.dayTypes.length > 0) {
        setFormData(prev => ({ ...prev, dayTypeId: dayTypesRes.dayTypes[0].id }));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultQuantitiesForPlan = async (planId: string, dayTypeId: string) => {
    try {
      const defaults = await defaultQuantitiesApi.getAll(1, 1000, undefined, dayTypeId);
      
      const items = defaults.defaultQuantities.map(dq => {
        const product = products.find(p => p.id === dq.productId);
        const defaultTurns = product?.defaultDeliveryTurns || [deliveryTurns[0]?.id];
        
        return defaultTurns.map(turnId => ({
          outletId: dq.outletId,
          productId: dq.productId,
          deliveryTurnId: String(turnId),
          fullQuantity: dq.fullQuantity,
          miniQuantity: dq.miniQuantity,
          isExcluded: false,
        }));
      }).flat();

      if (items.length > 0) {
        await deliveryPlansApi.bulkUpsertItems(planId, items as any);
      }
    } catch (error) {
      console.error('Error loading default quantities:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const newPlan = await deliveryPlansApi.create(formData);
      
      await loadDefaultQuantitiesForPlan(newPlan.id, formData.dayTypeId);
      
      toast.success('Delivery plan created successfully!');
      router.push('/dms/delivery-plan');
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create delivery plan');
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Create Delivery Plan</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create a new delivery plan with auto-loaded defaults
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Plan Date" 
              type="date" 
              value={formData.planDate} 
              onChange={(e) => setFormData({ ...formData, planDate: e.target.value })} 
              helperText="Select delivery date" 
              fullWidth 
              required 
            />
            
            <Select 
              label="Day Type" 
              value={formData.dayTypeId} 
              onChange={(e) => setFormData({ ...formData, dayTypeId: e.target.value })} 
              options={dayTypes.map(dt => ({ value: dt.id, label: dt.name }))} 
              helperText="Determines which default quantities will be auto-loaded" 
              fullWidth 
              required 
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useFreezerStock"
                checked={formData.useFreezerStock}
                onChange={(e) => setFormData({ ...formData, useFreezerStock: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="useFreezerStock" className="text-sm font-medium">
                Use Freezer Stock
              </label>
            </div>
            
            <Input 
              label="Notes" 
              value={formData.notes} 
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
              fullWidth 
            />
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-notes)', border: '1px solid var(--dms-notes-border)' }}>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--dms-notes-title)' }}>Auto-Load Information</p>
              <p className="text-sm" style={{ color: 'var(--dms-notes-fg)' }}>
                Default quantities will be automatically loaded when you create this plan. You can modify quantities after creation.
              </p>
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
                    Create Plan
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
