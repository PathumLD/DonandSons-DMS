'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { productsApi, type Product, type CreateProductDto, type UpdateProductDto } from '@/lib/api/products';
import { categoriesApi, type Category } from '@/lib/api/categories';
import { uomsApi, type UnitOfMeasure } from '@/lib/api/uoms';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CreateProductDto>>({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    unitOfMeasureId: '',
    unitPrice: 0,
    productType: '',
    productionSection: '',
    hasFullSize: true,
    hasMiniSize: false,
    allowDecimal: false,
    decimalPlaces: 0,
    roundingValue: 1,
    isPlainRollItem: false,
    requireOpenStock: true,
    enableLabelPrint: true,
    allowFutureLabelPrint: false,
    sortOrder: 0,
    defaultDeliveryTurns: [],
    availableInTurns: [],
    isActive: true,
  });

  // Fetch products on mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, searchTerm]);

  // Fetch categories and UOMs on mount
  useEffect(() => {
    fetchCategories();
    fetchUOMs();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsApi.getAll(
        currentPage,
        pageSize,
        searchTerm || undefined,
        undefined,
        undefined
      );
      
      setProducts(response.products);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load products';
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

  const handleToggleActive = async (product: Product) => {
    try {
      await productsApi.update(product.id, {
        code: product.code,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        unitOfMeasureId: product.unitOfMeasureId,
        unitPrice: product.unitPrice,
        productType: product.productType,
        productionSection: product.productionSection,
        hasFullSize: product.hasFullSize,
        hasMiniSize: product.hasMiniSize,
        allowDecimal: product.allowDecimal,
        decimalPlaces: product.decimalPlaces,
        roundingValue: product.roundingValue,
        isPlainRollItem: product.isPlainRollItem,
        requireOpenStock: product.requireOpenStock,
        enableLabelPrint: product.enableLabelPrint,
        allowFutureLabelPrint: product.allowFutureLabelPrint,
        sortOrder: product.sortOrder,
        defaultDeliveryTurns: product.defaultDeliveryTurns,
        availableInTurns: product.availableInTurns,
        isActive: !product.isActive,
      });
      
      toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchProducts();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to toggle product status';
      toast.error(errorMsg);
    }
  };

  const handleAddProduct = async () => {
    try {
      setSubmitting(true);
      
      const dto: CreateProductDto = {
        code: formData.code!,
        name: formData.name!,
        description: formData.description,
        categoryId: formData.categoryId!,
        unitOfMeasureId: formData.unitOfMeasureId!,
        unitPrice: Number(formData.unitPrice),
        productType: formData.productType,
        productionSection: formData.productionSection,
        hasFullSize: formData.hasFullSize!,
        hasMiniSize: formData.hasMiniSize!,
        allowDecimal: formData.allowDecimal!,
        decimalPlaces: Number(formData.decimalPlaces),
        roundingValue: Math.floor(Number(formData.roundingValue) || 1),
        isPlainRollItem: formData.isPlainRollItem!,
        requireOpenStock: formData.requireOpenStock!,
        enableLabelPrint: formData.enableLabelPrint!,
        allowFutureLabelPrint: formData.allowFutureLabelPrint!,
        sortOrder: Number(formData.sortOrder),
        defaultDeliveryTurns: formData.defaultDeliveryTurns || [],
        availableInTurns: formData.availableInTurns || [],
        isActive: formData.isActive!,
      };
      
      await productsApi.create(dto);
      toast.success('Product created successfully');
      setShowAddModal(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create product';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      setSubmitting(true);
      
      const dto: UpdateProductDto = {
        code: formData.code!,
        name: formData.name!,
        description: formData.description,
        categoryId: formData.categoryId!,
        unitOfMeasureId: formData.unitOfMeasureId!,
        unitPrice: Number(formData.unitPrice) || 0,
        productType: formData.productType,
        productionSection: formData.productionSection,
        hasFullSize: formData.hasFullSize ?? true,
        hasMiniSize: formData.hasMiniSize ?? false,
        allowDecimal: formData.allowDecimal ?? false,
        decimalPlaces: Number(formData.decimalPlaces) || 0,
        roundingValue: Math.floor(Number(formData.roundingValue) || 1),
        isPlainRollItem: formData.isPlainRollItem ?? false,
        requireOpenStock: formData.requireOpenStock ?? true,
        enableLabelPrint: formData.enableLabelPrint ?? true,
        allowFutureLabelPrint: formData.allowFutureLabelPrint ?? false,
        sortOrder: Number(formData.sortOrder) || 0,
        defaultDeliveryTurns: formData.defaultDeliveryTurns || [],
        availableInTurns: formData.availableInTurns || [],
        isActive: formData.isActive ?? true,
      };
      
      await productsApi.update(selectedProduct.id, dto);
      toast.success('Product updated successfully');
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update product';
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
      unitPrice: 0,
      productType: '',
      productionSection: '',
      hasFullSize: true,
      hasMiniSize: false,
      allowDecimal: false,
      decimalPlaces: 0,
      roundingValue: 1,
      isPlainRollItem: false,
      requireOpenStock: true,
      enableLabelPrint: true,
      allowFutureLabelPrint: false,
      sortOrder: 0,
      defaultDeliveryTurns: [],
      availableInTurns: [],
      isActive: true,
    });
  };

  const openEditModal = async (product: Product) => {
    try {
      setSubmitting(true);
      const fullProduct = await productsApi.getById(product.id);
      
      setSelectedProduct(fullProduct);
      setFormData({
        code: fullProduct.code,
        name: fullProduct.name,
        description: fullProduct.description,
        categoryId: fullProduct.categoryId,
        unitOfMeasureId: fullProduct.unitOfMeasureId,
        unitPrice: fullProduct.unitPrice,
        productType: fullProduct.productType,
        productionSection: fullProduct.productionSection,
        hasFullSize: fullProduct.hasFullSize ?? true,
        hasMiniSize: fullProduct.hasMiniSize ?? false,
        allowDecimal: fullProduct.allowDecimal ?? false,
        decimalPlaces: fullProduct.decimalPlaces ?? 0,
        roundingValue: fullProduct.roundingValue ?? 1,
        isPlainRollItem: fullProduct.isPlainRollItem ?? false,
        requireOpenStock: fullProduct.requireOpenStock,
        enableLabelPrint: fullProduct.enableLabelPrint,
        allowFutureLabelPrint: fullProduct.allowFutureLabelPrint,
        sortOrder: fullProduct.sortOrder ?? 0,
        defaultDeliveryTurns: fullProduct.defaultDeliveryTurns || [],
        availableInTurns: fullProduct.availableInTurns || [],
        isActive: fullProduct.isActive,
      });
      setShowEditModal(true);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load product details';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'categoryName',
      label: 'Category',
      render: (item: Product) => (
        <span className="font-medium">{item.categoryName}</span>
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
      key: 'name',
      label: 'Product Name',
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
      key: 'unitOfMeasure',
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
      key: 'isActive',
      label: 'Active',
      render: (item: Product) => (
        item.isActive ? (
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

  const renderProductForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Product Code"
          value={formData.code || ''}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., ACT33, BR2, BU12"
          fullWidth
          required
        />
        <Input
          label="Product Name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Full product name"
          fullWidth
          required
        />
      </div>

      <Input
        label="Description"
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Product description (optional)"
        fullWidth
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Product Category"
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

      <Input
        label="Unit Price (Rs.)"
        type="number"
        step="0.01"
        value={formData.unitPrice?.toString() || '0'}
        onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
        placeholder="0.00"
        fullWidth
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <Checkbox
          label="Require Open Stock"
          checked={formData.requireOpenStock || false}
          onChange={(e) => setFormData({ ...formData, requireOpenStock: e.target.checked })}
        />
        <Checkbox
          label="Enable Label Print"
          checked={formData.enableLabelPrint || false}
          onChange={(e) => setFormData({ ...formData, enableLabelPrint: e.target.checked })}
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
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p style={{ color: 'var(--muted-foreground)' }}>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Products</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage your product catalog ({totalCount} items)
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

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

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
          {products.length === 0 && !loading ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
              <p style={{ color: 'var(--muted-foreground)' }}>
                No products found. Create your first product!
              </p>
            </div>
          ) : (
            <DataTable
              data={products}
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

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
        size="lg"
      >
        {renderProductForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddProduct} disabled={submitting}>
            {submitting ? 'Creating...' : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </>
            )}
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
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditProduct} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
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
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduct.categoryName}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product Name</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduct.name}</p>
            </div>
            {selectedProduct.description && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Description</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedProduct.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Unit Price</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Rs. {selectedProduct.unitPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Unit of Measure</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedProduct.unitOfMeasure}</p>
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
              {selectedProduct.isActive ? (
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
