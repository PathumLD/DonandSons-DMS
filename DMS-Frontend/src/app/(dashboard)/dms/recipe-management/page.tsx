'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Checkbox from '@/components/ui/checkbox';
import { Plus, Trash2, Save, GripVertical, Calculator, FileStack } from 'lucide-react';
import { mockRecipes, mockRecipeTemplates } from '@/lib/mock-data/dms-production';
import { mockOrderProducts } from '@/lib/mock-data/dms-orders';
import { mockProducts, mockIngredients } from '@/lib/mock-data/products';
import { Modal, ModalFooter } from '@/components/ui/modal';

export default function RecipeManagementPage() {
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [selectedSubRecipe, setSelectedSubRecipe] = useState<string>('main');
  const [recipe, setRecipe] = useState(mockRecipes[0]);
  const [previewQty, setPreviewQty] = useState('100');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const productOptions = mockOrderProducts.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }));
  const ingredientOptions = mockIngredients.filter(i => i.active).map(i => ({ value: i.id, label: `${i.code} - ${i.description}` }));

  const handleAddIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          id: Math.max(...prev.ingredients.map(i => i.id)) + 1,
          ingredientId: 0,
          ingredientCode: '',
          ingredientName: '',
          qtyPerUnit: 0,
          extraQtyPerUnit: 0,
          unit: 'kg',
          storesOnly: false,
          isPercentage: false,
          sortOrder: prev.ingredients.length + 1,
        },
      ],
    }));
  };

  const handleRemoveIngredient = (id: number) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i.id !== id),
    }));
  };

  const handleSave = () => {
    console.log('Saving recipe:', recipe);
    alert('Recipe saved successfully!');
  };

  const handleLoadTemplate = (templateId: number) => {
    const template = mockRecipeTemplates.find(t => t.id === templateId);
    if (template) {
      const newIngredients = template.ingredients.map((ing, index) => ({
        id: index + 1,
        ingredientId: ing.ingredientId,
        ingredientCode: ing.ingredientCode,
        ingredientName: ing.ingredientName,
        qtyPerUnit: ing.qtyPerUnit,
        extraQtyPerUnit: 0,
        unit: ing.unit,
        storesOnly: false,
        isPercentage: false,
        sortOrder: index + 1,
      }));
      setRecipe(prev => ({ ...prev, ingredients: newIngredients }));
      setShowTemplateModal(false);
      alert(`Template "${template.name}" loaded successfully! You can now customize the recipe.`);
    }
  };

  const calculatePreview = (ingredientQty: number, extraQty: number) => {
    const qty = Number(previewQty) || 0;
    return ((ingredientQty + extraQty) * qty).toFixed(2);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Recipe Management</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Create and edit product recipes with ingredients</p>
        </div>
        <Button variant="primary" size="md" onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save Recipe</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Product Selection</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select label="Product" value={String(selectedProductId)} onChange={(e) => setSelectedProductId(Number(e.target.value))} options={productOptions} fullWidth />
              
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Sub-Recipes</p>
                <div className="space-y-2">
                  {['main', 'dough', 'filling'].map((subRecipe) => (
                    <button
                      key={subRecipe}
                      onClick={() => setSelectedSubRecipe(subRecipe)}
                      className="w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors"
                      style={{
                        backgroundColor: selectedSubRecipe === subRecipe ? 'var(--dms-amber)' : 'var(--dms-pill-off-bg)',
                        border: `1px solid ${selectedSubRecipe === subRecipe ? 'var(--dms-notes-border)' : 'var(--dms-pill-off-border)'}`,
                        color: 'var(--foreground)',
                      }}
                    >
                      {subRecipe === 'main' ? 'Main Recipe' : subRecipe.charAt(0).toUpperCase() + subRecipe.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Recipe Version</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>Version {recipe.version}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Effective from: {new Date(recipe.effectiveFrom).toLocaleDateString()}</p>
                <Button variant="ghost" size="sm" className="mt-2">Create New Version</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recipe Ingredients</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowTemplateModal(true)}><FileStack className="w-4 h-4 mr-2" />Load Template</Button>
                  <Button variant="secondary" size="sm" onClick={handleAddIngredient}><Plus className="w-4 h-4 mr-2" />Add Ingredient</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
                  <thead style={{ backgroundColor: 'var(--muted)' }}>
                    <tr>
                      <th className="px-2 py-3 text-xs font-medium" style={{ color: 'var(--muted-foreground)', width: '30px' }}></th>
                      <th className="px-3 py-3 text-left text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '200px' }}>Ingredient</th>
                      <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '100px' }}>Qty/Unit</th>
                      <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '100px' }}>Extra/Unit</th>
                      <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '80px' }}>Unit</th>
                      <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '100px' }}>Options</th>
                      <th className="px-2 py-3 text-xs font-medium" style={{ color: 'var(--muted-foreground)', width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    {recipe.ingredients.map((ingredient, index) => (
                      <tr key={ingredient.id}>
                        <td className="px-2 py-2">
                          <GripVertical className="w-4 h-4" style={{ color: 'var(--muted-foreground)', cursor: 'grab' }} />
                        </td>
                        <td className="px-3 py-2">
                          <select className="w-full px-2 py-1 text-sm rounded" style={{ border: '1px solid var(--input)' }}>
                            <option>{ingredient.ingredientCode} - {ingredient.ingredientName}</option>
                            {ingredientOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" step="0.01" value={ingredient.qtyPerUnit} className="w-full px-2 py-1 text-sm text-center rounded" style={{ border: '1px solid var(--input)' }} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" step="0.01" value={ingredient.extraQtyPerUnit} className="w-full px-2 py-1 text-sm text-center rounded" style={{ border: '1px solid var(--input)' }} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" value={ingredient.unit} className="w-full px-2 py-1 text-sm text-center rounded" style={{ border: '1px solid var(--input)' }} />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col space-y-1">
                            <label className="flex items-center text-xs">
                              <input type="checkbox" checked={ingredient.storesOnly} className="mr-1" />
                              Stores Only
                            </label>
                            <label className="flex items-center text-xs">
                              <input type="checkbox" checked={ingredient.isPercentage} className="mr-1" />
                              Percentage
                            </label>
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <button type="button" onClick={() => handleRemoveIngredient(ingredient.id)} className="p-1 rounded transition-colors" style={{ color: 'var(--dms-red-text)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dms-destructive-soft)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recipe Preview Calculator</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input label="Production Quantity" type="number" value={previewQty} onChange={(e) => setPreviewQty(e.target.value)} placeholder="100" helperText="Enter quantity to calculate ingredient requirements" fullWidth />
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
                    <thead style={{ backgroundColor: 'var(--muted)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Ingredient</th>
                        <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Qty/Unit</th>
                        <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Extra/Unit</th>
                        <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--dms-amber)' }}>Total Req'd</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                      {recipe.ingredients.map((ingredient) => (
                        <tr key={ingredient.id}>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground)' }}>{ingredient.ingredientName}</td>
                          <td className="px-4 py-3 text-center text-sm" style={{ color: '#3B82F6' }}>{ingredient.qtyPerUnit} {ingredient.unit}</td>
                          <td className="px-4 py-3 text-center text-sm" style={{ color: '#F59E0B' }}>{ingredient.extraQtyPerUnit} {ingredient.unit}</td>
                          <td className="px-4 py-3 text-center text-sm font-bold" style={{ color: 'var(--dms-amber-fg)', backgroundColor: 'var(--dms-amber)' }}>
                            {calculatePreview(ingredient.qtyPerUnit, ingredient.extraQtyPerUnit)} {ingredient.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Load Recipe Template" size="md">
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Select a predefined template to load as the base recipe. You can customize it after loading.
          </p>
          {mockRecipeTemplates.filter(t => t.active).map((template) => (
            <button
              key={template.id}
              onClick={() => handleLoadTemplate(template.id)}
              className="w-full p-4 rounded-lg text-left transition-colors hover:!bg-[color:var(--muted)]"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>{template.name}</p>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{template.description}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{template.ingredientCount} ingredients</p>
                </div>
                <FileStack className="w-6 h-6" style={{ color: '#C8102E' }} />
              </div>
            </button>
          ))}
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowTemplateModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
