'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Search } from 'lucide-react';
import { mockCurrentStock, type CurrentStock } from '@/lib/mock-data/production';

export default function CurrentStockPage() {
  const [stocks, setStocks] = useState<CurrentStock[]>(mockCurrentStock);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredStocks = useMemo(() => {
    return stocks.filter(s => {
      const matchesSearch = s.product.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [stocks, searchTerm]);

  const totalPages = Math.ceil(filteredStocks.length / pageSize);
  const paginatedStocks = filteredStocks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const formatDateTime = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${month}/${day}/${year} ${displayHours}:${minutes}:${seconds} ${ampm}`;
  };

  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (item: CurrentStock) => (
        <span style={{ color: 'var(--foreground)' }}>{item.product}</span>
      ),
    },
    {
      key: 'openBalance',
      label: 'Open Balance',
      render: (item: CurrentStock) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.openBalance.toFixed(2)}</span>
      ),
    },
    {
      key: 'todayProduction',
      label: 'Today Production',
      render: (item: CurrentStock) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.todayProduction.toFixed(2)}</span>
      ),
    },
    {
      key: 'todayProductionCancelled',
      label: 'Today Production Cancelled',
      render: (item: CurrentStock) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.todayProductionCancelled.toFixed(2)}</span>
      ),
    },
    {
      key: 'todayDelivery',
      label: 'Today Delivery',
      render: (item: CurrentStock) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.todayDelivery.toFixed(2)}</span>
      ),
    },
    {
      key: 'deliveryCancelled',
      label: 'Delivery Cancelled',
      render: (item: CurrentStock) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.deliveryCancelled.toFixed(2)}</span>
      ),
    },
    {
      key: 'deliveryReturned',
      label: 'Delivery Returned',
      render: (item: CurrentStock) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.deliveryReturned.toFixed(2)}</span>
      ),
    },
    {
      key: 'todayBalance',
      label: 'Today Balance',
      render: (item: CurrentStock) => (
        <span style={{ color: 'var(--foreground)' }}>{item.todayBalance}</span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Production Stock</h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Current Production Stock on {formatDateTime(currentTime)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search:"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                style={{ 
                  border: '1px solid var(--input)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)'
                }}
              />
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
