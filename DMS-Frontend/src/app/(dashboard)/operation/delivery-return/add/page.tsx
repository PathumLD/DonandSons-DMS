'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { deliveryReturnsApi } from '@/lib/api/delivery-returns';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { deliveriesApi, type Delivery } from '@/lib/api/deliveries';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getDateBounds, todayISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function AddDeliveryReturnPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const dateBounds = getDateBounds('today-only', user as any, {
    allowBackDatePermission: 'operation:delivery-return:allow-back-date',
    allowFutureDatePermission: 'operation:delivery-return:allow-future-date',
  });

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    returnDate: todayISO(),
    deliveryNo: '',
    deliveredDate: '',
    showroomId: '',
    reason: '',
  });

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
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await deliveriesApi.getAll(1, 100, {
        fromDate: startOfDay.toISOString(),
        toDate: endOfDay.toISOString(),
        status: 'Approved'
      });

      const foundDeliveries = response.deliveries || [];
      setDeliveries(foundDeliveries);

      if (foundDeliveries.length === 0) {
        const allResponse = await deliveriesApi.getAll(1, 100, {
          fromDate: startOfDay.toISOString(),
          toDate: endOfDay.toISOString()
        });
        const allDeliveries = allResponse.deliveries || [];
        setDeliveries(allDeliveries);
        
        if (allDeliveries.length > 0) {
          toast.info(`Found ${allDeliveries.length} deliveries for this date (not all approved)`);
        } else {
          toast.info('No deliveries found for the selected date');
        }
      } else {
        toast.success(`Found ${foundDeliveries.length} approved deliveries`);
      }

      if (foundDeliveries.length === 1) {
        setFormData(prev => ({
          ...prev,
          deliveryNo: foundDeliveries[0].deliveryNo,
          showroomId: foundDeliveries[0].outletId
        }));
      } else {
        setFormData(prev => ({ ...prev, deliveryNo: '', showroomId: '' }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load deliveries');
      setDeliveries([]);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  const isFormValid = () => {
    return formData.returnDate && formData.deliveryNo && formData.deliveredDate && 
           formData.showroomId && formData.reason && formData.reason.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await deliveryReturnsApi.create({
        returnDate: formData.returnDate,
        deliveryNo: formData.deliveryNo,
        deliveredDate: formData.deliveredDate,
        outletId: formData.showroomId,
        reason: formData.reason,
        items: [],
      });
      toast.success('Delivery return created successfully');
      router.push('/operation/delivery-return');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create delivery return');
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
          onClick={() => router.push('/operation/delivery-return')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Delivery Returns
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Add New Delivery Return
        </h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Create a new delivery return record
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Delivery Return Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Return Date"
                type="date"
                value={formData.returnDate}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
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
                  setFormData({ ...formData, deliveredDate: newDate });
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
                placeholder={
                  isLoadingDeliveries
                    ? "Loading deliveries..."
                    : !formData.deliveredDate
                    ? "Select delivered date first"
                    : deliveries.length === 0
                    ? "No deliveries found for this date"
                    : "Select delivery"
                }
                fullWidth
                required
                disabled={!formData.deliveredDate || isLoadingDeliveries}
              />
              {formData.deliveredDate && !isLoadingDeliveries && (
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {deliveries.length > 0 
                    ? `${deliveries.length} ${deliveries.length === 1 ? 'delivery' : 'deliveries'} found for this date`
                    : 'No deliveries found for this date'}
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
              placeholder="Reason for return..."
              fullWidth
              required
            />

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/operation/delivery-return')}
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
                {isSubmitting ? 'Creating...' : 'Create Return'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
