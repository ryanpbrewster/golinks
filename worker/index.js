addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  switch (request.method.toUpperCase()) {
    case "GET":
      return path === "/" ? listLinks() : redirectToLink(path, url.origin);
    case "PUT":
      return setLink(path, await request.text());
  }
  return new Response('Not found', { status: 404 });
}

async function listLinks() {
  const list = await golinks.list();
  const keys = list.keys.map(item => `<li>${item.name.substring(1)}</li>`).join('\n');
  const html = `<body><ul>${keys}</ul></body>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}

async function redirectToLink(path, origin) {
  const link = await golinks.get(path);
  return Response.redirect(link ?? origin);
}

async function setLink(path, body) {
  await golinks.put(path, body);
  return new Response(`set link ${path} to ${body}`);
}
