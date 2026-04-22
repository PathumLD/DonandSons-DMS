'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Settings, Plus, Trash2, Save, GripVertical, ChevronRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalFooter } from '@/components/ui/modal';

interface GridColumn {
  id: string;
  columnKey: string;
  columnName: string;
  columnType: 'Text' | 'Number' | 'Decimal' | 'Checkbox' | 'Dropdown' | 'Custom';
  parentColumnId?: string;
  hasSubColumns: boolean;
  subColumns: GridColumn[];
  isEditable: boolean;
  isRequired: boolean;
  width?: number;
  sortOrder: number;
  dropdownValues?: string;
  showCondition?: string;
  active: boolean;
}

interface GridConfig {
  id: string;
  name: string;
  description: string;
  columns: GridColumn[];
  allowAddColumns: boolean;
  allowAddRows: boolean;
  version: number;
}

export default function GridConfigurationPage() {
  const [configurations, setConfigurations] = useState<GridConfig[]>([
    {
      id: '1',
      name: 'Order Entry Grid',
      description: 'Main order entry spreadsheet for all outlets',
      columns: [
        {
          id: 'col1',
          columnKey: 'product_yn',
          columnName: 'Y/N',
          columnType: 'Checkbox',
          hasSubColumns: false,
          subColumns: [],
          isEditable: true,
          isRequired: false,
          width: 80,
          sortOrder: 1,
          active: true,
        },
        {
          id: 'col2',
          columnKey: 'product_name',
          columnName: 'Product',
          columnType: 'Text',
          hasSubColumns: false,
          subColumns: [],
          isEditable: false,
          isRequired: true,
          width: 200,
          sortOrder: 2,
          active: true,
        },
        {
          id: 'col3',
          columnKey: 'product_code',
          columnName: 'Code',
          columnType: 'Text',
          hasSubColumns: false,
          subColumns: [],
          isEditable: false,
          isRequired: true,
          width: 100,
          sortOrder: 3,
          active: true,
        },
        {
          id: 'col4',
          columnKey: 'freezer_balance',
          columnName: 'BAL',
          columnType: 'Number',
          hasSubColumns: false,
          subColumns: [],
          isEditable: false,
          isRequired: false,
          width: 80,
          sortOrder: 4,
          active: true,
        },
        {
          id: 'col5',
          columnKey: 'section',
          columnName: 'Section',
          columnType: 'Text',
          hasSubColumns: false,
          subColumns: [],
          isEditable: false,
          isRequired: false,
          width: 120,
          sortOrder: 5,
          active: true,
        },
        {
          id: 'col6',
          columnKey: 'outlets',
          columnName: 'Outlets',
          columnType: 'Custom',
          hasSubColumns: true,
          subColumns: [
            {
              id: 'col6_1',
              columnKey: 'turn_5am',
              columnName: '5:00 AM',
              columnType: 'Custom',
              parentColumnId: 'col6',
              hasSubColumns: true,
              subColumns: [
                {
                  id: 'col6_1_1',
                  columnKey: 'turn_5am_full',
                  columnName: 'F',
                  columnType: 'Decimal',
                  parentColumnId: 'col6_1',
                  hasSubColumns: false,
                  subColumns: [],
                  isEditable: true,
                  isRequired: false,
                  width: 60,
                  sortOrder: 1,
                  active: true,
                },
                {
                  id: 'col6_1_2',
                  columnKey: 'turn_5am_mini',
                  columnName: 'M',
                  columnType: 'Decimal',
                  parentColumnId: 'col6_1',
                  hasSubColumns: false,
                  subColumns: [],
                  isEditable: true,
                  isRequired: false,
                  width: 60,
                  sortOrder: 2,
                  active: true,
                },
              ],
              isEditable: false,
              isRequired: false,
              sortOrder: 1,
              active: true,
            },
            {
              id: 'col6_2',
              columnKey: 'turn_1030am',
              columnName: '10:30 AM',
              columnType: 'Custom',
              parentColumnId: 'col6',
              hasSubColumns: true,
              subColumns: [
                {
                  id: 'col6_2_1',
                  columnKey: 'turn_1030am_full',
                  columnName: 'F',
                  columnType: 'Decimal',
                  parentColumnId: 'col6_2',
                  hasSubColumns: false,
                  subColumns: [],
                  isEditable: true,
                  isRequired: false,
                  width: 60,
                  sortOrder: 1,
                  showCondition: 'product.hasMultiTurn === true',
                  active: true,
                },
                {
                  id: 'col6_2_2',
                  columnKey: 'turn_1030am_mini',
                  columnName: 'M',
                  columnType: 'Decimal',
                  parentColumnId: 'col6_2',
                  hasSubColumns: false,
                  subColumns: [],
                  isEditable: true,
                  isRequired: false,
                  width: 60,
                  sortOrder: 2,
                  showCondition: 'product.hasMultiTurn === true',
                  active: true,
                },
              ],
              isEditable: false,
              isRequired: false,
              sortOrder: 2,
              showCondition: 'product.hasMultiTurn === true',
              active: true,
            },
          ],
          isEditable: false,
          isRequired: false,
          sortOrder: 6,
          active: true,
        },
      ],
      allowAddColumns: true,
      allowAddRows: true,
      version: 1,
    },
  ]);

  const [selectedConfig, setSelectedConfig] = useState<GridConfig | null>(configurations[0]);
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set(['col6']));
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [showAddTurnModal, setShowAddTurnModal] = useState(false);
  const [newColumn, setNewColumn] = useState<Partial<GridColumn>>({
    columnType: 'Text',
    isEditable: true,
    isRequired: false,
    active: true,
    hasSubColumns: false,
    subColumns: [],
    sortOrder: 1,
  });

  const [newTurn, setNewTurn] = useState({
    name: '',
    time: '',
  });

  const toggleExpand = (columnId: string) => {
    const newExpanded = new Set(expandedColumns);
    if (newExpanded.has(columnId)) {
      newExpanded.delete(columnId);
    } else {
      newExpanded.add(columnId);
    }
    setExpandedColumns(newExpanded);
  };

  const handleAddColumn = () => {
    if (!selectedConfig || !newColumn.columnName || !newColumn.columnKey) return;

    const column: GridColumn = {
      id: `col_${Date.now()}`,
      columnKey: newColumn.columnKey || '',
      columnName: newColumn.columnName || '',
      columnType: newColumn.columnType || 'Text',
      hasSubColumns: newColumn.hasSubColumns || false,
      subColumns: [],
      isEditable: newColumn.isEditable !== false,
      isRequired: newColumn.isRequired || false,
      width: newColumn.width,
      sortOrder: selectedConfig.columns.length + 1,
      dropdownValues: newColumn.dropdownValues,
      showCondition: newColumn.showCondition,
      active: true,
    };

    const updatedConfig = {
      ...selectedConfig,
      columns: [...selectedConfig.columns, column],
    };

    setConfigurations((prev) =>
      prev.map((config) => (config.id === selectedConfig.id ? updatedConfig : config))
    );
    setSelectedConfig(updatedConfig);
    setShowAddColumnModal(false);
    setNewColumn({
      columnType: 'Text',
      isEditable: true,
      isRequired: false,
      active: true,
      hasSubColumns: false,
      subColumns: [],
      sortOrder: 1,
    });
  };

  const handleAddTurn = () => {
    if (!selectedConfig || !newTurn.name || !newTurn.time) return;

    const outletsColumn = selectedConfig.columns.find((col) => col.columnKey === 'outlets');
    if (!outletsColumn) return;

    const newTurnColumn: GridColumn = {
      id: `turn_${Date.now()}`,
      columnKey: `turn_${newTurn.time.replace(':', '')}`,
      columnName: newTurn.name,
      columnType: 'Custom',
      parentColumnId: 'col6',
      hasSubColumns: true,
      subColumns: [
        {
          id: `turn_${Date.now()}_1`,
          columnKey: `turn_${newTurn.time.replace(':', '')}_full`,
          columnName: 'F',
          columnType: 'Decimal',
          hasSubColumns: false,
          subColumns: [],
          isEditable: true,
          isRequired: false,
          width: 60,
          sortOrder: 1,
          active: true,
          parentColumnId: `turn_${Date.now()}`,
        },
        {
          id: `turn_${Date.now()}_2`,
          columnKey: `turn_${newTurn.time.replace(':', '')}_mini`,
          columnName: 'M',
          columnType: 'Decimal',
          hasSubColumns: false,
          subColumns: [],
          isEditable: true,
          isRequired: false,
          width: 60,
          sortOrder: 2,
          active: true,
          parentColumnId: `turn_${Date.now()}`,
        },
      ],
      isEditable: false,
      isRequired: false,
      sortOrder: outletsColumn.subColumns.length + 1,
      active: true,
    };

    const updatedOutletsColumn = {
      ...outletsColumn,
      subColumns: [...outletsColumn.subColumns, newTurnColumn],
    };

    const updatedConfig = {
      ...selectedConfig,
      columns: selectedConfig.columns.map((col) =>
        col.columnKey === 'outlets' ? updatedOutletsColumn : col
      ),
    };

    setConfigurations((prev) =>
      prev.map((config) => (config.id === selectedConfig.id ? updatedConfig : config))
    );
    setSelectedConfig(updatedConfig);
    setShowAddTurnModal(false);
    setNewTurn({ name: '', time: '' });
  };

  const handleDeleteColumn = (columnId: string) => {
    if (!selectedConfig) return;

    const updatedConfig = {
      ...selectedConfig,
      columns: selectedConfig.columns.filter((col) => col.id !== columnId),
    };

    setConfigurations((prev) =>
      prev.map((config) => (config.id === selectedConfig.id ? updatedConfig : config))
    );
    setSelectedConfig(updatedConfig);
  };

  const renderColumnRow = (column: GridColumn, level: number = 0) => {
    const isExpanded = expandedColumns.has(column.id);
    const indent = level * 24;

    return (
      <div key={column.id}>
        <div
          className="flex items-center justify-between p-3 border-b hover:bg-gray-50"
          style={{ borderColor: '#E5E7EB', paddingLeft: `${12 + indent}px` }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {column.hasSubColumns && (
              <button
                onClick={() => toggleExpand(column.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            {!column.hasSubColumns && <div className="w-6"></div>}

            <GripVertical className="w-4 h-4" style={{ color: '#9CA3AF' }} />

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium" style={{ color: '#111827' }}>
                  {column.columnName}
                </span>
                <Badge variant="secondary">{column.columnType}</Badge>
                {column.isRequired && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                Key: {column.columnKey}
                {column.width && ` • Width: ${column.width}px`}
                {column.showCondition && ` • Condition: ${column.showCondition}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteColumn(column.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isExpanded &&
          column.subColumns.map((subCol) => renderColumnRow(subCol, level + 1))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>
            Grid Configuration
          </h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>
            Customize grid structure like Excel - Add columns, rows, sub-columns dynamically
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="md">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="primary" size="md">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: '#EFF6FF', border: '1px solid #93C5FD' }}
      >
        <div className="flex items-start space-x-3">
          <Settings className="w-5 h-5 mt-0.5" style={{ color: '#1E40AF' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#1E40AF' }}>
              Dynamic Grid Configuration
            </p>
            <p className="text-xs mt-1" style={{ color: '#1E40AF' }}>
              Admin can add/remove columns, sub-columns, delivery turns, and sections just like
              modifying an Excel sheet. All changes are applied dynamically to the grid without
              code changes.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Grid to Configure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {configurations.map((config) => (
              <div
                key={config.id}
                onClick={() => setSelectedConfig(config)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedConfig?.id === config.id
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold" style={{ color: '#111827' }}>
                  {config.name}
                </h3>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  {config.description}
                </p>
                <div className="flex items-center space-x-2 mt-3">
                  <Badge variant="secondary">{config.columns.length} columns</Badge>
                  <Badge variant="secondary">v{config.version}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Column Configuration */}
      {selectedConfig && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Column Structure - {selectedConfig.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddTurnModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Delivery Turn
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddColumnModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Column
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t" style={{ borderColor: '#E5E7EB' }}>
              {selectedConfig.columns.map((column) => renderColumnRow(column))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Column Modal */}
      {showAddColumnModal && (
        <Modal
          isOpen={showAddColumnModal}
          onClose={() => setShowAddColumnModal(false)}
          title="Add New Column"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                Column Name
              </label>
              <Input
                value={newColumn.columnName || ''}
                onChange={(e) =>
                  setNewColumn({ ...newColumn, columnName: e.target.value })
                }
                placeholder="e.g., Delivery Zone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                Column Key (Unique)
              </label>
              <Input
                value={newColumn.columnKey || ''}
                onChange={(e) =>
                  setNewColumn({ ...newColumn, columnKey: e.target.value })
                }
                placeholder="e.g., delivery_zone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                Column Type
              </label>
              <Select
                value={newColumn.columnType || 'Text'}
                onChange={(e) =>
                  setNewColumn({
                    ...newColumn,
                    columnType: e.target.value as GridColumn['columnType'],
                  })
                }
                options={[
                  { value: 'Text', label: 'Text' },
                  { value: 'Number', label: 'Number' },
                  { value: 'Decimal', label: 'Decimal' },
                  { value: 'Checkbox', label: 'Checkbox' },
                  { value: 'Dropdown', label: 'Dropdown' },
                  { value: 'Custom', label: 'Custom' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                Width (pixels)
              </label>
              <Input
                type="number"
                value={newColumn.width || ''}
                onChange={(e) =>
                  setNewColumn({ ...newColumn, width: parseInt(e.target.value) || undefined })
                }
                placeholder="e.g., 120"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newColumn.isEditable !== false}
                  onChange={(e) =>
                    setNewColumn({ ...newColumn, isEditable: e.target.checked })
                  }
                />
                <span className="text-sm" style={{ color: '#374151' }}>
                  Editable
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newColumn.isRequired || false}
                  onChange={(e) =>
                    setNewColumn({ ...newColumn, isRequired: e.target.checked })
                  }
                />
                <span className="text-sm" style={{ color: '#374151' }}>
                  Required
                </span>
              </label>
            </div>
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowAddColumnModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddColumn}>
              Add Column
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Add Turn Modal */}
      {showAddTurnModal && (
        <Modal
          isOpen={showAddTurnModal}
          onClose={() => setShowAddTurnModal(false)}
          title="Add New Delivery Turn"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                Turn Name
              </label>
              <Input
                value={newTurn.name}
                onChange={(e) => setNewTurn({ ...newTurn, name: e.target.value })}
                placeholder="e.g., 6:00 PM Turn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                Turn Time
              </label>
              <Input
                type="time"
                value={newTurn.time}
                onChange={(e) => setNewTurn({ ...newTurn, time: e.target.value })}
              />
            </div>
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowAddTurnModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddTurn}>
              Add Delivery Turn
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Legend */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}
      >
        <p className="text-sm" style={{ color: '#166534' }}>
          <strong>Features:</strong> Add/remove columns dynamically • Create sub-columns for
          hierarchical structure • Add new delivery turns • Configure column types, widths,
          validation • Set conditional display rules • All changes apply immediately to the grid
        </p>
      </div>
    </div>
  );
}
