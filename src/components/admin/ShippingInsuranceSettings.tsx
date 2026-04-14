import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  DEFAULT_SHIPPING_INSURANCE_PERCENTAGE,
  DEFAULT_INTERNATIONAL_SHIPPING_PERCENTAGE,
  INTERNATIONAL_SHIPPING_STORAGE_KEY,
  SHIPPING_INSURANCE_STORAGE_KEY,
  normalizeShippingInsurancePercentage,
} from '@/data/shippingConfig';

const db = supabase as any;

export default function ShippingInsuranceSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [domesticPercentage, setDomesticPercentage] = useState<number>(DEFAULT_SHIPPING_INSURANCE_PERCENTAGE);
  const [internationalPercentage, setInternationalPercentage] = useState<number>(DEFAULT_INTERNATIONAL_SHIPPING_PERCENTAGE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);

      const localValue = localStorage.getItem(SHIPPING_INSURANCE_STORAGE_KEY);
      if (localValue !== null) {
        setDomesticPercentage(normalizeShippingInsurancePercentage(localValue));
      }

      const localInternationalValue = localStorage.getItem(INTERNATIONAL_SHIPPING_STORAGE_KEY);
      if (localInternationalValue !== null) {
        setInternationalPercentage(normalizeShippingInsurancePercentage(localInternationalValue));
      }

      const { data, error } = await db
        .from('app_settings')
        .select('shipping_insurance_percentage, international_shipping_percentage')
        .eq('id', 1)
        .maybeSingle();

      setLoading(false);

      if (error) {
        // Fallback for environments where international column is not added yet.
        const { data: legacyData, error: legacyError } = await db
          .from('app_settings')
          .select('shipping_insurance_percentage')
          .eq('id', 1)
          .maybeSingle();

        if (legacyError) {
          console.error('Failed to load shipping settings', legacyError);
          return;
        }

        const normalizedDomestic = normalizeShippingInsurancePercentage(legacyData?.shipping_insurance_percentage);
        setDomesticPercentage(normalizedDomestic);
        localStorage.setItem(SHIPPING_INSURANCE_STORAGE_KEY, String(normalizedDomestic));
        return;
      }

      const normalizedDomestic = normalizeShippingInsurancePercentage(data?.shipping_insurance_percentage);
      const normalizedInternational = normalizeShippingInsurancePercentage(data?.international_shipping_percentage);

      setDomesticPercentage(normalizedDomestic);
      setInternationalPercentage(normalizedInternational);
      localStorage.setItem(SHIPPING_INSURANCE_STORAGE_KEY, String(normalizedDomestic));
      localStorage.setItem(INTERNATIONAL_SHIPPING_STORAGE_KEY, String(normalizedInternational));
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    const normalizedDomestic = normalizeShippingInsurancePercentage(domesticPercentage);
    const normalizedInternational = normalizeShippingInsurancePercentage(internationalPercentage);

    const { error } = await db
      .from('app_settings')
      .upsert(
        {
          id: 1,
          shipping_insurance_percentage: normalizedDomestic,
          international_shipping_percentage: normalizedInternational,
          updated_by: user?.id ?? null,
        },
        { onConflict: 'id' }
      );

    if (error) {
      // Fallback for environments where international column is not added yet.
      const { error: legacyError } = await db
        .from('app_settings')
        .upsert(
          {
            id: 1,
            shipping_insurance_percentage: normalizedDomestic,
            updated_by: user?.id ?? null,
          },
          { onConflict: 'id' }
        );

      if (legacyError) {
        toast({
          title: 'Save Failed',
          description: legacyError.message || 'Unable to update shipping percentages',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }
    }

    setDomesticPercentage(normalizedDomestic);
    setInternationalPercentage(normalizedInternational);
    localStorage.setItem(SHIPPING_INSURANCE_STORAGE_KEY, String(normalizedDomestic));
    localStorage.setItem(INTERNATIONAL_SHIPPING_STORAGE_KEY, String(normalizedInternational));
    window.dispatchEvent(
      new CustomEvent('shipping-settings-updated', {
        detail: {
          domesticPercentage: normalizedDomestic,
          internationalPercentage: normalizedInternational,
        },
      })
    );

    toast({
      title: 'Settings Updated',
      description: `Domestic: ${normalizedDomestic}% | International: ${normalizedInternational}%`,
    });

    setSaving(false);
  };

  const sampleSubtotal = 1000;
  const sampleInternationalShipping = Math.round((sampleSubtotal * internationalPercentage) / 100);

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-medium text-primary">Shipping & Insurance</h2>
        <p className="text-muted-foreground font-sans mt-1">
          India addresses always get Rs 0 shipping and insurance at checkout. Addresses outside India pay the
          international percentage of the order subtotal. The domestic % is kept in settings for reference only.
        </p>
      </div>

      <div className="max-w-sm space-y-2">
        <Label htmlFor="domestic-shipping-percentage">India (domestic) %</Label>
        <div className="flex items-center gap-3">
          <Input
            id="domestic-shipping-percentage"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={domesticPercentage}
            onChange={(e) => setDomesticPercentage(Number(e.target.value))}
            disabled={loading || saving}
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Checkout always charges Rs 0 for India regardless of this value (legacy field).
        </p>
      </div>

      <div className="max-w-sm space-y-2">
        <Label htmlFor="international-shipping-percentage">Outside India (international) %</Label>
        <div className="flex items-center gap-3">
          <Input
            id="international-shipping-percentage"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={internationalPercentage}
            onChange={(e) => setInternationalPercentage(Number(e.target.value))}
            disabled={loading || saving}
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Example: For subtotal Rs{sampleSubtotal}, shipping outside India is Rs{sampleInternationalShipping}.
        </p>
      </div>

      <Button onClick={handleSave} disabled={loading || saving}>
        {saving ? 'Saving...' : 'Save Shipping & Insurance'}
      </Button>
    </div>
  );
}
