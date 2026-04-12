import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function RefundPolicyPage() {
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
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-primary mb-8">Refund Policy</h1>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Domestic</h2>
            
            <p className="text-muted-foreground leading-relaxed mb-4">
              Refund of artwork sold in the domestic market is possible only if the product delivered by Rasayan Studio is damaged. The buyer must report the damaged products within 48 hours of delivery and send us back the artwork within fifteen days from the invoice date, failing which the liability of Rasayan Studio ceases.
            </p>

            <h3 className="font-serif text-xl font-medium text-primary mb-3">Original Artwork</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All original artwork sold by us is checked by Rasayan Studio to ensure that it closely resembles the image on the Website. Therefore, we do not take returns. However, if the artwork reached the buyer damaged, we expect the buyer to:
            </p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2 mb-4">
              <li>Notify the courier company within 48 hours of delivery</li>
              <li>Immediately get in touch with us and send pictures of the damaged product</li>
              <li>If the original artwork is determined to have been damaged in transit, you will receive a full credit of the artwork cost paid by you including the shipping charges</li>
              <li>We will credit your account, from which the payment was made, within 10 days after approval of your refund request</li>
            </ol>

            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Important:</strong> Returns will be accepted for damaged products at the time of delivery. Please notify the courier company within 48 hours of delivery and immediately get in touch with us and send a picture of the damaged product. We will process your refund within 10 days after approval of your refund request.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-4">
              In the event of a disagreement, Rasayan Studio holds the right to make the final call on all returns. We will not be able to process any returns if it is not reported within the stipulated time period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">International</h2>
            
            <p className="text-muted-foreground leading-relaxed mb-4">
              As there are no refunds possible for international shipments, we suggest to intending buyers to clarify with us any point or doubt the buyer may have and fully satisfy themselves before making final payment.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-amber-800">
                <strong>Note:</strong> International orders are final sale and non-refundable. Please review artwork details carefully before purchase.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">How to Report Damage</h2>
            
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="text-muted-foreground">
                <strong>Step 1:</strong> Report to courier company within 48 hours of delivery
              </p>
              <p className="text-muted-foreground">
                <strong>Step 2:</strong> Contact us immediately with order number and photos
              </p>
              <p className="text-muted-foreground">
                <strong>Step 3:</strong> We will review and process your refund within 10 days of approval
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 mt-6">
              <p className="text-muted-foreground mb-2">
                <strong>Contact Us:</strong>
              </p>
              <p className="text-muted-foreground">
                Email: <a href="mailto:support@sarojprakashbandi.com" className="text-primary hover:text-accent">support@sarojprakashbandi.com</a>
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
