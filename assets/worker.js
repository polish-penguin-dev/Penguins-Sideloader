addEventListener("fetch", event => {
  event.respondWith(handle(event.request));
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function handle(request) {
  const url = new URL(request.url);

  if (url.pathname !== "/sign") {
    return new Response("Not Found!", { status: 404 });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed!", { status: 405, headers: CORS });
  }

  const inbound = request.headers;
  const forwardh = new Headers();
  const ctype = inbound.get("content-type");
  if (ctype) forwardh.set("Content-Type", ctype);

  forwardh.set("User-Agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "+
    "AppleWebKit/537.36 (KHTML, like Gecko) "+
    "Chrome/114.0.0.0 Safari/537.36"
  );

  const proxied = new Request("https://private.ipasign.pro/sign", {
    method: "POST",
    headers: forwardh,
    body: request.body,
    duplex: "half"
  });

  const response = await fetch(proxied);

  const rheaders = new Headers(response.headers);
  rheaders.set("Access-Control-Allow-Origin", "*");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: rheaders
  });
};
