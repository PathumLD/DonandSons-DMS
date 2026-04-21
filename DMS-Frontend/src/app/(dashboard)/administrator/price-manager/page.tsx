'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { DollarSign, Plus, Search, Edit, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/lib/mock-data/products';

interface PriceHistory {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  effectiveDate: string;
  changedBy: string;
  status: 'Active' | 'Scheduled' | 'Expired';
}

const mockPriceHistory: PriceHistory[] = [
  { id: 1, productId: 1, productCode: 'BR2', productName: 'Sandwich Bread Large', oldPrice: 280, newPrice: 300, changePercent: 7.14, effectiveDate: '2026-04-22', changedBy: 'admin', status: 'Scheduled' },
  { id: 2, productId: 6, productCode: 'BU12', productName: 'Fish Bun', oldPrice: 100, newPrice: 110, changePercent: 10, effectiveDate: '2026-04-21', changedBy: 'admin', status: 'Active' },
  { id: 3, productId: 9, productCode: 'PZ8', productName: 'Chicken Pizza Large', oldPrice: 1800, newPrice: 1900, changePercent: 5.56, effectiveDate: '2026-04-20', changedBy: 'admin', status: 'Active' },
];

export default function PriceManagerPage() {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>(mockPriceHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<PriceHistory | null>(null);
  
  const [formData, setFormData] = useState({
    productId: '',
    newPrice: '',
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  const filteredHistory = useMemo(() => {
    return priceHistory.filter(p => {
      const matchesSearch = 
        p.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [priceHistory, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredHistory.length / pageSize);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAdd = () => {
    const product = mockProducts.find(p => p.id === Number(formData.productId));
    if (!product) return;
    const changePercent = ((Number(formData.newPrice) - product.unitPrice) / product.unitPrice) * 100;
    const newPrice: PriceHistory = {
      id: Math.max(...priceHistory.map(p => p.id)) + 1,
      productId: Number(formData.productId),
      productCode: product.code,
      productName: product.description,
      oldPrice: product.unitPrice,
      newPrice: Number(formData.newPrice),
      changePercent: Number(changePercent.toFixed(2)),
      effectiveDate: formData.effectiveDate,
      changedBy: 'admin',
      status: new Date(formData.effectiveDate) > new Date() ? 'Scheduled' : 'Active',
    };
    setPriceHistory([newPrice, ...priceHistory]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedPrice) {
      const changePercent = ((Number(formData.newPrice) - selectedPrice.oldPrice) / selectedPrice.oldPrice) * 100;
      setPriceHistory(priceHistory.map(p =>
        p.id === selectedPrice.id
          ? { ...p, newPrice: Number(formData.newPrice), changePercent: Number(changePercent.toFixed(2)), effectiveDate: formData.effectiveDate, status: new Date(formData.effectiveDate) > new Date() ? 'Scheduled' : 'Active' }
          : p
      ));
      setShowEditModal(false);
      setSelectedPrice(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      newPrice: '',
      effectiveDate: new Date().toISOString().split('T')[0],
    });
  };

  const openEditModal = (price: PriceHistory) => {
    setSelectedPrice(price);
    setFormData({
      productId: String(price.productId),
      newPrice: String(price.newPrice),
      effectiveDate: price.effectiveDate,
    });
    setShowEditModal(true);
  };

  const columns = [
    { key: 'effectiveDate', label: 'Effective Date', render: (item: PriceHistory) => <span className="font-medium">{new Date(item.effectiveDate).toLocaleDateString()}</span> },
    { key: 'productCode', label: 'Product Code', render: (item: PriceHistory) => <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>{item.productCode}</span> },
    { key: 'productName', label: 'Product Name' },
    { key: 'oldPrice', label: 'Old Price', render: (item: PriceHistory) => <span className="text-sm" style={{ color: '#6B7280' }}>Rs. {item.oldPrice.toFixed(2)}</span> },
    { key: 'newPrice', label: 'New Price', render: (item: PriceHistory) => <span className="font-semibold" style={{ color: '#111827' }}>Rs. {item.newPrice.toFixed(2)}</span> },
    {
      key: 'changePercent',
      label: 'Change',
      render: (item: PriceHistory) => (
        <Badge variant={item.changePercent > 0 ? 'danger' : 'success'} size="sm">
          {item.changePercent > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
        </Badge>
      ),
    },
    { key: 'status', label: 'Status', render: (item: PriceHistory) => {
      switch (item.status) {
        case 'Active': return <Badge variant="success" size="sm">Active</Badge>;
        case 'Scheduled': return <Badge variant="warning" size="sm">Scheduled</Badge>;
        default: return <Badge variant="neutral" size="sm">Expired</Badge>;
      }
    }},
    { key: 'actions', label: 'Actions', render: (item: PriceHistory) => (
      item.status === 'Scheduled' && (
        <button onClick={() => openEditModal(item)} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Edit"><Edit className="w-4 h-4" /></button>
      )
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Price Manager</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Manage product pricing and price changes ({filteredHistory.length} records)</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}><Plus className="w-4 h-4 mr-2" />Update Price</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Prices', value: priceHistory.filter(p => p.status === 'Active').length, color: '#10B981' },
          { label: 'Scheduled Changes', value: priceHistory.filter(p => p.status === 'Scheduled').length, color: '#F59E0B' },
          { label: 'Avg Price Increase', value: `+${(priceHistory.reduce((acc, p) => acc + (p.changePercent > 0 ? p.changePercent : 0), 0) / priceHistory.filter(p => p.changePercent > 0).length).toFixed(2)}%`, color: '#DC2626' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: '#6B7280' }}>{stat.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>{stat.value}</p>
                </div>
                <DollarSign className="w-10 h-10" style={{ color: stat.color }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Price History</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Status' }, { value: 'Active', label: 'Active' }, { value: 'Scheduled', label: 'Scheduled' }, { value: 'Expired', label: 'Expired' }]} />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedHistory} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Update Product Price" size="md">
        <div className="space-y-4">
          <Select label="Product" value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} options={mockProducts.filter(p => p.active).map(p => ({ value: p.id, label: `${p.code} - ${p.description} (Current: Rs. ${p.unitPrice})` }))} placeholder="Select product" fullWidth required />
          <Input label="New Price (Rs.)" type="number" step="0.01" value={formData.newPrice} onChange={(e) => setFormData({ ...formData, newPrice: e.target.value })} placeholder="0.00" fullWidth required />
          <Input label="Effective Date" type="date" value={formData.effectiveDate} onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })} fullWidth required />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Update Price</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedPrice(null); resetForm(); }} title="Edit Scheduled Price" size="md">
        <div className="space-y-4">
          <Input label="New Price (Rs.)" type="number" step="0.01" value={formData.newPrice} onChange={(e) => setFormData({ ...formData, newPrice: e.target.value })} fullWidth />
          <Input label="Effective Date" type="date" value={formData.effectiveDate} onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })} fullWidth />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedPrice(null); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
