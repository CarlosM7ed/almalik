"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Quero um perfume para o verão",
  "Sugestão de presente para mulher",
  "Perfume masculino para o dia a dia",
  "Qual o melhor perfume oriental?",
  "Perfume intenso para a noite",
  "Fragrância unissex elegante",
];

export function AISommelierPage() {
  const { sommelierMessages, addSommelierMessage, clearSommelierMessages, setCurrentPage, setSelectedProductSlug } = useStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [knownProductNames, setKnownProductNames] = useState<string[]>([]);
  const [productNameMap, setProductNameMap] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all product names on mount for linking
  useEffect(() => {
    async function fetchProductNames() {
      try {
        const res = await fetch("/api/products?limit=200");
        const data = await res.json();
        const products = data.products || [];
        const names = products.map((p: { name: string; slug: string }) => p.name);
        const map: Record<string, string> = {};
        products.forEach((p: { name: string; slug: string }) => {
          map[p.name] = p.slug;
        });
        // Sort by length descending so longer names are matched first
        names.sort((a: string, b: string) => b.length - a.length);
        setKnownProductNames(names);
        setProductNameMap(map);
      } catch {
        // Silently fail
      }
    }
    fetchProductNames();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sommelierMessages]);

  const handleSend = async (message?: string) => {
    const text = message || input.trim();
    if (!text || isLoading) return;

    addSommelierMessage("user", text);
    setInput("");
    setIsLoading(true);

    try {
      const allMessages = [...sommelierMessages, { role: "user" as const, content: text }];
      const res = await fetch("/api/ai-sommelier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });
      const data = await res.json();
      addSommelierMessage("assistant", data.reply);
    } catch {
      addSommelierMessage("assistant", "Desculpe, estou com dificuldades técnicas. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const linkProductText = useCallback((text: string): React.ReactNode[] => {
    if (knownProductNames.length === 0) return [text];

    // Build a regex pattern that matches any known product name
    // Escape special regex characters in product names
    const escapedNames = knownProductNames.map(name =>
      name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const pattern = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'gi');

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      // Add the matched product name as a clickable element
      const matchedName = match[1];
      const slug = productNameMap[matchedName];
      parts.push(
        <span
          key={match.index}
          className="text-gold cursor-pointer underline decoration-gold/30 hover:decoration-gold transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            if (slug) {
              setSelectedProductSlug(slug);
              setCurrentPage("product");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          {matchedName}
        </span>
      );
      lastIndex = pattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  }, [knownProductNames, productNameMap, setSelectedProductSlug, setCurrentPage]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-gold/10 bg-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">Sommelier Digital</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Nosso assistente com Inteligência Artificial vai ajudá-lo a encontrar a fragrância perfeita. 
              Descreva suas preferências, ocasiões e estilo pessoal.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 flex flex-col">
        <div className="flex-1 overflow-y-auto py-6 space-y-4 max-h-[calc(100vh-420px)] min-h-[300px]">
          {sommelierMessages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12"
            >
              <div className="w-20 h-20 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-gold/40" />
              </div>
              <div>
                <p className="text-lg font-serif text-gold-light mb-2">Olá! Sou o seu Sommelier Digital</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Conte-me sobre si — suas preferências, a ocasião, o estilo que deseja transmitir — e eu vou sugerir as fragrâncias ideais.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="px-4 py-2 rounded-full border border-gold/20 text-sm text-muted-foreground hover:text-gold hover:border-gold/40 hover:bg-gold/5 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {sommelierMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-gold" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gold text-noir rounded-br-sm"
                      : "bg-secondary/20 border border-gold/10 rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {linkProductText(msg.content).map((part, idx) => (
                        <span key={idx}>{part}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  )}
                  {msg.role === "assistant" && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-gold/5">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                        }}
                        className="text-[10px] text-muted-foreground hover:text-gold transition-colors"
                      >
                        Copiar
                      </button>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary/50 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-gold" />
              </div>
              <div className="bg-secondary/20 border border-gold/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gold/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-gold/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-gold/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gold/10 pt-4 pb-6">
          {sommelierMessages.length > 0 && (
            <div className="flex justify-center mb-3">
              <Button
                onClick={clearSommelierMessages}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" /> Limpar conversa
              </Button>
            </div>
          )}
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva suas preferências..."
              disabled={isLoading}
              className="flex-1 bg-secondary/30 border border-gold/10 rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/40 transition-colors disabled:opacity-50"
            />
            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-gold text-noir hover:bg-gold-light px-6 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
