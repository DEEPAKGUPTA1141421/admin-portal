"use client";

import { useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { RETURNS_DATA } from "@/lib/mock/generate";
import type { ReturnRequest, ReturnStatus } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/format";
import { toast } from "sonner";

const PICKUP_STATUSES: ReturnStatus[] = ["approved", "pickup_scheduled", "picked_up"];

export default function ReturnPickupPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>(() => RETURNS_DATA.filter((r) => PICKUP_STATUSES.includes(r.status)));
  const [scheduling, setScheduling] = useState<ReturnRequest | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);

  function confirmSchedule() {
    if (!scheduling || !date) {
      toast.error("Pick a pickup date first");
      return;
    }
    setReturns((prev) => prev.map((r) => (r.id === scheduling.id ? { ...r, status: "pickup_scheduled" } : r)));
    toast.success(`Pickup scheduled for ${scheduling.id} on ${formatDate(date.toISOString())}`);
    setScheduling(null);
    setDate(undefined);
  }

  function markPickedUp(r: ReturnRequest) {
    setReturns((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: "picked_up" } : x)));
    toast.success(`${r.id} marked as picked up`);
  }

  const columns: ColumnDef<ReturnRequest, unknown>[] = [
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image src={row.original.image} alt={row.original.productName} width={36} height={36} className="rounded-md object-cover" unoptimized />
          <div className="max-w-[200px] truncate font-medium">{row.original.productName}</div>
        </div>
      ),
    },
    { accessorKey: "orderNumber", header: "Order" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "sellerName", header: "Seller" },
    { accessorKey: "refundAmount", header: "Refund", cell: ({ row }) => formatINR(row.original.refundAmount) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex gap-1.5">
            {r.status === "approved" && (
              <Button size="sm" variant="outline" onClick={() => setScheduling(r)}>
                <CalendarIcon className="size-3.5" /> Schedule Pickup
              </Button>
            )}
            {r.status === "pickup_scheduled" && (
              <Button size="sm" variant="outline" onClick={() => markPickedUp(r)}>
                <PackageCheck className="size-3.5" /> Mark Picked Up
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Return Pickup" description={`${returns.length} returns in the pickup pipeline`} />

      <DataTable
        columns={columns}
        data={returns}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="return-pickup"
        emptyTitle="No pickups pending"
        emptyDescription="Approved returns awaiting pickup will appear here."
      />

      <Dialog open={!!scheduling} onOpenChange={(v) => { if (!v) { setScheduling(null); setDate(undefined); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Pickup</DialogTitle>
            <DialogDescription>Pick a pickup date for return {scheduling?.id} ({scheduling?.productName}).</DialogDescription>
          </DialogHeader>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start font-normal">
                <CalendarIcon className="size-4" />
                {date ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date() }} />
            </PopoverContent>
          </Popover>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduling(null)}>Cancel</Button>
            <Button onClick={confirmSchedule}>Confirm Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
