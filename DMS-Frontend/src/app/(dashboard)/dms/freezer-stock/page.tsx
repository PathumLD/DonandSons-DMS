'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Snowflake, Plus, Search, Edit, RefreshCw, History, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { freezerStocksApi, type FreezerStock, type FreezerStockHistory, type AdjustFreezerStockDto } from '@/lib/api/freezer-stocks';
import { productsApi, type Product } from '@/lib/api/products';
import { productionSectionsApi, type ProductionSection } from '@/lib/api/production-sections';
import { toast } from 'sonner';

export default function FreezerStockPage() {
  const [stockItems, setStockItems] = useState<FreezerStock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productionSections, setProductionSections] = useState<ProductionSection[]>([]);
  const [history, setHistory] = useState<FreezerStockHistory[]>([]);
  
  const [sectionFilter, setSectionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  
  const [adjustmentData, setAdjustmentData] = useState<AdjustFreezerStockDto>({
    productId: '',
    productionSectionId: '',
    adjustmentQuantity: 0,
    reason: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (products.length > 0 && productionSections.length > 0) {
      loadStocks();
    }
  }, [products, productionSections, sectionFilter]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, sectionsRes] = await Promise.all([
        productsApi.getAll(1, 100, undefined, undefined, true),
        productionSectionsApi.getAll(1, 100, undefined, true),
      ]);

      setProducts(productsRes.products);
      setProductionSections(sectionsRes.productionSections);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStocks = async () => {
    try {
      const response = await freezerStocksApi.getAll(
        1,
        1000,
        undefined,
        sectionFilter || undefined
      );
      setStockItems(response.freezerStocks);
    } catch (error) {
      console.error('Error loading stocks:', error);
      toast.error('Failed to load freezer stocks');
    }
  };

  const handleAdjust = async () => {
    try {
      setIsSubmitting(true);
      await freezerStocksApi.adjustStock(adjustmentData);
      
      toast.success('Stock adjusted successfully!');
      setShowAdjustModal(false);
      resetAdjustmentForm();
      await loadStocks();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAdjustModal = (productId: string, sectionId: string) => {
    setAdjustmentData({
      productId,
      productionSectionId: sectionId,
      adjustmentQuantity: 0,
      reason: '',
    });
    setShowAdjustModal(true);
  };

  const loadHistory = async (productId: string, sectionId: string) => {
    try {
      setSelectedProductId(productId);
      setSelectedSectionId(sectionId);
      
      const historyData = await freezerStocksApi.getHistory(productId, sectionId);
      setHistory(historyData);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load stock history');
    }
  };

  const resetAdjustmentForm = () => {
    setAdjustmentData({
      productId: '',
      productionSectionId: '',
      adjustmentQuantity: 0,
      reason: '',
    });
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'Manual': return <Badge variant="primary" size="sm">Manual</Badge>;
      case 'OrderFulfillment': return <Badge variant="warning" size="sm">Order</Badge>;
      case 'Production': return <Badge variant="success" size="sm">Production</Badge>;
      case 'Adjustment': return <Badge variant="neutral" size="sm">Adjustment</Badge>;
      default: return <Badge variant="neutral" size="sm">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-primary)' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>Loading freezer stocks...</p>
        </div>
      </div>
    );
  }

  const groupedStock: { [productId: string]: { [sectionId: string]: FreezerStock } } = {};
  stockItems.forEach(stock => {
    if (!groupedStock[stock.productId]) {
      groupedStock[stock.productId] = {};
    }
    groupedStock[stock.productId][stock.productionSectionId] = stock;
  });

  const lowStockItems = stockItems.filter(s => s.currentStock < 10);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Freezer Stock Management</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>Track freezer stock levels for production planning</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="md" onClick={loadStocks}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-error-callout)', border: '1px solid var(--dms-error-border)' }}>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--dms-error-text)' }}>⚠ Low Stock Alert ({lowStockItems.length} items)</p>
          <ul className="text-sm space-y-1" style={{ color: 'var(--dms-error-text)' }}>
            {lowStockItems.slice(0, 5).map(item => (
              <li key={item.id}>• {item.productName} ({item.productionSectionName}): <strong>{item.currentStock} units</strong></li>
            ))}
            {lowStockItems.length > 5 && <li>• ... and {lowStockItems.length - 5} more</li>}
          </ul>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Current Stock Grid</CardTitle>
            <div className="flex items-center space-x-3">
              <Select 
                value={sectionFilter} 
                onChange={(e) => setSectionFilter(e.target.value)} 
                options={[
                  { value: '', label: 'All Sections' }, 
                  ...productionSections.map(s => ({ value: s.id, label: s.name }))
                ]} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
              <thead style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <th className="sticky left-0 z-10 px-4 py-3 text-left text-xs font-medium" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', minWidth: '200px' }}>
                    Product
                  </th>
                  {productionSections
                    .filter(s => !sectionFilter || s.id === sectionFilter)
                    .map(section => (
                      <th key={section.id} className="px-3 py-3 text-center text-xs font-medium border-l" style={{ color: 'var(--muted-foreground)', borderColor: 'var(--input)' }}>
                        {section.name}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="sticky left-0 z-10 px-4 py-2 text-sm font-medium" style={{ color: 'var(--foreground)', backgroundColor: 'var(--card)' }}>
                      {product.name}
                    </td>
                    {productionSections
                      .filter(s => !sectionFilter || s.id === sectionFilter)
                      .map(section => {
                        const stock = groupedStock[product.id]?.[section.id];
                        const qty = stock?.currentStock || 0;
                        return (
                          <td key={section.id} className="px-3 py-2 text-center border-l" style={{ borderColor: 'var(--input)' }}>
                            <div className="flex flex-col items-center space-y-2">
                              <span 
                                className="text-lg font-bold" 
                                style={{ color: qty < 10 ? '#DC2626' : '#10B981' }}
                              >
                                {qty}
                              </span>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => openAdjustModal(product.id, section.id)}
                                  className="p-1 rounded transition-colors"
                                  style={{ color: 'var(--muted-foreground)' }}
                                  title="Adjust"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => loadHistory(product.id, section.id)}
                                  className="p-1 rounded transition-colors"
                                  style={{ color: 'var(--muted-foreground)' }}
                                  title="History"
                                >
                                  <History className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showAdjustModal} onClose={() => { setShowAdjustModal(false); resetAdjustmentForm(); }} title="Adjust Freezer Stock" size="md">
        <div className="space-y-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <p className="text-sm">
              <strong>Product:</strong> {products.find(p => p.id === adjustmentData.productId)?.name}<br />
              <strong>Section:</strong> {productionSections.find(s => s.id === adjustmentData.productionSectionId)?.name}
            </p>
          </div>
          
          <Input 
            label="Adjustment Quantity" 
            type="number" 
            value={adjustmentData.adjustmentQuantity.toString()} 
            onChange={(e) => setAdjustmentData({ ...adjustmentData, adjustmentQuantity: parseInt(e.target.value) || 0 })} 
            helperText="Use positive for additions, negative for reductions" 
            fullWidth 
            required 
          />
          
          <Input 
            label="Reason" 
            value={adjustmentData.reason} 
            onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })} 
            placeholder="Reason for adjustment..." 
            fullWidth 
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowAdjustModal(false); resetAdjustmentForm(); }} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdjust} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adjusting...
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Adjust Stock
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showHistoryModal} onClose={() => { setShowHistoryModal(false); setHistory([]); }} title="Stock History" size="lg">
        <div className="space-y-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <p className="text-sm">
              <strong>Product:</strong> {products.find(p => p.id === selectedProductId)?.name}<br />
              <strong>Section:</strong> {productionSections.find(s => s.id === selectedSectionId)?.name}
            </p>
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
              No history available
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
                <thead className="sticky top-0" style={{ backgroundColor: 'var(--muted)' }}>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Type</th>
                    <th className="px-3 py-2 text-right text-xs font-medium">Previous</th>
                    <th className="px-3 py-2 text-right text-xs font-medium">Adjustment</th>
                    <th className="px-3 py-2 text-right text-xs font-medium">New</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Reason</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  {history.map(h => (
                    <tr key={h.id}>
                      <td className="px-3 py-2 text-xs">{new Date(h.createdAt).toLocaleString()}</td>
                      <td className="px-3 py-2">{getTransactionTypeBadge(h.transactionType)}</td>
                      <td className="px-3 py-2 text-right font-mono text-sm">{h.previousStock}</td>
                      <td className="px-3 py-2 text-right font-mono text-sm" style={{ color: h.adjustmentQuantity > 0 ? '#10B981' : '#DC2626' }}>
                        {h.adjustmentQuantity > 0 ? '+' : ''}{h.adjustmentQuantity}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-sm font-bold">{h.newStock}</td>
                      <td className="px-3 py-2 text-xs">{h.reason || '-'}</td>
                      <td className="px-3 py-2 text-xs">{h.createdByName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowHistoryModal(false); setHistory([]); }}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-success-callout)', border: '1px solid var(--dms-success-border)' }}>
        <div className="flex items-start space-x-3">
          <Snowflake className="w-5 h-5 mt-0.5" style={{ color: 'var(--dms-success-text)' }} />
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--dms-success-text)' }}>Freezer Stock Integration:</p>
            <ul className="text-sm space-y-1" style={{ color: 'var(--dms-success-text)' }}>
              <li>• Freezer stock values are used in production planning</li>
              <li>• When "Use Freezer Stock" is enabled, available balance is calculated</li>
              <li>• Available Balance = Production Total - Freezer Stock</li>
              <li>• Low stock alerts (&lt; 10 units) appear at the top of this page</li>
              <li>• Click <strong>Edit</strong> to adjust stock levels</li>
              <li>• Click <strong>History</strong> to view transaction history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
