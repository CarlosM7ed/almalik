"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartSheet } from "@/components/layout/CartSheet";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { QuickViewModal } from "@/components/products/QuickViewModal";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { NewsletterPopup } from "@/components/layout/NewsletterPopup";
import { AgeVerification } from "@/components/layout/AgeVerification";
import { ProductCompareBar } from "@/components/products/ProductCompareBar";
import { useStore } from "@/lib/store";
import { HomePage } from "@/components/pages/HomePage";
import { CatalogPage } from "@/components/pages/CatalogPage";
import { ProductPage } from "@/components/pages/ProductPage";
import { CheckoutPage } from "@/components/pages/CheckoutPage";
import { AISommelierPage } from "@/components/pages/AISommelierPage";
import { GuidePage } from "@/components/pages/GuidePage";
import { MyAccountPage } from "@/components/pages/MyAccountPage";
import { AdminPage } from "@/components/pages/AdminPage";
import { OrderSuccessPage } from "@/components/pages/OrderSuccessPage";
import { AffiliateDashboard } from "@/components/pages/AffiliateDashboard";
import { AffiliateTracker } from "@/components/layout/AffiliateTracker";

function BackToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gold text-noir flex items-center justify-center shadow-lg shadow-gold/30 hover:bg-gold-light transition-colors"
          aria-label="Voltar ao topo"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[55] flex items-center justify-center bg-noir/80 glass"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-2 border-gold/20 border-t-gold"
          />
          {/* Inner dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-gold"
            />
          </div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gold/60 text-xs tracking-[0.2em] uppercase"
        >
          A carregar...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export default function Page() {
  const { currentPage } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const prevPageRef = useRef(currentPage);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      prevPageRef.current = currentPage;
      const showTimer = setTimeout(() => setIsLoading(true), 0);
      const hideTimer = setTimeout(() => setIsLoading(false), 300);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case "catalog": return <CatalogPage />;
      case "product": return <ProductPage />;
      case "checkout": return <CheckoutPage />;
      case "ai-sommelier": return <AISommelierPage />;
      case "guide": return <GuidePage />;
      case "my-account": return <MyAccountPage />;
      case "admin": return <AdminPage />;
      case "order-success": return <OrderSuccessPage />;
      case "affiliate": return <AffiliateDashboard />;
      default: return <HomePage />;
    }
  };

  return (
    <>
      {currentPage !== 'admin' && <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />}
    <div className="min-h-screen flex flex-col">
      {currentPage !== 'admin' && <Navbar />}
      <main className={`flex-1 ${currentPage === 'admin' ? '' : 'pt-16 sm:pt-20'}`}>
        {renderPage()}
      </main>
      {currentPage !== 'admin' && <Footer />}
      {currentPage !== 'admin' && <CartSheet />}
      {currentPage !== 'admin' && <QuickViewModal />}
      {currentPage !== 'admin' && <ProductCompareBar />}
      {currentPage !== 'admin' && <AgeVerification />}
      {currentPage !== 'admin' && <CookieConsent />}
      {currentPage !== 'admin' && <FloatingWhatsApp />}
      {currentPage !== 'admin' && <NewsletterPopup />}
      {currentPage !== 'admin' && <AffiliateTracker />}
      <BackToTopButton />
      <AnimatePresence>
        {isLoading && <PageLoader />}
      </AnimatePresence>
    </div>
    </>
  );
}
