document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById("shortlink");
  input.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") {
      input.disabled = true;
      const port = chrome.extension.connect({ name: "Set Link" });
      port.postMessage(JSON.stringify({ setLink: { key: input.value } }));
      port.onMessage.addListener((msg) => {
        input.classList = [msg];
      });
    }
  });
});
