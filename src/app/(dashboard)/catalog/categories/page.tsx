"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { CATEGORIES_DATA } from "@/lib/mock/generate";
import { fetchCategoryTree, createCategory } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import type { Category } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [deactivateTarget, setDeactivateTarget] = useState<Category | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchCategoryTree();
      setCategories(data.length ? data : CATEGORIES_DATA);
    } catch (e) {
      if (e instanceof ApiError) toast.info("Using demo data — backend unreachable");
      setCategories(CATEGORIES_DATA);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function toggleStatus(c: Category) {
    if (c.status === "active") { setDeactivateTarget(c); return; }
    setCategories((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: "active" } : x)));
    toast.success(`${c.name} activated`);
  }

  function confirmDeactivate() {
    if (!deactivateTarget) return;
    setCategories((prev) => prev.map((x) => (x.id === deactivateTarget.id ? { ...x, status: "inactive" } : x)));
    toast.success(`${deactivateTarget.name} deactivated`);
    setDeactivateTarget(null);
  }

  async function addCategory() {
    if (!name) { toast.error("Name is required"); return; }
    try {
      // NOTE: the backend's add-category endpoint is currently a stub that
      // doesn't persist — this call will "succeed" but won't show up on
      // refetch until that's implemented server-side.
      await createCategory(name, parentId || undefined);
      toast.success(`Category "${name}" added`);
      await load();
    } catch {
      const cat: Category = {
        id: `CAT-NEW-${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        parentId: parentId || null,
        productCount: 0,
        status: "active",
        image: `https://picsum.photos/seed/cat-${Date.now()}/200/200`,
      };
      setCategories((prev) => [cat, ...prev]);
      toast.success(`Category "${name}" added (local demo — backend unreachable)`);
    } finally {
      setAddOpen(false);
      setName("");
      setParentId("");
    }
  }

  const columns: ColumnDef<Category, unknown>[] = [
    {
      accessorKey: "name",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.image && <Image src={row.original.image} alt="" width={32} height={32} className="rounded-md object-cover" unoptimized />}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    { accessorKey: "slug", header: "Slug" },
    {
      accessorKey: "parentId",
      header: "Parent",
      cell: ({ row }) => {
        const parent = categories.find((c) => c.id === row.original.parentId);
        return parent ? parent.name : <span className="text-muted-foreground">Top-level</span>;
      },
    },
    { accessorKey: "productCount", header: "Products", cell: ({ row }) => formatNumber(row.original.productCount) },
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
            <DropdownMenuItem onClick={() => toast.info(`Viewing ${row.original.name}`)}>View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success(`Edit form opened for ${row.original.name}`)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleStatus(row.original)}>
              {row.original.status === "active" ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description={`${categories.length} categories · hierarchy managed via parent category`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus /> Add Category</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>Create a new top-level or nested category.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Parent category ID (optional)</Label>
                  <Input value={parentId} onChange={(e) => setParentId(e.target.value)} placeholder="Leave blank for top-level" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={addCategory}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          searchKey="name"
          searchPlaceholder="Search categories..."
          exportName="categories"
        />
      )}

      <AlertDialog open={!!deactivateTarget} onOpenChange={(v) => !v && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate category?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deactivateTarget?.name}&quot; will be hidden from storefront navigation and product assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
