import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
// Local-only configuration is never read by the production build.
try { process.loadEnvFile('.env.local'); } catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const localAnalytics = {
  enabled: process.env.POSTHOG_LOCAL_ENABLED === 'true',
  token: process.env.POSTHOG_PUBLIC_TOKEN || '',
  apiHost: 'https://eu.i.posthog.com',
};
if (localAnalytics.enabled && !localAnalytics.token.startsWith('phc_')) {
  throw new Error('Local analytics requires a public PostHog project token.');
}
const root = resolve('src');
const args = ['-i', 'src/input.css', '-o', 'src/output.css'];
execFileSync('node_modules/.bin/tailwindcss', args, { stdio: 'inherit' });
const css = spawn('node_modules/.bin/tailwindcss', [...args, '--watch'], { stdio: 'inherit' });
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/js/analytics-config.js') {
      res.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' })
        .end(`export const analyticsConfig = Object.freeze(${JSON.stringify(localAnalytics)});`);
      return;
    }
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
  } catch { res.writeHead(404).end('Not found'); }
});
server.listen(4173, '127.0.0.1', () => console.log('Local preview: http://127.0.0.1:4173'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { css.kill(); server.close(); });
