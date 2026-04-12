import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '@/data/blogs';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogDetailPage() {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-primary mb-4">Post Not Found</h1>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Link>

            <time className="text-sm text-accent font-sans">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-primary mt-3">
              {post.title}
            </h1>
            <p className="text-muted-foreground font-sans mt-4 text-lg">
              {post.excerpt}
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              By <span className="text-primary">{post.author}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-[16/9] rounded-sm overflow-hidden shadow-elegant">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            <div className="prose prose-lg prose-stone max-w-none">
              {post.content.split('\n\n').map((paragraph, index) => (
                <p
                  key={index}
                  className="text-muted-foreground font-sans leading-relaxed mb-6"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="section-divider mt-12 mb-12" />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm">
                Thank you for reading.
              </p>
              <Button variant="outline" asChild>
                <Link to="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" /> More Articles
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
