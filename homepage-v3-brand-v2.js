(() => {
  const brandField = document.getElementById("brand-playground");
  const brandCanvas = document.getElementById("brand-trail");
  const brandCoordinate = document.getElementById("brand-coordinate");
  if (!brandField || !brandCanvas || !brandCoordinate) return;

  const brandContext = brandCanvas.getContext("2d");
  const workCards = [...brandField.querySelectorAll(".work-card")];
  const brandFollowerEls = [...brandField.querySelectorAll(".brand-followers i")];
  const brandPointer = { x: 0, y: 0, inside: false };
  const brandTrail = [];
  const brandReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const defaultCoordinate = "X 000 · Y 000";
  let brandBounds;
  let brandDpr = 1;
  let brandDrag = null;

  const workStates = workCards.map((element, anchorIndex) => ({
    element,
    anchorIndex,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    homeX: Number(element.dataset.x) / 100,
    homeY: Number(element.dataset.y) / 100,
    follow: Number(element.dataset.follow || .03),
    rotation: element.style.getPropertyValue("--r") || "0deg",
    ready: false,
    moved: false
  }));

  const anchors = workStates.map((state) => ({
    x: state.homeX,
    y: state.homeY
  }));

  const followerStates = brandFollowerEls.map((element, index) => ({
    element,
    x: 0,
    y: 0,
    ease: [.2, .115, .075][index]
  }));

  const anchorPoint = (index) => ({
    x: anchors[index].x * brandBounds.width,
    y: anchors[index].y * brandBounds.height
  });

  const sizeBrandField = () => {
    const previousBounds = brandBounds;
    brandBounds = brandField.getBoundingClientRect();
    brandDpr = Math.min(window.devicePixelRatio || 1, 2);
    brandCanvas.width = Math.round(brandBounds.width * brandDpr);
    brandCanvas.height = Math.round(brandBounds.height * brandDpr);
    brandCanvas.style.width = `${brandBounds.width}px`;
    brandCanvas.style.height = `${brandBounds.height}px`;
    brandContext.setTransform(brandDpr, 0, 0, brandDpr, 0, 0);

    workStates.forEach((state) => {
      const target = anchorPoint(state.anchorIndex);
      if (!state.ready) {
        state.x = target.x;
        state.y = target.y;
        state.ready = true;
      } else if (previousBounds && !brandDrag) {
        state.x = target.x;
        state.y = target.y;
        state.vx = 0;
        state.vy = 0;
      }
    });

    followerStates.forEach((state) => {
      if (!state.x && !state.y) {
        state.x = brandBounds.width / 2;
        state.y = brandBounds.height / 2;
      }
    });
  };

  const fieldPoint = (event) => {
    if (!brandBounds) sizeBrandField();
    return {
      x: event.clientX - brandBounds.left,
      y: event.clientY - brandBounds.top
    };
  };

  const updateMagnetHeat = () => {
    if (!brandDrag) {
      brandField.classList.remove("is-magnet-hot");
      return;
    }
    const centerX = brandBounds.width / 2;
    const centerY = brandBounds.height * .59;
    const distance = Math.hypot(brandPointer.x - centerX, brandPointer.y - centerY);
    brandField.classList.toggle("is-magnet-hot", distance < Math.min(190, brandBounds.width * .2));
  };

  const readBrandPointer = (event) => {
    const point = fieldPoint(event);
    brandPointer.x = point.x;
    brandPointer.y = point.y;
    brandField.style.setProperty("--mx", `${brandPointer.x}px`);
    brandField.style.setProperty("--my", `${brandPointer.y}px`);
    brandField.style.setProperty(
      "--ink",
      `${Math.max(0, Math.min(100, brandPointer.x / brandBounds.width * 100))}%`
    );

    if (brandDrag) {
      const title = brandDrag.element.querySelector("span")?.textContent || "WORK";
      brandCoordinate.textContent = `${title.toUpperCase()} · RELEASE TO SNAP`;
      brandDrag.moved = brandDrag.moved
        || Math.hypot(event.clientX - brandDrag.startX, event.clientY - brandDrag.startY) > 5;
    } else {
      brandCoordinate.textContent = `X ${String(Math.round(brandPointer.x)).padStart(3, "0")} · Y ${String(Math.round(brandPointer.y)).padStart(3, "0")}`;
    }

    if (brandPointer.inside && !brandReducedMotion) {
      brandTrail.push({ x: brandPointer.x, y: brandPointer.y, life: 1 });
      if (brandTrail.length > 34) brandTrail.shift();
    }
    updateMagnetHeat();
  };

  const nearestAnchorIndex = (state) => {
    let closestIndex = state.anchorIndex;
    let closestDistance = Infinity;
    anchors.forEach((anchor, index) => {
      const x = anchor.x * brandBounds.width;
      const y = anchor.y * brandBounds.height;
      const distance = Math.hypot(state.x - x, state.y - y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  };

  const markSnapping = (...states) => {
    states.filter(Boolean).forEach((state) => state.element.classList.add("is-snapping"));
    window.setTimeout(() => {
      states.filter(Boolean).forEach((state) => state.element.classList.remove("is-snapping"));
    }, 520);
  };

  const releaseWorkCard = (state) => {
    const previousAnchor = state.anchorIndex;
    const nextAnchor = nearestAnchorIndex(state);
    const occupant = workStates.find(
      (candidate) => candidate !== state && candidate.anchorIndex === nextAnchor
    );

    if (occupant && nextAnchor !== previousAnchor) {
      occupant.anchorIndex = previousAnchor;
      occupant.vx += (state.x - occupant.x) * .025;
      occupant.vy += (state.y - occupant.y) * .025;
    }
    state.anchorIndex = nextAnchor;
    state.element.classList.remove("is-dragging");
    markSnapping(state, occupant);
    brandDrag = null;
    brandCoordinate.textContent = brandPointer.inside
      ? `X ${String(Math.round(brandPointer.x)).padStart(3, "0")} · Y ${String(Math.round(brandPointer.y)).padStart(3, "0")}`
      : defaultCoordinate;
    brandField.classList.remove("is-magnet-hot");
    if (!brandPointer.inside) brandField.classList.remove("is-playing");
  };

  brandField.addEventListener("pointerenter", (event) => {
    brandBounds = brandField.getBoundingClientRect();
    brandPointer.inside = true;
    brandField.classList.add("is-playing");
    readBrandPointer(event);
  });

  brandField.addEventListener("pointermove", readBrandPointer);

  brandField.addEventListener("pointerleave", () => {
    brandPointer.inside = false;
    if (!brandDrag) brandField.classList.remove("is-playing");
  });

  workStates.forEach((state) => {
    state.element.addEventListener("pointerdown", (event) => {
      readBrandPointer(event);
      state.element.setPointerCapture(event.pointerId);
      brandDrag = state;
      state.moved = false;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.offsetX = brandPointer.x - state.x;
      state.offsetY = brandPointer.y - state.y;
      state.element.classList.add("is-dragging");
      brandField.classList.add("is-playing");
    });

    state.element.addEventListener("pointerup", () => {
      if (brandDrag === state) releaseWorkCard(state);
    });

    state.element.addEventListener("pointercancel", () => {
      if (brandDrag === state) releaseWorkCard(state);
    });

    state.element.addEventListener("click", () => {
      if (!state.moved) state.element.classList.toggle("is-lit");
    });
  });

  const drawPointerTrail = () => {
    brandTrail.forEach((point) => { point.life *= .94; });
    while (brandTrail.length && brandTrail[0].life < .04) brandTrail.shift();
    if (brandTrail.length <= 1) return;

    brandContext.lineCap = "round";
    for (let index = 1; index < brandTrail.length; index += 1) {
      const previous = brandTrail[index - 1];
      const point = brandTrail[index];
      brandContext.beginPath();
      brandContext.moveTo(previous.x, previous.y);
      brandContext.lineTo(point.x, previous.y);
      brandContext.lineTo(point.x, point.y);
      brandContext.strokeStyle = `rgba(17, 24, 39, ${point.life * .16})`;
      brandContext.lineWidth = 1;
      brandContext.stroke();
    }
  };

  const drawMagnetLine = () => {
    if (!brandDrag) return;
    const centerX = brandBounds.width / 2;
    const centerY = brandBounds.height * .59;
    brandContext.save();
    brandContext.beginPath();
    brandContext.moveTo(centerX, centerY);
    brandContext.bezierCurveTo(
      centerX + (brandDrag.x - centerX) * .35,
      centerY,
      centerX + (brandDrag.x - centerX) * .72,
      brandDrag.y,
      brandDrag.x,
      brandDrag.y
    );
    brandContext.setLineDash([3, 5]);
    brandContext.strokeStyle = "rgba(17, 24, 39, .24)";
    brandContext.lineWidth = 1;
    brandContext.stroke();
    brandContext.restore();
  };

  const drawBrandFrame = () => {
    if (!brandBounds) sizeBrandField();
    const centerX = brandBounds.width / 2;
    const centerY = brandBounds.height / 2;
    brandContext.clearRect(0, 0, brandBounds.width, brandBounds.height);
    drawPointerTrail();
    drawMagnetLine();

    workStates.forEach((state) => {
      const anchor = anchorPoint(state.anchorIndex);
      const halfWidth = state.element.offsetWidth / 2;
      const halfHeight = state.element.offsetHeight / 2;
      const targetX = state === brandDrag
        ? Math.max(halfWidth + 8, Math.min(brandBounds.width - halfWidth - 8, brandPointer.x - state.offsetX))
        : anchor.x + (brandPointer.inside ? (brandPointer.x - centerX) * state.follow : 0);
      const targetY = state === brandDrag
        ? Math.max(halfHeight + 8, Math.min(brandBounds.height - halfHeight - 8, brandPointer.y - state.offsetY))
        : anchor.y + (brandPointer.inside ? (brandPointer.y - centerY) * state.follow : 0);

      if (brandReducedMotion) {
        state.x = targetX;
        state.y = targetY;
      } else {
        const pull = state === brandDrag ? .23 : .075;
        const damping = state === brandDrag ? .69 : .76;
        state.vx = (state.vx + (targetX - state.x) * pull) * damping;
        state.vy = (state.vy + (targetY - state.y) * pull) * damping;
        state.x += state.vx;
        state.y += state.vy;
      }

      state.element.style.transform = `translate3d(${state.x - halfWidth}px, ${state.y - halfHeight}px, 0) rotate(${state.rotation})`;
    });

    followerStates.forEach((state, index) => {
      const targetX = brandPointer.inside ? brandPointer.x : centerX;
      const targetY = brandPointer.inside ? brandPointer.y : centerY;
      state.x += (targetX - state.x) * (brandReducedMotion ? 1 : state.ease);
      state.y += (targetY - state.y) * (brandReducedMotion ? 1 : state.ease);
      state.element.style.transform = `translate3d(${state.x - 4 - index * 2}px, ${state.y - 4 - index * 2}px, 0)`;
    });

    window.requestAnimationFrame(drawBrandFrame);
  };

  new ResizeObserver(sizeBrandField).observe(brandField);
  sizeBrandField();
  window.requestAnimationFrame(drawBrandFrame);
})();
