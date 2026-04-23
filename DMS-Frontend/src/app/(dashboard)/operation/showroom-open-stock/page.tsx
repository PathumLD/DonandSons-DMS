'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Edit, Save, AlertCircle, Calendar } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { isAdminUser } from '@/lib/date-restrictions';

/**
 * 4.viii Showroom Open Stock
 *
 * Per spec:
 *  - Page shows each showroom with its "Last Stock BF Date" (Stock as at date).
 *  - Admin (only) can EDIT the Last Stock BF Date so that a Stock BF entered
 *    earlier (e.g. 01/01/2026) becomes the Opening Balance for a future date
 *    (e.g. 04/01/2026) when intermediate days were closed.
 *  - Non-admins can only view this page; the Edit Date control is hidden.
 */

interface ShowroomOpenStock {
  id: number;
  showroomId: number;
  showroomCode: string;
  stockAsAt: string; // Last Stock BF Date
}

const mockShowroomOpenStock: ShowroomOpenStock[] = [
  { id: 1, showroomId: 1, showroomCode: 'BC', stockAsAt: '2026-01-10' },
  { id: 2, showroomId: 2, showroomCode: 'BW', stockAsAt: '2026-01-10' },
  { id: 3, showroomId: 3, showroomCode: 'DAL', stockAsAt: '2026-01-10' },
  { id: 4, showroomId: 4, showroomCode: 'DBG', stockAsAt: '2026-01-10' },
  { id: 5, showroomId: 5, showroomCode: 'KAD', stockAsAt: '2026-01-10' },
  { id: 6, showroomId: 6, showroomCode: 'KEL', stockAsAt: '2026-01-10' },
  { id: 7, showroomId: 7, showroomCode: 'KML', stockAsAt: '2026-01-10' },
  { id: 8, showroomId: 8, showroomCode: 'RAG', stockAsAt: '2026-01-10' },
  { id: 9, showroomId: 9, showroomCode: 'RAN', stockAsAt: '2026-01-10' },
  { id: 10, showroomId: 10, showroomCode: 'SGK', stockAsAt: '2026-01-10' },
  { id: 11, showroomId: 11, showroomCode: 'SLE', stockAsAt: '2026-01-09' },
  { id: 12, showroomId: 12, showroomCode: 'WED', stockAsAt: '2026-01-10' },
  { id: 13, showroomId: 13, showroomCode: 'YRK', stockAsAt: '2026-01-10' },
];

export default function ShowroomOpenStockPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);

  const [showrooms, setShowrooms] = useState<ShowroomOpenStock[]>(mockShowroomOpenStock);
  const [searchTerm, setSearchTerm] = useState('');

  const [showEditDateModal, setShowEditDateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selected, setSelected] = useState<ShowroomOpenStock | null>(null);
  const [newStockAsAt, setNewStockAsAt] = useState('');

  const filtered = useMemo(() => {
    return showrooms.filter((s) => {
      const matchesSearch = s.showroomCode.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [showrooms, searchTerm]);

  const openEditDate = (showroom: ShowroomOpenStock) => {
    setSelected(showroom);
    setNewStockAsAt(showroom.stockAsAt);
    setShowEditDateModal(true);
  };

  const openView = (showroom: ShowroomOpenStock) => {
    setSelected(showroom);
    setShowViewModal(true);
  };

  const saveEditDate = () => {
    if (!selected) return;
    if (!newStockAsAt) {
      alert('Please select a stock as at date');
      return;
    }
    setShowrooms((prev) =>
      prev.map((s) =>
        s.id === selected.id ? { ...s, stockAsAt: newStockAsAt } : s
      )
    );
    setShowEditDateModal(false);
    setSelected(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Showroom Open Stock
        </h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          {isAdmin
            ? 'Admin: You can edit the Last Stock BF Date for each showroom.'
            : 'View-only access. Admin can edit the Stock BF dates.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Showroom Open Stock</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--muted-foreground)', fontWeight: 600, fontSize: '0.875rem' }}>Showroom</th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--muted-foreground)', fontWeight: 600, fontSize: '0.875rem' }}>Stock as at</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((showroom, index) => (
                  <tr 
                    key={showroom.id}
                    style={{ 
                      borderBottom: index < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      backgroundColor: 'var(--card)'
                    }}
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-base">{showroom.showroomCode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{new Date(showroom.stockAsAt).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 justify-end">
                        {isAdmin && (
                          <button
                            onClick={() => openEditDate(showroom)}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: '#3B82F6' }}
                            onMouseEnter={(ev) => (ev.currentTarget.style.backgroundColor = '#EFF6FF')}
                            onMouseLeave={(ev) => (ev.currentTarget.style.backgroundColor = 'transparent')}
                            title="Edit Stock BF Date"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openView(showroom)}
                          className="p-1.5 rounded transition-colors"
                          style={{ color: '#3B82F6' }}
                          onMouseEnter={(ev) => (ev.currentTarget.style.backgroundColor = '#EFF6FF')}
                          onMouseLeave={(ev) => (ev.currentTarget.style.backgroundColor = 'transparent')}
                          title="View Details"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Admin Edit Date Modal */}
      <Modal
        isOpen={showEditDateModal}
        onClose={() => { setShowEditDateModal(false); setSelected(null); }}
        title="Edit Stock BF Date"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
              <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Showroom: <strong>{selected.showroomCode}</strong>
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                Current Stock BF Date: <strong>{new Date(selected.stockAsAt).toLocaleDateString()}</strong>
              </div>
            </div>

            <Input
              label="Stock as at Date"
              type="date"
              value={newStockAsAt}
              onChange={(e) => setNewStockAsAt(e.target.value)}
              helperText="Edit this date if the showroom was closed for one or more days. This will affect the opening balance date."
              fullWidth
              required
            />

            <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FFD100' }}>
              <Calendar className="w-4 h-4 mt-0.5" style={{ color: '#92400E' }} />
              <div className="text-xs" style={{ color: '#92400E' }}>
                <strong>Example:</strong> Showroom Last Stock BF Date = 01/01/2026. Showroom closed at 02/01/2026 & 03/01/2026. Admin can edit to 04/01/2026, making that the opening balance date.
              </div>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowEditDateModal(false); setSelected(null); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveEditDate}>
            <Save className="w-4 h-4 mr-2" />Save
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setSelected(null); }}
        title="Showroom Stock Details"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Showroom</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selected.showroomCode}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Stock as at</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{new Date(selected.stockAsAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE' }}>
              <p className="text-sm" style={{ color: '#1E40AF' }}>
                This represents the last Stock BF (Brought Forward) date for this showroom. Only Admin can edit this date.
              </p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowViewModal(false); setSelected(null); }}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
