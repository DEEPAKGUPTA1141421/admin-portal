import { apiFetch } from "./client";
import type { Warehouse, WarehouseType } from "@/lib/types";

// DeliveryInventoryService's WarehouseController (/api/v1/warehouses) returns
// raw entities, not the {success,message,data,statusCode} envelope — use
// apiFetch, not apiFetchData.

interface WarehouseDto {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  lat: number;
  lng: number;
  capacityMaxParcels: number;
  capacityMaxKg: number;
  type: WarehouseType;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseInput {
  name: string;
  city: string;
  state: string;
  address: string;
  lat?: number;
  lng?: number;
  capacityMaxParcels: number;
  capacityMaxKg?: number;
  type: WarehouseType;
}

function toWarehouse(dto: WarehouseDto): Warehouse {
  return {
    id: dto.id,
    name: dto.name,
    city: dto.city,
    state: dto.state,
    address: dto.address,
    type: dto.type,
    // Frontend type only models a two-state status; MAINTENANCE collapses
    // into "inactive" since there's no third bucket to put it in.
    status: dto.status === "ACTIVE" ? "active" : "inactive",
    capacityMaxParcels: dto.capacityMaxParcels,
    // Backend has no concept of current occupancy on this entity yet —
    // real utilization would need to come from a parcel/shipment count
    // aggregate (e.g. the admin warehouse dashboard endpoint), not this
    // CRUD controller. Left at 0 rather than fabricating a number.
    capacityUsed: 0,
  };
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const list = await apiFetch<WarehouseDto[]>("deliveryInventory", "/api/v1/warehouses");
  return list.map(toWarehouse);
}

export async function createWarehouse(input: CreateWarehouseInput): Promise<Warehouse> {
  const dto = await apiFetch<WarehouseDto>("deliveryInventory", "/api/v1/warehouses", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      city: input.city,
      state: input.state,
      address: input.address,
      lat: input.lat ?? 0,
      lng: input.lng ?? 0,
      capacityMaxParcels: input.capacityMaxParcels,
      capacityMaxKg: input.capacityMaxKg ?? 0,
      type: input.type,
    }),
  });
  return toWarehouse(dto);
}
