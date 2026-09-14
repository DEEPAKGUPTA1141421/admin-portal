// Local mock datasets for Payments module pages with no dedicated dataset
// in generate.ts (gateway configs, method toggles, tax breakdown, chargebacks).
import { PAYMENTS_DATA } from "./generate";
import { pick, randInt, randFloat, daysAgo, makeId, resetSeed } from "./seed";

resetSeed(803);

export interface GatewayConfig {
  id: string;
  name: string;
  status: "active" | "inactive";
  mode: "live" | "test";
  successRatePct: number;
  apiKey: string;
}

export const INITIAL_GATEWAYS: GatewayConfig[] = [
  { id: "GW-1", name: "Razorpay", status: "active", mode: "live", successRatePct: 97.8, apiKey: "rzp_live_••••••••4f2a" },
  { id: "GW-2", name: "PayU", status: "active", mode: "live", successRatePct: 95.2, apiKey: "payu_live_••••••••91cd" },
  { id: "GW-3", name: "Cashfree", status: "active", mode: "test", successRatePct: 93.6, apiKey: "cf_test_••••••••7b31" },
  { id: "GW-4", name: "Paytm", status: "inactive", mode: "test", successRatePct: 89.4, apiKey: "ptm_test_••••••••c05e" },
];

export interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  displayOrder: number;
}

export const INITIAL_PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: "PM-1", name: "UPI", enabled: true, displayOrder: 1 },
  { id: "PM-2", name: "Credit Card", enabled: true, displayOrder: 2 },
  { id: "PM-3", name: "Debit Card", enabled: true, displayOrder: 3 },
  { id: "PM-4", name: "Net Banking", enabled: true, displayOrder: 4 },
  { id: "PM-5", name: "COD", enabled: true, displayOrder: 5 },
  { id: "PM-6", name: "Wallet", enabled: false, displayOrder: 6 },
];

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

const HSN_CODES = ["8517", "8471", "6109", "6203", "9403", "8516", "3304", "8544", "6404", "8528"];
const GST_SLABS = [0, 5, 12, 18, 28];

export const TAX_TRANSACTIONS: TaxTransaction[] = PAYMENTS_DATA.slice(0, 120).map((p, i) => {
  const gstPct = pick(GST_SLABS);
  const taxableAmount = Math.round(p.amount / (1 + gstPct / 100));
  return {
    id: makeId("TAX", i + 1),
    orderNumber: p.orderNumber,
    customerName: p.customerName,
    taxableAmount,
    gstPct,
    gstAmount: p.amount - taxableAmount,
    hsn: pick(HSN_CODES),
    createdAt: p.createdAt,
  };
});

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

const CHARGEBACK_REASONS = [
  "Unauthorized transaction", "Product not received", "Product not as described",
  "Duplicate charge", "Subscription cancelled", "Fraudulent card use",
];

const disputedPool = PAYMENTS_DATA.filter((p) => p.status === "disputed");
export const CHARGEBACKS: ChargebackRecord[] = (disputedPool.length ? disputedPool : PAYMENTS_DATA.slice(0, 12))
  .slice(0, 18)
  .map((p, i) => ({
    id: makeId("CB", i + 1),
    orderNumber: p.orderNumber,
    customerName: p.customerName,
    amount: p.amount,
    gateway: p.gateway,
    reason: pick(CHARGEBACK_REASONS),
    filedAt: daysAgo(randInt(0, 30)),
    status: pick(["open", "open", "accepted", "contested", "resolved"]),
  }));

export { randFloat };
