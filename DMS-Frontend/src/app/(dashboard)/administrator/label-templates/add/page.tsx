'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { ArrowLeft, Plus } from 'lucide-react';
import { labelTemplatesApi, type CreateLabelTemplateDto } from '@/lib/api/label-templates';
import toast from 'react-hot-toast';

export default function AddLabelTemplatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    templateType: '',
    widthMm: 100,
    heightMm: 50,
    layoutDesign: '',
    fields: '',
    fontSettings: '',
    sortOrder: 0,
    isDefault: false,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const createData: CreateLabelTemplateDto = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        templateType: formData.templateType,
        widthMm: formData.widthMm,
        heightMm: formData.heightMm,
        layoutDesign: formData.layoutDesign,
        fields: formData.fields,
        fontSettings: formData.fontSettings,
        sortOrder: formData.sortOrder,
        isDefault: formData.isDefault,
        isActive: formData.isActive,
      };
      await labelTemplatesApi.create(createData);
      toast.success('Template created successfully');
      router.push('/administrator/label-templates');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to create template';
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Add New Label Template</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Create a new label template
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Template Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., TEMP001"
                fullWidth
                required
              />
              <Input
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Standard Label"
                fullWidth
                required
              />
            </div>

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              fullWidth
            />

            <Input
              label="Template Type"
              value={formData.templateType}
              onChange={(e) => setFormData({ ...formData, templateType: e.target.value })}
              placeholder="e.g., Product, Price"
              fullWidth
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Width (mm)"
                type="number"
                value={formData.widthMm.toString()}
                onChange={(e) => setFormData({ ...formData, widthMm: parseFloat(e.target.value) || 100 })}
                fullWidth
                required
              />
              <Input
                label="Height (mm)"
                type="number"
                value={formData.heightMm.toString()}
                onChange={(e) => setFormData({ ...formData, heightMm: parseFloat(e.target.value) || 50 })}
                fullWidth
                required
              />
              <Input
                label="Sort Order"
                type="number"
                value={formData.sortOrder.toString()}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Toggle
                checked={formData.isDefault}
                onChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                label="Set as Default"
              />
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
                {submitting ? 'Creating...' : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Template
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
