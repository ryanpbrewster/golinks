const BASE = "https://golinks.brewster.workers.dev";
chrome.webRequest.onBeforeRequest.addListener((details) => {
  const url = new URL(details.url);
  if (url.hostname === "go") {
    return { redirectUrl: BASE + url.pathname };
  }
  return {};
}, {
  urls: ["<all_urls>"],
  types: ["main_frame"]
}, ["blocking"]);

chrome.extension.onConnect.addListener((port) => {
  port.onMessage.addListener((raw) => {
    const key = JSON.parse(raw).key;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const link = tabs[0].url;
      const put = fetch(BASE + '/' + key, {
        method: "PUT",
        body: link,
      });
      port.postMessage('inflight');
      put.then(() => port.postMessage('success')).catch(() => port.postMessage('failure'));
    });
  });
});

