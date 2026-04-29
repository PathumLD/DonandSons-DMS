'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Checkbox from '@/components/ui/checkbox';
import { Plus, Trash2, Save, GripVertical, Calculator, FileStack, Layers } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { recipesApi, type Recipe, type RecipeComponent, type RecipeIngredient } from '@/lib/api/recipes';
import { recipeTemplatesApi, type RecipeTemplate } from '@/lib/api/recipe-templates';
import { productsApi, type Product } from '@/lib/api/products';
import { ingredientsApi, type Ingredient } from '@/lib/api/ingredients';
import { productionSectionsApi, type ProductionSection } from '@/lib/api/production-sections';
import toast from 'react-hot-toast';

export default function RecipeManagementPage() {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number>(0);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [previewQty, setPreviewQty] = useState('100');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [productionSections, setProductionSections] = useState<ProductionSection[]>([]);
  const [templates, setTemplates] = useState<RecipeTemplate[]>([]);
  const [calculationResult, setCalculationResult] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [loadingCalculation, setLoadingCalculation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchRecipeForProduct(selectedProductId);
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (selectedProductId && previewQty) {
      const qty = Number(previewQty);
      if (qty > 0) {
        calculatePreview();
      }
    }
  }, [selectedProductId, previewQty, recipe]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [productsRes, ingredientsRes, sectionsRes] = await Promise.all([
        productsApi.getAll(1, 1000, undefined, undefined, true),
        ingredientsApi.getAll(1, 1000, undefined, undefined, undefined, true),
        productionSectionsApi.getAll(1, 1000, undefined, true),
      ]);
      setProducts(productsRes.products);
      setIngredients(ingredientsRes.ingredients);
      setProductionSections(sectionsRes.productionSections);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to fetch initial data';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeForProduct = async (productId: string) => {
    try {
      setLoadingRecipe(true);
      const recipeData = await recipesApi.getByProductId(productId);
      setRecipe(recipeData);
      setSelectedComponentIndex(0);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setRecipe(null);
        toast('No recipe found for this product. Create a new recipe or load from template.');
      } else {
        const errorMsg = error?.response?.data?.message || error.message || 'Failed to fetch recipe';
        toast.error(errorMsg);
      }
    } finally {
      setLoadingRecipe(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const templatesRes = await recipeTemplatesApi.getAll(1, 100, undefined, true);
      setTemplates(templatesRes.recipeTemplates);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to fetch templates';
      toast.error(errorMsg);
    }
  };

  const calculatePreview = async () => {
    if (!selectedProductId || !recipe) return;
    
    try {
      setLoadingCalculation(true);
      const qty = Number(previewQty) || 100;
      const result = await recipesApi.calculateIngredients(selectedProductId, qty);
      setCalculationResult(result);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to calculate ingredients';
      toast.error(errorMsg);
      setCalculationResult(null);
    } finally {
      setLoadingCalculation(false);
    }
  };

  const handleAddComponent = () => {
    if (!recipe) {
      const selectedProduct = products.find(p => p.id === selectedProductId);
      if (!selectedProduct) {
        toast.error('Please select a product first');
        return;
      }
      const newRecipe: Recipe = {
        id: '',
        productId: selectedProductId,
        productCode: selectedProduct.code,
        productName: selectedProduct.name,
        version: 1,
        effectiveFrom: new Date().toISOString(),
        applyRoundOff: false,
        isActive: true,
        recipeComponents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setRecipe(newRecipe);
    }

    const newComponent: RecipeComponent = {
      productionSectionId: productionSections[0]?.id || '',
      componentName: `Component ${(recipe?.recipeComponents.length || 0) + 1}`,
      sortOrder: (recipe?.recipeComponents.length || 0) + 1,
      isPercentageBased: false,
      recipeIngredients: [],
    };

    setRecipe(prev => ({
      ...prev!,
      recipeComponents: [...(prev?.recipeComponents || []), newComponent],
    }));
    setSelectedComponentIndex((recipe?.recipeComponents.length || 0));
  };

  const handleRemoveComponent = (index: number) => {
    if (!recipe) return;
    const updatedComponents = recipe.recipeComponents.filter((_, i) => i !== index);
    setRecipe({ ...recipe, recipeComponents: updatedComponents });
    if (selectedComponentIndex >= updatedComponents.length) {
      setSelectedComponentIndex(Math.max(0, updatedComponents.length - 1));
    }
  };

  const handleUpdateComponent = (index: number, field: keyof RecipeComponent, value: any) => {
    if (!recipe) return;
    const updatedComponents = [...recipe.recipeComponents];
    updatedComponents[index] = { ...updatedComponents[index], [field]: value };
    setRecipe({ ...recipe, recipeComponents: updatedComponents });
  };

  const handleAddIngredient = () => {
    if (!recipe || selectedComponentIndex < 0 || selectedComponentIndex >= recipe.recipeComponents.length) {
      toast.error('Please select a component first');
      return;
    }

    const newIngredient: RecipeIngredient = {
      ingredientId: ingredients[0]?.id || '',
      qtyPerUnit: 0,
      extraQtyPerUnit: 0,
      storesOnly: false,
      showExtraInStores: false,
      isPercentage: false,
      sortOrder: recipe.recipeComponents[selectedComponentIndex].recipeIngredients.length + 1,
    };

    const updatedComponents = [...recipe.recipeComponents];
    updatedComponents[selectedComponentIndex] = {
      ...updatedComponents[selectedComponentIndex],
      recipeIngredients: [...updatedComponents[selectedComponentIndex].recipeIngredients, newIngredient],
    };
    setRecipe({ ...recipe, recipeComponents: updatedComponents });
  };

  const handleRemoveIngredient = (ingredientIndex: number) => {
    if (!recipe || selectedComponentIndex < 0) return;
    const updatedComponents = [...recipe.recipeComponents];
    updatedComponents[selectedComponentIndex] = {
      ...updatedComponents[selectedComponentIndex],
      recipeIngredients: updatedComponents[selectedComponentIndex].recipeIngredients.filter((_, i) => i !== ingredientIndex),
    };
    setRecipe({ ...recipe, recipeComponents: updatedComponents });
  };

  const handleUpdateIngredient = (ingredientIndex: number, field: keyof RecipeIngredient, value: any) => {
    if (!recipe || selectedComponentIndex < 0) return;
    const updatedComponents = [...recipe.recipeComponents];
    const updatedIngredients = [...updatedComponents[selectedComponentIndex].recipeIngredients];
    updatedIngredients[ingredientIndex] = { ...updatedIngredients[ingredientIndex], [field]: value };
    updatedComponents[selectedComponentIndex] = {
      ...updatedComponents[selectedComponentIndex],
      recipeIngredients: updatedIngredients,
    };
    setRecipe({ ...recipe, recipeComponents: updatedComponents });
  };

  const handleSave = async () => {
    if (!recipe || !selectedProductId) {
      toast.error('No recipe to save');
      return;
    }

    if (recipe.recipeComponents.length === 0) {
      toast.error('Please add at least one recipe component');
      return;
    }

    try {
      setSubmitting(true);
      if (recipe.id) {
        await recipesApi.update(recipe.id, {
          productId: selectedProductId,
          templateId: recipe.templateId,
          version: recipe.version,
          effectiveFrom: recipe.effectiveFrom,
          effectiveTo: recipe.effectiveTo,
          applyRoundOff: recipe.applyRoundOff,
          roundOffValue: recipe.roundOffValue,
          roundOffNotes: recipe.roundOffNotes,
          isActive: recipe.isActive,
          recipeComponents: recipe.recipeComponents,
        });
        toast.success('Recipe updated successfully');
      } else {
        const created = await recipesApi.create({
          productId: selectedProductId,
          templateId: recipe.templateId,
          version: 1,
          effectiveFrom: new Date().toISOString(),
          applyRoundOff: recipe.applyRoundOff,
          isActive: true,
          recipeComponents: recipe.recipeComponents,
        });
        setRecipe(created);
        toast.success('Recipe created successfully');
      }
      await fetchRecipeForProduct(selectedProductId);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to save recipe';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadTemplate = async (templateId: string) => {
    if (!selectedProductId) {
      toast.error('Please select a product first');
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (!selectedProduct) return;

    const newRecipe: Recipe = {
      id: recipe?.id || '',
      productId: selectedProductId,
      productCode: selectedProduct.code,
      productName: selectedProduct.name,
      templateId: templateId,
      templateName: template.name,
      version: recipe?.version || 1,
      effectiveFrom: recipe?.effectiveFrom || new Date().toISOString(),
      applyRoundOff: false,
      isActive: true,
      recipeComponents: [],
      createdAt: recipe?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecipe(newRecipe);
    setShowTemplateModal(false);
    toast.success(`Template "${template.name}" loaded. Now add components and ingredients.`);
  };

  const productOptions = products.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }));
  const ingredientOptions = ingredients.map(i => ({ value: i.id, label: `${i.code} - ${i.name}` }));
  const sectionOptions = productionSections.map(s => ({ value: s.id, label: s.name }));

  const currentComponent = recipe?.recipeComponents[selectedComponentIndex];

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center" style={{ color: 'var(--muted-foreground)' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Recipe Management</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Create and edit product recipes with multi-component structure</p>
        </div>
        <Button variant="primary" size="md" onClick={handleSave} disabled={submitting || !recipe}>
          <Save className="w-4 h-4 mr-2" />
          {submitting ? 'Saving...' : 'Save Recipe'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Product Selection</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select 
                label="Product" 
                value={selectedProductId} 
                onChange={(e) => setSelectedProductId(e.target.value)} 
                options={productOptions} 
                fullWidth 
              />
              
              {loadingRecipe && (
                <div className="text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
                  Loading recipe...
                </div>
              )}

              {recipe && (
                <>
                  <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Recipe Version</p>
                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>Version {recipe.version}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Effective from: {new Date(recipe.effectiveFrom).toLocaleDateString()}
                    </p>
                    {recipe.templateName && (
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        Template: {recipe.templateName}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Components ({recipe.recipeComponents.length})</p>
                    <div className="space-y-2">
                      {recipe.recipeComponents.map((component, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedComponentIndex(index)}
                          className="w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors flex items-center justify-between"
                          style={{
                            backgroundColor: selectedComponentIndex === index ? 'var(--dms-amber)' : 'var(--dms-pill-off-bg)',
                            border: `1px solid ${selectedComponentIndex === index ? 'var(--dms-notes-border)' : 'var(--dms-pill-off-border)'}`,
                            color: 'var(--foreground)',
                          }}
                        >
                          <span>{component.componentName}</span>
                          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {component.recipeIngredients.length} ingredients
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 space-y-2">
                <Button variant="secondary" size="sm" onClick={handleAddComponent} fullWidth>
                  <Plus className="w-4 h-4 mr-2" />Add Component
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { fetchTemplates(); setShowTemplateModal(true); }} fullWidth>
                  <FileStack className="w-4 h-4 mr-2" />Load Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {currentComponent ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Component: {currentComponent.componentName}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveComponent(selectedComponentIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <Input
                      label="Component Name"
                      value={currentComponent.componentName}
                      onChange={(e) => handleUpdateComponent(selectedComponentIndex, 'componentName', e.target.value)}
                      placeholder="e.g., Dough, Filling, Topping"
                      fullWidth
                    />
                    <Select
                      label="Production Section"
                      value={currentComponent.productionSectionId}
                      onChange={(e) => handleUpdateComponent(selectedComponentIndex, 'productionSectionId', e.target.value)}
                      options={sectionOptions}
                      fullWidth
                    />
                    <Input
                      label="Sort Order"
                      type="number"
                      value={String(currentComponent.sortOrder)}
                      onChange={(e) => handleUpdateComponent(selectedComponentIndex, 'sortOrder', Number(e.target.value))}
                      fullWidth
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>Ingredients</h3>
                    <Button variant="secondary" size="sm" onClick={handleAddIngredient}>
                      <Plus className="w-4 h-4 mr-2" />Add Ingredient
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
                      <thead style={{ backgroundColor: 'var(--muted)' }}>
                        <tr>
                          <th className="px-2 py-3 text-xs font-medium" style={{ color: 'var(--muted-foreground)', width: '30px' }}></th>
                          <th className="px-3 py-3 text-left text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '200px' }}>Ingredient</th>
                          <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '100px' }}>Qty/Unit</th>
                          <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '100px' }}>Extra/Unit</th>
                          <th className="px-3 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', minWidth: '120px' }}>Options</th>
                          <th className="px-2 py-3 text-xs font-medium" style={{ color: 'var(--muted-foreground)', width: '50px' }}></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                        {currentComponent.recipeIngredients.map((ingredient, index) => {
                          const ingredientData = ingredients.find(i => i.id === ingredient.ingredientId);
                          return (
                            <tr key={index}>
                              <td className="px-2 py-2">
                                <GripVertical className="w-4 h-4" style={{ color: 'var(--muted-foreground)', cursor: 'grab' }} />
                              </td>
                              <td className="px-3 py-2">
                                <select 
                                  className="w-full px-2 py-1 text-sm rounded" 
                                  style={{ border: '1px solid var(--input)' }}
                                  value={ingredient.ingredientId}
                                  onChange={(e) => handleUpdateIngredient(index, 'ingredientId', e.target.value)}
                                >
                                  {ingredientOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  value={ingredient.qtyPerUnit} 
                                  onChange={(e) => handleUpdateIngredient(index, 'qtyPerUnit', Number(e.target.value))}
                                  className="w-full px-2 py-1 text-sm text-center rounded" 
                                  style={{ border: '1px solid var(--input)' }} 
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  value={ingredient.extraQtyPerUnit} 
                                  onChange={(e) => handleUpdateIngredient(index, 'extraQtyPerUnit', Number(e.target.value))}
                                  className="w-full px-2 py-1 text-sm text-center rounded" 
                                  style={{ border: '1px solid var(--input)' }} 
                                />
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex flex-col space-y-1">
                                  <label className="flex items-center text-xs">
                                    <input 
                                      type="checkbox" 
                                      checked={ingredient.storesOnly} 
                                      onChange={(e) => handleUpdateIngredient(index, 'storesOnly', e.target.checked)}
                                      className="mr-1" 
                                    />
                                    Stores Only
                                  </label>
                                  <label className="flex items-center text-xs">
                                    <input 
                                      type="checkbox" 
                                      checked={ingredient.isPercentage} 
                                      onChange={(e) => handleUpdateIngredient(index, 'isPercentage', e.target.checked)}
                                      className="mr-1" 
                                    />
                                    Percentage
                                  </label>
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveIngredient(index)} 
                                  className="p-1 rounded transition-colors" 
                                  style={{ color: 'var(--dms-red-text)' }} 
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dms-destructive-soft)'} 
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recipe Preview Calculator</CardTitle>
                    <Button variant="secondary" size="sm" onClick={calculatePreview} disabled={loadingCalculation || !recipe}>
                      <Calculator className="w-4 h-4 mr-2" />
                      {loadingCalculation ? 'Calculating...' : 'Calculate'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input 
                      label="Production Quantity" 
                      type="number" 
                      value={previewQty} 
                      onChange={(e) => setPreviewQty(e.target.value)} 
                      placeholder="100" 
                      helperText="Enter quantity to calculate ingredient requirements" 
                      fullWidth 
                    />
                    
                    {calculationResult && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
                          <thead style={{ backgroundColor: 'var(--muted)' }}>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Component</th>
                              <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Ingredient</th>
                              <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Required Qty</th>
                              <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Extra Qty</th>
                              <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--dms-amber)' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                            {calculationResult.ingredients.map((ingredient: any, idx: number) => (
                              <tr key={idx}>
                                <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground)' }}>{ingredient.componentName}</td>
                                <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground)' }}>{ingredient.ingredientCode} - {ingredient.ingredientName}</td>
                                <td className="px-4 py-3 text-center text-sm" style={{ color: '#3B82F6' }}>{ingredient.requiredQuantity.toFixed(2)} {ingredient.unit}</td>
                                <td className="px-4 py-3 text-center text-sm" style={{ color: '#F59E0B' }}>{ingredient.extraQuantity.toFixed(2)} {ingredient.unit}</td>
                                <td className="px-4 py-3 text-center text-sm font-bold" style={{ color: 'var(--dms-amber-fg)', backgroundColor: 'var(--dms-amber)' }}>
                                  {ingredient.totalQuantity.toFixed(2)} {ingredient.unit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Layers className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>No Component Selected</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  {selectedProductId 
                    ? 'Add a component to start building the recipe, or load a template.'
                    : 'Select a product to view or create its recipe.'}
                </p>
                {selectedProductId && (
                  <Button variant="primary" onClick={handleAddComponent}>
                    <Plus className="w-4 h-4 mr-2" />Add First Component
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Load Recipe Template" size="md">
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Select a predefined template to apply to this product. You can customize components and ingredients after loading.
          </p>
          {templates.filter(t => t.isActive).map((template) => (
            <button
              key={template.id}
              onClick={() => handleLoadTemplate(template.id)}
              className="w-full p-4 rounded-lg text-left transition-colors hover:!bg-[color:var(--muted)]"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>{template.name}</p>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{template.description || 'No description'}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Code: {template.code}</p>
                </div>
                <FileStack className="w-6 h-6" style={{ color: '#C8102E' }} />
              </div>
            </button>
          ))}
          {templates.length === 0 && (
            <div className="p-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
              No active templates found
            </div>
          )}
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowTemplateModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-success-callout)', border: '1px solid var(--dms-success-border)' }}>
        <div className="flex items-start space-x-3">
          <FileStack className="w-5 h-5 mt-0.5" style={{ color: 'var(--dms-success-text)' }} />
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--dms-success-text)' }}>Multi-Component Recipe System:</p>
            <ul className="text-sm space-y-1" style={{ color: 'var(--dms-success-text)' }}>
              <li>• Recipes are organized into components (e.g., Dough, Filling, Topping)</li>
              <li>• Each component belongs to a production section and contains multiple ingredients</li>
              <li>• Templates provide a starting point - load one and customize the components</li>
              <li>• Use the calculator to preview ingredient requirements for any production quantity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
