import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { OrdersStatusTable } from "../_components/orders-table";
import { ORDERS_DATA } from "@/lib/mock/generate";
import { formatNumber } from "@/lib/format";
import { Sparkles } from "lucide-react";

export default function NewOrdersPage() {
  const data = [...ORDERS_DATA]
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    .slice(0, 50);

  return (
    <div className="space-y-6">
      <PageHeader title="New Orders" description="Most recently placed orders across the marketplace" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="New Orders" value={formatNumber(data.length)} icon={Sparkles} tone="blue" />
      </div>
      <OrdersStatusTable data={data} exportName="new-orders" emptyTitle="No recent orders" />
    </div>
  );
}
