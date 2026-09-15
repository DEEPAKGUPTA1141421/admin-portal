// Local datasets for Shipping & Logistics module pages with no backend endpoint
// yet (carriers, zones, rate cards, reverse logistics, SLA, rules). Empty until wired.

export interface DeliveryPartner {
  id: string;
  name: string;
  coverageAreas: number;
  activeShipments: number;
  onTimeRatePct: number;
  status: "active" | "inactive";
}

export const INITIAL_DELIVERY_PARTNERS: DeliveryPartner[] = [];

export interface ShippingZone {
  id: string;
  name: string;
  cities: string;
  baseRate: number;
  status: "active" | "inactive";
}

export const INITIAL_SHIPPING_ZONES: ShippingZone[] = [];

export interface ShippingRate {
  id: string;
  zone: string;
  weightSlab: string;
  rate: number;
  codSurcharge: number;
}

export const INITIAL_SHIPPING_RATES: ShippingRate[] = [];

export interface ReverseLogisticsRecord {
  id: string;
  orderNumber: string;
  product: string;
  pickupScheduledAt: string;
  status: "scheduled" | "picked-up" | "received";
}

export const INITIAL_REVERSE_LOGISTICS: ReverseLogisticsRecord[] = [];

export interface SlaRecord {
  carrier: string;
  avgDeliveryDays: number;
  slaTargetDays: number;
  complianceRatePct: number;
  violations: number;
}

export const DELIVERY_SLA: SlaRecord[] = [];

export interface ShippingRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  status: "active" | "inactive";
}

export const INITIAL_SHIPPING_RULES: ShippingRule[] = [];

export const FAILED_ORDER_REASONS: Record<string, string> = {};
