"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { getPendingKyc, type SellerKycSummary } from "@/lib/api/sellers";
import { formatDateTime } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import { toast } from "sonner";

export default function SellerApplicationsPage() {
  const [items, setItems] = useState<SellerKycSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPendingKyc(0, 100);
      setItems(res.items);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Could not reach the seller service.";
      setError(message);
      toast.error("Failed to load pending KYC applications", { description: message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns = useMemo<ColumnDef<SellerKycSummary, unknown>[]>(
    () => [
      { accessorKey: "legalName", header: "Legal Name" },
      { accessorKey: "phone", header: "Phone" },
      {
        accessorKey: "gstNumber",
        header: "GST",
        cell: ({ row }) => row.original.gstNumber || <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "aadhaarLast4",
        header: "Aadhaar",
        cell: ({ row }) => row.original.aadhaarLast4 || <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "panLast4",
        header: "PAN",
        cell: ({ row }) => row.original.panLast4 || <span className="text-muted-foreground">—</span>,
      },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        accessorKey: "submittedAt",
        header: "Submitted",
        cell: ({ row }) => formatDateTime(row.original.submittedAt),
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/sellers/seller-verification/${row.original.sellerId}`}>
              <Eye className="size-3.5" /> Review
            </Link>
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seller Applications"
        description={loading ? "Loading…" : `${items.length} sellers awaiting KYC review`}
        actions={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        }
      />

      {error ? (
        <EmptyState
          title="Could not load applications"
          description={`${error} — is the ProductClientService backend running?`}
          actionLabel="Retry"
          onAction={load}
        />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchKey="legalName"
          searchPlaceholder="Search by seller name..."
          exportName="seller-kyc-pending"
          emptyTitle={loading ? "Loading applications…" : "No pending applications"}
          emptyDescription={loading ? undefined : "All seller KYC submissions have been reviewed."}
        />
      )}
    </div>
  );
}
