import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { OrdersStatusTable } from "../_components/orders-table";
import { ORDERS_DATA } from "@/lib/mock/generate";
import { formatNumber } from "@/lib/format";
import { RotateCcw } from "lucide-react";

export default function ReturnedOrdersPage() {
  const data = ORDERS_DATA.filter((o) => o.status === "returned");

  return (
    <div className="space-y-6">
      <PageHeader title="Returned Orders" description="Orders returned by customers" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Returned Orders" value={formatNumber(data.length)} icon={RotateCcw} tone="orange" />
      </div>
      <OrdersStatusTable data={data} exportName="returned-orders" emptyTitle="No returned orders" />
    </div>
  );
}
