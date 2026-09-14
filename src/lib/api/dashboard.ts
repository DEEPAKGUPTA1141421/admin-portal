import { apiFetchData } from "./client";
import { computeKpis } from "@/lib/mock/dashboard";

// Backend aggregate endpoints added alongside this wiring:
//   OrderPaymentNotificationService: GET /api/v1/admin/orders/stats
//   ProductClientService:            GET /api/v1/admin/sellers/kyc/stats
// Fields not yet backed by any aggregate endpoint (lowStock, outOfStock,
// commission, sellerPayable, activeCustomers, newCustomers, refunded — there
// is no booking-level "refunded" status, only payment-level refunds) keep
// falling back to mock data until those aggregates exist.

interface AdminOrderStatsDto {
  totalOrders: number;
  gmvPaise: number;
  netRevenuePaise: number;
  todayOrders: number;
  todaySalesPaise: number;
  statusCounts: Record<string, number>;
}

interface AdminSellerStatsDto {
  activeSellers: number;
  pendingApprovals: number;
}

async function fetchOrderStats(): Promise<AdminOrderStatsDto> {
  return apiFetchData<AdminOrderStatsDto>("orderPayment", "/api/v1/admin/orders/stats");
}

async function fetchSellerStats(): Promise<AdminSellerStatsDto> {
  return apiFetchData<AdminSellerStatsDto>("product", "/api/v1/admin/sellers/kyc/stats");
}

export type DashboardKpis = ReturnType<typeof computeKpis>;

// Fetches live KPIs where a backend aggregate exists, merging them onto the
// mock-derived baseline for everything else. Throws if BOTH live calls fail
// so the caller can decide whether to show an "using demo data" notice.
export async function fetchLiveKpis(): Promise<DashboardKpis> {
  const base = computeKpis();
  const [orderStats, sellerStats] = await Promise.allSettled([fetchOrderStats(), fetchSellerStats()]);

  if (orderStats.status === "rejected" && sellerStats.status === "rejected") {
    throw orderStats.reason;
  }

  const merged: DashboardKpis = { ...base };

  if (orderStats.status === "fulfilled") {
    const s = orderStats.value;
    const sc = s.statusCounts;
    merged.totalOrders = s.totalOrders;
    merged.gmv = paiseToRupees(s.gmvPaise);
    merged.netRevenue = paiseToRupees(s.netRevenuePaise);
    merged.todayOrders = s.todayOrders;
    merged.todaySales = paiseToRupees(s.todaySalesPaise);
    merged.pending = sc.INITIATED ?? 0;
    merged.processing = (sc.CONFIRMED ?? 0) + (sc.PROCESSING ?? 0);
    merged.shipped = sc.OUT_FOR_DELIVERY ?? 0;
    merged.delivered = sc.DELIVERED ?? 0;
    merged.cancelled = (sc.CANCELLED ?? 0) + (sc.FAILED ?? 0);
    merged.returned = sc.REVERSED ?? 0;
    merged.refunded = 0; // no booking-level "refunded" status — refunds are payment-scoped
  }

  if (sellerStats.status === "fulfilled") {
    merged.activeSellers = sellerStats.value.activeSellers;
    merged.pendingSellers = sellerStats.value.pendingApprovals;
  }

  return merged;
}

function paiseToRupees(paise: number): number {
  return Math.round(paise / 100);
}
