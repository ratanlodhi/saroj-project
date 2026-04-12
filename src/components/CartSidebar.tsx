import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
export function CartSidebar() {
  const {
    items,
    removeFromCart,
    clearCart,
    getCartTotal,
    getShippingCost,
    getTotalWithShipping,
    getItemCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const { toast } = useToast();
  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = async () => {
    if (getCartTotal() <= 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before checkout',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to complete your purchase',
      });
      setIsCartOpen(false);
      navigate('/auth', {
        state: {
          returnTo: location.pathname,
          openCart: true
        }
      });
      return;
    }

    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl flex items-center gap-2">
            <ShoppingCart size={24} />
            Your Cart
            {getItemCount() > 0 && (
              <span className="text-sm font-sans text-muted-foreground">
                ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Review your selected artworks and proceed to checkout
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingCart size={64} className="text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-sans">Your cart is empty</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Add some beautiful paintings to get started
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setIsCartOpen(false)}
            >
              Continue Browsing
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.artwork.id}
                  className="flex gap-4 p-3 bg-secondary/30 rounded-sm"
                >
                  <img
                    src={item.artwork.image}
                    alt={item.artwork.title}
                    className="w-20 h-20 object-cover rounded-sm"
                  />
                  <div className="flex-1 min-w-0 flex items-stretch justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-serif text-sm font-medium text-primary truncate">
                        {item.artwork.title}
                      </h4>
                      <span className="text-xs text-muted-foreground mt-2 block">
                        Qty: {item.quantity}
                      </span>
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                      <p className="text-sm font-semibold text-primary text-right">
                        {formatPrice(item.artwork.price)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.artwork.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => clearCart()}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping & Insurance</span>
                  <span>{formatPrice(getShippingCost())}</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between font-serif text-lg">
                <span>Total</span>
                <span className="font-semibold">{formatPrice(getTotalWithShipping())}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
              >
                Check out
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
