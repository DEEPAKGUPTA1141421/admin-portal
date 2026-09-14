"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Payment } from "@/lib/types";
import { formatDateTime, formatINR } from "@/lib/format";

export function PaymentDetailSheet({
  payment, open, onOpenChange,
}: {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!payment) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Payment {payment.transactionId}</SheetTitle>
          <SheetDescription>Order {payment.orderNumber}</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">{payment.customerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">{formatINR(payment.amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Method</p>
              <p className="font-medium">{payment.method}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Gateway</p>
              <p className="font-medium">{payment.gateway}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <StatusBadge status={payment.status} />
            </div>
            <div>
              <p className="text-muted-foreground">Created At</p>
              <p className="font-medium">{formatDateTime(payment.createdAt)}</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Transaction ID</p>
            <p className="font-mono text-xs">{payment.transactionId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Order ID</p>
            <p className="font-mono text-xs">{payment.orderId}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
