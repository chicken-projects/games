import { ChevronUp, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export const ScrollButtons = () => {
  const [showUp, setShowUp] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowUp(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-20 flex flex-col gap-1.5 items-end">
      {showUp && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="p-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-500"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
      <div className="group flex items-center gap-0">
        <div className="max-w-0 group-hover:max-w-[300px] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-0 group-hover:opacity-100">
          <span className="whitespace-nowrap text-[11px] tracking-[0.15em] uppercase font-medium px-4 py-2 rounded-l-full bg-secondary/60 backdrop-blur-md border border-r-0 border-border/50 block shimmer-text">
            Scroll down for newer games
          </span>
        </div>
        <button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
          className="p-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-500 shrink-0"
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
