addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const parsed = parsePath(url)
  if (!parsed) {
    return new Response('Invalid namespace', { status: 400 })
  }
  const { namespace, name } = parsed;
  switch (request.method.toUpperCase()) {
    case 'GET':
      if (name) {
        return redirectToLink(namespace, name, url.origin + '/' + namespace);
      }
      const target = request.headers.get('x-golinks-target');
      if (target) {
        return lookupByLink(namespace, target);
      }
      return keyOverview(namespace);
    case 'PUT':
      return setLink(namespace, name, await request.text())
  }
  return new Response('Not found', { status: 404 })
}

async function redirectToLink(namespace, name, origin) {
  const link = await golinks.get(encodeKey(namespace, name))
  return Response.redirect(link ?? origin)
}

async function setLink(namespace, name, link) {
  const cur = await golinks.get(encodeKey(namespace, name))
  if (cur) {
    return new Response(`${name} is already set to ${cur}`, { status: 400 });
  }
  await Promise.all([
    golinks.put(encodeKey(namespace, name), link),
    golinks.put(encodeLink(namespace, link, name), true),
  ]);
  return new Response(`set link ${namespace}/${name} to ${link}`)
}

async function lookupByLink(namespace, link) {
  if (!namespace) throw Error('invalid namespace')
  const list = await golinks.list({ prefix: encodeLink(namespace, link, '') })
  const keys = list.keys.map((item) => decodeLink(namespace, link, item.name));
  return new Response(JSON.stringify(keys), { headers: { 'Content-Type': 'application/json' } })
}

async function keyOverview(namespace) {
  if (!namespace) throw Error('invalid namespace')
  const list = await golinks.list({ prefix: encodeKey(namespace, '') })
  const keys = list.keys.map((item) => {
    const name = decodeKey(namespace, item.name)
    return `<li><a href="https://go/${name}">${name}</a></li>`
  })
  const html = ['<body>', '<ul>', ...keys, '</ul>', '</body>'].join('\n')
  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}


function parsePath(url) {
  console.log("parsing ", url);
  const [namespace, name] = url.pathname.substring(1).split('/')
  if (namespace) {
    return { namespace, name };
  }
  return null;
}

function encodeKey(namespace, path) {
  return `links/${namespace}/${path}`
}
function decodeKey(namespace, raw) {
  return raw.substring(`links/${namespace}/`.length)
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
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

