"use strict";

document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  toggle.addEventListener("click", () => {
    const willOpen = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(willOpen));
    nav.classList.toggle("is-open", willOpen);
    document.body.classList.toggle("menu-open", willOpen);
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
      toggle.focus();
    }
  });
}

function setupReveal() {
  const items = [...document.querySelectorAll(".reveal")];
  if (!items.length || prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
    observer.observe(item);
  });
}

function setupCounters() {
  const counters = [...document.querySelectorAll(".counter")];
  if (!counters.length) return;

  counters.forEach((element) => {
    element.textContent = Number(element.dataset.target).toLocaleString("pt-BR");
  });
}

function setupCarousel() {
  const track = document.querySelector("[data-carousel]");
  const previous = document.querySelector("[data-carousel-prev]");
  const next = document.querySelector("[data-carousel-next]");
  const count = document.querySelector(".carousel-count");
  const progress = document.querySelector("[data-carousel-progress]");
  const filters = [...document.querySelectorAll("[data-filter]")];
  if (!track || !previous || !next || !count || !progress) return;

  const allCards = [...track.querySelectorAll(".plan-card")];
  let visibleCards = [...allCards];
  let currentIndex = 0;
  let scrollFrame = 0;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;
  let dragging = false;

  const format = (number) => String(number).padStart(2, "0");
  const cardStep = () => {
    if (!visibleCards.length) return track.clientWidth;
    const styles = window.getComputedStyle(track);
    return visibleCards[0].getBoundingClientRect().width + Number.parseFloat(styles.columnGap || styles.gap || "0");
  };

  const updateStatus = () => {
    if (!visibleCards.length) return;
    currentIndex = Math.max(0, Math.min(visibleCards.length - 1, Math.round(track.scrollLeft / cardStep())));
    count.textContent = `${format(currentIndex + 1)} / ${format(visibleCards.length)}`;
    progress.style.width = `${((currentIndex + 1) / visibleCards.length) * 100}%`;
    previous.disabled = currentIndex === 0;
    next.disabled = currentIndex >= visibleCards.length - 1;
  };

  const scrollToIndex = (index) => {
    const safeIndex = Math.max(0, Math.min(visibleCards.length - 1, index));
    track.scrollTo({ left: safeIndex * cardStep(), behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  previous.addEventListener("click", () => scrollToIndex(currentIndex - 1));
  next.addEventListener("click", () => scrollToIndex(currentIndex + 1));
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateStatus);
  }, { passive: true });

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;
      filters.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      allCards.forEach((card) => {
        card.hidden = selected !== "todos" && card.dataset.category !== selected;
      });
      visibleCards = allCards.filter((card) => !card.hidden);
      track.scrollLeft = 0;
      currentIndex = 0;
      updateStatus();
    });
  });

  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    dragging = true;
    dragStartX = event.clientX;
    dragStartScroll = track.scrollLeft;
    lastX = event.clientX;
    lastTime = performance.now();
    velocity = 0;
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const now = performance.now();
    const elapsed = Math.max(now - lastTime, 1);
    velocity = (lastX - event.clientX) / elapsed;
    track.scrollLeft = dragStartScroll + dragStartX - event.clientX;
    lastX = event.clientX;
    lastTime = now;
  });

  const finishDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);

    if (prefersReducedMotion) {
      scrollToIndex(Math.round(track.scrollLeft / cardStep()));
      return;
    }

    const glide = () => {
      velocity *= 0.92;
      track.scrollLeft += velocity * 16;
      if (Math.abs(velocity) > 0.08) {
        requestAnimationFrame(glide);
      } else {
        scrollToIndex(Math.round(track.scrollLeft / cardStep()));
      }
    };
    requestAnimationFrame(glide);
  };

  track.addEventListener("pointerup", finishDrag);
  track.addEventListener("pointercancel", finishDrag);
  window.addEventListener("resize", updateStatus, { passive: true });
  updateStatus();
}

function setupFaq() {
  const items = [...document.querySelectorAll(".faq details")];
  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
}

function setupMobileStickyCta() {
  const cta = document.querySelector(".mobile-sticky-cta");
  const finalCta = document.querySelector("#contato");
  const query = window.matchMedia("(max-width: 980px)");
  if (!cta || !finalCta) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    const finalRect = finalCta.getBoundingClientRect();
    const nearFinalCta = finalRect.top < window.innerHeight * 0.72;
    const afterHeroStart = window.scrollY > 420;
    const menuOpen = document.body.classList.contains("menu-open");
    cta.classList.toggle("is-visible", query.matches && afterHeroStart && !nearFinalCta && !menuOpen);
  };

  const requestUpdate = () => {
    if (frame) return;
    frame = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  query.addEventListener?.("change", update);
  update();
}

setupMenu();
setupReveal();
setupCounters();
setupCarousel();
setupFaq();
setupMobileStickyCta();
