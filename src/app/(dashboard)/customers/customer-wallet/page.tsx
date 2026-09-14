"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CUSTOMERS_DATA } from "@/lib/mock/generate";
import type { Customer } from "@/lib/types";
import { formatINR, formatNumber } from "@/lib/format";
import { toast } from "sonner";

export default function CustomerWalletPage() {
  const [customers, setCustomers] = useState<Customer[]>(() => [...CUSTOMERS_DATA]);
  const [target, setTarget] = useState<Customer | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const totalWallet = useMemo(() => customers.reduce((s, c) => s + c.walletBalance, 0), [customers]);

  function applyAdjustment() {
    const amt = Number(amount);
    if (!target || !amt) return;
    setCustomers((prev) => prev.map((c) => (c.id === target.id ? { ...c, walletBalance: Math.max(0, c.walletBalance + amt) } : c)));
    toast.success(`Wallet ${amt >= 0 ? "credited" : "debited"} ${formatINR(Math.abs(amt))} for ${target.name}`);
    setTarget(null);
    setAmount("");
    setReason("");
  }

  const columns = useMemo<ColumnDef<Customer, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Customer" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "walletBalance", header: "Wallet Balance", cell: ({ row }) => formatINR(row.original.walletBalance) },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Button variant="outline" size="sm" onClick={() => setTarget(row.original)}>
            <Wallet className="size-4" /> Credit / Debit
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Wallet" description="Manage customer wallet balances" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Wallet Balance" value={formatINR(totalWallet, true)} icon={Wallet} tone="green" />
        <KpiCard label="Customers with Balance" value={formatNumber(customers.filter((c) => c.walletBalance > 0).length)} icon={Wallet} />
      </div>
      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Search customers..."
        exportName="customer-wallet"
        emptyTitle="No customers found"
      />

      <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Credit / Debit Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              {target && `${target.name} — current balance: ${formatINR(target.walletBalance)}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="wallet-amt-2">Amount (negative to debit)</Label>
              <Input id="wallet-amt-2" type="number" placeholder="e.g. 500 or -200" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wallet-reason">Reason</Label>
              <Textarea id="wallet-reason" placeholder="Reason for this adjustment..." value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyAdjustment} disabled={!amount || Number(amount) === 0}>
              Confirm Adjustment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
