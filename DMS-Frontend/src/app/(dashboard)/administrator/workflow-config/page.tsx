'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Settings, Save, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ApprovalRule {
  id: number;
  module: string;
  action: string;
  requireApproval: boolean;
  approverRole: string;
  minAmount?: number;
}

export default function WorkFlowConfigPage() {
  const [rules, setRules] = useState<ApprovalRule[]>([
    { id: 1, module: 'Delivery', action: 'Create', requireApproval: true, approverRole: 'Manager', minAmount: 10000 },
    { id: 2, module: 'Disposal', action: 'Create', requireApproval: true, approverRole: 'Manager' },
    { id: 3, module: 'Transfer', action: 'Create', requireApproval: true, approverRole: 'Manager' },
    { id: 4, module: 'Stock Adjustment', action: 'Create', requireApproval: true, approverRole: 'Manager' },
    { id: 5, module: 'Production', action: 'Cancel', requireApproval: true, approverRole: 'Production Manager' },
  ]);

  const [notifications, setNotifications] = useState({
    emailOnApproval: true,
    emailOnRejection: true,
    smsOnApproval: false,
    smsOnRejection: false,
    notifyRequester: true,
    notifyApprover: true,
  });

  const [timeouts, setTimeouts] = useState({
    approvalTimeout: '24',
    reminderInterval: '6',
    escalationTimeout: '48',
  });

  const handleToggleRule = (id: number) => {
    setRules(rules.map(r => r.id === id ? { ...r, requireApproval: !r.requireApproval } : r));
  };

  const handleSave = () => {
    console.log('Saving workflow configuration:', { rules, notifications, timeouts });
    alert('Workflow configuration saved successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Workflow Configuration</h1>
          <p className="mt-1" style={{ color: '#6B7280' }}>Configure approval workflows and automation rules</p>
        </div>
        <Button variant="primary" size="md" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />Save Configuration
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Approval Rules</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid #E5E7EB' }}>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="primary" size="sm">{rule.module}</Badge>
                    <span className="font-medium" style={{ color: '#111827' }}>{rule.action}</span>
                    {rule.requireApproval && <Badge variant="success" size="sm">Approval Required</Badge>}
                  </div>
                  {rule.requireApproval && (
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      Approver: {rule.approverRole}
                      {rule.minAmount && ` • Minimum Amount: Rs. ${rule.minAmount.toLocaleString()}`}
                    </p>
                  )}
                </div>
                <Toggle
                  checked={rule.requireApproval}
                  onChange={() => handleToggleRule(rule.id)}
                  label=""
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Toggle
                checked={notifications.emailOnApproval}
                onChange={(checked) => setNotifications({ ...notifications, emailOnApproval: checked })}
                label="Send Email on Approval"
              />
              <Toggle
                checked={notifications.emailOnRejection}
                onChange={(checked) => setNotifications({ ...notifications, emailOnRejection: checked })}
                label="Send Email on Rejection"
              />
              <Toggle
                checked={notifications.smsOnApproval}
                onChange={(checked) => setNotifications({ ...notifications, smsOnApproval: checked })}
                label="Send SMS on Approval"
              />
              <Toggle
                checked={notifications.smsOnRejection}
                onChange={(checked) => setNotifications({ ...notifications, smsOnRejection: checked })}
                label="Send SMS on Rejection"
              />
              <div className="pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                <Toggle
                  checked={notifications.notifyRequester}
                  onChange={(checked) => setNotifications({ ...notifications, notifyRequester: checked })}
                  label="Notify Requester"
                />
                <Toggle
                  checked={notifications.notifyApprover}
                  onChange={(checked) => setNotifications({ ...notifications, notifyApprover: checked })}
                  label="Notify Approver"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Timeout & Escalation</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Approval Timeout (hours)"
                type="number"
                value={timeouts.approvalTimeout}
                onChange={(e) => setTimeouts({ ...timeouts, approvalTimeout: e.target.value })}
                helperText="Auto-reject if not approved within this time"
                fullWidth
              />
              <Input
                label="Reminder Interval (hours)"
                type="number"
                value={timeouts.reminderInterval}
                onChange={(e) => setTimeouts({ ...timeouts, reminderInterval: e.target.value })}
                helperText="Send reminder notifications at this interval"
                fullWidth
              />
              <Input
                label="Escalation Timeout (hours)"
                type="number"
                value={timeouts.escalationTimeout}
                onChange={(e) => setTimeouts({ ...timeouts, escalationTimeout: e.target.value })}
                helperText="Escalate to higher authority if not approved"
                fullWidth
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Automation Rules</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ color: '#111827' }}>Auto-approve deliveries below Rs. 5,000</span>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Deliveries with total value less than Rs. 5,000 are automatically approved without manual intervention.
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ color: '#111827' }}>Auto-generate production plan from delivery history</span>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Automatically create production plans based on delivery patterns and inventory levels.
              </p>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-2" />Add Automation Rule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
