"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Flower2, TreePine, Waves, Flame, Candy, Wind, Sparkles, Clock, Star, Lightbulb, ChevronLeft, ChevronRight, User, Zap, Briefcase, PartyPopper, Sun, Search, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { useStore } from "@/lib/store";

// =================== FRAGRANCE FINDER QUIZ ===================

interface QuizOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const genderOptions: QuizOption[] = [
  { id: "masculino", label: "Masculino", description: "Fragrâncias com carácter e presença", icon: User },
  { id: "feminino", label: "Feminino", description: "Aromas delicados e sofisticados", icon: Flower2 },
  { id: "unissex", label: "Unissex", description: "Perfumes versáteis para todos", icon: Sparkles },
];

const intensityOptions: QuizOption[] = [
  { id: "leve", label: "Leve", description: "Discreto e fresco para o dia a dia", icon: Wind },
  { id: "moderada", label: "Moderada", description: "Equilibrado e elegante para qualquer hora", icon: Droplets },
  { id: "intensa", label: "Intensa", description: "Marcante e sofisticado", icon: Flame },
  { id: "muito-intensa", label: "Muito Intensa", description: "Extratos e concentrates com grande fixação", icon: Zap },
];

const occasionOptions: QuizOption[] = [
  { id: "dia-a-dia", label: "Dia a Dia", description: "Para uso casual e quotidiano", icon: Sun },
  { id: "noite", label: "Noite", description: "Para saídas e jantares", icon: Moon },
  { id: "trabalho", label: "Trabalho", description: "Profissional e discreto", icon: Briefcase },
  { id: "festa", label: "Festa", description: "Para celebrar e impressionar", icon: PartyPopper },
  { id: "verao", label: "Verão", description: "Frescura e vitalidade", icon: Sun },
];

import { Moon } from "lucide-react";

const familyOptions: QuizOption[] = [
  { id: "oriental", label: "Oriental", description: "Âmbar, baunilha e especiarias", icon: Droplets },
  { id: "floral", label: "Floral", description: "Rosa, jasmim e peónia", icon: Flower2 },
  { id: "amadeirado", label: "Amadeirado", description: "Cedro, vetiver e patchouli", icon: TreePine },
  { id: "citríco", label: "Cítrico", description: "Bergamota, limão e toranja", icon: Waves },
  { id: "gourmet", label: "Gourmet", description: "Caramelo, café e chocolate", icon: Candy },
];

const intensityMap: Record<string, string> = {
  "leve": "leve",
  "moderada": "moderada",
  "intensa": "intensa",
  "muito-intensa": "intensa",
};

const occasionMap: Record<string, string> = {
  "dia-a-dia": "dia a dia",
  "noite": "noite",
  "trabalho": "trabalho",
  "festa": "festa",
  "verao": "verão",
};

const familyMap: Record<string, string> = {
  "oriental": "oriental",
  "floral": "floral",
  "amadeirado": "amadeirado",
  "cítrico": "cítrico",
  "gourmet": "gourmet",
};

interface QuizResults {
  gender: string;
  intensity: string;
  occasions: string[];
  family: string;
}

function FragranceFinderQuiz() {
  const { setFilter, setCurrentPage, resetFilters } = useStore();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState("");
  const [intensity, setIntensity] = useState("");
  const [occasions, setOccasions] = useState<string[]>([]);
  const [family, setFamily] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const totalSteps = 4;
  const stepQuestions = [
    "Qual é o seu género?",
    "Qual a intensidade que prefere?",
    "Para que ocasião?",
    "Qual a família olfativa?",
  ];

  const currentOptions = [
    genderOptions,
    intensityOptions,
    occasionOptions,
    familyOptions,
  ][step];

  const canProceed = () => {
    if (step === 0) return gender !== "";
    if (step === 1) return intensity !== "";
    if (step === 2) return occasions.length > 0;
    if (step === 3) return family !== "";
    return false;
  };

  const handleOccasionToggle = (id: string) => {
    setOccasions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Fetch results
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (gender && gender !== "unissex") params.set("gender", gender);
        if (intensity) params.set("intensity", intensityMap[intensity] || intensity);
        if (family) params.set("olfactiveFamily", familyMap[family] || family);
        params.set("limit", "6");

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();

        // If we got results, take top 3. If not, fallback to gender/family
        if (data.products && data.products.length > 0) {
          setResults(data.products.slice(0, 3));
        } else {
          // Fallback: just use family
          const fallbackParams = new URLSearchParams();
          fallbackParams.set("olfactiveFamily", familyMap[family] || family);
          fallbackParams.set("limit", "3");
          const fallbackRes = await fetch(`/api/products?${fallbackParams.toString()}`);
          const fallbackData = await fallbackRes.json();
          setResults(fallbackData.products?.slice(0, 3) || []);
        }
        setShowResults(true);
      } catch {
        setResults([]);
        setShowResults(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleViewAll = () => {
    resetFilters();
    if (gender && gender !== "unissex") setFilter("gender", gender);
    if (intensity) setFilter("intensity", intensityMap[intensity] || intensity);
    if (family) setFilter("olfactiveFamily", familyMap[family] || family);
    if (occasions.length > 0) {
      setFilter("occasion", occasionMap[occasions[0]] || occasions[0]);
    }
    setCurrentPage("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setStep(0);
    setGender("");
    setIntensity("");
    setOccasions([]);
    setFamily("");
    setResults([]);
    setShowResults(false);
  };

  const handleOptionClick = (id: string) => {
    if (step === 0) setGender(id);
    else if (step === 1) setIntensity(id);
    else if (step === 2) handleOccasionToggle(id);
    else if (step === 3) setFamily(id);
  };

  const isSelected = (id: string) => {
    if (step === 0) return gender === id;
    if (step === 1) return intensity === id;
    if (step === 2) return occasions.includes(id);
    if (step === 3) return family === id;
    return false;
  };

  return (
    <div className="mb-20">
      {/* Quiz Container */}
      <div className="max-w-3xl mx-auto">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  i < step
                    ? "bg-gold scale-100"
                    : i === step
                    ? "bg-gold scale-125 ring-4 ring-gold/20"
                    : "bg-gold/20"
                }`}
              />
              {i < totalSteps - 1 && (
                <div
                  className={`w-12 sm:w-20 h-px transition-all duration-500 ${
                    i < step ? "bg-gold" : "bg-gold/20"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question */}
              <div className="text-center mb-8">
                <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">
                  Passo {step + 1} de {totalSteps}
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient">
                  {stepQuestions[step]}
                </h2>
              </div>

              {/* Options */}
              <div className={`grid gap-4 ${
                step === 2 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-3"
              }`}>
                {currentOptions.map((option, i) => {
                  const Icon = option.icon;
                  const selected = isSelected(option.id);
                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => handleOptionClick(option.id)}
                      className={`rounded-xl border p-4 cursor-pointer transition-all text-center group ${
                        selected
                          ? "border-gold/60 bg-gold/10 shadow-lg shadow-gold/5"
                          : "border-gold/10 hover:border-gold/30 hover:bg-gold/5"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center transition-all ${
                          selected
                            ? "bg-gold/20 border border-gold/40"
                            : "bg-gold/10 border border-gold/20 group-hover:bg-gold/15"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 transition-colors ${
                            selected ? "text-gold" : "text-gold/60 group-hover:text-gold"
                          }`}
                        />
                      </div>
                      <h3
                        className={`font-serif text-sm sm:text-base font-semibold mb-1 transition-colors ${
                          selected ? "text-gold" : "text-foreground group-hover:text-gold/80"
                        }`}
                      >
                        {option.label}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {option.description}
                      </p>
                      {selected && (
                        <motion.div
                          layoutId="quiz-selected-ring"
                          className="absolute inset-0 rounded-xl border-2 border-gold/40 pointer-events-none"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={handleBack}
                  disabled={step === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all ${
                    step === 0
                      ? "text-muted-foreground/30 cursor-not-allowed"
                      : "text-gold/70 hover:text-gold hover:bg-gold/5"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>

                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    canProceed()
                      ? "bg-gold text-noir hover:bg-gold-light shadow-lg shadow-gold/20"
                      : "bg-gold/20 text-gold/40 cursor-not-allowed"
                  }`}
                >
                  {step === totalSteps - 1 ? (
                    <>
                      Ver Resultados
                      <Search className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Próximo
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Results Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4"
                >
                  <Sparkles className="w-7 h-7 text-gold" />
                </motion.div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient mb-2">
                  As Nossas Recomendações
                </h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Com base nas suas preferências, estes são os perfumes ideais para si.
                </p>
              </div>

              {/* Results Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gold/10 p-4 animate-pulse"
                    >
                      <div className="aspect-[3/4] rounded bg-gold/5 mb-4" />
                      <div className="h-4 bg-gold/10 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gold/5 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {results.map((product: any, i: number) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <ProductCard product={product} index={i} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl border border-gold/10 bg-noir/50">
                  <Sparkles className="w-8 h-8 text-gold/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Não encontrámos perfumes exatos com essas características.
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Tente outras combinações ou explore o nosso catálogo completo.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleViewAll}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gold text-noir text-sm font-medium hover:bg-gold-light shadow-lg shadow-gold/20 transition-colors"
                >
                  Ver Todos os Resultados
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gold/20 text-gold/70 text-sm hover:bg-gold/5 hover:text-gold transition-all"
                >
                  Refazer Quiz
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// =================== EXISTING GUIDE CONTENT ===================

const families = [
  {
    name: "Oriental",
    icon: Droplets,
    color: "from-amber-900/40 to-orange-900/30",
    description: "Ricos, amadeirados e exóticos. Notas de âmbar, baunilha e especiarias criam uma aura misteriosa e envolvente.",
    notes: ["Âmbar", "Baunilha", "Oud", "Sândalo", "Incenso"],
    occasions: "Noite, eventos especiais, inverno",
    bestFor: "Quem busca sofisticação e intensidade",
  },
  {
    name: "Floral",
    icon: Flower2,
    color: "from-pink-900/40 to-rose-900/30",
    description: "Delicados e românticos. A essência de flores frescas e Jardim que evocam elegância e feminilidade.",
    notes: ["Rosa", "Jasmim", "Lírio", "Tuberosa", "Peônia"],
    occasions: "Dia a dia, primavera, encontros românticos",
    bestFor: "Quem aprecia delicadeza e romance",
  },
  {
    name: "Amadeirado",
    icon: TreePine,
    color: "from-yellow-900/40 to-amber-900/30",
    description: "Forte presença de madeiras nobres. Profundos, elegantes e com personalidade marcante.",
    notes: ["Cedro", "Vetiver", "Patchouli", "Sândalo", "Mogno"],
    occasions: "Trabalho, eventos formais, outono",
    bestFor: "Quem valoriza carácter e presença",
  },
  {
    name: "Cítrico",
    icon: Waves,
    color: "from-cyan-900/40 to-blue-900/30",
    description: "Frescos e vibrantes. Notas de limão, bergamota e toranja que energizam e revigoram.",
    notes: ["Bergamota", "Limão", "Toranja", "Neroli", "Petitgrain"],
    occasions: "Verão, dia a dia, desporto",
    bestFor: "Quem prefere frescura e energia",
  },
  {
    name: "Fougère",
    icon: Wind,
    color: "from-green-900/40 to-emerald-900/30",
    description: "Clássicos e sofisticados. A combinação de lavanda, musgo e fava-tonka é sinónimo de elegância masculina.",
    notes: ["Lavanda", "Musgo", "Fava-tonka", "Gerânio", "Vetiver"],
    occasions: "Dia a dia, trabalho, ocasiões formais",
    bestFor: "Quem busca um clássico atemporal",
  },
  {
    name: "Gourmet",
    icon: Candy,
    color: "from-orange-900/40 to-red-900/30",
    description: "Açucarados e irresistíveis. Com notas de caramelo, café e chocolate que despertam os sentidos.",
    notes: ["Caramelo", "Café", "Chocolate", "Baunilha", "Mel"],
    occasions: "Noite, inverno, encontros íntimos",
    bestFor: "Quem adora fragrâncias gourmand",
  },
  {
    name: "Aquático",
    icon: Waves,
    color: "from-blue-900/40 to-cyan-900/30",
    description: "Limpos e arejados. Notas de água do mar, ozono e notas verdes que transmitem frescura pura.",
    notes: ["Notas marinhas", "Ozono", "Melão", "Pepino", "Lotus"],
    occasions: "Verão, praia, atividades ao ar livre",
    bestFor: "Quem ama frescura e leveza",
  },
  {
    name: "Especiado",
    icon: Flame,
    color: "from-red-900/40 to-amber-900/30",
    description: "Intensos e provocantes. Pimenta, canela e cardamomo criam composições quentes e sedutoras.",
    notes: ["Pimenta", "Canela", "Cardamomo", "Cravo", "Gengibre"],
    occasions: "Noite, outono, inverno, festas",
    bestFor: "Quem quer marcar presença",
  },
];

const tips = [
  {
    title: "Como Aplicar o Perfume",
    icon: Droplets,
    content: "Aplique nos pontos de pulsação: pulsos, pescoço, atrás das orelhas e dobras dos cotovelos. Evite esfregar — deixe o perfume assentar naturalmente na pele para uma melhor fixação.",
  },
  {
    title: "Intensidade por Ocasião",
    icon: Star,
    content: "Para o dia a dia, prefira fragrâncias leves e cítricas. Para a noite, aposte em orientais e amadeirados mais intensos. No trabalho, mantenha a discrição com notas frescas e moderadas.",
  },
  {
    title: "Armazenamento Correto",
    icon: Clock,
    content: "Guarde seus perfumes em local fresco e seco, longe da luz solar direta. A umidade e o calor alteram a composição da fragrância. A bathroom não é o local ideal.",
  },
  {
    title: "Conheça a Pirâmide Olfativa",
    icon: Sparkles,
    content: "Cada perfume tem três fases: notas de topo (primeiros 15 min), notas de coração (2-4 horas) e notas de base (fixação prolongada). Espere pelo menos 30 minutos para avaliar a fragrância completa.",
  },
  {
    title: "Teste Antes de Comprar",
    icon: Lightbulb,
    content: "Sempre teste o perfume na sua pele antes de comprar. A fragrância reage de forma única com cada tipo de pele. Não teste mais de 3 perfumes de uma vez — o olfato satura rapidamente.",
  },
  {
    title: "Tempo de Fixação",
    icon: Clock,
    content: "Perfumes Eau de Toilette duram 3-5 horas, Eau de Parfum 5-8 horas e Extrait de Parfum podem durar 12+ horas. Considere a ocasião ao escolher a concentração ideal.",
  },
];

// =================== BRAND STORY TIMELINE ===================

const timelineItems = [
  {
    year: "2020",
    title: "O Início",
    description: "A Alma Lik nasceu da paixão por fragrâncias exclusivas e da vontade de trazer o melhor da perfumaria árabe a Portugal.",
  },
  {
    year: "2021",
    title: "Primeira Coleção",
    description: "Lançámos a nossa primeira coleção com 20 fragrâncias cuidadosamente selecionadas de mestres perfumistas árabes.",
  },
  {
    year: "2023",
    title: "Expansão",
    description: "Com mais de 50 fragrâncias no catálogo, expandimos para a Península Ibérica e alcançámos 10.000 clientes.",
  },
  {
    year: "2025",
    title: "Inovação",
    description: "Lançámos o nosso Sommelier IA e continuamos a curar as melhores fragrâncias do mundo para os nossos clientes.",
  },
];

export function GuidePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary/10 border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase">Conhecimento Olfativo</p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-gradient">Guia de Fragrâncias</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tudo o que precisa saber para escolher, aplicar e apreciar fragrâncias de alto padrão.
            </p>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
        </div>
      </div>

      {/* Fragrance Finder Quiz */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Personalização</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient">Encontre o Seu Perfume Ideal</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm">
              Responda a 4 perguntas rápidas e descubra os perfumes perfeitos para as suas preferências.
            </p>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>
          <FragranceFinderQuiz />
        </div>
      </section>

      {/* Families */}
      <section className="py-16 sm:py-20 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Classificação Olfativa</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient">Famílias Olfativas</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {families.map((family, i) => (
              <motion.div
                key={family.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`p-6 rounded-xl border border-gold/10 bg-gradient-to-br ${family.color} hover:border-gold/30 transition-all`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <family.icon className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-gold-gradient">{family.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{family.description}</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gold/70 font-medium">Notas características: </span>
                    <span className="text-muted-foreground">{family.notes.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-gold/70 font-medium">Ocasiões: </span>
                    <span className="text-muted-foreground">{family.occasions}</span>
                  </div>
                  <div>
                    <span className="text-gold/70 font-medium">Ideal para: </span>
                    <span className="text-muted-foreground">{family.bestFor}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">Expertise</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient">Dicas de Perfumaria</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl border border-gold/10 bg-noir hover:border-gold/20 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                  <tip.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-gold-gradient mb-2">{tip.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tip.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Timeline */}
      <section className="py-16 sm:py-20 bg-secondary/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="ornament-diamond mb-4">
              <span className="ornament-diamond-icon">◆</span>
            </div>
            <p className="text-gold/70 text-sm tracking-[0.3em] uppercase mb-3">A Nossa Jornada</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient">
              A Nossa História
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">
              Uma jornada de paixão pela perfumaria
            </p>
            <div className="gold-line max-w-xs mx-auto mt-4" />
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gold/40 via-gold/20 to-gold/5" />

            <div className="space-y-10">
              {timelineItems.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative pl-12 sm:pl-16"
                >
                  {/* Gold dot on timeline */}
                  <div className="absolute left-[10px] sm:left-[18px] top-1 w-3 h-3 rounded-full bg-gold shadow-[0_0_12px_rgba(201,169,110,0.4)] z-10" />

                  {/* Content card */}
                  <div className="card-luxury rounded-xl p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-gold to-gold-light text-noir">
                        {item.year}
                      </span>
                      <h3 className="font-serif text-lg sm:text-xl font-semibold text-gold-gradient">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
