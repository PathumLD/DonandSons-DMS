'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { CheckCircle, Search, Check, X, Loader2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { approvalsApi, type Approval, type ApproveApprovalDto, type RejectApprovalDto } from '@/lib/api/approvals';
import toast from 'react-hot-toast';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState<string>('Pending');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadApprovals();
  }, [currentPage, pageSize, filterStatus]);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const response = filterStatus === 'Pending' 
        ? await approvalsApi.getPending(currentPage, pageSize)
        : await approvalsApi.getAll(currentPage, pageSize, undefined, filterStatus);
      setApprovals(response.approvals);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;

    try {
      setSubmitting(true);
      const data: ApproveApprovalDto = {
        notes: approvalNotes,
      };
      await approvalsApi.approve(selectedApproval.id, data);
      toast.success('Approval granted successfully');
      setShowApproveModal(false);
      setSelectedApproval(null);
      setApprovalNotes('');
      loadApprovals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval || !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setSubmitting(true);
      const data: RejectApprovalDto = {
        rejectionReason: rejectionReason,
        notes: approvalNotes,
      };
      await approvalsApi.reject(selectedApproval.id, data);
      toast.success('Approval rejected');
      setShowRejectModal(false);
      setSelectedApproval(null);
      setRejectionReason('');
      setApprovalNotes('');
      loadApprovals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setSubmitting(false);
    }
  };

  const openApproveModal = (approval: Approval) => {
    setSelectedApproval(approval);
    setShowApproveModal(true);
  };

  const openRejectModal = (approval: Approval) => {
    setSelectedApproval(approval);
    setShowRejectModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      default: return 'neutral';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'danger';
    if (priority >= 5) return 'warning';
    return 'info';
  };

  const columns = [
    {
      key: 'approvalType',
      label: 'Type',
      render: (item: Approval) => (
        <Badge variant="neutral" size="sm">{item.approvalType}</Badge>
      ),
    },
    {
      key: 'entityReference',
      label: 'Reference',
      render: (item: Approval) => (
        <span className="font-mono font-semibold" style={{ color: '#C8102E' }}>
          {item.entityReference || item.entityId}
        </span>
      ),
    },
    {
      key: 'requestedBy',
      label: 'Requested By',
      render: (item: Approval) => (
        <div>
          <span className="font-medium">{item.requestedByName}</span>
          {item.requestedByEmail && (
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {item.requestedByEmail}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'requestedAt',
      label: 'Requested At',
      render: (item: Approval) => (
        <span className="text-sm">{new Date(item.requestedAt).toLocaleString()}</span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (item: Approval) => (
        <Badge variant={getPriorityColor(item.priority)} size="sm">{item.priority}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Approval) => (
        <Badge variant={getStatusColor(item.status)} size="sm">{item.status}</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: Approval) => (
        item.status === 'Pending' ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openApproveModal(item)}
              className="p-1.5 rounded transition-colors"
              style={{ color: '#10B981' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDF4'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => openRejectModal(item)}
              className="p-1.5 rounded transition-colors"
              style={{ color: '#DC2626' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Reject"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            {item.approvedByName && (
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                By: {item.approvedByName}
              </div>
            )}
          </div>
        )
      ),
    },
  ];

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            <CheckCircle className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            Approvals
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Review and manage pending approval requests ({totalCount} {filterStatus.toLowerCase()})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ border: '1px solid var(--input)' }}
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="">All</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Approval Requests</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search approvals..."
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C8102E' }} />
            </div>
          ) : (
            <DataTable
              data={approvals}
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
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedApproval(null);
          setApprovalNotes('');
        }}
        title="Approve Request"
        size="md"
      >
        {selectedApproval && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Approval Type: {selectedApproval.approvalType}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Reference: {selectedApproval.entityReference || selectedApproval.entityId}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Requested by: {selectedApproval.requestedByName}
              </p>
            </div>
            <Input
              label="Notes (Optional)"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add any notes..."
              fullWidth
            />
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowApproveModal(false);
            setSelectedApproval(null);
            setApprovalNotes('');
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApprove} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            {submitting ? 'Approving...' : 'Approve'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedApproval(null);
          setRejectionReason('');
          setApprovalNotes('');
        }}
        title="Reject Request"
        size="md"
      >
        {selectedApproval && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Approval Type: {selectedApproval.approvalType}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Reference: {selectedApproval.entityReference || selectedApproval.entityId}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Requested by: {selectedApproval.requestedByName}
              </p>
            </div>
            <Input
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason..."
              fullWidth
              required
            />
            <Input
              label="Additional Notes (Optional)"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add any notes..."
              fullWidth
            />
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setShowRejectModal(false);
            setSelectedApproval(null);
            setRejectionReason('');
            setApprovalNotes('');
          }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
            {submitting ? 'Rejecting...' : 'Reject'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
