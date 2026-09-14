import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { OrdersStatusTable } from "../_components/orders-table";
import { ORDERS_DATA } from "@/lib/mock/generate";
import { formatINR, formatNumber } from "@/lib/format";
import { Clock } from "lucide-react";

export default function PendingPaymentPage() {
  const data = ORDERS_DATA.filter((o) => o.status === "pending_payment");
  const amount = data.reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Pending Payment" description="Orders awaiting payment confirmation" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Pending Orders" value={formatNumber(data.length)} icon={Clock} tone="orange" />
        <KpiCard label="Value at Risk" value={formatINR(amount, true)} icon={Clock} tone="orange" />
      </div>
      <OrdersStatusTable data={data} exportName="pending-payment" emptyTitle="No orders pending payment" />
    </div>
  );
}
