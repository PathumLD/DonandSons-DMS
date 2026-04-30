'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { InlineDetailPanel } from '@/components/ui/inline-detail-panel';
import { CheckCircle, XCircle, Search, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { approvalsApi, type Approval } from '@/lib/api/approvals';
import ProtectedPage from '@/components/auth/ProtectedPage';
import toast from 'react-hot-toast';

export default function StockAdjustmentApprovalPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await approvalsApi.getPending(currentPage, pageSize, 'StockAdjustment');
      setApprovals(Array.isArray(response.approvals) ? response.approvals : []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error('Failed to load pending approvals:', error);
      toast.error('Failed to load pending approvals');
      setApprovals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setIsSubmitting(true);
      await approvalsApi.approve(id, {});
      toast.success('Stock adjustment approved successfully');
      fetchData();
      setSelectedApproval(null);
    } catch (error: any) {
      console.error('Failed to approve:', error);
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please provide a rejection reason:');
    if (!reason) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await approvalsApi.reject(id, { rejectionReason: reason });
      toast.success('Stock adjustment rejected successfully');
      fetchData();
      setSelectedApproval(null);
    } catch (error: any) {
      console.error('Failed to reject:', error);
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredApprovals = Array.isArray(approvals) ? approvals.filter(a => {
    const matchesSearch = searchTerm === '' || 
      a.entityReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.requestedByName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) : [];

  const columns = [
    {
      key: 'requestedAt',
      label: 'Requested Date',
      render: (item: Approval) => (
        <span style={{ color: 'var(--muted-foreground)' }}>
          {new Date(item.requestedAt).toLocaleDateString('en-GB')}
        </span>
      ),
    },
    {
      key: 'entityReference',
      label: 'Adjustment No',
      render: (item: Approval) => (
        <span className="font-semibold" style={{ color: '#C8102E' }}>
          {item.entityReference || item.entityId}
        </span>
      ),
    },
    {
      key: 'requestedBy',
      label: 'Requested By',
      render: (item: Approval) => (
        <span style={{ color: 'var(--muted-foreground)' }}>{item.requestedByName}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Approval) => (
        <Badge variant="warning" size="sm">Pending</Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (item: Approval) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => {
              if (selectedApproval?.id === item.id) setSelectedApproval(null);
              else setSelectedApproval(item);
            }}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            title={selectedApproval?.id === item.id ? 'Hide details' : 'View details'}
          >
            {selectedApproval?.id === item.id ? (
              <Eye className="w-4 h-4" aria-hidden />
            ) : (
              <EyeOff className="w-4 h-4" aria-hidden />
            )}
          </button>
          <button
            onClick={() => handleApprove(item.id)}
            className="px-3 py-1.5 text-sm rounded-lg transition-colors"
            style={{ color: '#10b981', backgroundColor: '#d1fae5' }}
            title="Approve"
          >
            Approve
          </button>
          <button
            onClick={() => handleReject(item.id)}
            className="px-3 py-1.5 text-sm rounded-lg transition-colors"
            style={{ color: '#ef4444', backgroundColor: '#fee2e2' }}
            title="Reject"
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedPage 
      permission="production:stock-adjustment:approve"
      deniedMessage="Only authorized personnel can access stock adjustment approvals. Please contact your supervisor if you need access."
    >
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Stock Adjustment Approval</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Review and approve pending stock adjustments
          </p>
        </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {isLoading ? 'Loading...' : `Showing ${totalCount} pending approvals`}
              </span>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm" 
                style={{ border: '1px solid var(--input)' }} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <DataTable
              data={filteredApprovals}
              columns={columns}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          )}
        </CardContent>
      </Card>

      <InlineDetailPanel
        title="Stock Adjustment Approval Details"
        open={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedApproval(null)}>
              Close
            </Button>
            {selectedApproval && (
              <>
                <Button
                  variant="danger"
                  onClick={() => handleReject(selectedApproval.id)}
                  disabled={isSubmitting}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleApprove(selectedApproval.id)}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Approving...' : 'Approve'}
                </Button>
              </>
            )}
          </>
        }
      >
        {selectedApproval && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Adjustment No</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  {selectedApproval.entityReference || selectedApproval.entityId}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</p>
                <Badge variant="warning" size="sm">Pending</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Requested By</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {selectedApproval.requestedByName} ({selectedApproval.requestedByEmail})
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Requested At</p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selectedApproval.requestedAt).toLocaleString()}
              </p>
            </div>
            {selectedApproval.notes && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{selectedApproval.notes}</p>
              </div>
            )}
            {selectedApproval.requestData && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Request Data</p>
                <pre className="text-xs p-2 bg-gray-100 rounded" style={{ color: 'var(--foreground)' }}>
                  {selectedApproval.requestData}
                </pre>
              </div>
            )}
          </div>
        )}
      </InlineDetailPanel>
      </div>
    </ProtectedPage>
  );
}
