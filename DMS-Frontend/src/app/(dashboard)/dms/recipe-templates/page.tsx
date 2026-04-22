'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { FileStack, Plus, Search, Edit, Eye, Copy, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockRecipeTemplates, type RecipeTemplate } from '@/lib/mock-data/dms-production';
import { mockIngredients } from '@/lib/mock-data/products';

export default function RecipeTemplatesPage() {
  const [templates, setTemplates] = useState<RecipeTemplate[]>(mockRecipeTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RecipeTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
  });

  const filteredTemplates = useMemo(() => {
    return templates.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  const totalPages = Math.ceil(filteredTemplates.length / pageSize);
  const paginatedTemplates = filteredTemplates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAdd = () => {
    const newTemplate: RecipeTemplate = {
      id: Math.max(...templates.map(t => t.id)) + 1,
      name: formData.name,
      description: formData.description,
      ingredientCount: 0,
      ingredients: [],
      active: formData.active,
    };
    setTemplates([newTemplate, ...templates]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedTemplate) {
      setTemplates(templates.map(t =>
        t.id === selectedTemplate.id
          ? { ...t, name: formData.name, description: formData.description, active: formData.active }
          : t
      ));
      setShowEditModal(false);
      setSelectedTemplate(null);
      resetForm();
    }
  };

  const openEditModal = (template: RecipeTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      active: template.active,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', active: true });
  };

  const handleApplyToProduct = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      alert(`Applying template "${template.name}" to product. You can now edit the recipe per product.`);
    }
  };

  const columns = [
    { key: 'name', label: 'Template Name', render: (item: RecipeTemplate) => <span className="font-medium">{item.name}</span> },
    { key: 'description', label: 'Description' },
    { key: 'ingredientCount', label: 'Ingredients', render: (item: RecipeTemplate) => <span className="font-semibold" style={{ color: '#C8102E' }}>{item.ingredientCount}</span> },
    { key: 'active', label: 'Status', render: (item: RecipeTemplate) => item.active ? <Badge variant="success" size="sm">Active</Badge> : <Badge variant="neutral" size="sm">Inactive</Badge> },
    {
      key: 'actions', label: 'Actions', render: (item: RecipeTemplate) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => { setSelectedTemplate(item); setShowViewModal(true); }} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="View"><Eye className="w-4 h-4" /></button>
          <button onClick={() => openEditModal(item)} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Edit"><Edit className="w-4 h-4" /></button>
          <button onClick={() => handleApplyToProduct(item.id)} className="p-1.5 rounded transition-colors" style={{ color: '#10B981' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDF4'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Apply to Product"><Copy className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Predefined Recipe Templates</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Reusable recipe templates for quick product setup ({filteredTemplates.length} templates)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}><Plus className="w-4 h-4 mr-2" />Create Template</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Recipe Templates</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <input type="text" placeholder="Search templates..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedTemplates} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Recipe Template" size="lg">
        <div className="space-y-4">
          <Input label="Template Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Vegetable Curry Template" fullWidth required />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the template..." fullWidth />
          
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FFD100' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#78350F' }}>Next Steps:</p>
            <p className="text-sm" style={{ color: '#92400E' }}>
              After creating the template, you can add ingredient lines. Templates can then be applied to products as a starting point for their recipes.
            </p>
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Create Template</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedTemplate(null); resetForm(); }} title="Edit Recipe Template" size="lg">
        <div className="space-y-4">
          <Input label="Template Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth required />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth />
          <div className="flex items-center space-x-2">
            <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="rounded" />
            <label className="text-sm" style={{ color: '#374151' }}>Active</label>
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedTemplate(null); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedTemplate(null); }} title="Template Details" size="lg">
        {selectedTemplate && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Template Name</p>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedTemplate.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Description</p>
              <p className="text-sm" style={{ color: '#111827' }}>{selectedTemplate.description}</p>
            </div>
            
            <div>
              <p className="text-xs font-medium mb-3" style={{ color: '#6B7280' }}>Ingredients ({selectedTemplate.ingredientCount})</p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
                  <thead style={{ backgroundColor: '#F9FAFB' }}>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: '#6B7280' }}>Ingredient</th>
                      <th className="px-4 py-2 text-center text-xs font-medium" style={{ color: '#6B7280' }}>Qty/Unit</th>
                      <th className="px-4 py-2 text-center text-xs font-medium" style={{ color: '#6B7280' }}>Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ backgroundColor: 'white', borderColor: '#E5E7EB' }}>
                    {selectedTemplate.ingredients.map((ingredient, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm" style={{ color: '#111827' }}>{ingredient.ingredientCode} - {ingredient.ingredientName}</td>
                        <td className="px-4 py-2 text-center text-sm font-semibold" style={{ color: '#C8102E' }}>{ingredient.qtyPerUnit}</td>
                        <td className="px-4 py-2 text-center text-sm" style={{ color: '#6B7280' }}>{ingredient.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedTemplate(null); }}>Close</Button>
          {selectedTemplate && <Button variant="primary" onClick={() => handleApplyToProduct(selectedTemplate.id)}><Copy className="w-4 h-4 mr-2" />Apply to Product</Button>}
        </ModalFooter>
      </Modal>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}>
        <div className="flex items-start space-x-3">
          <FileStack className="w-5 h-5 mt-0.5" style={{ color: '#166534' }} />
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: '#166534' }}>Template Benefits:</p>
            <ul className="text-sm space-y-1" style={{ color: '#166534' }}>
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
