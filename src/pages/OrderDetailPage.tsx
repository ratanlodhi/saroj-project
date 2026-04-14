import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useOrders, type Order, type TrackingEvent } from '@/hooks/useOrders';

const orderedStages = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

function statusLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OrderDetailPage() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { getOrderById, getTracking, loading } = useOrders();

  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<TrackingEvent[]>([]);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId).then(setOrder);
    getTracking(orderId).then(setTracking);
  }, [orderId, getOrderById, getTracking]);

  const currentIndex = useMemo(() => {
    if (!order) return -1;
    return orderedStages.indexOf(order.order_status);
  }, [order]);

  if (loading && !order) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pb-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-muted-foreground">Order not found</p>
          <Button className="mt-4" onClick={() => navigate('/profile?tab=orders')}>
            Back to orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Order Tracking</p>
            <h1 className="font-serif text-3xl text-primary mt-2">{order.order_number}</h1>
            <p className="text-muted-foreground text-sm mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/profile?tab=orders')}>
            Back to orders
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-xl mb-4">Status Timeline</h2>
            <div className="space-y-4">
              {orderedStages.map((stage, index) => {
                const reached = index <= currentIndex;
                const active = index === currentIndex;
                const event = tracking.find((t) => t.status === stage);

                return (
                  <div key={stage} className="flex gap-3 items-start">
                    <div
                      className={`w-3 h-3 mt-1 rounded-full ${
                        active ? 'bg-accent' : reached ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                    <div>
                      <p className={`font-medium ${reached ? 'text-primary' : 'text-muted-foreground'}`}>
                        {statusLabel(stage)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event?.note || (reached ? 'Completed' : 'Pending')}
                      </p>
                      {event?.created_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="bg-card border border-border rounded-lg p-6 h-fit space-y-4">
            <h2 className="font-serif text-xl">Order Summary</h2>
            <div className="space-y-3 text-sm">
              {(order.order_items || []).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate">{item.artwork_snapshot?.title || 'Artwork'}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span>{formatPrice(item.total_price)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.order_items?.reduce((sum, item) => sum + item.total_price, 0) || order.total_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping & Insurance</span>
                <span>{formatPrice(order.shipping_fee || 0)}</span>
              </div>
            </div>
            
            <div className="border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <span>Payment</span>
                <span>{statusLabel(order.payment_status)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">{formatPrice(order.total_price)}</span>
              </div>
            </div>

            {order.shipment_tracking_url && (
              <a
                href={order.shipment_tracking_url}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-accent hover:text-primary"
              >
                Track Shipment
              </a>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
