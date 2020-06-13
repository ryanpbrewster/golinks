addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const parsed = parsePath(url);
  if (!parsed) {
    return new Response('Invalid namespace', { status: 400 });
  }
  const { namespace, key } = parsed;
  switch (request.method.toUpperCase()) {
    case 'OPTIONS':
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*',
        },
      });
    case 'GET':
      if (key) {
        return redirectToLink(namespace, key, url.origin + '/' + namespace);
      }
      const target = request.headers.get('x-golinks-target');
      if (target) {
        return lookupByLink(namespace, target);
      }
      return keyOverview(namespace);
    case 'PUT':
      return setLink(namespace, key, await request.text());
  }
  return new Response('Not found', { status: 404 });
}

async function redirectToLink(namespace, key, origin) {
  const link = await golinks.get(encodeKey(namespace, key));
  return Response.redirect(link ?? origin);
}

async function setLink(namespace, key, link) {
  const cur = await golinks.get(encodeKey(namespace, key));
  if (cur) {
    return new Response(`${key} is already set to ${cur}`, { status: 400 });
  }
  await Promise.all([
    golinks.put(encodeKey(namespace, key), link),
    golinks.put(encodeLink(namespace, link, key), true),
  ]);
  return new Response(`set link ${namespace}/${key} to ${link}`);
}

async function lookupByLink(namespace, link) {
  if (!namespace) throw Error('invalid namespace');
  const list = await golinks.list({ prefix: encodeLink(namespace, link, '') });
  const keys = list.keys.map((item) => decodeLink(namespace, link, item.name));
  return new Response(JSON.stringify(keys), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function keyOverview(namespace) {
  if (!namespace) throw Error('invalid namespace');
  const list = await golinks.list({ prefix: encodeKey(namespace, '') });
  const keys = list.keys.map((item) => {
    const name = decodeKey(namespace, item.name);
    return `<li><a href="https://go/${name}">${name}</a></li>`;
  });
  const html = ['<body>', '<ul>', ...keys, '</ul>', '</body>'].join('\n');
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

function parsePath(url) {
  console.log('parsing ', url.pathname);
  const path = url.pathname.substring(1);
  if (path.length === 0) return null;
  const idx = path.indexOf('/');
  if (idx === -1) return { namespace: path };
  if (idx === 0) return null;

  const namespace = path.substring(0, idx);
  const key = path.substring(idx + 1);
  return { namespace, key };
}

function encodeKey(namespace, key) {
  return `links/${namespace}/${key}`;
}
function decodeKey(namespace, raw) {
  return raw.substring(`links/${namespace}/`.length);
}

function encodeLink(namespace, link, key) {
  const hash = hashString(link);
  return `keys/${namespace}/${hash}/${key}`;
}
function decodeLink(namespace, link, raw) {
  const hash = hashString(link);
  return raw.substring(`keys/${namespace}/${hash}/`.length);
}

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
