import { apiFetchData } from "./client";
import type { Order, OrderItem, OrderStatus, OrderEvent } from "@/lib/types";

// Mirrors OrderPaymentNotificationService's DTO.OrderDto.OrderSummaryDto (see
// AdminController / AdminOrderService). All money fields come pre-converted
// to rupee strings by the backend alongside the raw paise string.
export interface OrderSummaryDto {
  bookingId: string;
  shopId: string;
  status: string;
  statusLabel: string;
  itemCount: number;
  totalAmountPaise: string;
  totalAmountRupees: string;
  paymentStatus: string | null;
  paymentMode: string;
  expiresAt: string | null;
  createdAt: string | null;
  firstItemName: string | null;
  firstItemImageUrl: string | null;
}

export interface OrderDetailItemDto {
  bookingItemId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitPricePaise: string;
  unitPriceRupees: string;
  lineTotalPaise: string;
  lineTotalRupees: string;
}

export interface OrderDetailTransactionDto {
  transactionId: string;
  method: string;
  status: string;
  amountPaise: string;
  amountRupees: string;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetailPaymentDto {
  paymentId: string;
  status: string;
  totalAmountPaise: string;
  totalAmountRupees: string;
  paidAmountPaise: string;
  transactions: OrderDetailTransactionDto[];
}

export interface OrderDetailDto {
  bookingId: string;
  shopId: string;
  deliveryAddress: string;
  status: string;
  statusLabel: string;
  totalAmountPaise: string;
  totalAmountRupees: string;
  expiresAt: string | null;
  createdAt: string | null;
  items: OrderDetailItemDto[];
  payment: OrderDetailPaymentDto | null;
}

interface OrdersListPayload {
  orders: OrderSummaryDto[];
  currentPage: number;
  pageSize: number;
  totalOrders: number;
  totalPages: number;
  hasNext: boolean;
}

export interface FetchOrdersParams {
  page?: number;
  size?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchOrders(params: FetchOrdersParams = {}): Promise<OrdersListPayload> {
  const qs = buildQuery({
    page: params.page ?? 0,
    size: params.size ?? 20,
    status: params.status,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    search: params.search,
  });
  return apiFetchData<OrdersListPayload>("orderPayment", `/api/v1/admin/orders${qs}`);
}

export async function fetchOrderDetail(id: string): Promise<OrderDetailDto> {
  return apiFetchData<OrderDetailDto>("orderPayment", `/api/v1/admin/orders/${id}`);
}

export async function forceOrderStatus(id: string, status: string, reason?: string): Promise<void> {
  await apiFetchData("orderPayment", `/api/v1/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
  });
}

export async function cancelOrderApi(id: string, reason: string): Promise<void> {
  await apiFetchData("orderPayment", `/api/v1/admin/orders/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export interface RefundBody {
  gateway: string;
  transactionId?: string;
  amount?: string;
  reason: string;
}

export async function refundPayment(paymentId: string, body: RefundBody): Promise<void> {
  await apiFetchData("orderPayment", `/api/v1/admin/payments/${paymentId}/refund`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Mapping helpers: backend DTOs → the frontend's existing mock-derived types ──
// The real backend's Booking.Status enum is a superset-compatible casing of the
// frontend OrderStatus union (see lib/types.ts) — a simple lowercase maps it directly
// (INITIATED, CONFIRMED, PROCESSING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, FAILED,
// REVERSED, REVERSE_FAILED all have matching lowercase entries in OrderStatus).
export function mapBackendStatus(status: string): OrderStatus {
  return status.toLowerCase() as OrderStatus;
}

function mapPaymentStatus(status: string | null | undefined): Order["paymentStatus"] {
  if (!status) return "pending";
  const s = status.toUpperCase();
  if (s === "SUCCESS") return "paid";
  if (s === "FAILED") return "failed";
  if (s === "REVERSED") return "refunded";
  if (s === "REVERSED_FAILED") return "partially_refunded";
  return "pending";
}

const TIMELINE_STAGES: { status: string; label: string }[] = [
  { status: "INITIATED", label: "Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PROCESSING", label: "Processing" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

function buildTimeline(status: string, createdAt: string | null): OrderEvent[] {
  const terminal = ["CANCELLED", "FAILED", "REVERSED", "REVERSE_FAILED"];
  if (terminal.includes(status)) {
    return [
      { label: "Placed", timestamp: createdAt ?? "", done: true },
      { label: status.replace(/_/g, " "), timestamp: createdAt ?? "", done: true },
    ];
  }
  const currentIdx = TIMELINE_STAGES.findIndex((s) => s.status === status);
  return TIMELINE_STAGES.map((stage, i) => ({
    label: stage.label,
    timestamp: i <= currentIdx ? createdAt ?? "" : "",
    done: i <= currentIdx,
  }));
}

// Real API is missing several fields the mock-driven UI displays (resolved customer
// name/phone, seller name, SKU, per-line discount/tax, shipping vs billing address
// text, carrier/tracking). Those degrade to a placeholder rather than crashing the
// existing page — see AdminController/AdminOrderService, which do not project them.
export function mapOrderSummaryToOrder(dto: OrderSummaryDto): Order {
  return {
    id: dto.bookingId,
    orderNumber: `#${dto.bookingId.slice(0, 8).toUpperCase()}`,
    customerId: "",
    customerName: "—",
    customerPhone: "—",
    sellerId: dto.shopId,
    sellerName: `Shop ${dto.shopId.slice(0, 8)}`,
    items: dto.firstItemName
      ? [
          {
            id: `${dto.bookingId}-preview`,
            productId: "",
            productName: dto.firstItemName,
            sku: "—",
            image: dto.firstItemImageUrl ?? "",
            quantity: dto.itemCount,
            price: 0,
            discount: 0,
            tax: 0,
            sellerId: dto.shopId,
            sellerName: `Shop ${dto.shopId.slice(0, 8)}`,
          },
        ]
      : [],
    amount: parseFloat(dto.totalAmountRupees) || 0,
    paymentStatus: mapPaymentStatus(dto.paymentStatus),
    paymentMethod: dto.paymentMode,
    status: mapBackendStatus(dto.status),
    shippingAddress: "—",
    billingAddress: "—",
    city: "—",
    state: "—",
    pincode: "—",
    placedAt: dto.createdAt ?? "",
    deliveryEstimate: dto.expiresAt ?? "",
    deliveredAt: null,
    timeline: buildTimeline(dto.status, dto.createdAt),
    source: "admin",
  };
}

export function mapOrderDetailToOrder(dto: OrderDetailDto): Order {
  const items: OrderItem[] = dto.items.map((it) => ({
    id: it.bookingItemId,
    productId: it.productId,
    productName: it.productName,
    sku: "—",
    image: it.productImageUrl ?? "",
    quantity: it.quantity,
    price: parseFloat(it.unitPriceRupees) || 0,
    discount: 0,
    tax: 0,
    sellerId: dto.shopId,
    sellerName: `Shop ${dto.shopId.slice(0, 8)}`,
  }));

  const paymentMethod = dto.payment?.transactions?.[0]?.method ?? "—";

  return {
    id: dto.bookingId,
    orderNumber: `#${dto.bookingId.slice(0, 8).toUpperCase()}`,
    customerId: "",
    customerName: "—",
    customerPhone: "—",
    sellerId: dto.shopId,
    sellerName: `Shop ${dto.shopId.slice(0, 8)}`,
    items,
    amount: parseFloat(dto.totalAmountRupees) || 0,
    paymentStatus: mapPaymentStatus(dto.payment?.status),
    paymentMethod,
    status: mapBackendStatus(dto.status),
    shippingAddress: dto.deliveryAddress,
    billingAddress: dto.deliveryAddress,
    city: "—",
    state: "—",
    pincode: "—",
    placedAt: dto.createdAt ?? "",
    deliveryEstimate: dto.expiresAt ?? "",
    deliveredAt: dto.status === "DELIVERED" ? dto.createdAt : null,
    timeline: buildTimeline(dto.status, dto.createdAt),
    source: "admin",
  };
}
