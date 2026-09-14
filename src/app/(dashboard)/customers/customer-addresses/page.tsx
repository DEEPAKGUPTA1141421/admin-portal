"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, MapPinned } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/shared/kpi-card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CUSTOMER_ADDRESSES, type CustomerAddress } from "../_lib/mock";
import { formatNumber } from "@/lib/format";
import { toast } from "sonner";

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>(() => [...CUSTOMER_ADDRESSES]);
  const [editTarget, setEditTarget] = useState<CustomerAddress | null>(null);
  const [line1, setLine1] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CustomerAddress | null>(null);

  function openEdit(a: CustomerAddress) {
    setEditTarget(a);
    setLine1(a.line1);
  }

  function saveEdit() {
    if (!editTarget) return;
    setAddresses((prev) => prev.map((a) => (a.id === editTarget.id ? { ...a, line1 } : a)));
    toast.success("Address updated");
    setEditTarget(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setAddresses((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    toast.success("Address deleted");
    setDeleteTarget(null);
  }

  const columns = useMemo<ColumnDef<CustomerAddress, unknown>[]>(
    () => [
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "line1", header: "Address" },
      { accessorKey: "city", header: "City" },
      { accessorKey: "state", header: "State" },
      { accessorKey: "pincode", header: "Pincode" },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(row.original)}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(row.original)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Addresses" description="Saved delivery and billing addresses across all customers" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Addresses" value={formatNumber(addresses.length)} icon={MapPinned} />
      </div>
      <DataTable
        columns={columns}
        data={addresses}
        searchKey="customerName"
        searchPlaceholder="Search by customer name..."
        exportName="customer-addresses"
        emptyTitle="No addresses found"
      />

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>{editTarget?.customerName} — {editTarget?.type}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="addr-line1">Address line</Label>
            <Input id="addr-line1" value={line1} onChange={(e) => setLine1(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this address?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the {deleteTarget?.type} address for {deleteTarget?.customerName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
