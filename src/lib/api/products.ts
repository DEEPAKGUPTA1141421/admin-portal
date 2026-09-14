import { apiFetchData, ApiError } from "./client";
import type { Product } from "@/lib/types";

// Products are created/edited by sellers via a multi-step wizard
// (/api/v1/seller/product/**) — there is currently no admin-facing
// create/update/delete endpoint for arbitrary products, only category,
// brand, attribute and standard-catalog management. This module therefore
// only wires read access (browsing the live catalog); mutations on the
// Products page remain local-only until an admin product-write API exists.

interface SearchProductDto {
  id: string;
  name: string;
  brand: string | null;
  brandId: string | null;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  categoryId: string | null;
  categoryName: string | null;
}

interface SearchResultsResponse {
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  products: SearchProductDto[];
}

function toProduct(dto: SearchProductDto): Product {
  const mrp = dto.originalPrice ?? dto.price;
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    sku: dto.id.slice(0, 8).toUpperCase(),
    categoryId: dto.categoryId ?? "",
    categoryName: dto.categoryName ?? "Uncategorized",
    brandId: dto.brandId ?? "",
    brandName: dto.brand ?? "Unbranded",
    sellerId: "",
    sellerName: "",
    image: dto.images?.[0] ?? "https://picsum.photos/seed/no-image/400/400",
    mrp,
    price: dto.price,
    costPrice: Math.round(dto.price * 0.75),
    discountPct: dto.discountPercent ?? 0,
    stock: 0,
    minStock: 5,
    status: "published",
    rating: dto.rating,
    reviewCount: dto.reviewCount,
    gstPct: 18,
    weightKg: 1,
    warehouseId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchLiveProducts(page = 0, size = 50): Promise<Product[]> {
  const res = await apiFetchData<SearchResultsResponse>(
    "product",
    `/api/v1/product/popular?page=${page}&size=${size}`
  );
  return res.products.map(toProduct);
}

export { ApiError };
