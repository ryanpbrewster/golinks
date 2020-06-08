const BASE = "https://golinks.brewster.workers.dev";

let namespace = "default";
chrome.storage.onChanged.addListener((changes, area) => {
  if (changes.namespace) {
    namespace = changes.namespace.newValue;
  }
});

chrome.webRequest.onBeforeRequest.addListener((details) => {
  const url = new URL(details.url);
  if (url.hostname === "go") {
    return { redirectUrl: BASE + '/' + namespace + url.pathname };
  }
  return {};
}, {
  urls: ["<all_urls>"],
  types: ["main_frame"]
}, ["blocking"]);

chrome.extension.onConnect.addListener((port) => {
  port.onMessage.addListener((raw) => {
    const msg = JSON.parse(raw);
    console.log("handling message: ", msg);
    let resp;
    if (msg.setLink) {
      console.log("setting key ", msg.setLink);
      resp = handleSetLink(msg.setLink.key);
    } else if (msg.setNamespace) {
      console.log("setting namespace ", msg.setNamespace);
      resp = handleSetNamespace(msg.setNamespace.namespace);
    } else {
      resp = Promise.reject();
    }
    port.postMessage('inflight');
    resp
      .then(() => port.postMessage('success'))
      .catch(() => port.postMessage('failure'));
  });
});

async function handleSetNamespace(namespace) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ namespace }, () => {
      resolve();
    });
  });
}

async function handleSetLink(key) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const link = tabs[0].url;
      const request = fetch(BASE + '/' + namespace + '/' + key, {
        method: "PUT",
        body: link,
      });
      resolve(request);
    });
  });
}
