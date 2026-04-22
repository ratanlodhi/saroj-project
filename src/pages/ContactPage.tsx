import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, MapPin, Instagram, Facebook, Youtube, Linkedin, Twitter } from 'lucide-react';
import { GoodreadsBrandIcon, MediumBrandIcon } from '@/components/icons/BrandSocialIcons';

const WhatsAppIcon = ({ size = 20, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M20.52 3.48A11.8 11.8 0 0 0 12.13 0C5.62 0 .3 5.31.3 11.82c0 2.08.54 4.12 1.56 5.93L0 24l6.44-1.84a11.8 11.8 0 0 0 5.69 1.45h.01c6.51 0 11.82-5.31 11.82-11.82 0-3.16-1.23-6.12-3.44-8.31Zm-8.39 18.14h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.82 1.09 1.1-3.72-.24-.38a9.83 9.83 0 0 1-1.5-5.21c0-5.43 4.43-9.85 9.87-9.85a9.78 9.78 0 0 1 6.98 2.89 9.8 9.8 0 0 1 2.89 6.99c0 5.43-4.43 9.86-9.9 9.86Zm5.41-7.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.46-.88-.79-1.48-1.77-1.65-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.23-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.23 5.12 4.53.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.57-.08 1.76-.72 2.01-1.42.25-.69.25-1.28.17-1.42-.07-.13-.27-.2-.57-.35Z" />
  </svg>
);

const socialLinks = [
  {
    href: 'https://www.instagram.com/_saroj_b?igsh=Y3FzdTB4bnV2Njls',
    label: 'Instagram',
    icon: Instagram,
  },
  {
    href: 'https://www.facebook.com/share/17f1oftFyL/',
    label: 'Facebook',
    icon: Facebook,
  },
  {
    href: 'https://youtube.com/@sb-wo7xn?si=JhVQpHvwQJpWGfN-',
    label: 'YouTube',
    icon: Youtube,
  },
  {
    href: 'https://www.linkedin.com/in/saroj-prakash-bandi-4ba727392',
    label: 'LinkedIn',
    icon: Linkedin,
  },
  {
    href: 'https://x.com/_saroj_b',
    label: 'Twitter',
    icon: Twitter,
  },
  {
    href: 'https://sarojprakashbandi.medium.com',
    label: 'Medium',
    icon: MediumBrandIcon,
  },
  {
    href: 'https://www.goodreads.com/sarojprakashbandi',
    label: 'Goodreads',
    icon: GoodreadsBrandIcon,
  },
];

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Message sent!',
      description: "Thank you for reaching out. We'll get back to you soon.",
    });

    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const whatsappNumber = '919960195771';
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      {/* <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Get in Touch</span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-primary mt-4">
            Contact
          </h1>
          <p className="text-muted-foreground font-sans mt-4 max-w-xl mx-auto">
            Have a question about the work? We'd love to hear from you.
          </p>
          <div className="section-divider mt-8" />
        </div>
      </section> */}

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Form */}
            <div className="animate-fade-up">
              <h2 className="font-serif text-2xl font-medium text-primary mb-6">
                Send a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-sans text-primary mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground font-sans placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-sans text-primary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground font-sans placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-sans text-primary mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground font-sans placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about your inquiry..."
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="animate-fade-up stagger-2">
              <h2 className="font-serif text-2xl font-medium text-primary mb-6">
                Studio Information
              </h2>

              <div className="space-y-8">
                {/* WhatsApp */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 p-4 rounded-sm border border-border/40 hover:border-[#5b4538]/40 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 text-[#5b4538]">
                    <WhatsAppIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-sans font-medium text-primary group-hover:text-[#5b4538] transition-colors">
                      Chat on WhatsApp
                    </h3>
                    <p className="text-muted-foreground">
                      +91 99601 95771
                    </p>
                  </div>
                </a>

                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 text-[#5b4538]">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-sans font-medium text-primary">Email</h3>
                    <a
                      href="mailto:studio@sarojprakashbandi.com"
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      studio@sarojprakashbandi.com
                    </a>
                  </div>
                </div>

                <div className="section-divider !mx-0 !w-full" />

                <div>
                  <h3 className="font-sans font-medium text-primary mb-4">Follow Us</h3>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center text-[#5b4538] hover:text-[#7a5845] transition-colors duration-300"
                        aria-label={social.label}
                        title={social.label}
                      >
                        <social.icon size={20} />
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
