"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RISK_CASES_DATA } from "@/lib/mock/generate";
import type { RiskCase } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function FlaggedOrdersPage() {
  const [cases, setCases] = useState<RiskCase[]>(() => RISK_CASES_DATA.filter((c) => c.entityType === "order"));
  const [reviewing, setReviewing] = useState<RiskCase | null>(null);

  function updateStatus(id: string, status: RiskCase["status"]) {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    toast.success(`Case ${id} marked as ${status}`);
    setReviewing(null);
  }

  const columns: ColumnDef<RiskCase, unknown>[] = [
    { accessorKey: "type", header: "Type" },
    { accessorKey: "entityName", header: "Order" },
    { accessorKey: "riskScore", header: "Risk", cell: ({ row }) => <StatusBadge status={row.original.riskScore} /> },
    { accessorKey: "description", header: "Description", cell: ({ row }) => <span className="block max-w-xs truncate text-muted-foreground">{row.original.description}</span> },
    { accessorKey: "detectedAt", header: "Detected", cell: ({ row }) => formatDate(row.original.detectedAt) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setReviewing(row.original)}>Review</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline">Escalate</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Escalate case {row.original.id}?</AlertDialogTitle>
                <AlertDialogDescription>This will flag the case as high-priority and notify the risk team.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => toast.success(`Case ${row.original.id} escalated`)}>Escalate</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Flagged Orders" description="Orders flagged by the automated risk engine" />

      <DataTable columns={columns} data={cases} searchKey="entityName" searchPlaceholder="Search orders..." exportName="flagged-orders" />

      <Dialog open={!!reviewing} onOpenChange={(o) => !o && setReviewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Case — {reviewing?.entityName}</DialogTitle>
            <DialogDescription>{reviewing?.description}</DialogDescription>
          </DialogHeader>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">Resolve</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resolve this case?</AlertDialogTitle>
                <AlertDialogDescription>Marking this case resolved confirms the risk determination has been addressed.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => reviewing && updateStatus(reviewing.id, "resolved")}>Resolve</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <DialogFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Dismiss</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Dismiss this case?</AlertDialogTitle>
                  <AlertDialogDescription>This will mark the flag as a false positive.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => reviewing && updateStatus(reviewing.id, "dismissed")}>Dismiss</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
