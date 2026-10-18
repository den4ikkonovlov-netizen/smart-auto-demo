import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const port = Number(process.env.PORT ?? 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer from 1 to 65535.');
}

const contentTypes = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
});
const securityHeaders = Object.freeze({
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src https://widgets.2gis.com",
  'Cache-Control': 'no-store'
});

function respond(res, status, message) {
  res.writeHead(status, { ...securityHeaders, 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    respond(res, 405, 'Method not allowed');
    return;
  }

  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    const segments = pathname.split('/').filter(Boolean);
    if (pathname.includes('\\') || pathname.includes('\0') || segments.some(segment => segment.startsWith('.'))) {
      respond(res, 400, 'Invalid path');
      return;
    }

    const relative = segments.length ? path.join(...segments) : 'index.html';
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root + path.sep)) {
      respond(res, 403, 'Forbidden');
      return;
    }

    const type = contentTypes[path.extname(filename)];
    if (!type || !(await stat(filename)).isFile()) {
      respond(res, 404, 'Not found');
      return;
    }
    const body = await readFile(filename);
    res.writeHead(200, { ...securityHeaders, 'Content-Type': type, 'Content-Length': body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    respond(res, 404, 'Not found');
  }
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Порт ${port} уже занят. Закройте другой сервер или задайте PORT.`);
    process.exitCode = 1;
    return;
  }
  throw error;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Smart Auto: http://127.0.0.1:${port}/`);
  console.log('Для остановки нажмите Ctrl+C.');
});
