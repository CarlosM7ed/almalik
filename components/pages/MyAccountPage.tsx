"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  Heart,
  Clock,
  Settings,
  LogIn,
  Package,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Hash,
  Crown,
  Gift,
  Star,
  TrendingUp,
  Users,
  Award,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  Lock,
  Sparkles,
  Truck,
  PartyPopper,
  MapPin,
  Building,
  Plus,
  Pencil,
  Trash2,
  ChevronRight as ChevronRightIcon,
  LogOut,
  Gem,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProductCard } from "@/components/products/ProductCard";
import { useStore } from "@/lib/store";
import { useEffect, useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
  paymentMethod: string;
  country: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pendente",
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  confirmed: {
    label: "Confirmado",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  shipped: {
    label: "Enviado",
    className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  delivered: {
    label: "Entregue",
    className: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

const menuItems = [
  { icon: Package, title: "Encomendas", desc: "Acompanhe seus pedidos" },
  { icon: Heart, title: "Favoritos", desc: "Seus perfumes preferidos" },
  { icon: Settings, title: "Definições", desc: "Gerir sua conta" },
  { icon: LogOut, title: "Sair", desc: "Terminar sessão" },
];

const SAVED_ADDRESSES = [
  {
    id: "casa",
    label: "Casa",
    address: "Rua das Flores, 123, 1200-123 Lisboa, Portugal",
    icon: MapPin,
    isPrimary: true,
  },
  {
    id: "escritorio",
    label: "Escritório",
    address: "Av. da Liberdade, 456, 1250-456 Lisboa, Portugal",
    icon: Building,
    isPrimary: false,
  },
];

const LOYALTY_BENEFITS = [
  { title: "10% de desconto", points: 200, icon: Star, description: "Na próxima compra" },
  { title: "Envio premium gratuito", points: 300, icon: Truck, description: "Entrega expressa" },
  { title: "Acesso antecipado a novas fragrâncias", points: 400, icon: Sparkles, description: "Antes de todos" },
  { title: "Presente de aniversário exclusivo", points: 500, icon: PartyPopper, description: "Surpresa especial" },
];

const EARN_ACTIVITIES = [
  { icon: ShoppingBag, title: "Compra de perfume", points: "1 ponto por cada €1 gasto" },
  { icon: Star, title: "Avaliação de produto", points: "15 pontos por avaliação" },
  { icon: Users, title: "Indicação de amigo", points: "50 pontos por indicação" },
  { icon: Gift, title: "Primeira compra", points: "100 pontos bónus" },
];

const REDEEMABLE_REWARDS = [
  { id: "discount-10", title: "10% de desconto na próxima compra", cost: 200 },
  { id: "free-shipping", title: "Envio premium gratuito", cost: 300 },
];

const initialHistory = [
  { action: "Compra Fakhar Rose", points: 45, date: "2026-04-05" },
  { action: "Avaliação do produto", points: 15, date: "2026-04-04" },
  { action: "Primeira compra bónus", points: 100, date: "2026-04-01" },
  { action: "Resgate: 10% desconto", points: -200, date: "2026-03-28" },
];

// Tier configuration for the Loyalty Program Dashboard
const TIER_CONFIG = [
  { name: "Bronze", min: 0, max: 499, icon: Award, color: "text-amber-600" },
  { name: "Prata", min: 500, max: 1499, icon: Award, color: "text-silver" },
  { name: "Ouro", min: 1500, max: Infinity, icon: Crown, color: "text-gold" },
];

// Benefits preview for the dashboard
const DASHBOARD_BENEFITS = [
  { icon: Gem, text: "10 pontos por €1 gasto" },
  { icon: Truck, text: "Envio grátis no nível Prata" },
  { icon: Sparkles, text: "Acesso antecipado a novidades" },
];

// Family-based gradients for wishlist images
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

export function MyAccountPage() {
  const {
    setCurrentPage,
    cartCount,
    wishlist,
    recentlyViewed,
    addToCart,
    toggleWishlist,
    setSelectedProductSlug,
    user,
    setUser,
  } = useStore();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const recentlyViewedRef = useRef<HTMLDivElement>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Loyalty state
  const loyaltyPoints = 250;
  const [loyaltyHistory, setLoyaltyHistory] = useState(initialHistory);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(loyaltyPoints);

  // Determine current tier and next tier
  const currentTier = TIER_CONFIG.find(
    (t) => loyaltyPoints >= t.min && loyaltyPoints <= t.max
  ) || TIER_CONFIG[0];
  const nextTier = TIER_CONFIG[TIER_CONFIG.indexOf(currentTier) + 1];
  const pointsToNext = nextTier ? nextTier.min - loyaltyPoints : 0;
  const tierProgress = nextTier
    ? ((loyaltyPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const handleRedeemReward = (reward: (typeof REDEEMABLE_REWARDS)[number]) => {
    if (currentPoints < reward.cost) {
      toast.error("Pontos insuficientes para resgatar este prémio.");
      return;
    }
    setCurrentPoints((prev) => prev - reward.cost);
    setLoyaltyHistory((prev) => [
      {
        action: `Resgate: ${reward.title}`,
        points: -reward.cost,
        date: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
    setRedeemDialogOpen(false);
    toast.success("Prémio resgatado com sucesso!");
  };

  const handleAddToCartFromWishlist = useCallback(
    (product: Product) => {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        olfactiveFamily: product.olfactiveFamily,
      });
      toast.success(`${product.name} adicionado à sacola`);
    },
    [addToCart]
  );

  const handleMoveAllToCart = useCallback(() => {
    const products = allProducts.filter((p) => wishlist.includes(p.id));
    products.forEach((product) => {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        olfactiveFamily: product.olfactiveFamily,
      });
    });
    toast.success(`${products.length} ${products.length === 1 ? "item adicionado" : "itens adicionados"} à sacola`);
  }, [allProducts, wishlist, addToCart]);

  const scrollRecentlyViewed = (direction: "left" | "right") => {
    if (recentlyViewedRef.current) {
      const scrollAmount = 280;
      recentlyViewedRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?limit=100");
        const data = await res.json();
        setAllProducts(data.products || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders?limit=20");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setOrdersLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Credenciais inválidas");
      setUser(data.user);
      setLoginDialogOpen(false);
      setLoginEmail("");
      setLoginPassword("");
      setLoginName("");
      toast.success(`Bem-vindo, ${data.user.name}!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      toast.error(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim() || !loginEmail.trim() || !loginPassword.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (loginName.trim().length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres");
      return;
    }
    if (loginPassword.length < 6) {
      toast.error("Palavra-passe deve ter pelo menos 6 caracteres");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: loginName.trim(), email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar conta");
      setUser(data.user);
      setLoginDialogOpen(false);
      setLoginEmail("");
      setLoginPassword("");
      setLoginName("");
      toast.success("Conta criada com sucesso!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar conta";
      toast.error(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    toast.success("Sessão terminada");
    setCurrentPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const wishlistProducts = allProducts.filter((p) => wishlist.includes(p.id));
  const recentlyViewedProducts = allProducts
    .filter((p) => recentlyViewed.includes(p.slug))
    .slice(0, 10);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const CurrentTierIcon = currentTier.icon;

  return (
    <>
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="bg-secondary/10 border-b border-gold/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-gold/60" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">
              {user ? `Olá, ${user.name}!` : "Bem-vindo!"}
            </h1>
            <p className="text-muted-foreground">
              {user ? user.email : "A sua conta Alma Lik"}
            </p>
            {!user && (
              <Button
                onClick={() => {
                  setIsRegisterMode(false);
                  setLoginDialogOpen(true);
                }}
                className="bg-gold text-noir hover:bg-gold-light mt-2"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}
            <div className="gold-line max-w-xs mx-auto mt-2" />
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* =============================== */}
        {/* NEW: Loyalty Program Dashboard */}
        {/* =============================== */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10"
        >
          <div className="luxury-section rounded-2xl border border-gold/15 overflow-hidden">
            {/* Points Balance Card */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-br from-gold/8 via-transparent to-gold/5">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Left: Crown icon + Points */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-gold" />
                  </div>
                  <div>
                    <p className="text-4xl sm:text-5xl font-bold text-gold-gradient tabular-nums">
                      {currentPoints}
                    </p>
                    <p className="text-sm text-muted-foreground tracking-wider uppercase mt-1">
                      Pontos de Fidelidade
                    </p>
                  </div>
                </div>

                {/* Right: Current Tier Badge */}
                <div className="flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-xl px-4 py-2.5">
                  <CurrentTierIcon className={`w-5 h-5 ${currentTier.color}`} />
                  <span className="text-sm font-semibold text-gold">
                    Nível {currentTier.name}
                  </span>
                </div>
              </div>

              {/* Tier Progress */}
              {nextTier && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">
                      Faltam{" "}
                      <span className="text-gold font-semibold">{pointsToNext}</span>{" "}
                      pontos para{" "}
                      <span className="text-gold font-semibold">
                        Nível {nextTier.name}
                      </span>
                    </p>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {currentPoints}/{nextTier.min}
                    </span>
                  </div>

                  {/* Tier markers */}
                  <div className="relative">
                    <div className="w-full h-3 rounded-full bg-secondary/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(tierProgress, 100)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-gold/60 via-gold to-gold-light"
                      />
                    </div>
                    {/* Tier milestone markers */}
                    <div className="flex justify-between mt-1.5 px-0.5">
                      <span className="text-[10px] text-muted-foreground/60">0</span>
                      <span className="text-[10px] text-muted-foreground/60">500</span>
                      <span className="text-[10px] text-muted-foreground/60">1500+</span>
                    </div>
                    <div className="flex justify-between mt-0.5 px-0.5">
                      <span className="text-[10px] text-amber-600/60 font-medium">Bronze</span>
                      <span className="text-[10px] text-silver/60 font-medium">Prata</span>
                      <span className="text-[10px] text-gold/60 font-medium">Ouro</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits Preview */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DASHBOARD_BENEFITS.map((benefit, i) => {
                  const BenefitIcon = benefit.icon;
                  return (
                    <motion.div
                      key={benefit.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="card-luxury rounded-xl p-4 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center flex-shrink-0">
                        <BenefitIcon className="w-4 h-4 text-gold" />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
                        {benefit.text}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          <div className="p-6 rounded-xl border border-gold/10 bg-secondary/5 text-center">
            <p className="text-3xl font-bold text-gold-gradient">{cartCount()}</p>
            <p className="text-sm text-muted-foreground mt-1">Na Sacola</p>
          </div>
          <div className="p-6 rounded-xl border border-gold/10 bg-secondary/5 text-center">
            <p className="text-3xl font-bold text-gold-gradient">{wishlist.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Favoritos</p>
          </div>
          <div className="p-6 rounded-xl border border-gold/10 bg-secondary/5 text-center">
            <p className="text-3xl font-bold text-gold-gradient">{orders.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Pedidos</p>
          </div>
        </motion.div>

        <div className="gold-line mb-10" />

        {/* Loyalty Rewards Section (detailed) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="luxury-section rounded-2xl p-6 sm:p-8 mb-10 border border-gold/10"
        >
          {/* Section Header */}
          <div className="text-center mb-8">
            <div className="ornament-diamond mb-4">
              <span className="ornament-diamond-icon">◆</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient">
              Programa de Fidelidade
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Acumule pontos e desbloqueie benefícios exclusivos
            </p>
          </div>

          {/* Points Summary + Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Points Display */}
            <motion.div
              whileInView={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.95 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-gold/15 bg-secondary/5 p-6 text-center"
            >
              <p className="text-5xl sm:text-6xl font-bold text-gold-gradient mb-2 tabular-nums">
                {currentPoints}
              </p>
              <p className="text-sm text-muted-foreground tracking-wider uppercase">
                Pontos acumulados
              </p>
              <Button
                onClick={() => setRedeemDialogOpen(true)}
                className="mt-6 bg-gradient-to-r from-gold to-gold-light text-noir hover:opacity-90 font-semibold"
              >
                <Gift className="w-4 h-4 mr-2" />
                Resgatar Pontos
              </Button>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 15 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <p className="text-sm font-semibold text-foreground/80 mb-3">Benefícios Disponíveis</p>
              {LOYALTY_BENEFITS.map((benefit, i) => {
                const isActive = currentPoints >= benefit.points;
                const BenefitIcon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      isActive
                        ? "border-gold/30 bg-gold/5"
                        : "border-gold/10 bg-secondary/5"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? "bg-gold/15" : "bg-secondary/20"
                      }`}
                    >
                      {isActive ? (
                        <BenefitIcon className="w-4 h-4 text-gold" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-gold" : "text-muted-foreground/60"
                        }`}
                      >
                        {benefit.title}
                      </p>
                      <p className="text-xs text-muted-foreground/50">
                        {benefit.description}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        isActive ? "text-gold" : "text-muted-foreground/40"
                      }`}
                    >
                      {benefit.points} pts
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Earn Points Section */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 15 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gold" />
              <p className="text-sm font-semibold text-foreground/80">Como Ganhar Pontos</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EARN_ACTIVITIES.map((activity, i) => {
                const ActivityIcon = activity.icon;
                return (
                  <motion.div
                    key={activity.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gold/10 bg-secondary/5 hover:border-gold/20 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/15 flex items-center justify-center flex-shrink-0">
                      <ActivityIcon className="w-4 h-4 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-gold/70">{activity.points}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Points History */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 15 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gold" />
              <p className="text-sm font-semibold text-foreground/80">Últimos Movimentos</p>
            </div>
            <div className="rounded-xl border border-gold/10 overflow-hidden">
              <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-secondary/10 border-b border-gold/10">
                <span className="text-xs text-muted-foreground font-medium">Atividade</span>
                <span className="text-xs text-muted-foreground font-medium text-center">Pontos</span>
                <span className="text-xs text-muted-foreground font-medium text-right">Data</span>
              </div>
              <div className="divide-y divide-gold/5">
                {loyaltyHistory.map((entry, i) => (
                  <motion.div
                    key={`${entry.action}-${entry.date}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-3 gap-2 px-4 py-3 items-center hover:bg-secondary/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {entry.points > 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      )}
                      <span className="text-sm truncate">{entry.action}</span>
                    </div>
                    <p className="text-sm font-semibold text-center">
                      <span
                        className={
                          entry.points > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {entry.points > 0 ? "+" : ""}
                        {entry.points}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground text-right">
                      {format(new Date(entry.date), "dd MMM yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Redeem Dialog */}
          <AnimatePresence>
            {redeemDialogOpen && (
              <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
                <DialogContent className="sm:max-w-md bg-charcoal border-gold/20 rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-xl text-gold-gradient flex items-center gap-2">
                      <Gift className="w-5 h-5 text-gold" />
                      Resgatar Pontos
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Escolha um prémio para resgatar com os seus {currentPoints} pontos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    {REDEEMABLE_REWARDS.map((reward) => {
                      const canAfford = currentPoints >= reward.cost;
                      return (
                        <div
                          key={reward.id}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                            canAfford
                              ? "border-gold/20 bg-gold/5 hover:border-gold/30"
                              : "border-gold/10 bg-secondary/5 opacity-50"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${canAfford ? "text-foreground" : "text-muted-foreground"}`}>
                              {reward.title}
                            </p>
                            <p className="text-xs text-gold/70 mt-0.5">{reward.cost} pontos</p>
                          </div>
                          <Button
                            size="sm"
                            disabled={!canAfford}
                            onClick={() => handleRedeemReward(reward)}
                            className={`ml-3 flex-shrink-0 ${
                              canAfford
                                ? "bg-gradient-to-r from-gold to-gold-light text-noir hover:opacity-90"
                                : ""
                            }`}
                          >
                            Resgatar
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="gold-line mb-10" />

        {/* Address Book Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-gold-gradient">
                Moradas Guardadas
              </h2>
              <p className="text-xs text-muted-foreground">
                {SAVED_ADDRESSES.length} morada{SAVED_ADDRESSES.length !== 1 ? "s" : ""} guardada{SAVED_ADDRESSES.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {SAVED_ADDRESSES.map((addr, i) => {
              const AddrIcon = addr.icon;
              return (
                <motion.div
                  key={addr.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.08 }}
                  className="card-luxury rounded-xl p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AddrIcon className="w-4 h-4 text-gold" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold">{addr.label}</h3>
                          {addr.isPrimary && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-medium">
                              Morada principal
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {addr.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-gold hover:bg-gold/10 transition-colors"
                        aria-label="Editar morada"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        aria-label="Eliminar morada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full mt-4 py-3 rounded-xl border border-gold/20 bg-transparent text-gold hover:bg-gold/5 hover:border-gold/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar Morada
          </motion.button>
        </motion.section>

        <div className="gold-line mb-10" />

        {/* =============================== */}
        {/* ENHANCED: Wishlist Section */}
        {/* =============================== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-semibold text-gold-gradient">
                  Meus Favoritos
                </h2>
                <p className="text-xs text-muted-foreground">
                  {wishlist.length === 0
                    ? "Nenhum favorito ainda"
                    : `${wishlist.length} ${wishlist.length === 1 ? "fragrância salva" : "fragrâncias salvas"}`}
                </p>
              </div>
            </div>

            {wishlistProducts.length > 0 && (
              <Button
                onClick={handleMoveAllToCart}
                variant="outline"
                size="sm"
                className="border-gold/30 text-gold hover:bg-gold/10 text-xs sm:text-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                Mover Todos
              </Button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gold/10 bg-secondary/5 overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-secondary/20" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-secondary/20" />
                    <div className="h-3 w-1/2 rounded bg-secondary/15" />
                    <div className="h-8 w-full rounded-lg bg-secondary/15 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : wishlistProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 rounded-xl border border-dashed border-gold/15 bg-secondary/5"
            >
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-5">
                <Heart className="w-8 h-8 text-gold/30" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground/80 mb-2">
                Adicione perfumes aos favoritos
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                Explore nosso catálogo e toque no coração para salvar suas fragrâncias
                preferidas.
              </p>
              <Button
                onClick={() => setCurrentPage("catalog")}
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                Explorar Catálogo
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {wishlistProducts.map((product, i) => {
                  const bgGradient =
                    familyColors[product.olfactiveFamily] ||
                    "from-gray-900/30 to-gray-800/20";
                  const productImage =
                    product.imageUrl ||
                    familyImages[product.olfactiveFamily] ||
                    "/images/perfumes/golden-perfume.png";

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85, y: -10 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="card-luxury rounded-xl overflow-hidden group"
                    >
                      {/* Product Image */}
                      <div
                        className={`aspect-[4/3] relative bg-gradient-to-br ${bgGradient} cursor-pointer`}
                        onClick={() => {
                          setSelectedProductSlug(product.slug);
                          setCurrentPage("product");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-transparent" />

                        {/* Remove button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id, product.name);
                          }}
                          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-noir/60 backdrop-blur-sm flex items-center justify-center text-muted-foreground/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </motion.button>

                        {/* Badges */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-noir/70 backdrop-blur-sm text-[10px] uppercase tracking-wider text-gold/80 rounded-sm border border-gold/15">
                            {product.olfactiveFamily}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-serif text-sm font-medium leading-tight line-clamp-1 group-hover:text-gold transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-lg font-bold text-gold-gradient mt-1 tabular-nums">
                            €{product.price.toFixed(2)}
                          </p>
                        </div>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCartFromWishlist(product);
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full border-gold/30 text-gold hover:bg-gold/10 text-xs"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                          Adicionar à Sacola
                        </Button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProductSlug(product.slug);
                            setCurrentPage("product");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors py-1"
                        >
                          Ver Detalhes
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        <div className="gold-line mb-10" />

        {/* =============================== */}
        {/* NEW: Recently Viewed Section */}
        {/* =============================== */}
        {recentlyViewedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-gold-gradient">
                    Vistos Recentemente
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {recentlyViewedProducts.length} {recentlyViewedProducts.length === 1 ? "produto visto" : "produtos vistos"}
                  </p>
                </div>
              </div>

              {/* Scroll arrows */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => scrollRecentlyViewed("left")}
                  className="w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/40 hover:bg-gold/5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollRecentlyViewed("right")}
                  className="w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/40 hover:bg-gold/5 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={recentlyViewedRef}
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {recentlyViewedProducts.map((product, i) => (
                <div key={product.id} className="flex-shrink-0 w-[200px] sm:w-[220px]">
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {recentlyViewedProducts.length > 0 && <div className="gold-line mb-10" />}

        {/* Order Tracking Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-gold-gradient">
                Meus Pedidos
              </h2>
              <p className="text-xs text-muted-foreground">
                {orders.length === 0
                  ? "Nenhum pedido ainda"
                  : `${orders.length} ${orders.length === 1 ? "pedido realizado" : "pedidos realizados"}`}
              </p>
            </div>
          </div>

          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl border border-gold/10 bg-secondary/5 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded bg-secondary/30" />
                      <div className="h-3 w-40 rounded bg-secondary/20" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-secondary/30" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-gold/15 bg-secondary/5">
              <Package className="w-10 h-10 text-gold/20 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Nenhum pedido ainda</p>
              <p className="text-xs text-muted-foreground/70 mb-4">
                Explore nosso catálogo e encontre a fragrância perfeita para você.
              </p>
              <Button
                onClick={() => setCurrentPage("catalog")}
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                Explorar Catálogo
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {orders.map((order, i) => {
                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const isExpanded = expandedOrder === order.id;
                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-gold/10 bg-secondary/5 overflow-hidden"
                  >
                    {/* Order Header */}
                    <button
                      onClick={() => toggleOrderExpand(order.id)}
                      className="w-full p-5 flex items-center justify-between hover:bg-secondary/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-gold/60" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold flex items-center gap-1">
                              <Hash className="w-3 h-3 text-muted-foreground" />
                              #{order.id.slice(-8).toUpperCase()}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0 ${statusConfig.className}`}
                            >
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(order.createdAt), "dd MMM yyyy", {
                                locale: ptBR,
                              })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {totalItems} {totalItems === 1 ? "item" : "itens"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gold">
                          €{order.total.toFixed(2)}
                        </span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <Separator className="bg-gold/10" />
                        <div className="p-5 space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2 rounded-lg bg-secondary/10"
                            >
                              <div className="w-10 h-10 rounded-md bg-secondary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {item.product?.imageUrl ? (
                                  <img
                                    src={item.product.imageUrl}
                                    alt={item.product?.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ShoppingBag className="w-4 h-4 text-gold/30" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {item.product?.name || "Produto"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Qtd: {item.quantity} × €{item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-gold">
                                €{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}

                          {/* Order metadata */}
                          <div className="pt-2 space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Pagamento</span>
                              <span>{order.paymentMethod || "Pagamento na Entrega"}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>País</span>
                              <span>{order.country === "ES" ? "🇪🇸 Espanha" : "🇵🇹 Portugal"}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        <div className="gold-line mb-10" />

        {/* Menu Items */}
        <div className="space-y-3 mb-10">
          {menuItems.map((item, i) => {
            const handleClick = () => {
              if (item.title === "Sair") {
                handleLogout();
                return;
              } else if (item.title === "Encomendas") {
                const el = document.getElementById("orders-section");
                el?.scrollIntoView({ behavior: "smooth" });
              } else if (item.title === "Favoritos") {
                const el = document.getElementById("wishlist-section");
                el?.scrollIntoView({ behavior: "smooth" });
              } else if (item.title === "Definições") {
                const el = document.getElementById("settings-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }
            };
            return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="card-luxury rounded-xl p-4 flex items-center gap-4 cursor-pointer group"
              onClick={handleClick}
            >
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                <item.icon className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-gold/30 group-hover:text-gold/60 transition-colors" />
            </motion.div>
            );
          })}
        </div>

        {/* Login Prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl border border-gold/10 bg-gold/5 text-center space-y-3"
        >
          <LogIn className="w-8 h-8 text-gold mx-auto" />
          <h3 className="font-serif text-lg font-semibold text-gold-gradient">
            Acesse Sua Conta
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Entre ou registe-se para acompanhar pedidos, salvar favoritos e receber
            ofertas exclusivas.
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <Button
              onClick={() => {
                setIsRegisterMode(false);
                setLoginDialogOpen(true);
              }}
              className="bg-gold text-noir hover:bg-gold-light"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsRegisterMode(true);
                setLoginDialogOpen(true);
              }}
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              Criar Conta
            </Button>
          </div>
        </motion.div>
      </div>
    </div>

    {/* Login / Register Dialog */}
    <Dialog open={loginDialogOpen} onOpenChange={(open) => {
      setLoginDialogOpen(open);
      if (!open) {
        setLoginEmail("");
        setLoginPassword("");
        setLoginName("");
      }
    }}>
      <DialogContent className="sm:max-w-md bg-charcoal border-gold/20 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-gold-gradient flex items-center gap-2">
            <LogIn className="w-5 h-5 text-gold" />
            {isRegisterMode ? "Criar Conta" : "Entrar"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isRegisterMode
              ? "Registe-se para aceder a todos os benefícios"
              : "Aceda à sua conta Alma Lik"}
          </DialogDescription>
        </DialogHeader>
        {isRegisterMode ? (
          <form onSubmit={handleRegister} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="reg-name" className="text-label">Nome</Label>
              <Input
                id="reg-name"
                placeholder="Seu nome"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="bg-secondary/10 border-gold/20 focus:border-gold"
                disabled={loginLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-label">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="seu@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-secondary/10 border-gold/20 focus:border-gold"
                disabled={loginLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-label">Palavra-passe</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="bg-secondary/10 border-gold/20 focus:border-gold"
                disabled={loginLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-gold to-gold-light text-noir font-semibold hover:from-gold-dark hover:to-gold transition-all"
            >
              {loginLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-noir/30 border-t-noir rounded-full animate-spin" />
                  A criar...
                </span>
              ) : (
                "Criar Conta"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Já tem conta?{" "}
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="text-gold hover:text-gold-light underline underline-offset-2"
              >
                Entrar
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-label">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-secondary/10 border-gold/20 focus:border-gold"
                disabled={loginLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-label">Palavra-passe</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="bg-secondary/10 border-gold/20 focus:border-gold"
                disabled={loginLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-gold to-gold-light text-noir font-semibold hover:from-gold-dark hover:to-gold transition-all"
            >
              {loginLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-noir/30 border-t-noir rounded-full animate-spin" />
                  A entrar...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Entrar
                </span>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Não tem conta?{" "}
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="text-gold hover:text-gold-light underline underline-offset-2"
              >
                Criar Conta
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
