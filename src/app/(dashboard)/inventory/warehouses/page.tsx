"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WAREHOUSES_DATA as INITIAL_DATA } from "@/lib/mock/generate";
import { fetchWarehouses, createWarehouse } from "@/lib/api/warehouses";
import type { Warehouse, WarehouseType } from "@/lib/types";
import { formatNumber, formatPct } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

const TYPES: WarehouseType[] = ["STAGING", "REGIONAL", "LAST_MILE_DEPOT"];

function WarehouseFormDialog({
  warehouse, onSave, trigger,
}: {
  warehouse?: Warehouse;
  onSave: (w: Warehouse) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(warehouse?.name ?? "");
  const [city, setCity] = useState(warehouse?.city ?? "");
  const [state, setState] = useState(warehouse?.state ?? "");
  const [address, setAddress] = useState(warehouse?.address ?? "");
  const [type, setType] = useState<WarehouseType>(warehouse?.type ?? "REGIONAL");
  const [capacity, setCapacity] = useState(String(warehouse?.capacityMaxParcels ?? 10000));

  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name || !city || !state) {
      toast.error("Name, city and state are required");
      return;
    }

    // Editing has no real backend endpoint on WarehouseController (create +
    // list/get only) — keep edit as local-only optimistic UI.
    if (warehouse) {
      onSave({
        id: warehouse.id,
        name, city, state,
        address: address || `${city}, ${state}`,
        type,
        status: warehouse.status,
        capacityMaxParcels: Number(capacity) || 10000,
        capacityUsed: warehouse.capacityUsed,
      });
      toast.success("Warehouse updated");
      setOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      const created = await createWarehouse({
        name, city, state,
        address: address || `${city}, ${state}`,
        type,
        capacityMaxParcels: Number(capacity) || 10000,
      });
      onSave(created);
      toast.success("Warehouse added");
      setOpen(false);
    } catch {
      onSave({
        id: `WH-NEW-${Date.now()}`,
        name, city, state,
        address: address || `${city}, ${state}`,
        type,
        status: "active",
        capacityMaxParcels: Number(capacity) || 10000,
        capacityUsed: 0,
      });
      toast.error("Could not reach backend — added locally only");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{warehouse ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
          <DialogDescription>Configure warehouse details and capacity.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="wh-name">Name</Label>
            <Input id="wh-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="wh-city">City</Label>
              <Input id="wh-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wh-state">State</Label>
              <Input id="wh-state" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wh-address">Address</Label>
            <Input id="wh-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WarehouseType)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wh-capacity">Max Capacity (parcels)</Label>
              <Input id="wh-capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Saving..." : warehouse ? "Save Changes" : "Add Warehouse"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WarehouseDetailSheet({ warehouse, open, onOpenChange }: { warehouse: Warehouse | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!warehouse) return null;
  const pct = Math.min(100, Math.round((warehouse.capacityUsed / warehouse.capacityMaxParcels) * 100));
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{warehouse.name}</SheetTitle>
          <SheetDescription>{warehouse.type.replace(/_/g, " ")} · {warehouse.city}, {warehouse.state}</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-4 text-sm">
          <div>
            <p className="text-muted-foreground">Address</p>
            <p className="font-medium">{warehouse.address}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <StatusBadge status={warehouse.status} />
          </div>
          <div>
            <div className="flex justify-between text-muted-foreground mb-1">
              <span>Capacity Utilization</span>
              <span>{formatPct(pct)}</span>
            </div>
            <Progress value={pct} />
            <p className="mt-1 text-xs text-muted-foreground">{formatNumber(warehouse.capacityUsed)} / {formatNumber(warehouse.capacityMaxParcels)} parcels</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function WarehousesPage() {
  const [data, setData] = useState<Warehouse[]>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Warehouse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchWarehouses()
      .then((live) => {
        if (cancelled) return;
        if (live.length > 0) setData(live);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load data — backend unreachable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const upsert = (w: Warehouse) => {
    setData((prev) => {
      const exists = prev.some((p) => p.id === w.id);
      return exists ? prev.map((p) => (p.id === w.id ? w : p)) : [w, ...prev];
    });
  };

  const columns: ColumnDef<Warehouse, unknown>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => (
      <button className="font-medium hover:underline" onClick={() => setDetail(row.original)}>{row.original.name}</button>
    ) },
    { accessorKey: "city", header: "City" },
    { accessorKey: "state", header: "State" },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <StatusBadge status={row.original.type} /> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "utilization",
      header: "Capacity Utilization",
      cell: ({ row }) => {
        const w = row.original;
        const pct = Math.min(100, Math.round((w.capacityUsed / w.capacityMaxParcels) * 100));
        return (
          <div className="w-40">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{formatNumber(w.capacityUsed)}/{formatNumber(w.capacityMaxParcels)}</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setDetail(row.original)}>View Details</DropdownMenuItem>
            <WarehouseFormDialog
              warehouse={row.original}
              onSave={upsert}
              trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description="Fulfillment centers, regional hubs, and last-mile depots"
        actions={<WarehouseFormDialog onSave={upsert} trigger={<Button size="sm"><Plus /> Add Warehouse</Button>} />}
      />
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchKey="name"
          searchPlaceholder="Search warehouses..."
          exportName="warehouses"
          emptyTitle="No warehouses"
        />
      )}
      <WarehouseDetailSheet warehouse={detail} open={!!detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  );
}
