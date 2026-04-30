'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DollarSign, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { priceListsApi, type PriceList, type UpdatePriceListDto } from '@/lib/api/price-lists';
import toast from 'react-hot-toast';

export default function PriceManagerPage() {
  const router = useRouter();
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPriceLists();
  }, [currentPage, pageSize, searchTerm]);

  const loadPriceLists = async () => {
    try {
      setLoading(true);
      const response = await priceListsApi.getAll(currentPage, pageSize, searchTerm, undefined);
      setPriceLists(response.priceLists);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load price lists');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (priceList: PriceList) => {
    try {
      const updateData: UpdatePriceListDto = {
        code: priceList.code,
        name: priceList.name,
        description: priceList.description,
        priceListType: priceList.priceListType,
        currency: priceList.currency,
        effectiveFrom: priceList.effectiveFrom,
        effectiveTo: priceList.effectiveTo,
        isDefault: priceList.isDefault,
        priority: priceList.priority,
        isActive: !priceList.isActive,
      };
      await priceListsApi.update(priceList.id, updateData);
      toast.success(`Price list ${priceList.isActive ? 'deactivated' : 'activated'}`);
      loadPriceLists();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update price list');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (item: PriceList) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Price List Name',
      render: (item: PriceList) => (
        <div>
          <span className="font-medium">{item.name}</span>
          {item.description && (
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {item.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'currency',
      label: 'Currency',
      render: (item: PriceList) => (
        <Badge variant="neutral" size="sm">{item.currency}</Badge>
      ),
    },
    {
      key: 'effectiveFrom',
      label: 'Effective From',
      render: (item: PriceList) => (
        <span className="text-sm">{formatDate(item.effectiveFrom)}</span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (item: PriceList) => (
        <span className="text-sm font-mono">{item.priority}</span>
      ),
    },
    {
      key: 'isDefault',
      label: 'Default',
      render: (item: PriceList) => (
        item.isDefault ? <Badge variant="info" size="sm">Default</Badge> : null
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: PriceList) => (
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
      render: (item: PriceList) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/administrator/price-manager/edit/${item.id}`)}
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

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            <DollarSign className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Price Manager
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage price lists and pricing strategies ({totalCount} price lists)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => router.push('/administrator/price-manager/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Price List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Price Lists</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search price lists..."
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C8102E' }} />
            </div>
          ) : (
            <DataTable
              data={priceLists}
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
