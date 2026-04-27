import studioImage from '@/assets/studio.jpg';

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Our Story</span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-primary mt-4">
            About the Artist
          </h1>
          <div className="section-divider mt-8" />
        </div>
      </section>

      {/* Hero Image */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] rounded-sm overflow-hidden shadow-elegant">
            <img
              src={studioImage}
              alt="Rasayan Studio workspace with painting easel and art supplies"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg prose-stone max-w-none">
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                Saroj Prakash Bandi is a modern and contemporary visual artist based in Maharashtra. 
                With formal training in chemical engineering and an MBA in operations, her intellectual 
                foundation is rooted in systems, structure and analytical precision. This orientation 
                continues to inform her artistic practice. Her transition into visual art is not a 
                departure from science, but a reconfiguration of it. The same rigor that governs 
                physics and mathematics with attention to structure, internal coherence and underlying 
                order finds expression in her visual language as well. Over time, this engagement with 
                logic has evolved into a deeper philosophical inquiry.
              </p>
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                Saroj's work operates at the intersection of modernist discipline and contemporary 
                conceptual exploration. Her paintings are constructed through a deliberate orchestration 
                of forms, particularly geometric structures, which serve as vessels for ideas drawn 
                from physics, mathematics, philosophy and the human condition. These forms often embody 
                tensions between control and chaos, logic and the unknowable, human intention and the 
                autonomy of nature. Recurring themes in her practice include duality, philosophical 
                inquiry and the subtle conflict between human systems and natural order. Her work 
                reflects an acute awareness of humanity's impulse to impose control, while simultaneously 
                acknowledging the limits of that control within a universe that resists complete 
                comprehension.
              </p>
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                Materiality plays a critical role in her process. Bandi adopts a restrained, 
                minimalistic approach favoring limited palettes, often in earthy tones or monochromatic 
                compositions. Her work relies on precision and reduction, allowing form and concept to 
                emerge. Her engagement with geometry is deeply observational. Drawing from patterns 
                inherent in nature, she recontextualizes these forms into a philosophical language that 
                bridges the scientific and the spiritual.
              </p>
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                Working from her studio, Rasayan Studios, Saroj continues to explore the convergence 
                of analytical thought and intuitive insight creating works that are at once structured 
                and searching, disciplined yet open-ended.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
