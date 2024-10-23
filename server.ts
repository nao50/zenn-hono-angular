import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';


const posts = new Hono()
  .post(
    '/posts',
    zValidator(
      'form',
      z.object({
        title: z.string(),
        body: z.string(),
      })
    ),
    (c) => {
      return c.json(
        {
          ok: true,
          message: 'Created!',
        },
        201
      )
    }
  )

export type PostsType = typeof posts

export function app(): Hono {
  const app = new Hono()
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  app.get('/hello', (c) => c.json({
    hello: 'world!',
  }))

  app.route('/', posts)

  app.get('/', (c) => {
    const url = c.req.url;
    return commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${url}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: '' }],
      })
      .then((html) => c.html(html))
      .catch((err) => {
        console.error('Error:', err);
      });
  })

  app.use('/*', serveStatic({
    root: './dist/zenn-hono-angular/browser',
    index: 'index.html',
    onNotFound: (path, c) => {
      console.log(`${path} is not found, request to ${c.req.path}`)
    },
  }))

  return app;
}

function run(): void {
  const server = app();
  serve({
    fetch: server.fetch,
    port: +process.env['PORT']! || 4000,
  })
}

run();