"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Mail, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface StockNotificationProps {
  productId: string;
  productName: string;
  productSlug: string;
}

export function StockNotification({
  productId,
  productName,
}: StockNotificationProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Por favor, insira o seu email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/stock-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          productId,
          productName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        toast.success("Notificação registada!", {
          description: `Será avisado quando ${productName} estiver disponível.`,
        });
      } else {
        if (data.existing) {
          setSubmitted(true);
          toast.info("Já registado", {
            description: "Já existe uma notificação para este produto com este email.",
          });
        } else {
          setError(data.error || "Erro ao registar notificação");
        }
      }
    } catch {
      setError("Erro de ligação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state after close animation
      setTimeout(() => {
        setEmail("");
        setError("");
        setSubmitted(false);
        setLoading(false);
      }, 200);
    }
  };

  return (
    <>
      {/* Out of stock indicator + notify button */}
      <motion.div
        ref={(el) => {
          // This replaces the addToCartRef for out-of-stock products
        }}
        className="flex flex-col items-center gap-4 py-4"
      >
        <Badge
          variant="outline"
          className="border-red-500/30 bg-red-500/10 text-red-400 text-xs px-3 py-1"
        >
          Esgotado
        </Badge>

        <p className="text-sm text-muted-foreground text-center">
          Este produto encontra-se de momento esgotado.
        </p>

        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 px-5 py-5 font-semibold text-sm tracking-wider uppercase transition-all"
        >
          <Bell className="w-4 h-4 mr-2" />
          Notificar quando disponível
        </Button>
      </motion.div>

      {/* Notification Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md bg-charcoal border-gold/20 text-foreground">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-gold" />
            </div>
            <DialogTitle className="font-serif text-xl text-gold-gradient text-center">
              Notificar quando disponível
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-center mt-2">
              Será o primeiro a saber quando{" "}
              <span className="text-gold-light font-medium">{productName}</span>{" "}
              estiver de volta em stock.
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 pt-2"
              >
                {/* Email input */}
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="O seu endereço de email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit();
                      }}
                      className="pl-10 bg-noir/60 border-gold/20 focus:border-gold/50 focus:ring-1 focus:ring-gold/20 text-foreground placeholder:text-muted-foreground/60 h-12"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      {error}
                    </motion.p>
                  )}
                </div>

                {/* Privacy note */}
                <p className="text-[11px] text-muted-foreground/60 text-center">
                  Não partilhamos o seu email. Será notificado apenas quando o
                  produto estiver disponível.
                </p>

                {/* Submit button */}
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-gold via-gold-light to-gold-dark text-noir hover:opacity-90 font-semibold text-sm tracking-wider uppercase h-12 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      A registar...
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Registar Notificação
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center gap-4 pt-4 pb-2"
              >
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.15,
                  }}
                  className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-gold" />
                </motion.div>

                {/* Success text */}
                <div className="text-center space-y-2">
                  <p className="text-lg font-serif font-semibold text-gold-gradient">
                    Registo Efetuado!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enviaremos um email para{" "}
                    <span className="text-gold-light font-medium">{email}</span>{" "}
                    assim que{" "}
                    <span className="text-gold-light font-medium">
                      {productName}
                    </span>{" "}
                    estiver disponível.
                  </p>
                </div>

                {/* Gold decorative divider */}
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

                {/* Tips */}
                <div className="bg-noir/40 rounded-lg border border-gold/10 p-3 w-full">
                  <p className="text-xs text-muted-foreground text-center">
                    💡 Enquanto espera, explore as nossas{" "}
                    <span className="text-gold-light">fragrâncias relacionadas</span>{" "}
                    ou contacte-nos via WhatsApp para disponibilidade.
                  </p>
                </div>

                {/* Close button */}
                <Button
                  onClick={() => setOpen(false)}
                  variant="outline"
                  className="border-gold/30 text-gold hover:bg-gold/10 px-6 font-semibold text-sm tracking-wider uppercase mt-1"
                >
                  Fechar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
