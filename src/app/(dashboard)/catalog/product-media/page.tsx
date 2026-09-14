"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { PRODUCTS_DATA } from "@/lib/mock/generate";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  productId: string;
  productName: string;
  url: string;
}

function buildSeed(): MediaItem[] {
  return PRODUCTS_DATA.slice(0, 24).map((p, i) => ({
    id: `MED-${i + 1}`, productId: p.id, productName: p.name, url: p.image,
  }));
}

export default function ProductMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>(buildSeed);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [productId, setProductId] = useState(PRODUCTS_DATA[0]?.id ?? "");
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);

  function upload() {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) return;
    const item: MediaItem = {
      id: `MED-NEW-${Date.now()}`, productId, productName: product.name,
      url: `https://picsum.photos/seed/upload-${Date.now()}/400/400`,
    };
    setMedia((prev) => [item, ...prev]);
    toast.success(`Image uploaded for ${product.name}`);
    setUploadOpen(false);
  }

  function remove() {
    if (!deleteTarget) return;
    setMedia((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    toast.success("Image removed");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Media"
        description={`${media.length} images across the product catalog`}
        actions={
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild><Button size="sm"><Upload /> Upload Image</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Product Image</DialogTitle>
                <DialogDescription>Attach a new image to a product's media gallery.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Product</Label>
                  <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRODUCTS_DATA.slice(0, 40).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed text-sm text-muted-foreground">
                  <div className="text-center">
                    <Upload className="mx-auto mb-1 size-5" />
                    Drop file here or click to browse (simulated)
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
                <Button onClick={upload}><Plus /> Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {media.map((m) => (
          <Card key={m.id} className="group relative overflow-hidden py-0">
            <Image src={m.url} alt={m.productName} width={200} height={200} className="aspect-square w-full object-cover" unoptimized />
            <CardContent className="p-2">
              <p className="truncate text-xs text-muted-foreground">{m.productName}</p>
            </CardContent>
            <Button
              size="icon" variant="destructive"
              className="absolute right-1.5 top-1.5 size-6 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setDeleteTarget(m)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove image?</AlertDialogTitle>
            <AlertDialogDescription>This image will be removed from &quot;{deleteTarget?.productName}&quot;'s gallery.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
