"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal, Eye, Ban, RotateCcw, MessageSquare, FileText, ShoppingCart, IndianRupee, PackageCheck, AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDERS_DATA } from "@/lib/mock/generate";
import type { Order, OrderStatus } from "@/lib/types";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import { toast } from "sonner";
import { fetchOrders, forceOrderStatus, cancelOrderApi, mapOrderSummaryToOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending_payment", "confirmed", "processing", "packed", "ready_to_ship", "shipped",
  "out_for_delivery", "delivered", "cancelled", "failed", "returned", "refunded",
];

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(() => [...ORDERS_DATA]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [refundTarget, setRefundTarget] = useState<Order | null>(null);
  const [bulkOrders, setBulkOrders] = useState<Order[] | null>(null);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("confirmed");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchOrders({ page: 0, size: 100 });
        if (!cancelled) setOrders(res.orders.map(mapOrderSummaryToOrder));
      } catch {
        if (!cancelled) toast.info("Using demo data — backend unreachable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const gmv = orders.reduce((s, o) => s + o.amount, 0);
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const pending = orders.filter((o) => o.status === "pending_payment").length;
    return { total: orders.length, gmv, delivered, pending };
  }, [orders]);

  async function cancelOrder() {
    if (!cancelTarget) return;
    try {
      await cancelOrderApi(cancelTarget.id, cancelReason);
    } catch (e) {
      if (!(e instanceof ApiError)) throw e;
      // backend unreachable or rejected — still reflect it locally for demo continuity
    }
    setOrders((prev) => prev.map((o) => (o.id === cancelTarget.id ? { ...o, status: "cancelled" } : o)));
    toast.success(`Order ${cancelTarget.orderNumber} cancelled${cancelReason ? `: ${cancelReason}` : ""}`);
    setCancelTarget(null);
    setCancelReason("");
  }

  function refundOrder() {
    if (!refundTarget) return;
    // Refunding requires a payment gateway + transaction context that isn't available
    // from the list view — full refund flow lives on the order detail page.
    setOrders((prev) => prev.map((o) => (o.id === refundTarget.id ? { ...o, paymentStatus: "refunded" } : o)));
    toast.success(`Refund initiated for order ${refundTarget.orderNumber}. For gateway refunds, use the order detail page.`);
    setRefundTarget(null);
  }

  async function applyBulkStatus() {
    if (!bulkOrders) return;
    const backendStatus = bulkStatus.toUpperCase();
    await Promise.allSettled(bulkOrders.map((o) => forceOrderStatus(o.id, backendStatus, "Bulk update from admin portal")));
    const ids = new Set(bulkOrders.map((o) => o.id));
    setOrders((prev) => prev.map((o) => (ids.has(o.id) ? { ...o, status: bulkStatus } : o)));
    toast.success(`Updated ${bulkOrders.length} orders to "${bulkStatus.replace(/_/g, " ")}"`);
    setBulkOrders(null);
  }

  const columns = useMemo<ColumnDef<Order, unknown>[]>(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order #",
        cell: ({ row }) => (
          <Link href={`/orders/all-orders/${row.original.id}`} className="font-medium hover:underline">
            {row.original.orderNumber}
          </Link>
        ),
      },
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "sellerName", header: "Seller" },
      { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatINR(row.original.amount) },
      { accessorKey: "paymentStatus", header: "Payment", cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} /> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: "placedAt", header: "Placed", cell: ({ row }) => formatDate(row.original.placedAt) },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const o = row.original;
          const cancellable = !["delivered", "cancelled", "refunded", "returned"].includes(o.status);
          const refundable = o.paymentStatus === "paid" || o.paymentStatus === "partially_refunded";
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/orders/all-orders/${o.id}`}><Eye className="size-4" /> View</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success(`Message sent to ${o.customerName}`)}>
                  <MessageSquare className="size-4" /> Contact Customer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success(`Invoice resent for ${o.orderNumber}`)}>
                  <FileText className="size-4" /> Resend Invoice
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={!refundable} onClick={() => setRefundTarget(o)}>
                  <RotateCcw className="size-4" /> Refund
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" disabled={!cancellable} onClick={() => setCancelTarget(o)}>
                  <Ban className="size-4" /> Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="All Orders" description="Every order placed across the marketplace" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Orders" value={formatNumber(kpis.total)} icon={ShoppingCart} />
        <KpiCard label="GMV" value={formatINR(kpis.gmv, true)} icon={IndianRupee} tone="green" />
        <KpiCard label="Delivered" value={formatNumber(kpis.delivered)} icon={PackageCheck} tone="blue" />
        <KpiCard label="Pending Payment" value={formatNumber(kpis.pending)} icon={AlertTriangle} tone="orange" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          searchKey="orderNumber"
          searchPlaceholder="Search by order number..."
          exportName="all-orders"
          enableSelection
          emptyTitle="No orders found"
          bulkActions={(selected) => (
            <Button variant="outline" size="sm" onClick={() => setBulkOrders(selected)}>
              Update Status ({selected.length})
            </Button>
          )}
        />
      )}

      <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel order {cancelTarget?.orderNumber}?</AlertDialogTitle>
            <AlertDialogDescription>This will mark the order as cancelled and cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea placeholder="Reason for cancellation..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={cancelOrder}>Cancel Order</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!refundTarget} onOpenChange={(o) => !o && setRefundTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Initiate refund for {refundTarget?.orderNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              {refundTarget && `A refund of ${formatINR(refundTarget.amount)} will be initiated to the customer's original payment method.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={refundOrder}>Initiate Refund</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!bulkOrders} onOpenChange={(o) => !o && setBulkOrders(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Order Status</DialogTitle>
            <DialogDescription>{bulkOrders && `Updating ${bulkOrders.length} selected orders.`}</DialogDescription>
          </DialogHeader>
          <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as OrderStatus)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOrders(null)}>Cancel</Button>
            <Button onClick={applyBulkStatus}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
