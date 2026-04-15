import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useOrders, type Order, type OrderStatus } from '@/hooks/useOrders';

const statusOptions: OrderStatus[] = [
  'placed',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

function statusLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin, roleResolved } = useAuth();
  const { formatPrice } = useCurrency();
  const { loading, getAllOrders, adminUpdateOrderStatus } = useOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { status: OrderStatus; note: string; provider: string; trackingId: string; trackingUrl: string }>>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth', { state: { returnTo: '/admin/orders' } });
        return;
      }
      if (roleResolved && !isAdmin) {
        navigate('/');
        return;
      }
      if (!roleResolved) {
        return;
      }
      getAllOrders().then((data) => {
        setOrders(data);
        const initialDrafts: typeof drafts = {};
        data.forEach((order) => {
          initialDrafts[order.id] = {
            status: order.order_status,
            note: '',
            provider: order.shipment_provider || '',
            trackingId: order.shipment_tracking_id || '',
            trackingUrl: order.shipment_tracking_url || '',
          };
        });
        setDrafts(initialDrafts);
      });
    }
  }, [authLoading, user, isAdmin, roleResolved, navigate, getAllOrders]);

  const handleUpdate = async (orderId: string) => {
    const draft = drafts[orderId];
    if (!draft) return;

    setPendingId(orderId);
    const updated = await adminUpdateOrderStatus({
      orderId,
      status: draft.status,
      note: draft.note,
      shipmentProvider: draft.provider,
      shipmentTrackingId: draft.trackingId,
      shipmentTrackingUrl: draft.trackingUrl,
    });
    setPendingId(null);

    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto max-w-7xl w-full min-w-0 px-3 sm:px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
          <div className="min-w-0">
            <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Admin</span>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-primary mt-2">
              Order Management
            </h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')} className="w-full sm:w-auto shrink-0">
            Back to Admin Panel
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const draft = drafts[order.id];
              return (
                <div key={order.id} className="bg-card border border-border rounded-lg p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-serif text-lg break-all">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.profiles?.display_name || order.profiles?.email || order.user_id}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleString()} • {order.order_items?.length || 0} item(s)
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="font-serif text-lg text-primary">{formatPrice(order.total_price)}</p>
                      <p className="text-sm">Current: {statusLabel(order.order_status)}</p>
                      <p className="text-xs text-muted-foreground">Payment: {statusLabel(order.payment_status)}</p>
                    </div>
                  </div>

                  {draft && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
                      <select
                        value={draft.status}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [order.id]: { ...prev[order.id], status: e.target.value as OrderStatus },
                          }))
                        }
                        className="bg-card text-foreground px-3 py-2 rounded-sm border border-border"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>

                      <Input
                        placeholder="Shipment Provider"
                        value={draft.provider}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [order.id]: { ...prev[order.id], provider: e.target.value },
                          }))
                        }
                      />

                      <Input
                        placeholder="Tracking ID"
                        value={draft.trackingId}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [order.id]: { ...prev[order.id], trackingId: e.target.value },
                          }))
                        }
                      />

                      <Input
                        placeholder="Tracking URL"
                        value={draft.trackingUrl}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [order.id]: { ...prev[order.id], trackingUrl: e.target.value },
                          }))
                        }
                      />

                      <div className="flex flex-col gap-2 sm:flex-row sm:col-span-2 lg:col-span-1">
                        <Input
                          placeholder="Note"
                          value={draft.note}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [order.id]: { ...prev[order.id], note: e.target.value },
                            }))
                          }
                          className="min-w-0 flex-1"
                        />
                        <Button
                          onClick={() => handleUpdate(order.id)}
                          disabled={pendingId === order.id}
                          className="shrink-0 w-full sm:w-auto"
                        >
                          {pendingId === order.id ? 'Saving...' : 'Update'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
