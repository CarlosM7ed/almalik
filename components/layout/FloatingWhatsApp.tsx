"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/351000000000?text=Olá! Gostaria de saber mais sobre os perfumes da Alma Lik.";
const STORAGE_KEY = "alma-lik-wa-dismissed";
const POPUP_DELAY_MS = 5000;
const POPUP_DURATION_MS = 8000;

export function FloatingWhatsApp() {
  const [showPopup, setShowPopup] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "true") {
        dismissedRef.current = true;
        return;
      }
    } catch {
      // localStorage unavailable – just show the popup
    }

    // Show popup after delay
    const showTimer = setTimeout(() => setShowPopup(true), POPUP_DELAY_MS);

    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      setShowPopup(false);
      try {
        localStorage.setItem(STORAGE_KEY, "true");
        dismissedRef.current = true;
      } catch {
        // ignore
      }
    }, POPUP_DELAY_MS + POPUP_DURATION_MS);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setShowPopup(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    dismissedRef.current = true;
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start">
      {/* Speech-bubble popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative mb-3 max-w-[220px] rounded-xl border border-[#c9a96e]/40 bg-[#1a1a1a]/95 px-4 py-3 shadow-xl backdrop-blur-sm"
          >
            {/* Caret / arrow pointing down to button */}
            <div className="absolute -bottom-[6px] left-6 h-3 w-3 rotate-45 border-b border-r border-[#c9a96e]/40 bg-[#1a1a1a]/95" />

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border border-[#c9a96e]/30 bg-[#1a1a1a] text-[#c9a96e]/60 transition-colors hover:text-[#c9a96e]"
              aria-label="Fechar"
            >
              <X className="h-3 w-3" />
            </button>

            <p className="text-sm leading-snug text-white/90">
              Precisa de ajuda?{" "}
              <span className="text-[#c9a96e]">Fale connosco!</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse ring */}
      <span className="absolute bottom-0 left-0 h-14 w-14">
        <span className="absolute inset-0 animate-[waPulse_2s_ease-out_infinite] rounded-full bg-[#25D366]/40" />
      </span>

      {/* Main button */}
      <motion.a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar via WhatsApp"
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.15 }}
        className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-shadow duration-300 hover:shadow-xl hover:shadow-[#25D366]/50"
      >
        <MessageCircle className="h-6 w-6 fill-white stroke-white" />
      </motion.a>
    </div>
  );
}
