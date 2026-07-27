(() => {
  const brandField = document.getElementById("brand-playground");
  const brandCanvas = document.getElementById("brand-trail");
  const brandCore = document.getElementById("brand-core");
  const brandCoordinate = document.getElementById("brand-coordinate");
  if (!brandField || !brandCanvas || !brandCore || !brandCoordinate) return;

  const brandContext = brandCanvas.getContext("2d");
  const brandParticles = [...brandField.querySelectorAll(".brand-particle")];
  const brandFollowerEls = [...brandField.querySelectorAll(".brand-followers i")];
  const brandPointer = { x: 0, y: 0, inside: false };
  const brandTrail = [];
  const brandReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let brandBounds;
  let brandDpr = 1;
  let brandDrag = null;

  const brandStates = brandParticles.map((element) => ({
    element,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    homeX: Number(element.dataset.x) / 100,
    homeY: Number(element.dataset.y) / 100,
    follow: Number(element.dataset.follow),
    rotation: element.style.getPropertyValue("--r") || "0deg",
    ready: false,
    moved: false
  }));

  const followerStates = brandFollowerEls.map((element, index) => ({
    element,
    x: 0,
    y: 0,
    ease: [.2, .115, .075][index]
  }));

  const sizeBrandField = () => {
    brandBounds = brandField.getBoundingClientRect();
    brandDpr = Math.min(window.devicePixelRatio || 1, 2);
    brandCanvas.width = Math.round(brandBounds.width * brandDpr);
    brandCanvas.height = Math.round(brandBounds.height * brandDpr);
    brandCanvas.style.width = `${brandBounds.width}px`;
    brandCanvas.style.height = `${brandBounds.height}px`;
    brandContext.setTransform(brandDpr, 0, 0, brandDpr, 0, 0);

    brandStates.forEach((state) => {
      const homeX = state.homeX * brandBounds.width;
      const homeY = state.homeY * brandBounds.height;
      if (!state.ready) {
        state.x = homeX;
        state.y = homeY;
        state.ready = true;
      }
    });

    followerStates.forEach((state) => {
      if (!state.x && !state.y) {
        state.x = brandBounds.width / 2;
        state.y = brandBounds.height / 2;
      }
    });
  };

  const readBrandPointer = (event) => {
    if (!brandBounds) sizeBrandField();
    brandPointer.x = event.clientX - brandBounds.left;
    brandPointer.y = event.clientY - brandBounds.top;
    brandField.style.setProperty("--mx", `${brandPointer.x}px`);
    brandField.style.setProperty("--my", `${brandPointer.y}px`);
    brandField.style.setProperty("--ink", `${Math.max(0, Math.min(100, brandPointer.x / brandBounds.width * 100))}%`);
    brandCoordinate.textContent = `X ${String(Math.round(brandPointer.x)).padStart(3, "0")} · Y ${String(Math.round(brandPointer.y)).padStart(3, "0")}`;

    if (brandPointer.inside && !brandReducedMotion) {
      brandTrail.push({ x: brandPointer.x, y: brandPointer.y, life: 1 });
      if (brandTrail.length > 34) brandTrail.shift();
    }

    if (brandDrag) {
      brandDrag.moved = brandDrag.moved || Math.hypot(event.clientX - brandDrag.startX, event.clientY - brandDrag.startY) > 5;
    }
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

  brandStates.forEach((state) => {
    state.element.addEventListener("pointerdown", (event) => {
      state.element.setPointerCapture(event.pointerId);
      brandDrag = state;
      state.moved = false;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.offsetX = brandPointer.x - state.x;
      state.offsetY = brandPointer.y - state.y;
      state.element.classList.add("is-dragging");
    });

    state.element.addEventListener("pointerup", () => {
      state.element.classList.remove("is-dragging");
      brandDrag = null;
      if (!brandPointer.inside) brandField.classList.remove("is-playing");
    });

    state.element.addEventListener("pointercancel", () => {
      state.element.classList.remove("is-dragging");
      brandDrag = null;
      if (!brandPointer.inside) brandField.classList.remove("is-playing");
    });

    state.element.addEventListener("click", () => {
      if (!state.moved) state.element.classList.toggle("is-lit");
    });
  });

  brandCore.addEventListener("click", () => {
    const bloom = brandField.classList.toggle("is-bloom");
    brandCore.setAttribute("aria-pressed", String(bloom));
    brandCore.querySelector("small").textContent = bloom ? "READY TO RUN" : "ACTIONBOOK";
  });

  const drawBrandFrame = () => {
    if (!brandBounds) sizeBrandField();
    const centerX = brandBounds.width / 2;
    const centerY = brandBounds.height / 2;
    brandContext.clearRect(0, 0, brandBounds.width, brandBounds.height);
    brandTrail.forEach((point) => { point.life *= .94; });
    while (brandTrail.length && brandTrail[0].life < .04) brandTrail.shift();

    if (brandTrail.length > 1) {
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
    }

    brandStates.forEach((state) => {
      const homeX = state.homeX * brandBounds.width;
      const homeY = state.homeY * brandBounds.height;
      const targetX = state === brandDrag
        ? brandPointer.x - state.offsetX
        : homeX + (brandPointer.inside ? (brandPointer.x - centerX) * state.follow : 0);
      const targetY = state === brandDrag
        ? brandPointer.y - state.offsetY
        : homeY + (brandPointer.inside ? (brandPointer.y - centerY) * state.follow : 0);

      if (brandReducedMotion) {
        state.x = targetX;
        state.y = targetY;
      } else {
        state.vx = (state.vx + (targetX - state.x) * (state === brandDrag ? .2 : .075)) * .76;
        state.vy = (state.vy + (targetY - state.y) * (state === brandDrag ? .2 : .075)) * .76;
        state.x += state.vx;
        state.y += state.vy;
      }

      state.element.style.transform = `translate3d(${state.x - state.element.offsetWidth / 2}px, ${state.y - state.element.offsetHeight / 2}px, 0) rotate(${state.rotation})`;
    });

    followerStates.forEach((state, index) => {
      const targetX = brandPointer.inside ? brandPointer.x : centerX;
      const targetY = brandPointer.inside ? brandPointer.y : centerY;
      state.x += (targetX - state.x) * (brandReducedMotion ? 1 : state.ease);
      state.y += (targetY - state.y) * (brandReducedMotion ? 1 : state.ease);
      state.element.style.transform = `translate3d(${state.x - 4 - index * 2}px, ${state.y - 4 - index * 2}px, 0)`;
    });

    requestAnimationFrame(drawBrandFrame);
  };

  new ResizeObserver(sizeBrandField).observe(brandField);
  sizeBrandField();
  requestAnimationFrame(drawBrandFrame);
})();
