import { useState } from "react";
import { Shield } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSpoof } from "@/hooks/use-spoof";

export const SpoofSettings = () => {
  const { settings, update, reset, defaults } = useSpoof();
  const [title, setTitle] = useState(settings.title);
  const [favicon, setFavicon] = useState(settings.faviconUrl);

  const handleSave = () => {
    update({ title, faviconUrl: favicon });
  };

  const handleReset = () => {
    reset();
    setTitle(defaults.title);
    setFavicon(defaults.faviconUrl);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-secondary text-secondary-foreground border-border hover:border-primary/50"
          title="Tab spoof settings"
        >
          <Shield className="w-3.5 h-3.5" />
          Spoof
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-3" align="end">
        <p className="text-sm font-medium text-foreground">Tab Disguise</p>
        <div className="space-y-1.5">
          <Label htmlFor="spoof-title" className="text-xs">Tab Title</Label>
          <Input
            id="spoof-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Google Classroom"
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="spoof-favicon" className="text-xs">Favicon (URL or domain)</Label>
          <Input
            id="spoof-favicon"
            value={favicon}
            onChange={(e) => setFavicon(e.target.value)}
            placeholder="classroom.google.com"
            className="h-8 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border hover:bg-accent transition-colors"
          >
            Reset
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
