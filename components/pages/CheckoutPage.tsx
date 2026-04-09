"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  User,
  Shield,
  Lock,
  ShoppingBag,
  Check,
  Gift,
  Tag,
  Truck,
  ChevronRight,
  ChevronLeft,
  Banknote,
  Smartphone,
  Building2,
  ChevronDown,
  Sparkles,
  Key,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const STEPS = [
  { label: "Dados Pessoais", icon: User },
  { label: "Morada", icon: MapPin },
  { label: "Confirmação", icon: CreditCard },
];

const PAYMENT_METHODS = [
  {
    id: "multibanco",
    label: "Multibanco",
    desc: "Referência gerada após confirmação",
    icon: Building2,
    delivery: "Recebe em 3 dias",
  },
  {
    id: "mbway",
    label: "MB WAY",
    desc: "Pagamento instantâneo pelo telemóvel",
    icon: Smartphone,
    delivery: "Recebe em 2 dias",
  },
  {
    id: "transferencia",
    label: "Transferência Bancária",
    desc: "Dados IBAN enviados por email",
    icon: CreditCard,
    delivery: "Recebe em 3-5 dias",
  },
  {
    id: "entrega",
    label: "Pagamento na Entrega",
    desc: "Pague quando receber o seu pedido",
    icon: Banknote,
    delivery: "Recebe em 2-4 dias",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export function CheckoutPage() {
  const {
    cart,
    cartTotal,
    clearCart,
    setCurrentPage,
    setLastOrderId,
    setLastOrderItems,
    setLastOrderTotal,
  } = useStore();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [giftWrap, setGiftWrap] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("entrega");
  const [itemsExpanded, setItemsExpanded] = useState(true);
  const [orderNotes, setOrderNotes] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "PT",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Auto-format Portuguese postal code (####-###)
  const handlePostalCodeChange = (val: string) => {
    if (form.country === "PT") {
      const digits = val.replace(/\D/g, "").slice(0, 7);
      if (digits.length <= 4) {
        updateField("postalCode", digits);
      } else {
        updateField("postalCode", `${digits.slice(0, 4)}-${digits.slice(4)}`);
      }
    } else {
      updateField("postalCode", val);
    }
  };

  const subtotal = cartTotal();
  const giftWrapCost = giftWrap ? 3.99 : 0;
  const discount = promoApplied ? subtotal * promoDiscount : 0;
  const total = subtotal - discount + giftWrapCost;

  const applyPromoCode = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === "ALMALIK10") {
      setPromoApplied(true);
      setPromoDiscount(0.1);
      toast.success("Código promocional aplicado!", {
        description: "Desconto de 10% aplicado ao subtotal.",
      });
    } else if (code === "") {
      toast.error("Insira um código promocional");
    } else {
      toast.error("Código inválido", {
        description: "O código introduzido não é válido.",
      });
    }
  };

  const removePromoCode = () => {
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoCode("");
    toast.info("Código promocional removido");
  };

  const validateStep1 = (): boolean => {
    if (!form.customerName.trim()) {
      toast.error("Nome é obrigatório");
      return false;
    }
    if (!form.customerEmail.trim() || !/\S+@\S+\.\S+/.test(form.customerEmail)) {
      toast.error("Email válido é obrigatório");
      return false;
    }
    if (!form.customerPhone.trim()) {
      toast.error("Telefone é obrigatório");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!form.address.trim()) {
      toast.error("Morada é obrigatória");
      return false;
    }
    if (!form.city.trim()) {
      toast.error("Cidade é obrigatória");
      return false;
    }
    if (!form.postalCode.trim()) {
      toast.error("Código postal é obrigatório");
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  // Read affiliate cookie for invisible tracking
  const getAffiliateRef = () => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/(?:^|; )alma_lik_ref=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error("Sua sacola está vazia");
      return;
    }

    setLoading(true);
    try {
      const affiliateRef = getAffiliateRef();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod:
            PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label || "Pagamento na Entrega",
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          total,
          giftWrap,
          notes: orderNotes,
          discount: promoApplied ? discount : 0,
          affiliateRef,
        }),
      });
      const data = await res.json();
      if (data.order) {
        toast.success("Pedido realizado com sucesso!");
        setLastOrderId(data.order.id);
        setLastOrderItems([...cart]);
        setLastOrderTotal(total);
        clearCart();
        setCurrentPage("order-success");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      toast.error("Erro ao processar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-gold/30 mx-auto" />
          <p className="text-muted-foreground text-lg">Sua sacola está vazia</p>
          <Button
            onClick={() => setCurrentPage("catalog")}
            variant="outline"
            className="border-gold/30 text-gold hover:bg-gold/10"
          >
            Explorar Catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => setCurrentPage("catalog")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Catálogo
          </button>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">
            Finalizar Compra
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete seus dados para finalizar o pedido
          </p>
        </motion.div>

        {/* Stepper with gold connector lines */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {STEPS.map((s, i) => {
              const stepNum = i + 1;
              const isCompleted = step > stepNum;
              const isCurrent = step === stepNum;
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                      transition={isCurrent ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative ${
                        isCompleted
                          ? "bg-gold border-gold text-noir"
                          : isCurrent
                            ? "border-gold text-gold bg-gold/10"
                            : "border-gold/20 text-muted-foreground bg-secondary/5"
                      }`}
                    >
                      {isCompleted && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gold/30"
                          animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      {isCompleted ? (
                        <Check className="w-5 h-5" strokeWidth={3} />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </motion.div>
                    <span
                      className={`text-xs mt-2 font-medium transition-colors duration-500 ${
                        isCompleted
                          ? "text-gold"
                          : isCurrent
                            ? "text-gold"
                            : "text-muted-foreground/50"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-3 mt-[-1.25rem]">
                      <div className="h-[2px] bg-gold/10 relative overflow-hidden rounded-full">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{
                            width: isCompleted ? "100%" : isCurrent ? "50%" : "0%",
                          }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          style={{
                            background: isCompleted
                              ? "linear-gradient(90deg, #c9a96e, #e8d5a3)"
                              : "linear-gradient(90deg, #c9a96e, rgba(201,169,110,0.3))",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Steps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait" custom={direction}>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="p-6 rounded-xl border border-gold/10 bg-secondary/5 space-y-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-gold" />
                    <h2 className="font-serif text-xl font-semibold text-gold-gradient">
                      Dados Pessoais
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Nome completo *
                      </Label>
                      <Input
                        value={form.customerName}
                        onChange={(e) => updateField("customerName", e.target.value)}
                        placeholder="Seu nome"
                        className="bg-secondary/30 border-gold/10 focus:border-gold/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Email *
                      </Label>
                      <Input
                        type="email"
                        value={form.customerEmail}
                        onChange={(e) => updateField("customerEmail", e.target.value)}
                        placeholder="seu@email.com"
                        className="bg-secondary/30 border-gold/10 focus:border-gold/40"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Telefone *
                    </Label>
                    <Input
                      value={form.customerPhone}
                      onChange={(e) => updateField("customerPhone", e.target.value)}
                      placeholder="+351 912 345 678"
                      className="bg-secondary/30 border-gold/10 focus:border-gold/40"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={goNext}
                      className="bg-gold text-noir hover:bg-gold-light font-semibold px-8"
                    >
                      Continuar
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Address */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="p-6 rounded-xl border border-gold/10 bg-secondary/5 space-y-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-gold" />
                    <h2 className="font-serif text-xl font-semibold text-gold-gradient">
                      Morada de Entrega
                    </h2>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Morada *
                    </Label>
                    <Input
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="Rua, número, andar"
                      className="bg-secondary/30 border-gold/10 focus:border-gold/40"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Cidade *
                      </Label>
                      <Input
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Sua cidade"
                        className="bg-secondary/30 border-gold/10 focus:border-gold/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Código Postal *
                      </Label>
                      <Input
                        value={form.postalCode}
                        onChange={(e) => handlePostalCodeChange(e.target.value)}
                        placeholder={form.country === "PT" ? "0000-000" : "Código postal"}
                        maxLength={form.country === "PT" ? 8 : undefined}
                        className="bg-secondary/30 border-gold/10 focus:border-gold/40"
                      />
                      {form.country === "PT" && form.postalCode.length > 0 && !/^\d{4}-\d{3}$/.test(form.postalCode) && (
                        <p className="text-[10px] text-amber-500/70">
                          Formato: 0000-000
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      País *
                    </Label>
                    <div className="flex gap-3">
                      {["PT", "ES"].map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            updateField("country", c);
                            if (c !== form.country) updateField("postalCode", "");
                          }}
                          className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                            form.country === c
                              ? "border-gold bg-gold/10 text-gold"
                              : "border-gold/10 bg-secondary/20 text-muted-foreground hover:border-gold/30"
                          }`}
                        >
                          {c === "PT" ? "🇵🇹 Portugal" : "🇪🇸 España"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button
                      onClick={goBack}
                      variant="outline"
                      className="border-gold/30 text-gold hover:bg-gold/10"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Voltar
                    </Button>
                    <Button
                      onClick={goNext}
                      className="bg-gold text-noir hover:bg-gold-light font-semibold px-8"
                    >
                      Continuar
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Confirm */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="space-y-5"
                >
                  {/* Payment Method */}
                  <div className="p-6 rounded-xl border border-gold/10 bg-secondary/5">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-5 h-5 text-gold" />
                      <h2 className="font-serif text-xl font-semibold text-gold-gradient">
                        Método de Pagamento
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PAYMENT_METHODS.map((pm) => {
                        const Icon = pm.icon;
                        const isSelected = paymentMethod === pm.id;
                        return (
                          <motion.button
                            key={pm.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPaymentMethod(pm.id)}
                            className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all duration-300 relative overflow-hidden ${
                              isSelected
                                ? "border-gold bg-gold/5 gold-glow"
                                : "border-gold/10 bg-secondary/20 hover:border-gold/30 hover:bg-secondary/30"
                            }`}
                          >
                            {/* Gold checkmark overlay on selected */}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center"
                              >
                                <Check className="w-3 h-3 text-noir" strokeWidth={3} />
                              </motion.div>
                            )}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? "bg-gold/15" : "bg-secondary/30"
                            }`}>
                              <Icon className={`w-5 h-5 ${isSelected ? "text-gold" : "text-muted-foreground"}`} />
                            </div>
                            <div className="pr-6">
                              <p
                                className={`text-sm font-medium ${isSelected ? "text-gold" : ""}`}
                              >
                                {pm.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {pm.desc}
                              </p>
                              <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${isSelected ? "text-gold/80" : "text-muted-foreground/60"}`}>
                                <Clock className="w-3 h-3" />
                                {pm.delivery}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="p-6 rounded-xl border border-gold/10 bg-secondary/5">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="w-5 h-5 text-gold" />
                      <h2 className="font-serif text-xl font-semibold text-gold-gradient">
                        Código Promocional
                      </h2>
                    </div>
                    {promoApplied ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-500" />
                            </div>
                            <span className="text-sm font-medium text-green-400">
                              ALMALIK10 — 10% de desconto
                            </span>
                          </div>
                          <button
                            onClick={removePromoCode}
                            className="text-xs text-muted-foreground hover:text-gold transition-colors underline"
                          >
                            Remover
                          </button>
                        </div>
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-green-500/70 mt-1.5 ml-7"
                        >
                          Poupa €{discount.toFixed(2)} nesta encomenda
                        </motion.p>
                      </motion.div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Código promocional"
                          className="bg-secondary/30 border-gold/30 focus:border-gold/50 focus:ring-1 focus:ring-gold/20 uppercase"
                          onKeyDown={(e) => e.key === "Enter" && applyPromoCode()}
                        />
                        <Button
                          onClick={applyPromoCode}
                          variant="outline"
                          className="border-gold/30 text-gold hover:bg-gold/10 px-6 whitespace-nowrap"
                        >
                          Aplicar
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Gift Wrap */}
                  <div className="p-6 rounded-xl border border-gold/10 bg-secondary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-12 h-12 rounded-lg border border-gold/30 overflow-hidden flex-shrink-0"
                        >
                          <img
                            src="/images/gift-box.png"
                            alt="Embrulho de presente"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                        <div>
                          <p className="text-sm font-medium">
                            Embrulho de presente
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Adicione um toque especial à sua encomenda
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gold">+€3.99</span>
                        <Switch
                          checked={giftWrap}
                          onCheckedChange={setGiftWrap}
                          className="data-[state=checked]:bg-gold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Items Review - Resumo do Pedido */}
                  <div className="p-6 rounded-xl border border-gold/10 bg-secondary/5">
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingBag className="w-5 h-5 text-gold" />
                      <h2 className="font-serif text-xl font-semibold text-gold-gradient">
                        Resumo do Pedido
                      </h2>
                    </div>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                      {cart.map((item, idx) => (
                        <div key={item.id}>
                          {idx > 0 && <div className="gold-line my-3" />}
                          <div
                            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20"
                          >
                            <div className="w-14 h-14 rounded-md bg-secondary/30 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gold/5">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ShoppingBag className="w-6 h-6 text-gold/30" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {item.size && (
                                  <span className="text-[10px] text-gold/60 bg-gold/10 border border-gold/15 rounded px-1.5 py-0.5 font-medium">
                                    {item.size}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  Qtd: {item.quantity} × €{item.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-gold tabular-nums">
                              €{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div className="p-6 rounded-xl border border-gold/10 bg-secondary/5">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-gold" />
                      <h2 className="font-serif text-xl font-semibold text-gold-gradient">
                        Notas do Pedido
                      </h2>
                    </div>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Instruções especiais para a entrega, mensagem de presente, etc."
                      rows={3}
                      className="w-full bg-secondary/30 border-gold/10 focus:border-gold/40 rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none transition-colors"
                    />
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                      Opcional — as notas serão incluídas no seu pedido
                    </p>
                  </div>

                  {/* Shipping Info */}
                  <div className="p-4 rounded-lg bg-gold/5 border border-gold/10 flex items-center gap-3">
                    <Truck className="w-5 h-5 text-gold flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Entrega estimada em <span className="text-gold font-medium">3-5 dias úteis</span> ·{" "}
                      Envio grátis para Portugal e Espanha
                    </p>
                  </div>

                  {/* Security Badges */}
                  <div className="flex items-center justify-center gap-6 pt-2">
                    <div className="flex flex-col items-center gap-1">
                      <Shield className="w-5 h-5 text-gold/50" />
                      <span className="text-[10px] text-muted-foreground">Dados protegidos</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Lock className="w-5 h-5 text-gold/50" />
                      <span className="text-[10px] text-muted-foreground">Pagamento seguro</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Key className="w-5 h-5 text-gold/50" />
                      <span className="text-[10px] text-muted-foreground">Encriptação SSL</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      onClick={goBack}
                      variant="outline"
                      className="border-gold/30 text-gold hover:bg-gold/10"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-gold text-noir hover:bg-gold-light font-semibold px-8 py-5 text-sm tracking-wider uppercase btn-premium"
                    >
                      {loading ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="inline-block w-4 h-4 border-2 border-noir/30 border-t-noir rounded-full mr-2"
                          />
                          A processar...
                        </>
                      ) : (
                        <>
                          Confirmar Pedido
                          <Shield className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 p-6 rounded-xl border border-gold/10 luxury-section space-y-4">
              <h2 className="font-serif text-lg font-semibold text-gold-gradient">
                Resumo do Pedido
              </h2>
              <div className="gold-line" />

              {/* Expandable Items Section */}
              <div>
                <button
                  onClick={() => setItemsExpanded(!itemsExpanded)}
                  className="flex items-center justify-between w-full group/item"
                >
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gold/50" />
                    Itens ({cart.length})
                  </span>
                  <motion.span
                    animate={{ rotate: itemsExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {itemsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 mt-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {cart.map((item, idx) => (
                          <div key={item.id}>
                            {idx > 0 && <div className="gold-line my-2" />}
                            <div className="flex items-center gap-3">
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
                                <p className="text-xs font-medium truncate">{item.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  Qtd: {item.quantity}
                                </p>
                              </div>
                              <p className="text-xs font-semibold text-gold tabular-nums">
                                €{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="gold-line" />

              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>

                {promoApplied && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-green-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Desconto (10%)
                    </span>
                    <span className="text-green-400">-€{discount.toFixed(2)}</span>
                  </motion.div>
                )}

                {promoApplied && discount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/15"
                  >
                    <Sparkles className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <p className="text-[11px] text-green-400">
                      Poupa <span className="font-bold">€{discount.toFixed(2)}</span> com este código
                    </p>
                  </motion.div>
                )}

                {giftWrap && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      Embrulho de presente
                    </span>
                    <span>€{giftWrapCost.toFixed(2)}</span>
                  </motion.div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envio</span>
                  <span className="text-gold font-medium">Grátis</span>
                </div>
              </div>

              <div className="gold-line" />

              <div className="flex justify-between text-lg">
                <span className="font-medium">Total</span>
                <span className="font-bold text-gold-gradient text-xl">
                  €{total.toFixed(2)}
                </span>
              </div>

              {/* Security badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gold/5 border border-gold/10">
                <Lock className="w-4 h-4 text-gold flex-shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Dados protegidos e encriptados · Compra 100% segura
                </p>
              </div>

              {/* Step indicators for sidebar */}
              <div className="flex gap-1.5 pt-1">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                      step >= s ? "bg-gold" : "bg-gold/15"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Passo {step} de 3
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
