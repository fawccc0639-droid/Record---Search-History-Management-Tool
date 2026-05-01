(() => {
  if (window.__searchShotOverlay) {
    window.__searchShotOverlay.start();
    return;
  }

  const OVERLAY_ID = "search-shot-overlay";
  const BOX_ID = "search-shot-box";
  const MENU_ID = "search-shot-menu";
  const STYLE_ID = "search-shot-style";

  let overlay = null;
  let box = null;
  let menu = null;
  let startX = 0;
  let startY = 0;
  let selecting = false;
  let lastRect = null;

  const ACTIONS = [
    { type: "text", label: "搜文字" },
    { type: "video", label: "搜视频" },
    { type: "image", label: "搜图片" },
    { type: "product", label: "搜商品" }
  ];

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${OVERLAY_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        cursor: crosshair;
        background: rgba(0, 0, 0, 0.35);
        user-select: none;
      }
      #${BOX_ID} {
        position: fixed;
        border: 2px solid #3d7eff;
        background: rgba(61, 126, 255, 0.18);
        pointer-events: none;
      }
      #${MENU_ID} {
        position: fixed;
        z-index: 2147483647;
        min-width: 140px;
        background: #1f2633;
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 10px;
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.25);
        padding: 6px;
        font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      }
      #${MENU_ID} button {
        width: 100%;
        border: none;
        background: transparent;
        color: inherit;
        border-radius: 8px;
        padding: 8px 10px;
        text-align: left;
        cursor: pointer;
      }
      #${MENU_ID} button:hover {
        background: rgba(255, 255, 255, 0.12);
      }
    `;
    document.documentElement.appendChild(style);
  }

  function cleanup() {
    overlay?.remove();
    box?.remove();
    menu?.remove();
    overlay = null;
    box = null;
    menu = null;
    selecting = false;
    lastRect = null;
  }

  function getRectFromPoints(x1, y1, x2, y2) {
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);
    return { left, top, width, height };
  }

  function showMenu(rect) {
    menu?.remove();
    menu = document.createElement("div");
    menu.id = MENU_ID;

    const actions = [...ACTIONS, { type: "cancel", label: "取消" }];
    actions.forEach((action) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = action.label;
      btn.addEventListener("click", async (event) => {
        event.stopPropagation();

        if (action.type === "cancel") {
          cleanup();
          return;
        }

        await chrome.runtime.sendMessage({
          type: "SCREENSHOT_SEARCH_ACTION",
          payload: {
            actionType: action.type,
            rect,
            pageTitle: document.title || "",
            pageUrl: location.href
          }
        });

        cleanup();
      });
      menu.appendChild(btn);
    });

    const menuLeft = Math.min(rect.left + rect.width + 8, window.innerWidth - 170);
    const menuTop = Math.min(rect.top, window.innerHeight - 220);
    menu.style.left = `${Math.max(8, menuLeft)}px`;
    menu.style.top = `${Math.max(8, menuTop)}px`;

    document.documentElement.appendChild(menu);
  }

  function onMouseDown(event) {
    if (event.button !== 0) return;
    selecting = true;
    startX = event.clientX;
    startY = event.clientY;
    lastRect = null;

    box?.remove();
    box = document.createElement("div");
    box.id = BOX_ID;
    document.documentElement.appendChild(box);
  }

  function onMouseMove(event) {
    if (!selecting || !box) return;
    const rect = getRectFromPoints(startX, startY, event.clientX, event.clientY);
    box.style.left = `${rect.left}px`;
    box.style.top = `${rect.top}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
    lastRect = rect;
  }

  function onMouseUp() {
    if (!selecting) return;
    selecting = false;

    if (!lastRect || lastRect.width < 10 || lastRect.height < 10) {
      cleanup();
      return;
    }

    showMenu(lastRect);
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      cleanup();
    }
  }

  function start() {
    cleanup();
    ensureStyle();

    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.addEventListener("mousedown", onMouseDown);
    overlay.addEventListener("mousemove", onMouseMove);
    overlay.addEventListener("mouseup", onMouseUp);
    overlay.addEventListener("keydown", onKeyDown);
    overlay.tabIndex = -1;

    document.documentElement.appendChild(overlay);
    overlay.focus();
  }

  window.__searchShotOverlay = { start, cleanup };
  start();
})();
