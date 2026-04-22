import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, Linkedin, Twitter } from 'lucide-react';
import { GoodreadsBrandIcon, MediumBrandIcon } from '@/components/icons/BrandSocialIcons';
import { SiteLogo } from './SiteLogo';

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

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <SiteLogo imageClassName="h-12" />
            <div className="flex flex-wrap gap-3 mt-6">
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
                  <social.icon size={18} />
                </a>
              ))}
              <a
                href="mailto:studio@sarojprakashbandi.com"
                className="w-10 h-10 flex items-center justify-center text-[#5b4538] hover:text-[#7a5845] transition-colors duration-300"
                aria-label="Email"
                title="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-medium text-primary mb-4">Explore</h4>
            <ul className="space-y-3">
              {['Gallery', 'Paintings', 'Media', 'Blog'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-medium text-primary mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:contact@sarojprakashbandi.com" className="hover:text-primary transition-colors">
                  contact@sarojprakashbandi.com
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Get in Touch
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rasayan Studio. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground justify-center md:justify-end max-w-full">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/return-policy" className="hover:text-primary transition-colors">Return Policy</Link>
            <Link to="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link>
            <Link to="/refund-policy" className="hover:text-primary transition-colors">Refunds Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
