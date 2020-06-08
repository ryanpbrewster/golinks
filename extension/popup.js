document.addEventListener('DOMContentLoaded', () => {
  const shortlink = document.getElementById("shortlink");
  shortlink.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") {
      shortlink.disabled = true;
      const port = chrome.extension.connect({ name: "Set Link" });
      port.postMessage(JSON.stringify({ setLink: { key: shortlink.value } }));
      port.onMessage.addListener((msg) => {
        shortlink.classList = [msg];
      });
    }
  });

  const toggle = document.getElementById("toggle");
  const extra = document.getElementById("extra");
  toggle.addEventListener("click", (evt) => {
    if (extra.classList.contains('hidden')) {
      extra.classList.remove('hidden');
    } else {
      extra.classList.add('hidden');
    }
  });

  const locked = document.getElementById("locked");
  const unlocked = document.getElementById("unlocked");
  const namespace = document.getElementById("namespace")
  locked.addEventListener("click", (evt) => {
    locked.classList.add('hidden');
    unlocked.classList.remove('hidden');
    namespace.disabled = false;
    namespace.focus();
  });
  unlocked.addEventListener("click", (evt) => {
    unlocked.classList.add('hidden');
    locked.classList.remove('hidden');
    namespace.disabled = true;
  });
  namespace.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") {
      namespace.disabled = true;
      port.postMessage(JSON.stringify({ setNamespace: { namespace: namespace.value } }));
      port.onMessage.addListener((msg) => {
        namespace.disabled = false;
        namespace.classList = [msg];
      });
    }
  });
});
