"use client";

import { useState } from "react";
import { Eye, ImagePlus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

type BannerPlacement = "homepage" | "category" | "checkout";
type BannerStatus = "draft" | "scheduled" | "live" | "expired";

interface Banner {
  id: string;
  title: string;
  image: string;
  placement: BannerPlacement;
  status: BannerStatus;
  startDate: string;
  endDate: string;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

const BANNERS_SEED: Banner[] = [
  { id: "BAN-1", title: "Diwali Mega Sale", image: "https://picsum.photos/seed/banner-1/800/300", placement: "homepage", status: "live", startDate: daysFromNow(-5), endDate: daysFromNow(10) },
  { id: "BAN-2", title: "Electronics Flat 40% Off", image: "https://picsum.photos/seed/banner-2/800/300", placement: "category", status: "live", startDate: daysFromNow(-2), endDate: daysFromNow(5) },
  { id: "BAN-3", title: "Free Shipping Weekend", image: "https://picsum.photos/seed/banner-3/800/300", placement: "checkout", status: "scheduled", startDate: daysFromNow(3), endDate: daysFromNow(6) },
  { id: "BAN-4", title: "New Year Countdown", image: "https://picsum.photos/seed/banner-4/800/300", placement: "homepage", status: "draft", startDate: daysFromNow(20), endDate: daysFromNow(30) },
  { id: "BAN-5", title: "Fashion Fest", image: "https://picsum.photos/seed/banner-5/800/300", placement: "category", status: "expired", startDate: daysFromNow(-40), endDate: daysFromNow(-20) },
  { id: "BAN-6", title: "Cart Abandonment Reminder", image: "https://picsum.photos/seed/banner-6/800/300", placement: "checkout", status: "live", startDate: daysFromNow(-10), endDate: daysFromNow(15) },
  { id: "BAN-7", title: "Republic Day Specials", image: "https://picsum.photos/seed/banner-7/800/300", placement: "homepage", status: "scheduled", startDate: daysFromNow(15), endDate: daysFromNow(22) },
  { id: "BAN-8", title: "Home & Kitchen Clearance", image: "https://picsum.photos/seed/banner-8/800/300", placement: "category", status: "draft", startDate: daysFromNow(8), endDate: daysFromNow(18) },
];

const emptyForm = { title: "", image: "", placement: "homepage" as BannerPlacement, status: "draft" as BannerStatus, startDate: "", endDate: "" };

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>(BANNERS_SEED);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [previewTarget, setPreviewTarget] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, image: `https://picsum.photos/seed/banner-new-${Date.now()}/800/300` });
    setFormOpen(true);
  }

  function openEdit(b: Banner) {
    setEditing(b);
    setForm({ title: b.title, image: b.image, placement: b.placement, status: b.status, startDate: b.startDate.slice(0, 10), endDate: b.endDate.slice(0, 10) });
    setFormOpen(true);
  }

  function save() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (editing) {
      setBanners((prev) => prev.map((b) => (b.id === editing.id ? { ...b, ...form, startDate: form.startDate || b.startDate, endDate: form.endDate || b.endDate } : b)));
      toast.success(`"${form.title}" updated`);
    } else {
      const banner: Banner = {
        id: `BAN-${Date.now()}`,
        title: form.title,
        image: form.image || `https://picsum.photos/seed/banner-${Date.now()}/800/300`,
        placement: form.placement,
        status: form.status,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : daysFromNow(7),
      };
      setBanners((prev) => [banner, ...prev]);
      toast.success(`"${form.title}" created`);
    }
    setFormOpen(false);
  }

  function remove() {
    if (!deleteTarget) return;
    setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.title}" deleted`);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description="Manage promotional banners shown across homepage, category, and checkout placements"
        actions={
          <Button size="sm" onClick={openCreate}>
            <ImagePlus className="size-4" /> Add Banner
          </Button>
        }
      />

      {banners.length === 0 ? (
        <EmptyState title="No banners yet" description="Create your first banner to get started." actionLabel="Add Banner" onAction={openCreate} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <Card key={b.id} className="overflow-hidden py-0 gap-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt={b.title} className="h-36 w-full object-cover" />
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium leading-tight">{b.title}</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewTarget(b)}><Eye className="size-4" /> Preview</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(b)}><Pencil className="size-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(b)}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={b.status} />
                  <StatusBadge status={b.placement} label={b.placement} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(b.startDate)} — {formatDate(b.endDate)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Banner" : "Add Banner"}</DialogTitle>
            <DialogDescription>Configure the banner's content, placement, and schedule.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label>Image URL</Label>
              <Input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Placement</Label>
                <Select value={form.placement} onValueChange={(v) => setForm((f) => ({ ...f, placement: v as BannerPlacement }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homepage">Homepage</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="checkout">Checkout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as BannerStatus }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Create Banner"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewTarget} onOpenChange={(o) => !o && setPreviewTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview — {previewTarget?.title}</DialogTitle>
            <DialogDescription>How this banner will appear on the {previewTarget?.placement} placement.</DialogDescription>
          </DialogHeader>
          {previewTarget && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewTarget.image} alt={previewTarget.title} className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this banner?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently removed and stop showing everywhere.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
