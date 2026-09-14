"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, LayoutTemplate, Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES_DATA, PRODUCTS_DATA } from "@/lib/mock/generate";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

type SectionState = "draft" | "preview" | "published";

interface HomeSection {
  id: string;
  name: string;
  description: string;
  active: boolean;
  order: number;
  state: SectionState;
}

const SECTIONS_SEED: HomeSection[] = [
  { id: "SEC-1", name: "Hero Banner", description: "Full-width rotating promotional banner at the top of the homepage.", active: true, order: 1, state: "published" },
  { id: "SEC-2", name: "Featured Categories", description: "Grid of top-level categories with imagery.", active: true, order: 2, state: "published" },
  { id: "SEC-3", name: "Deals of the Day", description: "Time-boxed discounted products carousel.", active: true, order: 3, state: "preview" },
  { id: "SEC-4", name: "Top Sellers", description: "Best performing products ranked by recent sales.", active: false, order: 4, state: "draft" },
  { id: "SEC-5", name: "New Arrivals", description: "Most recently published products across the catalog.", active: true, order: 5, state: "published" },
];

const PREVIEW_CATEGORIES = CATEGORIES_DATA.slice(0, 6);
const PREVIEW_PRODUCTS = PRODUCTS_DATA.slice(0, 8);
const DEAL_PRODUCTS = PRODUCTS_DATA.filter((p) => p.discountPct >= 15).slice(0, 6);

function SectionMockPreview({ section }: { section: HomeSection }) {
  switch (section.name) {
    case "Hero Banner":
      return (
        <div className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-r from-primary/20 to-primary/5 text-sm font-medium text-muted-foreground">
          Rotating Hero Banner Slot (1600x480)
        </div>
      );
    case "Featured Categories":
      return (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {PREVIEW_CATEGORIES.map((c) => (
            <div key={c.id} className="flex flex-col items-center gap-1 rounded-md border p-2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt={c.name} className="size-10 rounded-full object-cover" />
              <span className="line-clamp-1 text-xs">{c.name}</span>
            </div>
          ))}
        </div>
      );
    case "Deals of the Day":
      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DEAL_PRODUCTS.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-md border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} className="size-10 rounded object-cover" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatINR(p.price)} <span className="line-through">{formatINR(p.mrp)}</span></p>
              </div>
            </div>
          ))}
        </div>
      );
    case "Top Sellers":
    case "New Arrivals":
      return (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {PREVIEW_PRODUCTS.map((p) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={p.id} src={p.image} alt={p.name} className="aspect-square w-full rounded object-cover" />
          ))}
        </div>
      );
    default:
      return null;
  }
}

export default function HomepageCmsPage() {
  const [sections, setSections] = useState<HomeSection[]>(SECTIONS_SEED);
  const [editTarget, setEditTarget] = useState<HomeSection | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const ordered = useMemo(() => [...sections].sort((a, b) => a.order - b.order), [sections]);
  const activeOrdered = useMemo(() => ordered.filter((s) => s.active), [ordered]);

  function toggleActive(s: HomeSection) {
    setSections((prev) => prev.map((x) => (x.id === s.id ? { ...x, active: !x.active } : x)));
    toast.success(`${s.name} ${s.active ? "hidden from" : "shown on"} homepage`);
  }

  function setState(s: HomeSection, state: SectionState) {
    setSections((prev) => prev.map((x) => (x.id === s.id ? { ...x, state } : x)));
    toast.success(`${s.name} moved to ${state}`);
  }

  function move(s: HomeSection, dir: -1 | 1) {
    setSections((prev) => {
      const list = [...prev].sort((a, b) => a.order - b.order);
      const idx = list.findIndex((x) => x.id === s.id);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= list.length) return prev;
      const tmp = list[idx].order;
      list[idx].order = list[swapIdx].order;
      list[swapIdx].order = tmp;
      return list.map((x) => ({ ...x }));
    });
  }

  function openEdit(s: HomeSection) {
    setEditTarget(s);
    setEditDesc(s.description);
  }

  function saveEdit() {
    if (!editTarget) return;
    setSections((prev) => prev.map((x) => (x.id === editTarget.id ? { ...x, description: editDesc } : x)));
    toast.success(`${editTarget.name} updated`);
    setEditTarget(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage Builder"
        description="Configure and order the sections shown on the customer-facing homepage"
        actions={
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-4" /> Preview Homepage
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
          <CardDescription>Toggle visibility, reorder, and manage the publish state of each homepage section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ordered.map((s, i) => (
            <div key={s.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex flex-col">
                  <Button variant="ghost" size="icon" className="size-6" disabled={i === 0} onClick={() => move(s, -1)}>
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-6" disabled={i === ordered.length - 1} onClick={() => move(s, 1)}>
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>
                <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                  <LayoutTemplate className="size-4" />
                </div>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground max-w-md">{s.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Priority #{s.order}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={s.state} />
                <Select value={s.state} onValueChange={(v) => setState(s, v as SectionState)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="preview">Preview</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch checked={s.active} onCheckedChange={() => toggleActive(s)} />
                  <Label className="text-sm text-muted-foreground">Active</Label>
                </div>
                <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Section — {editTarget?.name}</DialogTitle>
            <DialogDescription>Update the section description and review a live-ish preview of its content.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
            <Separator />
            <div className="grid gap-1.5">
              <Label>Preview</Label>
              <div className="rounded-lg border p-3">
                {editTarget && <SectionMockPreview section={editTarget} />}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Homepage Preview</DialogTitle>
            <DialogDescription>Compiled mock rendering of all active sections, in their current order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {activeOrdered.length === 0 && (
              <p className="text-sm text-muted-foreground">No active sections to preview.</p>
            )}
            {activeOrdered.map((s) => (
              <div key={s.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{s.name}</h3>
                  <StatusBadge status={s.state} />
                </div>
                <SectionMockPreview section={s} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
