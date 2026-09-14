"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Attribute {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "color";
  values: string[];
  status: "active" | "inactive";
  productCount: number;
}

const SEED: Attribute[] = [
  { id: "ATTR-1", name: "Color", type: "color", values: ["Red", "Blue", "Black", "White", "Green"], status: "active", productCount: 118 },
  { id: "ATTR-2", name: "Size", type: "select", values: ["XS", "S", "M", "L", "XL", "XXL"], status: "active", productCount: 96 },
  { id: "ATTR-3", name: "Material", type: "select", values: ["Cotton", "Polyester", "Leather", "Wool", "Silk"], status: "active", productCount: 74 },
  { id: "ATTR-4", name: "Storage", type: "select", values: ["64GB", "128GB", "256GB", "512GB"], status: "active", productCount: 42 },
  { id: "ATTR-5", name: "RAM", type: "select", values: ["4GB", "8GB", "16GB", "32GB"], status: "active", productCount: 38 },
  { id: "ATTR-6", name: "Weight", type: "number", values: ["0.5kg", "1kg", "2kg", "5kg"], status: "active", productCount: 29 },
  { id: "ATTR-7", name: "Warranty", type: "select", values: ["6 Months", "1 Year", "2 Years", "3 Years"], status: "active", productCount: 61 },
  { id: "ATTR-8", name: "Pattern", type: "select", values: ["Solid", "Striped", "Printed", "Checked"], status: "inactive", productCount: 22 },
  { id: "ATTR-9", name: "Fit", type: "select", values: ["Slim", "Regular", "Loose"], status: "active", productCount: 55 },
  { id: "ATTR-10", name: "Flavor", type: "text", values: ["Chocolate", "Vanilla", "Mixed Fruit"], status: "active", productCount: 17 },
  { id: "ATTR-11", name: "Battery Life", type: "text", values: ["8hrs", "12hrs", "24hrs"], status: "active", productCount: 14 },
  { id: "ATTR-12", name: "Screen Size", type: "number", values: ["6.1in", "6.5in", "6.7in"], status: "active", productCount: 25 },
];

export default function AttributesPage() {
  const [attrs, setAttrs] = useState<Attribute[]>(SEED);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<Attribute["type"]>("select");
  const [values, setValues] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Attribute | null>(null);

  function addAttribute() {
    if (!name) { toast.error("Name is required"); return; }
    const attr: Attribute = {
      id: `ATTR-NEW-${Date.now()}`,
      name, type,
      values: values.split(",").map((v) => v.trim()).filter(Boolean),
      status: "active",
      productCount: 0,
    };
    setAttrs((prev) => [attr, ...prev]);
    toast.success(`Attribute "${name}" created`);
    setAddOpen(false);
    setName(""); setValues("");
  }

  function remove() {
    if (!deleteTarget) return;
    setAttrs((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    toast.success(`Attribute "${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
  }

  const columns: ColumnDef<Attribute, unknown>[] = [
    { accessorKey: "name", header: "Attribute" },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.type}</Badge> },
    {
      accessorKey: "values",
      header: "Values",
      cell: ({ row }) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {row.original.values.slice(0, 4).map((v) => <Badge key={v} variant="secondary">{v}</Badge>)}
          {row.original.values.length > 4 && <Badge variant="secondary">+{row.original.values.length - 4}</Badge>}
        </div>
      ),
    },
    { accessorKey: "productCount", header: "Products" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.success(`Edit form opened for ${row.original.name}`)}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setAttrs((prev) => prev.map((a) => (a.id === row.original.id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a)))}
            >
              {row.original.status === "active" ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attributes"
        description={`${attrs.length} product attributes used for variant and spec configuration`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus /> Add Attribute</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Attribute</DialogTitle>
                <DialogDescription>Define a new attribute and its possible values.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as Attribute["type"])}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Values (comma-separated)</Label>
                  <Input value={values} onChange={(e) => setValues(e.target.value)} placeholder="Red, Blue, Black" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={addAttribute}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={columns} data={attrs} searchKey="name" searchPlaceholder="Search attributes..." exportName="attributes" />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete attribute?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.name}&quot; will be removed and unlinked from any attribute sets. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
