import { apiFetchData } from "./client";
import type { Payment, PaymentStatus } from "@/lib/types";

// Mirrors OrderPaymentNotificationService's AdminPaymentService — these are
// built as plain Map<String,Object> on the backend (not a typed record), so
// field names are transcribed directly from toSummary()/toDetail()/toTxSummary().
export interface AdminPaymentSummaryDto {
  paymentId: string;
  bookingId: string;
  status: string; // Payment.Status: INITIATED|PENDING|SUCCESS|FAILED|REVERSED|REVERSED_FAILED|ABONDENED
  totalAmountPaise: number;
  paidAmountPaise: number;
  transactionCount: number;
}

export interface AdminTransactionSummaryDto {
  transactionId: string;
  method: string; // Transaction.Method: POINTS|GATEWAY|COD
  status: string; // Transaction.Status: INITIATED|PENDING|SUCCESS|FAILED|REVERSED|REVERSED_FAILED|ABONDENED
  amountPaise: number;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentDetailDto {
  paymentId: string;
  bookingId: string;
  status: string;
  totalAmountPaise: number;
  paidAmountPaise: number;
  transactions: AdminTransactionSummaryDto[];
}

interface PaymentsListPayload {
  payments: AdminPaymentSummaryDto[];
  currentPage: number;
  pageSize: number;
  totalPayments: number;
  totalPages: number;
  hasNext: boolean;
}

export interface FetchPaymentsParams {
  page?: number;
  size?: number;
  status?: string; // single Payment.Status value — the backend takes one, not a list
  gateway?: string; // actually filters by Transaction.Method (POINTS|GATEWAY|COD), not a provider name
  dateFrom?: string;
  dateTo?: string;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchPayments(params: FetchPaymentsParams = {}): Promise<PaymentsListPayload> {
  const qs = buildQuery({
    page: params.page ?? 0,
    size: params.size ?? 50,
    status: params.status,
    gateway: params.gateway,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });
  return apiFetchData<PaymentsListPayload>("orderPayment", `/api/v1/admin/payments${qs}`);
}

export async function fetchPaymentDetail(id: string): Promise<AdminPaymentDetailDto> {
  return apiFetchData<AdminPaymentDetailDto>("orderPayment", `/api/v1/admin/payments/${id}`);
}

// ── Mapping: backend Payment.Status → frontend PaymentStatus ──────────────
// Lossy in two places: REVERSED_FAILED has no real frontend equivalent (mapped
// to "partially_refunded" as the closest "refund didn't fully complete" bucket)
// and ABONDENED (an existing backend typo, not ours) maps to "cancelled".
export function mapPaymentStatus(status: string): PaymentStatus {
  switch (status.toUpperCase()) {
    case "SUCCESS": return "captured";
    case "FAILED": return "failed";
    case "REVERSED": return "refunded";
    case "REVERSED_FAILED": return "partially_refunded";
    case "ABONDENED": return "cancelled";
    case "INITIATED":
    case "PENDING":
    default:
      return "pending";
  }
}

function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

// The admin summary endpoint is one row per Payment (a booking may have
// several transactions — wallet points + gateway, retries, etc.), so there is
// no single "method"/"gateway"/"transactionId" at this level. Those columns
// degrade to placeholders here; open the detail sheet (which calls
// fetchPaymentDetail) to see the real per-transaction breakdown.
export function mapPaymentSummaryToPayment(dto: AdminPaymentSummaryDto): Payment {
  return {
    id: dto.paymentId,
    orderId: dto.bookingId,
    orderNumber: `#${dto.bookingId.slice(0, 8).toUpperCase()}`,
    customerName: "—",
    amount: paiseToRupees(dto.totalAmountPaise),
    method: dto.transactionCount > 1 ? "Mixed" : "—",
    gateway: "—",
    transactionId: dto.paymentId,
    status: mapPaymentStatus(dto.status),
    createdAt: "",
  };
}

export function mapPaymentDetailToPayment(dto: AdminPaymentDetailDto): Payment {
  const firstTx = dto.transactions[0];
  return {
    id: dto.paymentId,
    orderId: dto.bookingId,
    orderNumber: `#${dto.bookingId.slice(0, 8).toUpperCase()}`,
    customerName: "—",
    amount: paiseToRupees(dto.totalAmountPaise),
    method: firstTx?.method ?? "—",
    gateway: firstTx?.method === "GATEWAY" ? "Gateway" : firstTx?.method ?? "—",
    transactionId: firstTx?.transactionId ?? dto.paymentId,
    status: mapPaymentStatus(dto.status),
    createdAt: firstTx?.createdAt ?? "",
  };
}
