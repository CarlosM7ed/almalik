"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Filter,
  DollarSign,
  Package,
  TrendingUp,
  ShoppingBag,
  Users,
  BarChart3,
  Wallet,
  HandCoins,
  Bell,
  LogOut,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  CircleDollarSign,
  TrendingDown,
  Gift,
  CreditCard,
  Building,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */

interface BalanceData {
  totalStockValue: number;
  totalRetailValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalRevenue: number;
  pendingRevenue: number;
  cancelledRevenue: number;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  averageTicket: number;
  totalCommissionsPaid: number;
  totalCommissionsPending: number;
  totalCommissions: number;
  activeAffiliates: number;
  totalAffiliates: number;
  affiliateRevenue: number;
  totalCosts: number;
  netProfit: number;
  amountsToReceive: number;
  amountsToPay: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
    affiliateRef?: string | null;
  }>;
  topProducts: Array<{
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
}

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  costPrice: number;
  stock: number;
  category: string;
  gender: string;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  imageUrl: string;
}

interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  affiliateRef?: string | null;
  items: Array<{ id: string; quantity: number; price: number }>;
}

interface RevenueData {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

interface Affiliate {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  commissionRate: number;
  totalSales: number;
  balance: number;
  isActive: boolean;
  _count?: {
    commissions: number;
    withdrawals: number;
  };
}

interface FinancialStats {
  grossRevenue: number;
  totalCosts: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  netProfit: number;
  totalOrders: number;
  directOrders: number;
  affiliateOrders: number;
  affiliateRevenue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  activeAffiliates: number;
  pendingWithdrawals: number;
}

interface Withdrawal {
  id: string;
  affiliateId: string;
  affiliateName?: string;
  affiliateEmail?: string;
  amount: number;
  iban: string;
  status: string;
  createdAt: string;
  affiliate?: {
    id: string;
    name: string;
    email: string;
    referralCode: string;
  };
}

/* ═══════════════════════════════════════════════════════
   Status Helpers
   ═══════════════════════════════════════════════════════ */

const statusColors: Record<string, string> = {
  pending: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  confirmed: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  shipped: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  delivered: "text-green-400 border-green-400/30 bg-green-400/10",
  cancelled: "text-red-400 border-red-400/30 bg-red-400/10",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const orderStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const withdrawalStatusColors: Record<string, string> = {
  pending: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  approved: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  paid: "text-green-400 border-green-400/30 bg-green-400/10",
  rejected: "text-red-400 border-red-400/30 bg-red-400/10",
};

const withdrawalStatusLabels: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  paid: "Pago",
  rejected: "Rejeitado",
};

const withdrawalStatuses = ["pending", "approved", "paid", "rejected"];

/* ═══════════════════════════════════════════════════════
   NotificationBell Component
   ═══════════════════════════════════════════════════════ */

function NotificationBell() {
  return (
    <button className="relative p-2 rounded-lg hover:bg-secondary/10 transition-colors" aria-label="Notificações">
      <Bell className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   AdminLoginScreen Component
   ═══════════════════════════════════════════════════════ */

function AdminLoginScreen({ onLogin }: { onLogin: (user: { id: string; name: string; email: string; role: string }) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Erro ao fazer login");
          return;
        }

        if (data.user.role !== "admin") {
          setError("Acesso restrito a administradores");
          return;
        }

        onLogin(data.user);
        toast.success("Bem-vindo ao painel de administração!");
      } catch {
        setError("Erro de ligação ao servidor");
      } finally {
        setLoading(false);
      }
    },
    [email, password, onLogin]
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 admin-noise-container">
      {/* Decorative floating particles */}
      <div className="admin-login-particles">
        <div className="particle" style={{ width: 120, height: 120, top: '10%', left: '8%', animationDuration: '12s', animationDelay: '0s' }} />
        <div className="particle" style={{ width: 80, height: 80, top: '60%', right: '10%', animationDuration: '10s', animationDelay: '2s' }} />
        <div className="particle" style={{ width: 60, height: 60, bottom: '15%', left: '15%', animationDuration: '14s', animationDelay: '4s' }} />
        <div className="particle" style={{ width: 100, height: 100, top: '25%', right: '20%', animationDuration: '11s', animationDelay: '1s' }} />
        <div className="particle" style={{ width: 50, height: 50, bottom: '30%', right: '30%', animationDuration: '13s', animationDelay: '3s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <motion.div
              className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center"
              animate={{ boxShadow: ['0 0 0 rgba(201,169,110,0)', '0 0 20px rgba(201,169,110,0.15)', '0 0 0 rgba(201,169,110,0)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="font-serif text-2xl font-bold text-gold-gradient">AL</span>
            </motion.div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-gold-gradient tracking-wide">ALMA LIK</h1>
              <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Luxury Perfumes</p>
            </div>
          </div>
          <div className="ornament-diamond mt-4 mb-2">
            <div className="ornament-diamond-icon" />
          </div>
          <p className="text-[11px] text-muted-foreground/60 mt-2 italic">"A arte da perfumaria ao seu alcance"</p>
        </div>

        {/* Login Card with premium border */}
        <Card className="admin-login-card bg-secondary/5 border-gold/10 shadow-2xl">
          {/* Corner ornaments */}
          <div className="admin-login-corner admin-login-corner--tl" />
          <div className="admin-login-corner admin-login-corner--tr" />
          <div className="admin-login-corner admin-login-corner--bl" />
          <div className="admin-login-corner admin-login-corner--br" />

          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-gold/60" />
              <CardTitle className="font-serif text-xl text-gold-gradient">
                Painel de Administração
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Introduza as suas credenciais para aceder
            </p>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto mt-3" />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-xs text-label">
                  Email
                </Label>
                <div className="relative">
                  <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@almalik.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-secondary/10 border-gold/20 focus:border-gold h-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-xs text-label">
                  Palavra-passe
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 bg-secondary/10 border-gold/20 focus:border-gold h-11"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-gold to-gold-light text-noir font-semibold hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    A verificar...
                  </span>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mx-auto mb-4" />
          <p className="text-[10px] text-muted-foreground/50">
            © {new Date().getFullYear()} Alma Lik — Painel Administrativo
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SVG Icon Helpers (inline for login screen)
   ═══════════════════════════════════════════════════════ */

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   Skeleton Loader for Dashboard
   ═══════════════════════════════════════════════════════ */

function BalanceSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-72 lg:col-span-2 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="bg-secondary/5 border-gold/10">
      <CardContent className="p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════
   Custom Tooltip for Chart
   ═══════════════════════════════════════════════════════ */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-gold/20 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-gold">€{payload[0].value.toFixed(2)}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Tab 1: Balanço Geral (General Balance)
   ═══════════════════════════════════════════════════════ */

function BalancoGeralTab({ balance, revenueData }: { balance: BalanceData; revenueData: RevenueData[] }) {
  const today = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const financialCards = [
    { label: "Receita Total", value: balance.totalRevenue, icon: DollarSign, color: "text-green-400", bgColor: "bg-green-400/10", borderColor: "border-green-400/20" },
    { label: "Valor em Stock", value: balance.totalStockValue, icon: Package, color: "text-blue-400", bgColor: "bg-blue-400/10", borderColor: "border-blue-400/20" },
    { label: "Valores a Receber", value: balance.amountsToReceive, icon: ArrowUpRight, color: "text-yellow-400", bgColor: "bg-yellow-400/10", borderColor: "border-yellow-400/20" },
    { label: "Valores a Pagar", value: balance.amountsToPay, icon: ArrowDownRight, color: "text-red-400", bgColor: "bg-red-400/10", borderColor: "border-red-400/20" },
    { label: "Lucro Líquido", value: balance.netProfit, icon: TrendingUp, color: balance.netProfit >= 0 ? "text-green-400" : "text-red-400", bgColor: balance.netProfit >= 0 ? "bg-green-400/10" : "bg-red-400/10", borderColor: balance.netProfit >= 0 ? "border-green-400/20" : "border-red-400/20" },
    { label: "Ticket Médio", value: balance.averageTicket, icon: CircleDollarSign, color: "text-gold", bgColor: "bg-gold/10", borderColor: "border-gold/20" },
  ];

  const ordersBreakdown = [
    { label: "Entregues", value: balance.deliveredOrders, total: balance.totalOrders, color: "bg-green-400" },
    { label: "Pendentes", value: balance.pendingOrders, total: balance.totalOrders, color: "bg-yellow-400" },
    { label: "Cancelados", value: balance.cancelledOrders, total: balance.totalOrders, color: "bg-red-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent border-gold/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-gold-gradient">Balanço Geral da Empresa</h2>
                <p className="text-sm text-muted-foreground mt-1 capitalize">{today}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{balance.totalOrders}</p>
                  <p className="text-[10px] text-muted-foreground">Encomendas</p>
                </div>
                <div className="w-px h-10 bg-gold/20" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{balance.activeAffiliates}/{balance.totalAffiliates}</p>
                  <p className="text-[10px] text-muted-foreground">Parceiros Ativos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 6 Key Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {financialCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className={`bg-secondary/5 border ${card.borderColor} hover:border-opacity-50 transition-colors`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  {card.label === "Valores a Receber" && balance.amountsToReceive > 0 && (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  )}
                  {card.label === "Valores a Pagar" && balance.amountsToPay > 0 && (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">€{card.value.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stock Overview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-secondary/5 border-gold/10">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg text-gold-gradient flex items-center gap-2">
              <Package className="w-5 h-5" />
              Visão Geral do Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">€{balance.totalRetailValue.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">Valor de Retalho Total</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5">
                <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-400">{balance.lowStockProducts}</p>
                  <p className="text-[10px] text-muted-foreground">Produtos com Stock Baixo</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5">
                <div className="w-10 h-10 rounded-lg bg-red-400/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-red-400">{balance.outOfStockProducts}</p>
                  <p className="text-[10px] text-muted-foreground">Produtos Sem Stock</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-secondary/5 border-gold/10">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg text-gold-gradient flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Distribuição de Encomendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordersBreakdown.map((item) => {
                const percentage = item.total > 0 ? ((item.value / item.total) * 100).toFixed(1) : "0";
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-secondary/10 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${item.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="lg:col-span-2"
        >
          <Card className="bg-secondary/5 border-gold/10">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-gold-gradient">Receita — Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.1)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#8b8b8b", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(201,169,110,0.2)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#8b8b8b", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(201,169,110,0.2)" }}
                      tickLine={false}
                      tickFormatter={(v: number) => `€${v}`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#c9a96e"
                      strokeWidth={2.5}
                      dot={{ fill: "#c9a96e", r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#e8d5a3", stroke: "#c9a96e", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top 5 Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-secondary/5 border-gold/10 h-full">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-gold-gradient">Top 5 Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              {balance.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sem dados de vendas disponíveis
                </p>
              ) : (
                <div className="space-y-3">
                  {balance.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.quantitySold} vendidos</p>
                      </div>
                      <p className="text-sm font-semibold text-gold">€{p.revenue.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-secondary/5 border-gold/10">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-gold-gradient flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Encomendas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!balance.recentOrders || balance.recentOrders.length === 0) ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Ainda não há encomendas. As encomendas dos clientes aparecerão aqui.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10 hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Encomenda</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Cliente</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Total</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Fonte</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balance.recentOrders.map((order) => (
                      <TableRow key={order.id} className="border-gold/5">
                        <TableCell className="font-mono text-xs text-gold">#{order.id.slice(-8)}</TableCell>
                        <TableCell className="font-medium">{order.customerName}</TableCell>
                        <TableCell className="font-semibold">€{order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          {order.affiliateRef ? (
                            <Badge className="bg-purple-400/10 text-purple-400 border border-purple-400/30 text-[10px]">
                              Parceiro
                            </Badge>
                          ) : (
                            <Badge className="bg-gold/10 text-gold border border-gold/30 text-[10px]">
                              Direta
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[order.status] || "text-muted-foreground border-gold/10 bg-gold/5"}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("pt-PT")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Tab 2: Encomendas (Orders Management)
   ═══════════════════════════════════════════════════════ */

function EncomendasTab({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = useCallback(async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Estado atualizado para ${statusLabels[newStatus]}`);
    } catch {
      toast.error("Erro ao atualizar estado da encomenda");
    } finally {
      setUpdatingId(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/5 border-gold/10">
        <CardHeader>
          <CardTitle className="font-serif text-xl text-gold-gradient">
            Todas as Encomendas
            <Badge variant="outline" className="ml-3 border-gold/20 text-gold text-xs">
              {orders.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Ainda não há encomendas</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-gold/10 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Encomenda</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Cliente</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Email</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Total</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Itens</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Fonte</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-gold/5">
                      <TableCell className="font-mono text-xs text-gold">#{order.id.slice(-8)}</TableCell>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{order.customerEmail}</TableCell>
                      <TableCell className="font-semibold">€{order.total.toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </TableCell>
                      <TableCell>
                        {order.affiliateRef ? (
                          <Badge className="bg-purple-400/10 text-purple-400 border border-purple-400/30 text-[10px]">
                            Parceiro
                          </Badge>
                        ) : (
                          <Badge className="bg-gold/10 text-gold border border-gold/30 text-[10px]">
                            Direta
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) => handleStatusChange(order.id, v)}
                          disabled={updatingId === order.id}
                        >
                          <SelectTrigger className={`h-8 w-32 text-[11px] font-semibold border ${statusColors[order.status] || "border-gold/10 bg-gold/5 text-muted-foreground"}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {orderStatuses.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {statusLabels[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("pt-PT")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Tab 3: Produtos (Products/Stock Management)
   ═══════════════════════════════════════════════════════ */

function ProdutosTab({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState(0);
  const [genderFilter, setGenderFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const filteredProducts = products
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchGender = genderFilter === "all" || p.gender === genderFilter;
      return matchSearch && matchGender;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "stock_asc": return a.stock - b.stock;
        case "stock_desc": return b.stock - a.stock;
        case "margin_desc": {
          const ma = a.price > 0 ? ((a.price - a.costPrice) / a.price) * 100 : 0;
          const mb = b.price > 0 ? ((b.price - b.costPrice) / b.price) * 100 : 0;
          return mb - ma;
        }
        default: return a.name.localeCompare(b.name);
      }
    });

  const totalStockValue = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);

  const getMarginColor = (price: number, cost: number) => {
    if (price <= 0) return "text-red-400";
    const margin = ((price - cost) / price) * 100;
    if (margin > 50) return "text-green-400";
    if (margin > 30) return "text-yellow-400";
    return "text-red-400";
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge className="bg-red-400/10 text-red-400 border border-red-400/30 text-[10px]">Sem stock</Badge>;
    if (stock < 5) return <Badge className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 text-[10px]">Stock baixo</Badge>;
    return <Badge className="bg-green-400/10 text-green-400 border border-green-400/30 text-[10px]">Em stock</Badge>;
  };

  const handleSaveStock = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: editStock }),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stock: editStock } : p));
      setEditingId(null);
      toast.success("Stock atualizado com sucesso");
    } catch {
      toast.error("Erro ao atualizar stock");
    }
  };

  return (
    <div className="space-y-6">
      {/* Total Stock Value */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-r from-blue-400/10 via-blue-400/5 to-transparent border-blue-400/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">€{totalStockValue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Valor Total em Stock (custo)</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-secondary/5 border-gold/10">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar produtos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-secondary/10 border-gold/20 focus:border-gold"
                />
              </div>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-secondary/10 border-gold/20">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="unissex">Unissex</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-44 bg-secondary/10 border-gold/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                  <SelectItem value="price_asc">Preço ↑</SelectItem>
                  <SelectItem value="price_desc">Preço ↓</SelectItem>
                  <SelectItem value="stock_asc">Stock ↑</SelectItem>
                  <SelectItem value="stock_desc">Stock ↓</SelectItem>
                  <SelectItem value="margin_desc">Margem ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Products Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-secondary/5 border-gold/10">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-gold/10 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Produto</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Preço</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Custo</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Margem</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Stock</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Estado</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10 w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((p) => {
                      const margin = p.price > 0 ? (((p.price - p.costPrice) / p.price) * 100).toFixed(0) : "0";
                      const isEditing = editingId === p.id;

                      return (
                        <TableRow key={p.id} className="border-gold/5">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-md overflow-hidden flex-shrink-0 border border-gold/10">
                                <img
                                  src={p.imageUrl || "/images/perfumes/golden-perfume.png"}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate max-w-[200px]">{p.name}</p>
                                <p className="text-[10px] text-muted-foreground capitalize">{p.gender}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">€{p.price.toFixed(2)}</TableCell>
                          <TableCell className="text-muted-foreground">€{p.costPrice.toFixed(2)}</TableCell>
                          <TableCell className={`font-semibold ${getMarginColor(p.price, p.costPrice)}`}>{margin}%</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <>
                                  {p.id === editingId ? (
                                    <Label className="sr-only" htmlFor={`stock-${p.id}`}>Stock</Label>
                                  ) : null}
                                  <Input
                                    id={`stock-${p.id}`}
                                    type="number"
                                    min={0}
                                    value={editStock}
                                    onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                                    className="w-20 h-8 bg-secondary/10 border-gold/20 text-sm"
                                  />
                                </>
                              ) : (
                                <span className="font-medium">{p.stock}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStockBadge(p.stock)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                                    onClick={() => handleSaveStock(p.id)}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                    onClick={() => setEditingId(null)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-gold hover:bg-gold/10"
                                  onClick={() => {
                                    setEditingId(p.id);
                                    setEditStock(p.stock);
                                  }}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredProducts.length > 20 && (
              <div className="px-4 py-3 border-t border-gold/10 text-xs text-muted-foreground text-center">
                Mostrando {filteredProducts.length} de {products.length} produtos
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Tab 4: Parceiros (Affiliates Management)
   ═══════════════════════════════════════════════════════ */

function ParceirosTab() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newCommission, setNewCommission] = useState("0.30");
  const [creating, setCreating] = useState(false);

  const fetchAffiliates = useCallback(async () => {
    try {
      const res = await fetch("/api/affiliates");
      const data = await res.json();
      setAffiliates(data.affiliates || []);
    } catch {
      toast.error("Erro ao carregar parceiros");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  const handleCreateAffiliate = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword,
          commissionRate: parseFloat(newCommission),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao criar parceiro");
        return;
      }
      toast.success("Parceiro criado com sucesso!");
      setDialogOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewCommission("0.30");
      fetchAffiliates();
    } catch {
      toast.error("Erro ao criar parceiro");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/affiliates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setAffiliates((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !currentActive } : a))
      );
      toast.success(`Parceiro ${!currentActive ? "ativado" : "desativado"}`);
    } catch {
      toast.error("Erro ao atualizar parceiro");
    }
  };

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-gold-gradient">Parceiros</h3>
          <p className="text-sm text-muted-foreground">{affiliates.length} parceiros registados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-gold to-gold-light text-noir font-semibold hover:opacity-90">
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Parceiro
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-gold/20">
            <DialogHeader>
              <DialogTitle className="font-serif text-gold-gradient text-lg">Criar Novo Parceiro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs text-label">Nome *</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do parceiro" className="bg-secondary/10 border-gold/20 focus:border-gold" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-label">Email *</Label>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@exemplo.com" className="bg-secondary/10 border-gold/20 focus:border-gold" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-label">Palavra-passe *</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Palavra-passe temporária" className="bg-secondary/10 border-gold/20 focus:border-gold" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-label">Comissão (%)</Label>
                <Select value={newCommission} onValueChange={setNewCommission}>
                  <SelectTrigger className="bg-secondary/10 border-gold/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.10">10%</SelectItem>
                    <SelectItem value="0.15">15%</SelectItem>
                    <SelectItem value="0.20">20%</SelectItem>
                    <SelectItem value="0.25">25%</SelectItem>
                    <SelectItem value="0.30">30%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 border-gold/20 text-foreground hover:bg-secondary/10" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-gold to-gold-light text-noir font-semibold hover:opacity-90" onClick={handleCreateAffiliate} disabled={creating}>
                  {creating ? "A criar..." : "Criar Parceiro"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Affiliates Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-secondary/5 border-gold/10">
          <CardContent className="p-0">
            {affiliates.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum parceiro registado</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10 hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Nome</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Email</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Código</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Comissão</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Vendas</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Saldo</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Estado</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Ativo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliates.map((a) => (
                      <TableRow key={a.id} className="border-gold/5">
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{a.email}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded font-mono">{a.referralCode}</code>
                        </TableCell>
                        <TableCell className="font-semibold">{(a.commissionRate * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-muted-foreground">{a._count?.commissions || 0}</TableCell>
                        <TableCell className="font-semibold text-gold">€{a.balance.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${a.isActive ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-red-400 border-red-400/30 bg-red-400/10"}`}>
                            {a.isActive ? "Ativo" : "Inativo"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={a.isActive}
                            onCheckedChange={() => handleToggleActive(a.id, a.isActive)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Tab 5: Financeiro (Financial Details)
   ═══════════════════════════════════════════════════════ */

function FinanceiroTab() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/affiliates/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch {
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <TableSkeleton rows={8} />;
  if (!stats) return <p className="text-muted-foreground text-center py-8">Erro ao carregar dados financeiros</p>;

  const directRevenue = stats.grossRevenue - stats.affiliateRevenue;
  const totalOrdersSafe = stats.totalOrders > 0 ? stats.totalOrders : 1;

  return (
    <div className="space-y-6">
      {/* Financial Metrics Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Receita Bruta", value: stats.grossRevenue, icon: DollarSign, color: "text-green-400", bgColor: "bg-green-400/10" },
            { label: "Custos Totais", value: stats.totalCosts, icon: TrendingDown, color: "text-red-400", bgColor: "bg-red-400/10" },
            { label: "Comissões Pagas", value: stats.paidCommissions, icon: HandCoins, color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
            { label: "Comissões Pendentes", value: stats.pendingCommissions, icon: ClockIcon, color: "text-orange-400", bgColor: "bg-orange-400/10" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-secondary/5 border-gold/10">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">€{card.value.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Net Profit */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className={`bg-gradient-to-r ${stats.netProfit >= 0 ? "from-green-400/10 to-transparent border-green-400/20" : "from-red-400/10 to-transparent border-red-400/20"}`}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${stats.netProfit >= 0 ? "bg-green-400/10" : "bg-red-400/10"} flex items-center justify-center`}>
              {stats.netProfit >= 0 ? <TrendingUp className="w-6 h-6 text-green-400" /> : <TrendingDown className="w-6 h-6 text-red-400" />}
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">€{stats.netProfit.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Lucro Líquido</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sales Breakdown: Direct vs Affiliate */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-secondary/5 border-gold/10">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-gold-gradient">Vendas Diretas vs Parceiros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Revenue Split */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gold" />
                    <span className="text-sm font-medium">Vendas Diretas</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">€{directRevenue.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground ml-2">({stats.directOrders} encomendas)</span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-secondary/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.directOrders / totalOrdersSafe) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400" />
                    <span className="text-sm font-medium">Vendas via Parceiros</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">€{stats.affiliateRevenue.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground ml-2">({stats.affiliateOrders} encomendas)</span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-secondary/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-purple-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.affiliateOrders / totalOrdersSafe) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gold/10">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{stats.totalOrders}</p>
                <p className="text-[10px] text-muted-foreground">Total Encomendas</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{stats.activeAffiliates}</p>
                <p className="text-[10px] text-muted-foreground">Parceiros Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-400">{stats.lowStockProducts}</p>
                <p className="text-[10px] text-muted-foreground">Stock Baixo</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-400">{stats.outOfStockProducts}</p>
                <p className="text-[10px] text-muted-foreground">Sem Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Clock Icon Helper
   ═══════════════════════════════════════════════════════ */

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   Tab 6: Saques (Withdrawals Management)
   ═══════════════════════════════════════════════════════ */

function SaquesTab() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const res = await fetch("/api/affiliates/admin/withdrawals");
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
    } catch {
      toast.error("Erro ao carregar saques");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/affiliates/admin/withdrawals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status } : w))
      );
      toast.success(`Saque ${withdrawalStatusLabels[status].toLowerCase()}`);
    } catch {
      toast.error("Erro ao atualizar saque");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h3 className="font-serif text-xl text-gold-gradient">Pedidos de Saque</h3>
          <p className="text-sm text-muted-foreground">{withdrawals.length} pedidos de saque</p>
        </div>
      </motion.div>

      {/* Withdrawals Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-secondary/5 border-gold/10">
          <CardContent className="p-0">
            {withdrawals.length === 0 ? (
              <div className="py-12 text-center">
                <Wallet className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum pedido de saque</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/10 hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Parceiro</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Email</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Montante</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">IBAN</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Data</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card z-10">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w) => {
                      const affiliateName = w.affiliate?.name || w.affiliateName || "Desconhecido";
                      const affiliateEmail = w.affiliate?.email || w.affiliateEmail || "";
                      const isUpdating = updatingId === w.id;

                      return (
                        <TableRow key={w.id} className="border-gold/5">
                          <TableCell className="font-medium">{affiliateName}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{affiliateEmail}</TableCell>
                          <TableCell className="font-semibold text-gold">€{w.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">{w.iban || "—"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${withdrawalStatusColors[w.status] || "text-muted-foreground border-gold/10 bg-gold/5"}`}>
                              {withdrawalStatusLabels[w.status] || w.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(w.createdAt).toLocaleDateString("pt-PT")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {w.status === "pending" ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                    disabled={isUpdating}
                                    onClick={() => handleStatusChange(w.id, "approved")}
                                  >
                                    Aprovar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-[10px] text-green-400 hover:text-green-300 hover:bg-green-400/10"
                                    disabled={isUpdating}
                                    onClick={() => handleStatusChange(w.id, "paid")}
                                  >
                                    Pagar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                    disabled={isUpdating}
                                    onClick={() => handleStatusChange(w.id, "rejected")}
                                  >
                                    Rejeitar
                                  </Button>
                                </>
                              ) : w.status === "approved" ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-[10px] text-green-400 hover:text-green-300 hover:bg-green-400/10"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(w.id, "paid")}
                                >
                                  Marcar como Pago
                                </Button>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main AdminPage Component
   ═══════════════════════════════════════════════════════ */

export function AdminPage() {
  const { user, setUser, setCurrentPage } = useStore();
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("balanco");
  const initialFetchDone = useRef(false);

  // Check if user is admin
  const isAdmin = user && user.role === "admin";

  const handleLogin = useCallback(
    (userData: { id: string; name: string; email: string; role: string }) => {
      setUser({ id: userData.id, name: userData.name, email: userData.email, role: userData.role as "admin" });
    },
    [setUser]
  );

  const handleLogout = useCallback(() => {
    setUser(null);
    setBalance(null);
    setRevenueData([]);
    setProducts([]);
    setOrders([]);
    setDataLoading(true);
  }, [setUser]);

  const handleBack = useCallback(() => {
    setCurrentPage("home");
  }, [setCurrentPage]);

  // Fetch all data when authenticated
  const fetchAllData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [balanceRes, revenueRes, productsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/balance"),
        fetch("/api/admin/revenue"),
        fetch("/api/products?limit=200"),
        fetch("/api/orders"),
      ]);

      const [balanceData, revenueJson, productsJson, ordersJson] = await Promise.all([
        balanceRes.json(),
        revenueRes.json(),
        productsRes.json(),
        ordersRes.json(),
      ]);

      setBalance(balanceData);
      setRevenueData(revenueJson.data || []);
      setProducts(productsJson.products || []);
      setOrders(ordersJson.orders || []);
    } catch {
      toast.error("Erro ao carregar dados do painel");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchAllData();
    }
  }, [isAdmin, fetchAllData]);

  // Show login screen if not authenticated
  if (!isAdmin) {
    return <AdminLoginScreen onLogin={handleLogin} />;
  }

  // Show loading screen while data is loading
  if (dataLoading && !balance) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 admin-noise-container">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <BalanceSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 admin-noise-container">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with gradient background */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-header-gradient -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 px-4 sm:px-6 lg:px-8 py-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handleBack}
                className="admin-back-btn flex items-center gap-2 px-3 py-2 rounded-lg border border-gold/15 text-muted-foreground text-sm"
                aria-label="Voltar à Loja"
              >
                <ArrowLeft className="w-4 h-4 back-arrow" />
                <span className="hidden sm:inline">Voltar à Loja</span>
              </button>
              <div className="w-px h-8 bg-gold/10 hidden sm:block" />
              <div>
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center"
                    animate={{ boxShadow: ['0 0 0 rgba(201,169,110,0)', '0 0 12px rgba(201,169,110,0.1)', '0 0 0 rgba(201,169,110,0)'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <span className="font-serif text-sm font-bold text-gold-gradient">AL</span>
                  </motion.div>
                  <div>
                    <h1 className="font-serif text-xl sm:text-2xl text-gold-gradient">Painel Admin</h1>
                    <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">ALMA LIK — Back Office</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/5 border border-gold/10">
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-gold">{user?.name?.charAt(0)}</span>
                </div>
                <span className="text-xs text-muted-foreground">{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/5 border border-gold/10 p-1 h-auto flex-wrap">
            <TabsTrigger
              value="balanco"
              className="admin-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold data-[state=active]:to-gold-light data-[state=active]:text-noir data-[state=active]:font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg"
            >
              <BarChart3 className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Balanço Geral
            </TabsTrigger>
            <TabsTrigger
              value="encomendas"
              className="admin-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold data-[state=active]:to-gold-light data-[state=active]:text-noir data-[state=active]:font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg"
            >
              <ShoppingBag className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Encomendas
            </TabsTrigger>
            <TabsTrigger
              value="produtos"
              className="admin-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold data-[state=active]:to-gold-light data-[state=active]:text-noir data-[state=active]:font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg"
            >
              <Package className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Produtos
            </TabsTrigger>
            <TabsTrigger
              value="parceiros"
              className="admin-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold data-[state=active]:to-gold-light data-[state=active]:text-noir data-[state=active]:font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg"
            >
              <Users className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Parceiros
            </TabsTrigger>
            <TabsTrigger
              value="financeiro"
              className="admin-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold data-[state=active]:to-gold-light data-[state=active]:text-noir data-[state=active]:font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg"
            >
              <CreditCard className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger
              value="saques"
              className="admin-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold data-[state=active]:to-gold-light data-[state=active]:text-noir data-[state=active]:font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg"
            >
              <Wallet className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Saques
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents with AnimatePresence transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="admin-tab-glow p-1"
            >
              {activeTab === "balanco" && (
                <TabsContent value="balanco" forceMount style={{ display: activeTab === "balanco" ? 'block' : 'none' }}>
                  {balance && revenueData ? (
                    <BalancoGeralTab balance={balance} revenueData={revenueData} />
                  ) : (
                    <BalanceSkeleton />
                  )}
                </TabsContent>
              )}

              {activeTab === "encomendas" && (
                <TabsContent value="encomendas" forceMount style={{ display: activeTab === "encomendas" ? 'block' : 'none' }}>
                  <EncomendasTab initialOrders={orders} />
                </TabsContent>
              )}

              {activeTab === "produtos" && (
                <TabsContent value="produtos" forceMount style={{ display: activeTab === "produtos" ? 'block' : 'none' }}>
                  <ProdutosTab initialProducts={products} />
                </TabsContent>
              )}

              {activeTab === "parceiros" && (
                <TabsContent value="parceiros" forceMount style={{ display: activeTab === "parceiros" ? 'block' : 'none' }}>
                  <ParceirosTab />
                </TabsContent>
              )}

              {activeTab === "financeiro" && (
                <TabsContent value="financeiro" forceMount style={{ display: activeTab === "financeiro" ? 'block' : 'none' }}>
                  <FinanceiroTab />
                </TabsContent>
              )}

              {activeTab === "saques" && (
                <TabsContent value="saques" forceMount style={{ display: activeTab === "saques" ? 'block' : 'none' }}>
                  <SaquesTab />
                </TabsContent>
              )}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
