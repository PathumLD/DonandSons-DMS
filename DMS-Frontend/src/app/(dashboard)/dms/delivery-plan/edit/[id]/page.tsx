'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { deliveryPlansApi, type DeliveryPlan, type BulkUpsertDeliveryPlanItemDto, type DeliveryPlanItem } from '@/lib/api/delivery-plans';
import { toast } from 'sonner';

export default function EditDeliveryPlanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plan, setPlan] = useState<DeliveryPlan | null>(null);
  const [editItems, setEditItems] = useState<{ [key: string]: DeliveryPlanItem }>({});
  const [excludedKeys, setExcludedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      setIsLoading(true);
      const fullPlan = await deliveryPlansApi.getById(id);
      setPlan(fullPlan);
      
      const itemsMap: { [key: string]: DeliveryPlanItem } = {};
      const excluded = new Set<string>();
      
      fullPlan.items.forEach(item => {
        const key = `${item.productId}-${item.outletId}-${item.deliveryTurnId}`;
        itemsMap[key] = item;
        if (item.isExcluded) {
          excluded.add(key);
        }
      });
      
      setEditItems(itemsMap);
      setExcludedKeys(excluded);
    } catch (error) {
      console.error('Error loading plan:', error);
      toast.error('Failed to load delivery plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItems = async () => {
    if (!plan) return;

    try {
      setIsSubmitting(true);
      
      const items: BulkUpsertDeliveryPlanItemDto[] = Object.entries(editItems).map(([key, item]) => ({
        id: item.id,
        outletId: item.outletId,
        productId: item.productId,
        deliveryTurnId: item.deliveryTurnId,
        fullQuantity: item.fullQuantity,
        miniQuantity: item.miniQuantity,
        isExcluded: excludedKeys.has(key),
      }));

      await deliveryPlansApi.bulkUpsertItems(plan.id, items);
      
      toast.success('Items saved successfully!');
      router.push('/dms/delivery-plan');
    } catch (error) {
      console.error('Error saving items:', error);
      toast.error('Failed to save items');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p style={{ color: 'var(--muted-foreground)' }}>Loading plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p style={{ color: 'var(--muted-foreground)' }}>Plan not found</p>
          <Button variant="primary" onClick={() => router.push('/dms/delivery-plan')} className="mt-4">
            Back to Plans
          </Button>
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Edit Plan Items - {plan.planNo}</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Modify quantities and exclusions for delivery plan items
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
              <thead style={{ backgroundColor: 'var(--muted)' }} className="sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium">Product</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Outlet</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">Turn</th>
                  <th className="px-3 py-2 text-center text-xs font-medium">Full</th>
                  <th className="px-3 py-2 text-center text-xs font-medium">Mini</th>
                  <th className="px-3 py-2 text-center text-xs font-medium">Exclude</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                {Object.entries(editItems).map(([key, item]) => (
                  <tr key={key}>
                    <td className="px-3 py-2 text-sm">{item.productName}</td>
                    <td className="px-3 py-2 text-sm">{item.outletName}</td>
                    <td className="px-3 py-2 text-sm">{item.deliveryTurnName}</td>
                    <td className="px-1 py-1">
                      <input
                        type="number"
                        min="0"
                        value={item.fullQuantity}
                        onChange={(e) => {
                          const newItems = { ...editItems };
                          newItems[key] = { ...item, fullQuantity: parseInt(e.target.value) || 0 };
                          setEditItems(newItems);
                        }}
                        disabled={excludedKeys.has(key)}
                        className="w-20 px-2 py-1 text-sm text-center rounded"
                        style={{ border: '1px solid var(--input)' }}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        type="number"
                        min="0"
                        value={item.miniQuantity}
                        onChange={(e) => {
                          const newItems = { ...editItems };
                          newItems[key] = { ...item, miniQuantity: parseInt(e.target.value) || 0 };
                          setEditItems(newItems);
                        }}
                        disabled={excludedKeys.has(key)}
                        className="w-20 px-2 py-1 text-sm text-center rounded"
                        style={{ border: '1px solid var(--input)' }}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={excludedKeys.has(key)}
                        onChange={(e) => {
                          const newExcluded = new Set(excludedKeys);
                          if (e.target.checked) {
                            newExcluded.add(key);
                          } else {
                            newExcluded.delete(key);
                          }
                          setExcludedKeys(newExcluded);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveItems}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Items
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
