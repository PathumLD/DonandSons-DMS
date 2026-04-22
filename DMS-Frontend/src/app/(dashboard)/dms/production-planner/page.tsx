'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Printer, ChevronDown, ChevronRight } from 'lucide-react';
import { productionSections, mockProductionItems, mockIngredientTotals, type ProductionSection } from '@/lib/mock-data/dms-production';

export default function ProductionPlannerPage() {
  const [selectedSection, setSelectedSection] = useState<ProductionSection>('Bakery 1');
  const [expandedSubTables, setExpandedSubTables] = useState<{ [key: string]: boolean }>({
    'viyana-roll': true,
    'sugar-candy-dough': false,
  });

  const sectionItems = mockProductionItems.filter(item => item.section === selectedSection);
  const sectionIngredients = mockIngredientTotals;

  const toggleSubTable = (key: string) => {
    setExpandedSubTables(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    console.log('Printing production planner for:', selectedSection);
    alert(`Printing ${selectedSection} production planner...`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Production Planner</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Section-wise production planning with ingredient calculations</p>
        </div>
        <Button variant="primary" size="md" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" />Print Section</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {productionSections.map((section) => (
          <button
            key={section}
            onClick={() => setSelectedSection(section)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: selectedSection === section ? '#C8102E' : 'white',
              color: selectedSection === section ? 'white' : '#111827',
              border: `2px solid ${selectedSection === section ? '#C8102E' : '#E5E7EB'}`,
            }}
          >
            {section}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{selectedSection} - Production Details</CardTitle>
              <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: '#6B7280' }}>
                <span>Production Start Time: <strong>03:00 AM</strong></span>
                <span>•</span>
                <span>Effective Delivery Time: <strong>05:00 AM</strong></span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Production Items */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#111827' }}>Production Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
                  <thead style={{ backgroundColor: '#F9FAFB' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#6B7280' }}>Product Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#6B7280' }}>Product Name</th>
                      <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: '#6B7280' }}>Qty Full</th>
                      <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: '#6B7280' }}>Qty Mini</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ backgroundColor: 'white', borderColor: '#E5E7EB' }}>
                    {sectionItems.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: '#6B7280' }}>{item.productCode}</td>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: '#111827' }}>{item.productName}</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold" style={{ color: '#C8102E' }}>{item.qtyFull}</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold" style={{ color: '#C8102E' }}>{item.qtyMini}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ingredient Totals */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#111827' }}>Ingredient Requirements</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
                  <thead style={{ backgroundColor: '#F9FAFB' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#6B7280' }}>Ingredient Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#6B7280' }}>Ingredient Name</th>
                      <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: '#6B7280' }}>Unit</th>
                      <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: '#6B7280' }}>Total Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ backgroundColor: 'white', borderColor: '#E5E7EB' }}>
                    {sectionIngredients.map((ingredient) => (
                      <tr key={ingredient.ingredientId}>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: '#6B7280' }}>{ingredient.ingredientCode}</td>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: '#111827' }}>{ingredient.ingredientName}</td>
                        <td className="px-4 py-3 text-center text-sm" style={{ color: '#6B7280' }}>{ingredient.unit}</td>
                        <td className="px-4 py-3 text-center text-sm font-bold" style={{ color: '#10B981' }}>{ingredient.totalQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Collapsible Sub-Tables (Example for Bakery sections) */}
            {(selectedSection === 'Bakery 1' || selectedSection === 'Bakery 2') && (
              <div className="space-y-4">
                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button
                    onClick={() => toggleSubTable('viyana-roll')}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50"
                    style={{ color: '#111827' }}
                  >
                    <span>Viyana Roll Sub-Recipe</span>
                    {expandedSubTables['viyana-roll'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['viyana-roll'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr>
                            <th className="text-left py-2 text-xs" style={{ color: '#6B7280' }}>Item</th>
                            <th className="text-center py-2 text-xs" style={{ color: '#6B7280' }}>Full Qty</th>
                            <th className="text-center py-2 text-xs" style={{ color: '#6B7280' }}>Mini Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-1" style={{ color: '#111827' }}>Viyana Roll Full</td>
                            <td className="text-center" style={{ color: '#111827' }}>45</td>
                            <td className="text-center" style={{ color: '#6B7280' }}>-</td>
                          </tr>
                          <tr>
                            <td className="py-1" style={{ color: '#111827' }}>Viyana Roll Mini</td>
                            <td className="text-center" style={{ color: '#6B7280' }}>-</td>
                            <td className="text-center" style={{ color: '#111827' }}>35</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button
                    onClick={() => toggleSubTable('sugar-candy-dough')}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50"
                    style={{ color: '#111827' }}
                  >
                    <span>Sugar Candy Bun "Dough" Sub-Recipe</span>
                    {expandedSubTables['sugar-candy-dough'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['sugar-candy-dough'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <p className="text-sm" style={{ color: '#6B7280' }}>Dough ingredients and quantities would appear here...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Summary Note for Bakery */}
            {(selectedSection === 'Bakery 1' || selectedSection === 'Bakery 2') && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}>
                <p className="text-sm font-medium mb-2" style={{ color: '#166534' }}>Summary Totals:</p>
                <ul className="text-sm space-y-1" style={{ color: '#166534' }}>
                  <li>• Plain Bun Total: 450 kg</li>
                  <li>• Yeast Total: 2,500 g</li>
                  <li>• Sugar Total: 85 kg</li>
                  <li>• Beehive Total: 65 kg (Note: Egg = Butter equivalence at 30g)</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FFD100' }}>
        <p className="text-sm font-medium mb-2" style={{ color: '#78350F' }}>Important Notes:</p>
        <ul className="text-sm space-y-1" style={{ color: '#92400E' }}>
          <li>• <strong>Production Planner</strong> shows recipe quantities ONLY (no extra quantities)</li>
          <li>• <strong>Stores Issue Note</strong> includes both recipe quantities AND extra quantities</li>
          <li>• Each section has its own Production Start Time and Effective Delivery Time</li>
          <li>• Collapsible sub-tables show detailed breakdowns for multi-recipe products</li>
        </ul>
      </div>
    </div>
  );
}
