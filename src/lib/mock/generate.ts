// Mock data generation has been removed — every dataset below is empty until
// wired to its real backend. Pages that import these render their existing
// empty-state UI when the array is empty; see lib/api/* for live data.
import type {
  Product, Category, Brand, Seller, Customer,
  Order, Payment, Warehouse,
  InventoryItem, ReturnRequest, Coupon, Campaign, Review,
  SupportTicket, Settlement, AdminUser, AdminRole, AuditLogEntry,
  NotificationTemplate, AlertItem, RiskCase,
} from "@/lib/types";

export const CATEGORIES_DATA: Category[] = [];
export const BRANDS_DATA: Brand[] = [];
export const SELLERS_DATA: Seller[] = [];
export const PRODUCTS_DATA: Product[] = [];
export const CUSTOMERS_DATA: Customer[] = [];
export const WAREHOUSES_DATA: Warehouse[] = [];
export const ORDERS_DATA: Order[] = [];
export const PAYMENTS_DATA: Payment[] = [];
export const INVENTORY_DATA: InventoryItem[] = [];
export const RETURNS_DATA: ReturnRequest[] = [];
export const COUPONS_DATA: Coupon[] = [];
export const CAMPAIGNS_DATA: Campaign[] = [];
export const REVIEWS_DATA: Review[] = [];
export const TICKETS_DATA: SupportTicket[] = [];
export const SETTLEMENTS_DATA: Settlement[] = [];
export const ROLES_DATA: AdminRole[] = [];
export const ADMIN_USERS_DATA: AdminUser[] = [];
export const AUDIT_LOGS_DATA: AuditLogEntry[] = [];
export const NOTIFICATION_TEMPLATES_DATA: NotificationTemplate[] = [];
export const ALERTS_DATA: AlertItem[] = [];
export const RISK_CASES_DATA: RiskCase[] = [];
