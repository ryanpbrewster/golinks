# Golinks

A simple utility to redirect from short-links, like `go/foo`, to full urls, like `https://google.com`.

Available as a [Chrome Extension](https://chrome.google.com/webstore/detail/golinks/gfibcnejmknobdgdfejnddhakfpbabjb) and a [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/rpb-golinks/).

## Backend

Powered by CloudFlare workers. Check out `worker/`.

## Extension

Does two things:
  - has a popup to let you set new shortlinks
  - intercepts requests to `https://go/<path>` and redirect them to the CloudFlare worker backend.

### Firefox

Firefox is particularly reluctant to actually navigate to a URL like "go/foo".
Because they don't look like valid links, it will usually default to performing
a Google search.

To fix this, go to `about:config` and add a config entry for
`browser.fixup.domainwhitelist.go = true`. This will tell Firefox that `go` is
a valid domain, all on its own, and it should try resolving it.

References:
  - https://bugzilla.mozilla.org/show_bug.cgi?id=1642435
  - https://iafisher.com/blog/2020/10/golinks
