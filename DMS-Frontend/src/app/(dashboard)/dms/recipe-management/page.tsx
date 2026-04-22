'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Save, GripVertical, Calculator } from 'lucide-react';
import { mockRecipes, mockOrderProducts } from '@/lib/mock-data/dms-production';
import { mockProducts, mockIngredients } from '@/lib/mock-data/products';

export default function RecipeManagementPage() {
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [selectedSubRecipe, setSelectedSubRecipe] = useState<string>('main');
  const [recipe, setRecipe] = useState(mockRecipes[0]);
  const [previewQty, setPreviewQty] = useState('100');

  const productOptions = mockOrderProducts.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }));
  const ingredientOptions = mockIngredients.filter(i => i.active).map(i => ({ value: i.id, label: `${i.code} - ${i.name}` }));

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

  const calculatePreview = (ingredientQty: number, extraQty: number) => {
    const qty = Number(previewQty) || 0;
    return ((ingredientQty + extraQty) * qty).toFixed(2);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Recipe Management</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Create and edit product recipes with ingredients</p>
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
                <p className="text-sm font-medium mb-2" style={{ color: '#6B7280' }}>Sub-Recipes</p>
                <div className="space-y-2">
                  {['main', 'dough', 'filling'].map((subRecipe) => (
                    <button
                      key={subRecipe}
                      onClick={() => setSelectedSubRecipe(subRecipe)}
                      className="w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors"
                      style={{
                        backgroundColor: selectedSubRecipe === subRecipe ? '#FEF3C4' : 'white',
                        border: `1px solid ${selectedSubRecipe === subRecipe ? '#FFD100' : '#E5E7EB'}`,
                        color: '#111827',
                      }}
                    >
                      {subRecipe === 'main' ? 'Main Recipe' : subRecipe.charAt(0).toUpperCase() + subRecipe.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                <p className="text-sm font-medium mb-2" style={{ color: '#6B7280' }}>Recipe Version</p>
                <p className="text-sm" style={{ color: '#111827' }}>Version {recipe.version}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Effective from: {new Date(recipe.effectiveFrom).toLocaleDateString()}</p>
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
                <Button variant="secondary" size="sm" onClick={handleAddIngredient}><Plus className="w-4 h-4 mr-2" />Add Ingredient</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
                  <thead style={{ backgroundColor: '#F9FAFB' }}>
                    <tr>
                      <th className="px-2 py-3 text-xs font-medium" style={{ color: '#6B7280', width: '30px' }}></th>
                      <th className="px-3 py-3 text-left text-xs font-medium" style={{ color: '#6B7280', minWidth: '200px' }}>Ingredient</th>
                      <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: '#6B7280', minWidth: '100px' }}>Qty/Unit</th>
                      <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: '#6B7280', minWidth: '100px' }}>Extra/Unit</th>
                      <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: '#6B7280', minWidth: '80px' }}>Unit</th>
                      <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: '#6B7280', minWidth: '100px' }}>Options</th>
                      <th className="px-2 py-3 text-xs font-medium" style={{ color: '#6B7280', width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ backgroundColor: 'white', borderColor: '#E5E7EB' }}>
                    {recipe.ingredients.map((ingredient, index) => (
                      <tr key={ingredient.id}>
                        <td className="px-2 py-2">
                          <GripVertical className="w-4 h-4" style={{ color: '#9CA3AF', cursor: 'grab' }} />
                        </td>
                        <td className="px-3 py-2">
                          <select className="w-full px-2 py-1 text-sm rounded" style={{ border: '1px solid #D1D5DB' }}>
                            <option>{ingredient.ingredientCode} - {ingredient.ingredientName}</option>
                            {ingredientOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" step="0.01" value={ingredient.qtyPerUnit} className="w-full px-2 py-1 text-sm text-center rounded" style={{ border: '1px solid #D1D5DB' }} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" step="0.01" value={ingredient.extraQtyPerUnit} className="w-full px-2 py-1 text-sm text-center rounded" style={{ border: '1px solid #D1D5DB' }} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" value={ingredient.unit} className="w-full px-2 py-1 text-sm text-center rounded" style={{ border: '1px solid #D1D5DB' }} />
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
                          <button onClick={() => handleRemoveIngredient(ingredient.id)} className="p-1 rounded transition-colors" style={{ color: '#DC2626' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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
                  <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
                    <thead style={{ backgroundColor: '#F9FAFB' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#6B7280' }}>Ingredient</th>
                        <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: '#6B7280' }}>Qty/Unit</th>
                        <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: '#6B7280' }}>Extra/Unit</th>
                        <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: '#6B7280', backgroundColor: '#FEF3C4' }}>Total Req'd</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ backgroundColor: 'white', borderColor: '#E5E7EB' }}>
                      {recipe.ingredients.map((ingredient) => (
                        <tr key={ingredient.id}>
                          <td className="px-4 py-3 text-sm" style={{ color: '#111827' }}>{ingredient.ingredientName}</td>
                          <td className="px-4 py-3 text-center text-sm" style={{ color: '#3B82F6' }}>{ingredient.qtyPerUnit} {ingredient.unit}</td>
                          <td className="px-4 py-3 text-center text-sm" style={{ color: '#F59E0B' }}>{ingredient.extraQtyPerUnit} {ingredient.unit}</td>
                          <td className="px-4 py-3 text-center text-sm font-bold" style={{ color: '#C8102E', backgroundColor: '#FEF3C4' }}>
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
    </div>
  );
}
