"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingBag, ArrowLeft, Clock, Wind, Zap, Sparkles, Share2, ShieldCheck, Truck, RefreshCw, Sun, Moon, User, Crown, Gem, Calendar, Flame, Gift, Loader2, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductReviews } from "@/components/products/ProductReviews";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { StockNotification } from "@/components/products/StockNotification";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  longDescription: string;
  gender: string;
  olfactiveFamily: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  imageUrl: string;
  category: string;
  intensity: string;
  occasion: string;
  fixation: string;
  projection: string;
  notesTop: string;
  notesHeart: string;
  notesBase: string;
  notesKey: string;
  origin: string;
  forWho: string;
  timeOfDay: string;
  stock: number;
}

const familyImages: Record<string, string> = {
  oriental: "/images/perfumes/amber-perfume.png",
  floral: "/images/perfumes/pink-perfume.png",
  amadeirado: "/images/perfumes/dark-perfume.png",
  "fougère": "/images/perfumes/blue-perfume.png",
  cítrico: "/images/perfumes/blue-perfume.png",
  gourmet: "/images/perfumes/golden-perfume.png",
  aquático: "/images/perfumes/blue-perfume.png",
  especiado: "/images/perfumes/amber-perfume.png",
};

const familyColors: Record<string, string> = {
  oriental: "from-amber-900/30 to-orange-900/20",
  floral: "from-pink-900/30 to-rose-900/20",
  amadeirado: "from-yellow-900/30 to-amber-900/20",
  "fougère": "from-green-900/30 to-emerald-900/20",
  cítrico: "from-cyan-900/30 to-blue-900/20",
  gourmet: "from-orange-900/30 to-red-900/20",
  aquático: "from-blue-900/30 to-cyan-900/20",
  especiado: "from-red-900/30 to-amber-900/20",
};

/* ───── Olfactive Pyramid Component ───── */
function OlfactivePyramid({ product }: { product: Product }) {
  const tiers = [
    {
      label: "Notas de Topo",
      subtitle: "Primeiras impressões",
      notes: product.notesTop,
      gradient: "from-gold-light/20 to-gold/10",
      border: "border-gold-light/30",
      accent: "bg-gold-light",
      text: "text-gold-light",
      width: "w-full max-w-xs sm:max-w-sm",
      delay: 0,
      icon: Sparkles,
    },
    {
      label: "Notas de Coração",
      subtitle: "A essência da fragrância",
      notes: product.notesHeart,
      gradient: "from-gold/20 to-gold-dark/10",
      border: "border-gold/30",
      accent: "bg-gold",
      text: "text-gold",
      width: "w-full max-w-md sm:max-w-lg",
      delay: 0.15,
      icon: Flame,
    },
    {
      label: "Notas de Base",
      subtitle: "A memória duradoura",
      notes: product.notesBase,
      gradient: "from-gold-dark/20 to-amber-900/10",
      border: "border-gold-dark/30",
      accent: "bg-gold-dark",
      text: "text-gold-dark",
      width: "w-full max-w-lg sm:max-w-xl",
      delay: 0.3,
      icon: Gem,
    },
  ];

  const hasAnyNotes = product.notesTop || product.notesHeart || product.notesBase;

  if (!hasAnyNotes) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-widest text-gold-light font-semibold">Pirâmide Olfativa</h3>
      <div className="flex flex-col items-center gap-2 py-4">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <motion.div
              key={tier.label}
              initial={{ opacity: 0, x: tier.delay === 0 ? -40 : tier.delay < 0.25 ? -30 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: tier.delay, ease: "easeOut" }}
              className={`${tier.width}`}
            >
              <div className={`relative rounded-lg border ${tier.border} bg-gradient-to-r ${tier.gradient} p-4 sm:p-5`}>
                {/* Accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${tier.accent} rounded-t-lg`} />

                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-4 h-4 ${tier.text}`} />
                  <div>
                    <p className={`text-sm font-semibold ${tier.text}`}>{tier.label}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{tier.subtitle}</p>
                  </div>
                </div>

                {tier.notes ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tier.notes.split(",").map((note) => (
                      <span
                        key={note.trim()}
                        className={`px-2.5 py-1 text-xs rounded-full border ${tier.border} bg-secondary/30 ${tier.text} font-medium`}
                      >
                        {note.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic mt-1">Informação não disponível</p>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Pyramid connector lines */}
        <svg className="w-full max-w-xs sm:max-w-sm h-4 mt-1" viewBox="0 0 200 16" fill="none">
          <path d="M100 0 L60 16" stroke="rgba(201,169,110,0.2)" strokeWidth="1" />
          <path d="M100 0 L140 16" stroke="rgba(201,169,110,0.2)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

/* ───── For Who Section Component ───── */
function ForWhoSection({ product }: { product: Product }) {
  const getGenderIcon = (gender: string) => {
    switch (gender.toLowerCase()) {
      case "feminino": return { icon: Crown, label: "Feminino" };
      case "masculino": return { icon: ShieldCheck, label: "Masculino" };
      default: return { icon: User, label: "Unissex" };
    }
  };

  const getTimeOfDayIcon = (tod: string) => {
    if (tod.toLowerCase().includes("noite") || tod.toLowerCase().includes("evening")) {
      return { icon: Moon, label: tod };
    }
    if (tod.toLowerCase().includes("dia") || tod.toLowerCase().includes("manhã")) {
      return { icon: Sun, label: tod };
    }
    return { icon: Calendar, label: tod };
  };

  const genderInfo = getGenderIcon(product.gender);
  const todInfo = getTimeOfDayIcon(product.timeOfDay);
  const GenderIcon = genderInfo.icon;
  const TodIcon = todInfo.icon;

  const occasionTags = product.occasion
    ? product.occasion.split(",").map((o) => o.trim()).filter(Boolean)
    : [];

  const intensityTags = product.intensity
    ? product.intensity.split(",").map((i) => i.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-widest text-gold-light font-semibold">Para Quem é Este Perfume?</h3>
      <div className="grid grid-cols-2 gap-3">
        {/* Gender */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gold/10 bg-secondary/5">
          <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
            <GenderIcon className="w-4 h-4 text-gold" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Género</p>
            <p className="text-sm font-medium">{genderInfo.label}</p>
          </div>
        </div>

        {/* Time of Day */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gold/10 bg-secondary/5">
          <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
            <TodIcon className="w-4 h-4 text-gold" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Momento</p>
            <p className="text-sm font-medium capitalize">{todInfo.label.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Occasion Tags */}
      {occasionTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center mr-1">Ocasiões:</span>
          {occasionTags.map((tag) => (
            <Badge key={tag} variant="outline" className="border-gold/20 text-gold-light text-xs bg-gold/5">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Intensity Tags */}
      {intensityTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center mr-1">Intensidade:</span>
          {intensityTags.map((tag) => (
            <Badge key={tag} variant="outline" className="border-gold/20 text-gold text-xs bg-gold/5">
              <Zap className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* For Who Text */}
      {product.forWho && (
        <p className="text-sm text-muted-foreground italic">{product.forWho}</p>
      )}
    </div>
  );
}

/* ───── Combines Well With Section ───── */
function CombinesWellSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  const handleProductClick = (slug: string) => {
    useStore.getState().setSelectedProductSlug(slug);
    useStore.getState().setCurrentPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-widest text-gold-light font-semibold">Combina Bem Com</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {products.slice(0, 3).map((p) => (
          <motion.button
            key={p.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleProductClick(p.slug)}
            className="flex items-center gap-3 p-3 rounded-lg border border-gold/10 bg-secondary/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left group"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gold/10">
              <img
                src={p.imageUrl || familyImages[p.olfactiveFamily] || "/images/perfumes/golden-perfume.png"}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-gold transition-colors">{p.name}</p>
              <p className="text-xs text-gold font-semibold">€{p.price.toFixed(2)}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ───── Size/Volume Options ───── */
const sizeOptions = [
  { id: "30ml", label: "30ml", volume: "30ml", multiplier: 0.6, recommended: false },
  { id: "50ml", label: "50ml", volume: "50ml", multiplier: 0.8, recommended: false },
  { id: "100ml", label: "100ml", volume: "100ml", multiplier: 1, recommended: true },
];

/* ───── Main Product Page ───── */
export function ProductPage() {
  const { selectedProductSlug, setCurrentPage, addToCart, addToRecentlyViewed, productSource, setProductSource, selectedSize, setSelectedSize } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Sticky mobile bar state
  const [isMobile, setIsMobile] = useState(false);
  const [isAddToCartVisible, setIsAddToCartVisible] = useState(true);
  const addToCartRef = useRef<HTMLDivElement>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // IntersectionObserver for add-to-cart section
  useEffect(() => {
    if (!addToCartRef.current || !isMobile) {
      setIsAddToCartVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsAddToCartVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: "-10% 0px -10% 0px" }
    );
    observer.observe(addToCartRef.current);
    return () => observer.disconnect();
  }, [isMobile, loading, product]);

  useEffect(() => {
    async function fetchProduct() {
      if (!selectedProductSlug) return;
      setLoading(true);
      setSelectedSize("100ml");
      try {
        const res = await fetch(`/api/products/${selectedProductSlug}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data.product);
        addToRecentlyViewed(data.product.slug);

        // Fetch related products (same family, exclude current)
        const relatedRes = await fetch(`/api/products?olfactiveFamily=${encodeURIComponent(data.product.olfactiveFamily)}&limit=4`);
        const relatedData = await relatedRes.json();
        setRelated((relatedData.products || []).filter((p: Product) => p.id !== data.product.id));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [selectedProductSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <div className="aspect-[3/4] rounded-xl skeleton-shimmer" />
          <div className="h-8 w-3/4 rounded-lg skeleton-shimmer" />
          <div className="h-4 w-1/2 rounded-lg skeleton-shimmer" />
          <div className="h-4 w-2/3 rounded-lg skeleton-shimmer" />
          <div className="h-12 w-full rounded-lg skeleton-shimmer mt-6" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Produto não encontrado</p>
          <Button onClick={() => setCurrentPage("catalog")} variant="outline" className="border-gold/30 text-gold">
            Voltar ao Catálogo
          </Button>
        </div>
      </div>
    );
  }

  const currentSize = sizeOptions.find((s) => s.id === selectedSize) || sizeOptions[1];
  const displayPrice = product.price * currentSize.multiplier;
  const loyaltyPoints = Math.round(displayPrice * 10);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      quantity,
      imageUrl: product.imageUrl,
      olfactiveFamily: product.olfactiveFamily,
      size: currentSize.volume,
    });
    toast.success(`${product.name} (${currentSize.volume}) adicionado à sacola`);
  };

  const showStickyBar = isMobile && !isAddToCartVisible && product && product.stock > 0;

  const handleStickyAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      quantity,
      imageUrl: product.imageUrl,
      olfactiveFamily: product.olfactiveFamily,
      size: currentSize.volume,
    });
    toast.success(`${product.name} (${currentSize.volume}) adicionado à sacola`);
  };

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8">
          {productSource && (
            <nav className="flex items-center gap-2 text-sm">
              <button
                onClick={() => {
                  setProductSource(null);
                  setCurrentPage(productSource === 'search' ? 'home' : productSource);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {productSource === 'catalog' ? 'Catálogo' : productSource === 'search' ? 'Pesquisa' : 'Início'}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
              <span className="text-gold/80 font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
            </nav>
          )}
          {!productSource && (
            <button
              onClick={() => setCurrentPage("catalog")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Catálogo
            </button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <ProductImageGallery product={product} />

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-luxury rounded-xl p-6 sm:p-8 flex flex-col gap-6"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold/70 mb-2">
                {product.olfactiveFamily} · {product.gender}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-gold text-gold" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} avaliações)</span>
            </div>

            <Separator className="bg-gold/10" />

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.longDescription || product.description}
            </p>

            {/* Properties */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-secondary/10 border border-gold/10 text-center">
                <Clock className="w-4 h-4 text-gold mx-auto mb-1" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Fixação</p>
                <p className="text-sm font-medium">{product.fixation}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/10 border border-gold/10 text-center">
                <Wind className="w-4 h-4 text-gold mx-auto mb-1" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Projeção</p>
                <p className="text-sm font-medium">{product.projection}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/10 border border-gold/10 text-center">
                <Zap className="w-4 h-4 text-gold mx-auto mb-1" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Intensidade</p>
                <p className="text-sm font-medium">{product.intensity}</p>
              </div>
            </div>

            <Separator className="bg-gold/10" />

            {/* Olfactive Pyramid */}
            <OlfactivePyramid product={product} />

            {/* For Who Section */}
            <ForWhoSection product={product} />

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Origem: </span>
                <span className="font-medium">{product.origin}</span>
              </div>
            </div>

            <Separator className="bg-gold/10" />

            {/* Size/Volume Selector */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-gold-light font-semibold">Tamanho</h3>
              <div className="grid grid-cols-3 gap-2">
                {sizeOptions.map((size) => {
                  const isSelected = selectedSize === size.id;
                  const sizePrice = product.price * size.multiplier;
                  return (
                    <motion.button
                      key={size.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSize(size.id)}
                      className={`relative rounded-lg border p-3 text-left transition-all ${
                        isSelected
                          ? "border-gold bg-gradient-to-br from-gold via-gold-light to-gold-dark shadow-lg shadow-gold/20"
                          : "border-gold/20 hover:border-gold/30 bg-secondary/20"
                      }`}
                    >
                      {size.recommended && (
                        <span className={`absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          isSelected ? "bg-noir text-gold" : "bg-gold text-noir"
                        }`}>
                          Recomendado
                        </span>
                      )}
                      {isSelected && (
                        <motion.div
                          layoutId="size-selector-highlight"
                          className="absolute inset-0 rounded-lg border-2 border-gold/40"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10">
                        <p className={`text-sm font-semibold ${isSelected ? "text-noir" : "text-gold-light"}`}>
                          {size.label}
                        </p>
                        <p className={`text-lg font-bold mt-1 ${isSelected ? "text-noir" : "text-foreground"}`}>
                          €{sizePrice.toFixed(2)}
                        </p>
                        <p className={`text-[10px] mt-1 ${isSelected ? "text-noir/70" : "text-muted-foreground"}`}>
                          Eau de Parfum
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              {/* Selected size info */}
              <motion.p
                key={selectedSize}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-xs text-gold-light text-center"
              >
                Volume selecionado: {currentSize.volume} — Eau de Parfum
              </motion.p>
            </div>

            <Separator className="bg-gold/10" />

            {/* Price & Add to Cart / Stock Notification */}
            {product.stock > 0 ? (
            <div ref={addToCartRef} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div>
                <p className="text-3xl font-bold text-gold-gradient">€{displayPrice.toFixed(2)}</p>
                <Badge variant="outline" className="mt-2 border-gold/20 text-gold-light text-xs bg-transparent">
                  {currentSize.volume} — Eau de Parfum
                </Badge>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-2 border border-gold/20 rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-muted-foreground hover:text-gold transition-colors">−</button>
                  <span className="text-sm font-medium w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-muted-foreground hover:text-gold transition-colors">+</button>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copiado!");
                  }}
                  variant="outline"
                  className="border-gold/20 text-gold hover:bg-gold/10 px-3 py-5"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button onClick={handleAddToCart} className="bg-gold text-noir hover:bg-gold-light px-6 py-5 font-semibold text-sm tracking-wider uppercase">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={() => {
                      handleAddToCart();
                      setIsBuyingNow(true);
                      setTimeout(() => {
                        setIsBuyingNow(false);
                        setCurrentPage("checkout");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }, 300);
                    }}
                    disabled={isBuyingNow}
                    variant="outline"
                    className="border-gold text-gold hover:bg-gold/10 px-5 py-5 font-semibold text-sm tracking-wider uppercase"
                  >
                    {isBuyingNow ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 mr-2" />
                    )}
                    Comprar Agora
                  </Button>
                </motion.div>
              </div>
            </div>
            ) : (
              <StockNotification productId={product.id} productName={product.name} productSlug={product.slug} />
            )}

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-4 px-4 rounded-lg border border-gold/10 bg-secondary/5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-gold" /> Autenticidade Garantida</span>
              <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-gold" /> Envio Grátis</span>
              <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-gold" /> Troca em 30 dias</span>
            </div>

            {/* Loyalty Points Indicator */}
            <div className="flex items-center justify-center gap-2 py-2">
              <Gift className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold-light">
                +<span className="font-bold text-gold">{loyaltyPoints}</span> pontos de fidelidade
              </span>
            </div>
          </motion.div>
        </div>

        {/* Combines Well With Section */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <CombinesWellSection products={related} />
          </motion.section>
        )}

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20 sm:mt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Você Também Pode Gostar</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient">Fragrâncias Relacionadas</h2>
              <div className="gold-line max-w-xs mx-auto mt-4" />
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
      </motion.div>

      {/* Sticky Mobile Add-to-Cart Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[42] lg:hidden"
          >
            <div className="bg-noir/95 glass border-t border-gold/20 px-4 py-3 flex items-center gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {/* Product info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-foreground">{product.name}</p>
                <p className="text-gold font-bold text-base">€{displayPrice.toFixed(2)}</p>
              </div>
              {/* Add to cart button */}
              <button
                onClick={handleStickyAddToCart}
                className="flex-shrink-0 bg-gold text-noir px-4 py-3 rounded-lg font-semibold text-xs tracking-wider uppercase hover:bg-gold-light transition-colors active:scale-[0.97]"
              >
                <ShoppingBag className="w-4 h-4 mr-1.5 inline" />
                Adicionar à Sacola
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
