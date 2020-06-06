addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const resp = await fetch(LIST_URL, {
    cf: { cacheTtl: 86400 }
  });
  const items = await resp.json();
  return new Response(items[Math.floor(Math.random() * items.length)], {
    headers: { 'content-type': 'application/json' },
  })
}

const LIST_URL = 'https://pairwise-ranked.firebaseio.com/lists/colors.json';
