import studioImage from '@/assets/studio.jpg';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ArtistEvent = {
  name: string;
  date: string;
  timings: string;
  venue: string;
  location: string;
};

/** Edit these lists to update what appears on About the Artist. */
const upcomingEvents: ArtistEvent[] = [
  {
    name: 'Spring Open Studio',
    date: 'Saturday, 14 March 2026',
    timings: '11:00 AM – 5:00 PM',
    venue: 'Rasayan Studio',
    location: 'Maharashtra, India',
  },
  {
    name: 'Contemporary Geometry — Artist talk',
    date: 'Thursday, 2 April 2026',
    timings: '6:30 PM – 8:00 PM',
    venue: 'City Arts Forum',
    location: 'Mumbai, Maharashtra',
  },
];

const pastEvents: ArtistEvent[] = [
  {
    name: 'Group exhibition: Forms in Nature',
    date: '12 October 2025',
    timings: '10:00 AM – 7:00 PM',
    venue: 'Regional Gallery Hall',
    location: 'Pune, Maharashtra',
  },
  {
    name: 'Solo preview evening',
    date: '3 May 2025',
    timings: '5:00 PM – 9:00 PM',
    venue: 'Independent art space',
    location: 'Nashik, Maharashtra',
  },
  {
    name: 'Winter art fair booth',
    date: '18–20 January 2025',
    timings: '11:00 AM – 8:00 PM (daily)',
    venue: 'Convention Centre — Hall B',
    location: 'Mumbai, Maharashtra',
  },
];

function EventsTable({ title, events }: { title: string; events: ArtistEvent[] }) {
  return (
    <div className="mb-14 last:mb-0">
      <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary mb-4 text-center md:text-left">
        {title}
      </h2>
      <div className="rounded-sm border border-border bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[8rem] text-primary">Event name</TableHead>
              <TableHead className="min-w-[7rem] text-primary">Date</TableHead>
              <TableHead className="min-w-[7rem] text-primary">Timings</TableHead>
              <TableHead className="min-w-[7rem] text-primary">Venue</TableHead>
              <TableHead className="min-w-[7rem] text-primary">Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground font-sans py-8">
                  No events listed yet.
                </TableCell>
              </TableRow>
            ) : (
              events.map((ev) => (
                <TableRow key={`${ev.name}-${ev.date}`}>
                  <TableCell className="font-medium text-foreground font-sans">{ev.name}</TableCell>
                  <TableCell className="text-muted-foreground font-sans whitespace-nowrap">{ev.date}</TableCell>
                  <TableCell className="text-muted-foreground font-sans">{ev.timings}</TableCell>
                  <TableCell className="text-muted-foreground font-sans">{ev.venue}</TableCell>
                  <TableCell className="text-muted-foreground font-sans">{ev.location}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

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

      {/* Events */}
      <section className="py-12 md:py-16 border-t border-border/60 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans block text-center mb-3">
              Appearances
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-primary text-center mb-10 md:mb-12">
              Exhibitions &amp; events
            </h2>
            <EventsTable title="Upcoming events" events={upcomingEvents} />
            <EventsTable title="Past events" events={pastEvents} />
          </div>
        </div>
      </section>
    </div>
  );
}
