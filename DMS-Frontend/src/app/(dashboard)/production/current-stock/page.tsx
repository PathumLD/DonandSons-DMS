'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Package, Search, AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockCurrentStock, type CurrentStock } from '@/lib/mock-data/production';

export default function CurrentStockPage() {
  const [stocks, setStocks] = useState<CurrentStock[]>(mockCurrentStock);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredStocks = useMemo(() => {
    return stocks.filter(s => {
      const matchesSearch = 
        s.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || s.category === categoryFilter;
      const matchesLowStock = !lowStockOnly || s.currentStock <= s.reorderLevel;
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [stocks, searchTerm, categoryFilter, lowStockOnly]);

  const totalPages = Math.ceil(filteredStocks.length / pageSize);
  const paginatedStocks = filteredStocks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const categories = [...new Set(stocks.map(s => s.category))];
  const lowStockCount = stocks.filter(s => s.currentStock <= s.reorderLevel).length;

  const handleRefresh = () => {
    console.log('Refreshing stock data...');
    // TODO: Implement actual refresh logic
  };

  const columns = [
    {
      key: 'productCode',
      label: 'Product Code',
      render: (item: CurrentStock) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.productCode}
        </span>
      ),
    },
    {
      key: 'productName',
      label: 'Product Name',
      render: (item: CurrentStock) => (
        <span className="font-medium">{item.productName}</span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
    },
    {
      key: 'currentStock',
      label: 'Current Stock',
      render: (item: CurrentStock) => (
        <div className="flex items-center space-x-2">
          <span 
            className="font-semibold text-lg"
            style={{ color: item.currentStock <= item.reorderLevel ? '#DC2626' : '#111827' }}
          >
            {item.currentStock}
          </span>
          <span className="text-sm" style={{ color: '#6B7280' }}>{item.uom}</span>
          {item.currentStock <= item.reorderLevel && (
            <AlertTriangle className="w-4 h-4" style={{ color: '#F59E0B' }} />
          )}
        </div>
      ),
    },
    {
      key: 'reorderLevel',
      label: 'Reorder Level',
      render: (item: CurrentStock) => (
        <span className="font-medium">{item.reorderLevel} {item.uom}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: CurrentStock) => {
        const percentage = (item.currentStock / item.reorderLevel) * 100;
        if (percentage <= 50) {
          return <Badge variant="danger" size="sm"><AlertTriangle className="w-3 h-3 mr-1" />Critical</Badge>;
        } else if (percentage <= 100) {
          return <Badge variant="warning" size="sm">Low Stock</Badge>;
        } else {
          return <Badge variant="success" size="sm">In Stock</Badge>;
        }
      },
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      render: (item: CurrentStock) => (
        <span className="text-sm" style={{ color: '#6B7280' }}>
          {new Date(item.lastUpdated).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Current Stock</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            View real-time inventory stock levels ({filteredStocks.length} products)
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Stock
        </Button>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#6B7280' }}>Total Products</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>{stocks.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C4' }}>
                <Package className="w-6 h-6" style={{ color: '#C8102E' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#6B7280' }}>Low Stock Items</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#DC2626' }}>{lowStockCount}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <AlertTriangle className="w-6 h-6" style={{ color: '#DC2626' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#6B7280' }}>Total Stock Value</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>Rs. 2.5M</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F0FDF4' }}>
                <Package className="w-6 h-6" style={{ color: '#10B981' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#6B7280' }}>Categories</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>{categories.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
                <Package className="w-6 h-6" style={{ color: '#3B82F6' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Stock List</CardTitle>
            <div className="flex items-center space-x-3">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ border: '1px solid #D1D5DB' }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  setLowStockOnly(!lowStockOnly);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  lowStockOnly ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: lowStockOnly ? '#F59E0B' : '#F9FAFB',
                  color: lowStockOnly ? 'white' : '#374151',
                  border: '1px solid #D1D5DB',
                }}
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Low Stock Only
              </button>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search stock..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #D1D5DB' }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={paginatedStocks}
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
    </div>
  );
}
