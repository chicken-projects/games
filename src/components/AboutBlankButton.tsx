import { ExternalLink } from "lucide-react";
import { openCurrentPageInBlank } from "@/utils/about-blank";

export const AboutBlankButton = () => {
  return (
    <button
      onClick={() => openCurrentPageInBlank()}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-secondary text-secondary-foreground border-border hover:border-primary/50"
      title="Open in about:blank tab"
    >
      <ExternalLink className="w-3.5 h-3.5" />
      Disguise
    </button>
  );
};
