import { ExternalLink } from "lucide-react";

export const AboutBlankButton = () => {
  const openInBlank = () => {
    const url = window.location.href;
    const win = window.open("about:blank", "_blank");
    if (!win) return;

    win.document.open();
    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Google</title>
  <link rel="icon" href="https://www.google.com/favicon.ico">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; overflow: hidden; }
    iframe { width: 100vw; height: 100vh; border: none; }
  </style>
</head>
<body>
  <iframe src="${url}" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-popups-to-escape-sandbox"></iframe>
</body>
</html>
    `);
    win.document.close();
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
