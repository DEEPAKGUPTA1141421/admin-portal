import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { OrdersStatusTable } from "../_components/orders-table";
import { ORDERS_DATA } from "@/lib/mock/generate";
import { formatNumber } from "@/lib/format";
import { Ban } from "lucide-react";

export default function CancelledOrdersPage() {
  const data = ORDERS_DATA.filter((o) => o.status === "cancelled");

  return (
    <div className="space-y-6">
      <PageHeader title="Cancelled Orders" description="Orders cancelled by customers, sellers, or admins" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Cancelled Orders" value={formatNumber(data.length)} icon={Ban} tone="red" />
      </div>
      <OrdersStatusTable data={data} exportName="cancelled-orders" emptyTitle="No cancelled orders" />
    </div>
  );
}
