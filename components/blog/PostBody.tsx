import type { InlineNode, PostBlock } from "../../content/types";
import { buildHeadingIds } from "../../lib/toc";

// Typed renderer for the structured post body. Each PostBlock maps to a styled
// element.
//
// Blocks carry their text twice: `text`/`items` as a plain string (what the
// bundled file content ships) and `rich`/`richItems` as inline runs (what the
// CMS produces). Rich wins when present — that is what keeps links clickable
// and bold/italic visible instead of flattening the article into grey text.
export function PostBody({ blocks }: { blocks: PostBlock[] }) {
  const headingIds = buildHeadingIds(blocks);
  const leadIndex = blocks.findIndex((b) => b.type === "paragraph");

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => (
        <Block
          key={i}
          block={block}
          headingId={headingIds[i] || undefined}
          isLead={i === leadIndex}
        />
      ))}
    </div>
  );
}

function Inline({ nodes, fallback }: { nodes?: InlineNode[]; fallback: string }) {
  if (!nodes?.length) return <>{fallback}</>;
  return (
    <>
      {nodes.map((node, i) => (
        <InlineNodeView key={i} node={node} />
      ))}
    </>
  );
}

function InlineNodeView({ node }: { node: InlineNode }) {
  if (node.type === "link") {
    const external = /^https?:\/\//i.test(node.url);
    return (
      <a
        href={node.url}
        className="font-medium text-accent no-underline transition hover:text-accent/80"
        {...(node.newTab || external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {node.children.map((child, i) => (
          <InlineNodeView key={i} node={child} />
        ))}
      </a>
    );
  }

  // A soft line break inside a paragraph.
  if (node.text === "\n") return <br />;

  let content: React.ReactNode = node.text;
  if (node.code)
    content = (
      <code className="rounded bg-surface px-1.5 py-0.5 text-[0.9em] [direction:ltr]">
        {content}
      </code>
    );
  if (node.bold) content = <strong className="font-bold text-text">{content}</strong>;
  if (node.italic) content = <em>{content}</em>;
  if (node.underline) content = <u>{content}</u>;
  if (node.strikethrough) content = <s>{content}</s>;

  return <>{content}</>;
}

function Block({
  block,
  headingId,
  isLead = false,
}: {
  block: PostBlock;
  headingId?: string;
  isLead?: boolean;
}) {
  switch (block.type) {
    case "paragraph":
      // The opening paragraph gets editorial "lead" treatment.
      return isLead ? (
        <p className="text-lg leading-9 text-text sm:text-xl sm:leading-10">
          <Inline nodes={block.rich} fallback={block.text} />
        </p>
      ) : (
        <p className="text-base leading-9 text-text-muted">
          <Inline nodes={block.rich} fallback={block.text} />
        </p>
      );

    case "heading":
      return block.level === 2 ? (
        <h2
          id={headingId}
          className="relative mt-6 [scroll-margin-top:var(--anchor-offset,5rem)] ps-4 text-2xl font-bold leading-relaxed text-text before:absolute before:inset-y-1 before:start-0 before:w-1 before:rounded-full before:bg-accent sm:text-3xl"
        >
          <Inline nodes={block.rich} fallback={block.text} />
        </h2>
      ) : (
        <h3
          id={headingId}
          className="mt-3 [scroll-margin-top:var(--anchor-offset,5rem)] text-xl font-bold leading-relaxed text-text sm:text-2xl"
        >
          <Inline nodes={block.rich} fallback={block.text} />
        </h3>
      );

    case "quote":
      return (
        <blockquote className="rounded-2xl border-e-4 border-accent bg-accent-soft/60 px-6 py-5">
          <p className="text-lg font-medium leading-9 text-text">
            «<Inline nodes={block.rich} fallback={block.text} />»
          </p>
          {block.cite && (
            <cite className="mt-3 block text-sm not-italic text-text-muted">- {block.cite}</cite>
          )}
        </blockquote>
      );

    case "image":
      return (
        <figure className="my-2 flex flex-col gap-3">
          <div className="overflow-hidden rounded-2xl border border-border shadow-[0_20px_50px_-28px_rgba(0,0,0,0.5)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.src}
              alt={block.alt}
              className="w-full transition-transform duration-700 ease-out hover:scale-[1.015]"
            />
          </div>
          {block.caption && (
            <figcaption className="text-center text-sm text-text-muted">{block.caption}</figcaption>
          )}
        </figure>
      );

    case "list":
      return block.ordered ? (
        <ol className="flex list-decimal flex-col gap-2.5 ps-6 text-base leading-8 text-text-muted marker:text-accent marker:font-bold">
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline nodes={block.richItems?.[i]} fallback={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="flex flex-col gap-2.5 text-base leading-8 text-text-muted">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              <span>
                <Inline nodes={block.richItems?.[i]} fallback={item} />
              </span>
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
      return (
        <div className="my-4 flex items-center justify-center gap-2" role="separator">
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent/50" />
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      );

    default:
      return null;
  }
}
