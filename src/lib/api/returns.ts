import { apiFetchData } from "./client";
import type { ReturnRequest, ReturnStatus } from "@/lib/types";

// Mirrors ProductClientService's DTO.ReturnRequestDto as returned by
// AdminReturnController's list/approve/reject/status endpoints. The admin
// list query (ReturnService.getAdminReturns → findAllReturnsDetailed) does
// not select sellerId/sellerName or a refund amount — ReturnRequest has no
// amount field at all (see ReturnService.adminUpdateStatus's comment) — and
// only fills updatedAt on the single-record approve/reject/status responses
// (ReturnRequestDto.fromEntity), not on the list projection.
export interface ReturnRequestDto {
  id: string;
  bookingId: string;
  productId: string | null;
  reason: string;
  reasonLabel: string;
  description: string | null;
  status: string;
  statusLabel: string;
  adminNote: string | null;
  evidenceImages: string[] | null;
  createdAt: string | null;
  updatedAt: string | null;
  productName: string | null;
  categoryName: string | null;
  productImageUrl: string | null;
  customerId: string | null;
  customerName: string | null;
  customerAvatarUrl: string | null;
  boardStatusLabel: string | null;
}

interface ReturnsListPayload {
  returns: ReturnRequestDto[];
  totalElements: number;
  totalPages: number;
  hasMore: boolean;
  page: number;
}

export type ReturnBucket = "OPEN" | "CLOSED" | "ALL";

export interface FetchReturnsParams {
  page?: number;
  size?: number;
  bucket?: ReturnBucket;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReturns(params: FetchReturnsParams = {}): Promise<ReturnsListPayload> {
  const qs = buildQuery({
    page: params.page ?? 0,
    size: params.size ?? 20,
    bucket: params.bucket,
  });
  return apiFetchData<ReturnsListPayload>("product", `/api/v1/admin/returns${qs}`);
}

export async function approveReturn(id: string, adminNote?: string): Promise<void> {
  await apiFetchData("product", `/api/v1/admin/returns/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ adminNote }),
  });
}

export async function rejectReturn(id: string, adminNote?: string): Promise<void> {
  await apiFetchData("product", `/api/v1/admin/returns/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ adminNote }),
  });
}

export async function updateReturnStatus(id: string, status: string): Promise<void> {
  await apiFetchData("product", `/api/v1/admin/returns/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Backend ReturnStatus enum: PENDING, APPROVED, REJECTED, PICKUP_SCHEDULED,
// PICKED_UP, REFUNDED. All but PENDING already have a matching lowercase
// member on the frontend's ReturnStatus union — "pending" was added there
// alongside this mapping (same widen-don't-collapse approach used for
// OrderStatus in lib/api/orders.ts) rather than aliasing it onto the
// mock-only "requested" state.
export function mapReturnStatus(status: string): ReturnStatus {
  return status.toLowerCase() as ReturnStatus;
}

const PLACEHOLDER_IMAGE = "https://picsum.photos/seed/no-return-image/200/200";

export function mapReturnDtoToReturnRequest(dto: ReturnRequestDto): ReturnRequest {
  return {
    id: dto.id,
    orderId: dto.bookingId,
    orderNumber: `#${dto.bookingId.slice(0, 8).toUpperCase()}`,
    customerName: dto.customerName ?? "—",
    sellerName: "—", // not projected by the admin list query
    productName: dto.productName ?? "—",
    image: dto.productImageUrl ?? PLACEHOLDER_IMAGE,
    reason: dto.reasonLabel ?? dto.reason,
    status: mapReturnStatus(dto.status),
    refundAmount: 0, // ReturnRequest has no stored amount field on the backend
    requestedAt: dto.createdAt ?? "",
    resolvedAt: dto.updatedAt ?? null,
  };
}
