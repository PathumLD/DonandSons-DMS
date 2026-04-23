'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Settings, Search, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WorkflowOperation {
  id: number;
  operationName: string;
  requiresApproval: boolean;
  approverGroups: string[];
}

export default function WorkFlowConfigPage() {
  const [operations, setOperations] = useState<WorkflowOperation[]>([
    { id: 1, operationName: 'Daily Production', requiresApproval: true, approverGroups: ['Admin', 'Production Manager'] },
    { id: 2, operationName: 'DayEnd Process Balance', requiresApproval: true, approverGroups: ['Admin', 'Manager'] },
    { id: 3, operationName: 'Delivery', requiresApproval: true, approverGroups: ['Admin', 'Manager'] },
    { id: 4, operationName: 'Delivery Cancel', requiresApproval: true, approverGroups: ['Admin'] },
    { id: 5, operationName: 'Delivery Return', requiresApproval: true, approverGroups: ['Admin', 'Manager'] },
    { id: 6, operationName: 'Disposal', requiresApproval: true, approverGroups: ['Admin', 'Manager'] },
    { id: 7, operationName: 'End Process', requiresApproval: true, approverGroups: ['Admin'] },
    { id: 8, operationName: 'Label Printing', requiresApproval: false, approverGroups: [] },
    { id: 9, operationName: 'Production Cancel', requiresApproval: true, approverGroups: ['Admin', 'Production Manager'] },
    { id: 10, operationName: 'Production BF', requiresApproval: true, approverGroups: ['Admin', 'Production Manager'] },
    { id: 11, operationName: 'Stock Adjustment', requiresApproval: true, approverGroups: ['Admin', 'Manager'] },
    { id: 12, operationName: 'Transfer', requiresApproval: true, approverGroups: ['Admin', 'Manager'] },
    { id: 13, operationName: 'Showroom Closed', requiresApproval: true, approverGroups: ['Admin'] },
    { id: 14, operationName: 'Cancellation', requiresApproval: true, approverGroups: ['Admin', 'Manager'] },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<WorkflowOperation | null>(null);

  const filteredOperations = operations.filter(op =>
    op.operationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOperations.length / pageSize);
  const paginatedOperations = filteredOperations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openConfigModal = (operation: WorkflowOperation) => {
    setSelectedOperation(operation);
    setShowConfigModal(true);
  };

  const handleSaveConfig = () => {
    if (selectedOperation) {
      setOperations(operations.map(op =>
        op.id === selectedOperation.id ? selectedOperation : op
      ));
      setShowConfigModal(false);
      setSelectedOperation(null);
    }
  };

  const columns = [
    { 
      key: 'operationName', 
      label: 'Operation Name', 
      render: (item: WorkflowOperation) => (
        <span className="font-medium" style={{ color: 'var(--foreground)' }}>{item.operationName}</span>
      )
    },
    { 
      key: 'actions', 
      label: '', 
      render: (item: WorkflowOperation) => (
        <div className="flex items-center justify-end">
          <button 
            onClick={() => openConfigModal(item)} 
            className="p-2 rounded-full transition-colors" 
            style={{ color: '#3B82F6', backgroundColor: '#EFF6FF' }} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'} 
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'} 
            title="Configure"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            <Settings className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
            WorkFlow Configuration
          </h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Configure user groups and approval workflows for each operation
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Showing 1 to 10 of {filteredOperations.length} entries
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
            data={paginatedOperations} 
            columns={columns} 
            currentPage={currentPage} 
            totalPages={totalPages} 
            pageSize={pageSize} 
            onPageChange={setCurrentPage} 
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} 
          />
        </CardContent>
      </Card>

      <Modal 
        isOpen={showConfigModal} 
        onClose={() => { setShowConfigModal(false); setSelectedOperation(null); }} 
        title="Configure Workflow" 
        size="md"
      >
        {selectedOperation && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Operation: {selectedOperation.operationName}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
                Requires Approval
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="requiresApproval"
                    checked={selectedOperation.requiresApproval === true}
                    onChange={() => setSelectedOperation({ ...selectedOperation, requiresApproval: true })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="requiresApproval"
                    checked={selectedOperation.requiresApproval === false}
                    onChange={() => setSelectedOperation({ ...selectedOperation, requiresApproval: false })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>No</span>
                </label>
              </div>
            </div>

            {selectedOperation.requiresApproval && (
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
                  Approver User Groups
                </label>
                <div className="space-y-2">
                  {['Admin', 'Manager', 'Production Manager', 'Sales Manager'].map(group => (
                    <label key={group} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOperation.approverGroups.includes(group)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOperation({
                              ...selectedOperation,
                              approverGroups: [...selectedOperation.approverGroups, group]
                            });
                          } else {
                            setSelectedOperation({
                              ...selectedOperation,
                              approverGroups: selectedOperation.approverGroups.filter(g => g !== group)
                            });
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>{group}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FFD100' }}>
              <p className="text-xs" style={{ color: '#92400E' }}>
                <strong>Note:</strong> User groups configured here will receive approval requests for this operation.
              </p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowConfigModal(false); setSelectedOperation(null); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveConfig}>
            <Settings className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
