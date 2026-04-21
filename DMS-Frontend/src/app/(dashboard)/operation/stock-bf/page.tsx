'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Package, Plus, Search, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockShowrooms } from '@/lib/mock-data/showrooms';
import { mockProducts } from '@/lib/mock-data/products';

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
}

const mockStockBF: StockBF[] = [
  { id: 1, bfNo: 'BF-2026-001', bfDate: '2026-04-21', showroomId: 1, showroom: 'Dalmeny', productId: 1, productCode: 'BR2', productName: 'Sandwich Bread Large', quantity: 45, status: 'Active', editUser: 'admin', editDate: '2026-04-21 06:00' },
  { id: 2, bfNo: 'BF-2026-002', bfDate: '2026-04-21', showroomId: 2, showroom: 'Ragama', productId: 6, productCode: 'BU12', productName: 'Fish Bun', quantity: 32, status: 'Active', editUser: 'admin', editDate: '2026-04-21 06:15' },
  { id: 3, bfNo: 'BF-2026-003', bfDate: '2026-04-20', showroomId: 1, showroom: 'Dalmeny', productId: 9, productCode: 'PZ8', productName: 'Chicken Pizza Large', quantity: 5, status: 'Adjusted', editUser: 'admin', editDate: '2026-04-20 06:00' },
];

export default function StockBFPage() {
  const [stockBFs, setStockBFs] = useState<StockBF[]>(mockStockBF);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockBF | null>(null);
  
  const [formData, setFormData] = useState({
    bfDate: new Date().toISOString().split('T')[0],
    showroomId: '',
    productId: '',
    quantity: '',
  });

  const filteredStockBFs = useMemo(() => {
    return stockBFs.filter(s =>
      s.bfNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.showroom.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stockBFs, searchTerm]);

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
      bfDate: new Date().toISOString().split('T')[0],
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
      label: 'BF Date',
      render: (item: StockBF) => <span className="font-medium">{new Date(item.bfDate).toLocaleDateString()}</span>,
    },
    {
      key: 'bfNo',
      label: 'BF No',
      render: (item: StockBF) => <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>{item.bfNo}</span>,
    },
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: StockBF) => <span className="font-medium">{item.showroom}</span>,
    },
    {
      key: 'productCode',
      label: 'Product Code',
      render: (item: StockBF) => <span className="font-mono">{item.productCode}</span>,
    },
    {
      key: 'productName',
      label: 'Product Name',
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (item: StockBF) => <span className="font-semibold">{item.quantity}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: StockBF) => (
        item.status === 'Active' ? 
          <Badge variant="success" size="sm">Active</Badge> : 
          <Badge variant="neutral" size="sm">Adjusted</Badge>
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
            style={{ color: '#6B7280' }}
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
              style={{ color: '#6B7280' }}
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
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Stock Brought Forward (BF)</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Manage opening stock brought forward ({filteredStockBFs.length} records)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Stock BF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Stock BF List</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search stock BF..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid #D1D5DB' }}
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
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>BF No</p>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedStock.bfNo}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>BF Date</p>
                <p className="text-sm" style={{ color: '#111827' }}>{new Date(selectedStock.bfDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Showroom</p>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedStock.showroom}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Product</p>
              <p className="text-sm" style={{ color: '#111827' }}>{selectedStock.productCode} - {selectedStock.productName}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Quantity</p>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedStock.quantity}</p>
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
