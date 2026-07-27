(() => {
  const rows = [...document.querySelectorAll(".principle-row")];
  if (!rows.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionTimers = new Map();

  const motionDuration = (row) => {
    if (row.classList.contains("principle-cowork")) return 4800;
    if (row.classList.contains("principle-yours")) return 5400;
    if (row.classList.contains("principle-sourced")) return 5400;
    return 5800;
  };

  const stopMotion = (row) => {
    const timers = motionTimers.get(row);
    if (timers) {
      window.clearTimeout(timers.start);
      window.clearTimeout(timers.end);
    }
    motionTimers.delete(row);
    row.classList.remove("motion-starting", "motion-active");
  };

  const startMotion = (row) => {
    rows.forEach(stopMotion);
    if (reducedMotion.matches) return;

    row.classList.add("motion-starting");
    const timers = {};
    timers.start = window.setTimeout(() => {
      row.classList.remove("motion-starting");
      void row.offsetWidth;
      row.classList.add("motion-active");
      timers.end = window.setTimeout(() => stopMotion(row), motionDuration(row) + 80);
    }, 180);
    motionTimers.set(row, timers);
  };

  rows.forEach((row) => {
    const visual = row.querySelector(".principle-visual");
    if (!visual) return;

    const pointerPulse = document.createElement("span");
    pointerPulse.className = "interaction-pulse";
    pointerPulse.setAttribute("aria-hidden", "true");
    visual.append(pointerPulse);

    const setPointerPosition = (event) => {
      const bounds = visual.getBoundingClientRect();
      const x = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
      const y = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
      visual.style.setProperty("--plan-x", `${(x / bounds.width) * 100}%`);
      visual.style.setProperty("--plan-y", `${(y / bounds.height) * 100}%`);
    };

    let pointTimer = null;
    const pulseFromPointer = (event) => {
      if (event) setPointerPosition(event);
      visual.classList.remove("point-active");
      void visual.offsetWidth;
      visual.classList.add("point-active");
      window.clearTimeout(pointTimer);
      pointTimer = window.setTimeout(() => visual.classList.remove("point-active"), 660);
    };

    const replayFromPointer = (event) => {
      pulseFromPointer(event);
      startMotion(row);
    };

    visual.addEventListener("pointerenter", (event) => {
      row.classList.add("is-interacting");
      if (event.pointerType === "touch") return;
      replayFromPointer(event);
    });
    visual.addEventListener("pointerleave", () => row.classList.remove("is-interacting"));
    visual.addEventListener("focus", () => {
      row.classList.add("is-interacting");
      if (row.classList.contains("motion-starting") || row.classList.contains("motion-active")) return;
      visual.style.setProperty("--plan-x", "50%");
      visual.style.setProperty("--plan-y", "50%");
      replayFromPointer();
    });
    visual.addEventListener("blur", () => row.classList.remove("is-interacting"));
    visual.addEventListener("click", (event) => {
      if (row.classList.contains("motion-starting") || row.classList.contains("motion-active")) {
        pulseFromPointer(event);
        return;
      }
      replayFromPointer(event);
    });
    visual.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      visual.style.setProperty("--plan-x", "50%");
      visual.style.setProperty("--plan-y", "50%");
      replayFromPointer();
    });
    visual.addEventListener("pointermove", setPointerPosition);
  });

  reducedMotion.addEventListener("change", () => rows.forEach(stopMotion));
})();
