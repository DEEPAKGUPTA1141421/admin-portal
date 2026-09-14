"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { RETURNS_DATA } from "@/lib/mock/generate";
import { fetchReturns, approveReturn, rejectReturn, mapReturnDtoToReturnRequest } from "@/lib/api/returns";
import type { ReturnRequest } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function ReturnApprovalPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>(() => RETURNS_DATA.filter((r) => r.status === "requested"));
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetchReturns({ bucket: "OPEN", size: 50 })
      .then((data) =>
        setReturns(
          data.returns
            .map(mapReturnDtoToReturnRequest)
            .filter((r) => r.status === "pending")
        )
      )
      .catch(() => toast.info("Using demo data — backend unreachable"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const columns: ColumnDef<ReturnRequest, unknown>[] = useMemo(
    () => [
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
      { accessorKey: "refundAmount", header: "Refund", cell: ({ row }) => formatINR(row.original.refundAmount) },
      { accessorKey: "requestedAt", header: "Requested", cell: ({ row }) => formatDate(row.original.requestedAt) },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={() => approveOne(row.original)}>
              <Check className="size-3.5" /> Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => rejectOne(row.original)}>
              <X className="size-3.5" /> Reject
            </Button>
          </div>
        ),
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
    []
  );

  async function approveOne(r: ReturnRequest) {
    setReturns((prev) => prev.filter((x) => x.id !== r.id));
    try {
      await approveReturn(r.id);
      toast.success(`Return ${r.id} approved`);
    } catch {
      toast.error(`Failed to approve return ${r.id}`);
      load();
    }
  }

  async function rejectOne(r: ReturnRequest) {
    setReturns((prev) => prev.filter((x) => x.id !== r.id));
    try {
      await rejectReturn(r.id);
      toast.error(`Return ${r.id} rejected`);
    } catch {
      toast.error(`Failed to reject return ${r.id}`);
      load();
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Return Approval"
        description={loading ? "Loading approval queue..." : `${returns.length} return requests awaiting approval`}
      />

      <DataTable
        columns={columns}
        data={returns}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="return-approval-queue"
        enableSelection
        bulkActions={(selected) => (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const ids = new Set(selected.map((r) => r.id));
                setReturns((prev) => prev.filter((r) => !ids.has(r.id)));
                const results = await Promise.allSettled(selected.map((r) => approveReturn(r.id)));
                const failed = results.filter((r) => r.status === "rejected").length;
                if (failed > 0) toast.error(`${failed} of ${selected.length} approvals failed`);
                else toast.success(`${selected.length} returns approved`);
              }}
            >
              Bulk Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const ids = new Set(selected.map((r) => r.id));
                setReturns((prev) => prev.filter((r) => !ids.has(r.id)));
                const results = await Promise.allSettled(selected.map((r) => rejectReturn(r.id)));
                const failed = results.filter((r) => r.status === "rejected").length;
                if (failed > 0) toast.error(`${failed} of ${selected.length} rejections failed`);
                else toast.error(`${selected.length} returns rejected`);
              }}
            >
              Bulk Reject
            </Button>
          </>
        )}
        emptyTitle="Approval queue is empty"
        emptyDescription="All return requests have been reviewed."
      />
    </div>
  );
}
