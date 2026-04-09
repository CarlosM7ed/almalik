"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, Search, Sparkles, BookOpen, User, TrendingUp, Clock, LogIn, HandCoins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";

const ANNOUNCEMENT_KEY = "alma-lik-announcement-dismissed";
const ANNOUNCEMENT_TEXT = "🎁 Envio Grátis em encomendas acima de €50 | Use o código ALMALIK10 para 10% de desconto";
const RECENT_SEARCHES_KEY = "alma-lik-recent-searches";
const TRENDING_TERMS = ["Oud", "Floral", "Perfume Masculino", "Perfume Feminino", "Amadeirado", "Kits"];

function getRecentSearchesFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(RECENT_SEARCHES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRecentSearchToStorage(term: string): void {
  try {
    const current = getRecentSearchesFromStorage().filter(
      (s) => s.toLowerCase() !== term.toLowerCase()
    );
    const updated = [term, ...current].slice(0, 5);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const isDismissed = localStorage.getItem(ANNOUNCEMENT_KEY);
      if (isDismissed === "true") {
        setDismissed(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(ANNOUNCEMENT_KEY, "true");
  };

  if (!mounted || dismissed) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden animate-banner-shimmer border-b border-gold/20"
        >
          <div className="py-2 px-4 relative">
            {/* Marquee for mobile */}
            <div className="overflow-hidden sm:hidden">
              <div
                className="flex whitespace-nowrap animate-marquee"
                style={{
                  animation: "marqueeScroll 25s linear infinite",
                }}
              >
                <span className="text-gold-light text-xs tracking-wide mr-8">
                  {ANNOUNCEMENT_TEXT}
                </span>
                <span className="text-gold-light text-xs tracking-wide mr-8">
                  {ANNOUNCEMENT_TEXT}
                </span>
              </div>
            </div>
            {/* Static for desktop */}
            <div className="hidden sm:flex items-center justify-center">
              <span className="text-gold-light text-xs tracking-wide text-center">
                {ANNOUNCEMENT_TEXT}
              </span>
            </div>
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gold/40 hover:text-gold transition-colors"
              aria-label="Fechar anúncio"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Navbar() {
  const { setCurrentPage, setIsCartOpen, cartCount, currentPage, isMobileMenuOpen, setIsMobileMenuOpen, setFilter, user, cartJustUpdated } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const recentInitRef = useRef(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load recent searches on mount
  useEffect(() => {
    if (!recentInitRef.current) {
      recentInitRef.current = true;
      const timer = setTimeout(() => {
        setRecentSearches(getRecentSearchesFromStorage());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-focus input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Close search on Escape key
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  const openSearch = useCallback(() => {
    setSearchQuery("");
    setRecentSearches(getRecentSearchesFromStorage());
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, []);

  // Global ⌘K / Ctrl+K shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isSearchOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, openSearch, closeSearch]);

  const handleSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    saveRecentSearchToStorage(trimmed);
    setFilter("search", trimmed);
    setCurrentPage("catalog");
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setFilter, setCurrentPage, setIsMobileMenuOpen]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = e.currentTarget.value.trim();
      if (value) {
        handleSearch(value);
      }
    }
  };

  const navLinks = [
    { label: "Home", page: "home" as const },
    { label: "Catálogo", page: "catalog" as const },
    { label: "Sommelier IA", page: "ai-sommelier" as const },
    { label: "Guia", page: "guide" as const },
    { label: "Minha Conta", page: "my-account" as const },
    { label: "Área do Parceiro", page: "affiliate" as const },
    ...(user?.role === "admin" ? [{ label: "Admin", page: "admin" as const }] : []),
  ];

  const handleNav = (page: string) => {
    setCurrentPage(page as "home" | "catalog" | "product" | "cart" | "checkout" | "ai-sommelier" | "admin" | "guide" | "my-account" | "affiliate");
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {currentPage !== 'admin' && <AnnouncementBanner />}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "navbar-scrolled"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <button onClick={() => handleNav("home")} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full border border-gold/50 flex items-center justify-center group-hover:border-gold transition-colors">
                <div className="w-3 h-3 rounded-full bg-gold/70" />
              </div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-gold-gradient">
                ALMA LIK
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.slice(0, 4).map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNav(link.page)}
                  className={`relative text-sm tracking-widest uppercase transition-colors py-1 ${
                    currentPage === link.page
                      ? "text-gold text-glow"
                      : "text-muted-foreground hover:text-gold"
                  }`}
                >
                  {link.label}
                  {currentPage === link.page && (
                    <>
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                      <motion.div
                        layoutId="navbar-dot"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    </>
                  )}
                </button>
              ))}
              {/* Search button between Guia and Minha Conta */}
              <button
                onClick={openSearch}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/15 text-muted-foreground hover:text-gold hover:border-gold/30 transition-all text-xs tracking-wide"
                aria-label="Pesquisar"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Pesquisar</span>
                <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-gold/40 border border-gold/10 bg-gold/5">
                  {typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'}K
                </kbd>
              </button>
              {navLinks.slice(4).map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNav(link.page)}
                  className={`relative text-sm tracking-widest uppercase transition-colors py-1 ${
                    currentPage === link.page
                      ? "text-gold text-glow"
                      : "text-muted-foreground hover:text-gold"
                  }`}
                >
                  {link.label}
                  {currentPage === link.page && (
                    <>
                      <motion.div
                        layoutId="navbar-indicator2"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                      <motion.div
                        layoutId="navbar-dot2"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    </>
                  )}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Search button for mobile/tablet */}
              <button
                onClick={openSearch}
                className="lg:hidden p-2 text-muted-foreground hover:text-gold transition-colors"
                aria-label="Pesquisar"
              >
                <Search className="w-5 h-5" />
              </button>
              {currentPage !== 'admin' && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-muted-foreground hover:text-gold transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount() > 0 && (
                    <motion.span
                      key={cartCount()}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: [0.5, 1.2, 1] }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`absolute -top-1 -right-1 bg-gradient-to-br from-gold to-gold-light text-noir text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full shadow-lg shadow-gold/30 ring-2 ring-noir ${cartJustUpdated ? 'animate-cart-badge-pulse' : ''}`}
                    >
                      {cartCount()}
                    </motion.span>
                  )}
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-muted-foreground hover:text-gold transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[65] bg-noir/95 backdrop-blur-xl"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeSearch();
            }}
          >
            <div className="max-w-4xl mx-auto px-6 pt-24">
              {/* Close button */}
              <button
                onClick={closeSearch}
                className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-gold transition-colors"
                aria-label="Fechar pesquisa"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Search input */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className="relative">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-gold/40" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="O que procura?"
                    className="w-full bg-transparent text-2xl sm:text-3xl font-serif text-foreground placeholder:text-muted-foreground/50 focus:outline-none border-b-2 border-gold/30 focus:border-gold pb-3 pl-9 transition-colors"
                  />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded-md text-xs font-mono text-gold/30 border border-gold/10 bg-gold/5">
                      ESC para fechar
                    </kbd>
                  </div>
                </div>
              </motion.div>

              {/* Recent searches */}
              <AnimatePresence>
                {recentSearches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="mt-10"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-gold/50" />
                      <h3 className="text-sm tracking-widest uppercase text-gold/60">Pesquisas recentes</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearch(term)}
                          className="px-4 py-2 rounded-full border border-gold/20 text-sm text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trending terms */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="mt-8 pb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-gold/50" />
                  <h3 className="text-sm tracking-widest uppercase text-gold/60">Tendências</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TRENDING_TERMS.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="px-4 py-3 rounded-lg border border-gold/10 text-sm text-muted-foreground hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all text-left"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Glass overlay with enhanced blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-noir/80 glass-luxury"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
              className="relative flex flex-col h-full pt-20"
            >
              {/* Gold gradient border-top separator */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="h-[2px] w-full flex-shrink-0 origin-left"
                style={{
                  background: "linear-gradient(90deg, #c9a96e, #e8d5a3, #c9a96e, transparent)",
                }}
              />

              <div className="flex-1 overflow-y-auto px-8 pt-8 pb-4 flex flex-col">
                {/* Search in mobile menu */}
                <motion.button
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setTimeout(() => openSearch(), 150);
                  }}
                  className="flex items-center gap-3 text-lg tracking-widest uppercase text-left text-muted-foreground hover:text-gold hover:bg-gold/10 rounded-lg px-4 py-3 -mx-4 transition-colors"
                >
                  <Search className="w-5 h-5" />
                  Pesquisar
                </motion.button>
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.page}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 300, damping: 30 }}
                    onClick={() => handleNav(link.page)}
                    className={`relative flex items-center text-lg tracking-widest uppercase text-left rounded-lg px-4 py-3 -mx-4 transition-all duration-300 ${
                      currentPage === link.page
                        ? "text-gold bg-gold/10 border-l-2 border-gold pl-6"
                        : "text-muted-foreground hover:text-gold hover:bg-gold/10"
                    }`}
                  >
                    {link.label}
                    {currentPage === link.page && (
                      <motion.div
                        layoutId="mobile-nav-active"
                        className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-gold via-gold-light to-gold rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Entrar (Sign In) button at bottom */}
              <div className="px-8 pb-8 pt-2">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="h-px w-full mb-4 origin-left"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(201, 169, 110, 0.3), transparent)",
                  }}
                />
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, type: "spring", stiffness: 300, damping: 25 }}
                  onClick={() => handleNav("my-account")}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gold/40 text-gold text-sm tracking-widest uppercase hover:bg-gold/10 hover:border-gold/60 transition-all duration-300 btn-premium-enhanced"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </motion.button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
