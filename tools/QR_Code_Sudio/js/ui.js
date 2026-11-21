import { app } from "./app.js";

import * as Sidebar from "./components/sidebar.js";
import * as Header from "./components/header.js";
import * as Dashboard from "./components/dashboard.js";
import * as Generator from "./components/generator.js";
import * as Scanner from "./components/scanner.js";
import * as Batch from "./components/batch.js";
import * as History from "./components/history.js";
import * as Formats from "./components/formats.js";
import * as Settings from "./components/settings.js";
import * as Notifications from "./components/notifications.js";

const pages = {
  dashboard: Dashboard,
  generator: Generator,
  scanner: Scanner,
  batch: Batch,
  history: History,
  formats: Formats,
  settings: Settings
};

const state = {
  currentPage: "dashboard",
  sidebarOpen: false,
  activePage: null
};

const context = {
  app,
  state,
  navigate,
  notify: null
};

function renderShell() {
  return `
    <div class="app-layout">
      <div id="sidebar-container"></div>
      <main class="main-content">
        <div id="header-container"></div>
        <section id="page-container" class="page-container" aria-live="polite"></section>
      </main>
      <div id="notification-container" class="notification-container" aria-live="polite"></div>
    </div>
  `;
}

function requireElement(parent, selector) {
  const element = parent.querySelector(selector);
  if (!element) throw new Error(`Required UI element not found: ${selector}`);
  return element;
}

function navigate(pageName) {
  const page = pages[pageName];
  if (!page) {
    console.warn(`Unknown page: ${pageName}`);
    return;
  }

  state.activePage?.destroy?.();
  state.activePage = null;

  state.currentPage = pageName;
  app.setView(pageName);

  Sidebar.setActive(pageName);
  Header.setPage(page.title, page.description);

  const container = requireElement(document, "#page-container");
  state.activePage = page.mount(container, context) || null;

  state.sidebarOpen = false;
  Sidebar.setOpen(false);
  Header.setMenuExpanded(false);
}

function initUI() {
  const root = document.querySelector("#app");
  if (!root) throw new Error("Application root #app was not found.");

  root.innerHTML = renderShell();

  Sidebar.mount(requireElement(root, "#sidebar-container"), context);
  Header.mount(requireElement(root, "#header-container"), context);
  context.notify = Notifications.create(requireElement(root, "#notification-container"));

  navigate("dashboard");
  console.info("QR Code Studio initialized.");
}

initUI();
