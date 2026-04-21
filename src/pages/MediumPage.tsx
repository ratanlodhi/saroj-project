import { ExternalLink } from "lucide-react";
import { MediumPostGrid } from "@/components/medium/MediumPostGrid";

const MEDIUM_PROFILE_URL = "https://sarojprakashbandi.medium.com";

export default function MediumPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">
            Writing &amp; Ideas
          </span>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-primary mt-4">
            Medium Articles
          </h1>

          <p className="text-muted-foreground font-sans mt-4 max-w-xl mx-auto leading-relaxed">
            Thoughts, insights, and stories published on Medium.
          </p>

          {/* Link to full Medium profile */}
          <a
            href={MEDIUM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-sans text-accent hover:text-primary transition-colors"
          >
            View profile on Medium
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <div className="section-divider mt-8" />
        </div>
      </section>

      {/* ── Articles grid ───────────────────────────────────────────────────── */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <MediumPostGrid />
        </div>
      </section>
    </div>
  );
}
