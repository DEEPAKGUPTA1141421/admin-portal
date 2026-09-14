import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { OrdersStatusTable } from "../_components/orders-table";
import { ORDERS_DATA } from "@/lib/mock/generate";
import { formatINR, formatNumber } from "@/lib/format";
import { PackageCheck } from "lucide-react";

export default function DeliveredOrdersPage() {
  const data = ORDERS_DATA.filter((o) => o.status === "delivered");
  const gmv = data.reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Delivered Orders" description="Orders successfully delivered to customers" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Delivered Orders" value={formatNumber(data.length)} icon={PackageCheck} tone="green" />
        <KpiCard label="Delivered GMV" value={formatINR(gmv, true)} icon={PackageCheck} tone="green" />
      </div>
      <OrdersStatusTable data={data} exportName="delivered-orders" emptyTitle="No delivered orders" />
    </div>
  );
}
