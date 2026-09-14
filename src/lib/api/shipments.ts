import { apiFetchData } from "./client";

// DeliveryInventoryService's AdminShipmentController (/api/v1/admin/shipments)
// returns the {success,message,data,statusCode} envelope — use apiFetchData.
// This is a genuinely different entity from the frontend's mock "shipments"
// (which were really just Orders with a carrier/tracking number stapled on).
// A real Shipment is a warehouse-to-warehouse batch of parcels — it has no
// customer, no single order, no carrier name. There's no way to map the old
// Order-shaped mock data onto this without fabricating fields, so this page
// was rebuilt around the real shape instead of forcing a bad mapping.

export type ShipmentStatus =
  | "CREATED"
  | "ASSIGNED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "AT_DESTINATION"
  | "DELIVERED"
  | "CANCELLED";

export interface ShipmentRow {
  id: string;
  shipmentNo: string;
  shipmentType: string;
  originWarehouseId: string;
  destinationWarehouseId: string;
  originCity: string;
  destinationCity: string;
  parcelCount: number;
  totalWeightKg: number;
  status: ShipmentStatus;
  departureTimeEst: string | null;
  arrivalTimeEst: string | null;
  createdAt: string;
}

interface ShipmentListResponse {
  shipments: ShipmentRow[];
  currentPage: number;
  totalShipments: number;
  totalPages: number;
  hasNext: boolean;
}

export async function fetchShipments(params: {
  status?: string;
  page?: number;
  size?: number;
} = {}): Promise<{ shipments: ShipmentRow[]; totalShipments: number; totalPages: number }> {
  const qs = new URLSearchParams();
  if (params.status && params.status !== "ALL") qs.set("status", params.status);
  qs.set("page", String(params.page ?? 0));
  qs.set("size", String(params.size ?? 50));

  const res = await apiFetchData<ShipmentListResponse>(
    "deliveryInventory",
    `/api/v1/admin/shipments?${qs.toString()}`
  );
  return { shipments: res.shipments, totalShipments: res.totalShipments, totalPages: res.totalPages };
}
