'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { InlineDetailPanel } from '@/components/ui/inline-detail-panel';
import { Package, Plus, Search, Edit, Eye, EyeOff, Trash2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { productsApi, type Product } from '@/lib/api/products';
import toast from 'react-hot-toast';
import { ProtectedPage, PermissionButton } from '@/components/auth';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProductsPage() {
  return (
    <ProtectedPage permission="products:view">
      <ProductsPageContent />
    </ProtectedPage>
  );
}

function ProductsPageContent() {
  const router = useRouter();
  const { canAction } = usePermissions();
  const canEditProduct = canAction('/inventory/products', 'edit');
  const canDeleteProduct = canAction('/inventory/products', 'delete');
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination and search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch products on mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Don't pass activeOnly parameter - this will return ALL products (active and inactive)
      const response = await productsApi.getAll(
        currentPage,
        pageSize,
        searchTerm || undefined,
        undefined
        // activeOnly parameter omitted - returns all products
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
          {canEditProduct && (
            <button
              onClick={() => router.push(`/inventory/products/edit/${item.id}`)}
              className="p-1.5 rounded transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              if (selectedProduct?.id === item.id) setSelectedProduct(null);
              else setSelectedProduct(item);
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={selectedProduct?.id === item.id ? 'Hide details' : 'View details'}
          >
            {selectedProduct?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          {(canEditProduct || canDeleteProduct) && (
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
        <PermissionButton 
          permission="products:create"
          variant="primary" 
          size="md" 
          onClick={() => router.push('/inventory/products/add')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </PermissionButton>
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

      <InlineDetailPanel
        title="Product Information"
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        footer={
          <Button variant="ghost" onClick={() => setSelectedProduct(null)}>
            Close
          </Button>
        }
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
      </InlineDetailPanel>
    </div>
  );
}
