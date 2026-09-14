"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { INITIAL_GATEWAYS, type GatewayConfig } from "@/lib/mock/payments-local";
import { formatPct } from "@/lib/format";

function ConfigureDialog({ gw, onSave }: { gw: GatewayConfig; onSave: (g: GatewayConfig) => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(gw.mode);
  const [apiKey, setApiKey] = useState(gw.apiKey);

  const submit = () => {
    onSave({ ...gw, mode, apiKey });
    toast.success(`${gw.name} configuration saved`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Configure</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {gw.name}</DialogTitle>
          <DialogDescription>Gateway credentials and mode (demo only — no secrets are stored).</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as "live" | "test")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="test">Test</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="api-key">API Key</Label>
            <Input id="api-key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState<GatewayConfig[]>(INITIAL_GATEWAYS);

  const toggle = (id: string) => {
    setGateways((prev) => prev.map((g) => {
      if (g.id !== id) return g;
      const next = { ...g, status: g.status === "active" ? "inactive" as const : "active" as const };
      toast.success(`${g.name} ${next.status === "active" ? "enabled" : "disabled"}`);
      return next;
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Gateways" description="Configure and monitor payment gateway integrations" />
      <div className="grid gap-4 md:grid-cols-2">
        {gateways.map((g) => (
          <Card key={g.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {g.name}
                <StatusBadge status={g.mode} />
              </CardTitle>
              <Switch checked={g.status === "active"} onCheckedChange={() => toggle(g.id)} />
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={g.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-medium">{formatPct(g.successRatePct)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Key</span>
                <span className="font-mono text-xs">{g.apiKey}</span>
              </div>
              <div className="pt-2">
                <ConfigureDialog gw={g} onSave={(updated) => setGateways((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
