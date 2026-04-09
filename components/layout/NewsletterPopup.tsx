"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const SUBSCRIBED_KEY = "alma-lik-newsletter-subscribed";
const DISMISSED_KEY = "alma-lik-newsletter-dismissed";
const EXIT_THRESHOLD = 10; // pixels from top to trigger exit intent
const TIMER_DELAY = 30000; // 30 seconds

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const triggeredRef = useRef(false);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldShow = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    if (localStorage.getItem(SUBSCRIBED_KEY)) return false;
    if (localStorage.getItem(DISMISSED_KEY)) return false;
    return true;
  }, []);

  const triggerPopup = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    if (shouldShow()) {
      setIsVisible(true);
    }
  }, [shouldShow]);

  // Exit intent + 30s timer
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= EXIT_THRESHOLD) {
        triggerPopup();
      }
    };

    const timer = setTimeout(() => {
      triggerPopup();
    }, TIMER_DELAY);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [triggerPopup]);

  // Auto-close success after 4 seconds
  useEffect(() => {
    if (isSuccess) {
      autoCloseTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    }
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Por favor, introduza o seu email.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Por favor, introduza um email válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        localStorage.setItem(SUBSCRIBED_KEY, "true");
        toast.success("Subscrição realizada com sucesso!");
        setIsSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Ocorreu um erro. Tente novamente.");
      }
    } catch {
      setError("Erro de ligação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setIsVisible(false);
  };

  const handleClose = () => {
    if (!isSuccess) {
      handleDismiss();
    } else {
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[58] flex items-center justify-center px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismiss();
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-noir/80 glass"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-2xl border border-gold/20 bg-charcoal p-8 sm:p-10 shadow-2xl shadow-black/60"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Diamond ornament */}
                  <div className="flex justify-center mb-5">
                    <div className="ornament-diamond">
                      <div className="ornament-diamond-icon" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="font-serif text-gold-gradient text-2xl text-center mb-3">
                    Receba Ofertas Exclusivas
                  </h2>

                  {/* Body text */}
                  <p className="text-foreground/70 text-sm text-center leading-relaxed mb-8">
                    Subscreva a nossa newsletter e receba 10% de desconto na sua primeira compra, além de acesso
                    antecipado a novas fragrâncias e promoções exclusivas.
                  </p>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email input */}
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="O seu endereço de email"
                        disabled={isSubmitting}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-noir/60 border border-gold/20 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 focus:shadow-[0_0_20px_rgba(201,169,110,0.08)] transition-all disabled:opacity-50"
                      />
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-destructive text-xs"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={!isSubmitting ? { scale: 1.02, boxShadow: "0 0 24px rgba(201,169,110,0.25)" } : {}}
                      whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                      className="w-full py-3.5 rounded-xl bg-gold text-noir font-bold text-sm tracking-wide hover:bg-gold-light shadow-lg shadow-gold/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          A submeter...
                        </>
                      ) : (
                        "Subscrever"
                      )}
                    </motion.button>
                  </form>

                  {/* Terms text */}
                  <p className="text-muted-foreground/50 text-[11px] text-center mt-4 leading-relaxed">
                    Ao subscrever, concorda com a nossa{" "}
                    <span className="text-gold/50 underline underline-offset-1">Política de Privacidade</span>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex flex-col items-center text-center py-4"
                >
                  {/* Animated gold checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                    className="mb-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center">
                      <CheckCircle className="w-9 h-9 text-gold" strokeWidth={1.5} />
                    </div>
                  </motion.div>

                  {/* Success heading */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="font-serif text-gold-gradient text-2xl mb-3"
                  >
                    Bem-vindo à família Alma Lik!
                  </motion.h2>

                  {/* Success body */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-foreground/70 text-sm leading-relaxed"
                  >
                    Verifique o seu email para o código de desconto de 10%.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
