'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ApprovalCategory {
  id: string;
  name: string;
  pendingCount: number;
  icon: any;
  enabled: boolean;
}

export default function ApprovalsPage() {
  const [categories] = useState<ApprovalCategory[]>([
    { id: 'daily-production', name: 'Daily Production', pendingCount: 0, icon: CheckCircle, enabled: true },
    { id: 'delivery', name: 'Delivery', pendingCount: 3, icon: CheckCircle, enabled: true },
    { id: 'disposal', name: 'Disposal', pendingCount: 1, icon: CheckCircle, enabled: true },
    { id: 'transfer', name: 'Transfer', pendingCount: 2, icon: CheckCircle, enabled: true },
    { id: 'stock-adjustment', name: 'Stock Adjustment', pendingCount: 0, icon: CheckCircle, enabled: true },
    { id: 'cancellation', name: 'Cancellation', pendingCount: 0, icon: CheckCircle, enabled: true },
    { id: 'delivery-return', name: 'Delivery Return', pendingCount: 0, icon: CheckCircle, enabled: true },
    { id: 'showroom-closed', name: 'Showroom Closed', pendingCount: 2, icon: CheckCircle, enabled: true },
  ]);

  const handleCategoryClick = (category: ApprovalCategory) => {
    alert(`Viewing ${category.pendingCount} pending approvals for ${category.name}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          <CheckCircle className="w-8 h-8 inline-block mr-3" style={{ color: '#C8102E' }} />
          Operation Approval
        </h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Review and approve pending operations across all enabled modules
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                style={{ border: '1px solid var(--border)' }}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="flex items-center gap-3">
                  <category.icon className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={category.pendingCount > 0 ? 'primary' : 'neutral'} 
                    size="sm"
                  >
                    Pending: {category.pendingCount}
                  </Badge>
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
