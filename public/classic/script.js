// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Scroll reveal (ghosty blur — inspired by arlan.me/vault/ghosty-reveal)
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Nav: transparent on hero, solid after scroll
const nav = document.getElementById("nav");
const heroStage = document.querySelector(".hero-stage");

const syncNav = () => {
  if (!nav || !heroStage) return;
  const threshold = heroStage.offsetHeight - nav.offsetHeight - 40;
  nav.classList.toggle("is-solid", window.scrollY > threshold);
};

syncNav();
window.addEventListener("scroll", syncNav, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );
}

// Kinetic typography (arlan.me/vault/kinetic-typography)
document.querySelectorAll("[data-kinetic]").forEach((line) => {
  const text = line.textContent.trim();
  line.textContent = "";
  [...text].forEach((char, i) => {
    const span = document.createElement("span");
    span.dataset.char = char;
    span.textContent = char === " " ? "\u00a0" : char;
    span.style.transitionDelay = `${i * 18}ms`;
    line.appendChild(span);

    span.addEventListener("pointerenter", () => {
      span.style.transform = "translateY(-0.18em) rotate(-3deg) scale(1.08)";
    });
    span.addEventListener("pointerleave", () => {
      span.style.transform = "";
    });
  });
});

// Portrait parallax + chroma glow follow (vault chroma-glow)
const heroPortrait = document.getElementById("hero-portrait");
const portraitGlow = document.querySelector(".portrait-glow");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (heroPortrait && portraitGlow && !prefersReduced) {
  heroPortrait.addEventListener("pointermove", (e) => {
    const rect = heroPortrait.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    portraitGlow.style.transform = `translate(${x * 24}px, ${y * 18}px)`;
    const img = heroPortrait.querySelector(".portrait-frame img");
    if (img) {
      img.style.transform = `scale(1.02) rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
    }
  });

  heroPortrait.addEventListener("pointerleave", () => {
    portraitGlow.style.transform = "";
    const img = heroPortrait.querySelector(".portrait-frame img");
    if (img) img.style.transform = "scale(1.02)";
  });

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      const shift = Math.min(y * 0.06, 36);
      heroPortrait.style.setProperty("--scroll-y", `${shift}px`);
    },
    { passive: true }
  );
}

// Bloom canvas — happyrain.studio-inspired ambient motion
const bloomCanvas = document.getElementById("bloom-canvas");
if (bloomCanvas && !prefersReduced) {
  const ctx = bloomCanvas.getContext("2d");
  let w = 0;
  let h = 0;
  const blooms = [];

  const resize = () => {
    w = bloomCanvas.width = bloomCanvas.offsetWidth * devicePixelRatio;
    h = bloomCanvas.height = bloomCanvas.offsetHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };

  const seed = () => {
    blooms.length = 0;
    const count = Math.min(18, Math.floor(bloomCanvas.offsetWidth / 70));
    for (let i = 0; i < count; i++) {
      blooms.push({
        x: Math.random() * bloomCanvas.offsetWidth,
        y: Math.random() * bloomCanvas.offsetHeight,
        r: 40 + Math.random() * 90,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.2,
        hue: 150 + Math.random() * 80,
      });
    }
  };

  const draw = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, bloomCanvas.offsetWidth, bloomCanvas.offsetHeight);
    for (const b of blooms) {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -b.r) b.x = bloomCanvas.offsetWidth + b.r;
      if (b.x > bloomCanvas.offsetWidth + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = bloomCanvas.offsetHeight + b.r;
      if (b.y > bloomCanvas.offsetHeight + b.r) b.y = -b.r;

      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, `hsla(${b.hue}, 45%, 55%, 0.14)`);
      g.addColorStop(1, "hsla(0, 0%, 0%, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };

  resize();
  seed();
  draw();
  window.addEventListener("resize", () => {
    resize();
    seed();
  });
}

// ============ Beats player ============
const beats = [];
const cats = [
  { code: "Misc", genre: "Miscellaneous", dir: "misc", n: 1, ext: "wav" },
  { code: "Afro", genre: "Afrobeats", dir: "afro", n: 10 },
  { code: "Trap", genre: "Trap", dir: "trap", n: 3 },
  { code: "Ama", genre: "Amapiano", dir: "amapiano", n: 4 },
];
cats.forEach((c) => {
  const ext = c.ext || "mp3";
  for (let i = 1; i <= c.n; i++) {
    const nn = String(i).padStart(2, "0");
    beats.push({
      id: `${c.dir}-${nn}`,
      title: `${c.code} ${nn}`,
      genre: c.genre,
      src: `/beats/${c.dir}/${nn}.${ext}`,
    });
  }
});

const beatList = document.getElementById("beat-list");

if (beatList) {
  const audio = new Audio();
  let currentId = null;

  const fmt = (t) => {
    if (isNaN(t) || !isFinite(t)) return "--:--";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const rand = (i) => {
    const x = Math.sin(i * 99.13 + 17.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const waveBars = (seed) => {
    let s = "";
    for (let i = 0; i < 56; i++) {
      const h = 18 + Math.round(rand(seed * 13 + i) * 82);
      s += `<span style="height:${h}%"></span>`;
    }
    return s;
  };

  const playIcon = `<svg class="ic-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
  const pauseIcon = `<svg class="ic-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>`;

  beats.forEach((b, idx) => {
    const bars = waveBars(idx + 1);
    const row = document.createElement("div");
    row.className = "beat-row";
    row.dataset.genre = b.genre;
    row.dataset.id = b.id;
    row.innerHTML = `
      <button class="beat-play" type="button" aria-label="Play ${b.title}">${playIcon}${pauseIcon}</button>
      <div class="beat-main">
        <div class="beat-top">
          <span class="beat-title">${b.title}</span>
          <span class="beat-genre">${b.genre}</span>
        </div>
        <div class="beat-wave"><div class="wave-layer wave-base">${bars}</div><div class="wave-layer wave-played">${bars}</div></div>
      </div>
      <span class="beat-time">--:--</span>`;
    beatList.appendChild(row);

    const meta = new Audio();
    meta.preload = "metadata";
    meta.src = b.src;
    meta.addEventListener("loadedmetadata", () => {
      const t = row.querySelector(".beat-time");
      t.dataset.dur = meta.duration;
      if (currentId !== b.id) t.textContent = fmt(meta.duration);
    });
  });

  const rowFor = (id) => beatList.querySelector(`.beat-row[data-id="${id}"]`);

  const resetRow = (id) => {
    const row = rowFor(id);
    if (!row) return;
    row.classList.remove("is-active", "is-playing");
    row.querySelector(".beat-wave").style.setProperty("--progress", "0%");
    const t = row.querySelector(".beat-time");
    t.textContent = t.dataset.dur ? fmt(Number(t.dataset.dur)) : "--:--";
  };

  const playBeat = (id) => {
    const b = beats.find((x) => x.id === id);
    if (!b) return;
    if (currentId === id) {
      if (audio.paused) audio.play();
      else audio.pause();
      return;
    }
    if (currentId) resetRow(currentId);
    currentId = id;
    audio.src = b.src;
    audio.play();
    rowFor(id).classList.add("is-active");
  };

  beatList.addEventListener("click", (e) => {
    const row = e.target.closest(".beat-row");
    if (!row) return;
    const id = row.dataset.id;
    if (e.target.closest(".beat-wave")) {
      const wave = row.querySelector(".beat-wave");
      const rect = wave.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      if (currentId !== id) {
        playBeat(id);
        audio.addEventListener(
          "loadedmetadata",
          () => (audio.currentTime = ratio * audio.duration),
          { once: true }
        );
      } else if (audio.duration) {
        audio.currentTime = ratio * audio.duration;
      }
      return;
    }
    if (e.target.closest(".beat-play")) playBeat(id);
  });

  audio.addEventListener("timeupdate", () => {
    if (!currentId || !audio.duration) return;
    const row = rowFor(currentId);
    if (!row) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    row.querySelector(".beat-wave").style.setProperty("--progress", pct + "%");
    row.querySelector(".beat-time").textContent = fmt(audio.currentTime);
  });

  audio.addEventListener("play", () => {
    const row = rowFor(currentId);
    if (row) row.classList.add("is-playing");
  });
  audio.addEventListener("pause", () => {
    const row = rowFor(currentId);
    if (row) row.classList.remove("is-playing");
  });
  audio.addEventListener("ended", () => {
    if (currentId) resetRow(currentId);
    currentId = null;
  });

  const filters = document.getElementById("beat-filters");
  if (filters) {
    filters.addEventListener("click", (e) => {
      const btn = e.target.closest(".beat-filter");
      if (!btn) return;
      filters.querySelectorAll(".beat-filter").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const g = btn.dataset.genre;
      beatList.querySelectorAll(".beat-row").forEach((row) => {
        row.style.display = g === "all" || row.dataset.genre === g ? "" : "none";
      });
    });
  }
}
