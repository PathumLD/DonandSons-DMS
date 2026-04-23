'use client';

import { ReactNode } from 'react';
import { useTheme } from '@/lib/theme/theme-context';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: DataTableProps<T>) {
  const { pageColor } = useTheme();

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center space-x-2">
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Rows per page:
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg text-sm focus:outline-none"
            style={{ border: '1px solid var(--input)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm ml-4" style={{ color: 'var(--muted-foreground)' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange?.(1)}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ color: 'var(--foreground)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                1
              </button>
              {startPage > 2 && <span className="px-2" style={{ color: 'var(--muted-foreground)' }}>...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className="px-3 py-1.5 text-sm rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: page === currentPage ? pageColor : 'transparent',
                color: page === currentPage ? 'white' : 'var(--foreground)',
              }}
              onMouseEnter={(e) => {
                if (page !== currentPage) {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== currentPage) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2" style={{ color: 'var(--muted-foreground)' }}>...</span>}
              <button
                onClick={() => onPageChange?.(totalPages)}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ color: 'var(--foreground)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
            <thead>
              <tr style={{ backgroundColor: pageColor }}>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <div className="flex items-center justify-center py-12">
          <div 
            className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"
            style={{ borderColor: pageColor, borderRightColor: 'transparent' }}
          ></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
            <thead>
              <tr style={{ backgroundColor: pageColor }}>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
          <thead>
            <tr style={{ backgroundColor: pageColor }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            {data.map((item, index) => (
              <tr 
                key={item.id || index}
                className="transition-colors"
                style={{ backgroundColor: index % 2 === 0 ? 'var(--card)' : 'var(--muted)' }}
                onMouseEnter={(e) => {
                  const isDark = document.documentElement.classList.contains('dark');
                  e.currentTarget.style.backgroundColor = isDark ? 'var(--border)' : '#FEF2F2';
                }}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--card)' : 'var(--muted)'}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`}
                    style={{ color: 'var(--foreground)' }}
                  >
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && renderPagination()}
    </div>
  );
}
