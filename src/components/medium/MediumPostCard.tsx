import { Calendar, ExternalLink, Tag } from "lucide-react";
import { type MediumPost } from "@/hooks/useMediumPosts";

interface MediumPostCardProps {
  post: MediumPost;
  /** When true, renders the larger featured layout. */
  featured?: boolean;
}

const FALLBACK_IMAGE = "/placeholder.svg";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Inline thumbnail with a graceful fallback on load error. */
function PostImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src || FALLBACK_IMAGE}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
      }}
    />
  );
}

// ─── Featured card (hero layout) ─────────────────────────────────────────────

function FeaturedCard({ post }: { post: MediumPost }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block max-w-5xl mx-auto"
    >
      <article className="grid md:grid-cols-2 gap-0 items-center bg-card rounded-sm overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300">
        {/* Thumbnail */}
        <div className="aspect-[4/3] md:aspect-auto md:h-full overflow-hidden bg-muted">
          <PostImage
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex flex-col gap-3">
          <span className="text-xs tracking-widest uppercase text-accent font-sans">
            Featured on Medium
          </span>

          <time className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formatDate(post.pubDate)}
          </time>

          <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary group-hover:text-accent transition-colors leading-snug">
            {post.title}
          </h2>

          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {post.description}
          </p>

          {/* Tags */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {post.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 text-[10px] tracking-wider uppercase bg-secondary text-secondary-foreground px-2 py-0.5 rounded-sm font-sans"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {cat}
                </span>
              ))}
            </div>
          )}

          <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-sans text-accent group-hover:text-primary transition-colors">
            Read on Medium
            <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </article>
    </a>
  );
}

// ─── Standard card (grid layout) ─────────────────────────────────────────────

function StandardCard({ post }: { post: MediumPost }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group h-full"
    >
      <article className="bg-card rounded-sm overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="aspect-[16/10] overflow-hidden bg-muted shrink-0">
          <PostImage
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col gap-2">
          {/* Category tags */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] tracking-wider uppercase text-accent font-sans bg-accent/10 dark:bg-accent/20 px-2 py-0.5 rounded-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          <time className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans">
            <Calendar className="h-3 w-3 shrink-0" />
            {formatDate(post.pubDate)}
          </time>

          <h3 className="font-serif text-lg font-medium text-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
            {post.title}
          </h3>

          <p className="text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-3">
            {post.description}
          </p>

          <div className="mt-auto pt-3 inline-flex items-center gap-1.5 text-sm font-sans text-accent group-hover:text-primary transition-colors">
            Read More
            <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </article>
    </a>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function MediumPostCard({ post, featured = false }: MediumPostCardProps) {
  return featured ? <FeaturedCard post={post} /> : <StandardCard post={post} />;
}

