export interface DailyProduction {
  id: number;
  productionNo: string;
  productionDate: string;
  productId: number;
  productCode: string;
  productName: string;
  plannedQty: number;
  producedQty: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  shift: 'Morning' | 'Evening' | 'Night';
  editUser: string;
  editDate: string;
}

export interface CurrentStock {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  category: string;
  currentStock: number;
  uom: string;
  reorderLevel: number;
  lastUpdated: string;
}

export interface StockAdjustment {
  id: number;
  adjustmentNo: string;
  adjustmentDate: string;
  productId: number;
  productCode: string;
  productName: string;
  adjustmentType: 'Increase' | 'Decrease';
  quantity: number;
  reason: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  editUser: string;
  approvedBy?: string;
}

export interface ProductionPlan {
  id: number;
  planNo: string;
  planDate: string;
  productId: number;
  productCode: string;
  productName: string;
  plannedQty: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Approved' | 'In Progress' | 'Completed';
  notes?: string;
}

export const mockDailyProduction: DailyProduction[] = [
  { id: 1, productionNo: 'PRD-2026-001', productionDate: '2026-04-21', productId: 1, productCode: 'BR2', productName: 'Sandwich Bread Large', plannedQty: 500, producedQty: 485, status: 'Completed', shift: 'Morning', editUser: 'prod_supervisor', editDate: '2026-04-21 14:30' },
  { id: 2, productionNo: 'PRD-2026-002', productionDate: '2026-04-21', productId: 6, productCode: 'BU12', productName: 'Fish Bun', plannedQty: 300, producedQty: 280, status: 'In Progress', shift: 'Morning', editUser: 'prod_supervisor', editDate: '2026-04-21 11:00' },
  { id: 3, productionNo: 'PRD-2026-003', productionDate: '2026-04-21', productId: 9, productCode: 'PZ8', productName: 'Chicken Pizza Large', plannedQty: 50, producedQty: 0, status: 'Planned', shift: 'Evening', editUser: 'prod_supervisor', editDate: '2026-04-21 08:00' },
];

export const mockCurrentStock: CurrentStock[] = [
  { id: 1, productId: 1, productCode: 'BR2', productName: 'Sandwich Bread Large', category: 'Bread', currentStock: 245, uom: 'Nos', reorderLevel: 100, lastUpdated: '2026-04-21 10:00' },
  { id: 2, productId: 2, productCode: 'BR9', productName: 'Kurakkan Slice Pack', category: 'Bread', currentStock: 180, uom: 'Nos', reorderLevel: 150, lastUpdated: '2026-04-21 10:00' },
  { id: 3, productId: 6, productCode: 'BU12', productName: 'Fish Bun', category: 'Bun', currentStock: 320, uom: 'Nos', reorderLevel: 200, lastUpdated: '2026-04-21 10:00' },
  { id: 4, productId: 7, productCode: 'BU15', productName: 'Chicken Bun', category: 'Bun', currentStock: 85, uom: 'Nos', reorderLevel: 150, lastUpdated: '2026-04-21 10:00' },
  { id: 5, productId: 9, productCode: 'PZ8', productName: 'Chicken Pizza Large', category: 'Pizza', currentStock: 45, uom: 'Nos', reorderLevel: 30, lastUpdated: '2026-04-21 10:00' },
];

export const mockStockAdjustments: StockAdjustment[] = [
  { id: 1, adjustmentNo: 'ADJ-2026-001', adjustmentDate: '2026-04-21', productId: 1, productCode: 'BR2', productName: 'Sandwich Bread Large', adjustmentType: 'Decrease', quantity: 15, reason: 'Damaged during transportation', status: 'Approved', editUser: 'admin', approvedBy: 'Manager' },
  { id: 2, adjustmentNo: 'ADJ-2026-002', adjustmentDate: '2026-04-21', productId: 7, productCode: 'BU15', productName: 'Chicken Bun', adjustmentType: 'Increase', quantity: 10, reason: 'Stock count correction', status: 'Pending', editUser: 'inventory_clerk', approvedBy: undefined },
  { id: 3, adjustmentNo: 'ADJ-2026-003', adjustmentDate: '2026-04-20', productId: 9, productCode: 'PZ8', productName: 'Chicken Pizza Large', adjustmentType: 'Decrease', quantity: 5, reason: 'Quality control rejection', status: 'Approved', editUser: 'qc_officer', approvedBy: 'Manager' },
];

export const mockProductionPlans: ProductionPlan[] = [
  { id: 1, planNo: 'PLAN-2026-001', planDate: '2026-04-22', productId: 1, productCode: 'BR2', productName: 'Sandwich Bread Large', plannedQty: 600, priority: 'High', status: 'Approved', notes: 'Increased demand for weekend' },
  { id: 2, planNo: 'PLAN-2026-002', planDate: '2026-04-22', productId: 6, productCode: 'BU12', productName: 'Fish Bun', plannedQty: 400, priority: 'High', status: 'Approved' },
  { id: 3, planNo: 'PLAN-2026-003', planDate: '2026-04-22', productId: 9, productCode: 'PZ8', productName: 'Chicken Pizza Large', plannedQty: 80, priority: 'Medium', status: 'Draft', notes: 'Check ingredient availability' },
];
