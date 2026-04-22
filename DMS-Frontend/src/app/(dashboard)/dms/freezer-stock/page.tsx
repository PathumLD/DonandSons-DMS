'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Snowflake, Plus, Search, Edit, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockFreezerStock, productionSections, type FreezerStock } from '@/lib/mock-data/dms-production';
import { mockOrderProducts } from '@/lib/mock-data/dms-orders';

export default function FreezerStockPage() {
  const [stockItems, setStockItems] = useState<FreezerStock[]>(mockFreezerStock);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<FreezerStock | null>(null);
  
  const [formData, setFormData] = useState({
    stockDate: new Date().toISOString().split('T')[0],
    productId: '',
    section: '',
    quantity: '',
    notes: '',
  });

  const filteredStock = useMemo(() => {
    return stockItems.filter(s => {
      const matchesSearch = 
        s.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSection = !sectionFilter || s.section === sectionFilter;
      return matchesSearch && matchesSection;
    });
  }, [stockItems, searchTerm, sectionFilter]);

  const totalPages = Math.ceil(filteredStock.length / pageSize);
  const paginatedStock = filteredStock.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAdd = () => {
    const product = mockOrderProducts.find(p => p.id === Number(formData.productId));
    if (!product) return;
    
    const newStock: FreezerStock = {
      id: Math.max(...stockItems.map(s => s.id)) + 1,
      productId: Number(formData.productId),
      productCode: product.code,
      productName: product.name,
      section: formData.section as any,
      quantity: Number(formData.quantity),
      stockDate: formData.stockDate,
      notes: formData.notes || undefined,
      lastUpdated: new Date().toLocaleString(),
    };
    setStockItems([newStock, ...stockItems]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedStock) {
      setStockItems(stockItems.map(s =>
        s.id === selectedStock.id
          ? { ...s, quantity: Number(formData.quantity), notes: formData.notes || undefined, lastUpdated: new Date().toLocaleString() }
          : s
      ));
      setShowEditModal(false);
      setSelectedStock(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      stockDate: new Date().toISOString().split('T')[0],
      productId: '',
      section: '',
      quantity: '',
      notes: '',
    });
  };

  const openEditModal = (stock: FreezerStock) => {
    setSelectedStock(stock);
    setFormData({
      stockDate: stock.stockDate,
      productId: String(stock.productId),
      section: stock.section || '',
      quantity: String(stock.quantity),
      notes: stock.notes || '',
    });
    setShowEditModal(true);
  };

  const columns = [
    { key: 'stockDate', label: 'Stock Date', render: (item: FreezerStock) => <span className="font-medium">{new Date(item.stockDate).toLocaleDateString()}</span> },
    { key: 'product', label: 'Product', render: (item: FreezerStock) => <span className="font-medium">{item.productCode} - {item.productName}</span> },
    { key: 'section', label: 'Section', render: (item: FreezerStock) => item.section ? <Badge variant="primary" size="sm">{item.section}</Badge> : <span className="text-xs" style={{ color: '#9CA3AF' }}>General</span> },
    { key: 'quantity', label: 'Quantity', render: (item: FreezerStock) => <span className="text-lg font-bold" style={{ color: item.quantity < 10 ? '#DC2626' : '#10B981' }}>{item.quantity}</span> },
    { key: 'lastUpdated', label: 'Last Updated', render: (item: FreezerStock) => <span className="text-sm" style={{ color: '#6B7280' }}>{item.lastUpdated}</span> },
    {
      key: 'actions', label: 'Actions', render: (item: FreezerStock) => (
        <button onClick={() => openEditModal(item)} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Edit"><Edit className="w-4 h-4" /></button>
      )
    },
  ];

  const lowStockItems = stockItems.filter(s => s.quantity < 10);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Freezer Stock Management</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Track freezer stock levels for production planning ({filteredStock.length} items)</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="md"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}><Plus className="w-4 h-4 mr-2" />Add Stock</Button>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#991B1B' }}>⚠ Low Stock Alert ({lowStockItems.length} items)</p>
          <ul className="text-sm space-y-1" style={{ color: '#991B1B' }}>
            {lowStockItems.map(item => (
              <li key={item.id}>• {item.productCode} - {item.productName}: <strong>{item.quantity} units</strong></li>
            ))}
          </ul>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Freezer Stock List</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={sectionFilter} onChange={(e) => { setSectionFilter(e.target.value); setCurrentPage(1); }} options={[{ value: '', label: 'All Sections' }, ...productionSections.map(s => ({ value: s, label: s }))]} />
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input type="text" placeholder="Search stock..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedStock} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Freezer Stock" size="md">
        <div className="space-y-4">
          <Input label="Stock Date" type="date" value={formData.stockDate} onChange={(e) => setFormData({ ...formData, stockDate: e.target.value })} fullWidth required />
          <Select label="Product" value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} options={mockOrderProducts.filter(p => p.isIncluded).map(p => ({ value: p.id, label: `${p.code} - ${p.name}` }))} placeholder="Select product" fullWidth required />
          <Select label="Section (Optional)" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} options={[{ value: '', label: 'General Stock' }, ...productionSections.map(s => ({ value: s, label: s }))]} fullWidth />
          <Input label="Quantity" type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" fullWidth required />
          <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes..." fullWidth />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Stock</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedStock(null); resetForm(); }} title="Edit Freezer Stock" size="md">
        <div className="space-y-4">
          <Input label="Quantity" type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} fullWidth />
          <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} fullWidth />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedStock(null); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}>
        <div className="flex items-start space-x-3">
          <Snowflake className="w-5 h-5 mt-0.5" style={{ color: '#166534' }} />
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: '#166534' }}>Freezer Stock Integration:</p>
            <ul className="text-sm space-y-1" style={{ color: '#166534' }}>
              <li>• Freezer stock values appear in the <strong>BAL column</strong> of the Order Entry Grid</li>
              <li>• When "Use Freezer Stock" is enabled in Delivery Summary, available balance is calculated</li>
              <li>• Available Balance = Grand Total - Freezer Stock</li>
              <li>• Low stock alerts (< 10 units) appear at the top of this page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
