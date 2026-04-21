export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  roleId: number;
  role: string;
  phone: string;
  active: boolean;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export interface Permission {
  id: number;
  module: string;
  action: string;
  description: string;
  active: boolean;
}

export const mockUsers: User[] = [
  { id: 1, username: 'admin', fullName: 'System Administrator', email: 'admin@donandson.com', roleId: 1, role: 'Admin', phone: '077-1234567', active: true },
  { id: 2, username: 'manager1', fullName: 'John Silva', email: 'john@donandson.com', roleId: 2, role: 'Manager', phone: '077-2345678', active: true },
  { id: 3, username: 'cashier1', fullName: 'Mary Fernando', email: 'mary@donandson.com', roleId: 3, role: 'Cashier', phone: '077-3456789', active: true },
  { id: 4, username: 'operator1', fullName: 'Peter Perera', email: 'peter@donandson.com', roleId: 4, role: 'Operator', phone: '077-4567890', active: true },
  { id: 5, username: 'viewer1', fullName: 'Sarah De Silva', email: 'sarah@donandson.com', roleId: 5, role: 'Viewer', phone: '077-5678901', active: true },
];

export const mockRoles: Role[] = [
  { id: 1, code: 'ADMIN', name: 'Administrator', description: 'Full system access', active: true },
  { id: 2, code: 'MANAGER', name: 'Manager', description: 'Management level access', active: true },
  { id: 3, code: 'CASHIER', name: 'Cashier', description: 'Cashier operations', active: true },
  { id: 4, code: 'OPERATOR', name: 'Operator', description: 'Operational access', active: true },
  { id: 5, code: 'VIEWER', name: 'Viewer', description: 'Read-only access', active: true },
];

export const mockPermissions: Permission[] = [
  { id: 1, module: 'Dashboard', action: 'VIEW', description: 'View dashboard', active: true },
  { id: 2, module: 'Products', action: 'CREATE', description: 'Create products', active: true },
  { id: 3, module: 'Products', action: 'EDIT', description: 'Edit products', active: true },
  { id: 4, module: 'Products', action: 'DELETE', description: 'Delete products', active: true },
  { id: 5, module: 'Products', action: 'VIEW', description: 'View products', active: true },
  { id: 6, module: 'Delivery', action: 'CREATE', description: 'Create delivery', active: true },
  { id: 7, module: 'Delivery', action: 'EDIT', description: 'Edit delivery', active: true },
  { id: 8, module: 'Delivery', action: 'APPROVE', description: 'Approve delivery', active: true },
  { id: 9, module: 'Reports', action: 'VIEW', description: 'View reports', active: true },
  { id: 10, module: 'Reports', action: 'EXPORT', description: 'Export reports', active: true },
  { id: 11, module: 'Settings', action: 'EDIT', description: 'Edit settings', active: true },
  { id: 12, module: 'Users', action: 'MANAGE', description: 'Manage users', active: true },
];
