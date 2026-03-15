import { ChevronUp, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export const ScrollButtons = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-20 flex flex-col gap-1.5">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="p-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <button
        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
        className="p-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        aria-label="Scroll to bottom"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
};
