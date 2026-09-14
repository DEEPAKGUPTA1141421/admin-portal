"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CUSTOMERS_DATA } from "@/lib/mock/generate";
import { formatINR } from "@/lib/format";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function CustomerProfilesPage() {
  const [query, setQuery] = useState("");

  const data = useMemo(() => {
    const q = query.toLowerCase();
    return CUSTOMERS_DATA.filter((c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 60);
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Profiles" description="Card-based profile view of all registered customers" />
      <Input placeholder="Search by name or email..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((c) => (
          <Link key={c.id} href={`/customers/all-customers/${c.id}`}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarFallback>{initials(c.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <StatusBadge status={c.segment} />
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 truncate"><Mail className="size-3.5 shrink-0" /> {c.email}</p>
                  <p className="flex items-center gap-1.5"><Phone className="size-3.5 shrink-0" /> {c.phone}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="size-3.5 shrink-0" /> {c.city}, {c.state}</p>
                </div>
                <div className="flex items-center justify-between border-t pt-2 text-xs">
                  <span className="text-muted-foreground">{c.totalOrders} orders</span>
                  <span className="font-medium">{formatINR(c.totalSpend, true)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
