import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatShippingCost } from '@/data/shippingConfig';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, getCartTotal, getShippingCost, getTotalWithShipping, getItemCount } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Checkout</span>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-primary mt-3">Your Cart</h1>
          <p className="text-muted-foreground mt-2">Review your selected artworks</p>
        </div>

        {items.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-10 text-center">
            <ShoppingCart className="mx-auto text-muted-foreground mb-4" size={42} />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button className="mt-6" onClick={() => navigate('/paintings')}>
              Browse Paintings
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.artwork.id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                  <img
                    src={item.artwork.image || item.artwork.image_url}
                    alt={item.artwork.title}
                    className="w-20 h-20 object-cover rounded-sm"
                  />
                  <div className="flex-1">
                    <h2 className="font-serif text-lg text-primary">{item.artwork.title}</h2>
                    <p className="text-sm text-muted-foreground">{item.artwork.medium}</p>
                    <p className="font-medium mt-1">{formatPrice(item.artwork.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.artwork.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                    <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-lg p-6 h-fit">
              <h3 className="font-serif text-xl mb-4">Cart Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span>{getItemCount()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground text-xs">{formatShippingCost(getShippingCost())}</span>
                </div>
              </div>

              <div className="border-t border-border my-4" />

              <div className="flex items-center justify-between mb-6">
                <span className="font-serif text-lg">Total</span>
                <span className="font-serif text-xl font-semibold">{formatPrice(getTotalWithShipping())}</span>
              </div>

              <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full mt-3" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
