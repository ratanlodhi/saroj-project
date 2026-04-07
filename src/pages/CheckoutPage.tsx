import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAddresses, type AddressInput } from '@/hooks/useAddresses';
import { useOrders } from '@/hooks/useOrders';
import { useRazorpay } from '@/hooks/useRazorpay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const defaultForm: AddressInput = {
  full_name: '',
  phone_number: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  is_default: false,
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { items, getCartTotal, getShippingCost, getTotalWithShipping, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { addresses, loading: addressesLoading, addAddress, updateAddress, deleteAddress } = useAddresses();
  const { placeOrder } = useOrders();
  const { initiatePayment, isLoading } = useRazorpay();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressInput>(defaultForm);
  const [notes, setNotes] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const subtotal = getCartTotal();
  const shippingCost = getShippingCost();
  const total = getTotalWithShipping();

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const canCheckout = user && items.length > 0 && selectedAddress && agreeToTerms;

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !addressForm.full_name.trim() ||
      !addressForm.phone_number.trim() ||
      !addressForm.address_line1.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.pincode.trim() ||
      !addressForm.country.trim()
    ) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill all required address fields',
        variant: 'destructive',
      });
      return;
    }

    if (editingAddressId) {
      const updated = await updateAddress(editingAddressId, addressForm);
      if (updated) {
        setSelectedAddressId(updated.id);
        setEditingAddressId(null);
        setAddressForm(defaultForm);
        setShowAddressForm(false);
        toast({ title: 'Address Updated', description: 'Delivery address has been updated' });
      }
      return;
    }

    const created = await addAddress(addressForm);
    if (created) {
      setSelectedAddressId(created.id);
      setAddressForm(defaultForm);
      setShowAddressForm(false);
      toast({ title: 'Address Added', description: 'Delivery address has been saved' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/auth', { state: { returnTo: '/checkout' } });
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: 'Terms Required',
        description: 'Please agree to the Terms of Service and Privacy Policy',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedAddress) {
      toast({
        title: 'Address Required',
        description: 'Please select a delivery address before payment',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add at least one artwork before checkout',
        variant: 'destructive',
      });
      return;
    }

    initiatePayment({
      amount: total,
      currency: 'INR',
      name: 'Rasayan Art Gallery',
      description: `Order for ${items.length} artwork(s)`,
      prefill: {
        name: selectedAddress.full_name,
        contact: selectedAddress.phone_number,
        email: user.email,
      },
      onSuccess: async (paymentId) => {
        const order = await placeOrder({
          addressId: selectedAddress.id,
          paymentMethod: 'razorpay',
          paymentReference: paymentId,
          notes: notes.trim() || null,
        });

        if (order) {
          clearCart();
          toast({
            title: 'Order Placed',
            description: `Your order ${order.order_number} has been placed successfully.`,
          });
          navigate(`/orders/${order.id}`);
        }
      },
      onError: (error) => {
        toast({
          title: 'Payment Failed',
          description: error || 'Unable to complete payment',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Checkout</span>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-primary mt-3">Delivery and Payment</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl">Select Delivery Address</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddressForm((v) => !v);
                    if (showAddressForm) {
                      setEditingAddressId(null);
                      setAddressForm(defaultForm);
                    }
                  }}
                >
                  {showAddressForm ? 'Cancel' : 'Add Address'}
                </Button>
              </div>

              {addressesLoading ? (
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : addresses.length === 0 ? (
                <p className="text-muted-foreground text-sm">No saved address. Add one to continue.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label key={address.id} className="block border border-border rounded-md p-3 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{address.full_name}</p>
                            {address.is_default && (
                              <span className="text-xs px-2 py-1 rounded bg-secondary">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {address.address_line1}
                            {address.address_line2 ? `, ${address.address_line2}` : ''}, {address.city}, {address.state} - {address.pincode}, {address.country}
                          </p>
                          <p className="text-sm text-muted-foreground">Phone: {address.phone_number}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddressId(address.id);
                              setAddressForm({
                                full_name: address.full_name,
                                phone_number: address.phone_number,
                                address_line1: address.address_line1,
                                address_line2: address.address_line2 || '',
                                city: address.city,
                                state: address.state,
                                pincode: address.pincode,
                                country: address.country,
                                is_default: Boolean(address.is_default),
                              });
                              setShowAddressForm(true);
                            }}
                            className="text-sm text-accent mt-2 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAddress(address.id)}
                            className="text-sm text-destructive mt-2"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="mt-6 border-t border-border pt-5 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={addressForm.full_name}
                        onChange={(e) => setAddressForm((p) => ({ ...p, full_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        value={addressForm.phone_number}
                        onChange={(e) => setAddressForm((p) => ({ ...p, phone_number: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address_line1">Address Line 1</Label>
                    <Input
                      id="address_line1"
                      value={addressForm.address_line1}
                      onChange={(e) => setAddressForm((p) => ({ ...p, address_line1: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_line2">Address Line 2</Label>
                    <Input
                      id="address_line2"
                      value={addressForm.address_line2 || ''}
                      onChange={(e) => setAddressForm((p) => ({ ...p, address_line2: e.target.value }))}
                    />
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={addressForm.city} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={addressForm.state} onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" value={addressForm.pincode} onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={addressForm.country} onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))} />
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(addressForm.is_default)}
                      onChange={(e) => setAddressForm((p) => ({ ...p, is_default: e.target.checked }))}
                    />
                    Set as default address
                  </label>

                  <Button type="submit">{editingAddressId ? 'Update Address' : 'Save Address'}</Button>
                </form>
              )}
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any delivery instructions"
                className="mt-2"
              />
            </section>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 h-fit">
            <h2 className="font-serif text-xl mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.artwork.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate">{item.artwork.title}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span>{formatPrice(item.artwork.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border my-4" />

            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span>Shipping & Insurance</span>
              <span>{formatPrice(shippingCost)}</span>
            </div>
            <div className="flex items-center justify-between mt-4 font-serif text-lg border-t border-border pt-4">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* Terms Agreement */}
            <div className="mt-6 space-y-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(Boolean(checked))}
                  className="mt-1"
                />
                <span className="text-xs text-muted-foreground">
                  I agree to the{' '}
                  <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            <Button className="w-full mt-6" size="lg" disabled={!canCheckout || isLoading} onClick={handlePlaceOrder}>
              {isLoading ? 'Processing...' : 'Pay and Place Order'}
            </Button>

            {!user && <p className="text-sm text-muted-foreground mt-3">Login is required for checkout.</p>}
            {!agreeToTerms && user && <p className="text-sm text-amber-600 mt-3">Please accept the terms to continue.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
