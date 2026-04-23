'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Save, Shield, Edit2, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { isAdminUser } from '@/lib/date-restrictions';

interface LabelPrinter {
  id: number;
  printerName: string;
}

interface TemplateMapping {
  id: number;
  templateName: string;
  printerName: string;
}

interface PrintingComment {
  id: number;
  comment: string;
}

export default function LabelSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);

  // Defined Label Printers
  const [printers, setPrinters] = useState<LabelPrinter[]>([
    { id: 1, printerName: 'Datamax (GOA) BPL' },
    { id: 2, printerName: 'Datamax (Gold-Shop) DA' },
    { id: 3, printerName: 'Datamax (Galle BFL)' },
    { id: 4, printerName: 'Datamax (YT) label - test' },
  ]);

  // Set Template to Printer
  const [templateMappings, setTemplateMappings] = useState<TemplateMapping[]>([
    { id: 1, templateName: 'label 1 zone', printerName: '' },
    { id: 2, templateName: 'label 2 with Code', printerName: '' },
    { id: 3, templateName: 'BONK sandwich', printerName: '' },
    { id: 4, templateName: 'bread', printerName: '' },
    { id: 5, templateName: 'bread 2', printerName: '' },
    { id: 6, templateName: 'Grain Stock & Gmo', printerName: '' },
    { id: 7, templateName: 'Label -adrees 12pc', printerName: '' },
    { id: 8, templateName: 'Medium Label For New shop', printerName: '' },
    { id: 9, templateName: 'medium label-old', printerName: '' },
    { id: 10, templateName: 'Madium Size 12pc (Best seller)', printerName: '' },
    { id: 11, templateName: 'grain All Stock label', printerName: '' },
    { id: 12, templateName: 'Small For new shop-Label', printerName: '' },
  ]);

  // Defined Label Printing Comments
  const [comments, setComments] = useState<PrintingComment[]>([
    { id: 1, comment: 'NO ADDED PRESERVATIVES' },
    { id: 2, comment: '100% NATURAL PRODUCT' },
    { id: 3, comment: 'award Winer' },
    { id: 4, comment: 'Fresh' },
    { id: 5, comment: 'CHICKEN' },
  ]);

  // Modal states
  const [showAddPrinterModal, setShowAddPrinterModal] = useState(false);
  const [showEditPrinterModal, setShowEditPrinterModal] = useState(false);
  const [showEditMappingModal, setShowEditMappingModal] = useState(false);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);

  const [editingPrinter, setEditingPrinter] = useState<LabelPrinter | null>(null);
  const [editingMapping, setEditingMapping] = useState<TemplateMapping | null>(null);
  const [newPrinterName, setNewPrinterName] = useState('');
  const [newComment, setNewComment] = useState('');

  // Handlers
  const handleAddPrinter = () => {
    if (!newPrinterName.trim()) return;
    setPrinters([...printers, { id: Math.max(...printers.map(p => p.id), 0) + 1, printerName: newPrinterName }]);
    setNewPrinterName('');
    setShowAddPrinterModal(false);
  };

  const handleEditPrinter = () => {
    if (!editingPrinter || !editingPrinter.printerName.trim()) return;
    setPrinters(printers.map(p => p.id === editingPrinter.id ? editingPrinter : p));
    setEditingPrinter(null);
    setShowEditPrinterModal(false);
  };

  const handleDeletePrinter = (id: number) => {
    if (confirm('Are you sure you want to delete this printer?')) {
      setPrinters(printers.filter(p => p.id !== id));
    }
  };

  const handleEditMapping = () => {
    if (!editingMapping) return;
    setTemplateMappings(templateMappings.map(m => m.id === editingMapping.id ? editingMapping : m));
    setEditingMapping(null);
    setShowEditMappingModal(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([...comments, { id: Math.max(...comments.map(c => c.id), 0) + 1, comment: newComment }]);
    setNewComment('');
    setShowAddCommentModal(false);
  };

  const handleDeleteComment = (id: number) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      setComments(comments.filter(c => c.id !== id));
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: '#DC2626' }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Admin Access Required</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Label Settings are only visible to administrators (per requirement 6.iv).
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Label Settings</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Configure label printers, template mappings, and printing comments
          </p>
          <div className="mt-2">
            <Badge variant="primary" size="sm">
              <Shield className="w-3 h-3 mr-1" />
              Admin only
            </Badge>
          </div>
        </div>
      </div>

      {/* Defined Label Printers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Defined Label Printers</CardTitle>
            <Button variant="primary" size="sm" onClick={() => setShowAddPrinterModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Printer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>Printer Name</th>
                  <th className="text-center px-4 py-3 font-medium" style={{ color: 'var(--foreground)', width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {printers.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)' }}>
                      No printers defined.
                    </td>
                  </tr>
                ) : (
                  printers.map((printer) => (
                    <tr key={printer.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{printer.printerName}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setEditingPrinter(printer); setShowEditPrinterModal(true); }}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: '#3B82F6' }}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePrinter(printer.id)}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: '#DC2626' }}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Set Template to Printer */}
      <Card>
        <CardHeader>
          <CardTitle>Set Template to Printer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>Template Name</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>Printer Name</th>
                  <th className="text-center px-4 py-3 font-medium" style={{ color: 'var(--foreground)', width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templateMappings.map((mapping) => (
                  <tr key={mapping.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{mapping.templateName}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>
                      {mapping.printerName || <span style={{ color: '#D1D5DB' }}>Not assigned</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setEditingMapping(mapping); setShowEditMappingModal(true); }}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: '#3B82F6' }}
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Defined Label Printing Comments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Defined Label Printing Comments</CardTitle>
            <Button variant="primary" size="sm" onClick={() => setShowAddCommentModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Comment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>Comments</th>
                  <th className="text-center px-4 py-3 font-medium" style={{ color: 'var(--foreground)', width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)' }}>
                      No comments defined.
                    </td>
                  </tr>
                ) : (
                  comments.map((comment) => (
                    <tr key={comment.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{comment.comment}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1.5 rounded transition-colors"
                          style={{ color: '#DC2626' }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Printer Modal */}
      <Modal
        isOpen={showAddPrinterModal}
        onClose={() => { setShowAddPrinterModal(false); setNewPrinterName(''); }}
        title="Add Label Printer"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Printer Name"
            value={newPrinterName}
            onChange={(e) => setNewPrinterName(e.target.value)}
            placeholder="Enter printer name"
            fullWidth
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowAddPrinterModal(false); setNewPrinterName(''); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddPrinter}>
            <Plus className="w-4 h-4 mr-2" />
            Add Printer
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Printer Modal */}
      <Modal
        isOpen={showEditPrinterModal}
        onClose={() => { setShowEditPrinterModal(false); setEditingPrinter(null); }}
        title="Edit Label Printer"
        size="md"
      >
        {editingPrinter && (
          <div className="space-y-4">
            <Input
              label="Printer Name"
              value={editingPrinter.printerName}
              onChange={(e) => setEditingPrinter({ ...editingPrinter, printerName: e.target.value })}
              fullWidth
            />
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditPrinterModal(false); setEditingPrinter(null); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditPrinter}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Template Mapping Modal */}
      <Modal
        isOpen={showEditMappingModal}
        onClose={() => { setShowEditMappingModal(false); setEditingMapping(null); }}
        title="Set Template to Printer"
        size="md"
      >
        {editingMapping && (
          <div className="space-y-4">
            <Input
              label="Template Name"
              value={editingMapping.templateName}
              disabled
              fullWidth
            />
            <Select
              label="Printer Name"
              value={editingMapping.printerName}
              onChange={(e) => setEditingMapping({ ...editingMapping, printerName: e.target.value })}
              options={[
                { value: '', label: '-- Select Printer --' },
                ...printers.map(p => ({ value: p.printerName, label: p.printerName }))
              ]}
              fullWidth
            />
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditMappingModal(false); setEditingMapping(null); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditMapping}>
            <Save className="w-4 h-4 mr-2" />
            Save Mapping
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Comment Modal */}
      <Modal
        isOpen={showAddCommentModal}
        onClose={() => { setShowAddCommentModal(false); setNewComment(''); }}
        title="Add Printing Comment"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Enter printing comment"
            fullWidth
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowAddCommentModal(false); setNewComment(''); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddComment}>
            <Plus className="w-4 h-4 mr-2" />
            Add Comment
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
