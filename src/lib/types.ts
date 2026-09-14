// Core domain types shared across the admin portal.
// Mirrors the entities that exist (or will exist) across the three backend
// services: ProductClientService, OrderPaymentNotificationService, DeliveryInventoryService.

export type ID = string;

export type Money = number; // stored as INR rupees (not paise) at the UI layer

// ---------- Common ----------
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export type Severity = "critical" | "high" | "medium" | "low";
export type TrendDirection = "up" | "down" | "flat";

// ---------- Catalog / Product (ProductClientService) ----------
export type ProductStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "published"
  | "unpublished"
  | "out_of_stock"
  | "archived";

export interface Category {
  id: ID;
  name: string;
  slug: string;
  parentId: ID | null;
  productCount: number;
  status: "active" | "inactive";
  image?: string;
}

export interface Brand {
  id: ID;
  name: string;
  slug: string;
  logo?: string;
  productCount: number;
  status: "active" | "inactive";
}

export interface ProductVariant {
  id: ID;
  sku: string;
  attributes: Record<string, string>;
  price: Money;
  mrp: Money;
  stock: number;
}

export interface Product {
  id: ID;
  name: string;
  slug: string;
  sku: string;
  categoryId: ID;
  categoryName: string;
  brandId: ID;
  brandName: string;
  sellerId: ID;
  sellerName: string;
  image: string;
  mrp: Money;
  price: Money;
  costPrice: Money;
  discountPct: number;
  stock: number;
  minStock: number;
  status: ProductStatus;
  rating: number;
  reviewCount: number;
  gstPct: number;
  weightKg: number;
  warehouseId: ID;
  createdAt: string;
  updatedAt: string;
}

// ---------- Seller (ProductClientService) ----------
export type SellerStatus =
  | "applied"
  | "under_review"
  | "documents_pending"
  | "approved"
  | "rejected"
  | "active"
  | "suspended"
  | "deactivated";

export interface Seller {
  id: ID;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: string;
  gstNumber: string;
  city: string;
  state: string;
  status: SellerStatus;
  commissionPct: number;
  rating: number;
  totalOrders: number;
  totalRevenue: Money;
  settlementBalance: Money;
  fulfillmentRate: number;
  cancellationRate: number;
  returnRate: number;
  lateShipmentRate: number;
  slaViolations: number;
  joinedAt: string;
  kycVerified: boolean;
}

// ---------- Customer ----------
export interface Customer {
  id: ID;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpend: Money;
  avgOrderValue: Money;
  walletBalance: Money;
  lastOrderAt: string | null;
  registeredAt: string;
  status: "active" | "blocked";
  segment: "new" | "regular" | "vip" | "at_risk";
}

// ---------- Orders (OrderPaymentNotificationService) ----------
export type OrderStatus =
  | "pending_payment"
  | "initiated"
  | "confirmed"
  | "processing"
  | "packed"
  | "ready_to_ship"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "failed"
  | "returned"
  | "refunded"
  | "reversed"
  | "reverse_failed";

export interface OrderItem {
  id: ID;
  productId: ID;
  productName: string;
  sku: string;
  image: string;
  quantity: number;
  price: Money;
  discount: Money;
  tax: Money;
  sellerId: ID;
  sellerName: string;
}

export interface OrderEvent {
  label: string;
  timestamp: string;
  done: boolean;
}

export interface Order {
  id: ID;
  orderNumber: string;
  customerId: ID;
  customerName: string;
  customerPhone: string;
  sellerId: ID;
  sellerName: string;
  items: OrderItem[];
  amount: Money;
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  paymentMethod: string;
  status: OrderStatus;
  shippingAddress: string;
  billingAddress: string;
  city: string;
  state: string;
  pincode: string;
  carrier?: string;
  trackingNumber?: string;
  placedAt: string;
  deliveryEstimate: string;
  deliveredAt: string | null;
  timeline: OrderEvent[];
  source: "app" | "web" | "admin";
}

// ---------- Payments ----------
export type PaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "cancelled"
  | "disputed";

export interface Payment {
  id: ID;
  orderId: ID;
  orderNumber: string;
  customerName: string;
  amount: Money;
  method: string;
  gateway: string;
  transactionId: string;
  status: PaymentStatus;
  createdAt: string;
}

// ---------- Inventory (DeliveryInventoryService) ----------
export type WarehouseType = "STAGING" | "REGIONAL" | "LAST_MILE_DEPOT";

export interface Warehouse {
  id: ID;
  name: string;
  city: string;
  state: string;
  address: string;
  type: WarehouseType;
  status: "active" | "inactive";
  capacityMaxParcels: number;
  capacityUsed: number;
}

export interface InventoryItem {
  id: ID;
  productId: ID;
  productName: string;
  sku: string;
  sellerId: ID;
  sellerName: string;
  warehouseId: ID;
  warehouseName: string;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  damagedStock: number;
  inTransitStock: number;
  reorderLevel: number;
  updatedAt: string;
}

// ---------- Returns & Refunds ----------
export type ReturnStatus =
  | "requested"
  | "pending"
  | "approved"
  | "rejected"
  | "pickup_scheduled"
  | "picked_up"
  | "received"
  | "inspection"
  | "refund_initiated"
  | "refunded"
  | "replacement_shipped"
  | "closed";

export interface ReturnRequest {
  id: ID;
  orderId: ID;
  orderNumber: string;
  customerName: string;
  sellerName: string;
  productName: string;
  image: string;
  reason: string;
  status: ReturnStatus;
  refundAmount: Money;
  requestedAt: string;
  resolvedAt: string | null;
}

// ---------- Marketing ----------
export interface Coupon {
  id: ID;
  code: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number;
  minOrder: Money;
  maxDiscount: Money;
  usageLimit: number;
  usedCount: number;
  perCustomerLimit: number;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "expired" | "disabled";
}

export interface Campaign {
  id: ID;
  name: string;
  type: "flash_sale" | "deal" | "banner" | "email" | "sms" | "push";
  status: "draft" | "scheduled" | "active" | "ended";
  startDate: string;
  endDate: string;
  reach: number;
  conversions: number;
}

// ---------- Reviews ----------
export interface Review {
  id: ID;
  productId: ID;
  productName: string;
  sellerName: string;
  customerName: string;
  rating: number;
  title: string;
  text: string;
  images: string[];
  status: "pending" | "approved" | "rejected" | "flagged";
  createdAt: string;
}

// ---------- Support ----------
export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_customer"
  | "waiting_seller"
  | "escalated"
  | "resolved"
  | "closed";

export interface SupportTicket {
  id: ID;
  ticketNumber: string;
  subject: string;
  requesterName: string;
  requesterType: "customer" | "seller";
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: TicketStatus;
  assignedAgent: string | null;
  orderId?: ID;
  createdAt: string;
  updatedAt: string;
}

// ---------- Finance ----------
export interface Settlement {
  id: ID;
  sellerId: ID;
  sellerName: string;
  periodStart: string;
  periodEnd: string;
  grossRevenue: Money;
  commission: Money;
  shippingFee: Money;
  penalties: Money;
  refunds: Money;
  adjustments: Money;
  netPayable: Money;
  status: "pending" | "processing" | "paid" | "failed" | "on_hold";
  paidAt: string | null;
}

// ---------- Admin Users / RBAC ----------
export interface AdminRole {
  id: ID;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export interface AdminUser {
  id: ID;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin: string | null;
  twoFactorEnabled: boolean;
}

export interface AuditLogEntry {
  id: ID;
  user: string;
  role: string;
  action: string;
  module: string;
  recordId: string;
  previousValue?: string;
  newValue?: string;
  ipAddress: string;
  timestamp: string;
}

// ---------- Notifications ----------
export interface NotificationTemplate {
  id: ID;
  name: string;
  channel: "email" | "sms" | "push" | "in_app";
  event: string;
  status: "active" | "inactive";
  updatedAt: string;
}

// ---------- Alerts / Risk ----------
export interface AlertItem {
  id: ID;
  title: string;
  description: string;
  severity: Severity;
  module: string;
  createdAt: string;
  resolved: boolean;
}

export interface RiskCase {
  id: ID;
  type: string;
  entityName: string;
  entityType: "customer" | "seller" | "order";
  riskScore: "low" | "medium" | "high" | "critical";
  description: string;
  detectedAt: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
}
