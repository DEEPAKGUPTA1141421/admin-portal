import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { OrdersStatusTable } from "../_components/orders-table";
import { ORDERS_DATA } from "@/lib/mock/generate";
import { formatNumber } from "@/lib/format";
import { Truck } from "lucide-react";

export default function ShippedOrdersPage() {
  const data = ORDERS_DATA.filter((o) => o.status === "shipped");

  return (
    <div className="space-y-6">
      <PageHeader title="Shipped Orders" description="Orders dispatched and in transit" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Shipped Orders" value={formatNumber(data.length)} icon={Truck} tone="blue" />
      </div>
      <OrdersStatusTable data={data} exportName="shipped-orders" emptyTitle="No shipped orders" />
    </div>
  );
}
