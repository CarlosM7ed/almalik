"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown, RotateCcw, LayoutGrid, LayoutList, Sparkles, ShoppingBag, FilterX, SearchX, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/ProductCard";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  gender: string;
  olfactiveFamily: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  imageUrl: string;
  category: string;
  fixation: string;
  intensity: string;
}

const familyImages: Record<string, string> = {
  oriental: "/images/perfumes/amber-perfume.png",
  floral: "/images/perfumes/pink-perfume.png",
  amadeirado: "/images/perfumes/dark-perfume.png",
  "fougère": "/images/perfumes/blue-perfume.png",
  "cítrico": "/images/perfumes/blue-perfume.png",
  gourmet: "/images/perfumes/golden-perfume.png",
  aquático: "/images/perfumes/blue-perfume.png",
  especiado: "/images/perfumes/amber-perfume.png",
};

const filterOptions = {
  gender: ["Todos", "Masculino", "Feminino", "Unissex"],
  intensity: ["Todos", "Leve", "Moderada", "Intensa", "Muito intensa"],
  occasion: ["Todos", "Noite", "Dia a Dia", "Festa", "Verão", "Presente", "Trabalho", "Casamento", "Versátil"],
  olfactiveFamily: ["Todos", "Oriental", "Floral", "Amadeirado", "Fougère", "Cítrico", "Gourmet", "Aquático", "Especiado"],
  fixation: ["Todos", "2-4 horas", "4-6 horas", "6-8 horas", "8+ horas"],
};

const sortOptions = [
  { value: "sortOrder", label: "Destaque" },
  { value: "price_asc", label: "Menor Preço" },
  { value: "price_desc", label: "Maior Preço" },
  { value: "name", label: "A-Z" },
  { value: "name-desc", label: "Z-A" },
  { value: "newest", label: "Melhor Avaliação" },
];

export function CatalogPage() {
  const { filters, setFilter, resetFilters, setSelectedProductSlug, setCurrentPage, addToCart, recentlyViewed } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [catalogRecentlyViewed, setCatalogRecentlyViewed] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      try { return (localStorage.getItem("alma-lik-catalog-view") as "grid" | "list") || "grid"; }
      catch { return "grid"; }
    }
    return "grid";
  });

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    try { localStorage.setItem("alma-lik-catalog-view", mode); } catch { /* ignore */ }
  };

  // Search suggestions
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    if (filters.search.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(filters.search)}&limit=5`);
        const data = await res.json();
        setSearchSuggestions(data.products || []);
        setShowSuggestions(true);
      } catch {
        setSearchSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setShowSuggestions(false);
    setFilter("search", "");
    setSelectedProductSlug(product.slug);
    setCurrentPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.gender && filters.gender !== "all" && filters.gender !== "todos") params.set("gender", filters.gender);
    if (filters.intensity && filters.intensity !== "all" && filters.intensity !== "todos") params.set("intensity", filters.intensity);
    if (filters.occasion && filters.occasion !== "all" && filters.occasion !== "todos") params.set("occasion", filters.occasion);
    if (filters.olfactiveFamily && filters.olfactiveFamily !== "all" && filters.olfactiveFamily !== "todos") params.set("olfactiveFamily", filters.olfactiveFamily);
    if (filters.fixation && filters.fixation !== "all" && filters.fixation !== "todos") params.set("fixation", filters.fixation);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.category === "kits") params.set("isKit", "true");
    if (filters.category === "bestsellers") params.set("isBestseller", "true");
    params.set("limit", "100");
    return params.toString();
  }, [filters]);

  // Fetch total count once on mount
  useEffect(() => {
    async function fetchAllCount() {
      try {
        const res = await fetch('/api/products?limit=1');
        const data = await res.json();
        setAllTotal(data.total || 0);
      } catch {
        // ignore
      }
    }
    fetchAllCount();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const query = buildQuery();
        const res = await fetch(`/api/products?${query}`);
        const data = await res.json();
        setProducts(data.products || []);
        setTotal(data.total || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [buildQuery]);

  // Fetch recently viewed products for catalog
  useEffect(() => {
    async function fetchRecentlyViewed() {
      if (recentlyViewed.length === 0) {
        setCatalogRecentlyViewed([]);
        return;
      }
      try {
        const promises = recentlyViewed.slice(0, 6).map(async (slug) => {
          const res = await fetch(`/api/products/${slug}`);
          if (!res.ok) return null;
          const data = await res.json();
          return data.product;
        });
        const results = await Promise.all(promises);
        setCatalogRecentlyViewed(results.filter(Boolean) as Product[]);
      } catch {
        setCatalogRecentlyViewed([]);
      }
    }
    fetchRecentlyViewed();
  }, [recentlyViewed]);

  // Mobile quick-filter bar
  const quickFilterItems = [
    { label: "Todos", value: "all" },
    { label: "Masculino", value: "masculino" },
    { label: "Feminino", value: "feminino" },
    { label: "Unissex", value: "unissex" },
    { label: "Kits", value: "kits" },
    { label: "Bestsellers", value: "bestsellers" },
  ];

  const getActiveQuickFilter = () => {
    if (filters.category === "kits") return "kits";
    if (filters.category === "bestsellers") return "bestsellers";
    if (filters.gender === "masculino") return "masculino";
    if (filters.gender === "feminino") return "feminino";
    if (filters.gender === "unissex") return "unissex";
    return "all";
  };
  const activeQuickFilter = getActiveQuickFilter();

  const handleQuickFilter = (value: string) => {
    if (value === "all") {
      setFilter("gender", "all");
      setFilter("category", "all");
    } else if (value === "kits" || value === "bestsellers") {
      setFilter("category", value);
      setFilter("gender", "all");
    } else {
      setFilter("gender", value);
      setFilter("category", "all");
    }
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, val]) => val && val !== "all" && val !== "" && key !== "sort" && key !== "search"
  ).length;

  // Build active filter chips with proper labels
  const getActiveFilterChips = () => {
    const chips: { key: string; label: string }[] = [];

    // Gender
    if (filters.gender && filters.gender !== "all" && filters.gender !== "todos") {
      chips.push({ key: "gender", label: filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1) });
    }
    // Olfactive Family
    if (filters.olfactiveFamily && filters.olfactiveFamily !== "all" && filters.olfactiveFamily !== "todos") {
      chips.push({ key: "olfactiveFamily", label: filters.olfactiveFamily.charAt(0).toUpperCase() + filters.olfactiveFamily.slice(1) });
    }
    // Intensity
    if (filters.intensity && filters.intensity !== "all" && filters.intensity !== "todos") {
      chips.push({ key: "intensity", label: filters.intensity.charAt(0).toUpperCase() + filters.intensity.slice(1) });
    }
    // Occasion
    if (filters.occasion && filters.occasion !== "all" && filters.occasion !== "todos") {
      chips.push({ key: "occasion", label: filters.occasion.charAt(0).toUpperCase() + filters.occasion.slice(1) });
    }
    // Fixation
    if (filters.fixation && filters.fixation !== "all" && filters.fixation !== "todos") {
      chips.push({ key: "fixation", label: filters.fixation });
    }
    // Price range
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? `€${filters.minPrice}` : "€0";
      const max = filters.maxPrice ? `€${filters.maxPrice}` : "∞";
      chips.push({ key: "priceRange", label: `${min} - ${max}` });
    }
    // Category (kits/bestsellers)
    if (filters.category && filters.category !== "all") {
      const catLabels: Record<string, string> = { kits: "Kits", bestsellers: "Bestsellers" };
      chips.push({ key: "category", label: catLabels[filters.category] || filters.category });
    }

    return chips;
  };

  const activeFilterChips = getActiveFilterChips();

  // Build search description for results count
  const getFilterDescription = () => {
    const parts: string[] = [];
    if (filters.olfactiveFamily && filters.olfactiveFamily !== "all") {
      parts.push(filters.olfactiveFamily.charAt(0).toUpperCase() + filters.olfactiveFamily.slice(1));
    }
    if (filters.gender && filters.gender !== "all") {
      parts.push(filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1));
    }
    if (filters.intensity && filters.intensity !== "all") {
      parts.push(filters.intensity.charAt(0).toUpperCase() + filters.intensity.slice(1));
    }
    if (filters.search) {
      parts.push(`"${filters.search}"`);
    }
    return parts.join(" ");
  };

  const filterDescription = getFilterDescription();

  const clearFilter = (key: string) => {
    if (key === "priceRange") {
      setFilter("minPrice", "");
      setFilter("maxPrice", "");
    } else {
      setFilter(key as keyof typeof filters, "all");
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} adicionado à sacola`, {
      description: "Clique na sacola para ver seus itens",
    });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProductSlug(product.slug);
    setCurrentPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary/20 border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase">Coleção Completa</p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-gradient">Catálogo</h1>
            {/* Subtitle with dynamic count */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              {!loading && allTotal > 0 && (
                <>
                  Explore nossa seleção de{" "}
                  <span className="text-gold font-medium">{allTotal} fragrâncias exclusivas</span>{" "}
                  de alto padrão.
                </>
              )}
              {(loading || allTotal === 0) && (
                <>Explore nossa seleção curada de fragrâncias exclusivas de alto padrão.</>
              )}
            </motion.p>
            {/* Decorative gold line */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/40" />
              <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/40" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recently Viewed Section */}
        {catalogRecentlyViewed.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gold" />
                <h3 className="text-sm font-semibold tracking-widest uppercase text-gold-light">Vistos Recentemente</h3>
              </div>
              <span className="text-xs text-muted-foreground">{catalogRecentlyViewed.length} {catalogRecentlyViewed.length === 1 ? 'fragrância' : 'fragrâncias'}</span>
            </div>
            <div className="relative group/rv">
              <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent scroll-smooth">
                {catalogRecentlyViewed.map((rvProduct) => (
                  <motion.div
                    key={rvProduct.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-shrink-0 w-48 sm:w-56"
                  >
                    <motion.button
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedProductSlug(rvProduct.slug);
                        setCurrentPage("product");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="block w-full text-left"
                    >
                      <div className="relative rounded-lg overflow-hidden border border-gold/10 hover:border-gold/30 transition-all group">
                        <div className="aspect-[3/4] relative bg-gradient-to-br bg-secondary/20 overflow-hidden">
                          <img
                            src={rvProduct.imageUrl || familyImages[rvProduct.olfactiveFamily] || "/images/perfumes/golden-perfume.png"}
                            alt={rvProduct.name}
                            className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-transparent" />
                          {rvProduct.isNew && (
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-gold text-noir text-[8px] font-bold uppercase tracking-wider rounded-sm">Novo</span>
                          )}
                        </div>
                        <div className="p-3 bg-noir/80">
                          <p className="text-[10px] uppercase tracking-widest text-gold/70 truncate">{rvProduct.olfactiveFamily}</p>
                          <p className="text-sm font-medium text-foreground truncate mt-0.5 group-hover:text-gold transition-colors">{rvProduct.name}</p>
                          <p className="text-sm font-bold text-gold mt-1">€{rvProduct.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-4" />
          </motion.section>
        )}

        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => { if (searchSuggestions.length > 0) setShowSuggestions(true); }}
              placeholder="Buscar fragrâncias..."
              className="w-full bg-secondary/30 border border-gold/10 rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/40 transition-colors"
            />
            {filters.search && (
              <button onClick={() => setFilter("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold z-10">
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  ref={suggestionsRef}
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-0 right-0 mt-2 bg-noir border border-gold/20 rounded-lg p-2 shadow-xl z-50 overflow-hidden"
                >
                  {searchSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gold/10 transition-colors text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors truncate">
                          {suggestion.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {suggestion.olfactiveFamily} · {suggestion.gender}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-gold flex-shrink-0">
                        €{suggestion.price.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-3 items-center">
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-secondary/20 rounded-lg p-1">
              <button
                onClick={() => handleViewModeChange("grid")}
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-gold/20 text-gold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewModeChange("list")}
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-gold/20 text-gold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="List view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => setFilter("sort", e.target.value)}
                className="appearance-none bg-secondary/30 border border-gold/10 hover:border-gold/40 rounded-lg px-4 pr-10 py-3 text-sm text-foreground focus:outline-none focus:border-gold/40 transition-colors cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/60 pointer-events-none" />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-gold/20 text-gold hover:bg-gold/10 lg:hidden"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-gold text-noir text-[10px] px-1.5">{activeFilterCount}</Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Quick Filter Bar */}
        <div className="lg:hidden mb-6 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2">
            {quickFilterItems.map((item) => (
              <button
                key={item.value}
                onClick={() => handleQuickFilter(item.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeQuickFilter === item.value
                    ? "bg-gold text-noir"
                    : "border border-gold/20 text-muted-foreground hover:text-gold hover:border-gold/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filter Chips */}
        <AnimatePresence>
          {activeFilterChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-wrap items-center gap-2 mb-6 overflow-hidden"
            >
              <span className="text-xs text-muted-foreground uppercase tracking-wider flex-shrink-0">Filtros ativos:</span>
              {activeFilterChips.map((chip, index) => (
                <motion.button
                  key={chip.key}
                  initial={{ opacity: 0, scale: 0.8, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => clearFilter(chip.key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gold/20 text-gold bg-gold/5 hover:bg-gold/10 hover:border-gold/40 transition-all duration-200 cursor-pointer"
                >
                  {chip.label}
                  <X className="w-3 h-3 opacity-60 hover:opacity-100" />
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="ml-auto text-xs text-gold hover:text-gold-light flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 hover:border-gold/50 hover:bg-gold/10 transition-all duration-300 flex-shrink-0"
              >
                <RotateCcw className="w-3 h-3" /> Limpar Filtros
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`hidden lg:block w-64 flex-shrink-0 ${showFilters ? "" : ""}`}
          >
            <FilterSidebar />
          </motion.aside>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-noir/80 lg:hidden"
                  onClick={() => setShowFilters(false)}
                />
                <motion.aside
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-noir border-r border-gold/10 p-6 overflow-y-auto custom-scrollbar lg:hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-lg text-gold-gradient">Filtros</h3>
                    <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-gold">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <FilterSidebar />
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Product Grid / List */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6 pb-4 border-b border-gold/10">
              <div>
                {!loading && (
                  <p className="text-sm text-muted-foreground">
                    {filterDescription ? (
                      <>
                        <motion.span
                          key={total}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-gold font-semibold inline-block tabular-nums"
                        >
                          {total}
                        </motion.span>{" "}
                        {total === 1 ? "resultado" : "resultados"}{" "}
                        <span className="text-foreground/50">para</span>{" "}
                        <span className="text-gold/80 italic">{filterDescription}</span>
                      </>
                    ) : allTotal > 0 ? (
                      <>
                        Mostrando{" "}
                        <motion.span
                          key={total}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-gold font-semibold inline-block tabular-nums"
                        >
                          {total}
                        </motion.span>{" "}
                        de{" "}
                        <span className="text-foreground/70 tabular-nums">{allTotal}</span>{" "}
                        {allTotal === 1 ? "fragrância" : "fragrâncias"}
                      </>
                    ) : (
                      <>
                        A mostrar{" "}
                        <motion.span
                          key={total}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-gold font-semibold inline-block tabular-nums"
                        >
                          {total}
                        </motion.span>{" "}
                        {total === 1 ? "fragrância" : "fragrâncias"}
                      </>
                    )}
                  </p>
                )}
                {loading && (
                  <div className="h-5 w-40 bg-secondary/20 rounded animate-pulse" />
                )}
              </div>

            </div>

            {loading ? (
              <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6" : "flex flex-col gap-4"}>
                {Array.from({ length: 8 }).map((_, i) =>
                  viewMode === "grid" ? (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
                      className="rounded-lg border border-gold/10 bg-secondary/5 overflow-hidden"
                    >
                      <div className="aspect-[3/4] skeleton-shimmer rounded-t-lg" />
                      <div className="p-4 space-y-3">
                        <div className="h-3 w-20 skeleton-shimmer rounded" />
                        <div className="h-4 w-32 skeleton-shimmer rounded" />
                        <div className="flex items-center justify-between">
                          <div className="h-3 w-16 skeleton-shimmer rounded" />
                          <div className="h-4 w-14 skeleton-shimmer rounded" />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
                      className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gold/10 bg-secondary/5"
                    >
                      <div className="w-full sm:w-[120px] h-40 sm:h-32 rounded-lg skeleton-shimmer flex-shrink-0" />
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-3 w-20 skeleton-shimmer rounded" />
                        <div className="h-4 w-48 skeleton-shimmer rounded" />
                        <div className="h-3 w-36 skeleton-shimmer rounded" />
                        <div className="h-3 w-28 skeleton-shimmer rounded" />
                      </div>
                      <div className="hidden sm:flex flex-col items-end justify-center gap-2 flex-shrink-0">
                        <div className="h-5 w-20 skeleton-shimmer rounded" />
                        <div className="h-8 w-28 skeleton-shimmer rounded-lg" />
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            ) : products.length === 0 ? (
              /* Unified empty state */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-b from-gold/5 to-transparent rounded-2xl p-12 sm:p-16 text-center luxury-section"
              >
                {/* Decorative gold lines */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/30" />
                  <div className="w-2 h-2 rotate-45 border border-gold/40" />
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/30" />
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6 gold-glow"
                >
                  {filters.search ? (
                    <SearchX className="w-12 h-12 text-gold/70" />
                  ) : (
                    <FilterX className="w-12 h-12 text-gold/70" />
                  )}
                </motion.div>
                <h3 className="font-serif text-2xl text-gold-gradient mb-3">
                  Nenhum perfume encontrado
                </h3>
                <p className="text-sm text-muted-foreground mb-10 max-w-sm mx-auto">
                  Tente ajustar os seus filtros para encontrar o perfume ideal
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3"
                >
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60 transition-all px-6"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                  <Button
                    onClick={() => {
                      resetFilters();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-gold text-noir hover:bg-gold-light transition-all px-6"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Ver todos os produtos
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentPage("ai-sommelier");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    variant="outline"
                    className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all px-6"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Falar com Sommelier IA
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {viewMode === "grid" ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 noise-overlay"
                  >
                    {products.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col"
                  >
                    {products.map((product, i) => {
                      const productImage = product.imageUrl || familyImages[product.olfactiveFamily] || "/images/perfumes/golden-perfume.png";
                      return (
                        <div key={product.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.3 }}
                            onClick={() => handleProductClick(product)}
                            className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gold/10 bg-secondary/5 hover:border-gold/30 transition-all group cursor-pointer"
                          >
                            {/* Image */}
                            <div className="w-full sm:w-[120px] h-40 sm:h-[140px] rounded-lg overflow-hidden flex-shrink-0 relative bg-gradient-to-br from-secondary/30 to-secondary/10">
                              <img
                                src={productImage}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {/* Badges */}
                              <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                                {product.isNew && (
                                  <span className="px-1.5 py-0.5 bg-gold text-noir text-[8px] font-bold uppercase tracking-wider rounded-sm animate-subtle-pulse">
                                    Novo
                                  </span>
                                )}
                                {product.isBestseller && (
                                  <span className="px-1.5 py-0.5 bg-noir/80 text-gold text-[8px] font-bold uppercase tracking-wider rounded-sm border border-gold/30">
                                    Bestseller
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="text-[10px] uppercase tracking-widest text-gold/70">
                                {product.olfactiveFamily}
                              </p>
                              <h3 className="font-serif text-base font-medium mt-1 group-hover:text-gold transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-muted-foreground">{product.gender}</span>
                                <span className="text-xs text-gold/40">•</span>
                                <span className="text-xs text-muted-foreground">{product.fixation || "—"}</span>
                              </div>
                            </div>
                            {/* Price & Add to Cart - far right (desktop) */}
                            <div className="hidden sm:flex flex-col items-end justify-center gap-3 flex-shrink-0 ml-4">
                              <span className="text-lg font-bold text-gold-gradient tabular-nums">
                                €{product.price.toFixed(2)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                className="px-4 py-2 bg-gold text-noir text-xs font-semibold rounded-lg hover:bg-gold-light transition-colors flex items-center gap-1.5 shadow-sm hover:shadow-gold/20"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Adicionar
                              </button>
                            </div>
                            {/* Mobile: Price & Add to Cart below info */}
                            <div className="flex sm:hidden items-center justify-between pt-3 border-t border-gold/10 mt-2">
                              <span className="text-lg font-bold text-gold-gradient tabular-nums">
                                €{product.price.toFixed(2)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                className="px-4 py-2 bg-gold text-noir text-xs font-semibold rounded-lg hover:bg-gold-light transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Adicionar
                              </button>
                            </div>
                          </motion.div>
                          {/* Gold-line separator */}
                          {i < products.length - 1 && (
                            <div className="h-px bg-gradient-to-r from-gold/20 via-gold/10 to-transparent my-1" />
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, filterKey, options }: { title: string; filterKey: string; options: string[] }) {
  const { filters, setFilter } = useStore();
  const currentVal = (filters as Record<string, string>)[filterKey] || "all";
  const normalizedCurrent = currentVal.toLowerCase();

  // Count active (non-default) options in this filter group
  const hasActiveFilter = normalizedCurrent !== "all" && normalizedCurrent !== "todos";

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold tracking-widest uppercase text-gold-light">{title}</h4>
        {hasActiveFilter && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-gradient-to-br from-gold to-gold-light text-noir text-[10px] font-bold flex items-center justify-center"
          >
            1
          </motion.span>
        )}
      </div>
      <div className="space-y-1.5">
        {options.map((opt) => {
          const val = opt.toLowerCase();
          const isActive = (val === "todos" || val === "all") ? normalizedCurrent === "all" || normalizedCurrent === "todos" : normalizedCurrent === val;
          return (
            <button
              key={opt}
              onClick={() => setFilter(filterKey as keyof typeof filters, val === "todos" || val === "all" ? "all" : val)}
              className={`block w-full text-left text-sm px-3 py-1.5 rounded transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-gold/20 to-gold/10 text-gold font-medium border-l-2 border-gold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterSidebar() {
  const { filters, setFilter } = useStore();

  // Count active filters for this section
  const hasActivePrice = !!(filters.minPrice || filters.maxPrice);
  const hasActiveGender = filters.gender !== "all" && filters.gender !== "todos";
  const hasActiveIntensity = filters.intensity !== "all" && filters.intensity !== "todos";
  const hasActiveOccasion = filters.occasion !== "all" && filters.occasion !== "todos";
  const hasActiveFamily = filters.olfactiveFamily !== "all" && filters.olfactiveFamily !== "todos";
  const hasActiveFixation = filters.fixation !== "all" && filters.fixation !== "todos";

  return (
    <div>
      {/* Price Range */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold tracking-widest uppercase text-gold-light">Faixa de Preço</h4>
          {hasActivePrice && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 rounded-full bg-gradient-to-br from-gold to-gold-light text-noir text-[10px] font-bold flex items-center justify-center"
            >
              !
            </motion.span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Mín"
            value={filters.minPrice}
            onChange={(e) => setFilter("minPrice", e.target.value)}
            className="w-full bg-secondary/30 border border-gold/10 rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/40"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="number"
            placeholder="Máx"
            value={filters.maxPrice}
            onChange={(e) => setFilter("maxPrice", e.target.value)}
            className="w-full bg-secondary/30 border border-gold/10 rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/40"
          />
        </div>
      </div>

      {/* Gold line separator */}
      <div className="h-px w-full mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(201, 169, 110, 0.2), transparent)" }} />

      <FilterSection title="Género" filterKey="gender" options={filterOptions.gender} />

      {/* Gold line separator */}
      <div className="h-px w-full mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(201, 169, 110, 0.2), transparent)" }} />

      <FilterSection title="Intensidade" filterKey="intensity" options={filterOptions.intensity} />

      {/* Gold line separator */}
      <div className="h-px w-full mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(201, 169, 110, 0.2), transparent)" }} />

      <FilterSection title="Ocasião" filterKey="occasion" options={filterOptions.occasion} />

      {/* Gold line separator */}
      <div className="h-px w-full mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(201, 169, 110, 0.2), transparent)" }} />

      <FilterSection title="Família Olfativa" filterKey="olfactiveFamily" options={filterOptions.olfactiveFamily} />

      {/* Gold line separator */}
      <div className="h-px w-full mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(201, 169, 110, 0.2), transparent)" }} />

      <FilterSection title="Fixação" filterKey="fixation" options={filterOptions.fixation} />
    </div>
  );
}
