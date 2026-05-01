'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Calendar, Plus, Search, Edit, X, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { dayTypesApi, type DayType, type UpdateDayTypeDto } from '@/lib/api/day-types';
import toast from 'react-hot-toast';

export default function DayTypesPage() {
  const router = useRouter();
  const [dayTypes, setDayTypes] = useState<DayType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDayTypes();
  }, [currentPage, pageSize, searchTerm]);

  const loadDayTypes = async () => {
    try {
      setLoading(true);
      const response = await dayTypesApi.getAll(currentPage, pageSize, searchTerm, undefined);
      setDayTypes(response.dayTypes);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load day types');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (dayType: DayType) => {
    try {
      const updateData: UpdateDayTypeDto = {
        code: dayType.code,
        name: dayType.name,
        description: dayType.description,
        multiplier: dayType.multiplier,
        color: dayType.color,
        isActive: !dayType.isActive,
      };
      await dayTypesApi.update(dayType.id, updateData);
      toast.success(`Day type ${dayType.isActive ? 'deactivated' : 'activated'}`);
      loadDayTypes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update day type');
    }
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (item: DayType) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Day Type Name',
      render: (item: DayType) => (
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
      key: 'multiplier',
      label: 'Multiplier',
      render: (item: DayType) => (
        <Badge variant="neutral" size="sm">{item.multiplier}x</Badge>
      ),
    },
    {
      key: 'color',
      label: 'Color',
      render: (item: DayType) => (
        <div className="flex items-center gap-2">
          {item.color && (
            <div
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: item.color }}
            />
          )}
          <span className="text-sm font-mono">{item.color}</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: DayType) => (
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
      render: (item: DayType) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/administrator/day-types/edit/${item.id}`)}
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
            <Calendar className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Day Types
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage production day types for morning and afternoon schedules ({totalCount} types)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => router.push('/administrator/day-types/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Day Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Day Type List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search day types..."
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
              data={dayTypes}
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
