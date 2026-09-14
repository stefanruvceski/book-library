import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  className?: string;
  size?: number;
  /** Rendered on the parchment page (dark ink) rather than in the dark room. */
  onPaper?: boolean;
}

export function RatingStars({ rating, className, size = 14, onPaper = false }: RatingStarsProps) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rated ${rounded} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((step) => {
        const fill = Math.min(1, Math.max(0, rounded - step + 1));
        return (
          <span key={step} className="relative inline-block" style={{ width: size, height: size }}>
            <Star
              size={size}
              strokeWidth={1.5}
              className={onPaper ? "absolute inset-0 text-ink/25" : "absolute inset-0 text-dust/25"}
            />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star
                  size={size}
                  strokeWidth={1.5}
                  className={onPaper ? "text-amber-700" : "text-brass"}
                  fill="currentColor"
                />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
