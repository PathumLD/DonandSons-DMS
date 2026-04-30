'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Checkbox from '@/components/ui/checkbox';
import { Toggle } from '@/components/ui/toggle';
import { ArrowLeft, Plus } from 'lucide-react';
import { productsApi, type CreateProductDto } from '@/lib/api/products';
import { categoriesApi, type Category } from '@/lib/api/categories';
import { uomsApi, type UnitOfMeasure } from '@/lib/api/uoms';
import toast from 'react-hot-toast';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [uoms, setUOMs] = useState<UnitOfMeasure[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreateProductDto>>({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    unitOfMeasureId: '',
    unitPrice: 0,
    productType: '',
    productionSection: '',
    hasFullSize: true,
    hasMiniSize: false,
    allowDecimal: false,
    decimalPlaces: 0,
    roundingValue: 1,
    isPlainRollItem: false,
    requireOpenStock: true,
    enableLabelPrint: true,
    allowFutureLabelPrint: false,
    sortOrder: 0,
    defaultDeliveryTurns: [],
    availableInTurns: [],
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchUOMs();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll(1, 100, undefined, true);
      setCategories(response.categories);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchUOMs = async () => {
    try {
      const response = await uomsApi.getAll(1, 100, undefined, true);
      setUOMs(response.unitOfMeasures);
    } catch (err: any) {
      console.error('Failed to load UOMs:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const dto: CreateProductDto = {
        code: formData.code!,
        name: formData.name!,
        description: formData.description,
        categoryId: formData.categoryId!,
        unitOfMeasureId: formData.unitOfMeasureId!,
        unitPrice: Number(formData.unitPrice),
        productType: formData.productType,
        productionSection: formData.productionSection,
        hasFullSize: formData.hasFullSize!,
        hasMiniSize: formData.hasMiniSize!,
        allowDecimal: formData.allowDecimal!,
        decimalPlaces: Number(formData.decimalPlaces),
        roundingValue: Math.floor(Number(formData.roundingValue) || 1),
        isPlainRollItem: formData.isPlainRollItem!,
        requireOpenStock: formData.requireOpenStock!,
        enableLabelPrint: formData.enableLabelPrint!,
        allowFutureLabelPrint: formData.allowFutureLabelPrint!,
        sortOrder: Number(formData.sortOrder),
        defaultDeliveryTurns: formData.defaultDeliveryTurns || [],
        availableInTurns: formData.availableInTurns || [],
        isActive: formData.isActive!,
      };
      
      await productsApi.create(dto);
      toast.success('Product created successfully');
      router.push('/inventory/products');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create product';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Add New Product</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create a new product in your catalog
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Code"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., ACT33, BR2, BU12"
                fullWidth
                required
              />
              <Input
                label="Product Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full product name"
                fullWidth
                required
              />
            </div>

            <Input
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description (optional)"
              fullWidth
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Product Category"
                value={formData.categoryId || ''}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Select category"
                fullWidth
                required
              />
              <Select
                label="Unit of Measure"
                value={formData.unitOfMeasureId || ''}
                onChange={(e) => setFormData({ ...formData, unitOfMeasureId: e.target.value })}
                options={uoms.map(u => ({ value: u.id, label: `${u.code} - ${u.description}` }))}
                placeholder="Select UOM"
                fullWidth
                required
              />
            </div>

            <Input
              label="Unit Price (Rs.)"
              type="number"
              step="0.01"
              value={formData.unitPrice?.toString() || '0'}
              onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
              placeholder="0.00"
              fullWidth
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Checkbox
                label="Require Open Stock"
                checked={formData.requireOpenStock || false}
                onChange={(e) => setFormData({ ...formData, requireOpenStock: e.target.checked })}
              />
              <Checkbox
                label="Enable Label Print"
                checked={formData.enableLabelPrint || false}
                onChange={(e) => setFormData({ ...formData, enableLabelPrint: e.target.checked })}
              />
            </div>

            <div className="pt-2">
              <Toggle
                checked={formData.isActive || false}
                onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                label="Active Status"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
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
