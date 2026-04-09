"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "alma-lik-age-verified";

export function AgeVerification() {
  const [isVisible, setIsVisible] = useState(false);
  const [isUnderage, setIsUnderage] = useState(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Avoid running multiple times in strict mode
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Check if already verified
    const isVerified = localStorage.getItem(STORAGE_KEY);
    if (isVerified) return;

    // 1 second delay to avoid flash
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleVerify = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    toast.success("Bem-vindo à Alma Lik!", {
      description: "Aproveite a nossa coleção exclusiva de perfumes.",
    });
  };

  const handleUnderage = () => {
    setIsUnderage(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-noir/85 glass p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-md rounded-2xl border border-gold/20 bg-charcoal p-8 sm:p-10 shadow-2xl"
          >
            {/* Gold top border accent */}
            <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-gold to-transparent" />

            {/* Ornamental diamond divider */}
            <div className="ornament-diamond mb-6">
              <div className="ornament-diamond-icon" />
            </div>

            {/* Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-noir/60">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-7 w-7 text-gold" />
              </motion.div>
            </div>

            {/* Title */}
            <h2 className="mb-3 text-center font-serif text-2xl font-bold text-gold-gradient">
              Verificação de Idade
            </h2>

            {/* Description */}
            <p className="mb-8 text-center text-sm leading-relaxed text-muted-foreground">
              Este site contém conteúdo sobre bebidas alcoólicas e perfumaria.{" "}
              <span className="text-foreground/80">
                Deve ter mais de 18 anos para continuar.
              </span>
            </p>

            {/* Underage State */}
            <AnimatePresence mode="wait">
              {isUnderage ? (
                <motion.div
                  key="underage"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <ShieldCheck className="h-5 w-5 text-red-400" />
                    <p className="text-center text-sm font-medium text-red-400">
                      Deve ter mais de 18 anos para aceder
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      window.location.href = "https://www.google.com";
                    }}
                    className="w-full rounded-xl border border-gold/20 bg-noir/60 py-3 text-sm font-medium text-gold transition-all hover:border-gold/40 hover:bg-noir/80"
                  >
                    Sair do Site
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="buttons"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-3"
                >
                  {/* Confirm Button */}
                  <button
                    onClick={handleVerify}
                    className="btn-premium w-full rounded-xl bg-gradient-to-r from-gold to-gold-light py-3.5 text-sm font-semibold text-noir shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40"
                  >
                    Tenho 18 anos ou mais
                  </button>

                  {/* Decline Button */}
                  <button
                    onClick={handleUnderage}
                    className="w-full rounded-xl border border-gold/20 bg-noir/60 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-gold/30 hover:text-foreground/80"
                  >
                    Sou menor de idade
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom ornament */}
            <div className="ornament-diamond mt-6">
              <div className="ornament-diamond-icon" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
