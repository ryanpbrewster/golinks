addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const {namespace, name} = parsePath(path);
  if (!namespace) {
    return new Response('Invalid namespace', { status: 400 });
  }
  switch (request.method.toUpperCase()) {
    case "GET":
      return name ? redirectToLink(namespace, name, url.origin + '/' + namespace) : listLinks(namespace);
    case "PUT":
      return setLink(namespace, name, await request.text());
  }
  return new Response('Not found', { status: 404 });
}

async function listLinks(namespace) {
  if (!namespace) throw Error("invalid namespace");
  const list = await golinks.list({ prefix: encodeKey(namespace, "") });
  const keys = list.keys.map(item => {
    const name = decodeKey(namespace, item.name);
    return `<li><a href="https://go/${name}">${name}</a></li>`;
  });
  const html = [
    "<body>",
    "<ul>",
    ...keys,
    "</ul>",
    "</body>"
  ].join('\n');
  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}

async function redirectToLink(namespace, name, origin) {
  const link = await golinks.get(encodeKey(namespace, name));
  return Response.redirect(link ?? origin);
}

async function setLink(namespace, name, body) {
  await golinks.put(encodeKey(namespace, name), body);
  return new Response(`set link ${namespace}/${name} to ${body}`);
}

function parsePath(path) {
  const parsed = { namespace: null, name: null };
  if (!path.startsWith('/')) return parsed;
  const segments = path.substring(1).split('/');
  parsed.namespace = segments[0];
  if (segments.length === 2) {
    parsed.name = segments[1];
  }
  return parsed;
}

function decodeKey(namespace, key) {
  return key.substring(`links/${namespace}/`.length);
}
function encodeKey(namespace, path) {
  return `links/${namespace}/${path}`;
}
