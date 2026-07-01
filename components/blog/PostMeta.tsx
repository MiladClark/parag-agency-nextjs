import type { BlogAuthor } from "../../content/types";
import { formatJalaliDate, toPersianDigits } from "../../lib/format";
import { Clock } from "lucide-react";

export function AuthorAvatar({ author, size = "md" }: { author: BlogAuthor; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-12 w-12 text-base" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <span
      className={`flex ${dim} shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/40 bg-gradient-to-br from-accent to-accent-hover font-bold text-white`}
    >
      {author.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
      ) : (
        author.name.charAt(0)
      )}
    </span>
  );
}

export function PostMeta({
  author,
  publishedAt,
  readingMinutes,
}: {
  author: BlogAuthor;
  publishedAt: string;
  readingMinutes: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
      <span className="flex items-center gap-2">
        <AuthorAvatar author={author} size="sm" />
        <span className="font-medium text-text">{author.name}</span>
      </span>
      <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
      <span>{formatJalaliDate(publishedAt)}</span>
      <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
      <span className="flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        {toPersianDigits(readingMinutes)} دقیقه مطالعه
      </span>
    </div>
  );
}
