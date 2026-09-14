"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CUSTOMERS_DATA } from "@/lib/mock/generate";
import type { Customer } from "@/lib/types";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import { toast } from "sonner";

export default function BlockedCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(() => CUSTOMERS_DATA.filter((c) => c.status === "blocked"));
  const [target, setTarget] = useState<Customer | null>(null);

  function unblock() {
    if (!target) return;
    setCustomers((prev) => prev.filter((c) => c.id !== target.id));
    toast.success(`${target.name} has been unblocked`);
    setTarget(null);
  }

  const columns = useMemo<ColumnDef<Customer, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "city", header: "City" },
      { accessorKey: "totalOrders", header: "Orders" },
      { accessorKey: "totalSpend", header: "Total Spend", cell: ({ row }) => formatINR(row.original.totalSpend) },
      { accessorKey: "lastOrderAt", header: "Last Order", cell: ({ row }) => formatDate(row.original.lastOrderAt) },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Button variant="outline" size="sm" onClick={() => setTarget(row.original)}>
            <CheckCircle2 className="size-4" /> Unblock
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Blocked Customers" description="Customers currently blocked from the marketplace" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Blocked Customers" value={formatNumber(customers.length)} icon={Ban} tone="red" />
      </div>
      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Search blocked customers..."
        exportName="blocked-customers"
        emptyTitle="No blocked customers"
        emptyDescription="All customers currently have active access."
      />

      <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock this customer?</AlertDialogTitle>
            <AlertDialogDescription>
              {target?.name} will regain full access to place orders and use the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={unblock}>Unblock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
