import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>

        <article className="prose prose-sm max-w-none">
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-primary mb-8">Terms of Service</h1>

          <p className="text-muted-foreground leading-relaxed mb-8">
            These terms and conditions are applicable to the sale of all kinds of artwork offered through Rasayan Studio from the website.
          </p>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Definition</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>"Buyer"</strong> shall mean a user who accesses the Website and buys a painting/Work of Art from the Website.</li>
              <li><strong>"Description"</strong> means all the details of an artwork as set out in the Website and may include, without limitation, the name of the artist, designer or manufacturer, the title of the painting, and the following additional details:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>For artworks: the signature of the artist/date (if any), the surface, medium and dimensions, year and any additional information related to the painting.</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">General Terms</h2>
            
            <h3 className="font-medium text-primary mb-2">Pricing & Payment</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All work of arts made available for sale on the Website will be sold at the price as listed on the Website. The price of the product listed does not include duties, taxes, shipping and handling, which could be charged as applicable and would depend on the shipping address provided by the Buyer. The information provided during registration or amended at the time of finalizing a purchase shall be the final billing address and shipping address for delivery of the product.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-4">
              The Buyer agrees that the Buyer is liable for any duties and taxes that might be applicable on the purchase as above and such charges shall be payable in addition to the price of the product and Rasayan Studio will not be responsible for any such charges.
            </p>

            <h3 className="font-medium text-primary mb-2">Invoices</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All invoices will be raised by Rasayan Studio based on the information provided by the Buyer or amended at the time of finalizing a purchase.
            </p>

            <h3 className="font-medium text-primary mb-2">Order Acceptance & Cancellation</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Placing an order on website constitutes an irrevocable acceptance of the purchase of the product. Unless rescinded/cancelled by Rasayan Studio within 7 working days on account of a default by the artist or any prior or continuing breach by the Buyer, such acceptance results in an enforceable contract of sale. Rasayan Studio shall have the right to cancel any order placed on the website at any time prior to the delivery of the product, without assigning any reason whatsoever.
            </p>

            <h3 className="font-medium text-primary mb-2">Product Accuracy</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Rasayan Studio may not always be in physical possession of the product made available for sale on the Website and may be physically located anywhere in the world. Rasayan Studio shall assume no responsibility for any errors or omissions that may occur in the description, pricing or other content related to the product. In the event of such an error, Rasayan Studio reserves the right to cancel the order placed by the Buyer by informing the Buyer in writing.
            </p>

            <h3 className="font-medium text-primary mb-2">Payment Requirements</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Once an order is placed on the Website, the Buyer is required to immediately make payment for the price of the Work of Art as well as the charges referred to above unless a prior arrangement is agreed to between the Buyer and Rasayan Studio. The Work of Art will be dispatched by Rasayan Studio upon receipt of full payment from the Buyer. In the event the payment is not made within the prescribed time limit, Rasayan Studio reserves the right to cancel the order without prior notice to the Buyer.
            </p>

            <h3 className="font-medium text-primary mb-2">Delivery</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The product will be delivered/shipped to the Buyer once all necessary documentation, relating to transportation, tax, etc. as may be reasonably requested for by Rasayan Studio are completed and payment has been realized in full including any additional charges. Transit insurance costs will be included in such additional charges, unless specifically advised otherwise by the Buyer.
            </p>

            <h3 className="font-medium text-primary mb-2">Buyer Obligations</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Buyer agrees to abide by all provisions prescribed in these terms and conditions. In particular, the Buyer warrants that all information that is submitted will be true and accurate (including without limitation the credit card number and expiration date), and the Buyer agrees to pay all costs, charges plus all applicable taxes for the purchases made.
            </p>

            <h3 className="font-medium text-primary mb-2">Certificates of Authentication</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All paintings/Work of Arts displayed on the Website are supported by a Certificate of Authentication from the artist.
            </p>

            <h3 className="font-medium text-primary mb-2">Registration Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Buyer warrants that all the information furnished at the time of registration is true and correct and any change in the information provided will be updated and intimated to Rasayan Studio immediately. Rasayan Studio is entitled to act on the basis of the information provided and seek such further information, clarifications or verifications as it may deem necessary for granting registration. Such registration may be suspended or cancelled if Rasayan Studio is of the view that any of the above information may be inaccurate.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Please refer to the terms of our <Link to="/privacy-policy" className="text-primary hover:text-accent">Privacy Policy</Link>, which together with these terms and conditions govern your use of the website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Return & Refund Policies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For detailed information regarding returns and refunds, please refer to our <Link to="/return-policy" className="text-primary hover:text-accent">Return Policy</Link> and <Link to="/refund-policy" className="text-primary hover:text-accent">Refund Policy</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Shipping Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For detailed information regarding shipping, delivery times, and shipping conditions, please refer to our <Link to="/shipping-policy" className="text-primary hover:text-accent">Shipping Policy</Link>.
            </p>
          </section>

          <div className="bg-card border border-border rounded-lg p-6 my-8">
            <h3 className="font-serif text-lg font-medium text-primary mb-3">Contact Us</h3>
            <p className="text-muted-foreground mb-2">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: <a href="mailto:support@sarojprakashbandi.com" className="text-primary hover:text-accent">support@sarojprakashbandi.com</a>
            </p>
          </div>

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
