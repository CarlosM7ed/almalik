"use client";
import { Heart, Shield, Truck, RotateCcw, Instagram, Facebook, Twitter, MessageCircle, Send, MapPin, Calendar, Star, ArrowUp, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { useState, useRef } from "react";
import { toast } from "sonner";

const socialPlatforms = [
  { icon: Instagram, name: "Instagram", className: "social-instagram" },
  { icon: Facebook, name: "Facebook", className: "social-facebook" },
  { icon: Twitter, name: "Twitter", className: "social-twitter" },
];

const paymentMethodBadges = [
  { name: "Multibanco" },
  { name: "MB WAY" },
  { name: "Transferência" },
  { name: "Pagamento na Entrega" },
];

export function Footer() {
  const { setCurrentPage } = useStore();
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<null | 'success' | 'error'>(null);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleNewsletter = async () => {
    setNewsletterStatus(null);
    setNewsletterMessage("");
    if (!email.trim()) {
      setNewsletterStatus('error');
      setNewsletterMessage("Por favor, insira o seu email.");
      return;
    }
    if (!isValidEmail(email)) {
      setNewsletterStatus('error');
      setNewsletterMessage("Por favor, insira um email válido.");
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
        setNewsletterStatus('success');
        setNewsletterMessage("Subscrição confirmada! Obrigado por se juntar a nós.");
        setEmail("");
      } else {
        const data = await res.json();
        setNewsletterStatus('error');
        setNewsletterMessage(data.error || "Erro ao subscrever. Tente novamente.");
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterMessage("Erro de ligação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer-glass border-t border-gold/10 noise-overlay gold-border-top">
      {/* Decorative gold line above footer */}
      <div className="footer-gold-line" />
      {/* Animated ALMA LIK logo at top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient-shimmer tracking-[0.15em] text-premium-shadow">
            ALMA LIK
          </h2>
          <div className="ornament-diamond mt-4 max-w-[200px] mx-auto">
            <div className="ornament-diamond-icon" />
          </div>
        </motion.div>
      </div>

      {/* Brand Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Top gold-line divider */}
          <div className="gold-line mb-6" />

          <div className="text-center max-w-2xl mx-auto py-4">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-gold-gradient tracking-wider mb-3">
              Sobre a Alma Lik
            </h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Nascida da paixão pelas fragrâncias de excelência, a Alma Lik cura perfumes que transcendem o ordinário. Cada fragrância da nossa coleção é cuidadosamente selecionada das mais prestigiadas casas de perfumaria árabe, offering uma experiência olfativa única que revela a verdadeira essência de quem a usa.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gold/50">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Fundada em 2024
              </span>
              <span className="w-1 h-1 rounded-full bg-gold/30" />
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Lisboa, Portugal
              </span>
            </div>
          </div>

          {/* Bottom gold-line divider */}
          <div className="gold-line mt-6" />
        </motion.div>
      </div>

      {/* Trust bar */}
      <div className="border-b border-gold/10 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: Shield, title: "Autenticidade Garantida", desc: "100% originais" },
              { icon: Truck, title: "Envio Seguro", desc: "Entrega rastreada" },
              { icon: RotateCcw, title: "Troca Fácil", desc: "30 dias para troca" },
              { icon: Heart, title: "Atendimento Premium", desc: "Suporte dedicado" },
              { icon: MessageCircle, title: "WhatsApp", desc: "Suporte direto", href: "https://wa.me/351000000000", external: true },
            ].map((item, idx) => {
              const content = (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                  className="flex flex-col items-center text-center gap-2 card-hover-glow rounded-xl p-2"
                >
                  <div className="w-14 h-14 rounded-full border border-gold/50 flex items-center justify-center bg-gold/5 relative">
                    {/* Animated gold ring pulse */}
                    <motion.div
                      className="absolute inset-0 rounded-full border border-gold/30"
                      animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
                    />
                    <item.icon className="w-7 h-7 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-gold/60">{item.desc}</p>
                  </div>
                </motion.div>
              );
              return "href" in item && item.href ? (
                <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  {content}
                </a>
              ) : (
                <div key={item.title}>{content}</div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-gold-gradient tracking-wider">ALMA LIK</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Perfumaria curada de alto padrão. Cada fragrância selecionada para revelar a sua essência.
            </p>
            {/* Social links with tooltips and rotate/scale animation */}
            <div className="flex gap-3">
              {socialPlatforms.map((social) => (
                <motion.button
                  key={social.name}
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold/70 social-hover-brand ${social.className} transition-all duration-300 relative group/social`}
                  title={social.name}
                >
                  <social.icon className="w-5 h-5 transition-transform duration-300 group-hover/social:rotate-12" />
                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal border border-gold/30 text-gold text-[10px] px-2 py-1 rounded-md opacity-0 group-hover/social:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap tracking-wider uppercase">
                    {social.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase text-gold-light mb-4">Explorar</h4>
            <ul className="space-y-3">
              {[
                { label: "Catálogo", page: "catalog" },
                { label: "Sommelier IA", page: "ai-sommelier" },
                { label: "Guia de Fragrâncias", page: "guide" },
                { label: "Minha Conta", page: "my-account" },
              ].map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => { setCurrentPage(link.page as "catalog"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="group flex items-center gap-2 relative pl-3 text-sm text-muted-foreground hover:text-gold-light transition-colors animated-underline"
                  >
                    <span className="absolute left-0 top-0 bottom-0 w-px bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold tracking-widest uppercase text-gold-light mb-4">Categorias</h4>
            <ul className="space-y-3">
              {["Masculino", "Feminino", "Unissex", "Kits"].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      useStore.getState().setFilter("gender", cat.toLowerCase());
                      useStore.getState().setCurrentPage("catalog");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group flex items-center gap-2 relative pl-3 text-sm text-muted-foreground hover:text-gold-light transition-colors animated-underline"
                  >
                    <span className="absolute left-0 top-0 bottom-0 w-px bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="border-l-2 border-gold/40 pl-4">
            {/* Gold Diamond Ornament */}
            <div className="ornament-diamond mb-4">
              <div className="ornament-diamond-icon" />
            </div>
            <h4 className="text-sm font-semibold tracking-widest uppercase text-gold-light mb-2">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-1">
              Receba novidades e ofertas exclusivas.
            </p>
            <p className="text-xs text-gold/50 mb-4 flex items-center gap-1">
              <span className="inline-flex items-center gap-1">
                <Heart className="w-3 h-3" />
              </span>
              Junte-se a +2.000 clientes satisfeitos
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-0">
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNewsletter(); }}
                  placeholder={isFocused ? "Subscreva a nossa newsletter" : "O seu email..."}
                  className="w-full bg-background/80 border border-gold/30 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNewsletter}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gold text-noir px-4 py-2 rounded-md text-sm font-semibold hover:bg-gold-light transition-colors flex items-center justify-center gap-2 whitespace-nowrap btn-gold-glow disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <motion.span
                    whileHover={{ rotate: -45 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.span>
                )}
                <span>{isSubmitting ? "A subscrever..." : "Subscrever"}</span>
              </motion.button>
            </div>
            <p className="text-[10px] text-foreground/30 mt-3 leading-relaxed">
              Ao subscrever concorda com a nossa{" "}
              <button
                onClick={() => {
                  setCurrentPage("my-account");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-gold/40 hover:text-gold/60 underline underline-offset-2 transition-colors"
              >
                Política de Privacidade
              </button>
            </p>
            {/* Inline newsletter status message */}
            <AnimatePresence>
              {newsletterStatus && newsletterMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -5, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -5, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-2 mt-3 p-2.5 rounded-md text-xs leading-relaxed ${
                    newsletterStatus === 'success'
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {newsletterStatus === 'success' ? (
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{newsletterMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Payment Methods Row */}
      <div className="border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-5"
          >
            <p className="text-xs text-foreground/40 tracking-widest uppercase mb-4">
              Métodos de Pagamento Aceites
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              {paymentMethodBadges.map((method) => (
                <span
                  key={method.name}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-gold/20 bg-gold/5 text-foreground/50 text-xs font-medium tracking-wide hover:border-gold/40 hover:text-gold/70 hover:bg-gold/10 transition-all duration-300"
                >
                  {method.name}
                </span>
              ))}
            </div>
            {/* Shipping Info */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <Truck className="w-4 h-4 text-gold/50" />
              <span className="text-xs text-foreground/40 tracking-wide hover:text-gold/60 transition-colors">
                Enviamos para toda a Europa
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Social Proof Row */}
      <div className="border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-1.5 text-sm"
          >
            <div className="flex items-center gap-0.5 text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-gold" />
              ))}
              <span className="ml-0.5">
                <Star className="w-3.5 h-3.5 fill-gold/60" />
              </span>
            </div>
            <span className="text-foreground/40 text-xs">
              <span className="text-gold/60 font-semibold">4.9</span>/5 baseado em 200+ avaliações
            </span>
          </motion.div>
        </div>
      </div>

      {/* Voltar ao topo */}
      <div className="border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center mb-4">
            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 text-xs text-gold/50 hover:text-gold transition-colors group animated-underline"
            >
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </motion.span>
              <span>Voltar ao topo</span>
            </motion.button>
          </div>

          {/* Bottom Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-foreground/40 text-center sm:text-left">
              Feito com <Heart className="w-3 h-3 inline text-gold/60" /> em Portugal
              <span className="mx-1.5 text-foreground/20">·</span>
              © <span className="text-gold/50 text-shadow-gold">{new Date().getFullYear()}</span> <span className="text-shadow-gold text-gold/60">Alma Lik</span>. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => {
                  setCurrentPage("my-account");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-foreground/40 hover:text-gold/70 transition-colors animated-underline"
              >
                Política de Privacidade
              </button>
              <span className="text-foreground/15">·</span>
              <button
                onClick={() => {
                  setCurrentPage("my-account");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-foreground/40 hover:text-gold/70 transition-colors animated-underline"
              >
                Termos e Condições
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
