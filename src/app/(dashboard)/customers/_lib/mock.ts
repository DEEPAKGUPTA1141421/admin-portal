// Local, self-contained derived mock data for the Customers module.
// Deterministic (own seed) so it doesn't disturb the shared generate.ts seed state.
import { CUSTOMERS_DATA, PRODUCTS_DATA } from "@/lib/mock/generate";
import { pick, randInt, daysAgo, makeId, resetSeed } from "@/lib/mock/seed";
import type { Customer } from "@/lib/types";

export interface CustomerAddress {
  id: string;
  customerId: string;
  customerName: string;
  type: "Home" | "Work" | "Other";
  line1: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface WishlistItem {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  addedAt: string;
}

export interface CustomerReview {
  id: string;
  customerId: string;
  customerName: string;
  productName: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "rejected" | "flagged";
  createdAt: string;
}

export interface CustomerTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  createdAt: string;
}

const STREETS = ["MG Road", "Park Street", "Ring Road", "Station Road", "Church Street", "Gandhi Nagar", "Lake View Road", "Hill Side Avenue"];
const TICKET_SUBJECTS = ["Order not delivered", "Wrong item received", "Refund not processed", "Payment deducted twice", "Account login issue", "Wallet balance mismatch", "Coupon not applied", "Damaged product received"];
const TICKET_CATEGORIES = ["Order Issue", "Payment Issue", "Refund Delay", "Product Quality", "Delivery Delay", "Account Issue"];

resetSeed(777);

function buildAddress(customer: Customer, type: CustomerAddress["type"], idx: number, isDefault: boolean): CustomerAddress {
  return {
    id: makeId(`ADDR-${customer.id}`, idx),
    customerId: customer.id,
    customerName: customer.name,
    type,
    line1: `${randInt(1, 999)}, ${pick(STREETS)}`,
    city: customer.city,
    state: customer.state,
    pincode: String(randInt(100000, 699999)),
    isDefault,
  };
}

export const CUSTOMER_ADDRESSES: CustomerAddress[] = CUSTOMERS_DATA.flatMap((c) => {
  const count = randInt(2, 3);
  const types: CustomerAddress["type"][] = ["Home", "Work", "Other"];
  return Array.from({ length: count }, (_, i) => buildAddress(c, types[i % types.length], i + 1, i === 0));
});

export const WISHLIST_ITEMS: WishlistItem[] = CUSTOMERS_DATA.filter((_, i) => i % 3 === 0).flatMap((c, ci) => {
  const count = randInt(1, 4);
  return Array.from({ length: count }, (_, i) => {
    const p = pick(PRODUCTS_DATA);
    return {
      id: makeId(`WISH-${ci}`, i + 1),
      customerId: c.id,
      customerName: c.name,
      productId: p.id,
      productName: p.name,
      productImage: p.image,
      price: p.price,
      addedAt: daysAgo(randInt(0, 90)),
    };
  });
});

const REVIEW_SNIPPETS = [
  "The product matches the description and arrived on time. Quality feels good for the price.",
  "Not what I expected, the material felt cheaper than in the pictures.",
  "Excellent quality and fast delivery, would definitely buy again.",
  "Packaging was damaged but the product itself was fine.",
  "Average experience, delivery took longer than promised.",
  "Highly recommend this seller, great customer service too.",
];

export const CUSTOMER_REVIEWS: CustomerReview[] = CUSTOMERS_DATA.filter((_, i) => i % 4 === 0).map((c, i) => {
  const p = pick(PRODUCTS_DATA);
  return {
    id: makeId("CREV", i + 1),
    customerId: c.id,
    customerName: c.name,
    productName: p.name,
    rating: randInt(1, 5),
    text: pick(REVIEW_SNIPPETS),
    status: pick(["pending", "approved", "approved", "approved", "rejected", "flagged"]),
    createdAt: daysAgo(randInt(0, 200)),
  };
});

export const CUSTOMER_TICKETS: CustomerTicket[] = CUSTOMERS_DATA.filter((_, i) => i % 5 === 0).map((c, i) => ({
  id: makeId("CTKT", i + 1),
  ticketNumber: `CTK-${30000 + i}`,
  customerId: c.id,
  customerName: c.name,
  subject: pick(TICKET_SUBJECTS),
  category: pick(TICKET_CATEGORIES),
  priority: pick(["low", "medium", "high", "urgent"]),
  status: pick(["open", "in_progress", "waiting_customer", "resolved", "closed"]),
  createdAt: daysAgo(randInt(0, 60)),
}));

export function addressesForCustomer(customerId: string) {
  return CUSTOMER_ADDRESSES.filter((a) => a.customerId === customerId);
}
export function wishlistForCustomer(customerId: string) {
  return WISHLIST_ITEMS.filter((w) => w.customerId === customerId);
}
export function reviewsForCustomer(customerId: string) {
  return CUSTOMER_REVIEWS.filter((r) => r.customerId === customerId);
}
export function ticketsForCustomer(customerId: string) {
  return CUSTOMER_TICKETS.filter((t) => t.customerId === customerId);
}
