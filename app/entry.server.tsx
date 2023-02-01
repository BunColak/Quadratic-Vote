// entry.server.tsx

import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from '@remix-run/react'
import type { EntryContext } from '@remix-run/node' // Depends on the runtime you choose

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve) => {
    const { pipe } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onShellReady() {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(body as any, {
              status: responseStatusCode,
              headers: responseHeaders,
            })
          );
          pipe(body);
        },
      }
    );
  })
}