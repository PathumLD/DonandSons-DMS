'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, KeyRound, ArrowRight, Lock, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

const securityCards = [
  {
    title: 'Users',
    description: 'Create, edit and deactivate user accounts. Assign roles and showroom access.',
    href: '/administrator/users',
    icon: Users,
    color: '#0EA5E9',
    bg: '#E0F2FE',
    stats: '24 users',
  },
  {
    title: 'Roles',
    description: 'Define user groups (Admin, Manager, Cashier, Production) and their default capabilities.',
    href: '/administrator/roles',
    icon: Shield,
    color: '#10B981',
    bg: '#D1FAE5',
    stats: '6 roles',
  },
  {
    title: 'Permissions',
    description: 'Fine-grained permissions per module/page. Assign to roles or override per user.',
    href: '/administrator/permissions',
    icon: KeyRound,
    color: '#8B5CF6',
    bg: '#EDE9FE',
    stats: '180 permissions',
  },
];

const recentActivity = [
  { user: 'kamal.silva@donandson.com', action: 'Logged in', time: '2 minutes ago', severity: 'info' as const, icon: Activity },
  { user: 'admin@donandson.com', action: 'Updated role "Showroom Manager"', time: '15 minutes ago', severity: 'info' as const, icon: Shield },
  { user: 'nimal.f@donandson.com', action: 'Failed login attempt (3rd in 5 min)', time: '32 minutes ago', severity: 'warning' as const, icon: AlertTriangle },
  { user: 'admin@donandson.com', action: 'Created user "rohan.w@donandson.com"', time: '1 hour ago', severity: 'success' as const, icon: CheckCircle2 },
  { user: 'sunil.p@donandson.com', action: 'Password changed', time: '3 hours ago', severity: 'info' as const, icon: KeyRound },
  { user: 'admin@donandson.com', action: 'Deactivated user "former.staff@donandson.com"', time: '1 day ago', severity: 'warning' as const, icon: Lock },
];

const severityStyle: Record<'info' | 'warning' | 'success', { color: string; bg: string }> = {
  info: { color: '#1E40AF', bg: '#EFF6FF' },
  warning: { color: '#92400E', bg: '#FEF3C4' },
  success: { color: '#166534', bg: '#F0FDF4' },
};

export default function SecurityPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Security Center</h1>
        <p className="mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Manage users, roles, capabilities and audit security events
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Active Users</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>24</p>
                <p className="text-xs mt-1" style={{ color: '#10B981' }}>+2 this week</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: '#E0F2FE' }}>
                <Users className="w-6 h-6" style={{ color: '#0EA5E9' }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Failed Logins (24h)</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>7</p>
                <p className="text-xs mt-1" style={{ color: '#F59E0B' }}>2 from 1 IP</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: '#FEF3C4' }}>
                <AlertTriangle className="w-6 h-6" style={{ color: '#F59E0B' }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Sessions Now</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>11</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>across 3 outlets</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: '#D1FAE5' }}>
                <Activity className="w-6 h-6" style={{ color: '#10B981' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Manage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {securityCards.map(card => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card hover className="h-full">
                  <CardContent>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: card.bg }}>
                        <Icon className="w-6 h-6" style={{ color: card.color }} />
                      </div>
                      <ArrowRight className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                    </div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{card.title}</h3>
                    <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>{card.description}</p>
                    <Badge variant="neutral" size="sm">{card.stats}</Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Security Activity
            </CardTitle>
            <Link href="/administrator/approvals" className="text-sm font-medium" style={{ color: '#C8102E' }}>
              View full audit log →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActivity.map((event, idx) => {
              const Icon = event.icon;
              const sev = severityStyle[event.severity];
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ border: '1px solid #F3F4F6' }}
                >
                  <div className="p-2 rounded-full flex-shrink-0" style={{ backgroundColor: sev.bg }}>
                    <Icon className="w-4 h-4" style={{ color: sev.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                      <span className="font-medium">{event.user}</span> — {event.action}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{event.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#EFF6FF', border: '1px solid #93C5FD' }}>
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 mt-0.5" style={{ color: '#1E40AF' }} />
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>Security policy reminders</p>
            <ul className="text-sm space-y-1" style={{ color: '#1E40AF' }}>
              <li>• Passwords must be at least 8 characters with one uppercase, one number and one symbol.</li>
              <li>• Sessions auto-logout after 30 minutes of inactivity (configurable in System Settings).</li>
              <li>• 5 failed login attempts within 10 minutes lock the account for 15 minutes.</li>
              <li>• Super Admin actions (role changes, user deactivation, day lock) are always logged here.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
