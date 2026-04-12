import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useOrders, type Order } from '@/hooks/useOrders';
import { useCurrency } from '@/contexts/CurrencyContext';

function statusLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { loading, getOrderHistory } = useOrders();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { returnTo: '/orders' } });
      return;
    }

    if (user) {
      getOrderHistory().then(setOrders);
    }
  }, [authLoading, user, navigate, getOrderHistory]);

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Orders</span>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-primary mt-3">Order History</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-10 text-center">
            <p className="text-muted-foreground">No orders yet.</p>
            <Button className="mt-4" onClick={() => navigate('/paintings')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="w-full bg-card border border-border rounded-lg p-5 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-serif text-lg text-primary">{order.order_number || order.id.slice(0, 8)}</h2>
                  <span className="text-xs uppercase tracking-wide bg-secondary px-2 py-1 rounded-sm">
                    {statusLabel(order.order_status)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(order.created_at).toLocaleString()}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {(order.order_items || []).length} item(s)
                  </span>
                  <span className="font-semibold">{formatPrice(order.total_price)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
