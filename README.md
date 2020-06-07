# Golinks

A simple utility to redirect from short-links, like `go/foo`, to full urls, like `https://google.com`.

## Backend

Powered by CloudFlare workers. Check out `worker/`.

## Extension

Does two things:
  - has a popup to let you set new shortlinks
  - intercepts requests to `https://go/<path>` and redirect them to the CloudFlare worker backend.
