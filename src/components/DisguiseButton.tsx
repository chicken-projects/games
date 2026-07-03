import { EyeOff } from "lucide-react";
import { openCurrentPageInBlank } from "@/utils/about-blank";

export const DisguiseButton = () => (
  <button
    onClick={() => openCurrentPageInBlank()}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-secondary text-secondary-foreground border-border hover:border-primary/50 hover:scale-105 transition-all"
    title="Cloak in about:blank"
  >
    <EyeOff className="w-3.5 h-3.5" />
    Disguise
  </button>
);
