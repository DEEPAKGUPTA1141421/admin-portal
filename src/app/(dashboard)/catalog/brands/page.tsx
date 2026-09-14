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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BRANDS_DATA } from "@/lib/mock/generate";
import { fetchPendingBrands, approveBrand, rejectBrand, type BrandRow } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import { formatNumber } from "@/lib/format";
import { toast } from "sonner";

// UUIDs (real backend rows) vs mock ids like "BR-1" — used to decide whether
// an action should call the real API or just mutate local demo state.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Simulate a subset of mock brands as pending approval for the workflow demo.
const MOCK_SEED: BrandRow[] = BRANDS_DATA.map((b, i) => ({ ...b, approvalStatus: i % 7 === 0 ? "pending" : "approved" }));

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");

  async function load() {
    setLoading(true);
    try {
      // There is no "list all brands" endpoint on the backend yet — only
      // pending-approval, by-category, and search. Show real pending brands
      // alongside demo data for already-approved brands so the page isn't empty.
      const pending = await fetchPendingBrands();
      setBrands([...pending, ...MOCK_SEED]);
    } catch (e) {
      if (e instanceof ApiError) toast.info("Using demo data — backend unreachable");
      setBrands(MOCK_SEED);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function setApproval(b: BrandRow, status: BrandRow["approvalStatus"]) {
    if (UUID_RE.test(String(b.id))) {
      try {
        if (status === "approved") await approveBrand(String(b.id));
        else await rejectBrand(String(b.id));
      } catch {
        toast.error("Failed to update brand on the server");
        return;
      }
    }
    setBrands((prev) => prev.map((x) => (x.id === b.id ? { ...x, approvalStatus: status, status: status === "approved" ? "active" : x.status } : x)));
    toast[status === "approved" ? "success" : "error"](`${b.name} ${status === "approved" ? "approved" : "rejected"}`);
  }

  function toggleStatus(b: BrandRow) {
    setBrands((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x)));
    toast.success(`${b.name} ${b.status === "active" ? "deactivated" : "activated"}`);
  }

  function addBrand() {
    if (!name) { toast.error("Name is required"); return; }
    const brand: BrandRow = {
      id: `BR-NEW-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      logo: `https://picsum.photos/seed/brand-${Date.now()}/100/100`,
      productCount: 0,
      status: "active",
      approvalStatus: "pending",
    };
    setBrands((prev) => [brand, ...prev]);
    toast.success(`Brand "${name}" submitted for approval`);
    setAddOpen(false);
    setName("");
  }

  const columns: ColumnDef<BrandRow, unknown>[] = [
    {
      accessorKey: "name",
      header: "Brand",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.logo && <Image src={row.original.logo} alt="" width={32} height={32} className="rounded-md object-cover" unoptimized />}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "productCount", header: "Products", cell: ({ row }) => formatNumber(row.original.productCount) },
    { accessorKey: "approvalStatus", header: "Approval", cell: ({ row }) => <StatusBadge status={row.original.approvalStatus} /> },
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
            {row.original.approvalStatus === "pending" && (
              <>
                <DropdownMenuItem onClick={() => setApproval(row.original, "approved")}>Approve</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setApproval(row.original, "pending")}>Reject</DropdownMenuItem>
              </>
            )}
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
        title="Brands"
        description={`${brands.length} brands · ${brands.filter((b) => b.approvalStatus === "pending").length} pending approval`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus /> Add Brand</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Brand</DialogTitle>
                <DialogDescription>New brands are submitted for approval before going live.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={addBrand}>Submit</Button>
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
        <DataTable columns={columns} data={brands} searchKey="name" searchPlaceholder="Search brands..." exportName="brands" />
      )}
    </div>
  );
}
