'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { CheckCircle, XCircle, Search, Eye, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ApprovalItem {
  id: number;
  type: 'Delivery' | 'Disposal' | 'Transfer' | 'Stock Adjustment' | 'Production';
  referenceNo: string;
  requestedBy: string;
  requestDate: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

const mockApprovals: ApprovalItem[] = [
  { id: 1, type: 'Delivery', referenceNo: 'DN-2026-003', requestedBy: 'operator1', requestDate: '2026-04-21 09:00', description: '42 items delivery to Ranala', priority: 'High' },
  { id: 2, type: 'Disposal', referenceNo: 'DS-2026-002', requestedBy: 'cashier1', requestDate: '2026-04-21 07:15', description: '12 items disposal from Ragama', priority: 'Medium' },
  { id: 3, type: 'Transfer', referenceNo: 'TR-2026-002', requestedBy: 'operator1', requestDate: '2026-04-21 10:30', description: 'Transfer from Ranala to Dehiwala', priority: 'Medium' },
  { id: 4, type: 'Stock Adjustment', referenceNo: 'ADJ-2026-002', requestedBy: 'inventory_clerk', requestDate: '2026-04-21 08:45', description: 'Stock increase for BU15 - 10 units', priority: 'Low' },
];

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(mockApprovals);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);

  const filteredApprovals = approvals.filter(a => {
    const matchesSearch = a.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) || a.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredApprovals.length / pageSize);
  const paginatedApprovals = filteredApprovals.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleApprove = (id: number) => {
    setApprovals(approvals.filter(a => a.id !== id));
    alert('Item approved successfully!');
  };

  const handleReject = (id: number) => {
    setApprovals(approvals.filter(a => a.id !== id));
    alert('Item rejected successfully!');
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High': return <Badge variant="danger" size="sm">High</Badge>;
      case 'Low': return <Badge variant="neutral" size="sm">Low</Badge>;
      default: return <Badge variant="warning" size="sm">Medium</Badge>;
    }
  };

  const columns = [
    { key: 'requestDate', label: 'Request Date', render: (item: ApprovalItem) => <span className="font-medium">{new Date(item.requestDate).toLocaleString()}</span> },
    { key: 'type', label: 'Type', render: (item: ApprovalItem) => <Badge variant="primary" size="sm">{item.type}</Badge> },
    { key: 'referenceNo', label: 'Reference No', render: (item: ApprovalItem) => <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>{item.referenceNo}</span> },
    { key: 'description', label: 'Description' },
    { key: 'requestedBy', label: 'Requested By' },
    { key: 'priority', label: 'Priority', render: (item: ApprovalItem) => getPriorityBadge(item.priority) },
    {
      key: 'actions', label: 'Actions', render: (item: ApprovalItem) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => { setSelectedApproval(item); setShowViewModal(true); }} className="p-1.5 rounded transition-colors" style={{ color: '#6B7280' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="View"><Eye className="w-4 h-4" /></button>
          <button onClick={() => handleApprove(item.id)} className="p-1.5 rounded transition-colors" style={{ color: '#10B981' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDF4'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Approve"><CheckCircle className="w-4 h-4" /></button>
          <button onClick={() => handleReject(item.id)} className="p-1.5 rounded transition-colors" style={{ color: '#DC2626' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} title="Reject"><XCircle className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Approval Queue</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>Review and approve pending requests ({filteredApprovals.length} items)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Pending', value: approvals.length, color: '#F59E0B', icon: Clock },
          { label: 'High Priority', value: approvals.filter(a => a.priority === 'High').length, color: '#DC2626', icon: AlertTriangle },
          { label: 'Deliveries', value: approvals.filter(a => a.type === 'Delivery').length, color: '#10B981', icon: CheckCircle },
          { label: 'Today', value: approvals.filter(a => a.requestDate.startsWith(new Date().toISOString().split('T')[0])).length, color: '#3B82F6', icon: Clock },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: '#6B7280' }}>{stat.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Pending Approvals</CardTitle>
            <div className="flex items-center space-x-3">
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }}>
                <option value="">All Types</option>
                <option value="Delivery">Delivery</option>
                <option value="Disposal">Disposal</option>
                <option value="Transfer">Transfer</option>
                <option value="Stock Adjustment">Stock Adjustment</option>
              </select>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                <input type="text" placeholder="Search approvals..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" style={{ border: '1px solid #D1D5DB' }} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={paginatedApprovals} columns={columns} currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
        </CardContent>
      </Card>

      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedApproval(null); }} title="Approval Details" size="md">
        {selectedApproval && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Type</p><Badge variant="primary" size="sm">{selectedApproval.type}</Badge></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Priority</p>{getPriorityBadge(selectedApproval.priority)}</div>
            </div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Reference No</p><p className="text-sm font-semibold" style={{ color: '#111827' }}>{selectedApproval.referenceNo}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Description</p><p className="text-sm" style={{ color: '#111827' }}>{selectedApproval.description}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Requested By</p><p className="text-sm" style={{ color: '#111827' }}>{selectedApproval.requestedBy}</p></div>
            <div><p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Request Date</p><p className="text-sm" style={{ color: '#111827' }}>{new Date(selectedApproval.requestDate).toLocaleString()}</p></div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelectedApproval(null); }}>Close</Button>
          {selectedApproval && (
            <>
              <Button variant="danger" onClick={() => { handleReject(selectedApproval.id); setShowViewModal(false); setSelectedApproval(null); }}><XCircle className="w-4 h-4 mr-2" />Reject</Button>
              <Button variant="primary" onClick={() => { handleApprove(selectedApproval.id); setShowViewModal(false); setSelectedApproval(null); }}><CheckCircle className="w-4 h-4 mr-2" />Approve</Button>
            </>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
