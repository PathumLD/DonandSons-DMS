'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { ArrowLeft, Save } from 'lucide-react';
import { sectionConsumablesApi, type UpdateSectionConsumableDto, type SectionConsumable } from '@/lib/api/section-consumables';
import toast from 'react-hot-toast';

export default function EditSectionConsumablePage() {
  const router = useRouter();
  const params = useParams();
  const consumableId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    productionSectionId: '',
    ingredientId: '',
    quantityPerUnit: 1,
    formula: '',
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    loadConsumable();
  }, [consumableId]);

  const loadConsumable = async () => {
    try {
      setLoading(true);
      const consumable = await sectionConsumablesApi.getById(consumableId);
      setFormData({
        productionSectionId: consumable.productionSectionId,
        ingredientId: consumable.ingredientId,
        quantityPerUnit: consumable.quantityPerUnit,
        formula: consumable.formula || '',
        notes: consumable.notes || '',
        isActive: consumable.isActive,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load section consumable');
      router.push('/administrator/section-consumables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productionSectionId || !formData.ingredientId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const updateData: UpdateSectionConsumableDto = {
        productionSectionId: formData.productionSectionId,
        ingredientId: formData.ingredientId,
        quantityPerUnit: formData.quantityPerUnit,
        formula: formData.formula,
        notes: formData.notes,
        isActive: formData.isActive,
      };
      await sectionConsumablesApi.update(consumableId, updateData);
      toast.success('Section consumable updated successfully');
      router.push('/administrator/section-consumables');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update section consumable');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p style={{ color: 'var(--muted-foreground)' }}>Loading section consumable...</p>
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Edit Section Consumable</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Update section consumable information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consumable Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Production Section ID"
              value={formData.productionSectionId}
              onChange={(e) => setFormData({ ...formData, productionSectionId: e.target.value })}
              placeholder="Enter production section ID (GUID)"
              fullWidth
              required
            />
            <Input
              label="Ingredient ID"
              value={formData.ingredientId}
              onChange={(e) => setFormData({ ...formData, ingredientId: e.target.value })}
              placeholder="Enter ingredient ID (GUID)"
              fullWidth
              required
            />
            <Input
              label="Quantity Per Unit"
              type="number"
              step="0.01"
              value={formData.quantityPerUnit.toString()}
              onChange={(e) => setFormData({ ...formData, quantityPerUnit: parseFloat(e.target.value) || 1 })}
              fullWidth
              required
            />
            <Input
              label="Formula"
              value={formData.formula}
              onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
              placeholder="Optional formula"
              fullWidth
            />
            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes"
              fullWidth
            />
            <div className="pt-2">
              <Toggle
                checked={formData.isActive}
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
                {submitting ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
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
