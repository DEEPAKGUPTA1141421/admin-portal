"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Ban, CheckCircle2, KeyRound, Wallet, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CUSTOMERS_DATA } from "@/lib/mock/generate";
import type { Customer } from "@/lib/types";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import { toast } from "sonner";

export default function AllCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(() => [...CUSTOMERS_DATA]);
  const [blockTarget, setBlockTarget] = useState<Customer | null>(null);
  const [walletTarget, setWalletTarget] = useState<Customer | null>(null);
  const [walletAmount, setWalletAmount] = useState("");

  const kpis = useMemo(() => {
    const active = customers.filter((c) => c.status === "active").length;
    const blocked = customers.filter((c) => c.status === "blocked").length;
    const totalSpend = customers.reduce((s, c) => s + c.totalSpend, 0);
    return { total: customers.length, active, blocked, totalSpend };
  }, [customers]);

  function toggleBlock(customer: Customer) {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customer.id ? { ...c, status: c.status === "blocked" ? "active" : "blocked" } : c))
    );
    toast.success(customer.status === "blocked" ? `${customer.name} unblocked` : `${customer.name} blocked`);
    setBlockTarget(null);
  }

  function adjustWallet() {
    const amt = Number(walletAmount);
    if (!walletTarget || !amt) return;
    setCustomers((prev) =>
      prev.map((c) => (c.id === walletTarget.id ? { ...c, walletBalance: Math.max(0, c.walletBalance + amt) } : c))
    );
    toast.success(`Wallet ${amt >= 0 ? "credited" : "debited"} ${formatINR(Math.abs(amt))} for ${walletTarget.name}`);
    setWalletTarget(null);
    setWalletAmount("");
  }

  const columns = useMemo<ColumnDef<Customer, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link href={`/customers/all-customers/${row.original.id}`} className="font-medium hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "city", header: "City" },
      { accessorKey: "totalOrders", header: "Orders", cell: ({ row }) => formatNumber(row.original.totalOrders) },
      { accessorKey: "totalSpend", header: "Total Spend", cell: ({ row }) => formatINR(row.original.totalSpend) },
      { accessorKey: "avgOrderValue", header: "AOV", cell: ({ row }) => formatINR(row.original.avgOrderValue) },
      { accessorKey: "segment", header: "Segment", cell: ({ row }) => <StatusBadge status={row.original.segment} /> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: "lastOrderAt", header: "Last Order", cell: ({ row }) => formatDate(row.original.lastOrderAt) },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/customers/all-customers/${c.id}`}>
                    <Eye className="size-4" /> View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success(`Password reset link sent to ${c.email}`)}>
                  <KeyRound className="size-4" /> Reset Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setWalletTarget(c)}>
                  <Wallet className="size-4" /> Adjust Wallet
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setBlockTarget(c)}>
                  {c.status === "blocked" ? <CheckCircle2 className="size-4" /> : <Ban className="size-4" />}
                  {c.status === "blocked" ? "Unblock" : "Block"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="All Customers" description="Every registered customer across the marketplace" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Customers" value={formatNumber(kpis.total)} icon={Users} />
        <KpiCard label="Active" value={formatNumber(kpis.active)} icon={CheckCircle2} tone="green" />
        <KpiCard label="Blocked" value={formatNumber(kpis.blocked)} icon={Ban} tone="red" />
        <KpiCard label="Total Lifetime Spend" value={formatINR(kpis.totalSpend, true)} tone="blue" />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Search customers by name..."
        exportName="all-customers"
        emptyTitle="No customers found"
        emptyDescription="Try adjusting your search."
      />

      <AlertDialog open={!!blockTarget} onOpenChange={(o) => !o && setBlockTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockTarget?.status === "blocked" ? "Unblock this customer?" : "Block this customer?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockTarget?.status === "blocked"
                ? `${blockTarget?.name} will regain access to place orders and use the platform.`
                : `${blockTarget?.name} will be blocked from placing new orders and logging in.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={blockTarget?.status === "blocked" ? "default" : "destructive"}
              onClick={() => blockTarget && toggleBlock(blockTarget)}
            >
              {blockTarget?.status === "blocked" ? "Unblock" : "Block"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!walletTarget} onOpenChange={(o) => !o && setWalletTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Wallet Balance</DialogTitle>
            <DialogDescription>
              {walletTarget && `Current balance: ${formatINR(walletTarget.walletBalance)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="wallet-amount">Amount (use negative to debit)</Label>
            <Input
              id="wallet-amount"
              type="number"
              placeholder="e.g. 500 or -200"
              value={walletAmount}
              onChange={(e) => setWalletAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWalletTarget(null)}>Cancel</Button>
            <Button onClick={adjustWallet} disabled={!walletAmount || Number(walletAmount) === 0}>
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
