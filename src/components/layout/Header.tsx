import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, LogOut, Loader2, Search, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useCurrency, currencies } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SiteLogo } from './SiteLogo';

const accountIconClass =
  'w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]';

type AccountMenuProps = {
  trigger: ReactNode;
  align?: 'start' | 'end';
};

function AccountMenu({ trigger, align = 'end' }: AccountMenuProps) {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, roleResolved } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56 z-[60]">
        <DropdownMenuLabel className="truncate font-normal text-xs text-muted-foreground">
          {user?.email ?? 'Signed in'}
        </DropdownMenuLabel>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => navigate('/profile')}
        >
          <User className="mr-2 h-4 w-4" aria-hidden />
          Profile
        </DropdownMenuItem>
        {isAdmin && roleResolved && (
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => navigate('/admin')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden />
            Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onSelect={() => {
            void signOut();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
  const { session, loading: authLoading } = useAuth();
  const itemCount = getItemCount();
  const isLoggedIn = Boolean(session?.user);

  const goToAuth = () => {
    navigate('/auth', { state: { returnTo: `${location.pathname}${location.search}` } });
  };

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
          ? 'bg-[#c8b489]/95 backdrop-blur-sm shadow-soft py-3'
          : 'bg-[#c8b489] py-5'
      )}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex flex-col gap-3 lg:gap-0">
          <nav className="flex items-center justify-between gap-2 min-w-0">
          <SiteLogo imageClassName="h-10 w-auto sm:h-12 md:h-16 shrink-0" />

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
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Auth: profile only when logged in; guests see sign-in only */}
            {authLoading ? (
              <div
                className="p-1.5 sm:p-2 flex items-center justify-center text-primary/50"
                aria-busy="true"
                aria-label="Checking sign-in status"
              >
                <Loader2 className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] animate-spin" />
              </div>
            ) : isLoggedIn ? (
              <AccountMenu
                trigger={
                  <button
                    type="button"
                    className="p-1.5 sm:p-2 text-primary hover:text-accent transition-colors rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    aria-label="Account menu"
                    aria-haspopup="menu"
                  >
                    <User className={accountIconClass} strokeWidth={1.75} />
                  </button>
                }
              />
            ) : (
              <button
                type="button"
                onClick={goToAuth}
                className="p-1.5 sm:p-2 text-primary hover:text-accent transition-colors rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="Sign in"
              >
                <User className={accountIconClass} strokeWidth={1.75} />
              </button>
            )}

            {/* Currency Selector */}
            <select
              value={activeCurrency}
              onChange={(e) => setActiveCurrency(e.target.value)}
              className="bg-transparent text-primary max-w-[4.25rem] sm:max-w-none px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-sm text-xs sm:text-sm font-sans border border-border/50 focus:ring-2 focus:ring-accent focus:outline-none cursor-pointer hover:bg-background/20 transition-colors"
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
              className="relative p-1.5 sm:p-2 text-primary hover:text-accent transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-cream text-xs font-medium rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-primary hover:text-accent transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

          {/* Search: always visible below header row on phones & tablets */}
          <form
            onSubmit={handlePaintingsSearch}
            className="lg:hidden w-full min-w-0"
          >
            <label htmlFor="header-painting-search-bar" className="sr-only">
              Search paintings
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/65 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="header-painting-search-bar"
                type="search"
                enterKeyHint="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search paintings"
                className="w-full rounded-sm border border-primary/30 bg-cream/90 py-2 pl-9 pr-3 text-sm font-sans text-primary placeholder:text-primary/55 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/45"
              />
            </div>
          </form>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-500 ease-out',
            isMobileMenuOpen ? 'max-h-[min(32rem,calc(100dvh-7rem))] opacity-100 mt-4' : 'max-h-0 opacity-0'
          )}
        >
          <ul className="flex flex-col gap-1 sm:gap-4 py-4 border-t border-border overflow-y-auto overscroll-contain max-h-[min(28rem,calc(100dvh-8rem))]">
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
            {/* Mobile Auth */}
            <li className="border-t border-border pt-4 mt-2 space-y-1">
              {authLoading ? (
                <div className="flex items-center gap-2 py-2 text-muted-foreground font-sans text-sm" aria-busy="true">
                  <Loader2 size={18} className="animate-spin shrink-0" />
                  Checking sign-in…
                </div>
              ) : isLoggedIn ? (
                <AccountMenu
                  align="start"
                  trigger={
                    <button
                      type="button"
                      className="flex items-center gap-2 font-sans text-base py-2 text-muted-foreground hover:text-primary transition-colors w-full text-left rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      aria-label="Account menu"
                      aria-haspopup="menu"
                    >
                      <User size={18} strokeWidth={1.75} />
                      Account
                    </button>
                  }
                />
              ) : (
                <button
                  type="button"
                  onClick={goToAuth}
                  className="flex items-center gap-2 font-sans text-base py-2 text-muted-foreground hover:text-primary transition-colors w-full text-left rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <User size={18} strokeWidth={1.75} />
                  Sign in
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
