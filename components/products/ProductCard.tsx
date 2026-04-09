"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Heart, Scale, Eye, Truck, Flame, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
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
  };
  index?: number;
}

const familyColors: Record<string, string> = {
  oriental: "from-amber-900/30 to-orange-900/20",
  floral: "from-pink-900/30 to-rose-900/20",
  amadeirado: "from-yellow-900/30 to-amber-900/20",
  "fougère": "from-green-900/30 to-emerald-900/20",
  "cítrico": "from-cyan-900/30 to-blue-900/20",
  gourmet: "from-orange-900/30 to-red-900/20",
  aquático: "from-blue-900/30 to-cyan-900/20",
  especiado: "from-red-900/30 to-amber-900/20",
};

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

function usePriceAnimation(target: number) {
  const [displayPrice, setDisplayPrice] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const duration = 800;

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - (startTimeRef.current || 0);
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplayPrice(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target]);

  return displayPrice;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart, setSelectedProductSlug, setCurrentPage, toggleWishlist, isInWishlist, toggleCompare, compareList, setQuickViewProduct, setProductSource } = useStore();
  const inWishlist = isInWishlist(product.id);
  const isComparing = compareList.includes(product.id);
  const [showTooltip, setShowTooltip] = useState(false);
  const [viewersCount] = useState(() => Math.floor(Math.random() * 41) + 5);
  const [addPulse, setAddPulse] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const animatedPrice = usePriceAnimation(product.price);

  const handleProductClick = () => {
    setProductSource('catalog');
    setSelectedProductSlug(product.slug);
    setCurrentPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id, product.name);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (compareList.length >= 4 && !isComparing) {
      toast.error('Máximo de 4 produtos para comparação');
      return;
    }
    toggleCompare(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Quick-add pulse animation + "Adicionado!" feedback
    setAddPulse(true);
    setAddedFeedback(true);
    setTimeout(() => setAddPulse(false), 300);
    setTimeout(() => setAddedFeedback(false), 1200);
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      olfactiveFamily: product.olfactiveFamily,
      size: "100ml",
    });
    toast.success(`${product.name} (100ml) adicionado à sacola`, {
      description: "Clique na sacola para ver seus itens",
    });
  };

  const bgGradient = familyColors[product.olfactiveFamily] || "from-gray-900/30 to-gray-800/20";
  const productImage = product.imageUrl || familyImages[product.olfactiveFamily] || "/images/perfumes/golden-perfume.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      onClick={handleProductClick}
      className="group cursor-pointer"
    >
      <div className={`relative overflow-hidden rounded-lg border border-gold/10 hover:border-gold/30 transition-all duration-500 card-hover-glow card-luxury-hover card-3d-hover card-shimmer group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_25px_rgba(201,169,110,0.08)]`}>
        {/* Gradient overlay shimmer sweep on hover */}
        <div className="absolute inset-0 z-[2] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(105deg, transparent 35%, rgba(201,169,110,0.08) 45%, rgba(232,213,163,0.15) 50%, rgba(201,169,110,0.08) 55%, transparent 65%)',
            backgroundSize: '250% 100%',
            animation: 'shimmerSweepOverlay 2s ease-in-out infinite',
          }} />
        </div>
        {/* Image */}
        <div className={`aspect-[3/4] relative bg-gradient-to-br ${bgGradient}`}>
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
          />

          {/* Shimmer overlay on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(201, 169, 110, 0.12) 45%, rgba(201, 169, 110, 0.2) 50%, rgba(201, 169, 110, 0.12) 55%, transparent 60%)",
              backgroundSize: "300% 100%",
              animation: "shimmerCard 1.5s ease-in-out infinite",
            }}
          />
          <style jsx>{`
            @keyframes shimmerCard {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {(product.isNew || product.isBestseller) && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col gap-1.5"
              >
                {product.isNew && (
                  <span className="px-2 py-0.5 bg-gold text-noir text-[10px] font-bold uppercase tracking-wider rounded-sm">
                    Novo
                  </span>
                )}
                {product.isBestseller && (
                  <span className="px-2 py-0.5 bg-noir/80 text-gold text-[10px] font-bold uppercase tracking-wider rounded-sm border border-gold/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-gold fill-gold/60" />
                    Bestseller
                  </span>
                )}
              </motion.div>
            )}
          </div>

          {/* Wishlist button with glow on hover */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-noir/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ${
              inWishlist
                ? 'text-gold fill-gold opacity-100'
                : 'text-white/70 hover:text-gold'
            }`}
            style={!inWishlist ? {
              boxShadow: 'none',
            } : undefined}
            onMouseEnter={(e) => {
              if (!inWishlist) {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(201, 169, 110, 0.4)';
                (e.currentTarget as HTMLElement).style.textShadow = '0 0 8px rgba(201, 169, 110, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLElement).style.textShadow = 'none';
            }}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-gold' : ''}`} />
          </motion.button>

          {/* Compare button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleCompare}
            className={`absolute bottom-3 left-3 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 backdrop-blur-sm ${isComparing ? 'bg-gold text-noir opacity-100 translate-y-0' : 'bg-noir/60 text-white/70 hover:text-gold'}`}
          >
            <Scale className="w-4 h-4" />
          </motion.button>

          {/* Quick View button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
            className="absolute bottom-3 left-14 w-9 h-9 rounded-full bg-noir/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-white/70 hover:text-gold"
          >
            <Eye className="w-4 h-4" />
          </motion.button>

          {/* Quick add button with tooltip + pulse effect */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            animate={addPulse ? { scale: [1, 1.25, 1] } : {}}
            transition={addPulse ? { duration: 0.3 } : {}}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gold text-noir flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-gold/20"
          >
            {addedFeedback ? (
              <Check className="w-4 h-4" strokeWidth={3} />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
            {/* Tooltip */}
            <span className={`absolute bottom-full right-0 mb-2 px-2 py-1 bg-noir border border-gold/20 rounded text-[10px] text-gold whitespace-nowrap transition-all duration-200 pointer-events-none ${
              addedFeedback ? "opacity-100 translate-y-0" : showTooltip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            }`}>
              {addedFeedback ? "Adicionado!" : "Adicionar"}
              <span className="absolute top-full right-4 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-noir" />
            </span>
          </motion.button>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-gold/70">
            {product.olfactiveFamily}
          </p>
          {/* Viewers social proof — only visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Eye className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">{viewersCount} pessoas vistaram</span>
          </div>
          <h3 className="font-serif text-sm font-medium leading-tight group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          {/* Star rating */}
          {product.rating > 0 && product.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gold/70">
              <span>{product.rating}</span>
              <Star className="w-3 h-3 fill-gold text-gold" />
              <span>({product.reviewCount})</span>
            </div>
          )}
          {/* Gold line separator between name and description */}
          <div
            className="h-px w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "linear-gradient(90deg, rgba(201, 169, 110, 0.4), transparent)" }}
          />
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="price-badge">
              <span className="text-lg font-bold text-gold-gradient tabular-nums">
                €{animatedPrice.toFixed(2)}
              </span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {product.gender}
            </span>
          </div>
          {/* Saving indicator for products > €30 — only visible on hover */}
          {product.price > 30 && (
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Truck className="w-3 h-3 text-green-500/70" />
              <span className="text-[9px] text-green-500/70">Economia no envio</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
