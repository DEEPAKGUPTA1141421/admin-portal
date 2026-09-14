import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { OrdersStatusTable } from "../_components/orders-table";
import { ORDERS_DATA } from "@/lib/mock/generate";
import { formatNumber } from "@/lib/format";
import { Truck } from "lucide-react";

export default function OutForDeliveryPage() {
  const data = ORDERS_DATA.filter((o) => o.status === "out_for_delivery");

  return (
    <div className="space-y-6">
      <PageHeader title="Out for Delivery" description="Orders with the delivery agent, out for final delivery" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Out for Delivery" value={formatNumber(data.length)} icon={Truck} tone="blue" />
      </div>
      <OrdersStatusTable data={data} exportName="out-for-delivery" emptyTitle="No orders out for delivery" />
    </div>
  );
}
