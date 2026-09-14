"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { INITIAL_SUPPLIERS, type SupplierRecord } from "@/lib/mock/inventory-local";
import { formatNumber } from "@/lib/format";

function SupplierFormDialog({
  supplier, onSave, trigger,
}: {
  supplier?: SupplierRecord;
  onSave: (s: SupplierRecord) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(supplier?.name ?? "");
  const [contactPerson, setContactPerson] = useState(supplier?.contactPerson ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [city, setCity] = useState(supplier?.city ?? "");

  const submit = () => {
    if (!name || !contactPerson || !phone) {
      toast.error("Name, contact person and phone are required");
      return;
    }
    onSave({
      id: supplier?.id ?? `SUP-NEW-${Date.now()}`,
      name, contactPerson, phone,
      email: email || `contact@${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example`,
      city: city || "—",
      productsSupplied: supplier?.productsSupplied ?? 0,
      status: supplier?.status ?? "active",
    });
    toast.success(supplier ? "Supplier updated" : "Supplier added");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
          <DialogDescription>Manage supplier directory details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="sup-name">Supplier Name</Label>
            <Input id="sup-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sup-contact">Contact Person</Label>
              <Input id="sup-contact" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sup-phone">Phone</Label>
              <Input id="sup-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sup-email">Email</Label>
              <Input id="sup-email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sup-city">City</Label>
              <Input id="sup-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{supplier ? "Save Changes" : "Add Supplier"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SuppliersPage() {
  const [data, setData] = useState<SupplierRecord[]>(INITIAL_SUPPLIERS);

  const upsert = (s: SupplierRecord) => {
    setData((prev) => (prev.some((p) => p.id === s.id) ? prev.map((p) => (p.id === s.id ? s : p)) : [s, ...prev]));
  };

  const columns: ColumnDef<SupplierRecord, unknown>[] = [
    { accessorKey: "name", header: "Supplier" },
    { accessorKey: "contactPerson", header: "Contact Person" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "productsSupplied", header: "Products Supplied", cell: ({ row }) => formatNumber(row.original.productsSupplied) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <SupplierFormDialog
              supplier={row.original}
              onSave={upsert}
              trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Directory of vendors supplying products to the marketplace"
        actions={<SupplierFormDialog onSave={upsert} trigger={<Button size="sm"><Plus /> Add Supplier</Button>} />}
      />
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search suppliers..."
        exportName="suppliers"
        emptyTitle="No suppliers"
      />
    </div>
  );
}
