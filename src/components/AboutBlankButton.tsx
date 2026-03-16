import { ExternalLink } from "lucide-react";

export const AboutBlankButton = () => {
  const openInBlank = () => {
    const origin = window.location.origin;
    const url = window.location.href;

    fetch(url)
      .then((r) => r.text())
      .then((html) => {
        // Rewrite relative paths to absolute so assets load correctly
        let patched = html
          .replace(/(href|src|action)="\/(?!\/)/g, `$1="${origin}/`)
          .replace(/(href|src|action)='\/(?!\/)/g, `$1='${origin}/`);

        // Inject a <base> tag so any remaining relative URLs resolve correctly
        patched = patched.replace(
          /<head([^>]*)>/i,
          `<head$1><base href="${origin}/">`
        );

        // Override the page title and favicon for disguise
        patched = patched.replace(/<title>[^<]*<\/title>/i, "<title>Google</title>");
        patched = patched.replace(
          /<head([^>]*)>/i,
          `<head$1><link rel="icon" href="https://www.google.com/favicon.ico">`
        );

        const win = window.open("about:blank", "_blank");
        if (!win) return;
        win.document.open();
        win.document.write(patched);
        win.document.close();
      });
  };

  return (
    <button
      onClick={openInBlank}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-secondary text-secondary-foreground border-border hover:border-primary/50"
      title="Open in about:blank tab"
    >
      <ExternalLink className="w-3.5 h-3.5" />
      Disguise
    </button>
  );
};
