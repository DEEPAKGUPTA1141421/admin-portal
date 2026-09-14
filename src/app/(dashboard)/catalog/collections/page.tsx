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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

interface Collection {
  id: string;
  name: string;
  description: string;
  productCount: number;
  featured: boolean;
  status: "active" | "inactive";
}

const SEED: Collection[] = [
  { id: "COL-1", name: "Summer Essentials", description: "Breathable fashion & accessories for the summer season", productCount: 64, featured: true, status: "active" },
  { id: "COL-2", name: "Best Sellers", description: "Top-performing products across all categories", productCount: 40, featured: true, status: "active" },
  { id: "COL-3", name: "New Arrivals", description: "Freshly listed products from the last 30 days", productCount: 88, featured: true, status: "active" },
  { id: "COL-4", name: "Festive Specials", description: "Curated picks for the festive season", productCount: 52, featured: false, status: "active" },
  { id: "COL-5", name: "Under ₹499", description: "Budget-friendly products across categories", productCount: 120, featured: false, status: "active" },
  { id: "COL-6", name: "Premium Picks", description: "High-end products from top brands", productCount: 31, featured: false, status: "active" },
  { id: "COL-7", name: "Work From Home", description: "Office essentials and ergonomic accessories", productCount: 27, featured: false, status: "inactive" },
  { id: "COL-8", name: "Monsoon Ready", description: "Waterproof and monsoon essential gear", productCount: 18, featured: false, status: "active" },
];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>(SEED);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  function addCollection() {
    if (!name) { toast.error("Name is required"); return; }
    const col: Collection = { id: `COL-NEW-${Date.now()}`, name, description, productCount: 0, featured, status: "active" };
    setCollections((prev) => [col, ...prev]);
    toast.success(`Collection "${name}" created`);
    setAddOpen(false);
    setName(""); setDescription(""); setFeatured(false);
  }

  function remove() {
    if (!deleteTarget) return;
    setCollections((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast.success(`Collection "${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
  }

  const columns: ColumnDef<Collection, unknown>[] = [
    { accessorKey: "name", header: "Collection" },
    { accessorKey: "description", header: "Description", cell: ({ row }) => <span className="max-w-xs truncate block text-muted-foreground">{row.original.description}</span> },
    { accessorKey: "productCount", header: "Products" },
    { accessorKey: "featured", header: "Featured", cell: ({ row }) => row.original.featured ? <Badge>Featured</Badge> : <span className="text-muted-foreground">—</span> },
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
              onClick={() => setCollections((prev) => prev.map((c) => (c.id === row.original.id ? { ...c, featured: !c.featured } : c)))}
            >
              {row.original.featured ? "Unfeature" : "Feature"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setCollections((prev) => prev.map((c) => (c.id === row.original.id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c)))}
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
        title="Collections"
        description={`${collections.length} curated product collections`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus /> Add Collection</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Collection</DialogTitle>
                <DialogDescription>Create a new curated product collection.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={featured} onCheckedChange={setFeatured} />
                  <Label>Feature on homepage</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={addCollection}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={columns} data={collections} searchKey="name" searchPlaceholder="Search collections..." exportName="collections" />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>&quot;{deleteTarget?.name}&quot; will be permanently removed.</AlertDialogDescription>
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
