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
    'sugar-candy-bun': false,
    'egg-wash': false,
    'summary-totals': true,
    'pattie-dough': false,
    'chinese-roll-batter': false,
    'crumb-batter': false,
    'egg-wash-patties': false,
    'sheet-counts': false,
    'rotty-egg-wrap': false,
    'rotty-vege-oil': false,
    'prawn-bun-batter': false,
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

            {/* Collapsible Sub-Tables for Bakery sections */}
            {(selectedSection === 'Bakery 1' || selectedSection === 'Bakery 2') && (
              <div className="space-y-4">
                {/* Viyana Roll Sub-table */}
                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button onClick={() => toggleSubTable('viyana-roll')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                    <span>▼ Viyana Roll Sub-Recipe (Full + Mini)</span>
                    {expandedSubTables['viyana-roll'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['viyana-roll'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <table className="min-w-full text-sm">
                        <thead><tr><th className="text-left py-2 text-xs" style={{ color: '#6B7280' }}>Item</th><th className="text-center py-2 text-xs" style={{ color: '#6B7280' }}>Full Qty</th><th className="text-center py-2 text-xs" style={{ color: '#6B7280' }}>Mini Qty</th><th className="text-center py-2 text-xs" style={{ color: '#6B7280' }}>Flour (g)</th></tr></thead>
                        <tbody>
                          <tr><td className="py-1" style={{ color: '#111827' }}>Viyana Roll Full</td><td className="text-center font-semibold" style={{ color: '#C8102E' }}>45</td><td className="text-center" style={{ color: '#6B7280' }}>-</td><td className="text-center" style={{ color: '#111827' }}>2,850</td></tr>
                          <tr><td className="py-1" style={{ color: '#111827' }}>Viyana Roll Mini</td><td className="text-center" style={{ color: '#6B7280' }}>-</td><td className="text-center font-semibold" style={{ color: '#C8102E' }}>35</td><td className="text-center" style={{ color: '#111827' }}>1,900</td></tr>
                          <tr><td className="py-1" style={{ color: '#111827' }}>Dusting Flour</td><td colSpan={2} className="text-center" style={{ color: '#6B7280' }}>-</td><td className="text-center font-semibold" style={{ color: '#C8102E' }}>1,900</td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Sugar Candy Bun Dough */}
                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button onClick={() => toggleSubTable('sugar-candy-dough')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                    <span>▼ Sugar Candy Bun "Dough" Sub-Recipe</span>
                    {expandedSubTables['sugar-candy-dough'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['sugar-candy-dough'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <table className="min-w-full text-sm"><tbody>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Flour</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>12 kg</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Sugar</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>2 kg</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Yeast</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>400 g</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Beehive</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>1.5 kg</td></tr>
                      </tbody></table>
                    </div>
                  )}
                </div>

                {/* Sugar Candy Bun "Bun" */}
                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button onClick={() => toggleSubTable('sugar-candy-bun')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                    <span>▼ Sugar Candy Bun "Bun" Sub-Recipe</span>
                    {expandedSubTables['sugar-candy-bun'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['sugar-candy-bun'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <table className="min-w-full text-sm"><tbody>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Sugar Coating</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>800 g</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Candy Filling</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>1.2 kg</td></tr>
                      </tbody></table>
                    </div>
                  )}
                </div>

                {/* Egg Wash */}
                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button onClick={() => toggleSubTable('egg-wash')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                    <span>▼ Egg Wash (Eggs × coefficient)</span>
                    {expandedSubTables['egg-wash'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['egg-wash'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <table className="min-w-full text-sm"><tbody>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Eggs</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>25 Nos</td></tr>
                        <tr><td className="py-1 text-xs italic" style={{ color: '#6B7280' }}>Coefficient: 1 egg per 10 units</td><td></td></tr>
                      </tbody></table>
                    </div>
                  )}
                </div>

                {/* Summary Totals */}
                <div className="border rounded-lg" style={{ borderColor: '#C8102E', backgroundColor: '#FEF3C4' }}>
                  <button onClick={() => toggleSubTable('summary-totals')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-left transition-colors" style={{ color: '#C8102E' }}>
                    <span>▼ Summary Totals (Plain Bun, Yeast, Sugar, Beehive, Salt, Sesame)</span>
                    {expandedSubTables['summary-totals'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['summary-totals'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#C8102E', backgroundColor: 'white' }}>
                      <table className="min-w-full text-sm"><tbody>
                        <tr><td className="py-1 font-semibold" style={{ color: '#111827' }}>Plain Bun Total</td><td className="text-right font-bold" style={{ color: '#C8102E' }}>450 kg</td></tr>
                        <tr><td className="py-1 font-semibold" style={{ color: '#111827' }}>Yeast Total</td><td className="text-right font-bold" style={{ color: '#C8102E' }}>2,500 g</td></tr>
                        <tr><td className="py-1 font-semibold" style={{ color: '#111827' }}>Sugar Total</td><td className="text-right font-bold" style={{ color: '#C8102E' }}>85 kg</td></tr>
                        <tr><td className="py-1 font-semibold" style={{ color: '#111827' }}>Beehive Total</td><td className="text-right font-bold" style={{ color: '#C8102E' }}>65 kg</td></tr>
                        <tr><td className="py-1 font-semibold" style={{ color: '#111827' }}>Salt Total</td><td className="text-right font-bold" style={{ color: '#C8102E' }}>12 kg</td></tr>
                        <tr><td className="py-1 font-semibold" style={{ color: '#111827' }}>Sesame Seeds</td><td className="text-right font-bold" style={{ color: '#C8102E' }}>800 g</td></tr>
                        <tr><td colSpan={2} className="py-2 text-xs italic border-t" style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>Note: Beehive equivalence = SUM × 30g (Egg = Butter)</td></tr>
                      </tbody></table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Short-Eats 1 Sub-Tables */}
            {selectedSection === 'Short-Eats 1' && (
              <div className="space-y-4">
                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button onClick={() => toggleSubTable('pattie-dough')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                    <span>▼ Pattie Dough Sub-table</span>
                    {expandedSubTables['pattie-dough'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['pattie-dough'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <table className="min-w-full text-sm"><tbody>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Flour</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>18 kg</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Beehive</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>4 kg</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Salt</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>300 g</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Eggs</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>12 Nos</td></tr>
                      </tbody></table>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button onClick={() => toggleSubTable('chinese-roll-batter')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                    <span>▼ Chinese Roll Batter (Base 12kg Flour)</span>
                    {expandedSubTables['chinese-roll-batter'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['chinese-roll-batter'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <table className="min-w-full text-sm"><tbody>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Flour (Base)</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>12 kg</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Salt</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>150 g</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Corn Flour</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>1.5 kg</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Eggs</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>8 Nos</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Oil</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>500 ml</td></tr>
                      </tbody></table>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button onClick={() => toggleSubTable('crumb-batter')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                    <span>▼ Crumb Batter</span>
                    {expandedSubTables['crumb-batter'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['crumb-batter'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <table className="min-w-full text-sm"><tbody>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Flour</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>5 kg</td></tr>
                      </tbody></table>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button onClick={() => toggleSubTable('egg-wash-patties')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                    <span>▼ Egg Wash for Patties</span>
                    {expandedSubTables['egg-wash-patties'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['egg-wash-patties'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <table className="min-w-full text-sm"><tbody>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Eggs</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>15 Nos</td></tr>
                      </tbody></table>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg" style={{ borderColor: '#C8102E', backgroundColor: '#FEF3C4' }}>
                  <button onClick={() => toggleSubTable('sheet-counts')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-left transition-colors" style={{ color: '#C8102E' }}>
                    <span>▼ Sheet Counts (Pastry / Pattie / Spring Roll)</span>
                    {expandedSubTables['sheet-counts'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['sheet-counts'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#C8102E', backgroundColor: 'white' }}>
                      <table className="min-w-full text-sm"><tbody>
                        <tr><td className="py-1 font-semibold" style={{ color: '#111827' }}>Pastry Sheet</td><td className="text-right font-bold" style={{ color: '#C8102E' }}>120 sheets</td></tr>
                        <tr><td className="py-1 font-semibold" style={{ color: '#111827' }}>Pattie Sheet</td><td className="text-right font-bold" style={{ color: '#C8102E' }}>95 sheets</td></tr>
                        <tr><td className="py-1 font-semibold" style={{ color: '#111827' }}>Spring Roll Sheet</td><td className="text-right font-bold" style={{ color: '#C8102E' }}>80 sheets</td></tr>
                      </tbody></table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rotty Section Sub-Tables */}
            {selectedSection === 'Rotty Section' && (
              <div className="space-y-4">
                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button onClick={() => toggleSubTable('rotty-egg-wrap')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                    <span>▼ Chicken Rotty Egg Wrap</span>
                    {expandedSubTables['rotty-egg-wrap'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['rotty-egg-wrap'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <table className="min-w-full text-sm"><tbody>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Flour</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>8 kg</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Salt</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>120 g</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Eggs</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>18 Nos</td></tr>
                      </tbody></table>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button onClick={() => toggleSubTable('rotty-vege-oil')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                    <span>▼ Vege Oil for Rotty Dough</span>
                    {expandedSubTables['rotty-vege-oil'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['rotty-vege-oil'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <table className="min-w-full text-sm"><tbody>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Vegetable Oil</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>2.5 L</td></tr>
                      </tbody></table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Plain Roll Section Sub-Tables */}
            {selectedSection === 'Plain Roll Section' && (
              <div className="space-y-4">
                <div className="border rounded-lg" style={{ borderColor: '#E5E7EB' }}>
                  <button onClick={() => toggleSubTable('prawn-bun-batter')} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                    <span>▼ Prawn Bun Batter</span>
                    {expandedSubTables['prawn-bun-batter'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSubTables['prawn-bun-batter'] && (
                    <div className="px-4 py-3 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFBEB' }}>
                      <table className="min-w-full text-sm"><tbody>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Corn Flour</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>3 kg</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Baking Powder</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>200 g</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Eggs</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>10 Nos</td></tr>
                        <tr><td className="py-1" style={{ color: '#111827' }}>Flour</td><td className="text-right font-semibold" style={{ color: '#C8102E' }}>2 kg</td></tr>
                      </tbody></table>
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
