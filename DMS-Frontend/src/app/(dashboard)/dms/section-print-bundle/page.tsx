'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Checkbox from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Printer, FileStack, Package, ChefHat, ListChecks, Boxes, Eye, Download } from 'lucide-react';
import { mockDeliveryTurns } from '@/lib/mock-data/delivery-turns';
import { productionSections } from '@/lib/mock-data/dms-production';

interface SectionDocument {
  id: string;
  title: string;
  type: 'recipe' | 'sin' | 'production' | 'consumables' | 'qc';
  pages: number;
  description: string;
}

const sectionDocs: Record<string, SectionDocument[]> = {
  'Bakery 1': [
    { id: 'bk1-1', title: 'Bakery 1 Recipe Sheet', type: 'recipe', pages: 4, description: 'All bread & loaf recipes with ingredients & quantities' },
    { id: 'bk1-2', title: 'Bakery 1 Stores Issue Note', type: 'sin', pages: 2, description: 'Aggregated raw materials for bakery 1' },
    { id: 'bk1-3', title: 'Bakery 1 Production Plan', type: 'production', pages: 3, description: 'Production targets per turn' },
    { id: 'bk1-4', title: 'Bakery 1 Consumables List', type: 'consumables', pages: 1, description: 'Packaging, gas, oil for the day' },
    { id: 'bk1-5', title: 'Bakery 1 QC Checklist', type: 'qc', pages: 1, description: 'Quality control sign-off sheet' },
  ],
  'Bakery 2': [
    { id: 'bk2-1', title: 'Bakery 2 Recipe Sheet', type: 'recipe', pages: 3, description: 'Specialty bread recipes' },
    { id: 'bk2-2', title: 'Bakery 2 Stores Issue Note', type: 'sin', pages: 2, description: 'Aggregated raw materials' },
    { id: 'bk2-3', title: 'Bakery 2 Production Plan', type: 'production', pages: 2, description: 'Targets by turn' },
    { id: 'bk2-4', title: 'Bakery 2 Consumables', type: 'consumables', pages: 1, description: 'Wrappers, oil' },
  ],
  'Filling Section': [
    { id: 'fs-1', title: 'Filling Recipe Sheet', type: 'recipe', pages: 5, description: 'Cream, jam, savory fillings' },
    { id: 'fs-2', title: 'Filling Stores Issue Note', type: 'sin', pages: 3, description: 'Raw materials' },
    { id: 'fs-3', title: 'Filling Production Plan', type: 'production', pages: 2, description: 'Daily targets' },
    { id: 'fs-4', title: 'Filling QC Checklist', type: 'qc', pages: 1, description: 'Taste & weight checks' },
  ],
  'Short-Eats 1': [
    { id: 'se1-1', title: 'Short-Eats 1 Recipe Sheet', type: 'recipe', pages: 4, description: 'Buns, fish/veg fillings' },
    { id: 'se1-2', title: 'Short-Eats 1 Stores Issue Note', type: 'sin', pages: 2, description: 'Raw materials' },
    { id: 'se1-3', title: 'Short-Eats 1 Consumables', type: 'consumables', pages: 1, description: 'Trays, paper' },
  ],
  'Short-Eats 2': [
    { id: 'se2-1', title: 'Short-Eats 2 Recipe Sheet', type: 'recipe', pages: 3, description: 'Sandwiches, rolls' },
    { id: 'se2-2', title: 'Short-Eats 2 Stores Issue Note', type: 'sin', pages: 2, description: 'Raw materials' },
    { id: 'se2-3', title: 'Short-Eats 2 Production Plan', type: 'production', pages: 1, description: 'Daily target' },
  ],
  'Rotty Section': [
    { id: 'rs-1', title: 'Rotty Recipe Sheet', type: 'recipe', pages: 2, description: 'Dough & fillings' },
    { id: 'rs-2', title: 'Rotty Stores Issue Note', type: 'sin', pages: 1, description: 'Raw materials' },
    { id: 'rs-3', title: 'Rotty Production Plan', type: 'production', pages: 1, description: 'Targets per turn' },
  ],
  'Plain Roll Section': [
    { id: 'pr-1', title: 'Plain Roll Recipe Sheet', type: 'recipe', pages: 1, description: 'Plain roll recipes' },
    { id: 'pr-2', title: 'Plain Roll Stores Issue Note', type: 'sin', pages: 1, description: 'Raw materials' },
    { id: 'pr-3', title: 'Plain Roll Production Plan', type: 'production', pages: 1, description: 'Daily target' },
  ],
  'Pastry Section': [
    { id: 'ps-1', title: 'Pastry Recipe Sheet', type: 'recipe', pages: 4, description: 'All pastry varieties' },
    { id: 'ps-2', title: 'Pastry Stores Issue Note', type: 'sin', pages: 2, description: 'Raw materials' },
    { id: 'ps-3', title: 'Pastry Production Plan', type: 'production', pages: 2, description: 'Daily targets' },
    { id: 'ps-4', title: 'Pastry QC Checklist', type: 'qc', pages: 1, description: 'Decoration & weight checks' },
  ],
};

const getDocIcon = (type: SectionDocument['type']) => {
  switch (type) {
    case 'recipe': return <ChefHat className="w-4 h-4" />;
    case 'sin': return <Package className="w-4 h-4" />;
    case 'production': return <Boxes className="w-4 h-4" />;
    case 'consumables': return <ListChecks className="w-4 h-4" />;
    case 'qc': return <ListChecks className="w-4 h-4" />;
    default: return <FileStack className="w-4 h-4" />;
  }
};

const docTypeColor: Record<SectionDocument['type'], 'primary' | 'success' | 'warning' | 'info' | 'neutral'> = {
  recipe: 'primary',
  sin: 'success',
  production: 'info',
  consumables: 'warning',
  qc: 'neutral',
};

export default function SectionPrintBundlePage() {
  const [printDate, setPrintDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTurn, setSelectedTurn] = useState<number>(1);
  const [selectedSections, setSelectedSections] = useState<string[]>(['Bakery 1', 'Short-Eats 1']);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [collate, setCollate] = useState(true);
  const [duplex, setDuplex] = useState(true);
  const [coverPage, setCoverPage] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  const allSelectedDocs = useMemo(() => {
    return selectedSections.flatMap(section =>
      (sectionDocs[section] || []).filter(d => selectedDocs.has(d.id))
    );
  }, [selectedSections, selectedDocs]);

  const totalPages = allSelectedDocs.reduce((sum, d) => sum + d.pages, 0) + (coverPage ? selectedSections.length : 0);

  const toggleSection = (section: string) => {
    setSelectedSections(prev => {
      if (prev.includes(section)) {
        const newSelectedDocs = new Set(selectedDocs);
        (sectionDocs[section] || []).forEach(d => newSelectedDocs.delete(d.id));
        setSelectedDocs(newSelectedDocs);
        return prev.filter(s => s !== section);
      }
      return [...prev, section];
    });
  };

  const toggleDoc = (docId: string) => {
    setSelectedDocs(prev => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const selectAllInSection = (section: string) => {
    const docs = sectionDocs[section] || [];
    setSelectedDocs(prev => {
      const next = new Set(prev);
      docs.forEach(d => next.add(d.id));
      return next;
    });
  };

  const handlePrintBundle = () => {
    if (allSelectedDocs.length === 0) {
      alert('Please select at least one document to print.');
      return;
    }
    alert(`Printing bundle: ${allSelectedDocs.length} documents, ${totalPages} pages total. Collate: ${collate ? 'Yes' : 'No'}, Duplex: ${duplex ? 'Yes' : 'No'}.`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Section Print Bundle</h1>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Generate consolidated print packs per production section
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="md" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Hide Preview' : 'Preview'}
          </Button>
          <Button variant="ghost" size="md">
            <Download className="w-4 h-4 mr-2" />
            Save as PDF
          </Button>
          <Button variant="primary" size="md" onClick={handlePrintBundle}>
            <Printer className="w-4 h-4 mr-2" />
            Print Bundle ({totalPages} pages)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bundle Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Production Date"
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
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Print Options
              </label>
              <div className="space-y-2 pt-1">
                <Checkbox checked={collate} onChange={(e) => setCollate(e.target.checked)} label="Collate copies" />
                <Checkbox checked={duplex} onChange={(e) => setDuplex(e.target.checked)} label="Double-sided (duplex)" />
                <Checkbox checked={coverPage} onChange={(e) => setCoverPage(e.target.checked)} label="Add section cover pages" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {productionSections.map(section => {
                const isSelected = selectedSections.includes(section);
                const docs = sectionDocs[section] || [];
                return (
                  <button
                    key={section}
                    onClick={() => toggleSection(section)}
                    className="w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left"
                    style={{
                      border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--dms-destructive-soft)' : 'var(--dms-surface)',
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{section}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{docs.length} docs available</p>
                    </div>
                    <input type="checkbox" checked={isSelected} readOnly />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-9 space-y-4">
          {selectedSections.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <FileStack className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Select one or more sections from the left to choose documents to bundle.
                </p>
              </div>
            </Card>
          ) : (
            selectedSections.map(section => {
              const docs = sectionDocs[section] || [];
              const sectionSelectedCount = docs.filter(d => selectedDocs.has(d.id)).length;
              return (
                <Card key={section}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {section}{' '}
                        <span className="text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>
                          ({sectionSelectedCount} of {docs.length} selected)
                        </span>
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => selectAllInSection(section)}>
                        Select All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {docs.map(doc => {
                        const isSelected = selectedDocs.has(doc.id);
                        return (
                          <div
                            key={doc.id}
                            className="p-3 rounded-lg cursor-pointer transition-all flex items-start gap-3"
                            style={{
                              border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border)',
                              backgroundColor: isSelected ? 'var(--dms-destructive-soft)' : 'var(--dms-surface)',
                            }}
                            onClick={() => toggleDoc(doc.id)}
                          >
                            <input type="checkbox" checked={isSelected} onChange={() => toggleDoc(doc.id)} className="mt-1" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span style={{ color: 'var(--muted-foreground)' }}>{getDocIcon(doc.type)}</span>
                                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{doc.title}</p>
                              </div>
                              <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{doc.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant={docTypeColor[doc.type]} size="sm">{doc.type.toUpperCase()}</Badge>
                                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{doc.pages} page{doc.pages !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {previewMode && allSelectedDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bundle Preview / Order</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {selectedSections.flatMap(section => {
                const docs = (sectionDocs[section] || []).filter(d => selectedDocs.has(d.id));
                if (docs.length === 0) return [];
                return [
                  ...(coverPage
                    ? [
                        <li key={`cover-${section}`} className="p-2 rounded flex items-center justify-between" style={{ backgroundColor: 'var(--dms-amber)' }}>
                          <span className="text-sm font-semibold">▌ Cover: {section}</span>
                          <span className="text-xs" style={{ color: 'var(--dms-amber-text)' }}>1 page</span>
                        </li>,
                      ]
                    : []),
                  ...docs.map((d, idx) => (
                    <li key={d.id} className="p-2 rounded flex items-center justify-between" style={{ backgroundColor: 'var(--muted)' }}>
                      <span className="text-sm">
                        <span className="text-xs mr-2" style={{ color: 'var(--muted-foreground)' }}>{section} #{idx + 1}</span>
                        {d.title}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{d.pages} page{d.pages !== 1 ? 's' : ''}</span>
                    </li>
                  )),
                ];
              })}
            </ol>
            <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Bundle Total</span>
              <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>{totalPages} pages</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
