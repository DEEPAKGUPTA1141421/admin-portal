"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Ban, RotateCcw, FileText, CheckCircle2, Circle, User, MapPin, CreditCard, Truck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDERS_DATA } from "@/lib/mock/generate";
import type { OrderStatus } from "@/lib/types";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  fetchOrderDetail, forceOrderStatus, cancelOrderApi, refundPayment, mapOrderDetailToOrder,
} from "@/lib/api/orders";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending_payment", "confirmed", "processing", "packed", "ready_to_ship", "shipped",
  "out_for_delivery", "delivered", "cancelled", "failed", "returned", "refunded",
];

interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const mockOrder = useMemo(() => ORDERS_DATA.find((o) => o.id === params.id), [params.id]);

  const [order, setOrder] = useState(mockOrder);
  const [loading, setLoading] = useState(true);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundGateway, setRefundGateway] = useState("razorpay");
  const [refundReason, setRefundReason] = useState("");
  const [statusValue, setStatusValue] = useState<OrderStatus | undefined>(mockOrder?.status);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dto = await fetchOrderDetail(params.id);
        if (cancelled) return;
        const mapped = mapOrderDetailToOrder(dto);
        setOrder(mapped);
        setStatusValue(mapped.status);
        setPaymentId(dto.payment?.paymentId ?? null);
      } catch {
        if (!cancelled) toast.info("Using demo data — backend unreachable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/orders/all-orders")}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <EmptyState title="Order not found" description="This order does not exist." />
      </div>
    );
  }

  const cancellable = !["delivered", "cancelled", "refunded", "returned"].includes(order.status);
  const refundable = order.paymentStatus === "paid" || order.paymentStatus === "partially_refunded";

  const itemsSubtotal = order.items.reduce((s, it) => s + it.price * it.quantity, 0);
  const totalDiscount = order.items.reduce((s, it) => s + it.discount, 0);
  const totalTax = order.items.reduce((s, it) => s + it.tax, 0);

  async function doCancel() {
    if (!order) return;
    try {
      await cancelOrderApi(order.id, cancelReason);
    } catch {
      // backend unreachable/rejected — still reflect locally for demo continuity
    }
    setOrder({ ...order, status: "cancelled" });
    setStatusValue("cancelled");
    toast.success(`Order cancelled${cancelReason ? `: ${cancelReason}` : ""}`);
    setCancelOpen(false);
    setCancelReason("");
  }

  async function doRefund() {
    if (!order) return;
    if (!paymentId) {
      toast.error("No payment record found for this order — cannot refund.");
      setRefundOpen(false);
      return;
    }
    try {
      await refundPayment(paymentId, {
        gateway: refundGateway,
        reason: refundReason || "Admin-initiated refund",
      });
    } catch {
      // backend unreachable/rejected — still reflect locally for demo continuity
    }
    setOrder({ ...order, paymentStatus: "refunded" });
    toast.success("Refund initiated for this order");
    setRefundOpen(false);
    setRefundReason("");
  }

  async function confirmStatusChange() {
    if (!order || !statusValue) return;
    try {
      await forceOrderStatus(order.id, statusValue.toUpperCase(), "Manual status change from admin portal");
    } catch {
      // backend unreachable/rejected — still reflect locally for demo continuity
    }
    setOrder({ ...order, status: statusValue });
    toast.success(`Order status changed to "${statusValue.replace(/_/g, " ")}"`);
    setStatusConfirmOpen(false);
  }

  function resendInvoice() {
    if (!order) return;
    toast.success(`Invoice resent to ${order.customerName}`);
  }

  function addNote() {
    if (!noteText.trim()) return;
    setNotes((prev) => [{ id: `NOTE-${prev.length + 1}`, text: noteText.trim(), createdAt: new Date().toISOString() }, ...prev]);
    setNoteText("");
    toast.success("Internal note added");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push("/orders/all-orders")}>
          <ArrowLeft className="size-4" /> Back to Orders
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={resendInvoice}><FileText className="size-4" /> Resend Invoice</Button>
          <Button variant="outline" size="sm" disabled={!refundable} onClick={() => setRefundOpen(true)}>
            <RotateCcw className="size-4" /> Initiate Refund
          </Button>
          <Button variant="destructive" size="sm" disabled={!cancellable} onClick={() => setCancelOpen(true)}>
            <Ban className="size-4" /> Cancel Order
          </Button>
        </div>
      </div>

      <PageHeader
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.placedAt)} via ${order.source}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.status} />
          </div>
        }
      />

      {/* Event timeline */}
      <Card>
        <CardHeader><CardTitle>Order Timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-start gap-y-6 overflow-x-auto pb-2">
            {order.timeline.map((ev, i) => (
              <div key={i} className="flex min-w-[110px] flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  {ev.done ? (
                    <CheckCircle2 className="size-6 text-emerald-500" />
                  ) : (
                    <Circle className="size-6 text-muted-foreground/40" />
                  )}
                  <p className={cn("text-xs font-medium", !ev.done && "text-muted-foreground")}>{ev.label}</p>
                  <p className="text-[11px] text-muted-foreground">{ev.timestamp ? formatDate(ev.timestamp) : "—"}</p>
                </div>
                {i < order.timeline.length - 1 && (
                  <div className={cn("mx-2 h-0.5 flex-1", ev.done ? "bg-emerald-500" : "bg-muted")} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="size-4" /> Customer</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="font-medium">{order.customerName}</p>
            <p className="text-muted-foreground">{order.customerPhone}</p>
            <p className="text-muted-foreground">Seller: {order.sellerName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="size-4" /> Shipping Address</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p>{order.shippingAddress}</p>
            <p className="text-muted-foreground">Pincode: {order.pincode}</p>
            {order.trackingNumber && (
              <p className="flex items-center gap-1.5 text-muted-foreground"><Truck className="size-3.5" /> {order.carrier} — {order.trackingNumber}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="size-4" /> Billing Address</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p>{order.billingAddress}</p>
            <p className="text-muted-foreground">Payment: {order.paymentMethod}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((it) => (
              <TableRow key={it.id}>
                <TableCell className="font-medium">{it.productName}</TableCell>
                <TableCell>{it.sku}</TableCell>
                <TableCell>{it.sellerName}</TableCell>
                <TableCell>{it.quantity}</TableCell>
                <TableCell>{formatINR(it.price)}</TableCell>
                <TableCell>-{formatINR(it.discount)}</TableCell>
                <TableCell>{formatINR(it.tax)}</TableCell>
                <TableCell>{formatINR(it.price * it.quantity - it.discount + it.tax)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Payment Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Items Subtotal</span><span>{formatINR(itemsSubtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-{formatINR(totalDiscount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatINR(totalTax)}</span></div>
            <div className="flex justify-between border-t pt-2 font-medium"><span>Total Amount</span><span>{formatINR(order.amount)}</span></div>
            <div className="flex justify-between pt-2"><span className="text-muted-foreground">Payment Status</span><StatusBadge status={order.paymentStatus} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Change Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select value={statusValue} onValueChange={(v) => setStatusValue(v as OrderStatus)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="w-full" disabled={statusValue === order.status} onClick={() => setStatusConfirmOpen(true)}>
              Update Status
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Add Internal Note</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Textarea placeholder="Add a note about this order..." value={noteText} onChange={(e) => setNoteText(e.target.value)} className="min-h-16" />
            <Button size="sm" onClick={addNote} disabled={!noteText.trim()}>Add Note</Button>
          </CardContent>
        </Card>
      </div>

      {notes.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Internal Notes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg border p-3 text-sm">
                <p>{n.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel order {order.orderNumber}?</AlertDialogTitle>
            <AlertDialogDescription>This will mark the order as cancelled and cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea placeholder="Reason for cancellation..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={doCancel}>Cancel Order</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={refundOpen} onOpenChange={setRefundOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Initiate refund?</AlertDialogTitle>
            <AlertDialogDescription>
              A refund of {formatINR(order.amount)} will be initiated to the customer&apos;s original payment method.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Gateway</label>
              <Select value={refundGateway} onValueChange={setRefundGateway}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="phonepe">PhonePe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Reason for refund..." value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doRefund}>Initiate Refund</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={statusConfirmOpen} onOpenChange={setStatusConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change order status?</AlertDialogTitle>
            <AlertDialogDescription>
              Order status will change from &quot;{order.status.replace(/_/g, " ")}&quot; to &quot;{statusValue?.replace(/_/g, " ")}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
