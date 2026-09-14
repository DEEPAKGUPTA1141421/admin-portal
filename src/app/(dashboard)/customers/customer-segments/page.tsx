"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CUSTOMERS_DATA } from "@/lib/mock/generate";
import type { Customer } from "@/lib/types";
import { formatDate, formatINR, formatNumber } from "@/lib/format";

const SEGMENTS: Customer["segment"][] = ["new", "regular", "vip", "at_risk"];

export default function CustomerSegmentsPage() {
  const [segment, setSegment] = useState<Customer["segment"] | "all">("all");

  const summary = useMemo(
    () =>
      SEGMENTS.map((s) => {
        const group = CUSTOMERS_DATA.filter((c) => c.segment === s);
        const avgSpend = group.length ? group.reduce((sum, c) => sum + c.totalSpend, 0) / group.length : 0;
        return { segment: s, count: group.length, avgSpend };
      }),
    []
  );

  const data = useMemo(
    () => (segment === "all" ? CUSTOMERS_DATA : CUSTOMERS_DATA.filter((c) => c.segment === segment)),
    [segment]
  );

  const columns = useMemo<ColumnDef<Customer, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "segment", header: "Segment", cell: ({ row }) => <StatusBadge status={row.original.segment} /> },
      { accessorKey: "totalOrders", header: "Orders" },
      { accessorKey: "totalSpend", header: "Total Spend", cell: ({ row }) => formatINR(row.original.totalSpend) },
      { accessorKey: "lastOrderAt", header: "Last Order", cell: ({ row }) => formatDate(row.original.lastOrderAt) },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Segments" description="Aggregate customer behavior by segment" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {summary.map((s) => (
          <Card
            key={s.segment}
            className={cn("cursor-pointer transition-colors", segment === s.segment && "border-primary")}
            onClick={() => setSegment(segment === s.segment ? "all" : s.segment)}
          >
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={s.segment} />
                <Users className="size-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold">{formatNumber(s.count)}</p>
              <p className="text-xs text-muted-foreground">Avg spend: {formatINR(s.avgSpend, true)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search customers..."
        exportName="customer-segments"
        emptyTitle="No customers in this segment"
        toolbarExtra={
          segment !== "all" ? (
            <button onClick={() => setSegment("all")} className="text-sm text-muted-foreground hover:text-foreground">
              Clear segment filter
            </button>
          ) : undefined
        }
      />
    </div>
  );
}
