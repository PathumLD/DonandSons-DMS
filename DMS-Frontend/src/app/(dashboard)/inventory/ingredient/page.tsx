'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Beaker, Plus, Search, Edit, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ingredientsApi, type Ingredient } from '@/lib/api/ingredients';
import { ProtectedPage } from '@/components/auth';
import { usePermissions } from '@/hooks/usePermissions';
import toast from 'react-hot-toast';

export default function IngredientPage() {
  return (
    <ProtectedPage permission="ingredients:view">
      <IngredientPageContent />
    </ProtectedPage>
  );
}

function IngredientPageContent() {
  const router = useRouter();
  const { canAction } = usePermissions();
  const canCreate = canAction('/inventory/ingredient', 'create');
  const canEditIngredient = canAction('/inventory/ingredient', 'edit');
  
  // Data states
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination and search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch ingredients on mount and when filters change
  useEffect(() => {
    fetchIngredients();
  }, [currentPage, pageSize, searchTerm]);

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
          {canEditIngredient && (
            <button
              onClick={() => router.push(`/inventory/ingredient/edit/${item.id}`)}
              className="p-1.5 rounded transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canEditIngredient && (
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
          )}
        </div>
      ),
    },
  ];

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
        {canCreate && (
          <Button variant="primary" size="md" onClick={() => router.push('/inventory/ingredient/add')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Ingredient
          </Button>
        )}
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
    </div>
  );
}
