'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { mockDayTypes, DayType } from '@/lib/mock-data/day-types';

export default function DayTypesPage() {
  const [dayTypes, setDayTypes] = useState<DayType[]>(mockDayTypes);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<DayType>>({});
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (dayType: DayType) => {
    setEditingId(dayType.id);
    setFormData(dayType);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      code: '',
      displayName: '',
      appliesToMorning: true,
      appliesToEvening: false,
      isExtraVariant: false,
      sortOrder: dayTypes.length + 1,
      isActive: true
    });
  };

  const handleSave = () => {
    if (isAdding) {
      const newId = Math.max(...dayTypes.map(dt => dt.id)) + 1;
      const newDayType: DayType = {
        ...formData as DayType,
        id: newId
      };
      setDayTypes([...dayTypes, newDayType]);
      setIsAdding(false);
    } else if (editingId) {
      setDayTypes(dayTypes.map(dt =>
        dt.id === editingId ? { ...dt, ...formData } : dt
      ));
      setEditingId(null);
    }
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this day-type?')) {
      setDayTypes(dayTypes.filter(dt => dt.id !== id));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Day-Type Manager</h1>
        <p className="text-gray-600 mt-1">
          Manage production day-types for morning and afternoon schedules
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Day-Types</CardTitle>
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Day-Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-sm font-semibold">Code</th>
                  <th className="text-left p-2 text-sm font-semibold">Display Name</th>
                  <th className="text-center p-2 text-sm font-semibold">Morning</th>
                  <th className="text-center p-2 text-sm font-semibold">Evening</th>
                  <th className="text-center p-2 text-sm font-semibold">Extra</th>
                  <th className="text-center p-2 text-sm font-semibold">Active</th>
                  <th className="text-center p-2 text-sm font-semibold">Sort</th>
                  <th className="text-right p-2 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <DayTypeRow
                    dayType={formData as DayType}
                    isEditing={true}
                    onFormChange={setFormData}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                )}
                {dayTypes.map(dayType => (
                  <DayTypeRow
                    key={dayType.id}
                    dayType={dayType}
                    isEditing={editingId === dayType.id}
                    formData={editingId === dayType.id ? formData : dayType}
                    onFormChange={setFormData}
                    onEdit={() => handleEdit(dayType)}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onDelete={() => handleDelete(dayType.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DayTypeRowProps {
  dayType: DayType;
  isEditing: boolean;
  formData?: Partial<DayType>;
  onFormChange?: (data: Partial<DayType>) => void;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

function DayTypeRow({
  dayType,
  isEditing,
  formData,
  onFormChange,
  onEdit,
  onSave,
  onCancel,
  onDelete
}: DayTypeRowProps) {
  const data = isEditing && formData ? formData : dayType;

  if (isEditing) {
    return (
      <tr className="border-b bg-blue-50">
        <td className="p-2">
          <input
            type="text"
            value={data.code || ''}
            onChange={(e) => onFormChange?.({ ...data, code: e.target.value })}
            className="w-full px-2 py-1 border rounded"
            placeholder="CODE"
          />
        </td>
        <td className="p-2">
          <input
            type="text"
            value={data.displayName || ''}
            onChange={(e) => onFormChange?.({ ...data, displayName: e.target.value })}
            className="w-full px-2 py-1 border rounded"
            placeholder="Display Name"
          />
        </td>
        <td className="p-2 text-center">
          <input
            type="checkbox"
            checked={data.appliesToMorning || false}
            onChange={(e) => onFormChange?.({ ...data, appliesToMorning: e.target.checked })}
            className="w-4 h-4"
          />
        </td>
        <td className="p-2 text-center">
          <input
            type="checkbox"
            checked={data.appliesToEvening || false}
            onChange={(e) => onFormChange?.({ ...data, appliesToEvening: e.target.checked })}
            className="w-4 h-4"
          />
        </td>
        <td className="p-2 text-center">
          <input
            type="checkbox"
            checked={data.isExtraVariant || false}
            onChange={(e) => onFormChange?.({ ...data, isExtraVariant: e.target.checked })}
            className="w-4 h-4"
          />
        </td>
        <td className="p-2 text-center">
          <input
            type="checkbox"
            checked={data.isActive || false}
            onChange={(e) => onFormChange?.({ ...data, isActive: e.target.checked })}
            className="w-4 h-4"
          />
        </td>
        <td className="p-2 text-center">
          <input
            type="number"
            value={data.sortOrder || 0}
            onChange={(e) => onFormChange?.({ ...data, sortOrder: parseInt(e.target.value) })}
            className="w-16 px-2 py-1 border rounded"
          />
        </td>
        <td className="p-2">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={onSave}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              title="Save"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-2 font-mono text-sm">{dayType.code}</td>
      <td className="p-2">
        <div>
          <div className="font-medium">{dayType.displayName}</div>
          {dayType.description && (
            <div className="text-xs text-gray-500">{dayType.description}</div>
          )}
        </div>
      </td>
      <td className="p-2 text-center">
        {dayType.appliesToMorning && <span className="text-green-600">✓</span>}
      </td>
      <td className="p-2 text-center">
        {dayType.appliesToEvening && <span className="text-green-600">✓</span>}
      </td>
      <td className="p-2 text-center">
        {dayType.isExtraVariant && (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded">
            Extra
          </span>
        )}
      </td>
      <td className="p-2 text-center">
        <span className={`px-2 py-0.5 text-xs rounded ${dayType.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {dayType.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="p-2 text-center text-sm text-gray-600">
        {dayType.sortOrder}
      </td>
      <td className="p-2">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onEdit}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
