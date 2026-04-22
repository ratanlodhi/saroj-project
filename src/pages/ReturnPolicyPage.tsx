import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ReturnPolicyPage() {
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
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-primary mb-8">Return Policy</h1>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Customers in the US</h2>
            
            <h3 className="font-serif text-xl font-medium text-primary mb-3">Free 14-Day Returns</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Free returns are valid for purchases made on or after September 16th, 2025 and shipped to addresses within the United States.
            </p>

            <h4 className="font-medium text-primary mb-3">Exclusions:</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Final sale items are not eligible for free returns. This includes Special Collection, Photography, Artist Produced Limited Edition and Open Edition artworks and any other products designated as final sale on the website.</li>
              <li>Oversized artworks are not eligible for free returns. This includes any oversize product where the longest length is greater than 60 incheses (152 cm) or items requiring special shipping and handling. Note: Oversized artworks are still eligible for the 14-day satisfaction guarantee. Please contact us at <a href="mailto:sarojbandi31@gmail.com" className="text-primary hover:text-accent">sarojbandi31@gmail.com</a> if you have any questions or concerns.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Customers Outside of the US</h2>
            
            <h3 className="font-serif text-xl font-medium text-primary mb-3">14-Day Satisfaction Guarantee</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Change your mind after receiving an original artwork? You have 14 days from the date you received it to let us know. You may choose from:
            </p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2 mb-4">
              <li>Store credit for the full purchase price, or</li>
              <li>A refund to your original payment method less a 20% processing fee calculated off the total purchase amount.</li>
            </ol>

            <p className="text-muted-foreground leading-relaxed mb-4">
              If you would like help finding a replacement artwork, we are happy to pair you with a complimentary art advisor to help you find the perfect piece.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-4">
              If the original artwork arrived damaged, or was misrepresented, you can return it for a full refund to your original payment method within 14 days of receiving it.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-4">
              All return shipments must be arranged through Rasayan Studio and shipped in their original packaging (including all accompanying certificates received with the order).
            </p>

            <p className="text-muted-foreground leading-relaxed mb-4">
              All refunds will be subject to the exchange rate at the time of processing, and funds will be remitted in INR.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Please note:</strong> Special commissions, limited and open editions prints, and frames are all final sale. Returns will not be accepted for any artwork that has been stretched, cropped, or altered in any capacity after purchase. No refunds will be granted after the 14-day period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">What "Satisfaction" Means at Rasayan Studio</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We want to make sure you find artwork you love! If you change your mind within 14 days after receiving the work, you can choose from a full refund via store credit, or a refund to your original payment method minus a 20% processing fee. We are happy to work with you to find a replacement. Our team of expert art advisors will work with you one-on-one if needed. We pride ourselves on being a leading online art gallery, and are confident we will find the perfect artwork for you among our selection of carefully curated artworks by artists.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Final Sale Items</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Special Collection, Photography, Artist Produced Limited Edition and Open Edition artworks, print frames, and eGift Cards are FINAL SALE and are not eligible for returns. Please fill out a return request form if your order arrived damaged or in poor condition.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">How to Request a Return</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To initiate a return, please contact us with your order number and reason for return. Our team will review your request and provide you with further instructions.
            </p>
            <div className="bg-card border border-border rounded-lg p-4 mt-4">
              <p className="text-muted-foreground">
                Email: <a href="mailto:sarojbandi31@gmail.com" className="text-primary hover:text-accent">sarojbandi31@gmail.com</a>
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
