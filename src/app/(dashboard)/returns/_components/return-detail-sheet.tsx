"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Separator } from "@/components/ui/separator";
import { ReturnStepper } from "./return-stepper";
import type { ReturnRequest } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/format";

export function ReturnDetailSheet({
  returnRequest,
  open,
  onOpenChange,
  trigger,
}: {
  returnRequest: ReturnRequest | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger}
      <SheetContent className="sm:max-w-md overflow-y-auto">
        {returnRequest && (
          <>
            <SheetHeader>
              <SheetTitle>Return {returnRequest.id}</SheetTitle>
              <SheetDescription>Order {returnRequest.orderNumber}</SheetDescription>
            </SheetHeader>
            <div className="space-y-5 px-4 pb-4">
              <div className="flex items-center gap-3">
                <Image
                  src={returnRequest.image}
                  alt={returnRequest.productName}
                  width={56}
                  height={56}
                  className="rounded-md object-cover"
                  unoptimized
                />
                <div>
                  <p className="font-medium">{returnRequest.productName}</p>
                  <p className="text-xs text-muted-foreground">{returnRequest.sellerName}</p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium">Return lifecycle</p>
                <ReturnStepper status={returnRequest.status} />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={returnRequest.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Refund amount</p>
                  <p className="font-medium">{formatINR(returnRequest.refundAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium">{returnRequest.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p className="font-medium">{returnRequest.reason}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Requested at</p>
                  <p className="font-medium">{formatDate(returnRequest.requestedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resolved at</p>
                  <p className="font-medium">{formatDate(returnRequest.resolvedAt)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
