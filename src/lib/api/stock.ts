import { apiFetchData } from "./client";
import type { InventoryItem } from "@/lib/types";

// Real stock lives on ProductVariant (ProductClientService), one row per
// variant, not per "inventory item" the way the mock InventoryItem type
// models it. There is no warehouse-scoped stock, no reserved/damaged/
// in-transit tracking, and no reorder-level field anywhere in the backend —
// those fields are mapped to 0 / "—" / the query threshold below rather than
// fabricated. availableStock is set equal to physicalStock since "reserved"
// isn't tracked.

interface VariantStockDto {
  id: string;
  sku: string;
  label: string | null;
  stock: number;
  price: string;
  productId: string;
  productName: string;
  sellerId: string | null;
  sellerName: string | null;
}

interface VariantStockResponse {
  variants: VariantStockDto[];
  totalElements: number;
  totalPages: number;
  page: number;
}

export type StockFilter = "ALL" | "LOW" | "OUT";

function toInventoryItem(dto: VariantStockDto, reorderLevel: number): InventoryItem {
  return {
    id: dto.id,
    productId: dto.productId,
    productName: dto.productName,
    sku: dto.sku,
    sellerId: dto.sellerId ?? "",
    sellerName: dto.sellerName ?? "—",
    warehouseId: "",
    warehouseName: "—",
    physicalStock: dto.stock,
    reservedStock: 0,
    availableStock: dto.stock,
    damagedStock: 0,
    inTransitStock: 0,
    reorderLevel,
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchVariantStock(params: {
  stockFilter?: StockFilter;
  threshold?: number;
  search?: string;
  page?: number;
  size?: number;
}): Promise<{ items: InventoryItem[]; totalElements: number; totalPages: number }> {
  const threshold = params.threshold ?? 10;
  const qs = new URLSearchParams({
    stockFilter: params.stockFilter ?? "ALL",
    threshold: String(threshold),
    page: String(params.page ?? 0),
    size: String(params.size ?? 100),
  });
  if (params.search) qs.set("search", params.search);

  const res = await apiFetchData<VariantStockResponse>(
    "product",
    `/api/v1/admin/product/variants?${qs.toString()}`
  );
  return {
    items: res.variants.map((v) => toInventoryItem(v, threshold)),
    totalElements: res.totalElements,
    totalPages: res.totalPages,
  };
}

export async function updateVariantStock(variantId: string, stock: number): Promise<void> {
  await apiFetchData<{ variantId: string; stock: number }>(
    "product",
    `/api/v1/admin/product/variants/${variantId}/stock`,
    { method: "PUT", body: JSON.stringify({ stock }) }
  );
}
