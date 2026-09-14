"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Truck, IndianRupee, MessageCircle, Radio } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";

const EVENT_TEMPLATES = [
  () => `Order #MP${100000 + Math.floor(Math.random() * 9000)} placed`,
  () => `Seller ${pick(["Metro Traders", "Prime Retail", "Urban Mart", "Royal Bazaar"])} payout processed`,
  () => `Order #MP${100000 + Math.floor(Math.random() * 9000)} out for delivery`,
  () => `Payment captured for #MP${100000 + Math.floor(Math.random() * 9000)}`,
  () => `New seller registration — ${pick(["Nova Enterprises", "Sunrise Store", "Classic Emporium"])}`,
  () => `Return requested for #MP${100000 + Math.floor(Math.random() * 9000)}`,
  () => `Support chat started by customer`,
  () => `Low stock alert — SKU${Math.floor(100000 + Math.random() * 900000)}`,
  () => `Refund processed for #MP${100000 + Math.floor(Math.random() * 9000)}`,
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface FeedEvent {
  id: number;
  text: string;
  time: string;
}

export default function RealTimeOperationsPage() {
  const [ordersLastHour, setOrdersLastHour] = useState(214);
  const [activeDeliveries, setActiveDeliveries] = useState(87);
  const [pendingPayments, setPendingPayments] = useState(12);
  const [liveChats, setLiveChats] = useState(6);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrdersLastHour((v) => Math.max(0, v + Math.floor(Math.random() * 7) - 2));
      setActiveDeliveries((v) => Math.max(0, v + Math.floor(Math.random() * 5) - 2));
      setPendingPayments((v) => Math.max(0, v + Math.floor(Math.random() * 3) - 1));
      setLiveChats((v) => Math.max(0, v + Math.floor(Math.random() * 3) - 1));

      idRef.current += 1;
      const newEvent: FeedEvent = {
        id: idRef.current,
        text: pick(EVENT_TEMPLATES)(),
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
      setFeed((prev) => [newEvent, ...prev].slice(0, 30));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Real-Time Operations"
        description="Live marketplace activity — auto-refreshes every 5 seconds"
        actions={
          <Badge variant="outline" className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Radio className="size-3 animate-pulse" /> Live
          </Badge>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Orders (Last Hour)" value={formatNumber(ordersLastHour)} icon={ShoppingCart} tone="blue" />
        <KpiCard label="Active Deliveries" value={formatNumber(activeDeliveries)} icon={Truck} tone="green" />
        <KpiCard label="Pending Payments" value={formatNumber(pendingPayments)} icon={IndianRupee} tone="orange" />
        <KpiCard label="Live Support Chats" value={formatNumber(liveChats)} icon={MessageCircle} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {feed.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Waiting for live events…</p>
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto">
              {feed.map((e, i) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                  style={{ opacity: i === 0 ? 1 : Math.max(0.5, 1 - i * 0.02) }}
                >
                  <span className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {e.text}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{e.time}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
