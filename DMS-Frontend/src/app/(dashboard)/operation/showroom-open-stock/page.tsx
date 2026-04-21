'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Store, Plus, Search, Edit, Save } from 'lucide-react';
import { mockShowrooms } from '@/lib/mock-data/showrooms';
import { mockProducts } from '@/lib/mock-data/products';

interface ShowroomOpenStock {
  id: number;
  showroomId: number;
  showroom: string;
  productId: number;
  productCode: string;
  productName: string;
  openingStock: number;
  lastUpdated: string;
}

const mockOpenStock: ShowroomOpenStock[] = [
  { id: 1, showroomId: 1, showroom: 'Dalmeny', productId: 1, productCode: 'BR2', productName: 'Sandwich Bread Large', openingStock: 50, lastUpdated: '2026-04-21 06:00' },
  { id: 2, showroomId: 1, showroom: 'Dalmeny', productId: 6, productCode: 'BU12', productName: 'Fish Bun', openingStock: 40, lastUpdated: '2026-04-21 06:00' },
  { id: 3, showroomId: 2, showroom: 'Ragama', productId: 1, productCode: 'BR2', productName: 'Sandwich Bread Large', openingStock: 45, lastUpdated: '2026-04-21 06:15' },
];

export default function ShowroomOpenStockPage() {
  const [openStocks, setOpenStocks] = useState<ShowroomOpenStock[]>(mockOpenStock);
  const [searchTerm, setSearchTerm] = useState('');
  const [showroomFilter, setShowroomFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<ShowroomOpenStock | null>(null);
  
  const [formData, setFormData] = useState({
    showroomId: '',
    productId: '',
    openingStock: '',
  });

  const filteredStocks = useMemo(() => {
    return openStocks.filter(s => {
      const matchesSearch = 
        s.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesShowroom = !showroomFilter || String(s.showroomId) === showroomFilter;
      return matchesSearch && matchesShowroom;
    });
  }, [openStocks, searchTerm, showroomFilter]);

  const totalPages = Math.ceil(filteredStocks.length / pageSize);
  const paginatedStocks = filteredStocks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAdd = () => {
    const product = mockProducts.find(p => p.id === Number(formData.productId));
    const showroom = mockShowrooms.find(s => s.id === Number(formData.showroomId));
    const newStock: ShowroomOpenStock = {
      id: Math.max(...openStocks.map(s => s.id)) + 1,
      showroomId: Number(formData.showroomId),
      showroom: showroom?.name || '',
      productId: Number(formData.productId),
      productCode: product?.code || '',
      productName: product?.description || '',
      openingStock: Number(formData.openingStock),
      lastUpdated: new Date().toLocaleString(),
    };
    setOpenStocks([newStock, ...openStocks]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedStock) {
      setOpenStocks(openStocks.map(s =>
        s.id === selectedStock.id
          ? { ...s, openingStock: Number(formData.openingStock), lastUpdated: new Date().toLocaleString() }
          : s
      ));
      setShowEditModal(false);
      setSelectedStock(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({ showroomId: '', productId: '', openingStock: '' });
  };

  const openEditModal = (stock: ShowroomOpenStock) => {
    setSelectedStock(stock);
    setFormData({
      showroomId: String(stock.showroomId),
      productId: String(stock.productId),
      openingStock: String(stock.openingStock),
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'showroom',
      label: 'Showroom',
      render: (item: ShowroomOpenStock) => <span className="font-medium">{item.showroom}</span>,
    },
    {
      key: 'productCode',
      label: 'Product Code',
      render: (item: ShowroomOpenStock) => <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>{item.productCode}</span>,
    },
    {
      key: 'productName',
      label: 'Product Name',
    },
    {
      key: 'openingStock',
      label: 'Opening Stock',
      render: (item: ShowroomOpenStock) => <span className="font-semibold text-lg">{item.openingStock}</span>,
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      render: (item: ShowroomOpenStock) => <span className="text-sm" style={{ color: '#6B7280' }}>{item.lastUpdated}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: ShowroomOpenStock) => (
        <button onClick={() => openEditModal(item)} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Edit">
          <Edit className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Showroom Opening Stock</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Manage daily opening stock for showrooms ({filteredStocks.length} entries)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Opening Stock
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Opening Stock List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={showroomFilter} onChange={(e) => { setShowroomFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Showrooms' }, ...mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: s.name }))]} />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedStocks} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Opening Stock" size="md">
        <div className="space-y-4">
          <Select label="Showroom" value={formData.showroomId} onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })} options={mockShowrooms.filter(s => s.active).map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))} placeholder="Select showroom" fullWidth required />
          <Select label="Product" value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} options={mockProducts.filter(p => p.active && p.requireOpenStock).map(p => ({ value: p.id, label: `${p.code} - ${p.description}` }))} placeholder="Select product" fullWidth required />
          <Input label="Opening Stock Quantity" type="number" value={formData.openingStock} onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })} placeholder="0" fullWidth required />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Stock</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedStock(null); resetForm(); }} title="Edit Opening Stock" size="md">
        <div className="space-y-4">
          <Input label="Opening Stock Quantity" type="number" value={formData.openingStock} onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })} fullWidth required />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedStock(null); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
