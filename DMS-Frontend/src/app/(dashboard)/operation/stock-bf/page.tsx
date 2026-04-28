'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Search, Edit, Eye, Info, Loader2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { stockBfApi, type StockBF } from '@/lib/api/stock-bf';
import { outletsApi, type Outlet } from '@/lib/api/outlets';
import { productsApi, type Product } from '@/lib/api/products';
import ItemManagementTable, { type ItemManagementItem } from '@/components/operation/ItemManagementTable';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function StockBFPage() {
  const user = useAuthStore((s) => s.user);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canApproveBf = hasPermission('operation:stock-bf:approve');
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('stock-bf'));
  const dateBounds = getDateBounds('back-3-no-future', user as any, {
    allowBackDatePermission: 'operation.stock-bf.allow-back-future',
    allowFutureDatePermission: 'operation.stock-bf.allow-back-future',
  });

  const [stockBFs, setStockBFs] = useState<StockBF[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockBF | null>(null);
  /** Same BF date + showroom as selected row — one Stock BF record per product */
  const [viewBfLines, setViewBfLines] = useState<StockBF[]>([]);
  const [viewBfLinesLoading, setViewBfLinesLoading] = useState(false);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  
  const [formData, setFormData] = useState({
    bfDate: todayISO(),
    showroomId: '',
    productId: '', // Used only for edit mode
    quantity: '', // Used only for edit mode
  });

  const [stockBfItems, setStockBfItems] = useState<ItemManagementItem[]>([]);

  const isFormValid = () => {
    // For add mode: require items
    // For edit mode: require single product and quantity
    if (showAddModal) {
      return formData.bfDate && formData.showroomId && stockBfItems.length > 0;
    }
    return formData.bfDate && formData.showroomId && formData.productId && formData.quantity;
  };

  useEffect(() => {
    fetchOutlets();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchStockBFs();
  }, [currentPage, pageSize, showPreviousRecords, isAdmin]);

  const fetchOutlets = async () => {
    try {
      const response = await outletsApi.getAll();
      setOutlets(response.outlets.filter(o => o.isActive));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load outlets');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll(1, 1000);
      setProducts((response.products || []).filter((p) => p.isActive));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load products');
    }
  };

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

  const handleAdd = async () => {
    if (!formData.showroomId) {
      toast.error('Please select a showroom');
      return;
    }

    if (stockBfItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    try {
      setIsSubmitting(true);
      await stockBfApi.createBulk({
        bfDate: formData.bfDate,
        outletId: formData.showroomId,
        items: stockBfItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      toast.success(`${stockBfItems.length} Stock BF record(s) created — pending approval`);
      setShowAddModal(false);
      resetForm();
      fetchStockBFs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create stock BF');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedStock) return;
    
    try {
      setIsSubmitting(true);
      await stockBfApi.update(selectedStock.id, {
        bfDate: formData.bfDate,
        outletId: formData.showroomId,
        productId: formData.productId,
        quantity: Number(formData.quantity),
      });
      toast.success('Stock BF updated successfully');
      setShowEditModal(false);
      setSelectedStock(null);
      resetForm();
      fetchStockBFs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update stock BF');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const resetForm = () => {
    setFormData({
      bfDate: todayISO(),
      showroomId: '',
      productId: '',
      quantity: '',
    });
    setStockBfItems([]);
  };

  const openEditModal = (stock: StockBF) => {
    setSelectedStock(stock);
    setFormData({
      bfDate: stock.bfDate,
      showroomId: stock.outletId,
      productId: stock.productId,
      quantity: String(stock.quantity),
    });
    setShowEditModal(true);
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
    try {
      const full = await stockBfApi.getById(item.id);
      setSelectedStock(full);
      setShowViewModal(true);
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

  const closeViewModal = () => {
    setShowViewModal(false);
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
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status === 'Pending' && (
            <button
              type="button"
              onClick={() => openEditModal(item)}
              className="p-1.5 rounded transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canApproveBf && item.status === 'Pending' && (
            <>
              <button
                type="button"
                onClick={() => handleApproveBf(item.id)}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#10B981' }}
                title="Approve"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleRejectBf(item.id)}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#DC2626' }}
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {item.status === 'Pending' && (
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
          <Button variant="primary" size="md" onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
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

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Stock BF"
        size="xl"
      >
        <div className="space-y-4">
          <Input
            label="BF Date"
            type="date"
            value={formData.bfDate}
            onChange={(e) => setFormData({ ...formData, bfDate: e.target.value })}
            min={dateBounds.min}
            max={dateBounds.max}
            helperText={dateBounds.helperText}
            fullWidth
            required
          />
          <Select
            label="Showroom"
            value={formData.showroomId}
            onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}
            options={outlets.map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
            placeholder="Select showroom"
            fullWidth
            required
          />

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Products</h3>
            <ItemManagementTable
              products={products.map(p => ({ id: p.id, code: p.code, name: p.name }))}
              items={stockBfItems}
              onItemsChange={setStockBfItems}
              showUnitPrice={false}
              showReason={false}
              showTotal={true}
              primaryColor={pageTheme?.primaryColor}
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowAddModal(false);
            resetForm();
          }}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd} disabled={isSubmitting || !isFormValid()}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Creating...' : `Create Stock BF (${stockBfItems.length} products)`}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStock(null);
          resetForm();
        }}
        title="Edit Stock BF"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="BF Date"
            type="date"
            value={formData.bfDate}
            onChange={(e) => setFormData({ ...formData, bfDate: e.target.value })}
            min={dateBounds.min}
            max={dateBounds.max}
            fullWidth
            required
          />
          <Select
            label="Showroom"
            value={formData.showroomId}
            onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}
            options={outlets.map(o => ({ value: o.id, label: `${o.code} - ${o.name}` }))}
            fullWidth
            required
          />
          <Select
            label="Product"
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            options={products.map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
            fullWidth
            required
          />
          <Input
            label="Quantity"
            type="number"
            min="0"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            fullWidth
            required
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowEditModal(false);
            setSelectedStock(null);
            resetForm();
          }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Stock BF Details"
        size="xl"
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
        <ModalFooter>
          <Button variant="ghost" onClick={closeViewModal}>Close</Button>
          {selectedStock?.status === 'Pending' && (
            <Button
              variant="primary"
              onClick={() => {
                const s = selectedStock;
                closeViewModal();
                if (s) openEditModal(s);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
