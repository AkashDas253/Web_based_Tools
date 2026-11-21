const styles = `
  .notification {
    padding: 13px 16px; border: 1px solid var(--border); border-radius: 10px;
    background: white; box-shadow: 0 8px 25px #20243818;
    color: #202438; font-size: 13px; cursor: pointer;
  }
  .notification-success { border-left: 4px solid var(--success); }
  .notification-error { border-left: 4px solid var(--danger); }
  .notification-info { border-left: 4px solid var(--primary); }
`;

function addStyles() {
  if (document.getElementById("notification-styles")) return;
  const style = document.createElement("style");
  style.id = "notification-styles";
  style.textContent = styles;
  document.head.appendChild(style);
}

export function create(container) {
  addStyles();

  return function notify(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = String(message);
    notification.setAttribute("role", "status");
    container.appendChild(notification);

    const remove = () => notification.remove();
    notification.addEventListener("click", remove, { once: true });
    window.setTimeout(remove, 3500);
  };
}
