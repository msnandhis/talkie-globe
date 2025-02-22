
import { Button } from "@/components/ui/button";
import { Globe, LogIn } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Globe className="w-8 h-8 text-primary mr-2" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              VidGlobe
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">
              Home
            </a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">
              Pricing
            </a>
            <Button variant="default">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
