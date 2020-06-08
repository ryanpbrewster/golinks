document.addEventListener('DOMContentLoaded', () => {
  const existing = document.getElementById('existing');
  chrome.runtime.sendMessage({ getKeys: true }, (keys) => {
    keys.forEach((key) => {
      const a = document.createElement('a');
      a.href = `https://go/${key}`;
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerText = `go/${key}`;
      const item = document.createElement('li');
      item.appendChild(a);
      existing.appendChild(item);
    });
  });

  const shortlink = document.getElementById('shortlink');
  shortlink.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      shortlink.disabled = true;
      shortlink.classList.add('inflight');
      chrome.runtime.sendMessage({ setKey: { key: shortlink.value } }, (resp) => {
        shortlink.classList.add(resp);
        shortlink.disabled = false;
      });
    }
  });

  const toggle = document.getElementById('toggle');
  const extra = document.getElementById('extra');
  toggle.addEventListener('click', (evt) => {
    if (extra.classList.contains('hidden')) {
      extra.classList.remove('hidden');
    } else {
      extra.classList.add('hidden');
    }
  });

  const locked = document.getElementById('locked');
  const unlocked = document.getElementById('unlocked');
  const namespace = document.getElementById('namespace');
  chrome.runtime.sendMessage({ getNamespace: true }, (resp) => {
    namespace.value = resp;
  });
  locked.addEventListener('click', (evt) => {
    locked.classList.add('hidden');
    unlocked.classList.remove('hidden');
    namespace.disabled = false;
    namespace.focus();
  });
  unlocked.addEventListener('click', (evt) => {
    unlocked.classList.add('hidden');
    locked.classList.remove('hidden');
    namespace.disabled = true;
  });
  namespace.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      namespace.disabled = true;
      chrome.runtime.sendMessage({ setNamespace: { namespace: namespace.value } }, (resp) => {
        namespace.disabled = false;
        namespace.classList.add(resp);
      });
    }
  });
});
