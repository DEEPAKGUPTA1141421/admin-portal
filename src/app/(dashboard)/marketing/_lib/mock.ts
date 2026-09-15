import { SELLERS_DATA } from "@/lib/mock/generate";

// Static seed data has been removed — these datasets are empty until wired
// to their real backend endpoints. Pages fall back to their empty state.

// ---------------- Discount Rules ----------------
export interface DiscountRule {
  id: string;
  name: string;
  appliesTo: "category" | "product" | "seller";
  discountPct: number;
  conditions: string;
  status: "active" | "scheduled" | "ended";
}

export const DISCOUNT_RULES: DiscountRule[] = [];

// ---------------- Promotions ----------------
export interface Promotion {
  id: string;
  name: string;
  type: "site_wide" | "category" | "seller" | "customer_segment";
  targetAudience: string;
  status: "active" | "scheduled" | "ended";
  startDate: string;
  endDate: string;
}

export const PROMOTIONS: Promotion[] = [];

// ---------------- Seller Promotions ----------------
export interface SellerPromotion {
  sellerId: string;
  sellerName: string;
  active: boolean;
  promotionName: string;
  discountPct: number;
  startDate: string;
  endDate: string;
}

export const SELLER_PROMOTIONS: SellerPromotion[] = SELLERS_DATA.slice(0, 20).map((s, i) => ({
  sellerId: s.id,
  sellerName: s.storeName,
  active: i % 3 !== 0,
  promotionName: ["Store Anniversary Sale", "Clearance Week", "New Arrivals Push", "Category Spotlight"][i % 4],
  discountPct: [10, 15, 20, 25][i % 4],
  startDate: new Date(Date.now() - (i % 5) * 86400000).toISOString(),
  endDate: new Date(Date.now() + (10 + (i % 5)) * 86400000).toISOString(),
}));

// ---------------- Homepage Promotions ----------------
export interface HomepageSlot {
  id: string;
  position: "Hero" | "Mid-page" | "Footer";
  title: string;
  linkTarget: string;
  active: boolean;
  priority: number;
  image: string;
}

export const HOMEPAGE_SLOTS: HomepageSlot[] = [];

// ---------------- Banners ----------------
export interface Banner {
  id: string;
  title: string;
  image: string;
  placement: "Homepage" | "Category Page" | "Search Results" | "App Splash";
  status: "draft" | "scheduled" | "live" | "expired";
  startDate: string;
  endDate: string;
}

export const BANNERS: Banner[] = [];
