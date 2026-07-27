(() => {
  const stage = document.getElementById("scene-takeover");
  if (!stage) return;

  const desktop = window.matchMedia("(min-width: 821px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const restScale = 1;

  // Attio reference, measured at the review viewport (1645 × 846):
  // the complete incoming surface settles from 1 → .804 in about 1.1 s,
  // starting roughly 50 ms after scroll begins.
  const stiffness = 94;
  const damping = 21;
  const referenceScale = 0.8037;

  let scale = restScale;
  let velocity = 0;
  let target = restScale;
  let frame = 0;
  let previousTime = 0;
  let activationTimer = 0;

  const scrollingScale = () => {
    const viewportAdjustment = 1645 / window.innerWidth;
    return Math.min(0.95, Math.max(0.78, referenceScale * viewportAdjustment));
  };

  const render = () => {
    stage.style.transform = scale === restScale ? "none" : `scale(${scale})`;
  };

  const settle = (time) => {
    if (!previousTime) previousTime = time;
    const delta = Math.min((time - previousTime) / 1000, 0.032);
    previousTime = time;

    const acceleration = stiffness * (target - scale) - damping * velocity;
    velocity += acceleration * delta;
    scale += velocity * delta;

    if (Math.abs(target - scale) < 0.00005 && Math.abs(velocity) < 0.0005) {
      scale = target;
      velocity = 0;
      frame = 0;
      previousTime = 0;
      render();
      return;
    }

    render();
    frame = requestAnimationFrame(settle);
  };

  const setTarget = (nextTarget, immediate = false) => {
    target = nextTarget;

    if (immediate || reducedMotion.matches || !desktop.matches) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      velocity = 0;
      scale = reducedMotion.matches || !desktop.matches ? restScale : target;
      render();
      return;
    }

    if (!frame) frame = requestAnimationFrame(settle);
  };

  const syncScrollState = (immediate = false) => {
    const nextTarget = window.scrollY > 1 ? scrollingScale() : restScale;

    if (activationTimer && (immediate || nextTarget === restScale)) {
      window.clearTimeout(activationTimer);
      activationTimer = 0;
    }

    if (immediate || nextTarget === restScale) {
      setTarget(nextTarget, immediate);
      return;
    }

    if (target === nextTarget || activationTimer) return;
    activationTimer = window.setTimeout(() => {
      activationTimer = 0;
      setTarget(nextTarget);
    }, 50);
  };

  window.addEventListener("scroll", () => syncScrollState(), { passive: true });
  window.addEventListener("resize", () => syncScrollState(true));
  desktop.addEventListener("change", () => syncScrollState(true));
  reducedMotion.addEventListener("change", () => syncScrollState(true));
  syncScrollState(true);
})();
