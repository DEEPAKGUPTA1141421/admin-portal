// Local mock datasets for Inventory module pages that have no dedicated
// dataset in generate.ts (transfers, adjustments, reservations, history, POs, suppliers).
import { INVENTORY_DATA, WAREHOUSES_DATA } from "./generate";
import { pick, randInt, randFloat, daysAgo, futureDays, makeId, resetSeed } from "./seed";

resetSeed(701);

export type TransferStatus = "pending" | "in-transit" | "completed";
export interface TransferRecord {
  id: string;
  product: string;
  sku: string;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  status: TransferStatus;
  initiatedAt: string;
}

export const INITIAL_TRANSFERS: TransferRecord[] = Array.from({ length: 24 }, (_, i) => {
  const item = pick(INVENTORY_DATA);
  const from = pick(WAREHOUSES_DATA);
  let to = pick(WAREHOUSES_DATA);
  while (to.id === from.id) to = pick(WAREHOUSES_DATA);
  return {
    id: makeId("TRF", i + 1),
    product: item.productName,
    sku: item.sku,
    fromWarehouse: from.name,
    toWarehouse: to.name,
    quantity: randInt(5, 200),
    status: pick<TransferStatus>(["pending", "in-transit", "completed", "completed"]),
    initiatedAt: daysAgo(randInt(0, 45)),
  };
});

export type AdjustmentType = "damage" | "correction" | "return";
export interface AdjustmentRecord {
  id: string;
  product: string;
  sku: string;
  warehouse: string;
  type: AdjustmentType;
  quantityDelta: number;
  adjustedBy: string;
  date: string;
  reason: string;
}

const ADJUSTERS = ["Ritu Sharma", "Karan Mehta", "Sneha Iyer", "Vikas Rao", "Ayesha Khan"];
const ADJUSTMENT_REASONS: Record<AdjustmentType, string[]> = {
  damage: ["Damaged in warehouse", "Water damage", "Broken during handling"],
  correction: ["Cycle count correction", "System reconciliation", "Miscount fix"],
  return: ["Customer return restocked", "Return to seller", "Restocked from RTO"],
};

export const INITIAL_ADJUSTMENTS: AdjustmentRecord[] = Array.from({ length: 30 }, (_, i) => {
  const item = pick(INVENTORY_DATA);
  const type = pick<AdjustmentType>(["damage", "correction", "return"]);
  const delta = type === "damage" ? -randInt(1, 15) : type === "return" ? randInt(1, 10) : randInt(-10, 10);
  return {
    id: makeId("ADJ", i + 1),
    product: item.productName,
    sku: item.sku,
    warehouse: item.warehouseName,
    type,
    quantityDelta: delta,
    adjustedBy: pick(ADJUSTERS),
    date: daysAgo(randInt(0, 60)),
    reason: pick(ADJUSTMENT_REASONS[type]),
  };
});

export type ReservationStatus = "active" | "released";
export interface ReservationRecord {
  id: string;
  product: string;
  sku: string;
  warehouse: string;
  quantity: number;
  reservedFor: string;
  reservedAt: string;
  status: ReservationStatus;
}

export const INITIAL_RESERVATIONS: ReservationRecord[] = Array.from({ length: 26 }, (_, i) => {
  const item = pick(INVENTORY_DATA);
  return {
    id: makeId("RSV", i + 1),
    product: item.productName,
    sku: item.sku,
    warehouse: item.warehouseName,
    quantity: randInt(1, 10),
    reservedFor: `Order #MP${100000 + randInt(0, 379)}`,
    reservedAt: daysAgo(randInt(0, 20)),
    status: pick<ReservationStatus>(["active", "active", "active", "released"]),
  };
});

export type MovementAction = "received" | "shipped" | "adjusted" | "transferred";
export interface HistoryRecord {
  id: string;
  timestamp: string;
  product: string;
  sku: string;
  warehouse: string;
  action: MovementAction;
  quantity: number;
  performedBy: string;
}

export const INVENTORY_HISTORY: HistoryRecord[] = Array.from({ length: 80 }, (_, i) => {
  const item = pick(INVENTORY_DATA);
  const action = pick<MovementAction>(["received", "shipped", "adjusted", "transferred"]);
  return {
    id: makeId("MOV", i + 1),
    timestamp: daysAgo(randInt(0, 90)),
    product: item.productName,
    sku: item.sku,
    warehouse: item.warehouseName,
    action,
    quantity: action === "shipped" ? -randInt(1, 40) : randInt(1, 60),
    performedBy: pick(ADJUSTERS),
  };
});

export type POStatus = "draft" | "sent" | "received";
export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  supplier: string;
  product: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  status: POStatus;
  expectedDate: string;
}

const SUPPLIER_NAMES = [
  "Apex Distributors", "Northline Traders", "BlueCrest Supplies", "Vantage Wholesale",
  "Metro Sourcing Co.", "Everstock Ltd.", "Prime Vendor Partners", "Coastal Goods Supply",
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrderRecord[] = Array.from({ length: 22 }, (_, i) => {
  const item = pick(INVENTORY_DATA);
  const qty = randInt(20, 500);
  const unitCost = randInt(50, 5000);
  return {
    id: makeId("PO", i + 1),
    poNumber: `PO-${2026}${String(randInt(1000, 9999))}`,
    supplier: pick(SUPPLIER_NAMES),
    product: item.productName,
    quantity: qty,
    unitCost,
    totalCost: qty * unitCost,
    status: pick<POStatus>(["draft", "sent", "sent", "received"]),
    expectedDate: futureDays(randInt(1, 30)),
  };
});

export interface SupplierRecord {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  productsSupplied: number;
  status: "active" | "inactive";
}

const SUPPLIER_CONTACTS = ["Rakesh Jain", "Meena Krishnan", "Sandeep Bhatia", "Anjali Desai", "Farhan Ali", "Deepika Menon"];

export const INITIAL_SUPPLIERS: SupplierRecord[] = SUPPLIER_NAMES.map((name, i) => ({
  id: makeId("SUP", i + 1),
  name,
  contactPerson: pick(SUPPLIER_CONTACTS),
  phone: `9${String(randInt(100000000, 999999999))}`,
  email: `contact@${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example`,
  city: pick(WAREHOUSES_DATA).city,
  productsSupplied: randInt(5, 120),
  status: pick(["active", "active", "active", "inactive"]),
}));

export const ADJUSTMENT_TYPES: AdjustmentType[] = ["damage", "correction", "return"];
export const ADJUSTERS_LIST = ADJUSTERS;
export { randFloat };
