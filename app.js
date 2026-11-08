(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* curtain */

  const curtain = document.createElement("div");
  curtain.className = "curtain";
  curtain.setAttribute("aria-hidden", "true");
  curtain.innerHTML = "<i></i><i></i><i></i><i></i><i></i><i></i>";
  document.body.appendChild(curtain);

  const openCurtain = () => {
    curtain.classList.add("in");
    setTimeout(() => curtain.remove(), 900);
  };

  if (reduced) curtain.remove();
  else requestAnimationFrame(() => requestAnimationFrame(openCurtain));

  const leave = (href) => {
    if (reduced) {
      location.href = href;
      return;
    }
    const c = document.createElement("div");
    c.className = "curtain out";
    c.setAttribute("aria-hidden", "true");
    c.innerHTML = "<i></i><i></i><i></i><i></i><i></i><i></i>";
    document.body.appendChild(c);
    setTimeout(() => { location.href = href; }, 520);
  };

  $$('a[href$=".html"], a[href="/"], a[href$="/"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      e.preventDefault();
      leave(href);
    });
  });

  /* boot */

  const boot = $(".boot");
  if (boot) {
    const seen = sessionStorage.getItem("anywere:boot");
    if (seen || reduced) {
      boot.remove();
    } else {
      document.body.classList.add("lock");
      const lines = $$(".boot-line", boot);
      const bar = $(".boot-bar i", boot);
      const pct = $(".boot-pct", boot);
      let i = 0;

      const finish = () => {
        sessionStorage.setItem("anywere:boot", "1");
        boot.classList.add("done");
        document.body.classList.remove("lock");
        setTimeout(() => boot.remove(), 700);
      };

      const step = () => {
        if (i >= lines.length) {
          if (bar) bar.style.transform = "scaleX(1)";
          if (pct) pct.textContent = "100%";
          setTimeout(finish, 460);
          return;
        }
        const line = lines[i];
        const label = line.querySelector("span");
        const state = line.querySelector("b, em");
        const full = label.textContent;
        label.textContent = "";
        line.classList.add("show");
        if (state) state.style.opacity = "0";
        let c = 0;
        const type = () => {
          label.textContent = full.slice(0, ++c);
          if (c < full.length) { setTimeout(type, 16 + Math.random() * 14); return; }
          if (state) state.style.opacity = "1";
          const p = Math.round(((i + 1) / lines.length) * 100);
          if (bar) bar.style.transform = `scaleX(${p / 100})`;
          if (pct) pct.textContent = p + "%";
          i++;
          setTimeout(step, 200 + Math.random() * 90);
        };
        type();
      };

      setTimeout(step, 260);

      const skip = $(".boot-skip", boot);
      if (skip) skip.addEventListener("click", finish);
      addEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.key === "Enter") finish();
      }, { once: true });
    }
  }

  /* rain */

  const canvas = $("#rain");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const chars = Array.from("アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789{}[]<>/\\|=+*#$%&");
    const layers = [
      { size: 13, speed: 0.42, alpha: 0.1, tail: 0.055 },
      { size: 17, speed: 0.72, alpha: 0.2, tail: 0.09 },
      { size: 22, speed: 1.1, alpha: 0.34, tail: 0.14 }
    ];
    let dpr = 1, w = 0, h = 0, raf = 0, last = 0, running = true;

    const build = () => {
      dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2);
      w = innerWidth;
      h = innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layers.forEach((l) => {
        const cols = Math.ceil(w / l.size);
        l.cols = cols;
        l.drops = Array.from({ length: cols }, () => Math.random() * h);
      });
    };

    const draw = (t) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (t - last < 33) return;
      last = t;

      ctx.fillStyle = "rgba(5, 8, 7, 0.11)";
      ctx.fillRect(0, 0, w, h);

      layers.forEach((l) => {
        ctx.font = `300 ${l.size}px "Spline Sans Mono", monospace`;
        for (let i = 0; i < l.cols; i++) {
          const ch = chars[(Math.random() * chars.length) | 0];
          const x = i * l.size;
          const y = l.drops[i];
          const bright = Math.random() > 0.988;
          ctx.fillStyle = bright
            ? `rgba(200, 255, 94, ${Math.min(1, l.alpha + 0.35)})`
            : `rgba(125, 245, 164, ${l.alpha})`;
          ctx.fillText(ch, x, y);
          if (y > h && Math.random() > 0.976) l.drops[i] = Math.random() * -160;
          l.drops[i] += l.size * l.speed * (0.7 + Math.random() * 0.6);
        }
      });
    };

    build();
    addEventListener("resize", build, { passive: true });
    raf = requestAnimationFrame(draw);
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    });
  }

  /* scramble */

  const title = $("[data-scramble]");
  if (title) {
    const target = title.dataset.scramble;
    const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$*";
    const spans = [...target].map((c) => {
      const s = document.createElement("span");
      s.textContent = c;
      return s;
    });
    title.textContent = "";
    spans.forEach((s) => title.appendChild(s));

    if (reduced) {
      spans.forEach((s, i) => { s.textContent = target[i]; });
    } else {
      let frame = 0;
      const total = 52;
      const tick = () => {
        frame++;
        spans.forEach((s, i) => {
          const settle = 0.35 + (i / spans.length) * 0.6;
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

  /* reveal */

  const pending = $$(".reveal, .reveal-soft");
  pending.forEach((el, i) => {
    if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (i % 4) * 80 + "ms");
  });

  const checkReveals = () => {
    for (let i = pending.length - 1; i >= 0; i--) {
      const el = pending[i];
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.94 && r.bottom > -40) {
        el.classList.add("in");
        pending.splice(i, 1);
      }
    }
  };

  /* terminal */

  const term = $("[data-terminal]");
  if (term) {
    const lines = $$(".ln", term);
    const tio = new IntersectionObserver((entries) => {
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
          if (el.classList.contains("caret")) { el.classList.add("show"); return; }
          const full = el.dataset.line;
          el.classList.add("show");
          el.textContent = "";
          let c = 0;
          const type = () => {
            el.textContent = full.slice(0, ++c);
            if (c < full.length) setTimeout(type, 14 + Math.random() * 16);
            else setTimeout(next, 150);
          };
          type();
        };
        next();
      });
    }, { threshold: 0.3 });
    tio.observe(term);
  }

  /* progress + parallax */

  const bar = $(".progress i");
  const hero = $(".hero");
  const titleEl = $(".title");
  let ticking = false;

  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    checkReveals();
    if (titleEl && hero && !reduced && y < innerHeight * 1.3) {
      titleEl.style.transform = `translate3d(0, ${y * 0.16}px, 0) scale(${1 - Math.min(0.06, y / (innerHeight * 12))})`;
      hero.style.opacity = String(Math.max(0, 1 - y / (innerHeight * 1.05)));
    }
    ticking = false;
  };

  addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  checkReveals();
  addEventListener("resize", checkReveals, { passive: true });

  /* cursor */

  if (!touch && !reduced) {
    const ring = $(".cursor");
    const dot = $(".cursor-dot");
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    let dx = cx, dy = cy;

    addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      ring.style.opacity = "1";
      dot.style.opacity = "1";
    }, { passive: true });

    const loop = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      dx += (tx - dx) * 0.42;
      dy += (ty - dy) * 0.42;
      ring.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();

    $$("a, button, summary, .index-row").forEach((el) => {
      el.addEventListener("pointerenter", () => document.body.classList.add("hovering"));
      el.addEventListener("pointerleave", () => document.body.classList.remove("hovering"));
    });
  }

  /* marquee */

  $$(".marquee").forEach((m) => {
    const track = $(".marquee-track", m);
    if (!track) return;
    const clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    m.appendChild(clone);
  });

  /* clock */

  const clock = $("[data-clock]");
  if (clock) {
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* magnetic */

  if (!touch && !reduced) {
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate3d(${mx * 0.16}px, ${my * 0.16}px, 0)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }
})();
