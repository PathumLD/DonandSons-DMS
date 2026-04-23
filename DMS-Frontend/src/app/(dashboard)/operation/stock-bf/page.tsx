'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Plus, Search, Edit, Eye, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockShowrooms } from '@/lib/mock-data/showrooms';
import { mockProducts } from '@/lib/mock-data/products';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { getDateBounds, isAdminUser, todayISO, addDaysISO } from '@/lib/date-restrictions';

interface StockBF {
  id: number;
  bfNo: string;
  bfDate: string;
  showroomId: number;
  showroom: string;
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  status: 'Active' | 'Adjusted';
  editUser: string;
  editDate: string;
  approvedBy?: string;
}

const mockStockBF: StockBF[] = [
  { id: 1, bfNo: 'SBF00033188', bfDate: '2026-01-09', showroomId: 1, showroom: 'YRK', productId: 1, productCode: 'BR2', productName: 'Sandwich Bread Large', quantity: 45, status: 'Active', editUser: 'Vinj', editDate: '1/10/2026 12:29:38 PM', approvedBy: 'Vinj - 1/10/2026' },
  { id: 2, bfNo: 'SBF00033187', bfDate: '2026-01-09', showroomId: 2, showroom: 'DBG', productId: 6, productCode: 'BU12', productName: 'Fish Bun', quantity: 32, status: 'Active', editUser: 'Kavindl Nilumika', editDate: '1/10/2026 9:08:52 AM', approvedBy: 'Harasa - 1/10/2026' },
  { id: 3, bfNo: 'SBF00033183', bfDate: '2026-01-09', showroomId: 3, showroom: 'KML', productId: 9, productCode: 'PZ8', productName: 'Chicken Pizza Large', quantity: 5, status: 'Active', editUser: 'Buddhini', editDate: '1/10/2026 6:18:37 AM', approvedBy: 'Harasa - 1/10/2026' },
  { id: 4, bfNo: 'SBF00033182', bfDate: '2026-01-09', showroomId: 4, showroom: 'WED', productId: 2, productCode: 'BR5', productName: 'Whole Wheat Bread', quantity: 20, status: 'Active', editUser: 'Vinj', editDate: '1/10/2026 6:16:38 AM', approvedBy: 'Vinj - 1/10/2026' },
  { id: 5, bfNo: 'SBF00033181', bfDate: '2026-01-09', showroomId: 5, showroom: 'DAL', productId: 7, productCode: 'BU15', productName: 'Chicken Bun', quantity: 15, status: 'Active', editUser: 'K.T.Navartha', editDate: '1/10/2026 10:16:36 PM', approvedBy: 'Vinj - 1/10/2026' },
  { id: 6, bfNo: 'SBF00033180', bfDate: '2026-01-09', showroomId: 6, showroom: 'WED', productId: 3, productCode: 'CK2', productName: 'Chocolate Cake', quantity: 8, status: 'Active', editUser: 'N.A.Sarath', editDate: '1/10/2026 9:08:49 AM', approvedBy: 'Vinj - 1/10/2026' },
];

export default function StockBFPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);
  const pageTheme = useThemeStore((s) => s.getPageTheme('stock-bf'));
  const dateBounds = getDateBounds('back-3-no-future', user as any, {
    allowBackDatePermission: 'operation.stock-bf.allow-back-future',
    allowFutureDatePermission: 'operation.stock-bf.allow-back-future',
  });

  const [stockBFs, setStockBFs] = useState<StockBF[]>(mockStockBF);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockBF | null>(null);
  const [showPreviousRecords, setShowPreviousRecords] = useState(false);
  
  const [formData, setFormData] = useState({
    bfDate: todayISO(),
    showroomId: '',
    productId: '',
    quantity: '',
  });

  const filteredStockBFs = useMemo(() => {
    const minDate = dateBounds.min || addDaysISO(-3);
    return stockBFs.filter(s => {
      const matchesSearch =
        s.bfNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.showroom.toLowerCase().includes(searchTerm.toLowerCase());
      // 4.iv Stock BF: Admin sees all. Other users see only their records within date range,
      // unless "Show Previous Records" is enabled.
      const matchesRole =
        isAdmin ||
        (s.editUser === user?.email && (showPreviousRecords || s.bfDate >= minDate));
      return matchesSearch && matchesRole;
    });
  }, [stockBFs, searchTerm, isAdmin, user, showPreviousRecords, dateBounds]);

  const totalPages = Math.ceil(filteredStockBFs.length / pageSize);
  const paginatedStockBFs = filteredStockBFs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAdd = () => {
    const product = mockProducts.find(p => p.id === Number(formData.productId));
    const showroom = mockShowrooms.find(s => s.id === Number(formData.showroomId));
    const newStock: StockBF = {
      id: Math.max(...stockBFs.map(s => s.id)) + 1,
      bfNo: `BF-2026-${String(stockBFs.length + 1).padStart(3, '0')}`,
      bfDate: formData.bfDate,
      showroomId: Number(formData.showroomId),
      showroom: showroom?.name || '',
      productId: Number(formData.productId),
      productCode: product?.code || '',
      productName: product?.description || '',
      quantity: Number(formData.quantity),
      status: 'Active',
      editUser: 'admin',
      editDate: new Date().toLocaleString(),
    };
    setStockBFs([newStock, ...stockBFs]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedStock) {
      setStockBFs(stockBFs.map(s =>
        s.id === selectedStock.id
          ? { ...s, quantity: Number(formData.quantity), editDate: new Date().toLocaleString() }
          : s
      ));
      setShowEditModal(false);
      setSelectedStock(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      bfDate: todayISO(),
      showroomId: '',
      productId: '',
      quantity: '',
    });
  };

  const openEditModal = (stock: StockBF) => {
    setSelectedStock(stock);
    setFormData({
      bfDate: stock.bfDate,
      showroomId: String(stock.showroomId),
      productId: String(stock.productId),
      quantity: String(stock.quantity),
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'bfDate',
      label: 'Date',
      render: (item: StockBF) => <span className="font-medium">{new Date(item.bfDate).toLocaleDateString()}</span>,
    },
    {
      key: 'bfNo',
      label: 'Display No',
      render: (item: StockBF) => <span className="font-mono font-semibold" style={{ color: pageTheme?.secondaryColor || '#7C3AED' }}>{item.bfNo}</span>,
    },
    {
      key: 'showroom',
      label: 'ShowRoom',
      render: (item: StockBF) => <span className="font-medium">{item.showroom}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: StockBF) => (
        item.status === 'Active' ? 
          <Badge variant="success" size="sm">Approved</Badge> : 
          <Badge variant="neutral" size="sm">Adjusted</Badge>
      ),
    },
    {
      key: 'editUser',
      label: 'Edit User',
      render: (item: StockBF) => <span className="text-sm">{item.editUser}</span>,
    },
    {
      key: 'editDate',
      label: 'Edit Date',
      render: (item: StockBF) => (
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.editDate}</span>
      ),
    },
    {
      key: 'approvedBy',
      label: 'Approved/Rejected By',
      render: (item: StockBF) => (
        <span className="text-sm">{item.approvedBy || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: StockBF) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setSelectedStock(item); setShowViewModal(true); }}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status === 'Active' && (
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
          )}
        </div>
      ),
    },
  ];

  const renderForm = () => (
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
        options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
        placeholder="Select showroom"
        fullWidth
        required
      />
      <Select
        label="Product"
        value={formData.productId}
        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
        options={mockProducts.filter(p => p.active).map(p => ({ value: p.id, label: `${p.code} - ${p.description}` }))}
        placeholder="Select product"
        fullWidth
        required
      />
      <Input
        label="Quantity"
        type="number"
        value={formData.quantity}
        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
        placeholder="0"
        fullWidth
        required
      />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Stock Brought Forward (BF)</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage opening stock brought forward ({filteredStockBFs.length} records)
          </p>
          <div className="mt-2">
            <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
              <Info className="w-3 h-3 mr-1" />
              {isAdmin
                ? 'Admin: All records visible. Any date allowed.'
                : 'You see your own Stock BF records. Back date up to 3 days, no future date.'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!isAdmin && (
            <Button
              variant={showPreviousRecords ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setShowPreviousRecords(!showPreviousRecords)}
            >
              {showPreviousRecords ? 'Hide Previous Records' : 'Show Previous Records'}
            </Button>
          )}
          <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />Add New
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Stock BF List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search stock BF..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid var(--input)' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={paginatedStockBFs}
            columns={columns}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Stock BF" size="lg">
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Stock BF</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedStock(null); resetForm(); }} title="Edit Stock BF" size="lg">
        {renderForm()}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedStock(null); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedStock(null); }} title="Stock BF Details" size="md">
        {selectedStock && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Display No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedStock.bfNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selectedStock.bfDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedStock.showroom}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Product</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedStock.productCode} - {selectedStock.productName}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Quantity</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedStock.quantity}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
              {selectedStock.status === 'Active' ? 
                <Badge variant="success" size="sm">Approved</Badge> : 
                <Badge variant="neutral" size="sm">Adjusted</Badge>
              }
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit User</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedStock.editUser}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedStock.editDate}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Approved/Rejected By</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedStock.approvedBy || '-'}</p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedStock(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
