// Local datasets for Payments module pages with no backend endpoint yet
// (gateway configs, method toggles, tax breakdown, chargebacks). Empty until wired.

export interface GatewayConfig {
  id: string;
  name: string;
  status: "active" | "inactive";
  mode: "live" | "test";
  successRatePct: number;
  apiKey: string;
}

export const INITIAL_GATEWAYS: GatewayConfig[] = [];

export interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  displayOrder: number;
}

export const INITIAL_PAYMENT_METHODS: PaymentMethodConfig[] = [];

export interface TaxTransaction {
  id: string;
  orderNumber: string;
  customerName: string;
  taxableAmount: number;
  gstPct: number;
  gstAmount: number;
  hsn: string;
  createdAt: string;
}

export const TAX_TRANSACTIONS: TaxTransaction[] = [];

export interface ChargebackRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  gateway: string;
  reason: string;
  filedAt: string;
  status: "open" | "accepted" | "contested" | "resolved";
}

export const CHARGEBACKS: ChargebackRecord[] = [];
