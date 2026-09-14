import { apiFetchData } from "./client";
import type { Category, Brand } from "@/lib/types";

// ---------------- Categories ----------------
// Backend: ProductClientService (base "product")

interface CategoryTreeNode {
  id: string;
  name: string;
  imageUrl: string | null;
  categoryLevel: string;
  children: CategoryTreeNode[];
}

function flattenCategoryTree(nodes: CategoryTreeNode[], parentId: string | null = null): Category[] {
  const out: Category[] = [];
  for (const n of nodes) {
    out.push({
      id: n.id,
      name: n.name,
      slug: n.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      parentId,
      productCount: 0,
      status: "active",
      image: n.imageUrl ?? undefined,
    });
    if (n.children?.length) out.push(...flattenCategoryTree(n.children, n.id));
  }
  return out;
}

export async function fetchCategoryTree(): Promise<Category[]> {
  const tree = await apiFetchData<CategoryTreeNode[]>("product", "/api/v1/product/category");
  return flattenCategoryTree(tree ?? []);
}

// NOTE: as of this writing, AdminProductController's POST /add-category is a
// stub on the backend (AdminProductService.addCategory returns a canned 201
// without persisting anything). This call will appear to succeed but the
// category will not actually show up on refetch until the backend is finished.
export async function createCategory(name: string, parentName?: string): Promise<void> {
  await apiFetchData<unknown>("product", "/api/v1/admin/product/add-category", {
    method: "POST",
    body: JSON.stringify({ category: name, parent: parentName || null }),
  });
}

// ---------------- Brands ----------------

interface BrandEntity {
  id: string;
  name: string;
  normalisedName: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  approved: boolean;
  active: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export type BrandRow = Brand & { approvalStatus: "pending" | "approved" };

function mapBrand(b: BrandEntity): BrandRow {
  return {
    id: b.id,
    name: b.name,
    slug: b.normalisedName,
    logo: b.logoUrl ?? undefined,
    productCount: 0,
    status: b.active ? "active" : "inactive",
    approvalStatus: b.approved ? "approved" : "pending",
  };
}

export async function fetchPendingBrands(): Promise<BrandRow[]> {
  const brands = await apiFetchData<BrandEntity[]>("product", "/api/v1/brands/admin/brands/pending");
  return (brands ?? []).map(mapBrand);
}

export async function approveBrand(id: string): Promise<void> {
  await apiFetchData<unknown>("product", `/api/v1/brands/admin/brands/${id}/approve`, { method: "PUT" });
}

// Backend "reject" is actually a soft-delete (sets active=false); there's no
// dedicated reject/pending-again endpoint.
export async function rejectBrand(id: string): Promise<void> {
  await apiFetchData<unknown>("product", `/api/v1/brands/admin/brands/${id}`, { method: "DELETE" });
}

export async function searchBrands(categoryId: string, keyword?: string): Promise<BrandRow[]> {
  const path = keyword
    ? `/api/v1/brands/search?keyword=${encodeURIComponent(keyword)}&categoryId=${categoryId}`
    : `/api/v1/brands/category/${categoryId}`;
  const brands = await apiFetchData<BrandEntity[]>("product", path);
  return (brands ?? []).map(mapBrand);
}
