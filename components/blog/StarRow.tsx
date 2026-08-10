import { Star } from "lucide-react";
import { toPersianDigits } from "../../lib/format";

export function StarRow({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${toPersianDigits(rating)} از ۵ ستاره`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${dim} ${i < rating ? "fill-accent text-accent" : "text-border"}`}
        />
      ))}
    </span>
  );
}
