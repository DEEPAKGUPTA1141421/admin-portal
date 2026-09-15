// Local datasets for Inventory module pages that have no backend endpoint yet
// (transfers, adjustments, reservations, history, POs, suppliers). Empty until wired.

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

export const INITIAL_TRANSFERS: TransferRecord[] = [];

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

export const INITIAL_ADJUSTMENTS: AdjustmentRecord[] = [];

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

export const INITIAL_RESERVATIONS: ReservationRecord[] = [];

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

export const INVENTORY_HISTORY: HistoryRecord[] = [];

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

export const INITIAL_PURCHASE_ORDERS: PurchaseOrderRecord[] = [];

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

export const INITIAL_SUPPLIERS: SupplierRecord[] = [];

export const ADJUSTMENT_TYPES: AdjustmentType[] = ["damage", "correction", "return"];
export const ADJUSTERS_LIST: string[] = [];
