import { SELLERS_DATA } from "@/lib/mock/generate";

// ---------------- Discount Rules ----------------
export interface DiscountRule {
  id: string;
  name: string;
  appliesTo: "category" | "product" | "seller";
  discountPct: number;
  conditions: string;
  status: "active" | "scheduled" | "ended";
}

export const DISCOUNT_RULES: DiscountRule[] = [
  { id: "DR-1", name: "Electronics Clearance", appliesTo: "category", discountPct: 15, conditions: "Category = Electronics, Stock > 50", status: "active" },
  { id: "DR-2", name: "New Seller Boost", appliesTo: "seller", discountPct: 10, conditions: "Seller joined < 30 days ago", status: "active" },
  { id: "DR-3", name: "Slow Moving Inventory", appliesTo: "product", discountPct: 20, conditions: "No sale in 60 days", status: "active" },
  { id: "DR-4", name: "Festive Category Push", appliesTo: "category", discountPct: 12, conditions: "Category = Fashion, Apparel", status: "scheduled" },
  { id: "DR-5", name: "Premium Seller Discount", appliesTo: "seller", discountPct: 8, conditions: "Seller rating >= 4.5", status: "ended" },
];

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

export const PROMOTIONS: Promotion[] = [
  { id: "PRM-1", name: "Weekend Bonanza", type: "site_wide", targetAudience: "All customers", status: "active", startDate: new Date(Date.now() - 2 * 86400000).toISOString(), endDate: new Date(Date.now() + 3 * 86400000).toISOString() },
  { id: "PRM-2", name: "VIP Early Access", type: "customer_segment", targetAudience: "VIP customers", status: "active", startDate: new Date(Date.now() - 1 * 86400000).toISOString(), endDate: new Date(Date.now() + 6 * 86400000).toISOString() },
  { id: "PRM-3", name: "New Customer Welcome", type: "customer_segment", targetAudience: "New customers", status: "active", startDate: new Date(Date.now() - 10 * 86400000).toISOString(), endDate: new Date(Date.now() + 20 * 86400000).toISOString() },
  { id: "PRM-4", name: "Electronics Spotlight", type: "category", targetAudience: "Electronics shoppers", status: "scheduled", startDate: new Date(Date.now() + 5 * 86400000).toISOString(), endDate: new Date(Date.now() + 12 * 86400000).toISOString() },
  { id: "PRM-5", name: "Top Sellers Showcase", type: "seller", targetAudience: "Top-rated sellers", status: "ended", startDate: new Date(Date.now() - 30 * 86400000).toISOString(), endDate: new Date(Date.now() - 10 * 86400000).toISOString() },
];

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

export const HOMEPAGE_SLOTS: HomepageSlot[] = [
  { id: "SLOT-1", position: "Hero", title: "Big Billion Days", linkTarget: "/marketing/campaigns/CMP-1", active: true, priority: 1, image: "https://picsum.photos/seed/slot-1/600/240" },
  { id: "SLOT-2", position: "Hero", title: "New Season Arrivals", linkTarget: "/catalog/categories/fashion", active: true, priority: 2, image: "https://picsum.photos/seed/slot-2/600/240" },
  { id: "SLOT-3", position: "Mid-page", title: "Top Deals Today", linkTarget: "/marketing/deals", active: true, priority: 1, image: "https://picsum.photos/seed/slot-3/600/240" },
  { id: "SLOT-4", position: "Mid-page", title: "Electronics Sale", linkTarget: "/catalog/categories/electronics", active: false, priority: 2, image: "https://picsum.photos/seed/slot-4/600/240" },
  { id: "SLOT-5", position: "Footer", title: "Download the App", linkTarget: "/app-download", active: true, priority: 1, image: "https://picsum.photos/seed/slot-5/600/240" },
];

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

export const BANNERS: Banner[] = [
  { id: "BNR-1", title: "Diwali Mega Sale", image: "https://picsum.photos/seed/banner-1/640/280", placement: "Homepage", status: "live", startDate: new Date(Date.now() - 2 * 86400000).toISOString(), endDate: new Date(Date.now() + 5 * 86400000).toISOString() },
  { id: "BNR-2", title: "Fashion Fest", image: "https://picsum.photos/seed/banner-2/640/280", placement: "Category Page", status: "live", startDate: new Date(Date.now() - 1 * 86400000).toISOString(), endDate: new Date(Date.now() + 8 * 86400000).toISOString() },
  { id: "BNR-3", title: "Electronics Carnival", image: "https://picsum.photos/seed/banner-3/640/280", placement: "Search Results", status: "scheduled", startDate: new Date(Date.now() + 3 * 86400000).toISOString(), endDate: new Date(Date.now() + 15 * 86400000).toISOString() },
  { id: "BNR-4", title: "App Exclusive Offers", image: "https://picsum.photos/seed/banner-4/640/280", placement: "App Splash", status: "draft", startDate: new Date(Date.now() + 10 * 86400000).toISOString(), endDate: new Date(Date.now() + 25 * 86400000).toISOString() },
  { id: "BNR-5", title: "Summer Clearance", image: "https://picsum.photos/seed/banner-5/640/280", placement: "Homepage", status: "expired", startDate: new Date(Date.now() - 40 * 86400000).toISOString(), endDate: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "BNR-6", title: "Monsoon Essentials", image: "https://picsum.photos/seed/banner-6/640/280", placement: "Category Page", status: "expired", startDate: new Date(Date.now() - 60 * 86400000).toISOString(), endDate: new Date(Date.now() - 30 * 86400000).toISOString() },
];
