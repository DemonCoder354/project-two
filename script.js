/* =========================================================
   Neonvault Group — page interactions
   ========================================================= */
(function () {
  "use strict";

  const S = window.ArcadeScenes;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  // Real game names are used only as references for the tributes.
  const GAMES = [
    { key: "maze", title: "Pac-Man", year: 1980, maker: "Namco", genre: "Maze chase", blurb: "Clear the maze, dodge four ghosts and grab a power pellet to turn the hunt around." },
    { key: "girders", title: "Donkey Kong", year: 1981, maker: "Nintendo", genre: "Platformer", blurb: "Climb the girders, leap the rolling barrels and reach the top before the big ape strikes again." },
    { key: "invaders", title: "Space Invaders", year: 1978, maker: "Taito", genre: "Shooter", blurb: "Rows of marching aliens creep closer with every step. Hold the line from behind your shields." },
    { key: "rocks", title: "Asteroids", year: 1979, maker: "Atari", genre: "Vector shooter", blurb: "Spin, thrust and blast drifting space rocks into ever smaller pieces in crisp vector light." },
    { key: "bricks", title: "Breakout", year: 1976, maker: "Atari", genre: "Ball and paddle", blurb: "One paddle, one ball and a rainbow wall that is begging to be knocked down brick by brick." },
    { key: "crossing", title: "Frogger", year: 1981, maker: "Konami", genre: "Action", blurb: "Hop across a busy highway and a log-filled river to bring every frog safely home." },
    { key: "squadron", title: "Galaga", year: 1981, maker: "Namco", genre: "Shooter", blurb: "Bug-like squadrons swoop and dive in formation. Keep firing and never stop moving." },
    { key: "centipede", title: "Centipede", year: 1981, maker: "Atari", genre: "Shooter", blurb: "A segmented bug weaves through a mushroom field. Every hit splits it into two." },
    { key: "tennis", title: "Pong", year: 1972, maker: "Atari", genre: "Sports", blurb: "Two paddles, one ball and the dashed line that started the whole arcade revolution." },
  ];
  const byKey = Object.fromEntries(GAMES.map((g) => [g.key, g]));

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const pick = (arr, not) => {
    const pool = arr.filter((x) => x !== not);
    return pool[Math.floor(Math.random() * pool.length)];
  };

  /* ---------- Header: scrolled / hide on scroll down ---------- */
  const header = $("#header");
  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    const menuOpen = document.body.classList.contains("menu-open");
    header.classList.toggle("hide", !menuOpen && y > 400 && y > lastY);
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Dropdowns ---------- */
  const drops = $$(".has-drop");
  const closeDrops = (except) => drops.forEach((d) => {
    if (d === except) return;
    d.classList.remove("open");
    $(".nav-btn", d).setAttribute("aria-expanded", "false");
  });
  const desktop = () => window.matchMedia("(min-width: 861px)").matches;
  drops.forEach((d) => {
    const btn = $(".nav-btn", d);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !d.classList.contains("open");
      closeDrops(d);
      d.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
    d.addEventListener("mouseenter", () => { if (desktop()) { closeDrops(d); d.classList.add("open"); btn.setAttribute("aria-expanded", "true"); } });
    d.addEventListener("mouseleave", () => { if (desktop()) closeDrops(); });
  });
  document.addEventListener("click", () => desktop() && closeDrops());

  /* ---------- Mobile menu + search ---------- */
  const burger = $("#burger"), nav = $("#nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
    if (!open) closeDrops();
  }
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); closeDrops(); } });
  const search = $("#search");
  $("#searchBtn").addEventListener("click", () => {
    search.classList.toggle("open");
    if (search.classList.contains("open")) setTimeout(() => $("input", search).focus(), 250);
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal, .split");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const d = +e.target.dataset.delay || 0;
        setTimeout(() => e.target.classList.add("in"), d);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else revealEls.forEach((el) => el.classList.add("in"));

  /* ---------- Count-up stats ---------- */
  const counters = $$("[data-count]");
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = 1800;
      (function tick(now) {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => countIO.observe(c));

  /* ---------- Hero: random game, swaps with a CRT glitch ---------- */
  const heroCanvas = $("#heroCanvas"), heroMedia = $(".hero-media"), nowPlaying = $("#nowPlaying");
  let heroKey = pick(S.keys);
  S.mount(heroCanvas, heroKey);
  const label = (g) => `${g.title} (${g.year})`;
  nowPlaying.textContent = label(byKey[heroKey]);
  function heroNext() {
    heroMedia.classList.add("glitch");
    setTimeout(() => {
      heroKey = pick(S.keys, heroKey);
      S.swap(heroCanvas, heroKey);
      nowPlaying.textContent = label(byKey[heroKey]);
      heroMedia.classList.remove("glitch");
    }, 320);
  }
  let heroTimer = setInterval(heroNext, 7000);
  $("#heroShuffle").addEventListener("click", () => {
    clearInterval(heroTimer);
    heroNext();
    heroTimer = setInterval(heroNext, 7000);
  });

  /* ---------- Games rail (random order each visit) ---------- */
  const rail = $("#rail");
  function renderRail() {
    $$("canvas", rail).forEach(S.unmount);
    rail.innerHTML = "";
    shuffle(GAMES).forEach((g, i) => {
      const el = document.createElement("article");
      el.className = "game out";
      el.innerHTML = `
        <div class="game-screen">
          <span class="game-year">${g.year}</span>
          <canvas class="pixel" role="img" aria-label="Pixel-art tribute to ${g.title}"></canvas>
        </div>
        <div class="game-body">
          <div class="game-meta"><span>${g.genre}</span><span>${g.maker}</span></div>
          <h3>${g.title}</h3>
          <p>${g.blurb}</p>
          <div class="game-foot">
            <a href="#games" class="play">Play now</a>
            <span class="game-credit">Pixel tribute,<br>drawn in code</span>
          </div>
        </div>`;
      rail.appendChild(el);
      S.mount($("canvas", el), g.key);
      setTimeout(() => el.classList.remove("out"), 60 + i * 70);
    });
    rail.scrollTo({ left: 0, behavior: "smooth" });
  }
  renderRail();
  $("#shuffleGames").addEventListener("click", renderRail);

  const step = () => { const c = $(".game", rail); return c ? c.getBoundingClientRect().width + 20 : 300; };
  $("#prevGame").addEventListener("click", () => rail.scrollBy({ left: -step(), behavior: "smooth" }));
  $("#nextGame").addEventListener("click", () => rail.scrollBy({ left: step(), behavior: "smooth" }));
  rail.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") rail.scrollBy({ left: step(), behavior: "smooth" });
    if (e.key === "ArrowLeft") rail.scrollBy({ left: -step(), behavior: "smooth" });
  });

  const bar = $("#railBar");
  function railProgress() {
    const max = rail.scrollWidth - rail.clientWidth;
    const vis = rail.clientWidth / rail.scrollWidth;
    bar.style.width = (vis * 100) + "%";
    bar.style.transform = `translateX(${max > 0 ? (rail.scrollLeft / max) * ((1 / vis) - 1) * 100 : 0}%)`;
  }
  rail.addEventListener("scroll", railProgress, { passive: true });
  window.addEventListener("resize", railProgress);
  setTimeout(railProgress, 100);

  // Drag to scroll with the mouse
  let down = false, sx = 0, sl = 0, moved = false;
  rail.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft;
  });
  window.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; rail.classList.add("dragging"); }
    rail.scrollLeft = sl - dx;
  });
  window.addEventListener("pointerup", () => { down = false; rail.classList.remove("dragging"); });
  rail.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);

  /* ---------- Random mosaic: one tile changes every few seconds ---------- */
  const mosaic = $("#mosaic");
  const TILE_COUNT = 7;
  let tiles = [];
  function renderMosaic() {
    $$("canvas", mosaic).forEach(S.unmount);
    mosaic.innerHTML = "";
    tiles = shuffle(S.keys).slice(0, TILE_COUNT).map((key) => {
      const fig = document.createElement("figure");
      fig.className = "tile";
      fig.innerHTML = `<canvas class="pixel" role="img"></canvas><figcaption></figcaption>`;
      mosaic.appendChild(fig);
      const t = { fig, canvas: $("canvas", fig), cap: $("figcaption", fig), key };
      setTile(t, key);
      S.mount(t.canvas, key);
      return t;
    });
  }
  function setTile(t, key) {
    t.key = key;
    const g = byKey[key];
    t.cap.textContent = label(g);
    t.canvas.setAttribute("aria-label", `Pixel-art tribute to ${g.title}`);
  }
  function swapRandomTile() {
    const used = new Set(tiles.map((t) => t.key));
    const free = S.keys.filter((k) => !used.has(k));
    if (!free.length) return;
    const t = tiles[Math.floor(Math.random() * tiles.length)];
    t.fig.classList.add("flip");
    setTimeout(() => {
      const k = free[Math.floor(Math.random() * free.length)];
      setTile(t, k);
      S.swap(t.canvas, k);
      t.fig.classList.remove("flip");
    }, 380);
  }
  renderMosaic();
  setInterval(swapRandomTile, 2600);
  $("#shuffleVault").addEventListener("click", renderMosaic);

  /* ---------- IR contact pixel avatar ---------- */
  const av = $("#avatar");
  av.width = 16; av.height = 16;
  const ac = av.getContext("2d");
  const face = [
    "................",
    ".....pppppp.....",
    "....pppppppp....",
    "...pppppppppp...",
    "...ppffffffpp...",
    "...pfkffffkfp...",
    "...pffffffffp...",
    "...pfffrrfffp...",
    "....ffffffff....",
    ".....ffffff.....",
    "......ffff......",
    "....gggggggg....",
    "...gggwggwggg...",
    "..gggggwwggggg..",
    "..gggggggggggg..",
    "..gggggggggggg..",
  ];
  const pal = { p: "#ff5fa2", f: "#f4c7a1", k: "#06160c", r: "#c43d5c", g: "#c8ff3d", w: "#f3efe4" };
  face.forEach((row, y) => [...row].forEach((ch, x) => { if (pal[ch]) { ac.fillStyle = pal[ch]; ac.fillRect(x, y, 1, 1); } }));
})();
