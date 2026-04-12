import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>

        <article className="prose prose-sm max-w-none">
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-primary mb-8">Shipping Policy</h1>

          <p className="text-muted-foreground leading-relaxed mb-8">
            At Rasayan Studio, we aim to provide timely and reliable shipping services to our customers. Please review our shipping policy below to understand how we handle and dispatch orders, as well as the applicable shipping charges and delivery times.
          </p>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">1. Free Shipping Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We offer free shipping on all orders, applicable only for products shipped in roll form.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">2. Order Dispatch</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Dispatch Timeline:</strong> All orders are dispatched within 5 days of order confirmation.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You will receive a notification with tracking information once your order has been shipped.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">3. Delivery Time</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We aim to deliver orders promptly. Delivery times depend on the location:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>Tier 1 and Tier 2 Cities:</strong> Delivery will take between 3 to 5 days from the date of dispatch.</li>
              <li><strong>Remote Areas:</strong> Delivery may take up to 12 days depending on logistical constraints.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Please note that delivery timelines are approximate and may be subject to delays due to unforeseen circumstances, including holidays or local disruptions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">4. Shipping Conditions</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Free shipping is only applicable for roll form shipments.</li>
              <li>Other forms or packaging will incur additional shipping fees.</li>
              <li>Shipping charges, if applicable, will be calculated at checkout based on the delivery location and packaging type.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">5. Jurisdiction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All shipping terms, conditions of sale, and guarantees, as well as the rights and obligations of the buyer and seller, are governed by and construed in accordance with the laws and jurisdiction of the High Court of Maharashtra.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By placing an order on our website, you agree to comply with the shipping policy and terms outlined above.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">6. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions or concerns about your order or the shipping process, please contact us:
            </p>
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <p className="text-muted-foreground">
                Email: <a href="mailto:art@sarojprakashbandi.com" className="text-primary hover:text-accent">art@sarojprakashbandi.com</a>
              </p>
              <p className="text-muted-foreground">
                WhatsApp: <a href="https://wa.me/919492710600" className="text-primary hover:text-accent">9492710600</a>
              </p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
