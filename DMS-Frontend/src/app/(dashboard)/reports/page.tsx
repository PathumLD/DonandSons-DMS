'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { FileText, Download, Printer, Calendar, Filter } from 'lucide-react';

const reportTypes = [
  { value: 'sales', label: 'Sales Report' },
  { value: 'delivery', label: 'Delivery Report' },
  { value: 'disposal', label: 'Disposal Report' },
  { value: 'inventory', label: 'Inventory Report' },
  { value: 'product', label: 'Product Wise Report' },
  { value: 'showroom', label: 'Showroom Wise Report' },
  { value: 'category', label: 'Category Wise Report' },
  { value: 'daily', label: 'Daily Summary Report' },
  { value: 'monthly', label: 'Monthly Summary Report' },
  { value: 'profit', label: 'Profit & Loss Report' },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleGenerateReport = () => {
    console.log('Generating report:', { reportType, fromDate, toDate });
    // TODO: Implement report generation
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Reports</h1>
        <p className="mt-1" style={{ color: '#6B7280' }}>
          Generate and download comprehensive business reports
        </p>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={reportTypes}
              placeholder="Select report type"
              fullWidth
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                fullWidth
              />
              <Input
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                fullWidth
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="primary" size="md" onClick={handleGenerateReport}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="secondary" size="md">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="secondary" size="md">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Today Sales', icon: FileText, color: '#C8102E' },
          { title: 'Today Deliveries', icon: FileText, color: '#10B981' },
          { title: 'Today Disposal', icon: FileText, color: '#F59E0B' },
          { title: 'Current Stock', icon: FileText, color: '#8B5CF6' },
          { title: 'Pending Orders', icon: FileText, color: '#EF4444' },
          { title: 'Monthly Summary', icon: FileText, color: '#3B82F6' },
        ].map((item, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>
                    {item.title}
                  </h3>
                  <Button variant="ghost" size="sm">
                    View Report
                  </Button>
                </div>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Sales Report - April 2026', date: '2026-04-21', size: '2.5 MB' },
              { name: 'Delivery Report - Week 16', date: '2026-04-20', size: '1.8 MB' },
              { name: 'Monthly Summary - March 2026', date: '2026-04-01', size: '3.2 MB' },
            ].map((report, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ border: '1px solid #E5E7EB' }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#FEF3C4' }}
                  >
                    <FileText className="w-5 h-5" style={{ color: '#C8102E' }} />
                  </div>
                  <div>
                    <h4 className="font-medium" style={{ color: '#111827' }}>{report.name}</h4>
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      {report.date} • {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
