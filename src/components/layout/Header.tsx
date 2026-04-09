import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, LogIn, LogOut, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useCurrency, currencies } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/useAuth';
import { SiteLogo } from './SiteLogo';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/paintings', label: 'Paintings' },
  { href: '/media', label: 'Media' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemCount, setIsCartOpen } = useCart();
  const { activeCurrency, setActiveCurrency } = useCurrency();
  const { user, signOut } = useAuth();
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handlePaintingsSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      navigate('/paintings');
      return;
    }

    navigate(`/paintings?search=${encodeURIComponent(query)}`);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-[#bba472]/95 backdrop-blur-sm shadow-soft py-3'
          : 'bg-[#bba472] py-5'
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <SiteLogo imageClassName="h-14 md:h-16" />

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={cn(
                    'relative font-sans text-sm tracking-wide transition-colors duration-300',
                    'after:content-[""] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-px',
                    'after:bg-accent after:scale-x-0 after:origin-right after:transition-transform after:duration-300',
                    'hover:after:scale-x-100 hover:after:origin-left',
                    location.pathname === link.href
                      ? 'text-primary after:scale-x-100'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <form onSubmit={handlePaintingsSearch} className="flex items-center gap-2">
                <label htmlFor="header-painting-search" className="sr-only">
                  Search paintings
                </label>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/65"
                    aria-hidden="true"
                  />
                  <input
                    id="header-painting-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search paintings"
                    className="w-44 rounded-sm border border-primary/30 bg-cream/90 py-1.5 pl-9 pr-2 text-sm font-sans text-primary placeholder:text-primary/55 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/45"
                  />
                </div>
              </form>
            </li>
          </ul>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Auth Buttons */}
            {user ? (
              <button
                onClick={signOut}
                className="p-2 text-primary hover:text-accent transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={22} />
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="p-2 text-primary hover:text-accent transition-colors"
                aria-label="Sign in"
              >
                <LogIn size={22} />
              </button>
            )}

            {/* Currency Selector */}
            <select
              value={activeCurrency}
              onChange={(e) => setActiveCurrency(e.target.value)}
              className="bg-transparent text-primary px-2 py-1.5 rounded-sm text-sm font-sans border border-border/50 focus:ring-2 focus:ring-accent focus:outline-none cursor-pointer hover:bg-background/20 transition-colors"
              aria-label="Select currency"
            >
              {currencies.map((currency) => (
                <option key={currency.id} value={currency.id} className="bg-card text-foreground">
                  {currency.symbol}
                </option>
              ))}
            </select>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-primary hover:text-accent transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-cream text-xs font-medium rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-primary hover:text-accent transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-500 ease-out',
            isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          )}
        >
          <ul className="flex flex-col gap-4 py-4 border-t border-border">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={cn(
                    'block font-sans text-base py-2 transition-colors',
                    location.pathname === link.href
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {/* Mobile Auth Button */}
            <li className="border-t border-border pt-4 mt-2">
              {user ? (
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 font-sans text-base py-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2 font-sans text-base py-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <LogIn size={18} />
                  Sign In
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
