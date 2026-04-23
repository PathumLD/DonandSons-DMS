'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Checkbox from '@/components/ui/checkbox';
import { Toggle } from '@/components/ui/toggle';
import { Package, Plus, Search, Edit, Info, Trash2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockProducts, mockCategories, mockUOMs, type Product } from '@/lib/mock-data/products';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    categoryId: '',
    uomId: '',
    unitPrice: '',
    requireOpenStock: false,
    enableLabelPrint: false,
    active: true,
  });

  // Filter and paginate
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleActive = (id: number) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Math.max(...products.map(p => p.id)) + 1,
      code: formData.code,
      description: formData.description,
      categoryId: Number(formData.categoryId),
      category: mockCategories.find(c => c.id === Number(formData.categoryId))?.name || '',
      uomId: Number(formData.uomId),
      uom: mockUOMs.find(u => u.id === Number(formData.uomId))?.code || '',
      unitPrice: Number(formData.unitPrice),
      requireOpenStock: formData.requireOpenStock,
      enableLabelPrint: formData.enableLabelPrint,
      active: formData.active,
    };
    setProducts([newProduct, ...products]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditProduct = () => {
    if (selectedProduct) {
      setProducts(products.map(p =>
        p.id === selectedProduct.id
          ? {
              ...p,
              code: formData.code,
              description: formData.description,
              categoryId: Number(formData.categoryId),
              category: mockCategories.find(c => c.id === Number(formData.categoryId))?.name || '',
              uomId: Number(formData.uomId),
              uom: mockUOMs.find(u => u.id === Number(formData.uomId))?.code || '',
              unitPrice: Number(formData.unitPrice),
              requireOpenStock: formData.requireOpenStock,
              enableLabelPrint: formData.enableLabelPrint,
              active: formData.active,
            }
          : p
      ));
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      categoryId: '',
      uomId: '',
      unitPrice: '',
      requireOpenStock: false,
      enableLabelPrint: false,
      active: true,
    });
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      code: product.code,
      description: product.description,
      categoryId: String(product.categoryId),
      uomId: String(product.uomId),
      unitPrice: String(product.unitPrice),
      requireOpenStock: product.requireOpenStock,
      enableLabelPrint: product.enableLabelPrint,
      active: product.active,
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'category',
      label: 'Category',
      render: (item: Product) => (
        <span className="font-medium">{item.category}</span>
      ),
    },
    {
      key: 'code',
      label: 'Product Code',
      render: (item: Product) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Product Description',
    },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      render: (item: Product) => (
        <span className="font-semibold">
          Rs. {item.unitPrice.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'uom',
      label: 'UOM',
    },
    {
      key: 'requireOpenStock',
      label: 'Require Open Stk',
      render: (item: Product) => (
        item.requireOpenStock ? (
          <Badge variant="success" size="sm">Yes</Badge>
        ) : (
          <Badge variant="neutral" size="sm">No</Badge>
        )
      ),
    },
    {
      key: 'active',
      label: 'Active',
      render: (item: Product) => (
        item.active ? (
          <Badge variant="success" size="sm">Yes</Badge>
        ) : (
          <Badge variant="danger" size="sm">No</Badge>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Product) => (
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
            onClick={() => {
              setSelectedProduct(item);
              setShowInfoModal(true);
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Info"
          >
            <Info className="w-4 h-4" />
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

  const renderProductForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Product Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., ACT33, BR2, BU12"
          fullWidth
          required
        />
        <Input
          label="Product Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Full product name"
          fullWidth
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Product Category"
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          options={mockCategories.filter(c => c.active).map(c => ({ value: c.id, label: c.name }))}
          placeholder="Select category"
          fullWidth
          required
        />
        <Select
          label="Unit of Measure"
          value={formData.uomId}
          onChange={(e) => setFormData({ ...formData, uomId: e.target.value })}
          options={mockUOMs.map(u => ({ value: u.id, label: `${u.code} - ${u.description}` }))}
          placeholder="Select UOM"
          fullWidth
          required
        />
      </div>

      <Input
        label="Unit Price (Rs.)"
        type="number"
        step="0.01"
        value={formData.unitPrice}
        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
        placeholder="0.00"
        fullWidth
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <Checkbox
          label="Require Open Stock"
          checked={formData.requireOpenStock}
          onChange={(e) => setFormData({ ...formData, requireOpenStock: e.target.checked })}
        />
        <Checkbox
          label="Enable Label Print"
          checked={formData.enableLabelPrint}
          onChange={(e) => setFormData({ ...formData, enableLabelPrint: e.target.checked })}
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Products</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage your product catalog ({filteredProducts.length} items)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Product List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search products..."
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
            data={paginatedProducts}
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

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
        size="lg"
      >
        {renderProductForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
          resetForm();
        }}
        title="Edit Product"
        size="lg"
      >
        {renderProductForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditProduct}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      {/* Info Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => {
          setShowInfoModal(false);
          setSelectedProduct(null);
        }}
        title="Product Information"
        size="md"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product Code</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduct.code}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Category</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduct.category}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Description</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduct.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Unit Price</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Rs. {selectedProduct.unitPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Unit of Measure</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduct.uom}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Require Open Stock</p>
                {selectedProduct.requireOpenStock ? (
                  <Badge variant="success" size="sm">Yes</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">No</Badge>
                )}
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Enable Label Print</p>
                {selectedProduct.enableLabelPrint ? (
                  <Badge variant="success" size="sm">Yes</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">No</Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
              {selectedProduct.active ? (
                <Badge variant="success" size="sm">Active</Badge>
              ) : (
                <Badge variant="danger" size="sm">Inactive</Badge>
              )}
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowInfoModal(false);
            setSelectedProduct(null);
          }}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
