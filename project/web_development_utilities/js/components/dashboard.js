export function mount(container, app) {
  const tools = app.registry.filter((t) => t.id !== "dashboard");
  container.innerHTML = `<h1>Web Dev Util</h1><p>Browser-based tools for web development. All processing happens locally.</p><div class="cards"></div>`;
  const cards = container.querySelector(".cards");
  tools.forEach((t) => {
    const a = document.createElement("a");
    a.className = "card";
    a.href = "#" + t.id;
    const name = document.createElement("strong");
    name.textContent = t.title;
    const info = document.createElement("small");
    info.textContent = t.summary;
    a.append(name, document.createElement("br"), info);
    cards.append(a);
  });
}

export function unmount() {}
