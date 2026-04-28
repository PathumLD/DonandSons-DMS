'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Calendar, Plus, Search, Eye, Edit, Save, Loader2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { deliveryPlansApi, type DeliveryPlan, type BulkUpsertDeliveryPlanItemDto, type DeliveryPlanItem } from '@/lib/api/delivery-plans';
import { dayTypesApi, type DayType } from '@/lib/api/day-types';
import { productsApi, type Product } from '@/lib/api/products';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { deliveryTurnsApi, type DeliveryTurn } from '@/lib/api/delivery-turns';
import { defaultQuantitiesApi } from '@/lib/api/default-quantities';
import { toast } from 'sonner';

export default function DeliveryPlanPage() {
  const [plans, setPlans] = useState<DeliveryPlan[]>([]);
  const [dayTypes, setDayTypes] = useState<DayType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [deliveryTurns, setDeliveryTurns] = useState<DeliveryTurn[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DeliveryPlan | null>(null);
  
  const [formData, setFormData] = useState(() => ({
    planDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dayTypeId: '',
    useFreezerStock: false,
    notes: '',
  }));

  const [editItems, setEditItems] = useState<{ [key: string]: DeliveryPlanItem }>({});
  const [excludedKeys, setExcludedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadPlans();
  }, [currentPage, pageSize, statusFilter, searchTerm]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [dayTypesRes, productsRes, outletsRes, turnsRes] = await Promise.all([
        dayTypesApi.getAll(1, 100, undefined, true),
        productsApi.getAll(1, 100, undefined, undefined, true),
        outletsApi.getAll(1, 100, undefined, undefined, true),
        deliveryTurnsApi.getAll(1, 100, undefined, true),
      ]);

      setDayTypes(dayTypesRes.dayTypes);
      setProducts(productsRes.products);
      setOutlets(outletsRes.outlets);
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

  const loadPlans = async () => {
    try {
      const response = await deliveryPlansApi.getAll(
        currentPage,
        pageSize,
        undefined,
        undefined,
        statusFilter || undefined
      );
      setPlans(response.deliveryPlans as any);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load delivery plans');
    }
  };

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      const newPlan = await deliveryPlansApi.create(formData);
      
      await loadDefaultQuantitiesForPlan(newPlan.id, formData.dayTypeId);
      
      toast.success('Delivery plan created successfully!');
      setShowAddModal(false);
      resetForm();
      await loadPlans();
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create delivery plan');
    } finally {
      setIsSubmitting(false);
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

  const handleEdit = async (plan: DeliveryPlan) => {
    setSelectedPlan(plan);
    const fullPlan = await deliveryPlansApi.getById(plan.id);
    setSelectedPlan(fullPlan);
    
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
    setShowEditModal(true);
  };

  const handleSaveItems = async () => {
    if (!selectedPlan) return;

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

      await deliveryPlansApi.bulkUpsertItems(selectedPlan.id, items);
      
      toast.success('Items saved successfully!');
      setShowEditModal(false);
      await loadPlans();
    } catch (error) {
      console.error('Error saving items:', error);
      toast.error('Failed to save items');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPlan = async (planId: string) => {
    try {
      await deliveryPlansApi.submit(planId);
      toast.success('Plan submitted successfully!');
      await loadPlans();
    } catch (error) {
      console.error('Error submitting plan:', error);
      toast.error('Failed to submit plan');
    }
  };

  const resetForm = () => {
    setFormData({
      planDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      dayTypeId: dayTypes[0]?.id || '',
      useFreezerStock: false,
      notes: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered': return <Badge variant="success" size="sm">Delivered</Badge>;
      case 'Completed': return <Badge variant="success" size="sm">Completed</Badge>;
      case 'InProduction': return <Badge variant="warning" size="sm">In Production</Badge>;
      case 'Draft': return <Badge variant="neutral" size="sm">Draft</Badge>;
      default: return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const getDayTypeBadge = (dayTypeName: string) => {
    const colors: { [key: string]: string } = {
      'Weekday': '#3B82F6',
      'Saturday': '#F59E0B',
      'Sunday': '#10B981',
      'Holiday': '#DC2626',
    };
    const color = colors[dayTypeName] || '#6B7280';
    return <span className="inline-flex items-center font-medium rounded-full px-2.5 py-1 text-xs text-white" style={{ backgroundColor: color }}>{dayTypeName}</span>;
  };

  const columns = [
    { 
      key: 'planDate', 
      label: 'Plan Date', 
      render: (item: any) => <span className="font-medium">{new Date(item.planDate).toLocaleDateString()}</span> 
    },
    { 
      key: 'planNo', 
      label: 'Plan No', 
      render: (item: any) => <span className="font-mono font-semibold" style={{ color: 'var(--brand-primary)' }}>{item.planNo}</span> 
    },
    { 
      key: 'dayType', 
      label: 'Day Type', 
      render: (item: any) => getDayTypeBadge(item.dayTypeName) 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (item: any) => getStatusBadge(item.status) 
    },
    { 
      key: 'totalItems', 
      label: 'Items', 
      render: (item: any) => <span className="font-medium">{item.totalItems || 0}</span> 
    },
    { 
      key: 'totalQuantity', 
      label: 'Total Qty', 
      render: (item: any) => <span className="font-medium">{item.totalQuantity || 0}</span> 
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (item: any) => (
        <div className="flex items-center space-x-2">
          <button 
            type="button" 
            onClick={() => { setSelectedPlan(item); setShowViewModal(true); }} 
            className="p-1.5 rounded transition-colors" 
            style={{ color: 'var(--muted-foreground)' }} 
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status === 'Draft' && (
            <>
              <button 
                type="button" 
                onClick={() => handleEdit(item)} 
                className="p-1.5 rounded transition-colors" 
                style={{ color: 'var(--muted-foreground)' }} 
                title="Edit Items"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={() => handleSubmitPlan(item.id)} 
                className="p-1.5 rounded transition-colors" 
                style={{ color: 'var(--success)' }} 
                title="Submit"
              >
                <Check className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-primary)' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>Loading delivery plans...</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Delivery Plan Creation</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Create and manage delivery plans with auto-loaded defaults ({totalCount} plans)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Delivery Plans</CardTitle>
            <div className="flex items-center space-x-3">
              <Select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
                options={[
                  { value: '', label: 'All Status' }, 
                  { value: 'Draft', label: 'Draft' }, 
                  { value: 'InProduction', label: 'In Production' }, 
                  { value: 'Completed', label: 'Completed' }, 
                  { value: 'Delivered', label: 'Delivered' }
                ]} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable 
            data={plans} 
            columns={columns} 
            currentPage={currentPage} 
            totalPages={totalPages} 
            pageSize={pageSize} 
            onPageChange={setCurrentPage} 
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} 
          />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Delivery Plan" size="md">
        <div className="space-y-4">
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
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdd} disabled={isSubmitting}>
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
        </ModalFooter>
      </Modal>

      <Modal 
        isOpen={showEditModal} 
        onClose={() => { setShowEditModal(false); setSelectedPlan(null); }} 
        title={`Edit Plan Items - ${selectedPlan?.planNo}`} 
        size="xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
              <thead style={{ backgroundColor: 'var(--muted)' }}>
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
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedPlan(null); }} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveItems} disabled={isSubmitting}>
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
        </ModalFooter>
      </Modal>

      <Modal 
        isOpen={showViewModal} 
        onClose={() => { setShowViewModal(false); setSelectedPlan(null); }} 
        title="Delivery Plan Details" 
        size="md"
      >
        {selectedPlan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Plan No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedPlan.planNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                {getStatusBadge(selectedPlan.status)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Plan Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selectedPlan.planDate).toLocaleDateString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Day Type</p>
                {getDayTypeBadge(selectedPlan.dayTypeName)}
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Freezer Stock</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedPlan.useFreezerStock ? 'Yes' : 'No'}</p>
              </div>
            </div>
            {selectedPlan.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedPlan.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selectedPlan.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedPlan(null); }}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
