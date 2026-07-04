import { getSpoofSettings, resolveFaviconUrl } from "@/hooks/use-spoof";

function miniHeaderCss() {
  return `
  .mini-header{position:fixed;top:0;left:0;right:0;height:52px;background:rgba(20,22,28,0.85);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:10px;padding:0 14px;z-index:2147483647;font-family:Inter,system-ui,sans-serif;color:#e6e8ee}
  .mini-header .back{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:inherit;padding:6px 10px;border-radius:999px;cursor:pointer;font-size:12px;font-weight:500;max-width:34px;overflow:hidden;transition:max-width .35s cubic-bezier(0.22,1,0.36,1),background .2s}
  .mini-header .back:hover{max-width:120px;background:rgba(255,255,255,0.12)}
  .mini-header .back svg{width:14px;height:14px;flex-shrink:0}
  .mini-header .back .label{white-space:nowrap}
  .mini-header .title{font-size:15px;font-weight:700;letter-spacing:-0.01em}
  .mini-header .spacer{flex:1}
  .mini-header .search-icon{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:inherit;padding:7px;border-radius:999px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
  .mini-header .search-icon:hover{background:rgba(255,255,255,0.12)}
  .mini-header .search-icon svg{width:14px;height:14px}
  .frame-holder{position:fixed;inset:52px 0 0 0;background:#000}
  .frame-holder iframe{width:100%;height:100%;border:none;display:block}
  html,body{margin:0;padding:0;height:100%;background:#000;overflow:hidden}
  `;
}

function buildSameTabWrapper(url: string, title: string, favicon: string, returnHref: string) {
  return `<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<link rel="icon" href="${favicon}">
<style>${miniHeaderCss()}</style>
</head>
<body>
<div class="mini-header">
  <button class="back" onclick="window.location.href='${returnHref}'" title="Back to library">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    <span class="label">Back</span>
  </button>
  <span class="title">Games</span>
  <div class="spacer"></div>
  <button class="search-icon" onclick="window.location.href='${returnHref}'" title="Search library">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
  </button>
</div>
<div class="frame-holder"><iframe src="${url}" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-popups-to-escape-sandbox"></iframe></div>
</body>
</html>`;
}

function buildBlankWrapper(url: string, title: string, favicon: string) {
  return `<!DOCTYPE html>
<html><head><title>${title}</title><link rel="icon" href="${favicon}">
<style>*{margin:0;padding:0}html,body{height:100%;overflow:hidden;background:#000}iframe{width:100vw;height:100vh;border:none;display:block}</style>
</head><body>
<iframe src="${url}" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-popups-to-escape-sandbox"></iframe>
</body></html>`;
}

/** Open a game link honoring the spoof + open-behavior settings.
 *  Returns true if the caller should manage same-tab display via React state
 *  (i.e. no navigation happened here).
 */
export function openGame(url: string): boolean {
  const { title, faviconUrl, openBehavior } = getSpoofSettings();
  const favicon = resolveFaviconUrl(faviconUrl);

  if (openBehavior === "same-tab") {
    // Handled in-app now — caller shows the iframe overlay.
    return true;
  }

  const html = buildBlankWrapper(url, title, favicon);
  const win = window.open("about:blank", "_blank");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return false;
}

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
