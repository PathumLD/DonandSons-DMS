/**
 * Date Restriction Utilities for DMS Operations
 *
 * Per Don & Sons DMS Requirements (sections 4.i - 4.vii):
 * - Admin / Super Admin: Can see all records, can pick any date
 * - Permission-allowed users (Manager): May be granted back/future date access
 * - Other users: Restricted by operation type
 *
 * Restriction profiles:
 *  - "delivery": Today or Today+ only (no Back date for normal users)
 *  - "today-only": Today only (Disposal, Daily Production, Production Cancel)
 *  - "back-3-no-future": Back date up to 3 days, NO future date
 *    (Transfer, Stock BF, Cancellation, Delivery Return)
 *  - "label-print": No back/future for normal users (Today only); If item allows
 *    Today+, show field as Yellow
 */

export type DateRestrictionProfile =
  | 'delivery'
  | 'today-only'
  | 'back-3-no-future'
  | 'label-print'
  | 'future-only-3';

export interface UserContext {
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
  permissions?: string[];
}

const ISO = (d: Date) => d.toISOString().split('T')[0];

export function todayISO(): string {
  return ISO(new Date());
}

export function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return ISO(d);
}

export function isAdminUser(user: UserContext | null | undefined): boolean {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  if (user.isAdmin) return true;
  if (user.permissions?.includes('*')) return true;
  return false;
}

/**
 * Compute min/max date constraints for a date input based on user role and
 * operation profile. Admin (or permission-allowed) gets full freedom.
 */
export function getDateBounds(
  profile: DateRestrictionProfile,
  user: UserContext | null | undefined,
  options?: { allowBackDatePermission?: string; allowFutureDatePermission?: string }
): { min?: string; max?: string; helperText?: string } {
  const today = todayISO();
  const isAdmin = isAdminUser(user);
  const allowBack =
    isAdmin ||
    (options?.allowBackDatePermission &&
      user?.permissions?.includes(options.allowBackDatePermission));
  const allowFuture =
    isAdmin ||
    (options?.allowFutureDatePermission &&
      user?.permissions?.includes(options.allowFutureDatePermission));

  switch (profile) {
    case 'delivery':
      // Today or future for normal users
      return {
        min: allowBack ? undefined : today,
        max: allowFuture ? undefined : addDaysISO(30),
        helperText: isAdmin
          ? 'Admin: any date allowed'
          : allowBack
            ? 'Back/future date allowed (granted)'
            : 'Today or future dates only',
      };
    case 'today-only':
      return {
        min: allowBack ? undefined : today,
        max: allowFuture ? undefined : today,
        helperText: isAdmin
          ? 'Admin: any date allowed'
          : 'Only today is allowed',
      };
    case 'back-3-no-future':
      // No future date. Back date allowed up to 3 days for normal users.
      return {
        min: allowBack ? undefined : addDaysISO(-3),
        max: allowFuture ? undefined : today,
        helperText: isAdmin
          ? 'Admin: any date allowed'
          : 'Back date allowed up to 3 days. Future dates are not allowed.',
      };
    case 'label-print':
      // Default: today only for normal users
      return {
        min: allowBack ? undefined : today,
        max: allowFuture ? undefined : today,
        helperText: isAdmin
          ? 'Admin: any date allowed'
          : allowFuture
            ? 'Today or future dates allowed (granted)'
            : 'Only today is allowed',
      };
    case 'future-only-3':
      // Delivery Plan (6.vi): only future date, max 3 days ahead
      return {
        min: addDaysISO(1),
        max: addDaysISO(3),
        helperText: 'Future dates only (max 3 days ahead).',
      };
    default:
      return {};
  }
}

/**
 * Filter a list of records based on user role.
 * Admin/Super Admin: all records
 * Other users: only records they created today (or today+ for delivery)
 */
export function filterRecordsByRole<
  T extends { editUser?: string; createdBy?: string; deliveryDate?: string; transferDate?: string; date?: string }
>(
  records: T[],
  user: { username?: string; isSuperAdmin?: boolean; isAdmin?: boolean } | null | undefined,
  options?: { allowFutureForOwner?: boolean }
): T[] {
  if (!user) return [];
  if (user.isSuperAdmin || user.isAdmin) return records;

  const today = todayISO();
  return records.filter((r) => {
    const owner = r.editUser ?? r.createdBy;
    if (owner !== user.username) return false;
    const date = r.deliveryDate ?? r.transferDate ?? r.date;
    if (!date) return true;
    if (options?.allowFutureForOwner) return date >= today;
    return date === today;
  });
}
