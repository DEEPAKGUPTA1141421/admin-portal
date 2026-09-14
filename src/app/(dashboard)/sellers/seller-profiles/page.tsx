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
import { listSellerProfiles, type SellerProfileSummary } from "@/lib/api/sellers";
import { formatDateTime } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import { toast } from "sonner";

export default function SellerProfilesPage() {
  const [items, setItems] = useState<SellerProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listSellerProfiles(0, 100);
      setItems(res.items);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Could not reach the seller service.";
      setError(message);
      toast.error("Failed to load seller profiles", { description: message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns = useMemo<ColumnDef<SellerProfileSummary, unknown>[]>(
    () => [
      {
        accessorKey: "legalName",
        header: "Legal Name",
        cell: ({ row }) => row.original.legalName || row.original.displayName || "—",
      },
      { accessorKey: "phone", header: "Phone" },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "businessType",
        header: "Business Type",
        cell: ({ row }) => row.original.businessType || <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "onboardingStage",
        header: "Onboarding",
        cell: ({ row }) =>
          row.original.onboardingStage ? <StatusBadge status={row.original.onboardingStage} /> : "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (row.original.status ? <StatusBadge status={row.original.status} /> : "—"),
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/sellers/seller-profiles/${row.original.sellerId}`}>
              <Eye className="size-3.5" /> View
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
        title="Seller Profiles"
        description={loading ? "Loading…" : `${items.length} seller profiles`}
        actions={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        }
      />

      {error ? (
        <EmptyState
          title="Could not load seller profiles"
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
          exportName="seller-profiles"
          emptyTitle={loading ? "Loading profiles…" : "No sellers found"}
          emptyDescription={loading ? undefined : "No sellers have registered yet."}
        />
      )}
    </div>
  );
}
