import type { PostBlock } from "../../content/types";

// Typed renderer for the structured post body. Each PostBlock maps to a styled
// element. Later, Payload's Lexical output is serialised into this same union
// (or this component is swapped for @payloadcms/richtext-lexical/react).
export function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: PostBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="text-base leading-9 text-text-muted">{block.text}</p>;

    case "heading":
      return block.level === 2 ? (
        <h2 className="mt-4 text-2xl font-bold leading-relaxed text-text sm:text-3xl">{block.text}</h2>
      ) : (
        <h3 className="mt-2 text-xl font-bold leading-relaxed text-text sm:text-2xl">{block.text}</h3>
      );

    case "quote":
      return (
        <blockquote className="rounded-2xl border-e-4 border-accent bg-accent-soft/60 px-6 py-5">
          <p className="text-lg font-medium leading-9 text-text">«{block.text}»</p>
          {block.cite && <cite className="mt-3 block text-sm not-italic text-text-muted">— {block.cite}</cite>}
        </blockquote>
      );

    case "image":
      return (
        <figure className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.src} alt={block.alt} className="w-full rounded-2xl border border-border" />
          {block.caption && (
            <figcaption className="text-center text-sm text-text-muted">{block.caption}</figcaption>
          )}
        </figure>
      );

    case "list":
      return block.ordered ? (
        <ol className="flex list-decimal flex-col gap-2.5 ps-6 text-base leading-8 text-text-muted marker:text-accent marker:font-bold">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="flex flex-col gap-2.5 text-base leading-8 text-text-muted">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      );

    case "code":
      return (
        <pre className="overflow-x-auto rounded-2xl border border-border bg-surface p-5 text-sm leading-7 text-text [direction:ltr]">
          <code>{block.code}</code>
        </pre>
      );

    case "divider":
      return <hr className="border-border" />;

    default:
      return null;
  }
}
