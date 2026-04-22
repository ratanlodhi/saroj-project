import { Link } from 'react-router-dom';
import { blogPosts as localBlogPosts } from '@/data/blogs';
import { useBlogFeed, type BlogPost } from '@/hooks/useBlogFeed';
import { BLOG_CONFIG } from '@/data/blogConfig';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/** Remote RSS posts use the post URL as their ID; local posts use numeric strings. */
const isExternal = (post: BlogPost) => post.id.startsWith('http');

export default function BlogPage() {
  const { posts: remotePosts, loading, error } = useBlogFeed(BLOG_CONFIG.feedUrl);
  
  // Use remote posts if available, otherwise fallback to local posts
  const blogPosts = (BLOG_CONFIG.enableBlogspotFeed && remotePosts.length > 0) || !BLOG_CONFIG.useFallbackData
    ? remotePosts
    : localBlogPosts;

  const showNetworkError = error && BLOG_CONFIG.enableBlogspotFeed && BLOG_CONFIG.useFallbackData;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      {/* <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Thoughts & Stories</span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-primary mt-4">
            Blog
          </h1>
          <p className="text-muted-foreground font-sans mt-4 max-w-xl mx-auto">
            Insights into the artistic process, inspirations, and reflections from the studio.
          </p>
          <div className="section-divider mt-8" />
        </div>
      </section> */}

      {/* Network Error Message */}
      {showNetworkError && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <Alert variant="default" className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Unable to load latest blog posts. Displaying archived articles instead.
              </AlertDescription>
            </Alert>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && blogPosts.length === 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-muted-foreground">Loading blog posts...</span>
            </div>
          </div>
        </section>
      )}

      {/* No Posts State */}
      {!loading && blogPosts.length === 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No blog posts available at the moment.</p>
          </div>
        </section>
      )}

      {/* Featured Post */}
      {blogPosts.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            {isExternal(blogPosts[0]) ? (
              <a
                href={blogPosts[0].id}
                target="_blank"
                rel="noopener noreferrer"
                className="group block max-w-5xl mx-auto"
              >
              <article className="grid md:grid-cols-2 gap-8 items-center bg-card rounded-sm overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300">
                <div className="aspect-[4/3] md:aspect-auto md:h-full overflow-hidden">
                  <img
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <span className="text-xs tracking-widest uppercase text-accent font-sans">Featured</span>
                  <time className="block text-sm text-muted-foreground mt-2">
                    {new Date(blogPosts[0].date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary mt-3 group-hover:text-accent transition-colors">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="mt-6 flex items-center text-accent group-hover:text-primary transition-colors">
                    <span className="text-sm font-sans">Read Article</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
              </a>
            ) : (
              <Link
                to={`/blog/${blogPosts[0].id}`}
                className="group block max-w-5xl mx-auto"
              >
              <article className="grid md:grid-cols-2 gap-8 items-center bg-card rounded-sm overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300">
                <div className="aspect-[4/3] md:aspect-auto md:h-full overflow-hidden">
                  <img
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <span className="text-xs tracking-widest uppercase text-accent font-sans">Featured</span>
                  <time className="block text-sm text-muted-foreground mt-2">
                    {new Date(blogPosts[0].date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary mt-3 group-hover:text-accent transition-colors">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="mt-6 flex items-center text-accent group-hover:text-primary transition-colors">
                    <span className="text-sm font-sans">Read Article</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Blog Grid */}
      {blogPosts.length > 1 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(1).map((post, index) => {
                const articleContent = (
                  <article className="bg-card rounded-sm overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <time className="text-xs text-muted-foreground font-sans">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      <h3 className="font-serif text-xl font-medium text-primary mt-2 group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-2 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center text-accent group-hover:text-primary transition-colors">
                        <span className="text-sm font-sans">Read More</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                );
                return isExternal(post) ? (
                  <a
                    key={post.id}
                    href={post.id}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group animate-fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {articleContent}
                  </a>
                ) : (
                  <Link
                    key={post.id}
                    to={`/blog/${post.id}`}
                    className="group animate-fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {articleContent}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
