import { getSpoofSettings, resolveFaviconUrl } from "@/hooks/use-spoof";

function buildWrapper(url: string, title: string, favicon: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <link rel="icon" href="${favicon}">
  <style>*{margin:0;padding:0}html,body{height:100%;overflow:hidden;background:#000}iframe{width:100vw;height:100vh;border:none;display:block}</style>
</head>
<body>
  <iframe src="${url}" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-popups-to-escape-sandbox"></iframe>
</body>
</html>`;
}

/** Open a game link honoring the spoof + open-behavior settings. */
export function openGame(url: string) {
  const { title, faviconUrl, openBehavior } = getSpoofSettings();
  const favicon = resolveFaviconUrl(faviconUrl);
  const html = buildWrapper(url, title, favicon);

  if (openBehavior === "same-tab") {
    // Replace the current document with the spoofed wrapper
    document.open();
    document.write(html);
    document.close();
    return;
  }

  const win = window.open("about:blank", "_blank");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

// Back-compat alias
export const openInAboutBlank = openGame;

export function openCurrentPageInBlank() {
  const { title, faviconUrl } = getSpoofSettings();
  const favicon = resolveFaviconUrl(faviconUrl);
  const origin = window.location.origin;
  const url = window.location.href;

  fetch(url)
    .then((r) => r.text())
    .then((html) => {
      let patched = html
        .replace(/(href|src|action)="\/(?!\/)/g, `$1="${origin}/`)
        .replace(/(href|src|action)='\/(?!\/)/g, `$1='${origin}/`);
      patched = patched.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/">`);
      patched = patched.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
      patched = patched.replace(/<head([^>]*)>/i, `<head$1><link rel="icon" href="${favicon}">`);

      const win = window.open("about:blank", "_blank");
      if (!win) return;
      win.document.open();
      win.document.write(patched);
      win.document.close();
    });
}
