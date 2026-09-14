"use client";

import { useState } from "react";
import { GripVertical, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { RETURN_REASON_CONFIG, type ReturnReasonConfig } from "../_lib/mock";
import { toast } from "sonner";

export default function ReturnReasonsPage() {
  const [reasons, setReasons] = useState<ReturnReasonConfig[]>(() => [...RETURN_REASON_CONFIG].sort((a, b) => a.order - b.order));
  const [addOpen, setAddOpen] = useState(false);
  const [newReason, setNewReason] = useState("");

  function toggle(id: string) {
    setReasons((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }

  function move(id: string, dir: -1 | 1) {
    setReasons((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy.map((r, i) => ({ ...r, order: i + 1 }));
    });
  }

  function addReason() {
    if (!newReason.trim()) {
      toast.error("Enter a reason name");
      return;
    }
    setReasons((prev) => [...prev, { id: `RR-NEW-${Date.now()}`, name: newReason.trim(), enabled: true, order: prev.length + 1 }]);
    toast.success(`Return reason "${newReason.trim()}" added`);
    setNewReason("");
    setAddOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Return Reasons"
        description="Configure the reasons customers can select when requesting a return"
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus /> Add Reason</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Return Reason</DialogTitle>
                <DialogDescription>This reason becomes selectable on the customer return flow.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-1.5">
                <Label>Reason name</Label>
                <Input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="e.g. Late delivery" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={addReason}>Add Reason</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="divide-y px-0">
          {reasons.map((r, i) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3">
              <GripVertical className="size-4 text-muted-foreground" />
              <span className="w-6 text-sm text-muted-foreground">{i + 1}.</span>
              <span className="flex-1 text-sm font-medium">{r.name}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="size-7" onClick={() => move(r.id, -1)} disabled={i === 0}>
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7" onClick={() => move(r.id, 1)} disabled={i === reasons.length - 1}>
                  <ArrowDown className="size-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{r.enabled ? "Enabled" : "Disabled"}</span>
                <Switch checked={r.enabled} onCheckedChange={() => toggle(r.id)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
