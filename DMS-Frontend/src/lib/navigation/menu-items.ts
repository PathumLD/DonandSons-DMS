import {
  LayoutDashboard,
  Package,
  Store,
  Truck,
  FileText,
  Settings,
  Factory,
  Archive,
  Tag,
  Layers,
  ClipboardList,
  Trash2,
  ArrowLeftRight,
  Archive as ArchiveIcon,
  XCircle,
  CornerUpLeft,
  Printer,
  Box,
  CalendarDays,
  DollarSign,
  Users,
  Shield,
  Lock,
  CheckSquare,
  UserCog,
  TrendingUp,
  Workflow,
  KeyRound,
  Grid,
  Calendar,
  FileBarChart,
  Zap,
  Database,
  Snowflake,
  ChefHat,
  FileStack,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  permission?: string;
  children?: MenuItem[];
  badge?: string | number;
}

/**
 * Complete navigation structure for Don & Sons DMS
 * Based on requirements document section 1.4
 */
export const navigationMenu: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Inventory',
    icon: Package,
    children: [
      {
        name: 'Products',
        href: '/inventory/products',
        icon: Package,
        permission: 'inventory.products.view',
      },
      {
        name: 'Category',
        href: '/inventory/category',
        icon: Tag,
        permission: 'inventory.category.view',
      },
      {
        name: 'Unit of Measure',
        href: '/inventory/uom',
        icon: Layers,
        permission: 'inventory.uom.view',
      },
      {
        name: 'Ingredient',
        href: '/inventory/ingredient',
        icon: Archive,
        permission: 'inventory.ingredient.view',
      },
    ],
  },
  {
    name: 'Show Room',
    href: '/showroom',
    icon: Store,
    permission: 'showroom.view',
  },
  {
    name: 'Operation',
    icon: ClipboardList,
    children: [
      {
        name: 'Delivery',
        href: '/operation/delivery',
        icon: Truck,
        permission: 'operation.delivery.view',
      },
      {
        name: 'Disposal',
        href: '/operation/disposal',
        icon: Trash2,
        permission: 'operation.disposal.view',
      },
      {
        name: 'Transfer',
        href: '/operation/transfer',
        icon: ArrowLeftRight,
        permission: 'operation.transfer.view',
      },
      {
        name: 'Stock BF',
        href: '/operation/stock-bf',
        icon: ArchiveIcon,
        permission: 'operation.stock-bf.view',
      },
      {
        name: 'Cancellation',
        href: '/operation/cancellation',
        icon: XCircle,
        permission: 'operation.cancellation.view',
      },
      {
        name: 'Delivery Return',
        href: '/operation/delivery-return',
        icon: CornerUpLeft,
        permission: 'operation.delivery-return.view',
      },
      {
        name: 'Label Printing',
        href: '/operation/label-printing',
        icon: Printer,
        permission: 'operation.label-printing.view',
      },
      {
        name: 'Showroom Open Stock',
        href: '/operation/showroom-open-stock',
        icon: Box,
        permission: 'operation.showroom-open-stock.view',
      },
      {
        name: 'Showroom Label Printing',
        href: '/operation/showroom-label-printing',
        icon: Printer,
        permission: 'operation.showroom-label-printing.view',
      },
    ],
  },
  {
    name: 'Production',
    icon: Factory,
    permission: 'production.view',
    children: [
      {
        name: 'Daily Production',
        href: '/production/daily-production',
        icon: Factory,
        permission: 'production.daily.view',
      },
      {
        name: 'Production Cancel',
        href: '/production/production-cancel',
        icon: XCircle,
        permission: 'production.cancel.view',
      },
      {
        name: 'Current Stock',
        href: '/production/current-stock',
        icon: Box,
        permission: 'production.stock.view',
      },
      {
        name: 'Stock Adjustment',
        href: '/production/stock-adjustment',
        icon: Archive,
        permission: 'production.adjustment.view',
      },
      {
        name: 'Stock Adjustment Approval',
        href: '/production/stock-adjustment-approval',
        icon: CheckSquare,
        permission: 'production.adjustment-approval.view',
      },
      {
        name: 'Production Plan',
        href: '/production/production-plan',
        icon: ClipboardList,
        permission: 'production.plan.view',
      },
    ],
  },
  {
    name: 'DMS',
    icon: Grid,
    permission: 'dms.view',
    children: [
      {
        name: 'Order Entry',
        href: '/dms/order-entry-enhanced',
        icon: Grid,
        permission: 'dms.order-entry.view',
      },
      {
        name: 'Delivery Plan',
        href: '/dms/delivery-plan',
        icon: Calendar,
        permission: 'dms.delivery-plan.view',
      },
      {
        name: 'Delivery Summary',
        href: '/dms/delivery-summary',
        icon: FileBarChart,
        permission: 'dms.delivery-summary.view',
      },
      {
        name: 'Immediate Orders',
        href: '/dms/immediate-orders',
        icon: Zap,
        permission: 'dms.immediate-orders.view',
      },
      {
        name: 'Default Quantities',
        href: '/dms/default-quantities',
        icon: Database,
        permission: 'dms.default-quantities.view',
      },
      {
        name: 'Production Planner',
        href: '/dms/production-planner-enhanced',
        icon: ChefHat,
        permission: 'dms.production-planner.view',
      },
      {
        name: 'Stores Issue Note',
        href: '/dms/stores-issue-note-enhanced',
        icon: FileText,
        permission: 'dms.stores-issue-note.view',
      },
      {
        name: 'Recipe Management',
        href: '/dms/recipe-management',
        icon: ClipboardList,
        permission: 'dms.recipe-management.view',
      },
      {
        name: 'Recipe Templates',
        href: '/dms/recipe-templates',
        icon: FileStack,
        permission: 'dms.recipe-templates.view',
      },
      {
        name: 'Freezer Stock',
        href: '/dms/freezer-stock',
        icon: Snowflake,
        permission: 'dms.freezer-stock.view',
      },
      {
        name: 'Anytime Recipe',
        href: '/dms/anytime-recipe-generator',
        icon: Zap,
        permission: 'dms.anytime-recipe.view',
      },
      {
        name: 'Patties Dough',
        href: '/dms/dough-generator/patties',
        icon: ChefHat,
        permission: 'dms.dough.view',
      },
      {
        name: 'Rotty Dough',
        href: '/dms/dough-generator/rotty',
        icon: ChefHat,
        permission: 'dms.dough.view',
      },
      {
        name: 'Pivot Dashboard',
        href: '/dms/dashboard-pivot',
        icon: FileBarChart,
        permission: 'dms.dashboard-pivot.view',
      },
      {
        name: 'Receipt Cards',
        href: '/dms/print-receipt-cards',
        icon: Printer,
        permission: 'dms.print.view',
      },
      {
        name: 'Section Print Bundle',
        href: '/dms/section-print-bundle',
        icon: Printer,
        permission: 'dms.print.view',
      },
      {
        name: 'DMS Recipe Upload',
        href: '/dms/dms-recipe-upload',
        icon: FileText,
        permission: 'dms.export.view',
      },
      {
        name: 'Reconciliation',
        href: '/dms/reconciliation',
        icon: CheckSquare,
        permission: 'dms.reconciliation.view',
      },
      {
        name: 'xlsm Importer',
        href: '/dms/importer',
        icon: Database,
        permission: 'dms.importer.view',
      },
    ],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    permission: 'reports.view',
  },
  {
    name: 'Administrator',
    icon: Settings,
    permission: 'administrator.view',
    children: [
      {
        name: 'Day-End Process',
        href: '/administrator/day-end-process',
        icon: CalendarDays,
        permission: 'administrator.day-end.view',
      },
      {
        name: 'Cashier Balance',
        href: '/administrator/cashier-balance',
        icon: DollarSign,
        permission: 'administrator.cashier-balance.view',
      },
      {
        name: 'System Settings',
        href: '/administrator/system-settings',
        icon: Settings,
        permission: 'administrator.settings.view',
      },
      {
        name: 'Label Settings',
        href: '/administrator/label-settings',
        icon: Printer,
        permission: 'administrator.label-settings.view',
      },
      {
        name: 'Delivery Plan',
        href: '/administrator/delivery-plan',
        icon: ClipboardList,
        permission: 'administrator.delivery-plan.view',
      },
      {
        name: 'Security',
        href: '/administrator/security',
        icon: Shield,
        permission: 'administrator.security.view',
      },
      {
        name: 'Users',
        href: '/administrator/users',
        icon: Users,
        permission: 'administrator.users.view',
      },
      {
        name: 'Roles',
        href: '/administrator/roles',
        icon: Shield,
        permission: 'administrator.roles.view',
      },
      {
        name: 'Permissions',
        href: '/administrator/permissions',
        icon: KeyRound,
        permission: 'administrator.permissions.view',
      },
      {
        name: 'Day Lock',
        href: '/administrator/day-lock',
        icon: Lock,
        permission: 'administrator.day-lock.view',
      },
      {
        name: 'Approvals',
        href: '/administrator/approvals',
        icon: CheckSquare,
        permission: 'administrator.approvals.view',
      },
      {
        name: 'Showroom Employee',
        href: '/administrator/showroom-employee',
        icon: UserCog,
        permission: 'administrator.showroom-employee.view',
      },
      {
        name: 'Price Manager',
        href: '/administrator/price-manager',
        icon: TrendingUp,
        permission: 'administrator.price-manager.view',
      },
      {
        name: 'WorkFlow Config',
        href: '/administrator/workflow-config',
        icon: Workflow,
        permission: 'administrator.workflow-config.view',
      },
      {
        name: 'Grid Configuration',
        href: '/administrator/grid-configuration',
        icon: Grid,
        permission: 'administrator.grid-config.view',
      },
      {
        name: 'Day-Types',
        href: '/administrator/day-types',
        icon: CalendarDays,
        permission: 'administrator.day-types.view',
      },
      {
        name: 'Delivery Turns',
        href: '/administrator/delivery-turns',
        icon: CalendarDays,
        permission: 'administrator.delivery-turns.view',
      },
      {
        name: 'Rounding Rules',
        href: '/administrator/rounding-rules',
        icon: Settings,
        permission: 'administrator.rounding.view',
      },
      {
        name: 'Section Consumables',
        href: '/administrator/section-consumables',
        icon: Archive,
        permission: 'administrator.consumables.view',
      },
      {
        name: 'Label Templates',
        href: '/administrator/label-templates',
        icon: Printer,
        permission: 'administrator.label-templates.view',
      },
    ],
  },
];

/**
 * Filter menu items based on user permissions
 */
export function filterMenuByPermissions(
  menu: MenuItem[],
  hasPermission: (permission: string) => boolean,
  isSuperAdmin: boolean
): MenuItem[] {
  return menu
    .map((item) => {
      // Check if user has permission for this item
      const hasAccess = !item.permission || isSuperAdmin || hasPermission(item.permission);
      
      if (!hasAccess) return null;

      // If item has children, filter them recursively
      if (item.children) {
        const filteredChildren = filterMenuByPermissions(item.children, hasPermission, isSuperAdmin);
        
        // If no children are accessible, don't show parent
        if (filteredChildren.length === 0) return null;
        
        return {
          ...item,
          children: filteredChildren,
        };
      }

      return item;
    })
    .filter((item): item is MenuItem => item !== null);
}
