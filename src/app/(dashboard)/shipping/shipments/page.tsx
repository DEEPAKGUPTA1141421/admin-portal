"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { fetchShipments, type ShipmentRow, type ShipmentStatus } from "@/lib/api/shipments";
import { formatDate, formatNumber } from "@/lib/format";

const STATUS_OPTIONS: { value: ShipmentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "CREATED", label: "Created" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "AT_DESTINATION", label: "At Destination" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function ShipmentsPage() {
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "ALL">("ALL");
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState<ShipmentRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchShipments({ status: statusFilter, size: 50 })
      .then(({ shipments: rows }) => {
        if (cancelled) return;
        setShipments(rows);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Could not load shipments — backend unreachable");
        setShipments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  const columns = useMemo<ColumnDef<ShipmentRow, unknown>[]>(
    () => [
      { accessorKey: "shipmentNo", header: "Shipment #" },
      { accessorKey: "shipmentType", header: "Type", cell: ({ row }) => row.original.shipmentType.replace(/_/g, " ") },
      { id: "route", header: "Route", cell: ({ row }) => `${row.original.originCity} → ${row.original.destinationCity}` },
      { accessorKey: "parcelCount", header: "Parcels", cell: ({ row }) => formatNumber(row.original.parcelCount) },
      { accessorKey: "totalWeightKg", header: "Weight (kg)", cell: ({ row }) => row.original.totalWeightKg.toFixed(1) },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status.toLowerCase()} /> },
      { accessorKey: "departureTimeEst", header: "Departure (est.)", cell: ({ row }) => formatDate(row.original.departureTimeEst) },
      { accessorKey: "arrivalTimeEst", header: "Arrival (est.)", cell: ({ row }) => formatDate(row.original.arrivalTimeEst) },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setTrack(row.original)}>Track</Button>,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipments"
        description="Warehouse-to-warehouse shipments currently in the logistics pipeline"
        actions={
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ShipmentStatus | "ALL")}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={shipments}
          searchKey="shipmentNo"
          searchPlaceholder="Search by shipment number..."
          exportName="shipments"
          emptyTitle="No shipments"
        />
      )}

      <Dialog open={!!track} onOpenChange={(o) => !o && setTrack(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shipment Tracking — {track?.shipmentNo}</DialogTitle>
            <DialogDescription>Route and parcel details for this shipment.</DialogDescription>
          </DialogHeader>
          {track && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{track.shipmentType.replace(/_/g, " ")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span className="font-medium">{track.originCity} → {track.destinationCity}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Parcels</span><span className="font-medium">{formatNumber(track.parcelCount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Weight</span><span className="font-medium">{track.totalWeightKg.toFixed(1)} kg</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={track.status.toLowerCase()} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Departure (est.)</span><span className="font-medium">{formatDate(track.departureTimeEst)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Arrival (est.)</span><span className="font-medium">{formatDate(track.arrivalTimeEst)}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
