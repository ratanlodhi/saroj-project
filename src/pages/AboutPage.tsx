import studioImage from '@/assets/studio.jpg';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
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
          <div className="max-w-5xl mx-auto aspect-[21/9] rounded-sm overflow-hidden shadow-elegant">
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
                A Sanctuary for Artistic Expression
              </h2>
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                Rasayan Studio was founded with a singular vision: to create art that speaks 
                to the soul. Nestled in a sunlit space where inspiration flows freely, the studio 
                has become a place where classical techniques meet contemporary expression.
              </p>
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                The name "Rasayan" draws from the ancient concept of transformation and essence—the 
                alchemical process of turning raw materials into something precious. This philosophy 
                permeates every aspect of our work, from the careful preparation of canvases to the 
                final brushstroke that brings a painting to life.
              </p>

              <div className="section-divider my-12" />

              <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary mb-6">
                Artistic Philosophy
              </h2>
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                We believe that art is a dialogue—between artist and canvas, between color and form, 
                between the work and its viewer. Each painting is an invitation to pause, to feel, 
                and to discover something new within oneself.
              </p>
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                Our work spans multiple disciplines, from abstract explorations that delve into 
                pure emotion and color theory, to detailed portraits that capture the subtle 
                complexities of human character. What unites these diverse approaches is a 
                commitment to authenticity and emotional truth.
              </p>

              <div className="section-divider my-12" />

              <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary mb-6">
                The Journey
              </h2>
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                The journey of Rasayan Studio began with years of classical training, studying 
                the old masters and understanding the foundations of painting technique. But true 
                artistic growth came from breaking free of convention and finding a unique voice.
              </p>
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                Today, the studio continues to evolve, embracing new subjects and techniques while 
                remaining grounded in the timeless principles of good art: careful observation, 
                skilled execution, and honest expression.
              </p>
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                Whether you're a collector seeking a meaningful addition to your space, or simply 
                an art lover who appreciates the beauty of handcrafted paintings, we welcome you 
                to explore our world. Every painting has a story waiting to be discovered.
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
