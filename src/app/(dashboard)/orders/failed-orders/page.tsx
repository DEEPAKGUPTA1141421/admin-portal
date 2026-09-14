import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { OrdersStatusTable } from "../_components/orders-table";
import { ORDERS_DATA } from "@/lib/mock/generate";
import { formatNumber } from "@/lib/format";
import { AlertTriangle } from "lucide-react";

export default function FailedOrdersPage() {
  const data = ORDERS_DATA.filter((o) => o.status === "failed");

  return (
    <div className="space-y-6">
      <PageHeader title="Failed Orders" description="Orders that failed to complete due to payment or processing errors" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Failed Orders" value={formatNumber(data.length)} icon={AlertTriangle} tone="red" />
      </div>
      <OrdersStatusTable data={data} exportName="failed-orders" emptyTitle="No failed orders" />
    </div>
  );
}
