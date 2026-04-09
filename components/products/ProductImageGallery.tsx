"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* ───── Types ───── */
interface GalleryImage {
  src: string;
  alt: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  olfactiveFamily: string;
  imageUrl: string;
  isNew: boolean;
  isBestseller: boolean;
  gender: string;
  stock?: number;
}

/* ───── Shared Maps ───── */
const familyImages: Record<string, string> = {
  oriental: "/images/perfumes/amber-perfume.png",
  floral: "/images/perfumes/pink-perfume.png",
  amadeirado: "/images/perfumes/dark-perfume.png",
  "fougère": "/images/perfumes/blue-perfume.png",
  cítrico: "/images/perfumes/blue-perfume.png",
  gourmet: "/images/perfumes/golden-perfume.png",
  aquático: "/images/perfumes/blue-perfume.png",
  especiado: "/images/perfumes/amber-perfume.png",
};

const familyColors: Record<string, string> = {
  oriental: "from-amber-900/30 to-orange-900/20",
  floral: "from-pink-900/30 to-rose-900/20",
  amadeirado: "from-yellow-900/30 to-amber-900/20",
  "fougère": "from-green-900/30 to-emerald-900/20",
  cítrico: "from-cyan-900/30 to-blue-900/20",
  gourmet: "from-orange-900/30 to-red-900/20",
  aquático: "from-blue-900/30 to-cyan-900/20",
  especiado: "from-red-900/30 to-amber-900/20",
};

/* ───── Gallery Image Builder ───── */
const getGalleryImages = (product: Product): GalleryImage[] => {
  const images: GalleryImage[] = [];
  if (product.imageUrl) images.push({ src: product.imageUrl, alt: product.name });
  images.push({ src: "/images/hero/hero-1.png", alt: "Lifestyle 1" });
  images.push({ src: "/images/hero/hero-2.png", alt: "Lifestyle 2" });
  const familyImg = familyImages[product.olfactiveFamily];
  if (familyImg) images.push({ src: familyImg, alt: product.olfactiveFamily });
  images.push({ src: "/images/categories/feminino.png", alt: "Collection" });
  return images.slice(0, 5);
};

/* ───── Component ───── */
export function ProductImageGallery({ product }: { product: Product }) {
  const galleryImages = getGalleryImages(product);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = galleryImages[activeIndex];
  const bgGradient = familyColors[product.olfactiveFamily] || "from-gray-900/30 to-gray-800/20";

  /* ───── Navigation helpers ───── */
  const navigate = useCallback(
    (direction: "prev" | "next") => {
      setActiveIndex((prev) => {
        if (direction === "prev") return prev === 0 ? galleryImages.length - 1 : prev - 1;
        return prev === galleryImages.length - 1 ? 0 : prev + 1;
      });
      setLightboxIndex((prev) => {
        if (direction === "prev") return prev === 0 ? galleryImages.length - 1 : prev - 1;
        return prev === galleryImages.length - 1 ? 0 : prev + 1;
      });
    },
    [galleryImages.length]
  );

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setIsZoomed(false);
  };

  const toggleZoom = () => setIsZoomed((prev) => !prev);

  /* ───── Keyboard support ───── */
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          navigate("prev");
          setIsZoomed(false);
          break;
        case "ArrowRight":
          navigate("next");
          setIsZoomed(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, navigate]);

  /* ───── Reset zoom on lightbox index change ───── */
  useEffect(() => {
    const timer = setTimeout(() => setIsZoomed(false), 0);
    return () => clearTimeout(timer);
  }, [lightboxIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* ───── Main Image ───── */}
      <motion.div
        className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br ${bgGradient} border border-gold/10 cursor-zoom-in group`}
        whileHover="hover"
        onClick={() => openLightbox(activeIndex)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Shimmer overlay on load */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-gold/10 to-transparent pointer-events-none"
          style={{
            backgroundSize: "200% 100%",
            animation: "shimmer 2s ease-in-out infinite",
          }}
        />

        {/* Image with zoom on hover */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          variants={{
            hover: { scale: 1.05 },
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage.src}
              src={currentImage.src}
              alt={currentImage.alt}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir/30 via-transparent to-transparent pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          {product.stock === 0 && (
            <Badge className="bg-red-500/90 text-white border-0 text-xs">Esgotado</Badge>
          )}
          {product.isNew && (
            <Badge className="bg-gold text-noir border-0 text-xs">Novo</Badge>
          )}
          {product.isBestseller && (
            <Badge className="bg-noir/80 text-gold border border-gold/30 text-xs">Bestseller</Badge>
          )}
        </div>

        {/* Zoom indicator on hover */}
        <motion.div
          className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-full bg-noir/60 backdrop-blur-sm border border-gold/20 text-gold/80"
          initial={{ opacity: 0, y: 8 }}
          animate={isHovering ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
        >
          <ZoomIn className="w-4 h-4" />
          <Maximize2 className="w-3.5 h-3.5" />
        </motion.div>
      </motion.div>

      {/* ───── Thumbnail Strip ───── */}
      <div
        className="flex gap-3 overflow-x-auto scrollbar-thin pb-1 sm:overflow-visible sm:grid sm:grid-cols-5 sm:gap-2"
        onMouseEnter={() => setIsHovering(false)}
      >
        {galleryImages.map((img, index) => (
          <motion.button
            key={img.src}
            onClick={() => setActiveIndex(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
              activeIndex === index
                ? "border-gold ring-1 ring-gold/30"
                : "border-transparent hover:border-gold/30"
            }`}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
            />
            {/* Gold overlay on hover */}
            {activeIndex !== index && (
              <div className="absolute inset-0 bg-gold/0 hover:bg-gold/10 transition-colors duration-200" />
            )}
            {/* Active indicator bar */}
            {activeIndex === index && (
              <motion.div
                layoutId="thumbnail-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* ───── Lightbox Modal ───── */}
      <Dialog open={lightboxOpen} onOpenChange={(open) => { if (!open) closeLightbox(); else setLightboxOpen(true); }}>
        <DialogContent
          showCloseButton={false}
          className="fixed inset-0 z-50 flex items-center justify-center w-full h-full max-w-none translate-x-0 translate-y-0 border-0 rounded-none bg-noir/95 p-0 sm:p-0 data-[state=open]:zoom-in-0 data-[state=closed]:zoom-out-0"
        >
          {/* Accessibility: hidden but readable by screen readers */}
          <DialogTitle className="sr-only">Image Lightbox</DialogTitle>
          <DialogDescription className="sr-only">
            Full screen image gallery for {product.name}
          </DialogDescription>

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-noir/60 border border-gold/20 text-gold hover:bg-noir/80 hover:border-gold/40 flex items-center justify-center transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Zoom toggle button */}
          <button
            onClick={toggleZoom}
            className="absolute top-4 right-16 z-20 w-10 h-10 rounded-full bg-noir/60 border border-gold/20 text-gold hover:bg-noir/80 hover:border-gold/40 flex items-center justify-center transition-colors"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>

          {/* Navigation arrows */}
          <button
            onClick={() => navigate("prev")}
            className="absolute top-1/2 left-4 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-noir/60 border border-gold/20 text-gold hover:bg-noir/80 hover:border-gold/40 flex items-center justify-center transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("next")}
            className="absolute top-1/2 right-4 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-noir/60 border border-gold/20 text-gold hover:bg-noir/80 hover:border-gold/40 flex items-center justify-center transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Image container with click-to-zoom */}
          <div
            className="flex flex-col items-center gap-4"
            onClick={toggleZoom}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={galleryImages[lightboxIndex].src}
                src={galleryImages[lightboxIndex].src}
                alt={galleryImages[lightboxIndex].alt}
                className={`rounded-lg select-none ${isZoomed ? "max-h-none max-w-none w-auto h-auto cursor-zoom-out" : "max-h-[90vh] max-w-[90vw] object-contain cursor-zoom-in"}`}
                style={isZoomed ? { transform: "scale(1)" } : undefined}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </AnimatePresence>

            {/* Image name below */}
            <motion.p
              key={`name-${galleryImages[lightboxIndex].src}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="text-gold-light/70 text-sm font-medium tracking-wide text-center max-w-[80vw] truncate"
            >
              {galleryImages[lightboxIndex].alt}
            </motion.p>
          </div>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <span className="text-gold/60 text-sm font-medium tracking-wide">
              {lightboxIndex + 1} / {galleryImages.length}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
