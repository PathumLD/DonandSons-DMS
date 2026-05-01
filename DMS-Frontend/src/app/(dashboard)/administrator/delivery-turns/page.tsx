'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Clock, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { deliveryTurnsApi, type DeliveryTurn, type UpdateDeliveryTurnDto } from '@/lib/api/delivery-turns';
import toast from 'react-hot-toast';

export default function DeliveryTurnsPage() {
  const router = useRouter();
  const [deliveryTurns, setDeliveryTurns] = useState<DeliveryTurn[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveryTurns();
  }, [currentPage, pageSize, searchTerm]);

  const loadDeliveryTurns = async () => {
    try {
      setLoading(true);
      const response = await deliveryTurnsApi.getAll(currentPage, pageSize, searchTerm, undefined);
      setDeliveryTurns(response.deliveryTurns);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load delivery turns');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (turn: DeliveryTurn) => {
    try {
      const updateData: UpdateDeliveryTurnDto = {
        code: turn.code,
        name: turn.name,
        description: turn.description,
        time: turn.time,
        displayOrder: turn.displayOrder,
        isActive: !turn.isActive,
      };
      await deliveryTurnsApi.update(turn.id, updateData);
      toast.success(`Delivery turn ${turn.isActive ? 'deactivated' : 'activated'}`);
      loadDeliveryTurns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update delivery turn');
    }
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (item: DeliveryTurn) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Delivery Turn Name',
      render: (item: DeliveryTurn) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    {
      key: 'time',
      label: 'Delivery Time',
      render: (item: DeliveryTurn) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="font-semibold">{item.timeFormatted}</span>
        </div>
      ),
    },
    {
      key: 'displayOrder',
      label: 'Display Order',
      render: (item: DeliveryTurn) => (
        <span className="font-medium">{item.displayOrder}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: DeliveryTurn) => (
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
      render: (item: DeliveryTurn) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/administrator/delivery-turns/edit/${item.id}`)}
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
            <Clock className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Delivery Turns
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Configure delivery turn times and production schedules ({totalCount} turns)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => router.push('/administrator/delivery-turns/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Delivery Turn
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Delivery Turn List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search delivery turns..."
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
              data={deliveryTurns}
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
