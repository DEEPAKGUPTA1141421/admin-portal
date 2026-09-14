import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { OrdersStatusTable } from "../_components/orders-table";
import { ORDERS_DATA } from "@/lib/mock/generate";
import { formatNumber } from "@/lib/format";
import { Boxes } from "lucide-react";

export default function ReadyToShipPage() {
  const data = ORDERS_DATA.filter((o) => o.status === "ready_to_ship");

  return (
    <div className="space-y-6">
      <PageHeader title="Ready to Ship" description="Orders ready for carrier pickup" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Ready to Ship" value={formatNumber(data.length)} icon={Boxes} tone="blue" />
      </div>
      <OrdersStatusTable data={data} exportName="ready-to-ship" emptyTitle="No orders ready to ship" />
    </div>
  );
}
