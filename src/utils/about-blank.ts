import { getSpoofSettings } from "@/hooks/use-spoof";

export function openInAboutBlank(url: string) {
  const { title, faviconUrl } = getSpoofSettings();
  const win = window.open("about:blank", "_blank");
  if (!win) return;

  win.document.open();
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <link rel="icon" href="${faviconUrl}">
  <style>* { margin:0; padding:0; } html,body { height:100%; overflow:hidden; } iframe { width:100vw; height:100vh; border:none; }</style>
</head>
<body>
  <iframe src="${url}" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-popups-to-escape-sandbox"></iframe>
</body>
</html>
  `);
  win.document.close();
}

export function openCurrentPageInBlank() {
  const { title, faviconUrl } = getSpoofSettings();
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
      patched = patched.replace(/<head([^>]*)>/i, `<head$1><link rel="icon" href="${faviconUrl}">`);

      // Inject script to intercept game clicks so they also open in about:blank
      const interceptScript = `
<script>
  window.__SPOOF_TITLE__ = ${JSON.stringify(title)};
  window.__SPOOF_FAVICON__ = ${JSON.stringify(faviconUrl)};
  window.__openInAboutBlank = function(url) {
    var w = window.open("about:blank", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(
      '<!DOCTYPE html><html><head><title>' + window.__SPOOF_TITLE__ + '</title>' +
      '<link rel="icon" href="' + window.__SPOOF_FAVICON__ + '">' +
      '<style>*{margin:0;padding:0}html,body{height:100%;overflow:hidden}iframe{width:100vw;height:100vh;border:none}</style>' +
      '</head><body><iframe src="' + url + '" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-popups-to-escape-sandbox"></iframe></body></html>'
    );
    w.document.close();
  };
</script>`;
      patched = patched.replace(/<\/body>/i, interceptScript + "</body>");

      const win = window.open("about:blank", "_blank");
      if (!win) return;
      win.document.open();
      win.document.write(patched);
      win.document.close();
    });
}
