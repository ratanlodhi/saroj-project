import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  amount: number;
  currency?: string;
  name: string;
  description: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onError?: (error: string) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { toast } = useToast();

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      toast({
        title: 'Error',
        description: 'Failed to load payment gateway',
        variant: 'destructive',
      });
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount to avoid reloading
    };
  }, [toast]);

  const initiatePayment = useCallback(async (options: RazorpayOptions) => {
    if (!isScriptLoaded) {
      toast({
        title: 'Please wait',
        description: 'Payment gateway is loading...',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Validate user session before proceeding
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session || !session.user) {
        throw new Error('Please log in to complete your purchase');
      }

      // Refresh session if expired
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          throw new Error('Session expired, please log in again');
        }
        session = refreshData.session;
      }

      const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
      console.log('Using API/Anon Key:', apiKey ? apiKey.substring(0, 5) + '...' : 'undefined');
      console.log('Using access token:', session.access_token?.substring(0, 10) + '...');

      // Create order via edge function
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: options.amount,
          currency: options.currency || 'INR',
          receipt: `order_${Date.now()}`,
        },
      });

      if (error || !data) {
        let responseBody = '';
        if (error?.context) {
          try {
            responseBody = await error.context.text();
          } catch {
            responseBody = '';
          }
        }
        console.error('Edge Function error details:', {
          error,
          data,
          message: error?.message,
          context: error?.context,
          responseBody,
        });
        throw new Error(responseBody || error?.message || data?.error || 'Failed to create order');
      }

      const { orderId, keyId } = data;

      // Configure Razorpay checkout
      const razorpayOptions = {
        key: keyId,
        amount: Math.round(options.amount * 100),
        currency: options.currency || 'INR',
        name: options.name,
        description: options.description,
        order_id: orderId,
        handler: async function (response: any) {
          // Verify payment
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (verifyError || !verifyData?.verified) {
              throw new Error('Payment verification failed');
            }

            options.onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
          } catch (err: any) {
            options.onError?.(err.message || 'Payment verification failed');
          }
        },
        prefill: options.prefill || {},
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(razorpayOptions);
      rzp.on('payment.failed', function (response: any) {
        options.onError?.(response.error?.description || 'Payment failed');
        setIsLoading(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
      options.onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isScriptLoaded, toast]);

  return {
    initiatePayment,
    isLoading,
    isScriptLoaded,
  };
}
