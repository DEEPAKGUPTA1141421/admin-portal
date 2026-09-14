"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";
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
import { formatDate, formatINR } from "@/lib/format";
import { toast } from "sonner";

interface DealItem {
  productId: string;
  productName: string;
  image: string;
  mrp: number;
  dealPrice: number;
}

export default function DealsPage() {
  const [deals] = useState(() => CAMPAIGNS_DATA.filter((c) => c.type === "deal"));
  const [items, setItems] = useState<Record<string, DealItem[]>>({});
  const [attaching, setAttaching] = useState<string | null>(null);
  const [productId, setProductId] = useState(PRODUCTS_DATA[0]?.id ?? "");
  const [dealPrice, setDealPrice] = useState("");

  function attachProduct() {
    const p = PRODUCTS_DATA.find((x) => x.id === productId);
    if (!p || !attaching) return;
    const price = Number(dealPrice) || Math.round(p.price * 0.85);
    setItems((prev) => ({
      ...prev,
      [attaching]: [...(prev[attaching] ?? []), { productId: p.id, productName: p.name, image: p.image, mrp: p.mrp, dealPrice: price }],
    }));
    toast.success(`${p.name} added at ${formatINR(price)}`);
    setAttaching(null);
    setDealPrice("");
  }

  function removeItem(dealId: string, productId: string) {
    setItems((prev) => ({ ...prev, [dealId]: (prev[dealId] ?? []).filter((i) => i.productId !== productId) }));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Deals" description={`${deals.length} ongoing and upcoming deals`} />

      <div className="grid gap-4 lg:grid-cols-2">
        {deals.map((d) => (
          <Card key={d.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{d.name}</CardTitle>
                <CardDescription>{formatDate(d.startDate)} — {formatDate(d.endDate)}</CardDescription>
              </div>
              <StatusBadge status={d.status} />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {(items[d.id] ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No products attached yet.</p>
                )}
                {(items[d.id] ?? []).map((i) => (
                  <div key={i.productId} className="flex items-center gap-2 rounded-md border p-2">
                    <Image src={i.image} alt={i.productName} width={32} height={32} className="rounded object-cover" unoptimized />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{i.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="line-through">{formatINR(i.mrp)}</span> <span className="font-medium text-foreground">{formatINR(i.dealPrice)}</span>
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="size-6" onClick={() => removeItem(d.id, i.productId)}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={() => setAttaching(d.id)}>
                <Plus className="size-3.5" /> Add Product
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!attaching} onOpenChange={(v) => { if (!v) { setAttaching(null); setDealPrice(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product to Deal</DialogTitle>
            <DialogDescription>Pick a product and set its deal price.</DialogDescription>
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
              <Label>Deal Price (₹)</Label>
              <Input type="number" value={dealPrice} onChange={(e) => setDealPrice(e.target.value)} placeholder="Leave blank for auto 15% off" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttaching(null)}>Cancel</Button>
            <Button onClick={attachProduct}>Add to Deal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
