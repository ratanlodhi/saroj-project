import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, Linkedin, Twitter, BookOpen } from 'lucide-react';

const MediumIcon = ({ size = 18, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M2.846 6.99A.6.6 0 0 0 2.7 6.463L1.614 5.155V5h3.369l2.603 5.708L9.873 5H13.1v.155l-.927.889a.28.28 0 0 0-.106.269V17.69a.28.28 0 0 0 .106.269l.905.889V19h-4.55v-.155l.938-.911c.092-.092.092-.119.092-.269V8.47l-2.608 6.52h-.352L3.56 8.47v7.729a.62.62 0 0 0 .169.535l1.219 1.478V18.367h-3.46v-.155l1.219-1.478a.594.594 0 0 0 .161-.535V6.99z" />
    <path d="M14.326 8.637l3.812-1.937v10.533l-3.812 1.937V8.637z" />
    <path d="M22.386 6.021L19.343 4.5a.765.765 0 0 0-.735.028l-3.561 1.809 3.967 2.015 3.372-1.698z" />
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
    icon: MediumIcon,
  },
  {
    href: 'https://www.goodreads.com/sarojprakashbandi',
    label: 'Goodreads',
    icon: BookOpen,
  },
];

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-serif text-2xl font-medium text-primary">
              Rasayan Studio
            </Link>
            <p className="mt-4 text-muted-foreground font-sans text-sm leading-relaxed max-w-md">
              Exploring the depths of human emotion through art. Each painting is a journey, 
              each brushstroke a whisper of the soul.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  aria-label={social.label}
                  title={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
              <a
                href="mailto:hello@rasayanart.com"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
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
                <a href="mailto:hello@rasayanart.com" className="hover:text-primary transition-colors">
                  hello@rasayanart.com
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About the Studio
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Get in Touch
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rasayan Art Studio. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
