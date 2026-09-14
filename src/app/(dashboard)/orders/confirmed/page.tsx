import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { OrdersStatusTable } from "../_components/orders-table";
import { ORDERS_DATA } from "@/lib/mock/generate";
import { formatNumber } from "@/lib/format";
import { CheckCircle2 } from "lucide-react";

export default function ConfirmedOrdersPage() {
  const data = ORDERS_DATA.filter((o) => o.status === "confirmed");

  return (
    <div className="space-y-6">
      <PageHeader title="Confirmed Orders" description="Orders confirmed and awaiting processing" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Confirmed Orders" value={formatNumber(data.length)} icon={CheckCircle2} tone="blue" />
      </div>
      <OrdersStatusTable data={data} exportName="confirmed-orders" emptyTitle="No confirmed orders" />
    </div>
  );
}
