"use client";
import { Fragment, useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Star, Quote, ShoppingBag, Gift, ChevronDown, Search, Package, ShieldCheck, Award, Gem, HeartHandshake, Flower2, Sun, Leaf, Snowflake, BookOpen, Compass, X, ChevronLeft, ChevronRight, Instagram, Heart, MessageCircle, Crown, TrendingUp, Loader2, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProductCard } from "@/components/products/ProductCard";
import { useStore } from "@/lib/store";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  gender: string;
  olfactiveFamily: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  imageUrl: string;
  category: string;
  occasion?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const heroSlides = [
  {
    image: "/images/hero/hero-1.png",
    tagline: "Perfumaria Curada de Alto Padrão",
    title: "A Arte",
    titleAccent: "da Fragrância",
    description: "Cada perfume conta uma história. Descubra fragrâncias exclusivas selecionadas para revelar a sua essência mais autêntica.",
  },
  {
    image: "/images/hero/hero-2.png",
    tagline: "Perfumaria com Inteligência",
    title: "Identidade",
    titleAccent: "em Cada Nota",
    description: "Encontre a fragrância que define quem você é. Curadoria pessoal com a ajuda da nossa Inteligência Artificial.",
  },
  {
    image: "/images/hero/hero-3.png",
    tagline: "Exclusividade & Sofisticação",
    title: "Sua Essência",
    titleAccent: "em Destaque",
    description: "Fragrâncias premium selecionadas para quem valoriza exclusividade. Descubra coleções limitadas.",
  },
];

const statsData = [
  { value: 76, label: "Fragrâncias", suffix: "+" },
  { value: 100, label: "Autenticidade", suffix: "%" },
  { value: 48, label: "Horas de Fixação", suffix: "h" },
  { value: 4.9, label: "Avaliação Média", suffix: "★" },
];

const occasionCards = [
  { title: "Noite", desc: "Fragrâncias intensas e misteriosas", img: "/images/perfumes/dark-perfume.png", filter: "noite" },
  { title: "Dia a Dia", desc: "Leves e sofisticadas", img: "/images/perfumes/blue-perfume.png", filter: "dia a dia" },
  { title: "Festa", desc: "Marcantes e inesquecíveis", img: "/images/perfumes/golden-perfume.png", filter: "festa" },
  { title: "Verão", desc: "Frescor e vitalidade", img: "/images/perfumes/blue-perfume.png", filter: "verão" },
  { title: "Presente", desc: "Surpreenda alguém especial", img: "/images/perfumes/pink-perfume.png", filter: "presente" },
  { title: "Trabalho", desc: "Profissionais e elegantes", img: "/images/perfumes/amber-perfume.png", filter: "trabalho" },
];

const lookbookItems = [
  { img: "/images/categories/feminino.png", label: "Feminino", filter: "feminino" },
  { img: "/images/categories/masculino.png", label: "Masculino", filter: "masculino" },
  { img: "/images/hero/hero-1.png", label: "Oriental", filter: "oriental" },
  { img: "/images/perfumes/golden-perfume.png", label: "Gourmet", filter: "gourmet" },
  { img: "/images/hero/hero-2.png", label: "Unissex", filter: "unissex" },
  { img: "/images/perfumes/pink-perfume.png", label: "Floral", filter: "floral" },
  { img: "/images/categories/kits.png", label: "Kits", filter: "" },
  { img: "/images/perfumes/dark-perfume.png", label: "Amadeirado", filter: "amadeirado" },
];

const faqItems = [
  { question: "Como escolher o perfume ideal?", answer: "Nosso Sommelier IA pode ajudar! Responda algumas perguntas sobre suas preferências e receberá recomendações personalizadas. Também pode explorar nosso Guia de Fragrâncias para entender melhor as famílias olfativas." },
  { question: "Os perfumes são originais?", answer: "Sim, 100% originais. Trabalhamos diretamente com distribuidores autorizados e cada produto passa por verificação de autenticidade. Oferecemos garantia de originalidade em todas as fragrâncias." },
  { question: "Qual é a política de troca e devolução?", answer: "Oferecemos 30 dias para troca ou devolução. O produto deve estar na embalagem original, sem sinais de uso. Para trocas, o envio de retorno é gratuito." },
  { question: "Quanto tempo demora a entrega?", answer: "Entregas em Portugal continental: 2-4 dias úteis. Ilhas e Espanha: 5-7 dias úteis. Todas as encomendas são enviadas com rastreamento incluído." },
  { question: "Oferecem embrulho de presente?", answer: "Sim! Adicione o embrulho de presente no checkout por apenas €3.99. Inclui caixa premium, laço de cetim e cartão personalizado." },
  { question: "Como posso pagar?", answer: "Aceitamos MB WAY, Multibanco, Transferência Bancária e Pagamento na Entrega. Todas as transações são seguras e encriptadas." },
  { question: "Quais são as concentrações disponíveis?", answer: "Oferecemos três concentrações: Eau de Toilette (50ml), Eau de Parfum (100ml - recomendado) e Extrait de Parfum (30ml). Cada um com duração e intensidade diferentes." },
  { question: "Têm programa de fidelidade?", answer: "Sim! Ganhe 10 pontos por cada €1 gasto. Acumule pontos para descontos exclusivos, envio gratuito e acesso antecipado a novas fragrâncias." },
];

const instagramPosts = [
  { img: "/images/perfumes/golden-perfume.png", likes: 342, comments: 28 },
  { img: "/images/categories/feminino.png", likes: 518, comments: 45 },
  { img: "/images/perfumes/pink-perfume.png", likes: 287, comments: 19 },
  { img: "/images/hero/hero-1.png", likes: 623, comments: 52 },
  { img: "/images/perfumes/dark-perfume.png", likes: 456, comments: 38 },
  { img: "/images/categories/kits.png", likes: 391, comments: 33 },
  { img: "/images/perfumes/amber-perfume.png", likes: 547, comments: 41 },
  { img: "/images/hero/hero-2.png", likes: 298, comments: 22 },
];

const instagramFeedData = [
  { img: "/images/perfumes/golden-perfume.png", likes: 342, comments: 28, caption: "A essência da sofisticação em cada detalhe ✨ #AlmaLik #LuxuryFragrance" },
  { img: "/images/categories/feminino.png", likes: 518, comments: 45, caption: "Para ela: fragrâncias que despertam confiança 💫 #Feminino #AlmaLik" },
  { img: "/images/perfumes/pink-perfume.png", likes: 287, comments: 19, caption: "A fixação que dura o dia inteiro 🌸 #LongLasting #AlmaLik" },
  { img: "/images/hero/hero-1.png", likes: 623, comments: 52, caption: "Oriental, intenso e inesquecível. Descubra a nossa coleção 🖤 #Oriental #AlmaLik" },
  { img: "/images/perfumes/dark-perfume.png", likes: 456, comments: 38, caption: "Notas amadeiradas para noites especiais 🌙 #Masculino #AlmaLik" },
  { img: "/images/categories/kits.png", likes: 391, comments: 33, caption: "O presente perfeito para quem ama perfumes 🎁 #Kits #AlmaLik" },
];

const trustPartners = [
  "L'OFFICIEL",
  "VOGUE",
  "GQ",
  "ELLE",
  "HARPER'S BAZAAR",
];

const differentiators = [
  { icon: Sparkles, title: "Sinta Antes de Comprar", subtitle: "Amostras disponíveis", description: "Peça amostras e teste antes de comprar. A certeza de escolher o perfume ideal." },
  { icon: Package, title: "Entrega Premium", subtitle: "Embalagem luxuosa", description: "Receba em casa com embalagem premium, pronta para presente." },
  { icon: MessageCircle, title: "Apoio 24/7", subtitle: "Suporte via WhatsApp", description: "Equipa dedicada disponível a qualquer momento para o ajudar." },
  { icon: ShieldCheck, title: "Garantia de 30 Dias", subtitle: "Devoluções fáceis", description: "Troca ou devolução gratuita em até 30 dias, sem complicações." },
];

const loyaltyTiers = [
  {
    name: "Bronze",
    icon: ShieldCheck,
    points: "0 – 499",
    color: "amber-700",
    border: "border-amber-700/30",
    accent: "text-amber-600",
    bg: "bg-amber-700/5",
    isActive: true,
    benefits: ["1 ponto por cada €1 gasto", "10% de desconto no aniversário", "Acesso a promoções exclusivas"],
  },
  {
    name: "Silver",
    icon: Award,
    points: "500 – 1.499",
    color: "gray-400",
    border: "border-gray-400/30",
    accent: "text-gray-300",
    bg: "bg-gray-400/5",
    isActive: false,
    benefits: ["3 pontos por cada €1 gasto", "15% de desconto em toda a loja", "Envio gratuito em encomendas +€30", "Acesso antecipado a novos lançamentos"],
  },
  {
    name: "Gold",
    icon: Gem,
    points: "1.500+",
    color: "gold",
    border: "border-gold/50",
    accent: "text-gold",
    bg: "bg-gold/5",
    isActive: false,
    benefits: ["5 pontos por cada €1 gasto", "20% de desconto permanente", "Envio gratuito em todas as encomendas", "Presente surpresa exclusivo", "Acesso VIP a eventos privados"],
  },
];

const howItWorksSteps = [
  { icon: Search, title: "Explore", description: "Navegue por nossa coleção curada de fragrâncias exclusivas" },
  { icon: Sparkles, title: "Escolha", description: "Selecione o perfume ideal com a ajuda do nosso Sommelier IA" },
  { icon: Package, title: "Receba", description: "Entrega rápida e segura com rastreamento incluído" },
];

const trustItems = [
  { icon: ShieldCheck, title: "Autenticidade Certificada", description: "Todos os produtos são 100% originais com verificação de autenticidade" },
  { icon: Award, title: "Seleção Curada", description: "Cada fragrância é testada e aprovada pelo nosso equipo de especialistas" },
  { icon: Gem, title: "Embalagem Premium", description: "Apresentação luxuosa perfeita para presente" },
  { icon: HeartHandshake, title: "Suporte Dedicado", description: "Atendimento personalizado antes e após a compra" },
];

const seasonTabs = [
  { id: 'primavera', label: 'Primavera', icon: Flower2, occasions: ['dia a dia', 'verão'], gradient: 'from-emerald-900/40 to-green-800/20', accent: 'text-emerald-400', border: 'border-emerald-500/30', description: 'Fragrâncias florais e frescas para os dias de renovação' },
  { id: 'verao', label: 'Verão', icon: Sun, occasions: ['verão'], gradient: 'from-amber-900/40 to-yellow-700/20', accent: 'text-amber-400', border: 'border-amber-500/30', description: 'Notas cítricas e aquáticas para o calor do verão' },
  { id: 'outono', label: 'Outono', icon: Leaf, occasions: ['noite', 'festa'], gradient: 'from-orange-900/40 to-amber-900/20', accent: 'text-orange-400', border: 'border-orange-500/30', description: 'Aromas amadeirados e quentes para outono' },
  { id: 'inverno', label: 'Inverno', icon: Snowflake, occasions: ['noite'], gradient: 'from-blue-900/40 to-indigo-800/20', accent: 'text-blue-400', border: 'border-blue-500/30', description: 'Orientais intensos e especiados para o frio' },
];

const trendingTags = [
  "Oriental intenso", "Presente feminino", "Perfume verão", "Kits premium",
  "Melhor seller", "Amadeirado elegante", "Fragrância única", "Novidades",
];

const quickFilterChips = [
  { label: "Feminino", filterKey: "gender", filterValue: "feminino" },
  { label: "Masculino", filterKey: "gender", filterValue: "masculino" },
  { label: "Oriental", filterKey: "olfactiveFamily", filterValue: "oriental" },
  { label: "Floral", filterKey: "olfactiveFamily", filterValue: "floral" },
  { label: "Kits", filterKey: "category", filterValue: "kits" },
];

const testimonials = [
  { text: "O Éclat de Oud é simplesmente extraordinário. Cada borrifada é uma viagem sensorial.", author: "Mariana S.", rating: 5 },
  { text: "Encontrei minha fragrância assinatura com a ajuda do Sommelier IA. Serviço impecável.", author: "Ricardo M.", rating: 5 },
  { text: "A embalagem, o aroma, a apresentação — tudo reflete sofisticação. Recomendo de olhos fechados.", author: "Carolina P.", rating: 5 },
  { text: "O Kit Art of Nature foi o melhor presente que já dei. Cada fragrância é uma descoberta.", author: "André L.", rating: 5 },
  { text: "A fixação dos perfumes é extraordinária. Uso de manhã e dura até à noite.", author: "Patrícia R.", rating: 5 },
  { text: "Só descubri a Alma Lik há pouco tempo e já sou cliente fiel. Qualidade notável.", author: "Tomás V.", rating: 4 },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const isDecimal = target % 1 !== 0;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
            }
          }, 25);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-bold text-gold-gradient font-serif text-glow">
      {count}{suffix}
    </span>
  );
}

export function HomePage() {
  const { setCurrentPage, setFilter, setSelectedProductSlug, recentlyViewed } = useStore();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [kits, setKits] = useState<Product[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonialPaused, setTestimonialPaused] = useState(false);
  const [featuredOfDay, setFeaturedOfDay] = useState<Product | null>(null);
  const [activeSeason, setActiveSeason] = useState('primavera');
  const [allSeasonalProducts, setAllSeasonalProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const testimonialIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const handleNewsletterSubscribe = async () => {
    if (!newsletterEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error("Por favor, insira um email válido.");
      return;
    }
    setNewsletterLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      if (res.ok) {
        setNewsletterSuccess(true);
        setNewsletterEmail("");
        toast.success("Subscrição confirmada! Obrigado.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao subscrever.");
      }
    } catch {
      toast.error("Erro de ligação.");
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Parallax scroll effect for hero section
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 600], [0, 150]);
  const contentParallaxY = useTransform(scrollY, [0, 600], [0, 60]);
  const particleParallaxY = useTransform(scrollY, [0, 600], [0, 100]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  // Testimonial auto-rotation every 5 seconds
  useEffect(() => {
    if (testimonialPaused) return;
    testimonialIntervalRef.current = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => {
      if (testimonialIntervalRef.current) clearInterval(testimonialIntervalRef.current);
    };
  }, [testimonialPaused]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [fRes, nRes, kRes, fodRes] = await Promise.all([
          fetch("/api/products?isFeatured=true&limit=8"),
          fetch("/api/products?isNew=true&limit=8"),
          fetch("/api/products?isKit=true&limit=4"),
          fetch("/api/products?isFeatured=true&limit=1"),
        ]);
        const [fData, nData, kData, fodData] = await Promise.all([fRes.json(), nRes.json(), kRes.json(), fodRes.json()]);
        setFeatured(fData.products || []);
        setNewArrivals(nData.products || []);
        setKits(kData.products || []);
        if (fodData.products && fodData.products.length > 0) {
          setFeaturedOfDay(fodData.products[0]);
        }

        // Fetch recommended products (exclude recently viewed)
        const recRes = await fetch("/api/products?limit=20");
        const recData = await recRes.json();
        const allProducts = recData.products || [];
        const recommended = allProducts.filter(
          (p: Product) => !recentlyViewed.includes(p.slug) && !p.isKit
        );
        // Shuffle and take 6
        const shuffled = recommended.sort(() => Math.random() - 0.5);
        setRecommendedProducts(shuffled.slice(0, 6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Fetch seasonal collection products
  useEffect(() => {
    async function fetchSeasonalProducts() {
      try {
        const res = await fetch('/api/products?limit=50');
        const data = await res.json();
        setAllSeasonalProducts(data.products || []);
      } catch {
        setAllSeasonalProducts([]);
      }
    }
    fetchSeasonalProducts();
  }, []);

  const getSeasonalProducts = useCallback((seasonId: string) => {
    const season = seasonTabs.find(s => s.id === seasonId);
    if (!season) return featured.slice(0, 6);
    const filtered = allSeasonalProducts.filter(p =>
      !p.isKit && season.occasions.some(occ =>
        p.occasion && p.occasion.toLowerCase().includes(occ.toLowerCase())
      )
    );
    return filtered.length > 0 ? filtered.slice(0, 6) : featured.slice(0, 6);
  }, [allSeasonalProducts, featured]);

  const seasonalProducts = getSeasonalProducts(activeSeason);

  // Fetch recently viewed products
  useEffect(() => {
    async function fetchRecentlyViewed() {
      if (recentlyViewed.length === 0) {
        setRecentlyViewedProducts([]);
        return;
      }
      try {
        const promises = recentlyViewed.map(async (slug) => {
          const res = await fetch(`/api/products/${slug}`);
          if (!res.ok) return null;
          const data = await res.json();
          return data.product;
        });
        const results = await Promise.all(promises);
        setRecentlyViewedProducts(results.filter(Boolean) as Product[]);
      } catch {
        setRecentlyViewedProducts([]);
      }
    }
    fetchRecentlyViewed();
  }, [recentlyViewed]);

  // Update recommended products when recentlyViewed changes
  useEffect(() => {
    if (featured.length === 0) return;
    const recommended = featured.filter(
      (p) => !recentlyViewed.includes(p.slug)
    );
    const shuffled = [...recommended].sort(() => Math.random() - 0.5);
    setRecommendedProducts(shuffled.slice(0, 6));
  }, [recentlyViewed, featured]);

  const handleOccasion = (filter: string) => {
    setFilter("occasion", filter);
    setCurrentPage("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!value.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    setIsSearchLoading(true);
    setIsSearchOpen(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(value)}&limit=4`);
        const data = await res.json();
        setSearchResults(data.products || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearchLoading(false);
      }
    }, 300);
  }, []);

  const handleSearchSelect = useCallback((product: Product) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedProductSlug(product.slug);
    setCurrentPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setCurrentPage, setSelectedProductSlug]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  }, []);

  const handleTrendingTagClick = useCallback((tag: string) => {
    setSearchQuery(tag);
    handleSearchChange(tag);
    searchInputRef.current?.focus();
  }, [handleSearchChange]);

  const handleQuickFilterClick = useCallback((chip: typeof quickFilterChips[0]) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setFilter(chip.filterKey, chip.filterValue);
    setCurrentPage("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setCurrentPage, setFilter]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node) && searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Carousel */}
      <section
        className="noise-overlay relative min-h-[90vh] flex items-center overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Images with Crossfade & Parallax */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ y: heroParallaxY }}
          >
            <img
              src={heroSlides[currentSlide].image}
              alt="Luxury perfume"
              className="w-full h-[120%] object-cover opacity-40"
              style={{ marginTop: "-10%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/40" />
            <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle, rgba(201,169,110,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px'}} />
            {/* Bestseller ribbon badge */}
            <div className="bestseller-ribbon hidden sm:block">
              ★ Bestseller
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Content with Crossfade & Parallax */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl space-y-8"
              style={{ y: contentParallaxY }}
            >
              <motion.p variants={fadeUp} custom={0} className="text-gold/80 text-sm tracking-[0.3em] uppercase font-medium">
                {heroSlides[currentSlide].tagline}
              </motion.p>
              <motion.div variants={fadeUp} custom={0.5} className="w-16 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent animate-pulse" />
              <motion.div variants={fadeUp} custom={0.8} className="flex items-center gap-4">
                {/* Perfume droplet decorative SVG */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gold/50 flex-shrink-0 animate-float">
                  <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 15C9 12.791 10.791 11 13 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                </svg>
                <div className="w-12 h-px bg-gradient-to-r from-gold/40 to-transparent" />
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1]">
                <span className="text-gold-gradient shimmer-text">{heroSlides[currentSlide].title}</span>{" "}
                <span className="text-foreground">{heroSlides[currentSlide].titleAccent}</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                {heroSlides[currentSlide].description}
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4 float-gentle">
                <Button
                  onClick={() => { setCurrentPage("catalog"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="btn-luxury px-8 py-6 text-sm tracking-widest uppercase font-semibold"
                >
                  Explorar Catálogo
                  <motion.span
                    className="inline-flex ml-2"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Button>
                <Button
                  onClick={() => { setCurrentPage("ai-sommelier"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  variant="outline"
                  className="btn-gold-gradient-border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/60 px-8 py-6 text-sm tracking-widest uppercase font-semibold hover:shadow-[0_0_25px_rgba(201,169,110,0.2)] transition-all duration-400"
                >
                  <motion.span
                    className="inline-flex mr-2"
                    animate={{ rotate: [0, 15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.span>
                  Sommelier IA
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Decorative gold corner ornament frame around hero text area */}
          <div className="hero-corner-ornament absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="hero-corner-ornament-bottom" />
          </div>

          {/* Floating gold particles with animate-float-dot */}
          <motion.div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ y: particleParallaxY }}>
            <div className="absolute top-[15%] left-[8%] w-2 h-2 rounded-full bg-gold/40 animate-float-dot" />
            <div className="absolute top-[25%] right-[12%] w-1.5 h-1.5 rounded-full bg-gold/30 animate-float-dot" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-[60%] left-[20%] w-1 h-1 rounded-full bg-gold/50 animate-float-dot" style={{ animationDelay: '3s' }} />
            <div className="absolute top-[45%] right-[25%] w-2.5 h-2.5 rounded-full bg-gold/25 animate-float-dot" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-[30%] left-[45%] w-1.5 h-1.5 rounded-full bg-gold/35 animate-float-dot" style={{ animationDelay: '4s' }} />
            <div className="absolute top-[20%] left-[55%] w-1 h-1 rounded-full bg-gold/45 animate-float-dot" style={{ animationDelay: '5s' }} />
          </motion.div>

          {/* Navigation Dots */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                  i === currentSlide
                    ? "bg-gold w-8"
                    : "bg-gold/30 hover:bg-gold/50"
                }`}
              />
            ))}
          </div>

          {/* Scroll indicator */}
          <motion.button
            onClick={() => {
              const brandStory = document.getElementById('brand-story');
              if (brandStory) brandStory.scrollIntoView({ behavior: 'smooth' });
            }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gold/40 hover:text-gold/70 transition-colors cursor-pointer"
            aria-label="Scroll down"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.button>
        </div>
      </section>

      {/* Discover Your Perfect Fragrance - Search Section */}
      <section className="py-16 sm:py-20 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">
              <Search className="w-4 h-4 inline mr-2" />
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient mb-2">
              Descubra Sua Fragrância Ideal
            </h2>
            <p className="text-muted-foreground text-sm">
              Pesquise por nome, família olfativa ou ocasião
            </p>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="relative"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/50" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Procure por nome, família olfativa, ocasião..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => { if (searchQuery.trim()) setIsSearchOpen(true); }}
                onKeyDown={handleSearchKeyDown}
                className="w-full h-14 pl-12 pr-12 text-base rounded-xl bg-charcoal/80 border-gold/20 focus:border-gold/50 focus:ring-1 focus:ring-gold/20 placeholder:text-muted-foreground/60 text-foreground backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setSearchResults([]); setIsSearchOpen(false); searchInputRef.current?.focus(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {isSearchOpen && searchQuery.trim() && (
                <motion.div
                  ref={searchDropdownRef}
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-0 right-0 mt-2 z-50 glass-card rounded-xl overflow-hidden shadow-2xl shadow-black/40"
                >
                  {/* Product Results */}
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {isSearchLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 text-gold animate-spin" />
                        <span className="ml-3 text-sm text-muted-foreground">A procurar...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div>
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleSearchSelect(product)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-gold/5 transition-colors text-left border-b border-gold/5 last:border-b-0"
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gold/10">
                              <img
                                src={product.imageUrl || "/images/perfumes/golden-perfume.png"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.olfactiveFamily} · {product.gender}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-gold tabular-nums">€{product.price.toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Search className="w-8 h-8 text-gold/20 mb-3" />
                        <p className="text-sm text-muted-foreground">Nenhum resultado encontrado</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Tente outro termo de pesquisa</p>
                      </div>
                    )}
                  </div>

                  {/* Quick Filters */}
                  <div className="border-t border-gold/10 p-3">
                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-2 px-1">Filtros rápidos</p>
                    <div className="flex flex-wrap gap-2">
                      {quickFilterChips.map((chip) => (
                        <button
                          key={chip.label}
                          onClick={() => handleQuickFilterClick(chip)}
                          className="px-3 py-1.5 rounded-full text-xs border border-gold/20 text-gold/70 hover:border-gold/50 hover:bg-gold/5 hover:text-gold transition-all duration-200"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ver Todos Link */}
                  <div className="border-t border-gold/10">
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                        setCurrentPage("catalog");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-gold hover:bg-gold/5 transition-colors"
                    >
                      <span>Ver Todos os Produtos</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Trending Tags */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-gold/50" />
              <span className="text-xs text-muted-foreground/70 uppercase tracking-widest">Tendências</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent -mx-4 px-4">
              <AnimatePresence>
                {trendingTags.map((tag, i) => (
                  <motion.button
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35 + i * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTrendingTagClick(tag)}
                    className="flex-shrink-0 px-4 py-2 rounded-full text-xs border border-gold/20 hover:border-gold/50 hover:bg-gold/5 text-gold/70 hover:text-gold transition-all duration-200 whitespace-nowrap"
                  >
                    {tag}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Discovery Quiz Teaser */}
      <section className="pb-12 sm:pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-card rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden animate-float"
          >
            {/* Subtle gold glow background */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(201,169,110,0.06) 0%, transparent 70%)" }} />
            <div className="relative">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Compass className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-gold-gradient mb-2">
                Não sabe qual perfume escolher?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto mb-6">
                Responda 4 perguntas e receba recomendações personalizadas para encontrar a fragrância perfeita para si.
              </p>
              <Button
                onClick={() => { setCurrentPage("guide"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="bg-gold text-noir hover:bg-gold-light hover:gold-glow px-8 py-3 text-sm tracking-widest uppercase font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Iniciar Quiz
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Story */}
      <section id="brand-story" className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
            <div className="gold-line max-w-xs mx-auto" />
            {/* Quote Card with animated gold border and dot pattern */}
            <div className="gold-border-animate gold-dots-pattern rounded-2xl p-6 sm:p-10 bg-charcoal/60 backdrop-blur-sm relative overflow-hidden">
              {/* Decorative perfume bottle flanking left */}
              <div className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gold">
                  <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 15C9 12.791 10.791 11 13 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
              {/* Decorative perfume bottle flanking right */}
              <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gold">
                  <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 15C9 12.791 10.791 11 13 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
              {/* Mobile decorative elements */}
              <div className="sm:hidden flex justify-between mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gold/30">
                  <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gold/30">
                  <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <Quote className="w-8 h-8 text-gold/30 mx-auto mb-4" />
              <h2 className="font-serif text-2xl sm:text-3xl text-gold-gradient font-bold leading-relaxed">
                &ldquo;Cada fragrância é uma porta para uma memória, uma emoção, uma versão de si mesmo.&rdquo;
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mt-4">
                Na Alma Lik, acreditamos que o perfume certo não apenas complementa o seu estilo — ele o define.
                Nossa curadoria exclusiva traz o melhor da perfumaria árabe para quem valoriza autenticidade e sofisticação.
              </p>
              {/* Ler Mais link */}
              <button
                onClick={() => { setCurrentPage("guide"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="inline-flex items-center gap-2 mt-6 text-sm text-gold/70 hover:text-gold transition-colors group animated-underline"
              >
                <BookOpen className="w-4 h-4" />
                <span>Ler Mais</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="gold-line max-w-xs mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 bg-secondary/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Simples e Rápido</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Como Funciona</h2>
            <p className="text-muted-foreground mt-3">Em três passos simples</p>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-10 md:gap-0">
            {/* Connecting gold dotted line (desktop only) */}
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] gold-dotted-line" />
            {howItWorksSteps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                  className="relative flex flex-col items-center text-center flex-1 px-4 py-8 rounded-2xl step-card"
                >
                  {/* Step number badge with animated gold underline */}
                  <div className="relative mb-5 step-number-underline">
                    <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center glass">
                      <StepIcon className="w-7 h-7 text-gold" />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                      <span className="text-xs font-bold text-noir">{i + 1}</span>
                    </div>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-gold-gradient mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm max-w-[220px]">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lifestyle Banner */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative w-full overflow-hidden"
        style={{ maxHeight: '500px' }}
      >
        <div className="relative w-full h-[400px] sm:h-[500px]">
          <img
            src="/images/lifestyle/lifestyle-1.png"
            alt="Alma Lik Lifestyle"
            className="w-full h-full object-cover opacity-60 hover:opacity-80 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-noir/70 via-noir/40 to-noir/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir/50 via-transparent to-noir/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-center space-y-4"
            >
              <div className="gold-line max-w-xs mx-auto" />
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-gradient drop-shadow-lg">
                Alma Lik — Perfumaria de Excelência
              </h2>
              <div className="gold-line max-w-xs mx-auto" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Our Promise */}
      <section className="py-20 sm:py-24 noise-overlay">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Confiança e Qualidade</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Nossa Promessa</h2>
            <p className="text-muted-foreground mt-3">Qualidade em cada detalhe</p>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {trustItems.map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="card-luxury p-6 text-center rounded-xl"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl icon-glass-gold flex items-center justify-center">
                    <ItemIcon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="font-serif font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 sm:py-24 shimmer-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">NOSSA SELEÇÃO</p>
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="ornament-diamond">
                <div className="ornament-diamond-icon" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Favoritos da Alma Lik</h2>
              <div className="ornament-diamond">
                <div className="ornament-diamond-icon" />
              </div>
            </div>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg bg-secondary/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Button
              onClick={() => { setCurrentPage("catalog"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10 tracking-widest uppercase text-sm"
            >
              Ver Catálogo Completo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section className="py-20 sm:py-24 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Encontre o Ideal</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Escolha por Ocasião</h2>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {occasionCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleOccasion(card.filter)}
                className="card-luxury group cursor-pointer relative overflow-hidden rounded-lg occasion-gold-overlay"
              >
                <div className="aspect-[4/3] relative">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 relative z-[2]">
                    <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{card.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-gold/0 group-hover:text-gold/80 transition-all duration-300 mt-2">
                      Explorar <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Acabaram de Chegar</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Novidades</h2>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg bg-secondary/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lookbook / Inspire-se */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Inspire-se</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Nosso Mundo de Fragrâncias</h2>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {lookbookItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                onClick={() => {
                  if (item.filter === "feminino" || item.filter === "masculino" || item.filter === "unissex") {
                    setFilter("gender", item.filter);
                  } else if (item.filter === "") {
                    setFilter("category", "kits");
                  } else {
                    setFilter("olfactiveFamily", item.filter);
                  }
                  setCurrentPage("catalog");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer card-luxury"
              >
                <img src={item.img} alt={item.label} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-noir/20" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-serif text-lg text-foreground group-hover:text-gold transition-colors">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Explorar →</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Collections */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">
              <Flower2 className="w-4 h-4 inline mr-2" />
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Coleções Sazonais</h2>
            <p className="text-muted-foreground mt-2 text-sm">Fragrâncias para cada estação</p>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>

          {/* Season Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {seasonTabs.map((season, i) => {
              const Icon = season.icon;
              const isActive = activeSeason === season.id;
              const seasonProducts = getSeasonalProducts(season.id).slice(0, 4);
              return (
                <motion.button
                  key={season.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSeason(season.id)}
                  className={`relative group rounded-xl overflow-hidden border text-left transition-all duration-300 ${
                    isActive
                      ? `border-gold/50 ring-1 ring-gold/20 ${season.gradient}`
                      : `border-gold/10 hover:border-gold/30 bg-secondary/5`
                  }`}
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${season.gradient} opacity-${isActive ? '100' : '50'} transition-opacity`} />
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="seasonActiveGlow"
                      className="absolute inset-0 border-2 border-gold/40 rounded-xl pointer-events-none"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="relative p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-gold/20' : 'bg-gold/5'}`}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-gold' : season.accent}`} />
                      </div>
                      {isActive && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-2 py-0.5 rounded-full bg-gold text-noir text-[10px] font-bold uppercase tracking-wider"
                        >
                          Ativa
                        </motion.span>
                      )}
                    </div>
                    <h3 className={`font-serif text-base sm:text-lg font-semibold mb-1 ${isActive ? 'text-gold-gradient' : 'text-foreground'}`}>
                      {season.label}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                      {season.description}
                    </p>
                    {/* Mini product previews */}
                    <div className="flex -space-x-2">
                      {seasonProducts.slice(0, 3).map((p, j) => {
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
                        return (
                          <div
                            key={p.id}
                            className="w-8 h-8 rounded-full border-2 border-noir overflow-hidden"
                          >
                            <img src={p.imageUrl || familyImages[p.olfactiveFamily] || "/images/perfumes/golden-perfume.png"} alt="" className="w-full h-full object-cover" />
                          </div>
                        );
                      })}
                      {seasonProducts.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-noir bg-secondary/50 flex items-center justify-center">
                          <span className="text-[9px] text-gold font-bold">+{seasonProducts.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Season Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {seasonTabs.map((season) => {
              const Icon = season.icon;
              const isActive = activeSeason === season.id;
              return (
                <button
                  key={season.id}
                  onClick={() => setActiveSeason(season.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm tracking-wider uppercase transition-all duration-300 ${
                    isActive
                      ? 'season-tab-active'
                      : 'border border-gold/20 text-gold/70 hover:border-gold/40 hover:text-gold'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{season.label}</span>
                </button>
              );
            })}
          </div>

          {/* Seasonal Products Row */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSeason}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent"
            >
              {seasonalProducts.map((product, i) => (
                <motion.div
                  key={`${activeSeason}-${product.id}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
                  className="flex-shrink-0 w-56 sm:w-64"
                >
                  <ProductCard product={product} index={i} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Kits */}
      <section className="py-20 sm:py-24 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">
              <Gift className="w-4 h-4 inline mr-2" />
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Presentes e Kits</h2>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg bg-secondary/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {kits.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed */}
      <section className="py-16 sm:py-20 border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div className="text-center flex-1">
              <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Vistos Recentemente</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient">Sua História de Fragrâncias</h2>
            </div>
            {recentlyViewedProducts.length > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  setRecentlyViewedProducts([]);
                }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors px-3 py-1.5 rounded-full border border-gold/10 hover:border-gold/30"
              >
                <X className="w-3 h-3" />
                Limpar
              </motion.button>
            )}
          </motion.div>
          <div className="gold-line max-w-xs mx-auto -mt-6 mb-10" />

          {recentlyViewedProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center mb-4">
                <Compass className="w-7 h-7 text-gold/40" />
              </div>
              <p className="font-serif text-lg text-foreground mb-2">Comece a explorar</p>
              <p className="text-sm text-muted-foreground max-w-[280px] mb-6">
                Os perfumes que você visitar aparecerão aqui para fácil acesso
              </p>
              <Button
                onClick={() => { setCurrentPage("catalog"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10 text-sm"
              >
                Explorar Catálogo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <div className="relative group/rv">
              {/* Left gradient fade */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-noir to-transparent z-10 pointer-events-none opacity-0 group-hover/rv:opacity-100 transition-opacity" />
              {/* Right gradient fade */}
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-noir to-transparent z-10 pointer-events-none opacity-0 group-hover/rv:opacity-100 transition-opacity" />

              {/* Left arrow */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  const container = document.getElementById('recently-viewed-scroll');
                  if (container) container.scrollBy({ left: -280, behavior: 'smooth' });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-noir/80 border border-gold/20 flex items-center justify-center text-gold hover:bg-noir hover:border-gold/40 transition-all opacity-0 group-hover/rv:opacity-100 hidden md:flex shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              {/* Right arrow */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  const container = document.getElementById('recently-viewed-scroll');
                  if (container) container.scrollBy({ left: 280, behavior: 'smooth' });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-noir/80 border border-gold/20 flex items-center justify-center text-gold hover:bg-noir hover:border-gold/40 transition-all opacity-0 group-hover/rv:opacity-100 hidden md:flex shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>

              <div
                id="recently-viewed-scroll"
                className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent scroll-smooth"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {recentlyViewedProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-56 sm:w-64"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <ProductCard product={product} index={i} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recomendado Para Si */}
      <section className="py-16 sm:py-20 relative luxury-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-3 h-3 border border-gold/40 rotate-45" />
              <p className="text-gold/70 text-sm tracking-[0.3em] uppercase">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Selecionado Para Si
              </p>
              <div className="w-3 h-3 border border-gold/40 rotate-45" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient mb-2">
              Recomendado Para Si
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Fragrâncias que ainda não explorou, escolhidas a dedo para si
            </p>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg bg-secondary/20 animate-pulse" />
              ))}
            </div>
          ) : recommendedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {recommendedProducts.slice(0, 6).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <p className="text-muted-foreground text-sm">
                Explore mais fragrâncias para receber recomendações personalizadas
              </p>
              <Button
                onClick={() => { setCurrentPage("catalog"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10 text-sm mt-4"
              >
                Explorar Catálogo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Perfume do Dia */}
      {featuredOfDay && (
        <section className="py-20 sm:py-24 luxury-section">
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">
                <Sparkles className="w-4 h-4 inline mr-2" />
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient-shimmer">Perfume do Dia</h2>
              <div className="gold-line max-w-xs mx-auto mt-4" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={() => { setSelectedProductSlug(featuredOfDay.slug); setCurrentPage("product"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="group relative max-w-5xl mx-auto rounded-2xl border border-gold/20 overflow-hidden cursor-pointer"
              style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)" }}
            >
              {/* Gold radial glow background */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(201, 169, 110, 0.08) 0%, transparent 60%)" }} />
              {/* Gold shimmer overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(201, 169, 110, 0.06) 45%, rgba(201, 169, 110, 0.12) 50%, rgba(201, 169, 110, 0.06) 55%, transparent 60%)",
                  backgroundSize: "300% 100%",
                  animation: "shimmerCard 2s ease-in-out infinite",
                }}
              />

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Image Side */}
                <div className="relative aspect-square md:aspect-auto overflow-hidden">
                  <img
                    src={featuredOfDay.imageUrl || "/images/perfumes/golden-perfume.png"}
                    alt={featuredOfDay.name}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-noir/80 hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/80 to-transparent md:hidden" />
                </div>

                {/* Details Side */}
                <div className="relative p-8 sm:p-12 flex flex-col justify-center">
                  <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs tracking-widest uppercase animate-subtle-pulse mb-6">
                    <Sparkles className="w-3 h-3" />
                    Seleção do Dia
                  </span>
                  <p className="text-gold/70 text-xs tracking-[0.25em] uppercase mb-2">{featuredOfDay.olfactiveFamily}</p>
                  <h3 className="font-serif text-3xl sm:text-4xl font-bold text-foreground group-hover:text-gold transition-colors duration-300 mb-4">{featuredOfDay.name}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">{featuredOfDay.description}</p>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-3xl font-bold text-gold-gradient tabular-nums">€{featuredOfDay.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">100ml — Eau de Parfum</span>
                  </div>
                  <div>
                    <Button
                      className="bg-gold text-noir hover:bg-gold-light px-8 py-3 text-sm tracking-widest uppercase font-semibold"
                    >
                      Ver Perfume
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Instagram / Social Media Gallery */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Siga-nos no Instagram</p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Instagram className="w-6 h-6 text-gold" />
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Nosso Instagram</h2>
            </div>
            <a
              href="https://instagram.com/almalik.perfumes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gold/60 hover:text-gold transition-colors"
            >
              @almalik.perfumes
            </a>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {instagramPosts.map((post, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => toast.success("Siga-nos no Instagram!", { description: "@almalik.perfumes" })}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-gold/10 hover:border-gold/30 transition-all duration-300"
              >
                <img
                  src={post.img}
                  alt={`Instagram post ${i + 1}`}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex flex-col items-center gap-2">
                    <Instagram className="w-8 h-8 text-white drop-shadow-lg" />
                    <div className="flex items-center gap-3 text-white text-sm font-medium">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 fill-white" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" /> {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button
              onClick={() => window.open("https://instagram.com/almalik.perfumes", "_blank")}
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10 tracking-widest uppercase text-sm"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Seguir no Instagram
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Depoimentos</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">O Que Dizem Nossos Clientes</h2>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>

          <div
            className="relative max-w-xl mx-auto"
            onMouseEnter={() => setTestimonialPaused(true)}
            onMouseLeave={() => setTestimonialPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="p-8 sm:p-10 rounded-lg card-luxury testimonial-quote-bg text-center relative border-l-2 border-l-gold/30"
              >
                {/* Gold star rating display */}
                <div className="flex items-center justify-center gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`w-5 h-5 ${j < testimonials[currentTestimonial].rating ? "fill-gold text-gold" : "text-gold/20"}`}
                    />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-gold/20 mx-auto mb-4" />
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 italic">
                  &ldquo;{testimonials[currentTestimonial].text}&rdquo;
                </p>
                <div className="gold-line max-w-[60px] mx-auto mb-4" />
                <p className="font-medium text-sm text-foreground">{testimonials[currentTestimonial].author}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                  i === currentTestimonial
                    ? "bg-gold w-8"
                    : "bg-gold/30 hover:bg-gold/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Instagram-Style Social Feed */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">
              <Instagram className="w-4 h-4 inline mr-2" />
              Siga-nos no Instagram
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Vida na Alma Lik</h2>
            <a
              href="https://instagram.com/almalik"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gold/60 hover:text-gold transition-colors"
            >
              @almalik
            </a>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          <div className="relative group/ig">
            {/* Left gradient fade */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-noir to-transparent z-10 pointer-events-none opacity-0 group-hover/ig:opacity-100 transition-opacity" />
            {/* Right gradient fade */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-noir to-transparent z-10 pointer-events-none opacity-0 group-hover/ig:opacity-100 transition-opacity" />
            {/* Left arrow */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                const c = document.getElementById('instagram-feed-scroll');
                if (c) c.scrollBy({ left: -300, behavior: 'smooth' });
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-noir/80 border border-gold/20 flex items-center justify-center text-gold hover:bg-noir hover:border-gold/40 transition-all opacity-0 group-hover/ig:opacity-100 hidden md:flex shadow-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            {/* Right arrow */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                const c = document.getElementById('instagram-feed-scroll');
                if (c) c.scrollBy({ left: 300, behavior: 'smooth' });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-noir/80 border border-gold/20 flex items-center justify-center text-gold hover:bg-noir hover:border-gold/40 transition-all opacity-0 group-hover/ig:opacity-100 hidden md:flex shadow-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
            <div
              id="instagram-feed-scroll"
              className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent scroll-smooth"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {instagramFeedData.map((post, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ scale: 1.03 }}
                  className="flex-shrink-0 w-64 sm:w-72 card-luxury rounded-xl overflow-hidden bg-charcoal/60"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={post.img}
                      alt={`Instagram post ${i + 1}`}
                      className="w-full h-full object-cover img-zoom"
                    />
                    <div className="absolute inset-0 bg-noir/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                      <span className="flex items-center gap-1.5 text-white text-sm font-medium">
                        <Heart className="w-5 h-5 fill-white" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1.5 text-white text-sm font-medium">
                        <MessageCircle className="w-5 h-5" /> {post.comments}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Instagram className="w-4 h-4 text-gold" />
                      <span className="text-xs text-gold font-medium">almalik</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{post.caption}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="text-center mt-10">
            <Button
              onClick={() => window.open("https://instagram.com/almalik", "_blank")}
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10 tracking-widest uppercase text-sm"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Ver no Instagram @almalik
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-gold/10 bg-secondary/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center items-center">
            {statsData.map((stat, i) => (
              <Fragment key={stat.label}>
                {i > 0 && <div className="gold-dot-separator mx-auto hidden md:block" />}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="stat-glow-bg py-4"
                >
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  <p className="text-sm text-muted-foreground mt-2 tracking-wider uppercase">{stat.label}</p>
                </motion.div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Subtle gradient overlay below stats */}
      <div className="luxury-section h-32 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent -mt-8" />

      {/* Loyalty Program */}
      <section className="py-20 sm:py-24 luxury-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Recompensas por Fidelidade</p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Crown className="w-6 h-6 text-gold" />
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Programa de Fidelidade</h2>
              <Crown className="w-6 h-6 text-gold" />
            </div>
            <p className="text-muted-foreground max-w-lg mx-auto mt-3">
              Ganhe <span className="text-gold font-semibold">10 pontos</span> por cada <span className="text-gold font-semibold">€1</span> gasto.
              Acumule pontos e desbloqueie benefícios exclusivos em cada nível.
            </p>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loyaltyTiers.map((tier, i) => {
              const TierIcon = tier.icon;
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className={`card-luxury rounded-xl p-6 border ${tier.border} relative overflow-hidden ${tier.isActive ? 'gold-glow' : ''}`}
                >
                  {tier.isActive && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-gold text-noir text-[10px] font-bold uppercase tracking-wider">Atual</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${tier.isActive ? `${tier.bg} border border-gold/30` : `${tier.bg}`}`}>
                      <TierIcon className={`w-8 h-8 ${tier.accent}`} />
                    </div>
                    <h3 className={`font-serif text-xl font-bold mb-1 ${tier.isActive ? 'text-gold-gradient' : 'text-foreground'}`}>
                      {tier.name}
                    </h3>
                    <p className={`text-xs tracking-widest uppercase mb-4 ${tier.isActive ? 'text-gold/70' : 'text-muted-foreground'}`}>
                      {tier.points} pontos
                    </p>
                    <div className="w-full space-y-2.5">
                      {tier.benefits.map((benefit, j) => (
                        <div key={j} className={`flex items-start gap-2 text-sm ${tier.isActive ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${tier.isActive ? 'bg-gold' : `bg-${tier.color}/40`}`} />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-24 bg-secondary/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Dúvidas Frequentes</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Perguntas Frequentes</h2>
            <p className="text-muted-foreground mt-3">Tudo o que precisa saber</p>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-gold/10"
                >
                  <AccordionTrigger className="text-foreground hover:text-gold hover:no-underline py-5 text-left text-base font-medium [&[data-state=open]]:text-gold [&>svg]:text-gold/60 [&[data-state=open]>svg]:rotate-180">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Brand Trust / Partners Strip */}
      <section className="py-14 sm:py-16 border-y border-gold/10 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <p className="text-muted-foreground/50 text-xs tracking-[0.3em] uppercase">Vistos em</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center justify-center gap-8 sm:gap-16 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent"
          >
            {trustPartners.map((partner, i) => (
              <motion.span
                key={partner}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.05, opacity: 0.7 }}
                className="flex-shrink-0 text-foreground/20 hover:text-foreground/50 transition-colors duration-300 text-sm sm:text-base tracking-[0.3em] uppercase font-medium whitespace-nowrap cursor-default select-none"
              >
                {partner}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Porquê a Alma Lik? — Differentiators */}
      <section className="py-20 sm:py-24 luxury-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">
              <Gem className="w-4 h-4 inline mr-2" />
              A Diferença Alma Lik
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Porquê a Alma Lik?</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">A experiência de compra que merece</p>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="card-luxury rounded-xl p-6 text-center relative overflow-hidden group"
                >
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(ellipse at center, rgba(201,169,110,0.06) 0%, transparent 70%)" }} />
                  <div className="relative">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ItemIcon className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs text-gold/70 tracking-wider uppercase mb-3">{item.subtitle}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 sm:py-24 relative gold-border-top">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(201,169,110,0.06) 0%, transparent 60%)' }} />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="ornament-diamond max-w-[200px] mx-auto">
              <div className="ornament-diamond-icon" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient">
              Receba Novidades Exclusivas
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Subscreva à nossa newsletter e receba ofertas exclusivas, lançamentos antecipados e dicas de perfumaria diretamente no seu email.
            </p>
            <div className="max-w-md mx-auto">
              {!newsletterSuccess ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="O seu melhor email..."
                    className="flex-1 bg-secondary/30 border border-gold/20 rounded-lg px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNewsletterSubscribe}
                    disabled={newsletterLoading}
                    className="bg-gold text-noir hover:bg-gold-light px-6 py-3.5 rounded-lg text-sm font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap btn-gold-glow"
                  >
                    {newsletterLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Subscrever
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 py-3 text-gold"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Subscrição confirmada!</span>
                </motion.div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-4">
              Ao subscrever concorda com a nossa Política de Privacidade. Pode cancelar a qualquer momento.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-28 sm:py-36 relative overflow-hidden gold-border-top noise-overlay">
        {/* Gold radial glow background */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(201,169,110,0.12) 0%, transparent 65%)' }} />
        {/* Side gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/5 pointer-events-none" />
        {/* Noise overlay */}
        <div className="absolute inset-0 pointer-events-none" />
        {/* Floating gold dots */}
        <div className="absolute top-1/4 left-[10%] w-2 h-2 rounded-full bg-gold/40 animate-float-dot" />
        <div className="absolute top-1/3 right-[15%] w-1.5 h-1.5 rounded-full bg-gold/30 animate-float-dot" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-[55%] w-1 h-1 rounded-full bg-gold/50 animate-float-dot" style={{ animationDelay: '4s' }} />
        <div className="absolute top-[15%] right-[40%] w-2.5 h-2.5 rounded-full bg-gold/20 animate-float-dot" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[35%] right-[8%] w-1.5 h-1.5 rounded-full bg-gold/35 animate-float-dot" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Diamond ornament divider */}
            <div className="ornament-diamond mb-4">
              <div className="ornament-diamond-icon" />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-gradient leading-tight">
              Encontre Sua Fragrância Ideal
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg max-w-xl mx-auto">
              Nosso Sommelier Digital com Inteligência Artificial analisa suas preferências e recomenda a fragrância perfeita para você.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button
                onClick={() => { setCurrentPage("ai-sommelier"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="btn-premium bg-gold text-noir hover:bg-gold-light hover:gold-glow px-10 py-7 text-sm tracking-widest uppercase font-semibold text-base"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Falar com o Sommelier
              </Button>
              <Button
                onClick={() => { setCurrentPage("catalog"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10 px-8 py-6 text-sm tracking-widest uppercase font-semibold"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Catálogo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
