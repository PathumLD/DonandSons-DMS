'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { cancellationsApi } from '@/lib/api/cancellations';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { deliveriesApi, type Delivery } from '@/lib/api/deliveries';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getDateBounds, todayISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function AddCancellationPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const dateBounds = getDateBounds('back-3-no-future', user as any, {
    allowBackDatePermission: 'operation:cancellation:allow-back-date',
    allowFutureDatePermission: 'operation:cancellation:allow-future-date',
  });

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    cancellationDate: todayISO(),
    deliveryNo: '',
    deliveredDate: '',
    showroomId: '',
    reason: '',
  });

  const isFormValid = () => {
    return formData.cancellationDate && formData.deliveryNo && formData.deliveredDate &&
           formData.showroomId && formData.reason && formData.reason.trim();
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  const fetchOutlets = async () => {
    try {
      const response = await outletsApi.getAll();
      setOutlets(response.outlets.filter(o => o.isActive));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load outlets');
    }
  };

  const fetchDeliveriesByDate = async (date: string) => {
    if (!date) {
      setDeliveries([]);
      return;
    }

    try {
      setIsLoadingDeliveries(true);
      const startOfDay = new Date(date + 'T00:00:00Z');
      const endOfDay = new Date(date + 'T23:59:59.999Z');
      
      let response = await deliveriesApi.getAll(1, 100, {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
        status: 'Approved',
      });
      
      if (!response.deliveries || response.deliveries.length === 0) {
        response = await deliveriesApi.getAll(1, 100, {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
        });
        
        if (response.deliveries && response.deliveries.length > 0) {
          toast.info(`Found ${response.deliveries.length} delivery(ies) (not all approved)`);
        }
      }
      
      setDeliveries(response.deliveries || []);
      
      if (response.deliveries?.length === 1) {
        setFormData(prev => ({
          ...prev,
          deliveryNo: response.deliveries[0].deliveryNo,
          showroomId: response.deliveries[0].outletId,
        }));
        toast.success('Delivery auto-selected');
      } else if (response.deliveries?.length > 1) {
        toast.success(`${response.deliveries.length} deliveries found`);
      } else {
        toast.info('No deliveries found for this date');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load deliveries');
      setDeliveries([]);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await cancellationsApi.create({
        cancellationDate: formData.cancellationDate,
        deliveryNo: formData.deliveryNo,
        deliveredDate: formData.deliveredDate,
        outletId: formData.showroomId,
        reason: formData.reason,
      });
      toast.success('Cancellation request created successfully');
      router.push('/operation/cancellation');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create cancellation');
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Add New Cancellation</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create a new delivery cancellation request
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cancellation Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Cancellation Date"
                type="date"
                value={formData.cancellationDate}
                onChange={(e) => setFormData({ ...formData, cancellationDate: e.target.value })}
                min={dateBounds.min}
                max={dateBounds.max}
                helperText={dateBounds.helperText}
                fullWidth
                required
              />
              <Input
                label="Delivered Date"
                type="date"
                value={formData.deliveredDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setFormData({ ...formData, deliveredDate: newDate, deliveryNo: '', showroomId: '' });
                  fetchDeliveriesByDate(newDate);
                }}
                fullWidth
                required
              />
            </div>
            
            <div>
              <Select
                label="Delivery No"
                value={formData.deliveryNo}
                onChange={(e) => {
                  const selectedDelivery = deliveries.find(d => d.deliveryNo === e.target.value);
                  setFormData({ 
                    ...formData, 
                    deliveryNo: e.target.value,
                    showroomId: selectedDelivery?.outletId || formData.showroomId
                  });
                }}
                options={deliveries.map(d => ({
                  value: d.deliveryNo,
                  label: `${d.deliveryNo} - ${d.outlet?.name || d.outletName || ''}`
                }))}
                placeholder={isLoadingDeliveries ? "Loading deliveries..." : formData.deliveredDate ? "Select delivery" : "Select delivered date first"}
                fullWidth
                required
                disabled={!formData.deliveredDate || isLoadingDeliveries}
              />
              {formData.deliveredDate && !isLoadingDeliveries && (
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {deliveries.length > 0 
                    ? `${deliveries.length} approved ${deliveries.length === 1 ? 'delivery' : 'deliveries'} found for this date`
                    : 'No approved deliveries found for this date'}
                </p>
              )}
            </div>
            
            <Select
              label="Showroom"
              value={formData.showroomId}
              onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}
              options={outlets.map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
              placeholder="Select showroom"
              fullWidth
              required
            />
            
            <Input
              label="Reason"
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
                    Create Cancellation
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
