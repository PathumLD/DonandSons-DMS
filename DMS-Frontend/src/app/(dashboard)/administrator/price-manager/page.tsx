'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { DollarSign, Plus, Search, Edit, Eye } from 'lucide-react';

interface PriceChange {
  id: number;
  effectedFrom: string;
  effectedTo: string;
  comment: string;
  user: string;
  editDate: string;
}

const mockPriceChanges: PriceChange[] = [
  { id: 1, effectedFrom: '2021-02-01', effectedTo: 'Up to Date', comment: 'Changed in Product Master', user: 'Dulan', editDate: '2021-02-11 19:32:16' },
  { id: 2, effectedFrom: '2021-02-15', effectedTo: 'Up to Date', comment: 'Changed in Product Master', user: 'Dulan', editDate: '2021-02-15 23:36:28' },
  { id: 3, effectedFrom: '2021-02-15', effectedTo: 'Up to Date', comment: 'Changed in Product Master', user: 'Dulan', editDate: '2021-02-15 23:32:28' },
  { id: 4, effectedFrom: '2021-02-15', effectedTo: 'Up to Date', comment: 'Changed in Product Master', user: 'Dulan', editDate: '2021-02-20 17:45:52' },
  { id: 5, effectedFrom: '2021-02-15', effectedTo: 'Up to Date', comment: 'Changed in Product Master', user: 'Dulan', editDate: '2021-02-20 17:45:02' },
  { id: 6, effectedFrom: '2021-02-19', effectedTo: 'Up to Date', comment: 'Changed in Product Master', user: 'Dulan', editDate: '2021-02-20 17:47:05' },
  { id: 7, effectedFrom: '2021-02-15', effectedTo: 'Up to Date', comment: 'Changed in Product Master', user: 'Dulan', editDate: '2021-02-20 17:48:14' },
  { id: 8, effectedFrom: '2021-02-16', effectedTo: 'Up to Date', comment: 'Changed in Product Master', user: 'Dulan', editDate: '2021-02-20 17:48:17' },
  { id: 9, effectedFrom: '2021-02-15', effectedTo: 'Up to Date', comment: 'Changed in Product Master', user: 'Dulan', editDate: '2021-02-20 19:38:37' },
  { id: 10, effectedFrom: '2021-02-15', effectedTo: 'Up to Date', comment: 'Changed in Product Master', user: 'Dulan', editDate: '2021-02-20 23:50:16' },
];

export default function PriceManagerPage() {
  const [priceChanges, setPriceChanges] = useState<PriceChange[]>(mockPriceChanges);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedChange, setSelectedChange] = useState<PriceChange | null>(null);
  
  const [formData, setFormData] = useState({
    effectedFrom: new Date().toISOString().split('T')[0],
    comment: 'Changed in Product Master',
  });

  const filteredChanges = useMemo(() => {
    return priceChanges.filter(p => {
      const matchesSearch = 
        p.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [priceChanges, searchTerm]);

  const totalPages = Math.ceil(filteredChanges.length / pageSize);
  const paginatedChanges = filteredChanges.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAdd = () => {
    const newChange: PriceChange = {
      id: Math.max(...priceChanges.map(p => p.id), 0) + 1,
      effectedFrom: formData.effectedFrom,
      effectedTo: 'Up to Date',
      comment: formData.comment,
      user: 'Dulan',
      editDate: new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }).replace(',', ''),
    };
    setPriceChanges([newChange, ...priceChanges]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedChange) {
      setPriceChanges(priceChanges.map(p =>
        p.id === selectedChange.id
          ? { 
              ...p, 
              effectedFrom: formData.effectedFrom, 
              comment: formData.comment,
              editDate: new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
              }).replace(',', '')
            }
          : p
      ));
      setShowEditModal(false);
      setSelectedChange(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      effectedFrom: new Date().toISOString().split('T')[0],
      comment: 'Changed in Product Master',
    });
  };

  const openEditModal = (change: PriceChange) => {
    setSelectedChange(change);
    setFormData({
      effectedFrom: change.effectedFrom,
      comment: change.comment,
    });
    setShowEditModal(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(',', '');
  };

  const columns = [
    { 
      key: 'effectedFrom', 
      label: 'Effected From', 
      render: (item: PriceChange) => <span style={{ color: 'var(--muted-foreground)' }}>{formatDate(item.effectedFrom)}</span> 
    },
    { 
      key: 'effectedTo', 
      label: 'Effected To', 
      render: (item: PriceChange) => <span style={{ color: 'var(--muted-foreground)' }}>{item.effectedTo}</span> 
    },
    { 
      key: 'comment', 
      label: 'Comment', 
      render: (item: PriceChange) => <span style={{ color: 'var(--muted-foreground)' }}>{item.comment}</span> 
    },
    { 
      key: 'user', 
      label: 'User', 
      render: (item: PriceChange) => <span style={{ color: 'var(--muted-foreground)' }}>{item.user}</span> 
    },
    { 
      key: 'editDate', 
      label: 'Edit Date', 
      render: (item: PriceChange) => <span style={{ color: 'var(--muted-foreground)' }}>{item.editDate}</span> 
    },
    { 
      key: 'actions', 
      label: '', 
      render: (item: PriceChange) => (
        <div className="flex items-center justify-end space-x-2">
          <button 
            onClick={() => { setSelectedChange(item); setShowViewModal(true); }} 
            className="p-1.5 rounded-full transition-colors" 
            style={{ color: '#3B82F6', backgroundColor: '#EFF6FF' }} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'} 
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'} 
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => openEditModal(item)} 
            className="p-1.5 rounded-full transition-colors" 
            style={{ color: '#3B82F6', backgroundColor: '#EFF6FF' }} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'} 
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'} 
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            <DollarSign className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Price Manager
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            List pricing
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Showing 1 to 10 of {filteredChanges.length} entries
              </span>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input 
                type="text" 
                placeholder="Search..." 
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
            data={paginatedChanges} 
            columns={columns} 
            currentPage={currentPage} 
            totalPages={totalPages} 
            pageSize={pageSize} 
            onPageChange={setCurrentPage} 
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} 
          />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Price Change" size="md">
        <div className="space-y-4">
          <Input 
            label="Effected From (Date)" 
            type="date" 
            value={formData.effectedFrom} 
            onChange={(e) => setFormData({ ...formData, effectedFrom: e.target.value })} 
            helperText="Select future date for price changes to automatically take effect"
            fullWidth 
            required 
          />
          <Input 
            label="Comment" 
            value={formData.comment} 
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })} 
            placeholder="Changed in Product Master" 
            fullWidth 
            required 
          />
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <p className="text-xs" style={{ color: '#1E40AF' }}>
              <strong>Note:</strong> Prices will be automatically updated in the system starting from the selected date.
            </p>
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add Price Change</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedChange(null); resetForm(); }} title="Edit Price Change" size="md">
        <div className="space-y-4">
          <Input 
            label="Effected From (Date)" 
            type="date" 
            value={formData.effectedFrom} 
            onChange={(e) => setFormData({ ...formData, effectedFrom: e.target.value })} 
            fullWidth 
          />
          <Input 
            label="Comment" 
            value={formData.comment} 
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })} 
            fullWidth 
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditModal(false); setSelectedChange(null); resetForm(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedChange(null); }} title="Price Change Details" size="md">
        {selectedChange && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Effected From</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{formatDate(selectedChange.effectedFrom)}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Effected To</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedChange.effectedTo}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Comment</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedChange.comment}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>User</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedChange.user}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Edit Date</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedChange.editDate}</p>
              </div>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedChange(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
