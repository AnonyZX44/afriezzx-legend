(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;

  const rain = document.getElementById("rain");
  const ctx = rain.getContext("2d", { alpha: true });
  const glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF{}[]<>/\\|=+*#$%&";
  const chars = Array.from(glyphs);
  const fontSize = () => (innerWidth < 700 ? 13 : 16);
  let cols = 0;
  let drops = [];
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let running = true;

  function size() {
    dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2);
    rain.width = Math.floor(innerWidth * dpr);
    rain.height = Math.floor(innerHeight * dpr);
    rain.style.width = innerWidth + "px";
    rain.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(innerWidth / fontSize());
    drops = Array.from({ length: cols }, () => Math.random() * innerHeight);
  }

  function draw(t) {
    if (!running) return;
    raf = requestAnimationFrame(draw);
    if (t - last < 33) return;
    last = t;

    const fs = fontSize();
    ctx.fillStyle = "rgba(6, 10, 8, 0.1)";
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.font = `300 ${fs}px "IBM Plex Mono", monospace`;

    for (let i = 0; i < cols; i++) {
      const ch = chars[(Math.random() * chars.length) | 0];
      const x = i * fs;
      const y = drops[i];
      ctx.fillStyle = Math.random() > 0.985 ? "rgba(182, 255, 200, 0.9)" : "rgba(126, 242, 160, 0.34)";
      ctx.fillText(ch, x, y);
      if (y > innerHeight && Math.random() > 0.975) drops[i] = Math.random() * -220;
      drops[i] += fs * (0.55 + Math.random() * 0.5);
    }
  }

  if (!reduced) {
    size();
    addEventListener("resize", size, { passive: true });
    raf = requestAnimationFrame(draw);
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    });
  }

  const title = document.querySelector("[data-scramble]");
  if (title) {
    const target = title.dataset.scramble;
    const pool = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789#%&@$*";
    const spans = Array.from(target).map((c) => {
      const s = document.createElement("span");
      s.textContent = c;
      title.appendChild(s);
      return s;
    });
    title.textContent = "";
    spans.forEach((s) => title.appendChild(s));

    if (reduced) {
      spans.forEach((s, i) => { s.textContent = target[i]; });
    } else {
      let frame = 0;
      const total = 46;
      const tick = () => {
        frame++;
        spans.forEach((s, i) => {
          const settle = (i / spans.length) * 0.6 + 0.4;
          if (frame / total > settle) {
            s.textContent = target[i];
            s.classList.remove("dud");
          } else {
            s.textContent = pool[(Math.random() * pool.length) | 0];
            s.classList.add("dud");
          }
        });
        if (frame < total) requestAnimationFrame(tick);
        else spans.forEach((s, i) => { s.textContent = target[i]; s.classList.remove("dud"); });
      };
      requestAnimationFrame(tick);
    }
  }

  const revealables = document.querySelectorAll(
    ".head, .body, .note, .timeline, .principles, .terminal, .quote blockquote, .bottom > *"
  );
  revealables.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.setProperty("--d", (i % 3) * 90 + "ms");
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );
  revealables.forEach((el) => io.observe(el));

  const term = document.querySelector("[data-terminal]");
  if (term) {
    const lines = Array.from(term.querySelectorAll(".ln"));
    const tio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          tio.unobserve(e.target);
          if (reduced) {
            lines.forEach((l) => { l.textContent = l.dataset.line; l.classList.add("show"); });
            return;
          }
          let idx = 0;
          const next = () => {
            if (idx >= lines.length) return;
            const el = lines[idx++];
            const full = el.dataset.line;
            if (el.classList.contains("caret")) {
              el.classList.add("show");
              return;
            }
            el.classList.add("show");
            el.textContent = "";
            let c = 0;
            const type = () => {
              el.textContent = full.slice(0, ++c);
              if (c < full.length) setTimeout(type, 16 + Math.random() * 18);
              else setTimeout(next, 190);
            };
            type();
          };
          next();
        });
      },
      { threshold: 0.35 }
    );
    tio.observe(term);
  }

  const bar = document.querySelector(".progress span");
  const hero = document.querySelector(".hero");
  const titleEl = document.querySelector(".title");
  let ticking = false;

  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (titleEl && hero && !reduced && y < innerHeight * 1.4) {
      titleEl.style.transform = `translate3d(0, ${y * 0.14}px, 0)`;
      hero.style.opacity = String(Math.max(0, 1 - y / (innerHeight * 1.05)));
    }
    ticking = false;
  }

  addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  onScroll();

  if (!touch && !reduced) {
    const cur = document.querySelector(".cursor");
    let cx = innerWidth / 2;
    let cy = innerHeight / 2;
    let tx = cx;
    let ty = cy;
    addEventListener(
      "pointermove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
        cur.style.opacity = "1";
      },
      { passive: true }
    );
    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }
})();
