import type {
  Product, ProductStatus, Category, Brand, Seller, SellerStatus, Customer,
  Order, OrderItem, OrderStatus, OrderEvent, Payment, PaymentStatus, Warehouse,
  InventoryItem, ReturnRequest, ReturnStatus, Coupon, Campaign, Review,
  SupportTicket, TicketStatus, Settlement, AdminUser, AdminRole, AuditLogEntry,
  NotificationTemplate, AlertItem, RiskCase,
} from "@/lib/types";
import {
  INDIAN_CITIES, FIRST_NAMES, LAST_NAMES, CATEGORIES, BRANDS, PRODUCT_NOUNS,
  PAYMENT_METHODS, GATEWAYS, CARRIERS, RETURN_REASONS, BUSINESS_TYPES,
} from "./reference";
import { rand, pick, pickMany, randInt, randFloat, randBool, daysAgo, futureDays, makeId, resetSeed } from "./seed";

function personName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}
function phone() {
  return `9${String(randInt(100000000, 999999999))}`;
}
function loc() {
  return pick(INDIAN_CITIES);
}
function img(seedKey: string, w = 400, h = 400) {
  return `https://picsum.photos/seed/${seedKey}/${w}/${h}`;
}

// ---------------- Catalog ----------------
resetSeed(1);
export const CATEGORIES_DATA: Category[] = CATEGORIES.map((name, i) => ({
  id: makeId("CAT", i + 1),
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  parentId: null,
  productCount: randInt(20, 400),
  status: randBool(0.9) ? "active" : "inactive",
  image: img(`cat-${i}`, 200, 200),
}));

export const BRANDS_DATA: Brand[] = BRANDS.map((name, i) => ({
  id: makeId("BR", i + 1),
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  logo: img(`brand-${i}`, 100, 100),
  productCount: randInt(5, 120),
  status: randBool(0.95) ? "active" : "inactive",
}));

// ---------------- Sellers ----------------
const SELLER_STATUSES: SellerStatus[] = [
  "applied", "under_review", "documents_pending", "approved", "rejected",
  "active", "active", "active", "active", "suspended",
];

export const SELLERS_DATA: Seller[] = Array.from({ length: 45 }, (_, i) => {
  const { city, state } = loc();
  const status = pick(SELLER_STATUSES);
  return {
    id: makeId("SEL", i + 1),
    storeName: `${pick(["Metro", "Prime", "Urban", "Royal", "Elite", "Star", "Global", "Sunrise", "Classic", "Nova"])} ${pick(["Traders", "Retail", "Mart", "Bazaar", "Enterprises", "Emporium", "Store"])}`,
    ownerName: personName(),
    email: `seller${i + 1}@marketplace.example`,
    phone: phone(),
    businessType: pick(BUSINESS_TYPES),
    gstNumber: `${randInt(10, 37)}ABCDE${randInt(1000, 9999)}F1Z${randInt(1, 9)}`,
    city,
    state,
    status,
    commissionPct: randInt(5, 20),
    rating: randFloat(3, 5, 1),
    totalOrders: randInt(0, 5000),
    totalRevenue: randInt(0, 5_000_000),
    settlementBalance: randInt(-20000, 400000),
    fulfillmentRate: randFloat(80, 100, 1),
    cancellationRate: randFloat(0, 12, 1),
    returnRate: randFloat(0, 15, 1),
    lateShipmentRate: randFloat(0, 10, 1),
    slaViolations: randInt(0, 25),
    joinedAt: daysAgo(randInt(10, 900)),
    kycVerified: status === "active" || status === "approved" ? true : randBool(0.3),
  };
});

// ---------------- Products ----------------
const PRODUCT_STATUSES: ProductStatus[] = [
  "published", "published", "published", "published", "pending_approval",
  "draft", "approved", "rejected", "out_of_stock", "archived", "unpublished",
];

export const PRODUCTS_DATA: Product[] = Array.from({ length: 140 }, (_, i) => {
  const cat = pick(CATEGORIES_DATA);
  const brand = pick(BRANDS_DATA);
  const seller = pick(SELLERS_DATA);
  const mrp = randInt(299, 89999);
  const discountPct = randInt(0, 40);
  const price = Math.round(mrp * (1 - discountPct / 100));
  const status = pick(PRODUCT_STATUSES);
  const name = `${brand.name} ${pick(PRODUCT_NOUNS)}`;
  return {
    id: makeId("PRD", i + 1),
    name,
    slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i + 1}`,
    sku: `SKU${randInt(100000, 999999)}`,
    categoryId: cat.id,
    categoryName: cat.name,
    brandId: brand.id,
    brandName: brand.name,
    sellerId: seller.id,
    sellerName: seller.storeName,
    image: img(`product-${i}`),
    mrp,
    price,
    costPrice: Math.round(price * 0.75),
    discountPct,
    stock: status === "out_of_stock" ? 0 : randInt(0, 500),
    minStock: randInt(5, 30),
    status,
    rating: randFloat(2.5, 5, 1),
    reviewCount: randInt(0, 2400),
    gstPct: pick([0, 5, 12, 18, 28]),
    weightKg: randFloat(0.1, 25, 2),
    warehouseId: makeId("WH", randInt(1, 8)),
    createdAt: daysAgo(randInt(1, 500)),
    updatedAt: daysAgo(randInt(0, 30)),
  };
});

// ---------------- Customers ----------------
const SEGMENTS: Customer["segment"][] = ["new", "regular", "regular", "vip", "at_risk"];
export const CUSTOMERS_DATA: Customer[] = Array.from({ length: 220 }, (_, i) => {
  const { city, state } = loc();
  const totalOrders = randInt(0, 120);
  const totalSpend = totalOrders * randInt(400, 4000);
  return {
    id: makeId("CUST", i + 1),
    name: personName(),
    email: `customer${i + 1}@example.com`,
    phone: phone(),
    city,
    state,
    totalOrders,
    totalSpend,
    avgOrderValue: totalOrders ? Math.round(totalSpend / totalOrders) : 0,
    walletBalance: randInt(0, 5000),
    lastOrderAt: totalOrders ? daysAgo(randInt(0, 180)) : null,
    registeredAt: daysAgo(randInt(5, 1000)),
    status: randBool(0.96) ? "active" : "blocked",
    segment: pick(SEGMENTS),
  };
});

// ---------------- Warehouses ----------------
export const WAREHOUSES_DATA: Warehouse[] = Array.from({ length: 8 }, (_, i) => {
  const { city, state } = INDIAN_CITIES[i % INDIAN_CITIES.length];
  return {
    id: makeId("WH", i + 1),
    name: `${city} ${pick(["Fulfillment Center", "Regional Hub", "Depot"])}`,
    city,
    state,
    address: `Plot ${randInt(1, 200)}, Industrial Area, ${city}`,
    type: pick(["STAGING", "REGIONAL", "LAST_MILE_DEPOT"]),
    status: "active",
    capacityMaxParcels: randInt(5000, 50000),
    capacityUsed: randInt(1000, 40000),
  };
});

// ---------------- Orders ----------------
const ORDER_STATUSES: OrderStatus[] = [
  "pending_payment", "confirmed", "processing", "packed", "ready_to_ship",
  "shipped", "out_for_delivery", "delivered", "delivered", "delivered",
  "delivered", "cancelled", "failed", "returned", "refunded",
];

function buildTimeline(status: OrderStatus, placedAt: string): OrderEvent[] {
  const steps = ["Order placed", "Payment confirmed", "Seller accepted", "Packed", "Shipped", "Out for delivery", "Delivered"];
  const doneIdx = {
    pending_payment: 0, initiated: 0, confirmed: 1, processing: 2, packed: 3, ready_to_ship: 3,
    shipped: 4, out_for_delivery: 5, delivered: 6, cancelled: 2, failed: 1,
    returned: 6, refunded: 6, reversed: 6, reverse_failed: 6,
  }[status];
  return steps.map((label, i) => ({
    label,
    timestamp: i <= doneIdx ? daysAgo(randInt(0, 10) + (steps.length - i)) : "",
    done: i <= doneIdx,
  }));
}

export const ORDERS_DATA: Order[] = Array.from({ length: 380 }, (_, i) => {
  const customer = pick(CUSTOMERS_DATA);
  const seller = pick(SELLERS_DATA);
  const { city, state } = loc();
  const status = pick(ORDER_STATUSES);
  const itemCount = randInt(1, 4);
  const items: OrderItem[] = Array.from({ length: itemCount }, (_, j) => {
    const p = pick(PRODUCTS_DATA);
    const qty = randInt(1, 3);
    return {
      id: `${makeId("ORD", i + 1)}-ITEM-${j + 1}`,
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      image: p.image,
      quantity: qty,
      price: p.price,
      discount: Math.round(p.price * 0.05),
      tax: Math.round(p.price * p.gstPct / 100),
      sellerId: seller.id,
      sellerName: seller.storeName,
    };
  });
  const amount = items.reduce((s, it) => s + it.price * it.quantity - it.discount + it.tax, 0);
  const placedAt = daysAgo(randInt(0, 120));
  return {
    id: makeId("ORD", i + 1),
    orderNumber: `MP${100000 + i}`,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    sellerId: seller.id,
    sellerName: seller.storeName,
    items,
    amount,
    paymentStatus: status === "refunded" ? "refunded" : status === "failed" ? "failed" : status === "pending_payment" ? "pending" : "paid",
    paymentMethod: pick(PAYMENT_METHODS),
    status,
    shippingAddress: `${randInt(1, 999)}, ${pick(["MG Road", "Park Street", "Ring Road", "Station Road", "Church Street"])}, ${city}, ${state} - ${randInt(100000, 699999)}`,
    billingAddress: `${randInt(1, 999)}, ${pick(["MG Road", "Park Street", "Ring Road"])}, ${city}, ${state}`,
    city,
    state,
    pincode: String(randInt(100000, 699999)),
    carrier: pick(CARRIERS),
    trackingNumber: `TRK${randInt(1000000, 9999999)}`,
    placedAt,
    deliveryEstimate: futureDays(randInt(1, 7)),
    deliveredAt: status === "delivered" ? daysAgo(randInt(0, 30)) : null,
    timeline: buildTimeline(status, placedAt),
    source: pick(["app", "app", "web", "admin"]),
  };
});

// ---------------- Payments ----------------
const PAYMENT_STATUSES: PaymentStatus[] = [
  "captured", "captured", "captured", "captured", "pending", "failed",
  "refunded", "partially_refunded", "disputed", "cancelled",
];
export const PAYMENTS_DATA: Payment[] = ORDERS_DATA.map((o, i) => ({
  id: makeId("PAY", i + 1),
  orderId: o.id,
  orderNumber: o.orderNumber,
  customerName: o.customerName,
  amount: o.amount,
  method: o.paymentMethod,
  gateway: pick(GATEWAYS),
  transactionId: `TXN${randInt(100000000, 999999999)}`,
  status: o.paymentStatus === "paid" ? "captured" : o.paymentStatus === "refunded" ? "refunded" : o.paymentStatus === "failed" ? "failed" : pick(PAYMENT_STATUSES),
  createdAt: o.placedAt,
}));

// ---------------- Inventory ----------------
export const INVENTORY_DATA: InventoryItem[] = PRODUCTS_DATA.map((p, i) => {
  const physical = p.stock + randInt(0, 30);
  const reserved = randInt(0, Math.min(20, physical));
  return {
    id: makeId("INV", i + 1),
    productId: p.id,
    productName: p.name,
    sku: p.sku,
    sellerId: p.sellerId,
    sellerName: p.sellerName,
    warehouseId: p.warehouseId,
    warehouseName: WAREHOUSES_DATA.find((w) => w.id === p.warehouseId)?.name ?? "Unassigned",
    physicalStock: physical,
    reservedStock: reserved,
    availableStock: physical - reserved,
    damagedStock: randInt(0, 5),
    inTransitStock: randInt(0, 40),
    reorderLevel: p.minStock,
    updatedAt: daysAgo(randInt(0, 15)),
  };
});

// ---------------- Returns ----------------
const RETURN_STATUSES: ReturnStatus[] = [
  "requested", "approved", "rejected", "pickup_scheduled", "picked_up",
  "received", "inspection", "refund_initiated", "refunded", "closed",
];
export const RETURNS_DATA: ReturnRequest[] = Array.from({ length: 70 }, (_, i) => {
  const order = pick(ORDERS_DATA);
  const item = pick(order.items);
  const status = pick(RETURN_STATUSES);
  return {
    id: makeId("RET", i + 1),
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    sellerName: item.sellerName,
    productName: item.productName,
    image: item.image,
    reason: pick(RETURN_REASONS),
    status,
    refundAmount: item.price,
    requestedAt: daysAgo(randInt(0, 60)),
    resolvedAt: ["refunded", "closed", "rejected"].includes(status) ? daysAgo(randInt(0, 20)) : null,
  };
});

// ---------------- Marketing ----------------
export const COUPONS_DATA: Coupon[] = Array.from({ length: 24 }, (_, i) => {
  const start = randInt(-60, 10);
  return {
    id: makeId("CPN", i + 1),
    code: `${pick(["SAVE", "FLAT", "WELCOME", "FEST", "MEGA", "SUPER"])}${randInt(10, 500)}`,
    discountType: pick(["percentage", "fixed", "free_shipping"]),
    discountValue: randInt(5, 50),
    minOrder: randInt(199, 1999),
    maxDiscount: randInt(100, 2000),
    usageLimit: randInt(100, 10000),
    usedCount: randInt(0, 5000),
    perCustomerLimit: randInt(1, 3),
    startDate: daysAgo(-start),
    endDate: futureDays(randInt(1, 60)),
    status: pick(["active", "active", "scheduled", "expired", "disabled"]),
  };
});

export const CAMPAIGNS_DATA: Campaign[] = Array.from({ length: 18 }, (_, i) => ({
  id: makeId("CMP", i + 1),
  name: `${pick(["Diwali", "Republic Day", "End of Season", "Monsoon", "Summer", "New Year", "Independence Day"])} ${pick(["Sale", "Bonanza", "Blowout", "Fest"])}`,
  type: pick(["flash_sale", "deal", "banner", "email", "sms", "push"]),
  status: pick(["draft", "scheduled", "active", "ended"]),
  startDate: daysAgo(randInt(-30, 30)),
  endDate: futureDays(randInt(1, 30)),
  reach: randInt(1000, 500000),
  conversions: randInt(50, 20000),
}));

// ---------------- Reviews ----------------
const REVIEW_TITLES = ["Great product!", "Value for money", "Not as expected", "Excellent quality", "Average", "Highly recommend", "Poor packaging", "Fast delivery, good product"];
export const REVIEWS_DATA: Review[] = Array.from({ length: 90 }, (_, i) => {
  const p = pick(PRODUCTS_DATA);
  return {
    id: makeId("REV", i + 1),
    productId: p.id,
    productName: p.name,
    sellerName: p.sellerName,
    customerName: personName(),
    rating: randInt(1, 5),
    title: pick(REVIEW_TITLES),
    text: "The product matches the description and arrived on time. Packaging was decent and quality feels good for the price.",
    images: randBool(0.3) ? [img(`review-${i}`, 300, 300)] : [],
    status: pick(["pending", "approved", "approved", "approved", "rejected", "flagged"]),
    createdAt: daysAgo(randInt(0, 200)),
  };
});

// ---------------- Support ----------------
const TICKET_STATUSES: TicketStatus[] = [
  "open", "in_progress", "waiting_customer", "waiting_seller", "escalated", "resolved", "closed",
];
const TICKET_CATEGORIES = ["Order Issue", "Payment Issue", "Refund Delay", "Product Quality", "Delivery Delay", "Account Issue", "Seller Complaint"];
const AGENTS = ["Ritu Sharma", "Karan Mehta", "Sneha Iyer", "Vikas Rao", "Ayesha Khan", null];
export const TICKETS_DATA: SupportTicket[] = Array.from({ length: 60 }, (_, i) => {
  const isOrderTicket = randBool(0.7);
  const order = isOrderTicket ? pick(ORDERS_DATA) : null;
  return {
    id: makeId("TKT", i + 1),
    ticketNumber: `TCK-${20000 + i}`,
    subject: `${pick(TICKET_CATEGORIES)} - ${order?.orderNumber ?? "General"}`,
    requesterName: personName(),
    requesterType: pick(["customer", "customer", "customer", "seller"]),
    category: pick(TICKET_CATEGORIES),
    priority: pick(["low", "medium", "high", "urgent"]),
    status: pick(TICKET_STATUSES),
    assignedAgent: pick(AGENTS),
    orderId: order?.id,
    createdAt: daysAgo(randInt(0, 90)),
    updatedAt: daysAgo(randInt(0, 10)),
  };
});

// ---------------- Finance / Settlements ----------------
export const SETTLEMENTS_DATA: Settlement[] = SELLERS_DATA.flatMap((seller, si) =>
  Array.from({ length: 3 }, (_, pi) => {
    const gross = randInt(20000, 800000);
    const commission = Math.round(gross * seller.commissionPct / 100);
    const shippingFee = Math.round(gross * 0.03);
    const penalties = randInt(0, 3000);
    const refunds = randInt(0, 15000);
    const adjustments = randInt(-2000, 2000);
    return {
      id: makeId("STL", si * 3 + pi + 1),
      sellerId: seller.id,
      sellerName: seller.storeName,
      periodStart: daysAgo((pi + 1) * 14 + 7),
      periodEnd: daysAgo(pi * 14 + 7),
      grossRevenue: gross,
      commission,
      shippingFee,
      penalties,
      refunds,
      adjustments,
      netPayable: gross - commission - shippingFee - penalties - refunds + adjustments,
      status: pick(["pending", "processing", "paid", "paid", "paid", "on_hold"]),
      paidAt: pi > 0 ? daysAgo(pi * 14) : null,
    };
  })
);

// ---------------- Admin Users / RBAC ----------------
export const ROLES_DATA: AdminRole[] = [
  { id: "ROLE-1", name: "Super Admin", description: "Full unrestricted access to every module", permissions: ["*"], userCount: 2 },
  { id: "ROLE-2", name: "Marketplace Admin", description: "Manage marketplace-wide operations", permissions: ["orders.*", "sellers.*", "products.*"], userCount: 4 },
  { id: "ROLE-3", name: "Catalog Manager", description: "Manage products, categories, brands", permissions: ["products.view", "products.create", "products.edit", "products.approve"], userCount: 5 },
  { id: "ROLE-4", name: "Seller Manager", description: "Manage seller onboarding & performance", permissions: ["sellers.view", "sellers.approve", "sellers.suspend"], userCount: 3 },
  { id: "ROLE-5", name: "Order Manager", description: "Manage order lifecycle", permissions: ["orders.view", "orders.edit", "orders.cancel", "orders.refund"], userCount: 6 },
  { id: "ROLE-6", name: "Customer Support", description: "Handle tickets and customer issues", permissions: ["support.view", "support.edit", "customers.view"], userCount: 12 },
  { id: "ROLE-7", name: "Finance Manager", description: "Manage settlements, payouts, invoices", permissions: ["finance.view", "finance.approve", "finance.export"], userCount: 3 },
  { id: "ROLE-8", name: "Marketing Manager", description: "Manage coupons, promotions, campaigns", permissions: ["marketing.*"], userCount: 4 },
  { id: "ROLE-9", name: "Inventory Manager", description: "Manage stock and warehouses", permissions: ["inventory.*"], userCount: 3 },
  { id: "ROLE-10", name: "Analyst", description: "Read-only access to analytics & reports", permissions: ["analytics.view", "reports.export"], userCount: 5 },
];

export const ADMIN_USERS_DATA: AdminUser[] = Array.from({ length: 22 }, (_, i) => ({
  id: makeId("ADM", i + 1),
  name: personName(),
  email: `admin.user${i + 1}@marketplace.example`,
  role: pick(ROLES_DATA).name,
  status: randBool(0.9) ? "active" : "inactive",
  lastLogin: randBool(0.85) ? daysAgo(randInt(0, 20)) : null,
  twoFactorEnabled: randBool(0.6),
}));

// ---------------- Audit Logs ----------------
const AUDIT_ACTIONS = [
  "Product price changed", "Seller approved", "Seller suspended", "Refund initiated",
  "Order cancelled", "Admin permission changed", "Inventory adjusted", "Coupon created",
  "Product approved", "Product rejected", "Settlement processed", "Payout initiated",
];
export const AUDIT_LOGS_DATA: AuditLogEntry[] = Array.from({ length: 150 }, (_, i) => ({
  id: makeId("AUD", i + 1),
  user: pick(ADMIN_USERS_DATA).name,
  role: pick(ROLES_DATA).name,
  action: pick(AUDIT_ACTIONS),
  module: pick(["Products", "Sellers", "Orders", "Refunds", "Inventory", "Marketing", "Users"]),
  recordId: makeId("REC", randInt(1, 999)),
  previousValue: "—",
  newValue: "—",
  ipAddress: `${randInt(10, 220)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
  timestamp: daysAgo(randInt(0, 90)),
}));

// ---------------- Notifications ----------------
const NOTIF_EVENTS = [
  "Order placed", "Payment successful", "Payment failed", "Order shipped",
  "Order delivered", "Order cancelled", "Return approved", "Refund processed",
  "Seller approved", "Seller suspended", "Low stock", "Promotional campaign",
];
export const NOTIFICATION_TEMPLATES_DATA: NotificationTemplate[] = NOTIF_EVENTS.flatMap((event, i) =>
  (["email", "sms", "push", "in_app"] as const).map((channel, j) => ({
    id: makeId("NTPL", i * 4 + j + 1),
    name: `${event} — ${channel.toUpperCase()}`,
    channel,
    event,
    status: randBool(0.85) ? "active" : "inactive",
    updatedAt: daysAgo(randInt(0, 60)),
  }))
);

// ---------------- Alerts ----------------
export const ALERTS_DATA: AlertItem[] = [
  { id: "ALT-1", title: "Payment gateway failure spike", description: "Razorpay failure rate crossed 8% in the last hour", severity: "critical", module: "Payments", createdAt: daysAgo(0), resolved: false },
  { id: "ALT-2", title: "High cancellation rate — Metro Traders", description: "Cancellation rate at 18% over last 24h, above 10% threshold", severity: "high", module: "Sellers", createdAt: daysAgo(0), resolved: false },
  { id: "ALT-3", title: "Low inventory — 23 SKUs", description: "23 SKUs fell below reorder level in Mumbai Fulfillment Center", severity: "medium", module: "Inventory", createdAt: daysAgo(1), resolved: false },
  { id: "ALT-4", title: "Seller SLA violation", description: "Prime Retail missed dispatch SLA on 14 orders", severity: "high", module: "Sellers", createdAt: daysAgo(1), resolved: true },
  { id: "ALT-5", title: "Delivery delays — Kolkata zone", description: "Average delivery time up 35% vs last week", severity: "medium", module: "Shipping", createdAt: daysAgo(2), resolved: false },
  { id: "ALT-6", title: "Failed payouts", description: "3 seller payouts failed due to invalid bank details", severity: "high", module: "Finance", createdAt: daysAgo(2), resolved: false },
  { id: "ALT-7", title: "Unusual sales activity", description: "300% spike in orders for SKU789234 — possible bot activity", severity: "critical", module: "Risk", createdAt: daysAgo(0), resolved: false },
  { id: "ALT-8", title: "System error rate elevated", description: "5xx error rate on checkout API at 2.1%", severity: "low", module: "System", createdAt: daysAgo(3), resolved: true },
];

// ---------------- Risk ----------------
export const RISK_CASES_DATA: RiskCase[] = Array.from({ length: 26 }, (_, i) => {
  const type = pick(["Coupon abuse", "Excessive returns", "Payment anomaly", "Multiple accounts", "Suspicious order", "Repeated failed payments"]);
  const entityType = pick(["customer", "seller", "order"] as const);
  const entity = entityType === "customer" ? pick(CUSTOMERS_DATA).name : entityType === "seller" ? pick(SELLERS_DATA).storeName : pick(ORDERS_DATA).orderNumber;
  return {
    id: makeId("RSK", i + 1),
    type,
    entityName: entity,
    entityType,
    riskScore: pick(["low", "medium", "high", "critical"]),
    description: `${type} detected via automated risk scoring on ${entityType} ${entity}.`,
    detectedAt: daysAgo(randInt(0, 45)),
    status: pick(["open", "reviewing", "resolved", "dismissed"]),
  };
});
