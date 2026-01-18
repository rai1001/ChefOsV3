import { requireUserContext } from "@/modules/shared/data/server-context";
import { AppShell } from "@/modules/shared/ui/app-shell";
import { PageHeader } from "@/modules/shared/ui/page-header";

const OrdersPage = async () => {
  const { user, membership } = await requireUserContext();

  return (
    <AppShell userEmail={user.email ?? ""} orgName={membership.orgName}>
      <PageHeader
        title="Pedidos"
        subtitle="Compras y órdenes por hotel"
        actions={
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
            Placeholder
          </span>
        }
      />
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-700">
          Aquí vivirá el slice de purchase_orders y suppliers con RLS por
          organización.
        </p>
      </div>
    </AppShell>
  );
};

export default OrdersPage;
