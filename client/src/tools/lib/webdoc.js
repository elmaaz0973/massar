// يبني مستند HTML للمعاينة داخل iframe معزول. سياسة CSP تمنع أي اتصال بالشبكة.
const ERROR_HOOK = `window.addEventListener('error',function(e){var p=document.createElement('pre');p.style.cssText='color:#c00;direction:ltr;text-align:left;white-space:pre-wrap';p.textContent='JavaScript error: '+e.message;document.body.appendChild(p);});`;

export function buildSrcDoc({ html = '', css = '', js = '' }) {
  const safeCss = String(css).replace(/<\/style/gi, '<\\/style');
  const safeJs = String(js).replace(/<\/script/gi, '<\\/script');
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">` +
    `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:">` +
    `<style>body{font-family:system-ui,sans-serif;line-height:1.7;padding:12px}${safeCss}</style></head>` +
    `<body>${html}<script>${ERROR_HOOK}</script><script>${safeJs}</script></body></html>`;
}
