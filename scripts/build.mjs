import { cp, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
await mkdir('dist', { recursive: true });
for (const name of ['index.html', 'assets', 'js']) {
  await cp(`src/${name}`, `dist/${name}`, { recursive: true });
}
execFileSync('node_modules/.bin/tailwindcss', ['-i', 'src/input.css', '-o', 'dist/output.css', '--minify'], { stdio: 'inherit' });
