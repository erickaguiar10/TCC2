import { useState } from "react";
import { Button } from "../components/ui/button";
import { ConnectWalletButton } from "./ConnectWalletButton";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Main</span>
              <span className="text-xl font-bold text-accent">Tickets</span>
            </a>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-sm font-medium transition-colors hover:text-accent">
              Início
            </a>
            <a href="/eventos" className="text-sm font-medium transition-colors hover:text-accent">
              Eventos
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <ConnectWalletButton />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-foreground hover:text-accent focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <a
                href="/"
                className="text-base font-medium transition-colors hover:text-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </a>
              <a
                href="/eventos"
                className="text-base font-medium transition-colors hover:text-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                Eventos
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;