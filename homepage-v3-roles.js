(() => {
  const board = document.querySelector(".role-board");
  if (!board) return;

  const tabs = [...board.querySelectorAll("[data-role]")];
  const scenes = [...board.querySelectorAll("[data-role-scene]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeRole = board.dataset.activeRole || tabs[0]?.dataset.role;
  let pendingRole = null;
  let transitionTimer = 0;

  function replayRole() {
    board.classList.remove("role-entered");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => board.classList.add("role-entered"));
    });
  }

  function setRole(role, moveFocus = false) {
    if (!role || role === activeRole) {
      window.clearTimeout(transitionTimer);
      pendingRole = null;
      board.classList.remove("is-switching");
      if (role && !reducedMotion.matches) replayRole();
      if (moveFocus) tabs.find((tab) => tab.dataset.role === role)?.focus();
      return;
    }
    if (role === pendingRole) {
      if (moveFocus) tabs.find((tab) => tab.dataset.role === role)?.focus();
      return;
    }

    const nextTab = tabs.find((tab) => tab.dataset.role === role);
    const nextScene = scenes.find((scene) => scene.dataset.roleScene === role);
    if (!nextTab || !nextScene) return;

    window.clearTimeout(transitionTimer);
    pendingRole = role;
    board.classList.add("is-switching");

    const commit = () => {
      activeRole = role;
      pendingRole = null;
      board.dataset.activeRole = role;

      tabs.forEach((tab) => {
        const active = tab === nextTab;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });

      scenes.forEach((scene) => {
        const active = scene === nextScene;
        scene.classList.toggle("active", active);
        scene.hidden = !active;
      });

      board.classList.remove("is-switching");
      replayRole();
      if (window.innerWidth <= 700) {
        nextTab.scrollIntoView({
          behavior: reducedMotion.matches ? "auto" : "smooth",
          block: "nearest",
          inline: "center",
        });
      }
      if (moveFocus) nextTab.focus();
    };

    if (reducedMotion.matches) {
      commit();
      return;
    }

    transitionTimer = window.setTimeout(commit, 120);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") setRole(tab.dataset.role);
    });
    tab.addEventListener("focus", () => setRole(tab.dataset.role));
    tab.addEventListener("click", () => setRole(tab.dataset.role, true));
    tab.addEventListener("keydown", (event) => {
      const index = tabs.indexOf(tab);
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        setRole(tabs[(index + 1) % tabs.length].dataset.role, true);
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        setRole(tabs[(index - 1 + tabs.length) % tabs.length].dataset.role, true);
      }
      if (event.key === "Home") {
        event.preventDefault();
        setRole(tabs[0].dataset.role, true);
      }
      if (event.key === "End") {
        event.preventDefault();
        setRole(tabs[tabs.length - 1].dataset.role, true);
      }
    });
  });

  board.classList.add("role-entered");
})();
