"use client";

import { useState } from "react";
import Image from "next/image";
import { Timer, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CAMPAIGNS_DATA, PRODUCTS_DATA } from "@/lib/mock/generate";
import { formatDateTime, formatINR } from "@/lib/format";
import { toast } from "sonner";

interface FlashItem {
  productId: string;
  productName: string;
  image: string;
  mrp: number;
  flashPrice: number;
}

export default function FlashSalesPage() {
  const [sales] = useState(() => CAMPAIGNS_DATA.filter((c) => c.type === "flash_sale"));
  const [items, setItems] = useState<Record<string, FlashItem[]>>({});
  const [attaching, setAttaching] = useState<string | null>(null);
  const [productId, setProductId] = useState(PRODUCTS_DATA[0]?.id ?? "");
  const [flashPrice, setFlashPrice] = useState("");

  function attachProduct() {
    const p = PRODUCTS_DATA.find((x) => x.id === productId);
    if (!p || !attaching) return;
    const price = Number(flashPrice) || Math.round(p.price * 0.7);
    setItems((prev) => ({
      ...prev,
      [attaching]: [...(prev[attaching] ?? []), { productId: p.id, productName: p.name, image: p.image, mrp: p.mrp, flashPrice: price }],
    }));
    toast.success(`${p.name} added at ${formatINR(price)}`);
    setAttaching(null);
    setFlashPrice("");
  }

  function removeItem(campaignId: string, productId: string) {
    setItems((prev) => ({ ...prev, [campaignId]: (prev[campaignId] ?? []).filter((i) => i.productId !== productId) }));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Flash Sales" description={`${sales.length} time-boxed flash sale campaigns`} />

      <div className="grid gap-4 lg:grid-cols-2">
        {sales.map((s) => {
          const now = Date.now();
          const end = new Date(s.endDate).getTime();
          const hoursLeft = Math.max(0, Math.round((end - now) / 3600000));
          return (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">{s.name}</CardTitle>
                  <CardDescription>{formatDateTime(s.startDate)} → {formatDateTime(s.endDate)}</CardDescription>
                </div>
                <StatusBadge status={s.status} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                  <Timer className="size-4" />
                  {s.status === "active" ? `${hoursLeft}h remaining` : s.status === "ended" ? "Sale ended" : "Not started yet"}
                </div>

                <div className="space-y-2">
                  {(items[s.id] ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground">No products attached yet.</p>
                  )}
                  {(items[s.id] ?? []).map((i) => (
                    <div key={i.productId} className="flex items-center gap-2 rounded-md border p-2">
                      <Image src={i.image} alt={i.productName} width={32} height={32} className="rounded object-cover" unoptimized />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{i.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="line-through">{formatINR(i.mrp)}</span> <span className="font-medium text-foreground">{formatINR(i.flashPrice)}</span>
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="size-6" onClick={() => removeItem(s.id, i.productId)}>
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button size="sm" variant="outline" onClick={() => setAttaching(s.id)}>
                  <Plus className="size-3.5" /> Add Product
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!attaching} onOpenChange={(v) => { if (!v) { setAttaching(null); setFlashPrice(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product to Flash Sale</DialogTitle>
            <DialogDescription>Pick a product and set its special flash sale price.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCTS_DATA.slice(0, 60).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — {formatINR(p.price)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Flash Price (₹)</Label>
              <Input type="number" value={flashPrice} onChange={(e) => setFlashPrice(e.target.value)} placeholder="Leave blank for auto 30% off" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttaching(null)}>Cancel</Button>
            <Button onClick={attachProduct}>Add to Sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
