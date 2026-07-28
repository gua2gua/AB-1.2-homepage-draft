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
      requestAnimationFrame(() => {
        measureSoloTop();
        renderSolo();
      });
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

  const solo = document.getElementById("solo-founder");
  const roles = board.closest(".roles");
  if (!solo || !roles) return;

  const soloDesktop = window.matchMedia("(min-width: 701px)");
  const soloStiffness = 94;
  const soloDamping = 21;
  let soloProgress = 0;
  let soloTarget = 0;
  let soloVelocity = 0;
  let soloFrame = 0;
  let soloPreviousTime = 0;
  let soloDocumentTop = 0;
  let soloCoverLift = -360;
  let soloLastScrollY = window.scrollY;

  const clampSolo = (value) => Math.max(0, Math.min(1, value));

  const documentTop = (element) => {
    let node = element;
    let top = 0;
    while (node) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }
    return top;
  };

  const measureSoloTop = () => {
    soloDocumentTop = documentTop(solo);
    const activeHeading = board.querySelector(".role-scene.active .role-scene-head");
    if (!activeHeading) return;

    const titleBottom = documentTop(activeHeading) + activeHeading.offsetHeight + 18;
    const boardBottom = documentTop(board) + board.offsetHeight;
    const coverHeight = Math.max(solo.offsetHeight, boardBottom - titleBottom);
    soloCoverLift = titleBottom - soloDocumentTop;
    solo.style.setProperty("--solo-cover-height", `${coverHeight}px`);
  };

  const renderSolo = () => {
    const progress = clampSolo(soloProgress);
    const lift = 12 + progress * (soloCoverLift - 12);
    solo.style.setProperty("--solo-lift", `${lift}px`);
    solo.style.setProperty("--solo-scale", String(.995 + progress * .005));
    solo.style.setProperty("--solo-opacity", "1");
    solo.style.setProperty("--solo-inner-shift", `${8 - progress * 8}px`);
    solo.classList.toggle("is-covering", soloTarget > .5 || progress > .08);
  };

  const settleSolo = (time) => {
    if (!soloPreviousTime) soloPreviousTime = time;
    const delta = Math.min((time - soloPreviousTime) / 1000, .032);
    soloPreviousTime = time;

    const acceleration = soloStiffness * (soloTarget - soloProgress) - soloDamping * soloVelocity;
    soloVelocity += acceleration * delta;
    soloProgress += soloVelocity * delta;
    renderSolo();

    if (Math.abs(soloTarget - soloProgress) < .0004 && Math.abs(soloVelocity) < .002) {
      soloProgress = soloTarget;
      soloVelocity = 0;
      soloPreviousTime = 0;
      soloFrame = 0;
      renderSolo();
      return;
    }

    soloFrame = requestAnimationFrame(settleSolo);
  };

  const setSoloTarget = (nextTarget, immediate = false) => {
    soloTarget = clampSolo(nextTarget);

    if (immediate || reducedMotion.matches || !soloDesktop.matches) {
      if (soloFrame) cancelAnimationFrame(soloFrame);
      soloFrame = 0;
      soloPreviousTime = 0;
      soloVelocity = 0;
      soloProgress = !soloDesktop.matches ? 1 : soloTarget;
      renderSolo();
      return;
    }

    if (!soloFrame && Math.abs(soloTarget - soloProgress) > .0004) {
      soloFrame = requestAnimationFrame(settleSolo);
    }
  };

  const syncSolo = (immediate = false) => {
    if (reducedMotion.matches) {
      setSoloTarget(0, true);
      return;
    }

    if (!soloDesktop.matches) {
      setSoloTarget(1, true);
      return;
    }

    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - soloLastScrollY;
    const visualTop = soloDocumentTop - currentScrollY;
    const isNearSolo = visualTop < window.innerHeight * 1.08
      && visualTop > -solo.offsetHeight * .7;
    let nextTarget = soloTarget;

    if (!isNearSolo) {
      nextTarget = 0;
    } else if (!immediate && scrollDelta > 1.5) {
      nextTarget = 0;
    } else if (!immediate && scrollDelta < -1.5) {
      nextTarget = 1;
    }

    soloLastScrollY = currentScrollY;
    setSoloTarget(nextTarget, immediate);
  };

  const resizeSolo = () => {
    measureSoloTop();
    syncSolo(true);
  };

  const bootSolo = () => {
    roles.classList.add("solo-takeover-ready");
    measureSoloTop();
    syncSolo(true);
    window.addEventListener("scroll", () => syncSolo(), { passive: true });
    window.addEventListener("resize", resizeSolo);
    soloDesktop.addEventListener("change", resizeSolo);
    reducedMotion.addEventListener("change", resizeSolo);
  };

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(bootSolo));
  } else {
    requestAnimationFrame(bootSolo);
  }
})();
