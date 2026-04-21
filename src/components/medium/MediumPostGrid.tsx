/**
 * MediumPostGrid
 *
 * Main display component for Medium articles. Features:
 *  - Featured hero card for the first post (suppressed while searching)
 *  - Responsive 3-column grid for remaining posts
 *  - Live search/filter by title, description, and tags
 *  - Page-based pagination (6 posts per page)
 *  - Loading skeleton, error state with retry, and empty state
 */

import { useState, useMemo } from "react";
import { AlertCircle, RefreshCw, Search, X } from "lucide-react";

import { useMediumPosts } from "@/hooks/useMediumPosts";
import { MediumPostCard } from "./MediumPostCard";
import { MediumPostCardSkeleton, MediumFeaturedSkeleton } from "./MediumPostSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const POSTS_PER_PAGE = 6;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative max-w-sm mx-auto">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search articles..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9 font-sans"
        aria-label="Search articles"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-1 pt-4"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="font-sans"
      >
        Previous
      </Button>

      <div className="flex items-center gap-1 mx-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`w-8 h-8 rounded-sm text-sm font-sans transition-colors ${
              page === currentPage
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="font-sans"
      >
        Next
      </Button>
    </nav>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MediumPostGrid() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useMediumPosts();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter posts by search query (title, description, tags)
  const filteredPosts = useMemo(() => {
    const posts = data?.posts ?? [];
    if (!searchQuery.trim()) return posts;

    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categories.some((c) => c.toLowerCase().includes(q)),
    );
  }, [data?.posts, searchQuery]);

  // Reset to page 1 whenever the search changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // When searching, treat all filtered posts as a flat list (no featured card)
  const isSearching = searchQuery.trim().length > 0;

  const featuredPost = !isSearching ? filteredPosts[0] : undefined;
  const gridPosts = isSearching ? filteredPosts : filteredPosts.slice(1);

  const totalPages = Math.ceil(gridPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = gridPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-16">
        <MediumFeaturedSkeleton />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <MediumPostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive/60" />
        <div>
          <p className="font-serif text-lg text-primary">Unable to load articles</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {error instanceof Error
              ? error.message
              : "Something went wrong. Please try again."}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 font-sans"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Try again
        </Button>
      </div>
    );
  }

  // ── No posts at all ──────────────────────────────────────────────────────────
  if (!data || data.posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground font-sans">
          No articles available at the moment.
        </p>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-12">
      {/* Search bar */}
      <SearchBar value={searchQuery} onChange={handleSearch} />

      {/* No search results */}
      {filteredPosts.length === 0 && (
        <div className="py-16 text-center text-muted-foreground font-sans">
          No articles match{" "}
          <span className="text-primary font-medium">"{searchQuery}"</span>.
        </div>
      )}

      {/* Featured post — only on page 1, no active search */}
      {featuredPost && currentPage === 1 && (
        <section>
          <MediumPostCard post={featuredPost} featured />
        </section>
      )}

      {/* Post grid */}
      {paginatedPosts.length > 0 && (
        <section>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedPosts.map((post, index) => (
              <div
                key={post.link}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <MediumPostCard post={post} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
