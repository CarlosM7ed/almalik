"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ArrowRight, Heart, Truck, Sparkles, Loader2, Gift, Search, CreditCard, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 3.99;
const PROMO_CODE = "ALMALIK10";
const PROMO_DISCOUNT = 0.1;

interface CrossSellProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  olfactiveFamily: string;
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

/* ───── Free Shipping Progress Bar ───── */
function FreeShippingBar({ total }: { total: number }) {
  const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);
  const isFree = total >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-gold" />
          {isFree ? (
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-xs font-medium text-gold flex items-center gap-1"
            >
              🎉 Envio grátis!
            </motion.span>
          ) : (
            <span className="text-xs text-gold/80">
              Faltam <span className="font-bold text-gold">€{remaining.toFixed(2)}</span> para envio grátis
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary/30 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ───── Mini Order Timeline for Empty State ───── */
const timelineSteps = [
  { icon: Search, label: "Escolher" },
  { icon: ShoppingBag, label: "Adicionar" },
  { icon: CreditCard, label: "Finalizar" },
];

function MiniOrderTimeline() {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {timelineSteps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={step.label} className="flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-10 h-10 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-gold/50" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.15em] text-gold/40 font-medium">
                {step.label}
              </span>
            </motion.div>
            {i < timelineSteps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.55 + i * 0.15, duration: 0.4 }}
                className="w-8 h-[2px] mx-2 mt-[-14px] gold-dotted-line"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ───── Enhanced Empty State ───── */
function EmptyCartState({ onClose, onNavigate }: { onClose: () => void; onNavigate: (page: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-6 animate-float"
      >
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping" style={{ animationDuration: "3s" }} />
        <div className="w-24 h-24 rounded-full bg-secondary/20 border border-gold/20 flex items-center justify-center relative">
          <ShoppingBag className="w-10 h-10 text-gold/40" strokeWidth={1.5} />
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="font-serif text-xl text-foreground mb-2"
      >
        A sua sacola está vazia
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="text-sm text-muted-foreground mb-4 max-w-[240px]"
      >
        Explore a nossa coleção de perfumes exclusivos
      </motion.p>

      {/* Mini order timeline */}
      <MiniOrderTimeline />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex flex-col gap-3 w-full max-w-[240px]"
      >
        <Button
          onClick={() => { onClose(); onNavigate("catalog"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="w-full bg-gold text-noir hover:bg-gold-light font-semibold text-sm"
        >
          Explorar Catálogo
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button
          onClick={() => { onClose(); onNavigate("ai-sommelier"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          variant="outline"
          className="w-full border-gold/30 text-gold hover:bg-gold/10 hover:text-gold text-sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Falar com Sommelier
        </Button>
      </motion.div>
    </div>
  );
}

/* ───── Single Cart Item with hover remove, right-aligned price, gold separators ───── */
function CartItemRow({ item, index, isLast }: { item: ReturnType<typeof useStore.getState>["cart"][0]; index: number; isLast: boolean }) {
  const { updateQuantity, removeFromCart, toggleWishlist, isInWishlist } = useStore();
  const lineTotal = item.price * item.quantity;
  const inWishlist = isInWishlist(item.productId);

  const handleMoveToWishlist = () => {
    toggleWishlist(item.productId, item.name);
    removeFromCart(item.id);
    toast.success(`${item.name} movido para os favoritos`, {
      description: "Encontre seus favoritos em Minha Conta",
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30, scale: 1 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.25, ease: "easeIn", delay: index * 0.06 }}
      className="relative group/item"
    >
      <div className="flex gap-3 p-3 rounded-lg bg-secondary/10 border border-gold/10 border-l-2 border-l-gold/40">
        {/* 48x48 rounded product image */}
        <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gold/10">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <ShoppingBag className="w-5 h-5 text-gold/30" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium truncate text-foreground">{item.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                {item.olfactiveFamily && (
                  <p className="text-[10px] uppercase tracking-[0.15em] text-gold/50">
                    {item.olfactiveFamily}
                  </p>
                )}
                {item.size && (
                  <span className="inline-flex items-center text-[10px] text-gold/70 font-medium bg-gold/10 border border-gold/20 rounded px-1.5 py-0.5">
                    {item.size}
                  </span>
                )}
              </div>
            </div>

            {/* Right-aligned item subtotal */}
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-semibold text-gold tabular-nums">€{lineTotal.toFixed(2)}</span>
              {item.quantity > 1 && (
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  €{item.price.toFixed(2)} × {item.quantity}
                </p>
              )}
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-1.5 mt-2">
            {/* Quantity controls with gold border styling */}
            <div className="flex items-center border border-gold/20 rounded-full overflow-hidden">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
              >
                <Minus className="w-3 h-3" strokeWidth={2} />
              </button>
              <motion.span
                key={item.quantity}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="text-sm w-7 text-center font-medium tabular-nums text-gold"
              >
                {item.quantity}
              </motion.span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
              >
                <Plus className="w-3 h-3" strokeWidth={2} />
              </button>
            </div>

            {/* Move to wishlist */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMoveToWishlist}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                inWishlist
                  ? "text-gold bg-gold/10"
                  : "text-muted-foreground/40 hover:text-gold hover:bg-gold/5"
              }`}
              title="Mover para favoritos"
            >
              <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-gold" : ""}`} />
            </motion.button>
          </div>
        </div>

        {/* Hover-only X remove button at top-right corner */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            removeFromCart(item.id);
            toast.success("Item removido da sacola");
          }}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-charcoal border border-gold/20 flex flex-col items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all duration-200 hover:border-destructive/60 hover:bg-destructive/10 z-10 shadow-lg"
          title="Remover item"
        >
          <X className="w-3 h-3 text-muted-foreground group-hover/item:text-destructive transition-colors" />
        </motion.button>
        {/* "Remover" label on hover */}
        <span className="absolute -top-1.5 -right-10 text-[9px] uppercase tracking-wider text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap pt-1">
          Remover
        </span>
      </div>

      {/* Gold separator line between items */}
      {!isLast && (
        <div className="gold-line my-3" />
      )}
    </motion.div>
  );
}

/* ───── Cross-Sell Section ───── */
function CrossSellSection({ cartProductIds }: { cartProductIds: string[] }) {
  const { setSelectedProductSlug, setCurrentPage, setIsCartOpen, addToCart } = useStore();
  const [products, setProducts] = useState<CrossSellProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCrossSell = useCallback(async () => {
    if (cartProductIds.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/products?limit=5&isFeatured=true");
      const data = await res.json();
      const filtered = (data.products || [])
        .filter((p: CrossSellProduct) => !cartProductIds.includes(p.id))
        .slice(0, 4) as CrossSellProduct[];
      setProducts(filtered);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [cartProductIds]);

  useEffect(() => {
    fetchCrossSell();
  }, [fetchCrossSell]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 justify-center">
        <Loader2 className="w-4 h-4 text-gold/50 animate-spin" />
        <span className="text-xs text-muted-foreground">A carregar sugestões...</span>
      </div>
    );
  }

  if (products.length === 0) return null;

  const handleProductClick = (slug: string) => {
    setSelectedProductSlug(slug);
    setCurrentPage("product");
    setIsCartOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuickAdd = (e: React.MouseEvent, product: CrossSellProduct) => {
    e.stopPropagation();
    const productImage = product.imageUrl || familyImages[product.olfactiveFamily] || "/images/perfumes/golden-perfume.png";
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: productImage,
      olfactiveFamily: product.olfactiveFamily,
    });
    toast.success(`${product.name} adicionado à sacola`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-gold/70" />
        <h3 className="text-xs uppercase tracking-[0.2em] text-gold/70 font-medium">
          Talvez também goste
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2 -mx-1 px-1">
        {products.map((product) => {
          const productImage = product.imageUrl || familyImages[product.olfactiveFamily] || "/images/perfumes/golden-perfume.png";
          return (
            <motion.button
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleProductClick(product.slug)}
              className="flex-shrink-0 w-[130px] rounded-lg border border-gold/10 bg-secondary/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left overflow-hidden group/cross"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-cover opacity-70 group-hover/cross:opacity-90 group-hover/cross:scale-105 transition-all duration-500"
                />
              </div>
              <div className="p-2 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-gold/50 truncate">
                  {product.olfactiveFamily}
                </p>
                <h4 className="text-xs font-medium truncate text-foreground leading-tight">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-sm font-bold text-gold tabular-nums">€{product.price.toFixed(2)}</span>
                  <motion.span
                    onClick={(e) => handleQuickAdd(e, product)}
                    className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center opacity-0 group-hover/cross:opacity-100 transition-opacity"
                  >
                    <Plus className="w-3 h-3 text-gold" />
                  </motion.span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ───── Loyalty Progress Bar ───── */
const LOYALTY_TIER_THRESHOLD = 500;

function LoyaltyProgressBar({ points }: { points: number }) {
  const currentTierProgress = points % LOYALTY_TIER_THRESHOLD;
  const progressPercent = (currentTierProgress / LOYALTY_TIER_THRESHOLD) * 100;
  const nextTierPoints = LOYALTY_TIER_THRESHOLD - currentTierProgress;
  const currentTier = Math.floor(points / LOYALTY_TIER_THRESHOLD) + 1;
  const nextTier = currentTier + 1;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          Nível {currentTier} → Nível {nextTier}
        </span>
        <span className="text-[10px] text-gold/70">
          {nextTierPoints} pontos para o próximo nível
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary/30 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ───── Resumo Rápido Section with discount line ───── */
function QuickSummary({ total, itemCount, discount }: { total: number; itemCount: number; discount: number }) {
  const isFreeShipping = total >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_COST;
  const discountAmount = total * discount;
  const finalTotal = total + shippingCost - discountAmount;

  return (
    <div className="border-t border-gold/10 pt-4 space-y-2.5">
      {/* Items count */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "itens"} na sacola
        </span>
      </div>

      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="text-gold font-medium tabular-nums">€{total.toFixed(2)}</span>
      </div>

      {/* Discount line — only shown when promo is applied */}
      <AnimatePresence>
        {discount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex justify-between text-sm overflow-hidden"
          >
            <span className="text-green-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Desconto ({(discount * 100).toFixed(0)}%)
            </span>
            <span className="text-green-400 font-medium tabular-nums">-€{discountAmount.toFixed(2)}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shipping */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Envio estimado</span>
        {isFreeShipping ? (
          <span className="text-green-500 font-medium text-xs flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Grátis
          </span>
        ) : (
          <span className="text-destructive font-medium text-xs">€{SHIPPING_COST.toFixed(2)}</span>
        )}
      </div>

      <div className="gold-line" />

      {/* Total */}
      <div className="flex justify-between items-baseline pt-1">
        <span className="text-base font-medium">Total</span>
        <motion.span
          key={finalTotal}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-xl font-bold text-gold-gradient tabular-nums"
        >
          €{finalTotal.toFixed(2)}
        </motion.span>
      </div>
    </div>
  );
}

/* ───── Main CartSheet ───── */
export function CartSheet() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, cartCount, setCurrentPage } = useStore();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  const total = cartTotal();
  const itemCount = cartCount();
  const cartProductIds = cart.map((item) => item.productId);

  const handleApplyPromo = () => {
    const trimmed = promoCode.trim().toUpperCase();
    if (trimmed === PROMO_CODE) {
      setPromoApplied(true);
      setDiscount(PROMO_DISCOUNT);
      toast.success("Código promocional aplicado!", {
        description: "Desconto de 10% aplicado ao total.",
      });
    } else if (trimmed === "") {
      toast.error("Insira um código promocional");
    } else {
      toast.error("Código inválido", {
        description: "O código introduzido não é válido.",
      });
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(false);
    setDiscount(0);
    setPromoCode("");
    toast.info("Código promocional removido");
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setCurrentPage("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md bg-noir border-gold/20 text-foreground flex flex-col">
        {/* Luxury header with gold gradient border */}
        <div className="border-b border-gold/10 pb-2 mb-2">
          <div className="gold-line mb-4" />
          <SheetHeader>
            <SheetTitle className="font-serif text-xl text-gold-gradient flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-gold" />
              </div>
              Sacola de Compras
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="ml-auto text-xs font-medium text-gold bg-gold/10 border border-gold/20 rounded-full px-2.5 py-0.5"
                >
                  {itemCount}
                </motion.span>
              )}
            </SheetTitle>
          </SheetHeader>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1">
            <EmptyCartState
              onClose={() => setIsCartOpen(false)}
              onNavigate={(page) => setCurrentPage(page as ReturnType<typeof setCurrentPage>)}
            />
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Loyalty Points Banner */}
            {total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gold/5 border border-gold/20 rounded-lg p-3 mb-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span className="text-xs font-medium text-gold">
                    Você está a ganhar <span className="font-bold">{Math.round(total * 10)}</span> pontos com esta encomenda!
                  </span>
                </div>
                <LoyaltyProgressBar points={Math.round(total * 10)} />
                <p className="text-[10px] text-gold/40 mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Resgatar pontos — disponível em breve
                </p>
              </motion.div>
            )}

            {/* Free Shipping Progress Bar */}
            <div className="px-1 mb-3">
              <FreeShippingBar total={total} />
            </div>

            {/* Promo Code Input */}
            <div className="px-1 mb-3">
              {promoApplied ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-green-500/10 border border-green-500/20"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-green-500" />
                    </div>
                    <span className="text-xs font-medium text-green-400">{PROMO_CODE} — 10% de desconto</span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-[10px] text-muted-foreground hover:text-gold transition-colors underline"
                  >
                    Remover
                  </button>
                </motion.div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Gift className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold/50" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      placeholder="Código promocional"
                      className="w-full h-9 pl-8 pr-3 text-xs bg-secondary/20 border border-gold/20 rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 uppercase"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    className="h-9 px-3 rounded-lg border border-gold/30 text-gold/80 text-xs font-medium hover:bg-gold/10 hover:text-gold transition-colors whitespace-nowrap"
                  >
                    APLICAR
                  </button>
                </div>
              )}
            </div>

            {/* Cart Items with gold-line separators */}
            <div className="flex-1 overflow-y-auto py-1 min-h-0 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {cart.map((item, index) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    isLast={index === cart.length - 1}
                  />
                ))}
              </AnimatePresence>

              {/* Cross-sell */}
              {cart.length >= 1 && cart.length <= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="pt-3 border-t border-gold/10"
                >
                  <CrossSellSection cartProductIds={cartProductIds} />
                </motion.div>
              )}
            </div>

            {/* Resumo Rápido & Checkout */}
            <div className="flex-shrink-0 pb-4">
              <QuickSummary total={total} itemCount={itemCount} discount={discount} />
              {/* Continue Shopping Link */}
              <div className="flex items-center justify-center py-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentPage("catalog");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-sm text-gold hover:text-gold-light transition-colors flex items-center gap-1.5"
                >
                  Continue Comprando
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="gold-line" />
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gold text-noir hover:bg-gold-light font-semibold py-5 mt-3 btn-premium text-sm tracking-wider uppercase"
                >
                  Finalizar Compra
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
