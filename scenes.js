/* =========================================================
   Neonvault — animated pixel-art "screenshots"
   Every scene is drawn in code at 192x128 and scaled up with
   crisp pixels. These are original tributes, not game assets.
   ========================================================= */
(function () {
  "use strict";

  const W = 192, H = 128;

  // Small seeded RNG so each scene looks the same between frames
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function rect(c, x, y, w, h, col) {
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), w, h);
  }

  // rows: array of strings, pal: char -> color ('.' = transparent)
  function sprite(c, rows, pal, x, y, s, flip) {
    s = s || 1;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let i = 0; i < row.length; i++) {
        const ch = flip ? row[row.length - 1 - i] : row[i];
        if (ch === "." || !pal[ch]) continue;
        c.fillStyle = pal[ch];
        c.fillRect(Math.round(x + i * s), Math.round(y + r * s), s, s);
      }
    }
  }

  function text(c, str, x, y, col, size, align) {
    c.fillStyle = col;
    c.font = (size || 6) + 'px "Press Start 2P", monospace';
    c.textAlign = align || "left";
    c.textBaseline = "top";
    c.fillText(str, x, y);
  }

  function clear(c, col) {
    c.fillStyle = col || "#000";
    c.fillRect(0, 0, W, H);
  }

  /* ---------- 1. Maze chase (Pac-Man tribute) ---------- */
  function maze() {
    const T = 8, cols = 24, rows = 16;
    const wall = (cx, cy) =>
      cx === 0 || cy === 0 || cx === cols - 1 || cy === rows - 1 ||
      (cy % 4 === 2 && cx % 6 !== 0 && cx % 6 !== 3) ||
      (cy % 4 === 0 && cx % 6 === 3 && cy !== 8);
    const ghosts = ["#ff2a2a", "#ffb8ff", "#00ffff", "#ffb852"];
    function ghost(c, x, y, col, t) {
      c.fillStyle = col;
      c.beginPath();
      c.arc(x, y - 1, 6, Math.PI, 0);
      c.lineTo(x + 6, y + 6);
      const wob = Math.floor(t * 8) % 2 ? 1 : 0;
      for (let i = 0; i < 4; i++) {
        c.lineTo(x + 6 - i * 3 - 1.5, y + 4 + ((i + wob) % 2) * 2);
        c.lineTo(x + 6 - (i + 1) * 3, y + 6);
      }
      c.closePath();
      c.fill();
      rect(c, x - 4, y - 3, 3, 4, "#fff");
      rect(c, x + 1, y - 3, 3, 4, "#fff");
      rect(c, x - 2, y - 1, 2, 2, "#2121de");
      rect(c, x + 3, y - 1, 2, 2, "#2121de");
    }
    return {
      draw(c, t) {
        clear(c);
        const span = W + 80;
        const px = ((t * 46) % span) - 20;
        const py = 7 * T + 4;
        for (let cy = 0; cy < rows; cy++) {
          for (let cx = 0; cx < cols; cx++) {
            const x = cx * T, y = cy * T;
            if (wall(cx, cy)) {
              rect(c, x, y, T, T, "#1919a6");
              rect(c, x + 1, y + 1, T - 2, T - 2, "#000");
              rect(c, x + 2, y + 2, T - 4, T - 4, "#2121de");
            } else {
              const eaten = cy === 7 && x + 4 < px && x + 4 > -20;
              if (!eaten) {
                const power = (cx === 1 || cx === cols - 2) && (cy === 1 || cy === rows - 2);
                if (power) {
                  if (Math.floor(t * 4) % 2) rect(c, x + 2, y + 2, 4, 4, "#ffb8ae");
                } else rect(c, x + 3, y + 3, 2, 2, "#ffb8ae");
              }
            }
          }
        }
        // chomper
        const mouth = (Math.abs(Math.sin(t * 12)) * 0.8) + 0.05;
        c.fillStyle = "#ffff00";
        c.beginPath();
        c.moveTo(px, py);
        c.arc(px, py, 6, mouth, Math.PI * 2 - mouth);
        c.closePath();
        c.fill();
        ghosts.forEach((g, i) => ghost(c, px - 22 - i * 16, py, g, t + i));
        text(c, "1UP", 10, 1, "#fff", 5);
      },
    };
  }

  /* ---------- 2. Girders & barrels (Donkey Kong tribute) ---------- */
  function girders() {
    const G = [
      { yl: 30, yr: 36 }, { yl: 64, yr: 58 }, { yl: 86, yr: 92 }, { yl: 120, yr: 114 },
    ];
    const X0 = 8, X1 = 184;
    const gy = (g, x) => g.yl + (g.yr - g.yl) * ((x - X0) / (X1 - X0));
    const ape = [
      "....bbbbbb......",
      "...bbbbbbbb.....",
      "..bbffbbffbb....",
      "..bbfwbbfwbb....",
      "..bbbffffbbb....",
      ".bbbfkkkkfbbb...",
      "bbbbbffffbbbbb..",
      "bbbbbbbbbbbbbb..",
      "bb.bbbbbbbb.bb..",
      "bb.bbffffbb.bb..",
      "ff.bbffffbb.ff..",
      "...bbbbbbbb.....",
      "...bbb..bbb.....",
      "..bbbb..bbbb....",
    ];
    const apePal = { b: "#a0522d", f: "#f4b183", w: "#fff", k: "#000" };
    const hero = [
      "..rrrr..", ".rrrrrr.", ".ssffs..", ".ffffff.", "..rrrr..",
      ".bbrrbb.", ".bbbbbb.", "..bb.bb.", ".ss..ss.",
    ];
    const heroPal = { r: "#ff2a2a", s: "#7a3b10", f: "#ffcc99", b: "#2a5bff" };
    const lady = ["..yy..", ".yyyy.", ".ffff.", "pppppp", ".pppp.", "pppppp", ".f..f."];
    const ladyPal = { y: "#ffd23f", f: "#ffcc99", p: "#ff6fb5" };
    const ladders = [[40, 0], [150, 0], [70, 1], [120, 2], [30, 2]];
    function barrel(c, x, y, t) {
      c.fillStyle = "#b5651d";
      c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "#5a2d0c"; c.lineWidth = 1;
      const a = t * 10;
      c.beginPath(); c.moveTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4);
      c.lineTo(x - Math.cos(a) * 4, y - Math.sin(a) * 4); c.stroke();
    }
    return {
      draw(c, t) {
        clear(c);
        // ladders
        ladders.forEach(([x, i]) => {
          const top = gy(G[i], x), bot = gy(G[i + 1], x);
          rect(c, x, top, 1, bot - top, "#00e5ff");
          rect(c, x + 6, top, 1, bot - top, "#00e5ff");
          for (let y = top + 3; y < bot; y += 4) rect(c, x, y, 7, 1, "#00e5ff");
        });
        // girders
        G.forEach((g) => {
          for (let x = X0; x < X1; x += 8) {
            const y = gy(g, x);
            rect(c, x, y, 8, 1, "#ff3355");
            rect(c, x, y + 4, 8, 1, "#ff3355");
            rect(c, x, y + 1, 1, 3, "#ff3355");
            rect(c, x + 4, y + 1, 1, 3, "#ff3355");
            rect(c, x + 2, y + 2, 1, 1, "#ff3355");
            rect(c, x + 6, y + 2, 1, 1, "#ff3355");
          }
        });
        // top platform + lady
        for (let x = 64; x < 104; x += 8) rect(c, x, 14, 8, 2, "#ff3355");
        sprite(c, lady, ladyPal, 80, 7, 1);
        if (Math.floor(t * 2) % 2) text(c, "HELP!", 88, 2, "#fff", 5);
        // ape (beats chest)
        const lift = Math.floor(t * 3) % 2;
        sprite(c, ape, apePal, 14, 30 - 28 - lift, 2);
        // barrels
        for (let k = 0; k < 4; k++) {
          const p = ((t * 0.32 + k * 0.92) % 4);
          const i = Math.floor(p), f = p - i;
          const g = G[i], right = i % 2 === 0;
          let x, y;
          if (f < 0.88) {
            const q = f / 0.88;
            x = right ? 44 + q * (X1 - 44) : X1 - q * (X1 - X0 - 4);
            y = gy(g, x) - 4;
          } else {
            const q = (f - 0.88) / 0.12;
            x = right ? X1 : X0 + 4;
            const ny = i < 3 ? gy(G[i + 1], x) - 4 : H + 8;
            y = gy(g, x) - 4 + (ny - (gy(g, x) - 4)) * q;
          }
          barrel(c, x, y, right ? t : -t);
        }
        // jumping hero
        const hx = 30 + ((t * 22) % 130);
        const hop = Math.max(0, Math.sin(t * 5)) * 8;
        sprite(c, hero, heroPal, hx, gy(G[3], hx) - 9 - hop, 1);
        text(c, "HI 007650", 120, 2, "#fff", 5);
      },
    };
  }

  /* ---------- 3. Alien invasion (Space Invaders tribute) ---------- */
  function invaders() {
    const A = [
      ["...xx...", "..xxxx..", ".xxxxxx.", "xx.xx.xx", "xxxxxxxx", "..x..x..", ".x.xx.x.", "x.x..x.x"],
      ["...xx...", "..xxxx..", ".xxxxxx.", "xx.xx.xx", "xxxxxxxx", ".x.xx.x.", "x......x", ".x....x."],
    ];
    const B = [
      ["..x.....x..", "...x...x...", "..xxxxxxx..", ".xx.xxx.xx.", "xxxxxxxxxxx", "x.xxxxxxx.x", "x.x.....x.x", "...xx.xx..."],
      ["..x.....x..", "x..x...x..x", "x.xxxxxxx.x", "xxx.xxx.xxx", "xxxxxxxxxxx", ".xxxxxxxxx.", "..x.....x..", ".x.......x."],
    ];
    const C = [
      ["....xxxx....", ".xxxxxxxxxx.", "xxxxxxxxxxxx", "xxx..xx..xxx", "xxxxxxxxxxxx", "...xx..xx...", "..xx.xx.xx..", "xx........xx"],
      ["....xxxx....", ".xxxxxxxxxx.", "xxxxxxxxxxxx", "xxx..xx..xxx", "xxxxxxxxxxxx", "..xxx..xxx..", ".xx..xx..xx.", "..xx....xx.."],
    ];
    const rowsDef = [[A, "#ff4fd8"], [B, "#4fe3ff"], [B, "#4fe3ff"], [C, "#7dff4f"], [C, "#7dff4f"]];
    const cannon = ["...x...", "..xxx..", ".xxxxx.", "xxxxxxx", "xxxxxxx"];
    return {
      draw(c, t) {
        clear(c, "#02020a");
        const step = Math.floor(t * 3);
        const frame = step % 2;
        const sweep = (step % 24);
        const dx = sweep < 12 ? sweep * 2 : (24 - sweep) * 2;
        rowsDef.forEach(([spr, col], r) => {
          for (let i = 0; i < 8; i++) {
            const w = spr[0][0].length;
            sprite(c, spr[frame], { x: col }, 20 + dx + i * 18 + (12 - w) / 2, 14 + r * 12, 1);
          }
        });
        // shields
        [28, 72, 116, 160].forEach((x) => {
          for (let yy = 0; yy < 8; yy++)
            for (let xx = 0; xx < 14; xx++) {
              if (yy > 5 && xx > 3 && xx < 10) continue;
              if ((yy === 0 && (xx < 2 || xx > 11))) continue;
              rect(c, x - 7 + xx, 98 + yy, 1, 1, "#36d36b");
            }
        });
        const cx = 96 + Math.sin(t * 0.9) * 70;
        sprite(c, cannon, { x: "#36d36b" }, cx - 3, 116, 1);
        const by = 112 - ((t * 140) % 100);
        rect(c, Math.round(96 + Math.sin((t - ((t * 140) % 100) / 140) * 0.9) * 70), by, 1, 4, "#fff");
        rect(c, 0, 123, W, 1, "#36d36b");
        text(c, "SCORE 01230", 4, 2, "#fff", 5);
        text(c, "LIVES 3", 188, 2, "#fff", 5, "right");
      },
    };
  }

  /* ---------- 4. Vector rocks (Asteroids tribute) ---------- */
  function rocks() {
    const r = rng(42);
    const list = [];
    for (let i = 0; i < 9; i++) {
      const size = [14, 9, 5][i % 3];
      const pts = [];
      const n = 9;
      for (let k = 0; k < n; k++) pts.push(size * (0.7 + r() * 0.4));
      list.push({ x: r() * W, y: r() * H, vx: (r() - 0.5) * 30, vy: (r() - 0.5) * 30, rot: r() * 6, vr: (r() - 0.5), pts });
    }
    const wrap = (v, m) => ((v % m) + m) % m;
    return {
      draw(c, t) {
        clear(c);
        c.strokeStyle = "#e9f6ff";
        c.lineWidth = 1;
        list.forEach((a) => {
          const x = wrap(a.x + a.vx * t, W + 30) - 15, y = wrap(a.y + a.vy * t, H + 30) - 15;
          c.beginPath();
          a.pts.forEach((rad, k) => {
            const ang = a.rot + a.vr * t + (k / a.pts.length) * Math.PI * 2;
            const px = x + Math.cos(ang) * rad, py = y + Math.sin(ang) * rad;
            k ? c.lineTo(px, py) : c.moveTo(px, py);
          });
          c.closePath();
          c.stroke();
        });
        // ship
        const ang = t * 1.4;
        const sx = 96, sy = 64;
        const p = (d, a) => [sx + Math.cos(ang + a) * d, sy + Math.sin(ang + a) * d];
        const n = p(8, 0), l = p(6, 2.5), rr = p(6, -2.5), bl = p(4, 2.8), br = p(4, -2.8);
        c.beginPath(); c.moveTo(...n); c.lineTo(...l); c.moveTo(...n); c.lineTo(...rr);
        c.moveTo(...bl); c.lineTo(...br); c.stroke();
        if (Math.floor(t * 12) % 2) {
          const f = p(9, Math.PI);
          c.beginPath(); c.moveTo(...bl); c.lineTo(...f); c.lineTo(...br); c.stroke();
        }
        for (let k = 0; k < 4; k++) {
          const life = (t * 2 + k / 4) % 1;
          const shotAng = ang - (life * 0.5);
          rect(c, sx + Math.cos(shotAng) * (10 + life * 90), sy + Math.sin(shotAng) * (10 + life * 90), 1, 1, "#fff");
        }
        c.strokeStyle = "#e9f6ff";
        text(c, "04210", 6, 3, "#e9f6ff", 6);
        text(c, "A A A", 6, 12, "#e9f6ff", 4);
      },
    };
  }

  /* ---------- 5. Brick breaker (Breakout tribute) ---------- */
  function bricks() {
    const cols = 12, rowsN = 6, bw = 16, bh = 5, top = 18;
    const colors = ["#ff3b3b", "#ff8a1e", "#ffd21e", "#3be36a", "#1ec8ff", "#8a5bff"];
    let alive, ball, last = 0;
    function reset() {
      alive = Array.from({ length: rowsN }, () => Array(cols).fill(true));
      ball = { x: 96, y: 100, vx: 70, vy: -80 };
    }
    reset();
    return {
      draw(c, t) {
        let dt = Math.min(0.05, Math.max(0, t - last));
        last = t;
        // physics in small steps
        for (let s = 0; s < 4; s++) {
          const d = dt / 4;
          ball.x += ball.vx * d; ball.y += ball.vy * d;
          if (ball.x < 2 || ball.x > W - 2) { ball.vx *= -1; ball.x = Math.max(2, Math.min(W - 2, ball.x)); }
          if (ball.y < 10) { ball.vy = Math.abs(ball.vy); }
          if (ball.y > 116 && ball.vy > 0) { ball.vy = -Math.abs(ball.vy); ball.vx += (Math.random() - 0.5) * 20; }
          const cx = Math.floor(ball.x / bw), cy = Math.floor((ball.y - top) / bh);
          if (cy >= 0 && cy < rowsN && cx >= 0 && cx < cols && alive[cy][cx]) {
            alive[cy][cx] = false; ball.vy *= -1;
          }
        }
        if (!alive.some((r) => r.some(Boolean))) reset();
        clear(c, "#05060f");
        alive.forEach((row, r) => row.forEach((on, i) => {
          if (on) rect(c, i * bw + 1, top + r * bh + 1, bw - 2, bh - 1, colors[r]);
        }));
        rect(c, ball.x - 1.5, ball.y - 1.5, 3, 3, "#fff");
        const px = Math.max(14, Math.min(W - 14, ball.x));
        rect(c, px - 14, 118, 28, 3, "#e9e9ff");
        rect(c, 0, 10, W, 1, "#555");
        text(c, "SCORE 0387", 4, 2, "#fff", 5);
        text(c, "BALL 2", 188, 2, "#fff", 5, "right");
      },
    };
  }

  /* ---------- 6. Road & river (Frogger tribute) ---------- */
  function crossing() {
    const lanes = [
      { y: 18, kind: "log", speed: 18, len: 40, gap: 70, col: "#8b5a2b" },
      { y: 28, kind: "log", speed: -26, len: 28, gap: 54, col: "#a0672f" },
      { y: 38, kind: "log", speed: 14, len: 52, gap: 80, col: "#8b5a2b" },
      { y: 66, kind: "car", speed: -40, len: 14, gap: 50, col: "#ff4757" },
      { y: 76, kind: "car", speed: 30, len: 12, gap: 46, col: "#ffd23f" },
      { y: 86, kind: "car", speed: -55, len: 24, gap: 90, col: "#e9e9ff" },
      { y: 96, kind: "car", speed: 24, len: 12, gap: 40, col: "#ff6fb5" },
    ];
    const frog = ["x.....x", ".xxxxx.", "xxkxkxx", ".xxxxx.", "xxxxxxx", "x.....x"];
    return {
      draw(c, t) {
        clear(c);
        rect(c, 0, 12, W, 36, "#0a1f7a");
        rect(c, 0, 4, W, 10, "#0d3b14");
        for (let x = 10; x < W; x += 38) rect(c, x, 5, 18, 8, "#000");
        rect(c, 0, 48, W, 10, "#5b2a86");
        rect(c, 0, 104, W, 12, "#5b2a86");
        lanes.forEach((l) => {
          const per = l.len + l.gap;
          const off = ((t * l.speed) % per + per) % per;
          for (let x = -per + off; x < W + per; x += per) {
            if (l.kind === "log") {
              rect(c, x, l.y - 3, l.len, 7, l.col);
              rect(c, x + 2, l.y - 1, l.len - 4, 1, "#5a3510");
            } else {
              rect(c, x, l.y - 3, l.len, 6, l.col);
              rect(c, x + 2, l.y - 4, l.len - 4, 2, "#222");
              rect(c, x + 1, l.y + 3, 3, 2, "#111");
              rect(c, x + l.len - 4, l.y + 3, 3, 2, "#111");
            }
          }
        });
        // frog hops upward then restarts
        const cycle = (t * 2) % 12;
        const step = Math.floor(cycle);
        const fy = 108 - Math.min(step, 10) * 9.4;
        const fx = 92 + (step >= 8 ? (t * 18) % 30 - 15 : 0);
        sprite(c, frog, { x: "#46ff6b", k: "#ff2a2a" }, fx, fy, 1);
        text(c, "TIME", 4, 119, "#ffd23f", 5);
        rect(c, 30, 120, 120 - (t * 6) % 120, 4, "#46ff6b");
      },
    };
  }

  /* ---------- 7. Swooping squadron (Galaga tribute) ---------- */
  function squadron() {
    const r = rng(7);
    const stars = Array.from({ length: 50 }, () => ({ x: r() * W, y: r() * H, s: 10 + r() * 40, c: ["#fff", "#ff6", "#6ff", "#f6f"][Math.floor(r() * 4)] }));
    const bee = ["x.....x", ".xyyyx.", "xyybyyx", ".xyyyx.", "x.x.x.x"];
    const boss = ["..ggg..", ".gpgpg.", "ggggggg", "g.ggg.g", "g..g..g"];
    const ship = ["...w...", "...w...", "..wrw..", ".wwwww.", "wwrwrww", "w.w.w.w"];
    return {
      draw(c, t) {
        clear(c);
        stars.forEach((s) => {
          if ((Math.floor(t * 3 + s.x) % 3)) rect(c, s.x, (s.y + t * s.s) % H, 1, 1, s.c);
        });
        const flap = Math.floor(t * 4) % 2;
        for (let i = 0; i < 4; i++) sprite(c, boss, { g: "#3bdc5b", p: "#b04bff" }, 60 + i * 20 + Math.sin(t) * 4, 14 + flap, 1);
        for (let row = 0; row < 2; row++)
          for (let i = 0; i < 8; i++)
            sprite(c, bee, { x: "#2a6bff", y: "#ffd21e", b: "#ff2a2a" }, 30 + i * 18 + Math.sin(t) * 4, 26 + row * 10 - flap, 1);
        // diving enemy
        const d = (t * 0.5) % 1;
        sprite(c, bee, { x: "#2a6bff", y: "#ffd21e", b: "#ff2a2a" }, 96 + Math.sin(d * 9) * 60, 40 + d * 90, 1);
        const sx = 96 + Math.sin(t * 1.3) * 60;
        sprite(c, ship, { w: "#f2f2f2", r: "#ff2a2a" }, sx - 3, 112, 1);
        for (let k = 0; k < 3; k++) {
          const yy = 108 - (((t * 120) + k * 35) % 105);
          rect(c, sx, yy, 1, 3, "#ffd21e");
        }
        text(c, "1UP 20000", 4, 2, "#ff2a2a", 5);
        text(c, "STAGE 4", 188, 2, "#4fe3ff", 5, "right");
      },
    };
  }

  /* ---------- 8. Garden bug (Centipede tribute) ---------- */
  function centipede() {
    const r = rng(19);
    const shrooms = Array.from({ length: 34 }, () => ({ x: Math.floor(r() * 23) * 8 + 4, y: Math.floor(r() * 12) * 8 + 12 }));
    const mush = [".xxxx.", "xxxxxx", "xxyyxx", "..yy..", "..yy.."];
    const wand = [".x.", "xxx", "xxx"];
    return {
      draw(c, t) {
        clear(c);
        shrooms.forEach((m) => sprite(c, mush, { x: "#ff4fd8", y: "#39d9ff" }, m.x, m.y, 1));
        // centipede snakes across rows
        for (let i = 0; i < 11; i++) {
          const p = (t * 40 - i * 7);
          const rowLen = W - 12;
          const row = Math.floor(((p % (rowLen * 12)) + rowLen * 12) % (rowLen * 12) / rowLen);
          const along = ((p % rowLen) + rowLen) % rowLen;
          const x = row % 2 ? W - 8 - along : 6 + along;
          const y = 12 + row * 8;
          rect(c, x - 3, y - 3, 7, 7, i === 0 ? "#ff2a2a" : "#3bdc5b");
          rect(c, x - 2, y - 2, 5, 5, i === 0 ? "#ffd21e" : "#c9ff5b");
          rect(c, x - 4, y + (Math.floor(t * 10 + i) % 2 ? -2 : 2), 1, 1, "#fff");
          rect(c, x + 4, y + (Math.floor(t * 10 + i) % 2 ? 2 : -2), 1, 1, "#fff");
        }
        const wx = 96 + Math.sin(t * 1.7) * 50;
        sprite(c, wand, { x: "#ffd21e" }, wx - 1, 116, 2);
        rect(c, wx, 112 - ((t * 160) % 100), 1, 4, "#fff");
        text(c, "12250", 6, 2, "#ff4fd8", 5);
      },
    };
  }

  /* ---------- 9. Table tennis (Pong tribute) ---------- */
  function tennis() {
    return {
      draw(c, t) {
        clear(c);
        for (let y = 2; y < H; y += 8) rect(c, 95, y, 2, 4, "#fff");
        const bx = 8 + Math.abs(((t * 90) % 352) - 176);
        const by = 6 + Math.abs(((t * 63) % 232) - 116);
        rect(c, bx - 2, by - 2, 4, 4, "#fff");
        const lp = Math.max(14, Math.min(H - 14, by + Math.sin(t * 2) * 6));
        const rp = Math.max(14, Math.min(H - 14, by - Math.sin(t * 2.3) * 6));
        rect(c, 6, lp - 11, 3, 22, "#fff");
        rect(c, W - 9, rp - 11, 3, 22, "#fff");
        text(c, "0" + (Math.floor(t / 7) % 9 + 1), 70, 8, "#fff", 12, "center");
        text(c, "0" + (Math.floor(t / 9) % 9), 122, 8, "#fff", 12, "center");
      },
    };
  }

  const SCENES = { maze, girders, invaders, rocks, bricks, crossing, squadron, centipede, tennis };

  /* ---------- Runner: one RAF loop for every visible canvas ---------- */
  const active = new Set();
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mount(canvas, key) {
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const entry = { canvas, ctx, scene: SCENES[key](), key, visible: true, start: performance.now() - Math.random() * 8000 };
    canvas.__scene = entry;
    entry.scene.draw(ctx, (performance.now() - entry.start) / 1000);
    active.add(entry);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => (entry.visible = e.isIntersecting)));
      io.observe(canvas);
      entry.io = io;
    }
    return entry;
  }

  function swap(canvas, key) {
    const e = canvas.__scene;
    if (!e) return mount(canvas, key);
    e.key = key;
    e.scene = SCENES[key]();
    e.start = performance.now();
    e.scene.draw(e.ctx, 0);
    return e;
  }

  function unmount(canvas) {
    const e = canvas.__scene;
    if (!e) return;
    if (e.io) e.io.disconnect();
    active.delete(e);
    canvas.__scene = null;
  }

  function loop(now) {
    active.forEach((e) => {
      if (e.visible && e.canvas.isConnected) e.scene.draw(e.ctx, (now - e.start) / 1000);
    });
    requestAnimationFrame(loop);
  }
  if (!reduce) requestAnimationFrame(loop);

  window.ArcadeScenes = { keys: Object.keys(SCENES), mount, swap, unmount, W, H };
})();
