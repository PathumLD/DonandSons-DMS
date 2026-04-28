'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { Edit, Save, AlertCircle, Calendar, Loader2 } from 'lucide-react';
import { showroomOpenStockApi, type ShowroomOpenStock } from '@/lib/api/showroom-open-stock';
import { useAuthStore } from '@/lib/stores/auth-store';
import { isAdminUser } from '@/lib/date-restrictions';
import toast from 'react-hot-toast';

export default function ShowroomOpenStockPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = isAdminUser(user);

  const [showrooms, setShowrooms] = useState<ShowroomOpenStock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showEditDateModal, setShowEditDateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selected, setSelected] = useState<ShowroomOpenStock | null>(null);
  const [newStockAsAt, setNewStockAsAt] = useState('');

  useEffect(() => {
    fetchShowrooms();
  }, []);

  const fetchShowrooms = async () => {
    try {
      setIsLoading(true);
      const response = await showroomOpenStockApi.getAll();
      setShowrooms(Array.isArray(response) ? response : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load showroom open stock');
      setShowrooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return showrooms.filter((s) => {
      const matchesSearch = (s.outlet?.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (s.outlet?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
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

  const saveEditDate = async () => {
    if (!selected) return;
    if (!newStockAsAt) {
      toast.error('Please select a stock as at date');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await showroomOpenStockApi.update(selected.id, {
        stockAsAt: newStockAsAt,
      });
      toast.success('Stock as at date updated successfully');
      setShowEditDateModal(false);
      setSelected(null);
      fetchShowrooms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update stock as at date');
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="flex items-center justify-between">
            <CardTitle>Showroom Stock As At Dates</CardTitle>
            <div className="relative w-full sm:w-auto max-w-xs">
              <input
                type="text"
                placeholder="Search showrooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid var(--input)' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--foreground)' }}>
                      Showroom Code
                    </th>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--foreground)' }}>
                      Showroom Name
                    </th>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--foreground)' }}>
                      Last Stock BF Date
                    </th>
                    <th className="text-center p-3 font-semibold" style={{ color: 'var(--foreground)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-8" style={{ color: 'var(--muted-foreground)' }}>
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                        <p>No showrooms found</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr
                        key={s.id}
                        style={{ borderBottom: '1px solid var(--border)' }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3">
                          <span className="font-mono font-semibold">{s.outlet?.code || '-'}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-medium">{s.outlet?.name || '-'}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" style={{ color: 'var(--muted-foreground)' }} />
                            <span className="font-medium">
                              {new Date(s.stockAsAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => openView(s)}
                              className="px-3 py-1.5 rounded text-sm transition-colors"
                              style={{
                                backgroundColor: 'var(--secondary)',
                                color: 'var(--secondary-foreground)',
                              }}
                            >
                              View
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => openEditDate(s)}
                                className="px-3 py-1.5 rounded text-sm transition-colors flex items-center"
                                style={{
                                  backgroundColor: 'var(--primary)',
                                  color: 'var(--primary-foreground)',
                                }}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit Date
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showEditDateModal}
        onClose={() => {
          setShowEditDateModal(false);
          setSelected(null);
        }}
        title="Edit Last Stock BF Date"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Showroom
              </p>
              <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                {selected.outlet?.code} - {selected.outlet?.name}
              </p>
            </div>
            <Input
              label="Last Stock BF Date"
              type="date"
              value={newStockAsAt}
              onChange={(e) => setNewStockAsAt(e.target.value)}
              fullWidth
              required
              helperText="This date will be used as the opening balance for future stock calculations"
            />
          </div>
        )}
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowEditDateModal(false);
              setSelected(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={saveEditDate} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Saving...' : 'Save Date'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelected(null);
        }}
        title="Showroom Details"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Showroom Code
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {selected.outlet?.code}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Showroom Name
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {selected.outlet?.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Last Stock BF Date
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {new Date(selected.stockAsAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                Last Updated
              </p>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                {new Date(selected.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowViewModal(false);
              setSelected(null);
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
