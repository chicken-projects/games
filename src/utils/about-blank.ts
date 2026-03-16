const DISGUISE_TITLE = "Google";
const DISGUISE_FAVICON = "https://www.google.com/favicon.ico";

export function openInAboutBlank(url: string) {
  const win = window.open("about:blank", "_blank");
  if (!win) return;

  win.document.open();
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${DISGUISE_TITLE}</title>
  <link rel="icon" href="${DISGUISE_FAVICON}">
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
  const origin = window.location.origin;
  const url = window.location.href;

  fetch(url)
    .then((r) => r.text())
    .then((html) => {
      let patched = html
        .replace(/(href|src|action)="\/(?!\/)/g, `$1="${origin}/`)
        .replace(/(href|src|action)='\/(?!\/)/g, `$1='${origin}/`);
      patched = patched.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/">`);
      patched = patched.replace(/<title>[^<]*<\/title>/i, `<title>${DISGUISE_TITLE}</title>`);
      patched = patched.replace(/<head([^>]*)>/i, `<head$1><link rel="icon" href="${DISGUISE_FAVICON}">`);

      const win = window.open("about:blank", "_blank");
      if (!win) return;
      win.document.open();
      win.document.write(patched);
      win.document.close();
    });
}
