"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { INITIAL_PAYMENT_METHODS, type PaymentMethodConfig } from "@/lib/mock/payments-local";

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>(
    [...INITIAL_PAYMENT_METHODS].sort((a, b) => a.displayOrder - b.displayOrder)
  );

  const toggle = (id: string) => {
    setMethods((prev) => prev.map((m) => {
      if (m.id !== id) return m;
      const next = { ...m, enabled: !m.enabled };
      toast.success(`${m.name} ${next.enabled ? "enabled" : "disabled"} at checkout`);
      return next;
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Methods" description="Accepted payment methods and their checkout display order" />
      <Card>
        <CardContent className="divide-y p-0">
          {methods.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <GripVertical className="size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">Display order: {m.displayOrder}</p>
                </div>
              </div>
              <Switch checked={m.enabled} onCheckedChange={() => toggle(m.id)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
