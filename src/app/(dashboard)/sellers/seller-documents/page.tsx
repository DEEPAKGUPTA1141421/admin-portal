"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { ExternalLink, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { listSellerDocuments, type SellerKycSummary } from "@/lib/api/sellers";
import { formatDateTime } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import { toast } from "sonner";

function DocCell({ url }: { url: string | null }) {
  if (!url) return <span className="text-muted-foreground">—</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium hover:underline">
      View <ExternalLink className="size-3.5" />
    </a>
  );
}

export default function SellerDocumentsPage() {
  const [items, setItems] = useState<SellerKycSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listSellerDocuments(0, 100);
      setItems(res.items);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Could not reach the seller service.";
      setError(message);
      toast.error("Failed to load seller documents", { description: message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns = useMemo<ColumnDef<SellerKycSummary, unknown>[]>(
    () => [
      {
        id: "legalName",
        accessorKey: "legalName",
        header: "Seller",
        cell: ({ row }) => (
          <Link href={`/sellers/seller-verification/${row.original.sellerId}`} className="font-medium hover:underline">
            {row.original.legalName}
          </Link>
        ),
      },
      { accessorKey: "phone", header: "Phone" },
      { id: "aadhaarFrontUrl", header: "Aadhaar Front", cell: ({ row }) => <DocCell url={row.original.aadhaarFrontUrl} /> },
      { id: "aadhaarBackUrl", header: "Aadhaar Back", cell: ({ row }) => <DocCell url={row.original.aadhaarBackUrl} /> },
      { id: "panDocumentUrl", header: "PAN", cell: ({ row }) => <DocCell url={row.original.panDocumentUrl} /> },
      { id: "gstDocumentUrl", header: "GST", cell: ({ row }) => <DocCell url={row.original.gstDocumentUrl} /> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        accessorKey: "submittedAt",
        header: "Submitted",
        cell: ({ row }) => formatDateTime(row.original.submittedAt),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seller Documents"
        description={loading ? "Loading…" : `${items.length} KYC document submissions`}
        actions={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        }
      />

      {error ? (
        <EmptyState
          title="Could not load seller documents"
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
          exportName="seller-documents"
          emptyTitle={loading ? "Loading documents…" : "No KYC documents found"}
          emptyDescription={loading ? undefined : "No sellers have submitted KYC documents yet."}
        />
      )}
    </div>
  );
}
