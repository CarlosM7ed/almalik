"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Minus, Plus, ArrowRight, Sparkles, Flame, Gem, Clock, Volume2, ShoppingBag, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useStore, QuickViewProduct } from "@/lib/store";
import { toast } from "sonner";

interface FullProduct extends QuickViewProduct {
  notesTop: string;
  notesHeart: string;
  notesBase: string;
  fixation: string;
  projection: string;
  intensity: string;
  occasion: string;
  timeOfDay: string;
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

const sizeOptions = [
  { id: '30ml', label: '30ml', volume: '30ml', multiplier: 0.6 },
  { id: '50ml', label: '50ml', volume: '50ml', multiplier: 0.8 },
  { id: '100ml', label: '100ml', volume: '100ml', multiplier: 1 },
];

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, setSelectedProductSlug, setCurrentPage, selectedSize, setSelectedSize } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [fullProduct, setFullProduct] = useState<FullProduct | null>(null);
  const [loading, setLoading] = useState(false);

  const open = quickViewProduct !== null;
  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setQuickViewProduct(null);
      setQuantity(1);
      setFullProduct(null);
      setSelectedSize('100ml');
    }
  };

  useEffect(() => {
    if (!quickViewProduct) return;

    const fetchFullProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${quickViewProduct.slug}`);
        const data = await res.json();
        if (data.product) {
          setFullProduct(data.product as FullProduct);
        }
      } catch {
        setFullProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFullProduct();
    setQuantity(1);
    setSelectedSize('100ml');
  }, [quickViewProduct]);

  const currentSize = sizeOptions.find((s) => s.id === selectedSize) || sizeOptions[2];
  const displayPrice = quickViewProduct ? quickViewProduct.price * currentSize.multiplier : 0;

  const handleAddToCart = () => {
    if (!quickViewProduct) return;
    addToCart({
      productId: quickViewProduct.id,
      name: quickViewProduct.name,
      price: displayPrice,
      quantity,
      imageUrl: quickViewProduct.imageUrl,
      olfactiveFamily: quickViewProduct.olfactiveFamily,
      size: currentSize.volume,
    });
    toast.success(`${quickViewProduct.name} (${currentSize.volume}) adicionado à sacola`, {
      description: `${quantity}x item${quantity > 1 ? "s" : ""} adicionado${quantity > 1 ? "s" : ""} à sua sacola`,
    });
    onOpenChange(false);
  };

  const handleViewDetails = () => {
    if (!quickViewProduct) return;
    setSelectedProductSlug(quickViewProduct.slug);
    setCurrentPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
    onOpenChange(false);
  };

  const product = quickViewProduct;
  if (!product) return null;

  const bgGradient = familyColors[product.olfactiveFamily] || "from-gray-900/30 to-gray-800/20";
  const productImage = product.imageUrl || familyImages[product.olfactiveFamily] || "/images/perfumes/golden-perfume.png";

  const notesTop = fullProduct?.notesTop ? fullProduct.notesTop.split(",").map((n) => n.trim()) : [];
  const notesHeart = fullProduct?.notesHeart ? fullProduct.notesHeart.split(",").map((n) => n.trim()) : [];
  const notesBase = fullProduct?.notesBase ? fullProduct.notesBase.split(",").map((n) => n.trim()) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 bg-noir border-gold/20 overflow-hidden">
        <DialogTitle className="sr-only">{product.name} - Vista Rápida</DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`relative aspect-square md:aspect-auto md:min-h-[520px] bg-gradient-to-br ${bgGradient} flex items-center justify-center p-8`}
          >
            <img
              src={productImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain drop-shadow-2xl"
              style={{ filter: "brightness(0.9) contrast(1.1)" }}
            />
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(201, 169, 110, 0.08) 45%, rgba(201, 169, 110, 0.15) 50%, rgba(201, 169, 110, 0.08) 55%, transparent 60%)",
                backgroundSize: "300% 100%",
                animation: "shimmerQuickView 2s ease-in-out infinite",
              }}
            />
            <style jsx>{`
              @keyframes shimmerQuickView {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.isNew && (
                <Badge className="bg-gold text-noir text-[10px] font-bold uppercase tracking-wider border-none">
                  Novo
                </Badge>
              )}
              {product.isBestseller && (
                <Badge className="bg-noir/80 text-gold text-[10px] font-bold uppercase tracking-wider border border-gold/30">
                  Bestseller
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Details Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="p-6 md:p-8 flex flex-col gap-5 overflow-y-auto max-h-[80vh] md:max-h-[600px] custom-scrollbar"
          >
            {/* Olfactive Family */}
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold/70 font-medium">
              {product.olfactiveFamily}
            </p>

            {/* Product Name */}
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-gold text-gold"
                        : i < product.rating
                        ? "fill-gold/50 text-gold/50"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} {product.reviewCount === 1 ? "avaliação" : "avaliações"})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <motion.span
                key={selectedSize}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-3xl font-bold text-gold-gradient tabular-nums"
              >
                €{displayPrice.toFixed(2)}
              </motion.span>
              <span className="text-xs text-muted-foreground">{currentSize.volume} — Eau de Parfum</span>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Gender Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-gold/30 text-gold text-xs">
                {product.gender}
              </Badge>
            </div>

            {/* Notes */}
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-gold animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">A carregar detalhes...</span>
              </div>
            ) : fullProduct ? (
              <div className="space-y-3">
                {/* Top Notes */}
                {notesTop.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-gold/60" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-medium">Notas de Topo</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {notesTop.map((note) => (
                        <span
                          key={note}
                          className="px-2.5 py-0.5 rounded-full bg-amber-900/20 text-amber-200/80 text-xs border border-amber-900/30"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Heart Notes */}
                {notesHeart.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-gold/60" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-medium">Notas de Coração</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {notesHeart.map((note) => (
                        <span
                          key={note}
                          className="px-2.5 py-0.5 rounded-full bg-rose-900/20 text-rose-200/80 text-xs border border-rose-900/30"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Base Notes */}
                {notesBase.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Gem className="w-3.5 h-3.5 text-gold/60" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-medium">Notas de Base</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {notesBase.map((note) => (
                        <span
                          key={note}
                          className="px-2.5 py-0.5 rounded-full bg-orange-900/20 text-orange-200/80 text-xs border border-orange-900/30"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fixation & Projection */}
                {(fullProduct.fixation || fullProduct.projection) && (
                  <div className="flex gap-4 pt-1">
                    {fullProduct.fixation && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-gold/50" />
                        <span>
                          <span className="text-gold/70 font-medium">Fixação:</span> {fullProduct.fixation}
                        </span>
                      </div>
                    )}
                    {fullProduct.projection && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Volume2 className="w-3.5 h-3.5 text-gold/50" />
                        <span>
                          <span className="text-gold/70 font-medium">Projecção:</span> {fullProduct.projection}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            {/* Size Selector */}
            <div className="space-y-2.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Tamanho</span>
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
                      className={`relative rounded-lg border p-2.5 text-left transition-all ${
                        isSelected
                          ? 'border-gold bg-gradient-to-br from-gold via-gold-light to-gold-dark shadow-lg shadow-gold/20'
                          : 'border-gold/20 hover:border-gold/30 bg-secondary/20'
                      }`}
                    >
                      {size.id === '100ml' && (
                        <span className={`absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                          isSelected ? 'bg-noir text-gold' : 'bg-gold text-noir'
                        }`}>
                          Popular
                        </span>
                      )}
                      <div className="relative z-10">
                        <p className={`text-xs font-semibold ${isSelected ? 'text-noir' : 'text-gold-light'}`}>
                          {size.label}
                        </p>
                        <p className={`text-sm font-bold mt-0.5 ${isSelected ? 'text-noir' : 'text-foreground'}`}>
                          €{sizePrice.toFixed(2)}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Quantidade</span>
              <div className="flex items-center gap-0 border border-gold/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 h-9 flex items-center justify-center text-sm font-medium text-foreground tabular-nums border-x border-gold/20">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-auto pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-gold to-gold-light text-noir font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gold/20 hover:shadow-gold/30 transition-shadow"
              >
                <ShoppingBag className="w-4 h-4" />
                Adicionar à Sacola
              </motion.button>

              <button
                onClick={handleViewDetails}
                className="w-full py-3 px-6 rounded-lg border border-gold/30 text-gold text-sm font-medium flex items-center justify-center gap-2 hover:bg-gold/10 transition-colors"
              >
                Ver Detalhes Completos
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
