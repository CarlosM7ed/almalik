"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";

interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  olfactiveFamily: string;
  gender: string;
  intensity: string;
  fixation: string;
  projection: string;
  occasion: string;
  notesTop: string;
  notesHeart: string;
  notesBase: string;
  imageUrl: string;
  rating: number;
}

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

const compareFields = [
  { key: "price", label: "Preço", render: (p: CompareProduct) => `€${p.price.toFixed(2)}` },
  { key: "olfactiveFamily", label: "Família Olfativa", render: (p: CompareProduct) => p.olfactiveFamily },
  { key: "intensity", label: "Intensidade", render: (p: CompareProduct) => p.intensity || "—" },
  { key: "fixation", label: "Fixação", render: (p: CompareProduct) => p.fixation || "—" },
  { key: "projection", label: "Projeção", render: (p: CompareProduct) => p.projection || "—" },
  { key: "occasion", label: "Ocasião", render: (p: CompareProduct) => p.occasion || "—" },
  { key: "notesTop", label: "Notas de Topo", render: (p: CompareProduct) => p.notesTop || "—" },
  { key: "notesHeart", label: "Notas de Coração", render: (p: CompareProduct) => p.notesHeart || "—" },
  { key: "notesBase", label: "Notas de Base", render: (p: CompareProduct) => p.notesBase || "—" },
];

export function ProductCompareBar() {
  const { compareList, clearCompare, toggleCompare, setCurrentPage, setSelectedProductSlug } = useStore();
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch product details for comparison
  useEffect(() => {
    async function fetchCompareProducts() {
      if (compareList.length === 0) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/products?ids=${compareList.join(',')}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCompareProducts();
  }, [compareList]);

  const handleCompare = () => {
    if (products.length >= 2) {
      setShowModal(true);
    }
  };

  const handleRemoveFromCompare = (productId: string) => {
    toggleCompare(productId);
  };

  const handleNavigateToProduct = (slug: string) => {
    setShowModal(false);
    setSelectedProductSlug(slug);
    setCurrentPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Don't show the bar if less than 2 products selected
  if (compareList.length < 2) return null;

  return (
    <>
      {/* Floating Compare Bar */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-noir/95 backdrop-blur-lg border-t border-gold/20 shadow-2xl shadow-black/50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto">
                <Scale className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="text-sm text-muted-foreground flex-shrink-0">
                  Comparar {products.length} {products.length === 1 ? "produto" : "produtos"}
                </span>
                <div className="flex gap-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 bg-secondary/30 border border-gold/10 rounded-full px-3 py-1 flex-shrink-0"
                    >
                      <img
                        src={product.imageUrl || familyImages[product.olfactiveFamily] || "/images/perfumes/golden-perfume.png"}
                        alt={product.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs text-foreground whitespace-nowrap">{product.name}</span>
                      <button
                        onClick={() => handleRemoveFromCompare(product.id)}
                        className="text-muted-foreground hover:text-gold transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {loading && (
                    <div className="w-20 h-6 bg-secondary/20 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCompare}
                  className="text-muted-foreground hover:text-destructive text-xs"
                >
                  Limpar
                </Button>
                <Button
                  onClick={handleCompare}
                  disabled={products.length < 2}
                  className="bg-gold text-noir hover:bg-gold-light px-4 py-2 text-xs tracking-wider uppercase font-semibold"
                >
                  Comparar
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Compare Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-noir border-gold/20 p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="font-serif text-xl text-gold-gradient">
              Comparação de Fragrâncias
            </DialogTitle>
          </DialogHeader>

          <div className="p-6">
            {/* Product Headers */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${products.length}, 1fr)` }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="text-center cursor-pointer group"
                  onClick={() => handleNavigateToProduct(product.slug)}
                >
                  <div className="aspect-square max-w-[140px] mx-auto rounded-lg overflow-hidden border border-gold/10 mb-3 relative">
                    <img
                      src={product.imageUrl || familyImages[product.olfactiveFamily] || "/images/perfumes/golden-perfume.png"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="font-serif text-sm font-medium text-foreground group-hover:text-gold transition-colors leading-tight">
                    {product.name}
                  </h4>
                  <p className="text-gold font-bold mt-1">€{product.price.toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="rounded-lg border border-gold/10 overflow-hidden">
              {compareFields.map((field, index) => (
                <div
                  key={field.key}
                  className={`grid gap-4 ${index > 0 ? "border-t border-gold/10" : ""}`}
                  style={{ gridTemplateColumns: `120px repeat(${products.length}, 1fr)` }}
                >
                  <div className="bg-secondary/20 px-4 py-3 flex items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gold/70">
                      {field.label}
                    </span>
                  </div>
                  {products.map((product) => (
                    <div key={product.id} className="px-4 py-3 flex items-center">
                      <span className="text-sm text-foreground">
                        {field.render(product)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
