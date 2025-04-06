
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center px-4 py-12">
          <h1 className="text-4xl font-serif font-bold text-biblenow-gold mb-4">404</h1>
          <p className="text-xl text-biblenow-beige mb-4">Oops! Page not found</p>
          <a href="/" className="auth-link">
            Return to Home
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
