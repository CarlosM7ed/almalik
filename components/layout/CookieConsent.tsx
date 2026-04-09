"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Cookie, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const COOKIE_KEY = "alma-lik-cookies";

interface CookiePreferences {
  necessary: boolean;
  statistics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    statistics: false,
    marketing: false,
  });

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_KEY);
    if (!accepted) {
      // Wait for age verification to be dismissed first (it uses z-[70] vs our z-[60])
      const ageVerified = localStorage.getItem("alma-lik-age-verified");
      const delay = ageVerified ? 3000 : 1500;
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    const prefs = { necessary: true, statistics: true, marketing: true };
    localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs));
    setVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(preferences));
    setVisible(false);
  };

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === "necessary") return; // Can't disable necessary
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[60]"
        >
          <div className="bg-noir/95 glass border-t border-gold/20 shadow-2xl shadow-black/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Icon + Text */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Cookie className="w-5 h-5 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      Utilizamos cookies para melhorar a sua experiência. Ao continuar a navegar, concorda com a nossa{" "}
                      <span className="text-gold-light font-medium underline underline-offset-2 cursor-pointer hover:text-gold">
                        política de privacidade
                      </span>.
                    </p>

                    {/* Preferences dropdown */}
                    <AnimatePresence>
                      {showPreferences && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 p-4 rounded-lg border border-gold/10 bg-secondary/30 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-foreground/80">Necessários</p>
                                <p className="text-xs text-muted-foreground">Essenciais para o funcionamento do site</p>
                              </div>
                              <Switch checked disabled className="data-[state=checked]:bg-gold" />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-foreground/80">Estatísticos</p>
                                <p className="text-xs text-muted-foreground">Ajudam-nos a melhorar o site</p>
                              </div>
                              <Switch
                                checked={preferences.statistics}
                                onCheckedChange={() => handleToggle("statistics")}
                                className="data-[state=checked]:bg-gold"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-foreground/80">Marketing</p>
                                <p className="text-xs text-muted-foreground">Para personalizar a sua experiência</p>
                              </div>
                              <Switch
                                checked={preferences.marketing}
                                onCheckedChange={() => handleToggle("marketing")}
                                className="data-[state=checked]:bg-gold"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => setShowPreferences(!showPreferences)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gold/20 text-gold/70 text-xs font-medium hover:bg-gold/5 hover:text-gold transition-all"
                  >
                    Preferências
                    <ChevronDown className={`w-3 h-3 transition-transform ${showPreferences ? "rotate-180" : ""}`} />
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="px-4 py-2 rounded-lg border border-gold/20 text-gold/70 text-xs font-medium hover:bg-gold/5 hover:text-gold transition-all"
                  >
                    Guardar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAccept}
                    className="px-5 py-2 rounded-lg bg-gold text-noir text-xs font-bold hover:bg-gold-light shadow-lg shadow-gold/20 transition-colors"
                  >
                    Aceitar Todos
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
