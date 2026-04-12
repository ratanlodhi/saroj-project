import studioImage from '@/assets/studio.jpg';

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Our Story</span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-primary mt-4">
            About the Studio
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
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary mb-6">
                About the Artist
              </h2>
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

            {/* Quote */}
            <blockquote className="my-12 p-8 bg-secondary/50 rounded-sm border-l-4 border-accent">
              <p className="font-serif text-xl md:text-2xl text-primary italic leading-relaxed">
                "Art is not what you see, but what you make others see."
              </p>
              <cite className="block mt-4 text-muted-foreground text-sm font-sans not-italic">
                — Edgar Degas
              </cite>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary">
              Our Values
            </h2>
            <div className="section-divider mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: 'Authenticity',
                description: 'Every piece is created with genuine emotion and honest expression, never following trends for their own sake.',
              },
              {
                title: 'Craftsmanship',
                description: 'We honor traditional techniques while embracing innovation, ensuring each work meets the highest standards.',
              },
              {
                title: 'Connection',
                description: 'Art should move people. We create work that resonates emotionally and creates lasting impressions.',
              },
            ].map((value, index) => (
              <div
                key={value.title}
                className="text-center p-6 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="font-serif text-xl font-medium text-primary mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm font-sans leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
