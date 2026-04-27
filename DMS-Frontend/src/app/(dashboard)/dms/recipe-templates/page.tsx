'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { FileStack, Plus, Search, Edit, Eye, Copy, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { recipeTemplatesApi, type RecipeTemplate } from '@/lib/api/recipe-templates';
import toast from 'react-hot-toast';

export default function RecipeTemplatesPage() {
  const [templates, setTemplates] = useState<RecipeTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RecipeTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    isDefault: false,
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, [currentPage, pageSize, searchTerm]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await recipeTemplatesApi.getAll(
        currentPage,
        pageSize,
        searchTerm || undefined,
        undefined
      );
      setTemplates(response.recipeTemplates);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to fetch recipe templates';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await recipeTemplatesApi.create({
        code: formData.code,
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        isDefault: formData.isDefault,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      });
      toast.success('Recipe template created successfully');
      setShowAddModal(false);
      resetForm();
      fetchTemplates();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to create recipe template';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedTemplate || !formData.code || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await recipeTemplatesApi.update(selectedTemplate.id, {
        code: formData.code,
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        isDefault: formData.isDefault,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      });
      toast.success('Recipe template updated successfully');
      setShowEditModal(false);
      setSelectedTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to update recipe template';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (template: RecipeTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      code: template.code,
      name: template.name,
      description: template.description || '',
      categoryId: template.categoryId || '',
      isDefault: template.isDefault,
      sortOrder: template.sortOrder,
      isActive: template.isActive,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      categoryId: '',
      isDefault: false,
      sortOrder: 0,
      isActive: true,
    });
  };

  const handleApplyToProduct = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast.success(`Template "${template.name}" selected. Navigate to Recipe Management to apply it to a product.`);
    }
  };

  const columns = [
    { key: 'code', label: 'Code', render: (item: RecipeTemplate) => <span className="font-medium">{item.code}</span> },
    { key: 'name', label: 'Template Name', render: (item: RecipeTemplate) => <span className="font-medium">{item.name}</span> },
    { key: 'description', label: 'Description' },
    { key: 'isActive', label: 'Status', render: (item: RecipeTemplate) => item.isActive ? <Badge variant="success" size="sm">Active</Badge> : <Badge variant="neutral" size="sm">Inactive</Badge> },
    {
      key: 'actions', label: 'Actions', render: (item: RecipeTemplate) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => { setSelectedTemplate(item); setShowViewModal(true); }} className="p-1.5 rounded transition-colors" style={{ color: 'var(--muted-foreground)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="View"><Eye className="w-4 h-4" /></button>
          <button onClick={() => openEditModal(item)} className="p-1.5 rounded transition-colors" style={{ color: 'var(--muted-foreground)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Edit"><Edit className="w-4 h-4" /></button>
          <button onClick={() => handleApplyToProduct(item.id)} className="p-1.5 rounded transition-colors" style={{ color: '#10B981' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dms-success-callout)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Apply to Product"><Copy className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Predefined Recipe Templates</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Reusable recipe templates for quick product setup ({totalCount} templates)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}><Plus className="w-4 h-4 mr-2" />Create Template</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Recipe Templates</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input type="text" placeholder="Search templates..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--input)' }} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
              No templates found
            </div>
          ) : (
            <DataTable data={templates} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Recipe Template" size="lg">
        <div className="space-y-4">
          <Input label="Template Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., TMPL-CURRY-001" fullWidth required />
          <Input label="Template Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Vegetable Curry Template" fullWidth required />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the template..." fullWidth />
          <Input label="Sort Order" type="number" value={String(formData.sortOrder)} onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })} placeholder="0" fullWidth />
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} className="rounded" />
            <label htmlFor="isDefault" className="text-sm" style={{ color: 'var(--foreground)' }}>Set as Default Template</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
            <label htmlFor="isActive" className="text-sm" style={{ color: 'var(--foreground)' }}>Active</label>
          </div>
          
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-notes)', border: '1px solid var(--dms-notes-border)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--dms-notes-title)' }}>Next Steps:</p>
            <p className="text-sm" style={{ color: 'var(--dms-notes-fg)' }}>
              After creating the template, navigate to Recipe Management to apply it to a product and define the recipe components and ingredients.
            </p>
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd} disabled={submitting}><Plus className="w-4 h-4 mr-2" />{submitting ? 'Creating...' : 'Create Template'}</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedTemplate(null); resetForm(); }} title="Edit Recipe Template" size="lg">
        <div className="space-y-4">
          <Input label="Template Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., TMPL-CURRY-001" fullWidth required />
          <Input label="Template Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth required />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth />
          <Input label="Sort Order" type="number" value={String(formData.sortOrder)} onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })} fullWidth />
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="editIsDefault" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} className="rounded" />
            <label htmlFor="editIsDefault" className="text-sm" style={{ color: 'var(--foreground)' }}>Set as Default Template</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="editIsActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
            <label htmlFor="editIsActive" className="text-sm" style={{ color: 'var(--foreground)' }}>Active</label>
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedTemplate(null); resetForm(); }} disabled={submitting}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit} disabled={submitting}><Save className="w-4 h-4 mr-2" />{submitting ? 'Saving...' : 'Save Changes'}</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedTemplate(null); }} title="Template Details" size="lg">
        {selectedTemplate && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Template Code</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedTemplate.code}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Template Name</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedTemplate.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Description</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedTemplate.description || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Sort Order</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedTemplate.sortOrder}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Default Template</p>
                <Badge variant={selectedTemplate.isDefault ? 'success' : 'neutral'} size="sm">{selectedTemplate.isDefault ? 'Yes' : 'No'}</Badge>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                <Badge variant={selectedTemplate.isActive ? 'success' : 'neutral'} size="sm">{selectedTemplate.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-notes)', border: '1px solid var(--dms-notes-border)' }}>
              <p className="text-sm" style={{ color: 'var(--dms-notes-fg)' }}>
                Recipe templates serve as metadata for organizing recipes. To apply this template and define recipe components with ingredients, navigate to Recipe Management and select a product.
              </p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedTemplate(null); }}>Close</Button>
          {selectedTemplate && <Button variant="primary" onClick={() => handleApplyToProduct(selectedTemplate.id)}><Copy className="w-4 h-4 mr-2" />Apply to Product</Button>}
        </ModalFooter>
      </Modal>

      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-success-callout)', border: '1px solid var(--dms-success-border)' }}>
        <div className="flex items-start space-x-3">
          <FileStack className="w-5 h-5 mt-0.5" style={{ color: 'var(--dms-success-text)' }} />
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--dms-success-text)' }}>Template Benefits:</p>
            <ul className="text-sm space-y-1" style={{ color: 'var(--dms-success-text)' }}>
              <li>• Save time by creating standard recipes once and applying them to multiple products</li>
              <li>• Maintain consistency across similar products (e.g., all curry fillings use the same base recipe)</li>
              <li>• Templates can be applied as a starting point, then customized per product</li>
              <li>• Examples: Basic Bread Template, Vegetable Curry Template, Fish Filling Template</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
