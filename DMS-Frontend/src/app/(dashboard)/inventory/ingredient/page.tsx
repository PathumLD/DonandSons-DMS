'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Beaker, Plus, Search, Edit, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockIngredients, mockUOMs, type Ingredient } from '@/lib/mock-data/products';

export default function IngredientPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(mockIngredients);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    uomId: '',
    reorderLevel: '',
    active: true,
  });

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ing =>
      ing.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ingredients, searchTerm]);

  const totalPages = Math.ceil(filteredIngredients.length / pageSize);
  const paginatedIngredients = filteredIngredients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleActive = (id: number) => {
    setIngredients(ingredients.map(i =>
      i.id === id ? { ...i, active: !i.active } : i
    ));
  };

  const handleAddIngredient = () => {
    const newIngredient: Ingredient = {
      id: Math.max(...ingredients.map(i => i.id)) + 1,
      code: formData.code,
      description: formData.description,
      uomId: Number(formData.uomId),
      uom: mockUOMs.find(u => u.id === Number(formData.uomId))?.code || '',
      reorderLevel: Number(formData.reorderLevel),
      active: formData.active,
    };
    setIngredients([newIngredient, ...ingredients]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditIngredient = () => {
    if (selectedIngredient) {
      setIngredients(ingredients.map(i =>
        i.id === selectedIngredient.id
          ? {
              ...i,
              code: formData.code,
              description: formData.description,
              uomId: Number(formData.uomId),
              uom: mockUOMs.find(u => u.id === Number(formData.uomId))?.code || '',
              reorderLevel: Number(formData.reorderLevel),
              active: formData.active,
            }
          : i
      ));
      setShowEditModal(false);
      setSelectedIngredient(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      uomId: '',
      reorderLevel: '',
      active: true,
    });
  };

  const openEditModal = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setFormData({
      code: ingredient.code,
      description: ingredient.description,
      uomId: String(ingredient.uomId),
      reorderLevel: String(ingredient.reorderLevel),
      active: ingredient.active,
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
      key: 'description',
      label: 'Description',
      render: (item: Ingredient) => (
        <span className="font-medium">{item.description}</span>
      ),
    },
    {
      key: 'uom',
      label: 'UOM',
    },
    {
      key: 'reorderLevel',
      label: 'Reorder Level',
      render: (item: Ingredient) => (
        <span className="font-semibold">{item.reorderLevel}</span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      render: (item: Ingredient) => (
        item.active ? (
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
            onClick={() => handleToggleActive(item.id)}
            className="p-1.5 rounded transition-colors"
            style={{ color: item.active ? '#DC2626' : '#10B981' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = item.active ? '#FEF2F2' : '#F0FDF4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={item.active ? 'Deactivate' : 'Activate'}
          >
            {item.active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
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
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., FLOUR, SUGAR"
          fullWidth
          required
        />
        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Full ingredient name"
          fullWidth
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Unit of Measure"
          value={formData.uomId}
          onChange={(e) => setFormData({ ...formData, uomId: e.target.value })}
          options={mockUOMs.map(u => ({ value: u.id, label: `${u.code} - ${u.description}` }))}
          placeholder="Select UOM"
          fullWidth
          required
        />
        <Input
          label="Reorder Level"
          type="number"
          value={formData.reorderLevel}
          onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
          placeholder="Minimum stock quantity"
          fullWidth
          required
        />
      </div>

      <div className="pt-2">
        <Toggle
          checked={formData.active}
          onChange={(checked) => setFormData({ ...formData, active: checked })}
          label="Active Status"
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Ingredients</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage raw materials and ingredients ({filteredIngredients.length} items)
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
          <DataTable
            data={paginatedIngredients}
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
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddIngredient}>
            <Plus className="w-4 h-4 mr-2" />
            Add Ingredient
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
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditIngredient}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
