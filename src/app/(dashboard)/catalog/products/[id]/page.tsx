"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PRODUCTS_DATA, REVIEWS_DATA, SELLERS_DATA } from "@/lib/mock/generate";
import { formatINR, formatNumber, formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = PRODUCTS_DATA.find((p) => p.id === id);
  if (!product) notFound();

  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [mrp, setMrp] = useState(String(product.mrp));
  const [stock, setStock] = useState(String(product.stock));

  const seller = SELLERS_DATA.find((s) => s.id === product.sellerId);
  const reviews = REVIEWS_DATA.filter((r) => r.productId === product.id);

  function saveChanges() {
    toast.success(`Changes to "${name}" saved`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="size-8" asChild>
          <Link href="/catalog/products"><ArrowLeft className="size-4" /></Link>
        </Button>
        <PageHeader
          title={product.name}
          description={`SKU ${product.sku} · ${product.categoryName} · ${product.brandName}`}
          actions={<StatusBadge status={product.status} />}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Price" value={formatINR(product.price)} icon={Star} tone="green" />
        <KpiCard label="Stock" value={formatNumber(product.stock)} tone={product.stock <= product.minStock ? "orange" : "blue"} />
        <KpiCard label="Rating" value={`${product.rating.toFixed(1)} / 5`} icon={Star} tone="orange" />
        <KpiCard label="Reviews" value={formatNumber(product.reviewCount)} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle>Image</CardTitle></CardHeader>
              <CardContent>
                <Image src={product.image} alt={product.name} width={300} height={300} className="w-full rounded-lg object-cover" unoptimized />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Edit Product</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-1.5">
                    <Label>MRP</Label>
                    <Input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Price</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Stock</Label>
                    <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Seller: </span>
                    <Link href={`/sellers/seller-profiles/${seller?.id}`} className="hover:underline font-medium">{product.sellerName}</Link>
                  </div>
                  <div><span className="text-muted-foreground">Cost Price: </span>{formatINR(product.costPrice)}</div>
                  <div><span className="text-muted-foreground">GST: </span>{product.gstPct}%</div>
                  <div><span className="text-muted-foreground">Weight: </span>{product.weightKg} kg</div>
                  <div><span className="text-muted-foreground">Created: </span>{formatDate(product.createdAt)}</div>
                  <div><span className="text-muted-foreground">Updated: </span>{formatDate(product.updatedAt)}</div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={saveChanges}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {[
                ["Category", product.categoryName], ["Brand", product.brandName], ["SKU", product.sku],
                ["Slug", product.slug], ["Warehouse", product.warehouseId], ["Min Stock", String(product.minStock)],
                ["GST %", `${product.gstPct}%`], ["Weight", `${product.weightKg} kg`], ["Discount", `${product.discountPct}%`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">{k}</div>
                  <div className="font-medium">{v}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Variants</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No variant-specific SKUs configured for this product. See{" "}
              <Link href="/catalog/product-variants" className="underline">Product Variants</Link> to add attribute-based variants.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Media Gallery</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {Array.from({ length: 5 }, (_, i) => (
                <Image key={i} src={`https://picsum.photos/seed/${product.slug}-${i}/300/300`} alt="" width={140} height={140} className="aspect-square w-full rounded-md object-cover" unoptimized />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <div className="space-y-3">
            {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet for this product.</p>}
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.title}</div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-amber-500">
                    {Array.from({ length: r.rating }, (_, i) => <Star key={i} className="size-3.5 fill-amber-400" />)}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">by {r.customerName} on {formatDate(r.createdAt)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Activity Log</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span>Product created</span><span className="text-muted-foreground">{formatDateTime(product.createdAt)}</span></div>
              <div className="flex justify-between border-b pb-2"><span>Last updated</span><span className="text-muted-foreground">{formatDateTime(product.updatedAt)}</span></div>
              <div className="flex justify-between"><span>Status set to {product.status.replace(/_/g, " ")}</span><span className="text-muted-foreground">{formatDateTime(product.updatedAt)}</span></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
