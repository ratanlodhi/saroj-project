import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useOrders, type Order } from '@/hooks/useOrders';
import { useAddresses, type AddressInput } from '@/hooks/useAddresses';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';

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

function statusLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { loading: ordersLoading, getOrderHistory } = useOrders();
  const {
    addresses,
    loading: addressesLoading,
    addAddress,
    updateAddress,
    deleteAddress,
  } = useAddresses();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressInput>(defaultForm);

  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'addresses' ? 'addresses' : 'orders';

  const setTab = (value: string) => {
    if (value === 'addresses') {
      setSearchParams({ tab: 'addresses' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { returnTo: '/profile' } });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      getOrderHistory().then(setOrders);
    }
  }, [user, getOrderHistory]);

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
        title: 'Missing fields',
        description: 'Please fill all required address fields',
        variant: 'destructive',
      });
      return;
    }

    if (editingAddressId) {
      const updated = await updateAddress(editingAddressId, addressForm);
      if (updated) {
        setEditingAddressId(null);
        setAddressForm(defaultForm);
        setShowAddressForm(false);
      }
      return;
    }

    const created = await addAddress(addressForm);
    if (created) {
      setAddressForm(defaultForm);
      setShowAddressForm(false);
    }
  };

  const startEdit = (address: (typeof addresses)[0]) => {
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
  };

  const cancelForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm(defaultForm);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pb-20 flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Account</span>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-primary mt-3">Profile</h1>
          <p className="text-muted-foreground mt-2 text-sm">{user.email}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-0">
            {ordersLoading ? (
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
                    type="button"
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="w-full bg-card border border-border rounded-lg p-5 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-serif text-lg text-primary">
                        {order.order_number || order.id.slice(0, 8)}
                      </h2>
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
          </TabsContent>

          <TabsContent value="addresses" className="mt-0">
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="font-serif text-lg sm:text-xl">Saved addresses</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto shrink-0"
                  onClick={() => {
                    if (showAddressForm) {
                      cancelForm();
                    } else {
                      setShowAddressForm(true);
                    }
                  }}
                >
                  {showAddressForm ? 'Cancel' : 'Add address'}
                </Button>
              </div>

              {addressesLoading ? (
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : addresses.length === 0 && !showAddressForm ? (
                <p className="text-muted-foreground text-sm">No saved addresses yet. Add one for faster checkout.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-border rounded-md p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{address.full_name}</p>
                        {address.is_default && (
                          <span className="text-xs px-2 py-1 rounded bg-secondary shrink-0">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.address_line1}
                        {address.address_line2 ? `, ${address.address_line2}` : ''}, {address.city},{' '}
                        {address.state} - {address.pincode}, {address.country}
                      </p>
                      <p className="text-sm text-muted-foreground">Phone: {address.phone_number}</p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(address)}
                          className="text-sm text-accent"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAddress(address.id)}
                          className="text-sm text-destructive"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="mt-6 border-t border-border pt-5 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="profile_full_name">Full Name</Label>
                      <Input
                        id="profile_full_name"
                        value={addressForm.full_name}
                        onChange={(e) => setAddressForm((p) => ({ ...p, full_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profile_phone_number">Phone Number</Label>
                      <Input
                        id="profile_phone_number"
                        value={addressForm.phone_number}
                        onChange={(e) => setAddressForm((p) => ({ ...p, phone_number: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="profile_address_line1">Address Line 1</Label>
                    <Input
                      id="profile_address_line1"
                      value={addressForm.address_line1}
                      onChange={(e) => setAddressForm((p) => ({ ...p, address_line1: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile_address_line2">Address Line 2</Label>
                    <Input
                      id="profile_address_line2"
                      value={addressForm.address_line2 || ''}
                      onChange={(e) => setAddressForm((p) => ({ ...p, address_line2: e.target.value }))}
                    />
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="profile_city">City</Label>
                      <Input
                        id="profile_city"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profile_state">State</Label>
                      <Input
                        id="profile_state"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profile_pincode">Pincode</Label>
                      <Input
                        id="profile_pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profile_country">Country</Label>
                      <Input
                        id="profile_country"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))}
                      />
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

                  <Button type="submit">{editingAddressId ? 'Update address' : 'Save address'}</Button>
                </form>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
