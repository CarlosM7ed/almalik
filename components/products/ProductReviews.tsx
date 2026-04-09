"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  CheckCircle,
  ThumbsUp,
  MessageSquarePlus,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Review {
  id: string;
  productId: string;
  productName: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
}

interface ReviewsData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

/* ───── Star Display Helper ───── */
function StarDisplay({
  rating,
  size = "sm",
  interactive = false,
  onRate,
  hoverRating,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (r: number) => void;
  hoverRating?: number;
}) {
  const sizeClass = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  }[size];

  const displayRating = hoverRating ?? rating;

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(displayRating);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(i + 1)}
            onMouseEnter={() => interactive && onRate?.(i + 1)}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"} disabled:cursor-default`}
          >
            <Star
              className={`${sizeClass} transition-colors ${
                filled
                  ? "fill-gold text-gold"
                  : "fill-transparent text-muted-foreground/30"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ───── Star Distribution Bar ───── */
function DistributionBar({
  stars,
  count,
  total,
}: {
  stars: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right text-xs text-muted-foreground">
        {stars} <Star className="w-2.5 h-2.5 inline fill-gold text-gold" />
      </span>
      <div className="flex-1 h-2 rounded-full bg-secondary/20 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold"
        />
      </div>
      <span className="w-6 text-xs text-muted-foreground text-right">
        {count}
      </span>
    </div>
  );
}

/* ───── Review Card ───── */
function ReviewCard({
  review,
  index,
}: {
  review: Review;
  index: number;
}) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpful = () => {
    if (hasVoted) return;
    setHasVoted(true);
    setHelpfulCount((c) => c + 1);
    toast.success("Obrigado pelo seu feedback!");
  };

  const formattedDate = format(new Date(review.createdAt), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="p-5 rounded-xl border border-gold/10 bg-secondary/5 hover:border-gold/20 transition-colors"
    >
      {/* Header: Author + Date */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold font-semibold text-sm">
            {review.author.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold">{review.author}</p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        {review.verified && (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] gap-1 shrink-0">
            <CheckCircle className="w-3 h-3" />
            Compra verificada
          </Badge>
        )}
      </div>

      {/* Stars */}
      <div className="mb-2">
        <StarDisplay rating={review.rating} size="sm" />
      </div>

      {/* Title */}
      {review.title && (
        <p className="text-sm font-semibold mb-1">{review.title}</p>
      )}

      {/* Comment */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {review.comment}
      </p>

      {/* Helpful */}
      <div className="mt-3 pt-3 border-t border-gold/5">
        <button
          onClick={handleHelpful}
          disabled={hasVoted}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            hasVoted
              ? "text-gold cursor-default"
              : "text-muted-foreground hover:text-gold cursor-pointer"
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? "fill-gold" : ""}`} />
          Útil ({helpfulCount})
        </button>
      </div>
    </motion.div>
  );
}

/* ───── Review Form Dialog ───── */
function ReviewFormDialog({
  open,
  onOpenChange,
  productId,
  productName,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  onSubmit: () => void;
}) {
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    setAuthor("");
    setTitle("");
    setComment("");
    setRating(0);
    setHoverRating(0);
    setErrors({});
  }, []);

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!author.trim() || author.trim().length < 2) {
      errs.author = "Nome obrigatório (mín. 2 caracteres)";
    }
    if (rating < 1 || rating > 5) {
      errs.rating = "Selecione uma classificação";
    }
    if (!comment.trim() || comment.trim().length < 10) {
      errs.comment = "Comentário obrigatório (mín. 10 caracteres)";
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productName,
          author: author.trim(),
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar avaliação");
      }

      toast.success("Avaliação enviada com sucesso!");
      handleClose(false);
      onSubmit();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar avaliação");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-noir border-gold/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-gold-gradient">
            Escrever Avaliação
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {productName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Star Rating Selector */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Classificação
            </Label>
            <div className="flex items-center gap-2">
              <StarDisplay
                rating={rating}
                size="lg"
                interactive
                onRate={(r) => {
                  setRating(r);
                  if (errors.rating) setErrors((prev) => ({ ...prev, rating: "" }));
                }}
                hoverRating={hoverRating}
              />
              {rating > 0 && (
                <span className="text-sm text-gold font-medium">
                  {rating}/5
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="text-xs text-red-400">{errors.rating}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title" className="text-sm text-muted-foreground">
              Título
            </Label>
            <Input
              id="review-title"
              placeholder="Resuma a sua experiência..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary/10 border-gold/10 text-foreground placeholder:text-muted-foreground/50 focus:border-gold/40"
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment" className="text-sm text-muted-foreground">
              Comentário
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Conte-nos mais sobre a sua experiência com este perfume..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (errors.comment) setErrors((prev) => ({ ...prev, comment: "" }));
              }}
              rows={4}
              className="bg-secondary/10 border-gold/10 text-foreground placeholder:text-muted-foreground/50 focus:border-gold/40 resize-none"
            />
            {errors.comment && (
              <p className="text-xs text-red-400">{errors.comment}</p>
            )}
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="review-author" className="text-sm text-muted-foreground">
              O seu nome
            </Label>
            <Input
              id="review-author"
              placeholder="Nome"
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value);
                if (errors.author) setErrors((prev) => ({ ...prev, author: "" }));
              }}
              className="bg-secondary/10 border-gold/10 text-foreground placeholder:text-muted-foreground/50 focus:border-gold/40"
            />
            {errors.author && (
              <p className="text-xs text-red-400">{errors.author}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            className="border-gold/20 text-gold hover:bg-gold/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gold text-noir hover:bg-gold-light font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A enviar...
              </>
            ) : (
              "Enviar Avaliação"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───── Main ProductReviews Component ───── */
export function ProductReviews({ productId }: { productId: string }) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productName, setProductName] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const json: ReviewsData = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Fetch product name for the review form
  useEffect(() => {
    async function fetchProductName() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const json = await res.json();
          setProductName(json.product?.name || "");
        }
      } catch {
        // ignore
      }
    }
    fetchProductName();
  }, [productId]);

  // Compute distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: data?.reviews.filter((r) => r.rating === star).length || 0,
  }));

  // Loading skeleton
  if (loading) {
    return (
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-bold text-gold-gradient mb-6">
          Avaliações
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
          <div className="p-6 rounded-xl border border-gold/10 bg-secondary/5 space-y-4">
            <div className="h-12 w-12 rounded-full bg-secondary/20 mx-auto" />
            <div className="h-4 w-20 bg-secondary/20 mx-auto" />
            <div className="h-4 w-32 bg-secondary/20 mx-auto" />
            <div className="space-y-2 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-2 bg-secondary/20 rounded-full" />
              ))}
            </div>
          </div>
          <div className="md:col-span-2 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-gold/10 bg-secondary/5 space-y-3"
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary/20" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-24 bg-secondary/20" />
                    <div className="h-2 w-16 bg-secondary/20" />
                  </div>
                </div>
                <div className="h-3 w-full bg-secondary/20" />
                <div className="h-3 w-3/4 bg-secondary/20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No reviews state
  if (!data || data.totalReviews === 0) {
    return (
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-bold text-gold-gradient mb-6">
          Avaliações
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-xl border border-gold/10 bg-secondary/5 text-center"
        >
          <Star className="w-12 h-12 text-gold/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Seja o primeiro a avaliar este produto
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gold text-noir hover:bg-gold-light font-semibold"
          >
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            Escrever Avaliação
          </Button>
        </motion.div>

        <ReviewFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          productId={productId}
          productName={productName}
          onSubmit={fetchReviews}
        />
      </section>
    );
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-gold-gradient">
          Avaliações
        </h2>
        <Button
          onClick={() => setDialogOpen(true)}
          variant="outline"
          className="border-gold/20 text-gold hover:bg-gold/10 text-sm"
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          Escrever Avaliação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Rating Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-xl border border-gold/10 bg-secondary/5"
        >
          {/* Average */}
          <div className="text-center mb-6">
            <p className="text-5xl font-bold text-gold-gradient">
              {data.averageRating.toFixed(1)}
            </p>
            <div className="flex justify-center mt-2">
              <StarDisplay rating={data.averageRating} size="md" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {data.totalReviews}{" "}
              {data.totalReviews === 1 ? "avaliação" : "avaliações"}
            </p>
          </div>

          <Separator className="bg-gold/10 mb-5" />

          {/* Distribution */}
          <div className="space-y-2.5">
            {distribution.map((d) => (
              <DistributionBar
                key={d.star}
                stars={d.star}
                count={d.count}
                total={data.totalReviews}
              />
            ))}
          </div>
        </motion.div>

        {/* Review List */}
        <div className="md:col-span-2">
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {data.reviews.map((review, index) => (
                <ReviewCard key={review.id} review={review} index={index} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ReviewFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productId={productId}
        productName={productName}
        onSubmit={fetchReviews}
      />
    </section>
  );
}
