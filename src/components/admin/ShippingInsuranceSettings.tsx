import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  DEFAULT_SHIPPING_INSURANCE_PERCENTAGE,
  SHIPPING_INSURANCE_STORAGE_KEY,
  normalizeShippingInsurancePercentage,
} from '@/data/shippingConfig';

const db = supabase as any;

export default function ShippingInsuranceSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [shippingPercentage, setShippingPercentage] = useState<number>(DEFAULT_SHIPPING_INSURANCE_PERCENTAGE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);

      const localValue = localStorage.getItem(SHIPPING_INSURANCE_STORAGE_KEY);
      if (localValue !== null) {
        setShippingPercentage(normalizeShippingInsurancePercentage(localValue));
      }

      const { data, error } = await db
        .from('app_settings')
        .select('shipping_insurance_percentage')
        .eq('id', 1)
        .maybeSingle();

      setLoading(false);

      if (error) {
        console.error('Failed to load shipping settings', error);
        return;
      }

      const normalized = normalizeShippingInsurancePercentage(data?.shipping_insurance_percentage);
      setShippingPercentage(normalized);
      localStorage.setItem(SHIPPING_INSURANCE_STORAGE_KEY, String(normalized));
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    const normalized = normalizeShippingInsurancePercentage(shippingPercentage);

    const { error } = await db
      .from('app_settings')
      .upsert(
        {
          id: 1,
          shipping_insurance_percentage: normalized,
          updated_by: user?.id ?? null,
        },
        { onConflict: 'id' }
      );

    setSaving(false);

    if (error) {
      toast({
        title: 'Save Failed',
        description: error.message || 'Unable to update Shipping and Insurance percentage',
        variant: 'destructive',
      });
      return;
    }

    setShippingPercentage(normalized);
    localStorage.setItem(SHIPPING_INSURANCE_STORAGE_KEY, String(normalized));
    window.dispatchEvent(new CustomEvent('shipping-settings-updated', { detail: { percentage: normalized } }));

    toast({
      title: 'Settings Updated',
      description: `Shipping and Insurance is now ${normalized}%`,
    });
  };

  const sampleSubtotal = 1000;
  const sampleShipping = Math.round((sampleSubtotal * shippingPercentage) / 100);

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-medium text-primary">Shipping and Insurance</h2>
        <p className="text-muted-foreground font-sans mt-1">
          Configure the shipping charge percentage applied at checkout.
        </p>
      </div>

      <div className="max-w-sm space-y-2">
        <Label htmlFor="shipping-insurance-percentage">Custom Percentage</Label>
        <div className="flex items-center gap-3">
          <Input
            id="shipping-insurance-percentage"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={shippingPercentage}
            onChange={(e) => setShippingPercentage(Number(e.target.value))}
            disabled={loading || saving}
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Example: For subtotal Rs{sampleSubtotal}, shipping is Rs{sampleShipping}.
        </p>
      </div>

      <Button onClick={handleSave} disabled={loading || saving}>
        {saving ? 'Saving...' : 'Save Shipping Settings'}
      </Button>
    </div>
  );
}
