import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
}

export function StarRating({
  rating = 0,
  onRate,
  readonly = false,
  size = "md",
  showCount = false,
  count = 0,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const currentRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= currentRating;
        const isHalf = starValue - 0.5 <= currentRating && starValue > currentRating;

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            className={`${readonly ? "cursor-default" : "cursor-pointer"} transition-transform ${!readonly && "hover:scale-110"}`}
            onClick={() => !readonly && onRate?.(starValue)}
            onMouseEnter={() => !readonly && setHoverRating(starValue)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            data-testid={`star-rating-${starValue}`}
          >
            <Star
              className={`${sizes[size]} transition-colors ${
                isFilled
                  ? "text-amber-400 fill-amber-400"
                  : isHalf
                  ? "text-amber-400 fill-amber-400/50"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        );
      })}
      {showCount && (
        <span className="text-sm text-muted-foreground ml-1">({count})</span>
      )}
    </div>
  );
}
