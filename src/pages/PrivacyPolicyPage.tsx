import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-primary mb-8">Privacy Policy</h1>

          <p className="text-muted-foreground leading-relaxed mb-8">
            Rasayan Studio gives utmost importance to your privacy and therefore we are committed to respect and protect your privacy at all times. In order to ensure that you feel confident about providing us with your personal details on our website and while using our services, we demonstrate below our information gathering practices in relation to the website.
          </p>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Agreement to Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By visiting or using the website and domain name, any other Rasayan Studio-owned linked pages, features, content, and any other services we offer from time to time (collectively, the "Website"), you agree to the practices and policies set out in this Privacy Policy, and you hereby acknowledge and consent to our collection, use, and sharing of your information as described in this Privacy Policy. Capitalized terms that are not defined in this Privacy Policy have the meaning given to them in our <Link to="/terms-of-service" className="text-primary hover:text-accent">Terms and Conditions</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Information Collection and Usage</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Rasayan Studio collects information from users as they use the Website, with the sole intention of improving the user experience while browsing or otherwise transacting on the Website, by providing a more efficient, relevant and customized experience. Rasayan Studio is the sole owner of the information collected through our Website. We do not share, sell or rent this information to other parties unless indicated in this Privacy Policy.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-4">
              Rasayan Studio may contain links to other Websites, which may or may not be related to Rasayan Studio, and which may prescribe their own privacy policies and practices over which Rasayan Studio may or may not have any control. Hence, we advise user discretion in such access/usage/transaction. It is hereby expressly clarified that Rasayan Studio is not responsible for the privacy practices or the content of Websites that link to or from Rasayan Studio and we shall not be liable for any losses suffered by either the user or by any third party relating to any exchange of data shared over or during the course of such access/usage/transaction or for any other pecuniary or non-pecuniary loss whether quantifiable or unquantifiable suffered by either the user or any third party in relation to or arising out of such access/usage/transaction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Disclosure of Personal Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In general, you can visit our website without telling us who you are or revealing any personal information about yourself. We track the Internet address of the domains from which people visit us and analyze this data for trends and statistics, but we assure you that the individual user remains anonymous.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-4">
              Rasayan Studio does not disclose its user's personal information to any third parties other than to officers, employees, agents, consultants and affiliates. We use our best efforts to use users' information in aggregate form for the following purposes:
            </p>

            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>To build up marketing profiles</li>
              <li>To aid strategic development, data collection and business analytics</li>
              <li>To manage relationship with advertisers and partners</li>
              <li>To audit usage of Services</li>
              <li>To enhance user's experience in relation to provision of our services (collectively, "Permitted Use")</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Billing Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When the user makes any transaction on the Website, Rasayan Studio payment gateway provider may collect the user's personal information such as address or billing information, including credit/debit card number and expiration date etc. This information is stored by the payment gateway partner and such payment gateway partners are not controlled by Rasayan Studio. The User will visit such payment gateways at its own risk.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-4">
              Rasayan Studio may receive financial or transactional information (for e.g., transaction ID, order ID etc.) from third party vendors in case of payments, for reconciliation and validation of transactions and also for the purpose of resolutions of complaints (in case of failed transactions and refunds).
            </p>

            <p className="text-muted-foreground leading-relaxed mb-4">
              The Website is a general audience website, and it and its related sites, applications, services, and tools are not intended for children under the age of 18.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Sale of Assets</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Rasayan Studio may buy or sell assets, which may be literary and artistic works, including but not limited to, any production in the literary and artistic domain, whatever may be the mode or form of its expression including digital form, such as a book, pamphlet and other writing; a dramatic or musical adaptation of a dramatic work; a work of drawing, painting, architecture, sculpture, engraving or lithography; a photographic work to which are assimilated works expressed by a process analogous to photography; a work of applied art; an illustration, map, plan, sketch or three-dimensional work relative to geography, topography, architecture or science; a broadcast; a phonogram; a compilation of data to the extent it is protected as a copyrightable work.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-4">
              Should there ever arise a situation where Rasayan Studio may be forced to cease operation, then Rasayan Studio may decide to transfer all the information, data, assets collected by Rasayan Studio to another company which might amongst other things, be able to provide continuity of service for the users. If Rasayan Studio becomes a part of another company, organization, or entity through a merger, amalgamation, takeover, sale of assets, or other corporate acquisition or processes under law, thereby resulting in a change of control over the Websites and its content, the acquiring company, organization, or entity will obtain and have access to all the personal information collected by Rasayan Studio and it will assume the rights and obligations regarding the user's personal information as described in this Privacy Policy and may decide to amend the existing privacy policy agreement with respect to all the members.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Confidentiality and Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Except as otherwise provided in this Privacy Policy, Rasayan Studio will keep all personal information private and will not share it with third parties, unless Rasayan Studio believes, in good faith, that disclosure of such personal information or any other information Rasayan Studio collects about its users is necessary for Permitted Use or to:
            </p>

            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Comply with a court order or other legal process</li>
              <li>Protect the rights, property or safety of Rasayan Studio or another party</li>
              <li>Enforce the Agreement, including terms of the website</li>
              <li>Respond to claims in relation to violation of rights of third-parties by Rasayan Studio</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Amendments to Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Rasayan Studio reserves the right, at any time, to add, change, update, or modify this Privacy Policy and therefore users are requested to review this Privacy Policy frequently. If any change has been incorporated in this Privacy Policy by Rasayan Studio, then such change will be posted by Rasayan Studio on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Complaints</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The users can write to Rasayan Studio in case of any grievance or complaint at the support email address. If the users have any complaints regarding processing of their personal information, the user may contact us at the mentioned email address.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Restriction of Liability</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              No warranty of any kind, implied, expressed or statutory, including but not limited to the warranties of non-infringement of third-party rights, title, merchantability, fitness for a particular purpose and freedom from computer virus, is given with respect to the services provided by Rasayan Studio including provision of Website. Any reference on the Website to any specific commercial products, processes, or services, or the use of any trade, firm or corporation name is for the information and convenience of the public, and does not constitute endorsement, recommendation, or favouring by Rasayan Studio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-medium text-primary mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-card border border-border rounded-lg p-4">
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
