// Local mock datasets for Shipping & Logistics module pages with no dedicated
// dataset in generate.ts (carriers, zones, rate cards, reverse logistics, SLA, rules).
import { ORDERS_DATA } from "./generate";
import { CARRIERS } from "./reference";
import { pick, randInt, randFloat, daysAgo, futureDays, makeId, resetSeed } from "./seed";

resetSeed(905);

export interface DeliveryPartner {
  id: string;
  name: string;
  coverageAreas: number;
  activeShipments: number;
  onTimeRatePct: number;
  status: "active" | "inactive";
}

export const INITIAL_DELIVERY_PARTNERS: DeliveryPartner[] = CARRIERS.map((name, i) => ({
  id: makeId("CAR", i + 1),
  name,
  coverageAreas: randInt(40, 620),
  activeShipments: randInt(50, 3000),
  onTimeRatePct: randFloat(82, 98, 1),
  status: "active",
}));

export interface ShippingZone {
  id: string;
  name: string;
  cities: string;
  baseRate: number;
  status: "active" | "inactive";
}

export const INITIAL_SHIPPING_ZONES: ShippingZone[] = [
  { id: "ZN-1", name: "Zone A — Metro", cities: "Mumbai, Delhi, Bengaluru, Chennai", baseRate: 49, status: "active" },
  { id: "ZN-2", name: "Zone B — Tier 1", cities: "Pune, Hyderabad, Ahmedabad, Kolkata", baseRate: 59, status: "active" },
  { id: "ZN-3", name: "Zone C — Tier 2", cities: "Jaipur, Lucknow, Indore, Bhopal", baseRate: 79, status: "active" },
  { id: "ZN-4", name: "Zone D — Tier 3 / Rural", cities: "Guwahati, Patna, Bhubaneswar, Kochi", baseRate: 99, status: "active" },
  { id: "ZN-5", name: "Zone E — Remote", cities: "North East & Island regions", baseRate: 149, status: "inactive" },
];

export interface ShippingRate {
  id: string;
  zone: string;
  weightSlab: string;
  rate: number;
  codSurcharge: number;
}

const WEIGHT_SLABS = ["0–0.5 kg", "0.5–1 kg", "1–2 kg", "2–5 kg", "5–10 kg", "10+ kg"];
export const INITIAL_SHIPPING_RATES: ShippingRate[] = INITIAL_SHIPPING_ZONES.flatMap((z) =>
  WEIGHT_SLABS.map((slab, i) => ({
    id: `${z.id}-${i}`,
    zone: z.name,
    weightSlab: slab,
    rate: z.baseRate + i * 20,
    codSurcharge: randInt(15, 40),
  }))
);

export interface ReverseLogisticsRecord {
  id: string;
  orderNumber: string;
  product: string;
  pickupScheduledAt: string;
  status: "scheduled" | "picked-up" | "received";
}

export const INITIAL_REVERSE_LOGISTICS: ReverseLogisticsRecord[] = Array.from({ length: 28 }, (_, i) => {
  const order = pick(ORDERS_DATA);
  const item = pick(order.items);
  return {
    id: makeId("RL", i + 1),
    orderNumber: order.orderNumber,
    product: item.productName,
    pickupScheduledAt: daysAgo(randInt(-10, 20)),
    status: pick(["scheduled", "picked-up", "received", "received"]),
  };
});

export interface SlaRecord {
  carrier: string;
  avgDeliveryDays: number;
  slaTargetDays: number;
  complianceRatePct: number;
  violations: number;
}

export const DELIVERY_SLA: SlaRecord[] = CARRIERS.map((carrier) => ({
  carrier,
  avgDeliveryDays: randFloat(1.8, 5.5, 1),
  slaTargetDays: pick([2, 3, 4]),
  complianceRatePct: randFloat(78, 99, 1),
  violations: randInt(2, 80),
}));

export interface ShippingRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  status: "active" | "inactive";
}

export const INITIAL_SHIPPING_RULES: ShippingRule[] = [
  { id: "RULE-1", name: "Free shipping over ₹999", condition: "Order value > ₹999", action: "Waive shipping fee", status: "active" },
  { id: "RULE-2", name: "COD surcharge — remote zones", condition: "Zone = Remote AND payment = COD", action: "Add ₹40 COD surcharge", status: "active" },
  { id: "RULE-3", name: "Express for Prime metro", condition: "City in Metro Zone AND weight < 2kg", action: "Use express carrier", status: "active" },
  { id: "RULE-4", name: "Bulk order surcharge", condition: "Weight > 10kg", action: "Add ₹150 handling fee", status: "active" },
  { id: "RULE-5", name: "Festive season priority", condition: "Order placed during festive campaign", action: "Priority dispatch within 12h", status: "inactive" },
  { id: "RULE-6", name: "Fragile item packaging", condition: "Category = Electronics OR Jewellery", action: "Apply fragile packaging + insurance", status: "active" },
];

const FAILURE_REASONS = [
  "Customer unavailable", "Incorrect address", "Refused by customer",
  "Area not serviceable", "Payment not collected (COD)", "Damaged in transit",
];

export const FAILED_ORDER_REASONS: Record<string, string> = Object.fromEntries(
  ORDERS_DATA.filter((o) => (o.status === "failed" || o.status === "cancelled") && o.carrier).map((o) => [o.id, pick(FAILURE_REASONS)])
);

export { randFloat };
