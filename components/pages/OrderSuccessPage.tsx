"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ShoppingBag,
  Package,
  ArrowRight,
  User,
  Calendar,
  Clock,
  PackageSearch,
  Truck,
  Share2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { addBusinessDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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

interface SuggestedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  olfactiveFamily: string;
}

function ConfettiParticles() {
  const particles = useMemo(() => {
    const colors = ["#c9a96e", "#e8d5a3", "#8b6914", "#f0ece4", "#fff"];
    return Array.from({ length: 40 }).map((_, i) => {
      const size = Math.random() * 8 + 3;
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const duration = Math.random() * 2 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rotation = Math.random() * 360;
      return {
        id: i,
        size,
        left,
        delay,
        duration,
        color,
        rotation,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            y: -20,
            x: `${p.left}vw`,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            y: "100vh",
            opacity: [1, 1, 0],
            rotate: p.rotation + 720,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
          className="absolute top-0"
          style={{
            width: p.size,
            height: p.size * (Math.random() > 0.5 ? 1.5 : 0.6),
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

/* ───── Order Timeline ───── */
const ORDER_STEPS = [
  { label: "Pedido Recebido", icon: Package, daysOffset: 0 },
  { label: "A preparar", icon: PackageSearch, daysOffset: 1 },
  { label: "Em transporte", icon: Truck, daysOffset: 2 },
  { label: "Entregue", icon: CheckCircle2, daysOffset: 4 },
];

function OrderTimeline() {
  const stepDates = useMemo(() => {
    return ORDER_STEPS.map((step) => {
      const date = addBusinessDays(new Date(), step.daysOffset);
      return format(date, "dd MMM", { locale: ptBR });
    });
  }, []);

  return (
    <div className="p-6 sm:p-8 rounded-xl border border-gold/20 bg-secondary/5">
      <h3 className="font-serif text-lg font-semibold text-gold-gradient mb-6">
        Estado do Pedido
      </h3>
      <div className="relative">
        {/* Vertical connecting line */}
        <div className="absolute left-[18px] top-6 bottom-6 w-[2px] bg-gold/10" />
        <motion.div
          className="absolute left-[18px] top-6 w-[2px] bg-gradient-to-b from-gold to-gold/30"
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
        />

        <div className="space-y-6">
          {ORDER_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isCompleted = i === 0;
            const isCurrent = i === 0;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + i * 0.2, duration: 0.4 }}
                className="flex items-start gap-4 relative"
              >
                {/* Step circle */}
                <div
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                    isCompleted
                      ? "bg-gold border-gold"
                      : "bg-noir border-gold/20"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-noir" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isCurrent ? "text-gold" : "text-muted-foreground/40"}`} />
                  )}
                  {/* Animated pulse for current step */}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-gold/30"
                    />
                  )}
                </div>
                {/* Step info */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${isCompleted ? "text-gold" : "text-muted-foreground/50"}`}>
                      {isCompleted && <span>✅ </span>}
                      {step.label}
                    </p>
                    <span className={`text-[11px] flex items-center gap-1 ${isCompleted ? "text-gold/60" : "text-muted-foreground/30"}`}>
                      <Clock className="w-3 h-3" />
                      {stepDates[i]}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───── Share Button ───── */
function ShareOrderButton() {
  const { lastOrderId, lastOrderItems, lastOrderTotal } = useStore();

  const handleShare = async () => {
    const orderNumber = lastOrderId ? lastOrderId.slice(-8).toUpperCase() : "N/A";
    const itemsList = lastOrderItems
      .map((item) => `  • ${item.name} (x${item.quantity}) — €${(item.price * item.quantity).toFixed(2)}`)
      .join("\n");

    const summary = `🎁 Acabei de fazer uma encomenda na Alma Lik!\n\nPedido #${orderNumber}\nTotal: €${lastOrderTotal.toFixed(2)}\n\n${itemsList}\n\nDescubra fragrâncias exclusivas em almalik.pt ✨`;

    try {
      await navigator.clipboard.writeText(summary);
      toast.success("Resumo copiado!", {
        description: "Pode colar e partilhar com os seus amigos.",
      });
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gold/20 bg-gold/5 text-gold/80 text-sm font-medium hover:bg-gold/10 hover:text-gold transition-colors"
    >
      <Share2 className="w-4 h-4" />
      Partilhar com amigos
    </motion.button>
  );
}

/* ───── Product Suggestions ───── */
function ProductSuggestions() {
  const { setSelectedProductSlug, setCurrentPage } = useStore();
  const [products, setProducts] = useState<SuggestedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch("/api/products?limit=8&isFeatured=true");
      const data = await res.json();
      const shuffled = (data.products || [])
        .sort(() => Math.random() - 0.5)
        .slice(0, 4) as SuggestedProduct[];
      setProducts(shuffled);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleProductClick = (slug: string) => {
    setSelectedProductSlug(slug);
    setCurrentPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 justify-center">
        <Loader2 className="w-5 h-5 text-gold/50 animate-spin" />
        <span className="text-sm text-muted-foreground">A carregar sugestões...</span>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="pt-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-semibold text-gold-gradient flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Talvez também goste
        </h3>
        <Button
          onClick={() => setCurrentPage("catalog")}
          variant="outline"
          size="sm"
          className="border-gold/20 text-gold/60 hover:bg-gold/10 hover:text-gold text-xs"
        >
          Ver Catálogo
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-3 -mx-1 px-1">
        {products.map((product, i) => {
          const productImage = product.imageUrl || familyImages[product.olfactiveFamily] || "/images/perfumes/golden-perfume.png";
          return (
            <motion.button
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleProductClick(product.slug)}
              className="flex-shrink-0 w-[150px] sm:w-[170px] rounded-xl border border-gold/10 bg-secondary/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left overflow-hidden group/suggest"
            >
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-cover opacity-70 group-hover/suggest:opacity-90 group-hover/suggest:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/40 to-transparent" />
              </div>
              <div className="p-3 space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-gold/50 truncate">
                  {product.olfactiveFamily}
                </p>
                <h4 className="text-sm font-medium truncate text-foreground leading-tight">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-bold text-gold tabular-nums">€{product.price.toFixed(2)}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export function OrderSuccessPage() {
  const { lastOrderId, lastOrderItems, lastOrderTotal, setCurrentPage } =
    useStore();

  const orderNumber = lastOrderId ? lastOrderId.slice(-8).toUpperCase() : "N/A";

  const estimatedDelivery = useMemo(() => {
    const minDate = addBusinessDays(new Date(), 3);
    const maxDate = addBusinessDays(new Date(), 5);
    return {
      min: format(minDate, "dd 'de' MMMM", { locale: ptBR }),
      max: format(maxDate, "dd 'de' MMMM", { locale: ptBR }),
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      <ConfettiParticles />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          {/* Animated Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="relative inline-flex"
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
              className="w-24 h-24 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center"
            >
              <CheckCircle2 className="w-14 h-14 text-gold" />
            </motion.div>
            {/* Pulse ring */}
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeOut",
              }}
              className="absolute inset-0 w-24 h-24 rounded-full border-2 border-gold"
            />
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">
              Pedido Confirmado!
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Obrigado por escolher a Alma Lik
            </p>
          </motion.div>

          {/* Gold line divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.7 }}
            className="gold-line max-w-xs mx-auto"
          />

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-6 sm:p-8 rounded-xl border border-gold/20 bg-secondary/5 space-y-5 text-left"
          >
            {/* Order Number */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gold/5 border border-gold/10">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Número do Pedido
                  </p>
                  <p className="text-lg font-bold text-gold font-mono">
                    #{orderNumber}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total
                </p>
                <p className="text-lg font-bold text-gold-gradient">
                  €{lastOrderTotal.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/20">
              <Calendar className="w-5 h-5 text-gold flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Entrega Estimada</p>
                <p className="text-xs text-muted-foreground">
                  {estimatedDelivery.min} — {estimatedDelivery.max}
                </p>
              </div>
            </div>

            <Separator className="bg-gold/10" />

            {/* Order Items */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Itens do Pedido
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {lastOrderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-secondary/10"
                  >
                    <div className="w-10 h-10 rounded-md bg-secondary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-gold/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qtd: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gold">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Gold line divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1 }}
            className="gold-line max-w-xs mx-auto"
          />

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
          >
            <Button
              onClick={() => setCurrentPage("home")}
              className="bg-gold text-noir hover:bg-gold-light font-semibold px-8 py-5"
            >
              Continuar Comprando
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => setCurrentPage("my-account")}
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10 px-8 py-5"
            >
              <User className="w-4 h-4 mr-2" />
              Acompanhar Pedido
            </Button>
          </motion.div>

          {/* Share Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center"
          >
            <ShareOrderButton />
          </motion.div>

          {/* Trust message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="text-xs text-muted-foreground/60 pt-2"
          >
            Receberá um email de confirmação com os detalhes do seu pedido.
          </motion.p>
        </motion.div>

        {/* Order Timeline */}
        <div className="mt-8">
          <OrderTimeline />
        </div>

        {/* Product Suggestions */}
        <ProductSuggestions />
      </div>
    </div>
  );
}
