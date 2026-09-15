"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReturnDetailSheet } from "../_components/return-detail-sheet";
import { RETURNS_DATA } from "@/lib/mock/generate";
import { fetchReturns, approveReturn, rejectReturn, mapReturnDtoToReturnRequest } from "@/lib/api/returns";
import type { ReturnRequest } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function ReturnRequestsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>(RETURNS_DATA);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<ReturnRequest | null>(null);
  const [approving, setApproving] = useState<ReturnRequest | null>(null);
  const [rejecting, setRejecting] = useState<ReturnRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    setLoading(true);
    fetchReturns({ bucket: "ALL", size: 50 })
      .then((data) => setReturns(data.returns.map(mapReturnDtoToReturnRequest)))
      .catch(() => toast.error("Could not load data — backend unreachable"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function approve() {
    if (!approving) return;
    try {
      await approveReturn(approving.id);
      toast.success(`Return ${approving.id} approved`);
      load();
    } catch {
      toast.error("Failed to approve return");
    }
    setApproving(null);
  }

  async function reject() {
    if (!rejecting) return;
    try {
      await rejectReturn(rejecting.id, rejectReason || undefined);
      toast.error(`Return ${rejecting.id} rejected${rejectReason ? `: ${rejectReason}` : ""}`);
      load();
    } catch {
      toast.error("Failed to reject return");
    }
    setRejecting(null);
    setRejectReason("");
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
    { accessorKey: "reason", header: "Reason" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "refundAmount", header: "Refund", cell: ({ row }) => formatINR(row.original.refundAmount) },
    { accessorKey: "requestedAt", header: "Requested", cell: ({ row }) => formatDate(row.original.requestedAt) },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewing(r)}>View</DropdownMenuItem>
              {(r.status === "requested" || r.status === "pending") && (
                <>
                  <DropdownMenuItem onClick={() => setApproving(r)}>Approve</DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => setRejecting(r)}>Reject</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Return Requests"
        description={loading ? "Loading return requests..." : `${returns.length} return requests across the marketplace`}
      />

      <DataTable
        columns={columns}
        data={returns}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="return-requests"
        emptyTitle="No return requests"
        emptyDescription="Return requests raised by customers will appear here."
      />

      <ReturnDetailSheet returnRequest={viewing} open={!!viewing} onOpenChange={(v) => !v && setViewing(null)} />

      <AlertDialog open={!!approving} onOpenChange={(v) => !v && setApproving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve return?</AlertDialogTitle>
            <AlertDialogDescription>
              This approves return {approving?.id} for order {approving?.orderNumber} and moves it to pickup scheduling.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={approve}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!rejecting} onOpenChange={(v) => { if (!v) { setRejecting(null); setRejectReason(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject return?</AlertDialogTitle>
            <AlertDialogDescription>
              This rejects return {rejecting?.id}. Provide a reason for the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-1.5 px-1">
            <Label>Rejection reason</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Item does not qualify for return per policy" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={reject}>Reject</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
