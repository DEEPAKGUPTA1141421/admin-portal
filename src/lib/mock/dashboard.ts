import { ORDERS_DATA, PRODUCTS_DATA, SELLERS_DATA, CUSTOMERS_DATA, SETTLEMENTS_DATA } from "./generate";

export interface SalesPoint {
  date: string;
  gmv: number;
  netRevenue: number;
  orders: number;
}

// No live time-series aggregate endpoint exists yet — returns no points so
// the chart renders its empty state instead of fabricated history.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function salesSeries(days: number): SalesPoint[] {
  return [];
}

export const SALES_BY_CATEGORY: { name: string; value: number }[] = [];

export const TOP_SELLERS = [...SELLERS_DATA]
  .sort((a, b) => b.totalRevenue - a.totalRevenue)
  .slice(0, 6)
  .map((s) => ({ name: s.storeName, value: s.totalRevenue }));

export const TOP_PRODUCTS = [...PRODUCTS_DATA]
  .sort((a, b) => b.reviewCount * b.price - a.reviewCount * a.price)
  .slice(0, 6)
  .map((p) => ({ name: p.name, value: p.reviewCount * p.price }));

export const ORDER_STATUS_DISTRIBUTION = [
  { name: "Delivered", value: ORDERS_DATA.filter((o) => o.status === "delivered").length },
  { name: "Shipped", value: ORDERS_DATA.filter((o) => o.status === "shipped" || o.status === "out_for_delivery").length },
  { name: "Processing", value: ORDERS_DATA.filter((o) => ["confirmed", "processing", "packed", "ready_to_ship"].includes(o.status)).length },
  { name: "Cancelled", value: ORDERS_DATA.filter((o) => o.status === "cancelled" || o.status === "failed").length },
  { name: "Returned/Refunded", value: ORDERS_DATA.filter((o) => o.status === "returned" || o.status === "refunded").length },
  { name: "Pending Payment", value: ORDERS_DATA.filter((o) => o.status === "pending_payment").length },
];

export const PAYMENT_METHOD_DISTRIBUTION: { name: string; value: number }[] = [];

export const GEO_SALES: { name: string; value: number }[] = [];

export function computeKpis() {
  const totalOrders = ORDERS_DATA.length;
  const gmv = ORDERS_DATA.reduce((s, o) => s + o.amount, 0);
  const netRevenue = Math.round(gmv * 0.8);
  const todayOrders = 0;
  const pending = ORDERS_DATA.filter((o) => o.status === "pending_payment").length;
  const processing = ORDERS_DATA.filter((o) => ["confirmed", "processing", "packed", "ready_to_ship"].includes(o.status)).length;
  const shipped = ORDERS_DATA.filter((o) => o.status === "shipped" || o.status === "out_for_delivery").length;
  const delivered = ORDERS_DATA.filter((o) => o.status === "delivered").length;
  const cancelled = ORDERS_DATA.filter((o) => o.status === "cancelled" || o.status === "failed").length;
  const returned = ORDERS_DATA.filter((o) => o.status === "returned").length;
  const refunded = ORDERS_DATA.filter((o) => o.status === "refunded").length;
  const activeCustomers = CUSTOMERS_DATA.filter((c) => c.status === "active").length;
  const newCustomers = CUSTOMERS_DATA.filter((c) => c.segment === "new").length;
  const activeSellers = SELLERS_DATA.filter((s) => s.status === "active").length;
  const pendingSellers = SELLERS_DATA.filter((s) => ["applied", "under_review", "documents_pending"].includes(s.status)).length;
  const lowStock = PRODUCTS_DATA.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStock = PRODUCTS_DATA.filter((p) => p.stock === 0).length;
  const commission = SETTLEMENTS_DATA.reduce((s, x) => s + x.commission, 0);
  const sellerPayable = SETTLEMENTS_DATA.filter((s) => s.status !== "paid").reduce((s, x) => s + x.netPayable, 0);

  return {
    gmv, netRevenue, todaySales: Math.round(gmv * 0.02), todayOrders, totalOrders,
    pending, processing, shipped, delivered, cancelled, returned, refunded,
    activeCustomers, newCustomers, activeSellers, pendingSellers, lowStock, outOfStock,
    commission, sellerPayable,
  };
}
