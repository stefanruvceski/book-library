import { Fragment, type ReactNode } from "react";

import type { BookSummary, RichTextNode } from "@/lib/types";

/**
 * Renders Storyblok rich text without an extra dependency.
 *
 * Covers the node types a "notes" field realistically uses; anything unknown
 * falls through to its children so new schema fields degrade to plain text
 * instead of disappearing.
 */

const MARK_WRAPPERS: Record<string, (children: ReactNode, attrs?: Record<string, unknown>) => ReactNode> = {
  bold: (children) => <strong className="font-semibold">{children}</strong>,
  strong: (children) => <strong className="font-semibold">{children}</strong>,
  italic: (children) => <em>{children}</em>,
  em: (children) => <em>{children}</em>,
  strike: (children) => <s>{children}</s>,
  underline: (children) => <u>{children}</u>,
  code: (children) => (
    <code className="rounded bg-ink/10 px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>
  ),
  highlight: (children) => <mark className="bg-amber-200/70 px-0.5">{children}</mark>,
  link: (children, attrs) => {
    const href = typeof attrs?.href === "string" ? attrs.href : (attrs?.url as string | undefined);
    if (!href) return <>{children}</>;
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className="underline decoration-ink/30 underline-offset-2 transition-colors hover:decoration-ink"
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {children}
      </a>
    );
  },
};

function applyMarks(node: RichTextNode, children: ReactNode): ReactNode {
  return (node.marks ?? []).reduce<ReactNode>((acc, mark) => {
    const wrapper = MARK_WRAPPERS[mark.type];
    return wrapper ? wrapper(acc, mark.attrs) : acc;
  }, children);
}

function renderNodes(nodes: RichTextNode[] | undefined): ReactNode {
  if (!nodes?.length) return null;
  return nodes.map((node, index) => <Fragment key={index}>{renderNode(node)}</Fragment>);
}

function renderNode(node: RichTextNode): ReactNode {
  switch (node.type) {
    case "text":
      return applyMarks(node, node.text ?? "");

    case "paragraph":
      return <p className="mb-4 last:mb-0">{renderNodes(node.content)}</p>;

    case "heading": {
      const level = Math.min(6, Math.max(1, Number(node.attrs?.level ?? 3)));
      const Tag = `h${level}` as "h1";
      return (
        <Tag className="mt-6 mb-2 font-display text-lg font-semibold tracking-tight first:mt-0">
          {renderNodes(node.content)}
        </Tag>
      );
    }

    case "blockquote":
      return (
        <blockquote className="my-5 border-l-2 border-ink/25 pl-4 font-display text-[1.05em] italic text-ink/80">
          {renderNodes(node.content)}
        </blockquote>
      );

    case "bullet_list":
      return <ul className="mb-4 list-disc space-y-1.5 pl-5 marker:text-ink/40">{renderNodes(node.content)}</ul>;

    case "ordered_list":
      return <ol className="mb-4 list-decimal space-y-1.5 pl-5 marker:text-ink/40">{renderNodes(node.content)}</ol>;

    case "list_item":
      return <li className="[&>p]:mb-0">{renderNodes(node.content)}</li>;

    case "code_block":
      return (
        <pre className="mb-4 overflow-x-auto rounded-md bg-ink/8 p-3 font-mono text-[0.8em] leading-relaxed">
          <code>{renderNodes(node.content)}</code>
        </pre>
      );

    case "horizontal_rule":
      return <hr className="my-6 border-ink/15" />;

    case "hard_break":
      return <br />;

    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : null;
      if (!src) return null;
      return (
        // Rich-text images are author-supplied and arbitrarily sized; plain <img> keeps them simple.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={typeof node.attrs?.alt === "string" ? node.attrs.alt : ""}
          className="my-4 w-full rounded-md"
        />
      );
    }

    default:
      return renderNodes(node.content);
  }
}

/** Splits a plain-text summary on blank lines so string fields still read as prose. */
function renderPlainText(value: string): ReactNode {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0">
        {paragraph}
      </p>
    ));
}

export function RichText({ document }: { document: BookSummary }) {
  if (!document) return null;
  if (typeof document === "string") return <>{renderPlainText(document)}</>;
  return <>{renderNodes(document.content)}</>;
}
