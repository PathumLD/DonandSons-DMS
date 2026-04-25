'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Beaker, Plus, Search, Edit, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ingredientsApi, type Ingredient, type CreateIngredientDto, type UpdateIngredientDto } from '@/lib/api/ingredients';
import { categoriesApi, type Category } from '@/lib/api/categories';
import { uomsApi, type UnitOfMeasure } from '@/lib/api/uoms';
import toast from 'react-hot-toast';

export default function IngredientPage() {
  // Data states
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uoms, setUOMs] = useState<UnitOfMeasure[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination and search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CreateIngredientDto>>({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    unitOfMeasureId: '',
    ingredientType: 'Raw',
    isSemiFinishedItem: false,
    extraPercentageApplicable: false,
    extraPercentage: 0,
    allowDecimal: false,
    decimalPlaces: 2,
    unitPrice: 0,
    sortOrder: 0,
    isActive: true,
  });

  // Fetch ingredients on mount and when filters change
  useEffect(() => {
    fetchIngredients();
  }, [currentPage, pageSize, searchTerm]);

  // Fetch categories and UOMs on mount
  useEffect(() => {
    fetchCategories();
    fetchUOMs();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ingredientsApi.getAll(
        currentPage,
        pageSize,
        searchTerm || undefined,
        undefined,
        undefined,
        undefined
      );
      
      setIngredients(response.ingredients);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load ingredients';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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

  const handleToggleActive = async (ingredient: Ingredient) => {
    try {
      await ingredientsApi.update(ingredient.id, {
        code: ingredient.code,
        name: ingredient.name,
        description: ingredient.description,
        categoryId: ingredient.categoryId,
        unitOfMeasureId: ingredient.unitOfMeasureId,
        ingredientType: ingredient.ingredientType,
        isSemiFinishedItem: ingredient.isSemiFinishedItem,
        extraPercentageApplicable: ingredient.extraPercentageApplicable,
        extraPercentage: ingredient.extraPercentage,
        allowDecimal: ingredient.allowDecimal,
        decimalPlaces: ingredient.decimalPlaces,
        unitPrice: ingredient.unitPrice,
        sortOrder: ingredient.sortOrder,
        isActive: !ingredient.isActive,
      });
      
      toast.success(`Ingredient ${ingredient.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchIngredients();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to toggle ingredient status';
      toast.error(errorMsg);
    }
  };

  const handleAddIngredient = async () => {
    try {
      setSubmitting(true);
      
      const dto: CreateIngredientDto = {
        code: formData.code!,
        name: formData.name!,
        description: formData.description,
        categoryId: formData.categoryId!,
        unitOfMeasureId: formData.unitOfMeasureId!,
        ingredientType: formData.ingredientType!,
        isSemiFinishedItem: formData.isSemiFinishedItem!,
        extraPercentageApplicable: formData.extraPercentageApplicable!,
        extraPercentage: Number(formData.extraPercentage),
        allowDecimal: formData.allowDecimal!,
        decimalPlaces: Number(formData.decimalPlaces),
        unitPrice: Number(formData.unitPrice),
        sortOrder: Number(formData.sortOrder),
        isActive: formData.isActive!,
      };
      
      await ingredientsApi.create(dto);
      toast.success('Ingredient created successfully');
      setShowAddModal(false);
      resetForm();
      fetchIngredients();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create ingredient';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditIngredient = async () => {
    if (!selectedIngredient) return;
    
    try {
      setSubmitting(true);
      
      const dto: UpdateIngredientDto = {
        code: formData.code!,
        name: formData.name!,
        description: formData.description,
        categoryId: formData.categoryId!,
        unitOfMeasureId: formData.unitOfMeasureId!,
        ingredientType: formData.ingredientType!,
        isSemiFinishedItem: formData.isSemiFinishedItem!,
        extraPercentageApplicable: formData.extraPercentageApplicable!,
        extraPercentage: Number(formData.extraPercentage),
        allowDecimal: formData.allowDecimal!,
        decimalPlaces: Number(formData.decimalPlaces),
        unitPrice: Number(formData.unitPrice),
        sortOrder: Number(formData.sortOrder),
        isActive: formData.isActive!,
      };
      
      await ingredientsApi.update(selectedIngredient.id, dto);
      toast.success('Ingredient updated successfully');
      setShowEditModal(false);
      setSelectedIngredient(null);
      resetForm();
      fetchIngredients();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update ingredient';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      categoryId: '',
      unitOfMeasureId: '',
      ingredientType: 'Raw',
      isSemiFinishedItem: false,
      extraPercentageApplicable: false,
      extraPercentage: 0,
      allowDecimal: false,
      decimalPlaces: 2,
      unitPrice: 0,
      sortOrder: 0,
      isActive: true,
    });
  };

  const openEditModal = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setFormData({
      code: ingredient.code,
      name: ingredient.name,
      description: ingredient.description,
      categoryId: ingredient.categoryId,
      unitOfMeasureId: ingredient.unitOfMeasureId,
      ingredientType: ingredient.ingredientType,
      isSemiFinishedItem: ingredient.isSemiFinishedItem,
      extraPercentageApplicable: ingredient.extraPercentageApplicable,
      extraPercentage: ingredient.extraPercentage,
      allowDecimal: ingredient.allowDecimal,
      decimalPlaces: ingredient.decimalPlaces,
      unitPrice: ingredient.unitPrice,
      sortOrder: ingredient.sortOrder,
      isActive: ingredient.isActive,
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'code',
      label: 'Ingredient Code',
      render: (item: Ingredient) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (item: Ingredient) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    {
      key: 'categoryName',
      label: 'Category',
    },
    {
      key: 'unitOfMeasure',
      label: 'UOM',
    },
    {
      key: 'ingredientType',
      label: 'Type',
      render: (item: Ingredient) => (
        <Badge variant={item.ingredientType === 'Raw' ? 'primary' : 'warning'} size="sm">
          {item.ingredientType}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: Ingredient) => (
        item.isActive ? (
          <Badge variant="success" size="sm">Active</Badge>
        ) : (
          <Badge variant="danger" size="sm">Inactive</Badge>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Ingredient) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleActive(item)}
            className="p-1.5 rounded transition-colors"
            style={{ color: item.isActive ? '#DC2626' : '#10B981' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = item.isActive ? '#FEF2F2' : '#F0FDF4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={item.isActive ? 'Deactivate' : 'Activate'}
          >
            {item.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  const renderIngredientForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Ingredient Code"
          value={formData.code || ''}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., FLOUR, SUGAR"
          fullWidth
          required
        />
        <Input
          label="Ingredient Name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Full ingredient name"
          fullWidth
          required
        />
      </div>

      <Input
        label="Description"
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Ingredient description (optional)"
        fullWidth
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Category"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Ingredient Type"
          value={formData.ingredientType || 'Raw'}
          onChange={(e) => setFormData({ ...formData, ingredientType: e.target.value })}
          options={[
            { value: 'Raw', label: 'Raw Material' },
            { value: 'Semi-Finished', label: 'Semi-Finished' }
          ]}
          fullWidth
          required
        />
        <Input
          label="Unit Price (Rs.)"
          type="number"
          step="0.01"
          value={formData.unitPrice?.toString() || '0'}
          onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
          placeholder="0.00"
          fullWidth
        />
      </div>

      <div className="pt-2">
        <Toggle
          checked={formData.isActive || false}
          onChange={(checked) => setFormData({ ...formData, isActive: checked })}
          label="Active Status"
        />
      </div>
    </div>
  );

  // Loading state
  if (loading && ingredients.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p style={{ color: 'var(--muted-foreground)' }}>Loading ingredients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Ingredients</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage raw materials and ingredients ({totalCount} items)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Ingredient List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid var(--input)' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ingredients.length === 0 && !loading ? (
            <div className="text-center py-12">
              <Beaker className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
              <p style={{ color: 'var(--muted-foreground)' }}>
                No ingredients found. Create your first ingredient!
              </p>
            </div>
          ) : (
            <DataTable
              data={ingredients}
              columns={columns}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Ingredient Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Ingredient"
        size="lg"
      >
        {renderIngredientForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddIngredient} disabled={submitting}>
            {submitting ? 'Creating...' : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Ingredient Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedIngredient(null);
          resetForm();
        }}
        title="Edit Ingredient"
        size="lg"
      >
        {renderIngredientForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedIngredient(null);
            resetForm();
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditIngredient} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
