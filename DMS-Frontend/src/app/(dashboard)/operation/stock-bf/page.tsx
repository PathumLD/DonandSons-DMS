'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { InlineDetailPanel } from '@/components/ui/inline-detail-panel';
import { Plus, Search, Edit, Eye, EyeOff, Info, Loader2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { stockBfApi, type StockBF } from '@/lib/api/stock-bf';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { isAdminUser } from '@/lib/date-restrictions';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedPage } from '@/components/auth';
import toast from 'react-hot-toast';

export default function StockBFPage() {
  return (
    <ProtectedPage permission="operation:stock-bf:view">
      <StockBFPageContent />
    </ProtectedPage>
  );
}

function StockBFPageContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { canAction } = usePermissions();
  const canCreate = canAction('/operation/stock-bf', 'create');
  const canEditBf = canAction('/operation/stock-bf', 'edit');
  const canDeleteBf = canAction('/operation/stock-bf', 'delete');
  // approve/reject buttons live on the centralized /operation/approvals page
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('stock-bf'));

  const [stockBFs, setStockBFs] = useState<StockBF[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockBF | null>(null);
  const [viewBfLines, setViewBfLines] = useState<StockBF[]>([]);
  const [viewBfLinesLoading, setViewBfLinesLoading] = useState(false);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);

  useEffect(() => {
    fetchStockBFs();
  }, [currentPage, pageSize, showPreviousRecords, isAdmin]);

  const fetchStockBFs = async () => {
    try {
      setIsLoading(true);
      const response = await stockBfApi.getAll(currentPage, pageSize, {
        showPreviousRecords: !isAdmin && showPreviousRecords,
      });
      setStockBFs(response.stockBFs || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount ?? response.stockBFs?.length ?? 0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load stock BF records');
      setStockBFs([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  /** Search only — visibility & BF date rules are enforced by the API */
  const filteredStockBFs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return stockBFs;
    return stockBFs.filter((s) => {
      return (
        s.bfNo.toLowerCase().includes(q) ||
        (s.product?.code || '').toLowerCase().includes(q) ||
        (s.outlet?.name || '').toLowerCase().includes(q) ||
        (s.outlet?.code || s.outletCode || '').toLowerCase().includes(q) ||
        (s.productName || '').toLowerCase().includes(q)
      );
    });
  }, [stockBFs, searchTerm]);

  const paginatedStockBFs = filteredStockBFs;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stock BF record?')) return;
    
    try {
      await stockBfApi.delete(id);
      toast.success('Stock BF deleted successfully');
      fetchStockBFs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete stock BF');
    }
  };

  const handleApproveBf = async (id: string) => {
    if (!confirm('Approve this Stock BF line?')) return;
    try {
      await stockBfApi.approve(id);
      toast.success('Stock BF approved');
      fetchStockBFs();
      if (selectedStock?.id === id) {
        try {
          const full = await stockBfApi.getById(id);
          setSelectedStock(full);
          const day = full.bfDate.slice(0, 10);
          const related = await stockBfApi.getAll(1, 500, {
            startDate: day,
            endDate: day,
            outletId: full.outletId,
          });
          const lines = (related.stockBFs || []).filter((s: StockBF) => s.outletId === full.outletId);
          lines.sort((a: StockBF, b: StockBF) => {
            const na = (a.productName || a.product?.name || '').localeCompare(b.productName || b.product?.name || '');
            if (na !== 0) return na;
            return a.bfNo.localeCompare(b.bfNo);
          });
          setViewBfLines(lines.length > 0 ? lines : [full]);
        } catch {
          /* ignore */
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectBf = async (id: string) => {
    if (!confirm('Reject this Stock BF line?')) return;
    try {
      await stockBfApi.reject(id);
      toast.success('Stock BF rejected');
      fetchStockBFs();
      if (selectedStock?.id === id) {
        try {
          const full = await stockBfApi.getById(id);
          setSelectedStock(full);
          const day = full.bfDate.slice(0, 10);
          const related = await stockBfApi.getAll(1, 500, {
            startDate: day,
            endDate: day,
            outletId: full.outletId,
          });
          const lines = (related.stockBFs || []).filter((s: StockBF) => s.outletId === full.outletId);
          lines.sort((a: StockBF, b: StockBF) => {
            const na = (a.productName || a.product?.name || '').localeCompare(b.productName || b.product?.name || '');
            if (na !== 0) return na;
            return a.bfNo.localeCompare(b.bfNo);
          });
          setViewBfLines(lines.length > 0 ? lines : [full]);
        } catch {
          /* ignore */
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    }
  };

  /** Legacy Active treated as Approved if API returns old data */
  const renderStockBfStatus = (status: string) => {
    const s = status === 'Active' ? 'Approved' : status;
    const label =
      s === 'Pending'
        ? 'Pending'
        : s === 'Approved'
          ? 'Approved'
          : s === 'Rejected'
            ? 'Rejected'
            : s === 'Adjusted'
              ? 'Adjusted'
              : status;
    let variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral';
    if (s === 'Pending') variant = 'warning';
    else if (s === 'Approved') variant = 'success';
    else if (s === 'Rejected') variant = 'danger';
    else if (s === 'Adjusted') variant = 'warning';
    return (
      <Badge variant={variant} size="sm">
        {label}
      </Badge>
    );
  };

  const formatApproverCell = (item: StockBF) => {
    const st = item.status === 'Active' ? 'Approved' : item.status;
    if (st === 'Approved' && item.approvedByName) {
      const d = item.approvedDate ? new Date(item.approvedDate).toLocaleDateString() : '';
      return (
        <span className="text-sm">
          {d ? `${item.approvedByName} — ${d}` : item.approvedByName}
        </span>
      );
    }
    if (st === 'Rejected' && item.rejectedByName) {
      const d = item.rejectedDate ? new Date(item.rejectedDate).toLocaleDateString() : '';
      return (
        <span className="text-sm">
          {d ? `${item.rejectedByName} — ${d}` : item.rejectedByName}
        </span>
      );
    }
    return <span className="text-sm">-</span>;
  };

  const openViewStockBF = async (item: StockBF) => {
    if (selectedStock?.id === item.id) {
      closeViewPanel();
      return;
    }
    try {
      const full = await stockBfApi.getById(item.id);
      setSelectedStock(full);
      setViewBfLines([]);
      setViewBfLinesLoading(true);
      try {
        const day = full.bfDate.slice(0, 10);
        const related = await stockBfApi.getAll(1, 500, {
          startDate: day,
          endDate: day,
          outletId: full.outletId,
        });
        const lines = (related.stockBFs || []).filter((s: StockBF) => s.outletId === full.outletId);
        lines.sort((a: StockBF, b: StockBF) => {
          const na = (a.productName || a.product?.name || '').localeCompare(b.productName || b.product?.name || '');
          if (na !== 0) return na;
          return a.bfNo.localeCompare(b.bfNo);
        });
        setViewBfLines(lines.length > 0 ? lines : [full]);
      } catch {
        setViewBfLines([full]);
      } finally {
        setViewBfLinesLoading(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load Stock BF details');
    }
  };

  const closeViewPanel = () => {
    setSelectedStock(null);
    setViewBfLines([]);
    setViewBfLinesLoading(false);
  };

  const columns = [
    {
      key: 'bfDate',
      label: 'Date',
      render: (item: StockBF) => (
        <span className="font-medium">{new Date(item.bfDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'outlet',
      label: 'Outlet',
      render: (item: StockBF) => (
        <span className="font-medium">{item.outletCode || item.outlet?.code || '-'}</span>
      ),
    },
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: StockBF) => (
        <span className="font-medium">{item.outlet?.name || item.outletName || '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: StockBF) => renderStockBfStatus(item.status),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: StockBF) => (
        <span className="text-sm">{item.updatedByName || '-'}</span>
      ),
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: StockBF) => (
        <span className="text-sm">{new Date(item.updatedAt).toLocaleString()}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: StockBF) => formatApproverCell(item),
    },
    {
      key: 'actions',
      label: '',
      render: (item: StockBF) => (
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => openViewStockBF(item)}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            title={selectedStock?.id === item.id ? 'Hide details' : 'View details'}
          >
            {selectedStock?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          {item.status === 'Pending' && canEditBf && (
            <button
              type="button"
              onClick={() => router.push(`/operation/stock-bf/edit/${item.id}`)}
              className="p-1.5 rounded transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {item.status === 'Pending' && canDeleteBf && (
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="p-1.5 rounded transition-colors"
              style={{ color: '#DC2626' }}
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Stock B/F (Brought Forward)</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage opening stock balances (
            {searchTerm.trim()
              ? `${filteredStockBFs.length} matching`
              : `${totalCount} record${totalCount === 1 ? '' : 's'}`}
            )
          </p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All records visible. Any date allowed.'
                : 'You see your own records. Back date up to 3 days.'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!isAdmin && (
            <Button
              variant={showPreviousRecords ? 'primary' : 'secondary'}
              size="md"
              onClick={() => {
                setShowPreviousRecords(!showPreviousRecords);
                setCurrentPage(1);
              }}
            >
              {showPreviousRecords ? 'Hide Previous Records' : 'Show Previous Records'}
            </Button>
          )}
          {canCreate && (
            <Button variant="primary" size="md" onClick={() => router.push('/operation/stock-bf/add')}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Stock BF</CardTitle>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                History closing balance
              </p>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search by BF no., showroom code, product..."
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            </div>
          ) : (
            <DataTable
              data={paginatedStockBFs}
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
        title="Stock BF Details"
        open={!!selectedStock}
        onClose={closeViewPanel}
        contentClassName="max-w-[min(100%,56rem)]"
        footer={
          <>
            <Button variant="ghost" onClick={closeViewPanel}>
              Close
            </Button>
            {selectedStock?.status === 'Pending' && canEditBf && (
              <Button
                variant="primary"
                onClick={() => {
                  const id = selectedStock.id;
                  closeViewPanel();
                  router.push(`/operation/stock-bf/edit/${id}`);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </>
        }
      >
        {selectedStock && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Opened line (BF No)</p>
                <p className="text-sm font-semibold font-mono" style={{ color: 'var(--foreground)' }}>{selectedStock.bfNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status (this line)</p>
                {renderStockBfStatus(selectedStock.status)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>BF Date</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedStock.bfDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {(selectedStock.outletCode || selectedStock.outlet?.code) ?? '-'}{' '}
                {(selectedStock.outletName || selectedStock.outlet?.name) ? (
                  <span style={{ color: 'var(--muted-foreground)' }}>
                    ({selectedStock.outletName || selectedStock.outlet?.name})
                  </span>
                ) : null}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Products for this showroom &amp; date
              </p>
              <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Each product is stored as its own BF record. Rows shown below share the same BF date and showroom.
              </p>
              {viewBfLinesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
                </div>
              ) : (
                <div className="rounded-lg border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                        <th className="text-left px-3 py-2 font-medium">Display No</th>
                        <th className="text-left px-3 py-2 font-medium">Product</th>
                        <th className="text-right px-3 py-2 font-medium">Quantity</th>
                        <th className="text-left px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewBfLines.map((line) => {
                        const isActiveRow = line.id === selectedStock.id;
                        return (
                          <tr
                            key={line.id}
                            style={{
                              borderBottom: '1px solid var(--border)',
                              backgroundColor: isActiveRow ? 'color-mix(in srgb, var(--muted) 55%, transparent)' : undefined,
                            }}
                          >
                            <td className="px-3 py-2 font-mono font-semibold align-middle" style={{ color: pageTheme?.secondaryColor || '#C8102E' }}>
                              {line.bfNo}
                              {isActiveRow ? (
                                <span className="ml-2 text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>(opened)</span>
                              ) : null}
                            </td>
                            <td className="px-3 py-2 align-middle">
                              {line.product?.code ? `${line.product.code} · ` : ''}
                              {line.productName || line.product?.name || '-'}
                            </td>
                            <td className="px-3 py-2 text-right align-middle font-medium">{line.quantity}</td>
                            <td className="px-3 py-2 align-middle">
                              {renderStockBfStatus(line.status)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {viewBfLines.length > 1 && (
                      <tfoot>
                        <tr style={{ borderTop: '2px solid var(--border)', backgroundColor: 'var(--background)' }}>
                          <td colSpan={2} className="px-3 py-2 text-right font-medium" style={{ color: 'var(--muted-foreground)' }}>
                            Total quantity
                          </td>
                          <td className="px-3 py-2 text-right font-semibold">
                            {viewBfLines.reduce((sum, l) => sum + Number(l.quantity), 0)}
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit User (opened line)</p>
                <p className="text-sm">{selectedStock.updatedByName || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit Date (opened line)</p>
                <p className="text-sm">{new Date(selectedStock.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved/Rejected By</p>
              <div className="text-sm">{formatApproverCell(selectedStock)}</div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Created</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {selectedStock.createdByName || '-'} · {new Date(selectedStock.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </InlineDetailPanel>
    </div>
  );
}
