import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-6xl md:text-8xl font-serif text-accent/30">404</span>
        <h1 className="font-serif text-2xl md:text-3xl font-medium text-primary mt-4">
          Page Not Found
        </h1>
        <p className="text-muted-foreground font-sans mt-4">
          The page you're looking for seems to have wandered off the canvas. 
          Let's get you back to the gallery.
        </p>
        <Button variant="default" className="mt-8" asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
