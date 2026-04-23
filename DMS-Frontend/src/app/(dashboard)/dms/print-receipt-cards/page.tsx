'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Checkbox from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Printer, Search, Eye, FileText, Layers, Settings } from 'lucide-react';
import { mockOutletsFull } from '@/lib/mock-data/outlets-with-variants';
import { mockDeliveryTurns } from '@/lib/mock-data/delivery-turns';
import { allProducts } from '@/lib/mock-data/products-full';

type Layout = 'A4' | 'A5' | 'Letter' | 'Thermal-80mm';

interface ReceiptCard {
  outletId: number;
  outletCode: string;
  outletName: string;
  productCount: number;
  totalQty: number;
  turnId: number;
}

export default function PrintReceiptCardsPage() {
  const [printDate, setPrintDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTurn, setSelectedTurn] = useState<number>(1);
  const [layout, setLayout] = useState<Layout>('A5');
  const [copies, setCopies] = useState(1);
  const [includeBarcode, setIncludeBarcode] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOutlets, setSelectedOutlets] = useState<number[]>([]);
  const [previewCard, setPreviewCard] = useState<ReceiptCard | null>(null);

  const cards: ReceiptCard[] = useMemo(() => {
    return mockOutletsFull.filter(o => o.active).map(o => ({
      outletId: o.id,
      outletCode: o.code,
      outletName: o.name,
      productCount: 12 + (o.id % 8),
      totalQty: 180 + (o.id * 23) % 120,
      turnId: selectedTurn,
    }));
  }, [selectedTurn]);

  const filteredCards = cards.filter(c =>
    c.outletCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.outletName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOutlet = (id: number) => {
    setSelectedOutlets(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedOutlets.length === filteredCards.length) {
      setSelectedOutlets([]);
    } else {
      setSelectedOutlets(filteredCards.map(c => c.outletId));
    }
  };

  const handlePrint = () => {
    if (selectedOutlets.length === 0) {
      alert('Please select at least one outlet to print receipt cards.');
      return;
    }
    alert(`Printing ${selectedOutlets.length * copies} receipt card(s) (${layout}) for ${printDate}.`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Print Receipt Cards</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Generate per-outlet receipt cards from confirmed delivery plans
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="md" onClick={() => setSelectedOutlets([])}>
            Clear Selection
          </Button>
          <Button variant="primary" size="md" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print {selectedOutlets.length > 0 ? `(${selectedOutlets.length})` : ''}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Print Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Delivery Date"
              type="date"
              value={printDate}
              onChange={(e) => setPrintDate(e.target.value)}
              fullWidth
            />
            <Select
              label="Delivery Turn"
              value={selectedTurn}
              onChange={(e) => setSelectedTurn(Number(e.target.value))}
              options={mockDeliveryTurns.map(t => ({ value: t.id, label: t.displayName }))}
              fullWidth
            />
            <Select
              label="Card Layout"
              value={layout}
              onChange={(e) => setLayout(e.target.value as Layout)}
              options={[
                { value: 'A4', label: 'A4 (210 × 297 mm)' },
                { value: 'A5', label: 'A5 (148 × 210 mm)' },
                { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
                { value: 'Thermal-80mm', label: 'Thermal 80mm' },
              ]}
              fullWidth
            />
            <Input
              label="Copies per Outlet"
              type="number"
              min="1"
              max="10"
              value={copies}
              onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
              fullWidth
            />
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Checkbox checked={includeBarcode} onChange={(e) => setIncludeBarcode(e.target.checked)} label="Include Barcode" />
            <Checkbox checked={includeNotes} onChange={(e) => setIncludeNotes(e.target.checked)} label="Include Notes Section" />
            <Checkbox checked={includeSignature} onChange={(e) => setIncludeSignature(e.target.checked)} label="Include Signature Line" />
            <Checkbox checked={groupByCategory} onChange={(e) => setGroupByCategory(e.target.checked)} label="Group by Category" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Outlets ({filteredCards.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {selectedOutlets.length === filteredCards.length ? 'Deselect All' : 'Select All'}
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search outlets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid var(--input)' }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCards.map(card => {
              const isSelected = selectedOutlets.includes(card.outletId);
              return (
                <div
                  key={card.outletId}
                  className="p-4 rounded-lg cursor-pointer transition-all"
                  style={{
                    border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--dms-destructive-soft)' : 'var(--dms-surface)',
                  }}
                  onClick={() => toggleOutlet(card.outletId)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={isSelected ? 'primary' : 'neutral'} size="sm">{card.outletCode}</Badge>
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {mockDeliveryTurns.find(t => t.id === card.turnId)?.displayName}
                        </span>
                      </div>
                      <p className="text-sm font-medium mt-1" style={{ color: 'var(--foreground)' }}>
                        {card.outletName}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOutlet(card.outletId)}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>
                    <span>{card.productCount} products</span>
                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      Total Qty: {card.totalQty}
                    </span>
                  </div>
                  <button
                    className="mt-3 w-full text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1"
                    style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    onClick={(e) => { e.stopPropagation(); setPreviewCard(card); }}
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {previewCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setPreviewCard(null)}
        >
          <div
            className="rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-lg font-semibold">Receipt Card Preview - {previewCard.outletCode}</h3>
              <button onClick={() => setPreviewCard(null)} className="text-2xl leading-none">×</button>
            </div>
            <div className="p-8 space-y-4" style={{ fontFamily: 'monospace', backgroundColor: '#FAFAFA' }}>
              <div className="text-center">
                <h2 className="text-2xl font-bold">DON & SONS</h2>
                <p className="text-sm">Delivery Receipt Card</p>
                <p className="text-xs mt-2">Date: {new Date(printDate).toLocaleDateString()} • Turn: {mockDeliveryTurns.find(t => t.id === previewCard.turnId)?.displayName}</p>
              </div>
              <div className="text-sm" style={{ borderTop: '1px dashed #999', borderBottom: '1px dashed #999', padding: '8px 0' }}>
                <p><strong>Outlet:</strong> {previewCard.outletCode} - {previewCard.outletName}</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th className="text-left py-1">Code</th>
                    <th className="text-left py-1">Product</th>
                    <th className="text-right py-1">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {allProducts.slice(0, previewCard.productCount).map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px dotted #eee' }}>
                      <td className="py-1">{p.code}</td>
                      <td className="py-1">{p.name}</td>
                      <td className="text-right py-1">{Math.floor(Math.random() * 30) + 5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between text-sm pt-2" style={{ borderTop: '2px solid #333' }}>
                <span><strong>TOTAL</strong></span>
                <span><strong>{previewCard.totalQty}</strong></span>
              </div>
              {includeNotes && (
                <div className="text-xs">
                  <p>Notes: ____________________________________________</p>
                  <p className="mt-1">__________________________________________________</p>
                </div>
              )}
              {includeSignature && (
                <div className="grid grid-cols-2 gap-8 text-xs pt-6">
                  <div>
                    <p style={{ borderTop: '1px solid #333', paddingTop: '4px' }}>Delivered By</p>
                  </div>
                  <div>
                    <p style={{ borderTop: '1px solid #333', paddingTop: '4px' }}>Received By</p>
                  </div>
                </div>
              )}
              {includeBarcode && (
                <div className="text-center pt-4">
                  <div style={{ fontFamily: 'monospace', letterSpacing: '2px', fontSize: '24px' }}>
                    ||| || |||| | ||| || |||
                  </div>
                  <p className="text-xs mt-1">DS-{previewCard.outletCode}-{printDate.replace(/-/g, '')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--dms-info-soft)', border: '1px solid var(--dms-info-soft-border)' }}>
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 mt-0.5" style={{ color: 'var(--dms-link)' }} />
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--dms-link)' }}>Receipt Card Notes</p>
            <ul className="text-sm space-y-1" style={{ color: 'var(--dms-link)' }}>
              <li>• Cards pull live data from the latest <strong>Confirmed Delivery Plan</strong> for the selected date and turn.</li>
              <li>• <strong>A4</strong> fits up to ~30 product lines per card; <strong>A5</strong> ~15; <strong>Thermal-80mm</strong> uses continuous roll layout.</li>
              <li>• Multiple copies print sequentially per outlet (not interleaved).</li>
              <li>• If "Group by Category" is enabled, products are sectioned with subtotals.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
