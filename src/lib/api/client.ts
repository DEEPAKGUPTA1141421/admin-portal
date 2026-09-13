// Thin REST client layer. Each backend service gets its own base URL.
// When NEXT_PUBLIC_USE_MOCKS=true (default until the backend admin APIs are
// deployed), callers should prefer the mock data in `lib/mock` — this client
// exists so swapping any single module over to the real API is a one-line change.

export const SERVICE_URLS = {
  product:   process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL ?? "https://productclientservice-1.onrender.com",
  orderPayment: process.env.NEXT_PUBLIC_ORDER_PAYMENT_SERVICE_URL ?? "https://orderpaymentnotificationservice.onrender.com",
  deliveryInventory: process.env.NEXT_PUBLIC_DELIVERY_INVENTORY_SERVICE_URL ?? "https://deliveryinventoryservice.onrender.com",
};

export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Most backend controllers wrap responses as { success, message, data, statusCode }.
// A few (raw-CRUD controllers in DeliveryInventoryService, some ProductClientService
// endpoints) return the entity/list directly instead.
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("admin-auth");
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  base: keyof typeof SERVICE_URLS,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${SERVICE_URLS[base]}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Backends return an ApiEnvelope JSON body even on error status codes —
    // extract its `message` instead of surfacing the raw JSON string.
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.message === "string") {
        throw new ApiError(res.status, parsed.message);
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
    }
    throw new ApiError(res.status, text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Use for endpoints that return the { success, message, data, statusCode } envelope.
// Throws ApiError when success is false, even on an HTTP 2xx (some controllers
// return 200 with success:false for validation errors).
export async function apiFetchData<T>(
  base: keyof typeof SERVICE_URLS,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const envelope = await apiFetch<ApiEnvelope<T>>(base, path, options);
  if (!envelope.success) {
    throw new ApiError(envelope.statusCode || 400, envelope.message || "Request failed");
  }
  return envelope.data;
}
