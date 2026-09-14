import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { OrdersStatusTable } from "../_components/orders-table";
import { ORDERS_DATA } from "@/lib/mock/generate";
import { formatNumber } from "@/lib/format";
import { PackageCheck } from "lucide-react";

export default function ProcessingOrdersPage() {
  const data = ORDERS_DATA.filter((o) => o.status === "processing");

  return (
    <div className="space-y-6">
      <PageHeader title="Processing Orders" description="Orders currently being processed by sellers" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Processing Orders" value={formatNumber(data.length)} icon={PackageCheck} tone="blue" />
      </div>
      <OrdersStatusTable data={data} exportName="processing-orders" emptyTitle="No orders in processing" />
    </div>
  );
}
