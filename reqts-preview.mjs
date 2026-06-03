#!/usr/bin/env node
// Minimal LAN-accessible markdown previewer for reqts/.
// Binds 0.0.0.0 so phones/tablets on the same wifi can view.
// Renders client-side with marked + github-markdown-css (from CDN).
// Run: node reqts-preview.mjs   (then open the Network URL on your phone)

import http from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'reqts');
const PORT = Number(process.env.PORT) || 3000;

function lanIPs() {
  const out = [];
  for (const ifaces of Object.values(networkInterfaces())) {
    for (const i of ifaces ?? []) {
      if (i.family === 'IPv4' && !i.internal) out.push(i.address);
    }
  }
  return out;
}

const shell = (title, body) => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown.min.css">
<style>
  :root { color-scheme: light dark; }
  body { margin:0; background:#fff; }
  @media (prefers-color-scheme: dark){ body{ background:#0d1117; } }
  .wrap { max-width: 760px; margin: 0 auto; padding: 24px 16px 96px; }
  .topbar { position:sticky; top:0; padding:10px 16px; background:rgba(127,127,127,.12);
            backdrop-filter:blur(8px); font:14px -apple-system,system-ui,sans-serif; }
  .topbar a { text-decoration:none; margin-right:14px; }
  .markdown-body { box-sizing:border-box; }
</style>
</head><body>
<div class="topbar"><a href="/">&larr; index</a></div>
<div class="wrap"><article class="markdown-body">${body}</article></div>
</body></html>`;

const server = http.createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);

    // Index: list the markdown files
    if (url === '/' || url === '/index.html') {
      const files = (await readdir(ROOT)).filter(f => f.endsWith('.md')).sort();
      const items = files.map(f => `<li><a href="/${f}">${f}</a></li>`).join('\n');
      const body = `<h1>reqts/</h1><ul>${items}</ul>`;
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(shell('reqts index', body));
      return;
    }

    // Markdown file: serve a page that fetches the raw .md and renders it
    if (url.endsWith('.md')) {
      const safe = path.normalize(url).replace(/^(\.\.[/\\])+/, '');
      const file = path.join(ROOT, safe);
      if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
      const raw = await readFile(file, 'utf8');
      const json = JSON.stringify(raw);
      const body = `<div id="md">Rendering…</div>
<script src="https://cdn.jsdelivr.net/npm/marked@12/marked.min.js"></script>
<script>
  marked.setOptions({ gfm:true, breaks:false });
  document.getElementById('md').innerHTML = marked.parse(${json});
</script>`;
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(shell(path.basename(file), body));
      return;
    }

    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  } catch (err) {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('error: ' + err.message);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Local:    http://localhost:${PORT}`);
  for (const ip of lanIPs()) console.log(`  Network:  http://${ip}:${PORT}   <- open this on your phone`);
  console.log('');
});
