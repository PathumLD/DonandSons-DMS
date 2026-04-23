'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Plus, Edit, Clock } from 'lucide-react';
import { mockDeliveryTurns, DeliveryTurn } from '@/lib/mock-data/delivery-turns';

export default function DeliveryTurnsPage() {
  const [turns, setTurns] = useState<DeliveryTurn[]>(mockDeliveryTurns);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Delivery Turns Manager</h1>
        <p className="text-gray-600 mt-1">
          Configure delivery turn times and production schedules
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Delivery Turns</CardTitle>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Turn
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold">Turn</th>
                  <th className="text-left p-3 text-sm font-semibold">Delivery Time</th>
                  <th className="text-left p-3 text-sm font-semibold">Production Start</th>
                  <th className="text-center p-3 text-sm font-semibold">Previous Day</th>
                  <th className="text-center p-3 text-sm font-semibold">Secondary Morning</th>
                  <th className="text-center p-3 text-sm font-semibold">Status</th>
                  <th className="text-right p-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {turns.map(turn => (
                  <tr key={turn.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{turn.icon}</span>
                        <div>
                          <div className="font-medium">{turn.displayName}</div>
                          <div className="text-xs text-gray-500">{turn.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">{turn.time}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {turn.productionStartTime}
                    </td>
                    <td className="p-3 text-center">
                      {turn.isPreviousDay && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">
                          Previous Day
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {turn.isSecondaryMorning && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          Secondary
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded ${turn.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {turn.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
