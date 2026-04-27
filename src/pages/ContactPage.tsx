import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, MapPin, Instagram, Facebook, Youtube, Linkedin, Twitter } from 'lucide-react';
import { GoodreadsBrandIcon, MediumBrandIcon } from '@/components/icons/BrandSocialIcons';

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
                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 text-[#5b4538]">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-sans font-medium text-primary">Email</h3>
                    <a
                      href="mailto:contact@sarojprakashbandi.com"
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      contact@sarojprakashbandi.com
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
