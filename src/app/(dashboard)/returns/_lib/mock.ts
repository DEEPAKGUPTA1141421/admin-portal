import { RETURNS_DATA } from "@/lib/mock/generate";
import { RETURN_REASONS } from "@/lib/mock/reference";

export type ReplacementStatus = "pending" | "shipped" | "delivered";

export interface ReplacementOrder {
  id: string;
  originalOrderNumber: string;
  product: string;
  customerName: string;
  reason: string;
  replacementStatus: ReplacementStatus;
  requestedAt: string;
}

const STATUS_CYCLE: ReplacementStatus[] = ["pending", "pending", "shipped", "delivered"];

export const REPLACEMENT_ORDERS: ReplacementOrder[] = RETURNS_DATA.slice(0, 16).map((r, i) => ({
  id: `RPL-${1000 + i}`,
  originalOrderNumber: r.orderNumber,
  product: r.productName,
  customerName: r.customerName,
  reason: r.reason,
  replacementStatus: STATUS_CYCLE[i % STATUS_CYCLE.length],
  requestedAt: r.requestedAt,
}));

export interface ReturnReasonConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export const RETURN_REASON_CONFIG: ReturnReasonConfig[] = RETURN_REASONS.map((name, i) => ({
  id: `RR-${i + 1}`,
  name,
  enabled: true,
  order: i + 1,
}));
