"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  LogIn,
  LogOut,
  Link2,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  Wallet,
  Users,
  ArrowLeft,
  X,
  Clock,
  ChevronRight,
  Eye,
  EyeOff,
  Send,
  AlertTriangle,
  Package,
  BarChart3,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  MessageCircle,
  Facebook,
  MousePointerClick,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

/* ═══════ Types ═══════ */
interface AffiliateData {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  commissionRate: number;
  isActive: boolean;
}

interface AffiliateStats {
  totalEarned: number;
  balance: number;
  totalWithdrawn: number;
  totalSales: number;
  totalOrders: number;
  pendingCommissions: number;
  paidCommissions: number;
  pendingWithdrawals: number;
}

interface Commission {
  id: string;
  orderId: string;
  customerName: string;
  orderTotal: number;
  rate: number;
  amount: number;
  status: "pending" | "paid";
  orderStatus: string;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  iban: string;
  accountHolder: string;
  status: "pending" | "approved" | "paid" | "rejected";
  notes: string;
  createdAt: string;
  processedAt: string;
}

type CommissionFilter = "all" | "30" | "90";

/* ═══════ Status Helpers ═══════ */
const commissionStatusConfig: Record<string, { label: string; classes: string }> = {
  pending: {
    label: "Pendente",
    classes: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  },
  paid: {
    label: "Pago",
    classes: "text-green-400 border-green-400/30 bg-green-400/10",
  },
};

const withdrawalStatusConfig: Record<
  string,
  { label: string; icon: typeof Check; classes: string }
> = {
  pending: {
    label: "Pendente",
    icon: Clock,
    classes: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  },
  approved: {
    label: "Aprovado",
    icon: Check,
    classes: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  },
  paid: {
    label: "Pago",
    icon: Banknote,
    classes: "text-green-400 border-green-400/30 bg-green-400/10",
  },
  rejected: {
    label: "Rejeitado",
    icon: X,
    classes: "text-red-400 border-red-400/30 bg-red-400/10",
  },
};

/* ═══════ Animated Counter Hook ═══════ */
function useAnimatedCounter(target: number, duration = 1200) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setTimeout(() => setDisplay(0), 0);
      return;
    }
    let start = 0;
    const startTime = performance.now();
    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [target, duration]);

  return display;
}

/* ═══════ Login Screen ═══════ */
function LoginScreen({ onLogin }: { onLogin: (data: AffiliateData) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/affiliates/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Credenciais inválidas");
      localStorage.setItem("alma_lik_affiliate", JSON.stringify(data.affiliate));
      toast.success(`Bem-vindo, ${data.affiliate.name}!`);
      onLogin(data.affiliate);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md"
      >
        <Card className="border-gold/15 bg-card/80 glass shadow-2xl">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="ornament-diamond mb-4">
              <div className="ornament-diamond-icon" />
            </div>
            <CardTitle className="font-serif text-2xl sm:text-3xl text-gold-gradient">
              Painel do Parceiro
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Aceda ao seu painel de afiliados Alma Lik
            </p>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="affiliate-email" className="text-label">
                  Email
                </Label>
                <div className="relative">
                  <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="affiliate-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-secondary/10 border-gold/20 focus:border-gold"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="affiliate-password" className="text-label">
                  Palavra-passe
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="affiliate-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-secondary/10 border-gold/20 focus:border-gold"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-gold to-gold-light text-noir font-semibold hover:from-gold-dark hover:to-gold transition-all duration-300 btn-premium"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-noir/30 border-t-noir rounded-full animate-spin" />
                    <span>A entrar...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    <span>Entrar</span>
                  </div>
                )}
              </Button>
            </form>
            <div className="gold-line mt-8 mb-4" />
            <p className="text-xs text-muted-foreground text-center">
              Ainda não é parceiro?{" "}
              <span className="text-gold cursor-pointer hover:underline">
                Candidate-se aqui
              </span>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ═══════ Enhanced Stat Card ═══════ */
function StatCard({
  label,
  value,
  icon: Icon,
  delay = 0,
  iconBgColor = "bg-gold/10",
  iconColor = "text-gold",
  trend,
  trendLabel,
}: {
  label: string;
  value: string;
  icon: typeof DollarSign;
  delay?: number;
  iconBgColor?: string;
  iconColor?: string;
  trend?: "up" | "down" | null;
  trendLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="cursor-default"
    >
      <Card className="bg-secondary/5 border-gold/10 card-hover-glow h-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-11 h-11 rounded-xl ${iconBgColor} flex items-center justify-center ${iconColor}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            {trend && trendLabel && (
              <div
                className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  trend === "up"
                    ? "text-green-400 bg-green-400/10"
                    : "text-red-400 bg-red-400/10"
                }`}
              >
                {trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {trendLabel}
              </div>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gold-gradient tabular-nums leading-tight">
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 tracking-wide uppercase">
            {label}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ═══════ Enhanced Referral Link Section ═══════ */
function ReferralLinkSection({ referralCode }: { referralCode: string }) {
  const referralUrl = `https://almalik.com/?ref=${referralCode}`;
  const [copied, setCopied] = useState(false);
  const totalClicks = 0; // placeholder

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(referralUrl)
      .then(() => {
        setCopied(true);
        toast.success("Link de referência copiado!", {
          description: referralUrl,
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Erro ao copiar o link");
      });
  }, [referralUrl]);

  const shareText = `Descubra os perfumes exclusivos da Alma Lik! Use o meu link de parceiro e ganhe desconto: ${referralUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="border-gold/15 bg-card/80 glass overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-gold-gradient leading-tight">
                Link de Afiliação
              </h3>
              <p className="text-xs text-muted-foreground">
                Partilhe e ganhe comissões em cada venda
              </p>
            </div>
          </div>

          {/* Link input */}
          <div className="relative group mb-4">
            <Input
              readOnly
              value={referralUrl}
              className="pr-24 bg-noir/40 border-gold/20 font-mono text-sm text-foreground/90 h-11 focus:ring-1 focus:ring-gold/30"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1.5">
              <Button
                size="sm"
                onClick={handleCopy}
                className={`h-8 px-3 text-xs font-semibold transition-all duration-200 ${
                  copied
                    ? "bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30"
                    : "bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Clicks counter */}
          <div className="flex items-center gap-2 mb-5 px-1">
            <MousePointerClick className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {totalClicks} cliques neste link
            </span>
          </div>

          {/* Share buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full h-10 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-300 transition-all gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Partilhar no WhatsApp
              </Button>
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full h-10 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-300 transition-all gap-2"
              >
                <Facebook className="w-4 h-4" />
                Partilhar no Facebook
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ═══════ Commission History Table ═══════ */
function CommissionHistory({
  commissions,
  loading,
  period,
  onPeriodChange,
}: {
  commissions: Commission[];
  loading: boolean;
  period: CommissionFilter;
  onPeriodChange: (p: CommissionFilter) => void;
}) {
  const periods: { value: CommissionFilter; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "30", label: "Últimos 30 dias" },
    { value: "90", label: "Últimos 90 dias" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <Card className="border-gold/10 bg-secondary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="font-serif text-xl text-gold-gradient flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Histórico de Comissões
            {commissions.length > 0 && (
              <Badge variant="outline" className="ml-2 border-gold/20 text-gold text-xs">
                {commissions.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => onPeriodChange(p.value)}
                className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 ${
                  period === p.value
                    ? "bg-gold/15 text-gold border border-gold/30 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/10 border border-transparent"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="px-6 py-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 rounded-lg skeleton-shimmer" />
              ))}
            </div>
          ) : commissions.length === 0 ? (
            <div className="py-14 text-center px-6">
              <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Ainda não há comissões registadas.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Partilhe o seu link de referência para começar a ganhar comissões.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-charcoal z-10">
                  <TableRow className="border-gold/10 hover:bg-transparent">
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Data
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Pedido
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Cliente
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                      Total
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                      Taxa
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                      Comissão
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Estado
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((c, i) => {
                    const statusConf =
                      commissionStatusConfig[c.status] ||
                      commissionStatusConfig.pending;
                    return (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-gold/5 hover:bg-secondary/5 transition-colors"
                      >
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(c.createdAt), "dd MMM yyyy", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gold">
                          #{c.orderId.length > 8 ? `...${c.orderId.slice(-8)}` : c.orderId}
                        </TableCell>
                        <TableCell className="text-sm">{c.customerName}</TableCell>
                        <TableCell className="font-semibold text-sm text-right">
                          €{c.orderTotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground text-right">
                          {(c.rate * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="font-semibold text-gold text-sm text-right">
                          €{c.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusConf.classes}`}
                          >
                            {statusConf.label}
                          </span>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ═══════ Withdrawal Section ═══════ */
function WithdrawalSection({
  affiliateId,
  availableBalance,
  totalWithdrawn,
  pendingWithdrawals,
  withdrawals,
  loading,
}: {
  affiliateId: string;
  availableBalance: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  withdrawals: Withdrawal[];
  loading: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [iban, setIban] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Insira um valor válido");
      return;
    }
    if (numAmount > availableBalance) {
      toast.error("O valor excede o saldo disponível");
      return;
    }
    if (!iban.trim()) {
      toast.error("Insira o seu IBAN");
      return;
    }
    if (!accountHolder.trim()) {
      toast.error("Insira o nome do titular");
      return;
    }
    setWithdrawing(true);
    try {
      const res = await fetch("/api/affiliates/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateId,
          amount: numAmount,
          iban: iban.trim(),
          accountHolder: accountHolder.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao solicitar saque");
      toast.success("Pedido de saque enviado com sucesso!", {
        description: `€${numAmount.toFixed(2)} serão processados em 1-3 dias úteis.`,
      });
      setDialogOpen(false);
      setAmount("");
      setIban("");
      setAccountHolder("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao solicitar saque";
      toast.error(message);
    } finally {
      setWithdrawing(false);
    }
  };

  const animatedBalance = useAnimatedCounter(availableBalance);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gold/10 bg-secondary/5">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-gold-gradient flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Saques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg skeleton-shimmer" />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gold/10 bg-secondary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl text-gold-gradient flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Saques
              </CardTitle>
              <Button
                onClick={() => setDialogOpen(true)}
                disabled={availableBalance < 10}
                className="bg-gradient-to-r from-gold to-gold-light text-noir font-semibold hover:from-gold-dark hover:to-gold transition-all duration-300 btn-premium text-sm h-9"
              >
                <Send className="w-4 h-4 mr-1.5" />
                Solicitar Saque
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Balance overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/10 rounded-lg p-4 border border-gold/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Saldo Disponível
                </p>
                <p className="text-2xl font-bold text-gold-gradient tabular-nums">
                  €{animatedBalance.toFixed(2)}
                </p>
                {availableBalance < 10 && (
                  <p className="text-[10px] text-yellow-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Mín. €10.00
                  </p>
                )}
              </div>
              <div className="bg-secondary/10 rounded-lg p-4 border border-gold/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Total Levantado
                </p>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  €{totalWithdrawn.toFixed(2)}
                </p>
                {pendingWithdrawals > 0 && (
                  <p className="text-[10px] text-blue-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    €{pendingWithdrawals.toFixed(2)} pendente
                  </p>
                )}
              </div>
            </div>

            {/* Past withdrawals */}
            {withdrawals.length === 0 ? (
              <div className="py-8 text-center">
                <Banknote className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Ainda não efetuou nenhum saque.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[340px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader className="sticky top-0 bg-charcoal z-10">
                    <TableRow className="border-gold/10 hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                        Data
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                        Montante
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                        IBAN
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                        Estado
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w) => {
                      const conf =
                        withdrawalStatusConfig[w.status] ||
                        withdrawalStatusConfig.pending;
                      const StatusIcon = conf.icon;
                      return (
                        <TableRow key={w.id} className="border-gold/5">
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(w.createdAt), "dd MMM yyyy", {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell className="font-semibold text-sm">
                            €{w.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {w.iban.length > 8
                              ? `${w.iban.slice(0, 4)}••••${w.iban.slice(-4)}`
                              : `••••${w.iban.slice(-4)}`}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${conf.classes}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {conf.label}
                            </span>
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

      {/* Withdrawal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-gold/20 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-gold-gradient flex items-center gap-2">
              <Send className="w-5 h-5" />
              Solicitar Saque
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="bg-secondary/10 rounded-lg p-3 border border-gold/10 text-center">
              <p className="text-xs text-muted-foreground">Saldo Disponível</p>
              <p className="text-2xl font-bold text-gold">
                €{availableBalance.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-amount" className="text-label">
                Montante (€)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="withdraw-amount"
                  type="number"
                  min="10"
                  max={availableBalance}
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 bg-secondary/10 border-gold/20 focus:border-gold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-iban" className="text-label">
                IBAN
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="withdraw-iban"
                  type="text"
                  placeholder="PT50 0000 0000 0000 0000 0000 0"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="pl-10 bg-secondary/10 border-gold/20 focus:border-gold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-holder" className="text-label">
                Nome do Titular
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="withdraw-holder"
                  type="text"
                  placeholder="Nome completo"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="pl-10 bg-secondary/10 border-gold/20 focus:border-gold"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="flex-1 bg-gradient-to-r from-gold to-gold-light text-noir font-semibold hover:from-gold-dark hover:to-gold transition-all duration-300 btn-premium"
              >
                {withdrawing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-noir/30 border-t-noir rounded-full animate-spin" />
                    <span>A enviar...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Solicitar</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ═══════ Main Component ═══════ */
export function AffiliateDashboard() {
  const { setCurrentPage } = useStore();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [commissionPeriod, setCommissionPeriod] =
    useState<CommissionFilter>("30");

  /* Restore session from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem("alma_lik_affiliate");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AffiliateData;
        if (parsed?.id && parsed?.referralCode) {
          setAffiliate(parsed);
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem("alma_lik_affiliate");
      }
    }
  }, []);

  /* Fetch affiliate data when authenticated */
  useEffect(() => {
    if (!isAuthenticated || !affiliate?.id) return;
    let cancelled = false;

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const res = await fetch(`/api/affiliates/me?id=${affiliate.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar dados");
        if (cancelled) return;
        if (data.stats) setStats(data.stats);
        if (data.commissions) setCommissions(data.commissions);
        if (data.withdrawals) setWithdrawals(data.withdrawals);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Erro ao carregar dados";
        toast.error(message);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, affiliate?.id]);

  /* Filter commissions by period */
  const filteredCommissions = commissions.filter((c) => {
    if (commissionPeriod === "all") return true;
    const days = parseInt(commissionPeriod, 10);
    const cutoff = subDays(new Date(), days);
    return isAfter(new Date(c.createdAt), cutoff);
  });

  const handleLogin = useCallback((data: AffiliateData) => {
    setAffiliate(data);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("alma_lik_affiliate");
    setAffiliate(null);
    setStats(null);
    setCommissions([]);
    setWithdrawals([]);
    setIsAuthenticated(false);
    setDataLoading(true);
    toast.success("Sessão terminada com sucesso");
  }, []);

  /* Animated stat values */
  const animTotalEarned = useAnimatedCounter(stats?.totalEarned ?? 0);
  const animBalance = useAnimatedCounter(stats?.balance ?? 0);
  const animTotalOrders = useAnimatedCounter(stats?.totalOrders ?? 0);
  const animPendingCommissions = useAnimatedCounter(
    stats?.pendingCommissions ?? 0
  );

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="luxury-section min-h-screen pt-8 pb-20 px-4"
        >
          <div className="max-w-6xl mx-auto">
            {/* Back button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <button
                onClick={() => setCurrentPage("home")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar à Loja
              </button>
            </motion.div>
            <LoginScreen onLogin={handleLogin} />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="luxury-section min-h-screen pt-8 pb-20 px-4"
        >
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage("home")}
                  className="p-2 rounded-lg hover:bg-secondary/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-gold" />
                </button>
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl text-gold-gradient">
                    Painel do Parceiro
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <span className="text-gold font-medium">
                      {affiliate?.name}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gold/40" />
                    <span className="text-xs">{affiliate?.email}</span>
                    <ChevronRight className="w-3 h-3 text-gold/40" />
                    <Badge
                      variant="outline"
                      className="text-[10px] border-gold/20 text-gold/70"
                    >
                      {(affiliate?.commissionRate ?? 0) * 100}% comissão
                    </Badge>
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold-light transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Terminar Sessão
              </Button>
            </motion.div>

            <div className="gold-line" />

            {/* Referral Link — Prominent */}
            {affiliate?.referralCode && (
              <ReferralLinkSection referralCode={affiliate.referralCode} />
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Ganho"
                value={`€${animTotalEarned.toFixed(2)}`}
                icon={TrendingUp}
                delay={0.2}
                iconBgColor="bg-green-500/10"
                iconColor="text-green-400"
                trend="up"
                trendLabel="Comissões"
              />
              <StatCard
                label="Saldo Disponível"
                value={`€${animBalance.toFixed(2)}`}
                icon={Wallet}
                delay={0.25}
                iconBgColor="bg-gold/10"
                iconColor="text-gold"
              />
              <StatCard
                label="Total de Vendas"
                value={`${Math.round(animTotalOrders)}`}
                icon={DollarSign}
                delay={0.3}
                iconBgColor="bg-blue-500/10"
                iconColor="text-blue-400"
              />
              <StatCard
                label="Comissões Pendentes"
                value={`€${animPendingCommissions.toFixed(2)}`}
                icon={Clock}
                delay={0.35}
                iconBgColor="bg-yellow-500/10"
                iconColor="text-yellow-400"
              />
            </div>

            {/* Commission History Table */}
            <CommissionHistory
              commissions={filteredCommissions}
              loading={dataLoading}
              period={commissionPeriod}
              onPeriodChange={setCommissionPeriod}
            />

            {/* Withdrawal Section */}
            <WithdrawalSection
              affiliateId={affiliate?.id || ""}
              availableBalance={stats?.balance ?? 0}
              totalWithdrawn={stats?.totalWithdrawn ?? 0}
              pendingWithdrawals={stats?.pendingWithdrawals ?? 0}
              withdrawals={withdrawals}
              loading={dataLoading}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
