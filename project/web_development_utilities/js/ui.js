
const view = () => document.getElementById("view");

let current = null;
let toastTimer = null;

function setMenuOpen(open) {
  const nav = document.getElementById("nav");
  const menu = document.getElementById("menu");

  nav.classList.toggle("open", open);
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation"
  );
}

function renderNav(app, nav) {
  nav.innerHTML = "";

  let group = null;

  app.registry.forEach((tool) => {
    if (tool.group && tool.group !== group) {
      group = tool.group;

      const h = document.createElement("h2");
      h.textContent = group;
      nav.append(h);
    }

    const a = document.createElement("a");
    a.href = "#" + tool.id;
    a.textContent = tool.title;
    a.dataset.id = tool.id;

    nav.append(a);
  });
}

function route(app) {
  const id = location.hash.slice(1) || "dashboard";

  const tool =
    app.registry.find((t) => t.id === id) || app.registry[0];

  if (current) current.unmount();

  const container = view();
  container.innerHTML = "";

  tool.component.mount(container, app);
  current = tool.component;

  document.title = tool.title + " - Web Dev Util";

  document.querySelectorAll("#nav a").forEach((a) => {
    if (a.dataset.id === tool.id) {
      a.setAttribute("aria-current", "page");
    } else {
      a.removeAttribute("aria-current");
    }
  });

  setMenuOpen(false);
}

function toast(message, type) {
  const el = document.getElementById("toast");

  el.textContent = message;
  el.dataset.type = type || "success";
  el.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    el.classList.remove("show");
  }, 2200);
}

function applyTheme(app, theme) {
  document.documentElement.dataset.theme = theme;
  app.state.set("theme", theme);
}

function wireBar(app) {
  const saved = app.state.get("theme", null);
  const dark = matchMedia("(prefers-color-scheme: dark)").matches;

  applyTheme(app, saved || (dark ? "dark" : "light"));

  document.getElementById("theme").onclick = () => {
    const next =
      document.documentElement.dataset.theme === "dark"
        ? "light"
        : "dark";

    applyTheme(app, next);
  };

  document.getElementById("menu").onclick = () => {
    const nav = document.getElementById("nav");
    setMenuOpen(!nav.classList.contains("open"));
  };

  document.getElementById("export").onclick = () => {
    const url = URL.createObjectURL(
      new Blob([app.storage.exportAll()], {
        type: "application/json"
      })
    );

    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "web-dev-util-data.json"
    });

    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  document.getElementById("import").onchange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const count = app.storage.importAll(await file.text());

      app.notify(`Imported ${count} entries`);
      route(app);
    } catch (err) {
      app.notify(err.message, "error");
    }

    e.target.value = "";
  };

  document.getElementById("clear").onclick = () => {
    if (!confirm("Delete all stored data for this application?")) {
      return;
    }

    app.storage.clearAll();
    app.notify("Stored data cleared");
    route(app);
  };

  const media = matchMedia("(min-width: 701px)");

  media.addEventListener("change", (e) => {
    if (e.matches) setMenuOpen(false);
  });
}

export function initUI(app) {
  app.onNotify(toast);

  renderNav(app, document.getElementById("nav"));
  wireBar(app);

  addEventListener("hashchange", () => route(app));

  route(app);
}
