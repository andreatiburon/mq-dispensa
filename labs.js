/* Dispensa MQ: funzioni comuni e laboratori. Ogni laboratorio è un <div data-lab="nome">. */
(function () {
  "use strict";
  var RIDOTTO = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LOCALE = location.protocol === "file:";
  var LIBRI = {
    sh: { nome: "Shankar", file: "R. Shankar-Principles of Quantum Mechanics  -Springer (1995).pdf" },
    sa: { nome: "Sakurai", file: "J. J. Sakurai-Meccanica Quantistica Moderna-Zanichelli (1994).pdf" },
    pi: { nome: "Picasso", file: "(UNITEXT for Physics) Luigi E. Picasso-Lectures in Quantum Mechanics_ A Two-Term Course-Springer International Publishing (2016).pdf" },
    we: { nome: "Weinberg", file: "Steven Weinberg-Lectures on Quantum Mechanics-Cambridge University Press (2015).pdf" },
    no: { nome: "Norsen", file: "Foundations of Quantum Mechanics (Travis Norsen) (z-library.sk, 1lib.sk, z-lib.sk).pdf" },
    ba: { nome: "Ballentine", file: "Quantum Mechanics A Modern Development (Leslie E. Ballentine) (z-library.sk, 1lib.sk, z-lib.sk).pdf" },
    be: { nome: "Bell", file: "Speakable and Unspeakable in Quantum Mechanics Collected Papers on Quantum Philosophy (J. S. Bell) (z-library.sk, 1lib.sk, z-lib.sk).pdf" }
  };
  var C = {}, RIDISEGNA = [], MONO = "Spline Sans Mono, ui-monospace, monospace";
  /* colori dai token del foglio di stile, così i laboratori seguono il tema chiaro o scuro */
  function leggi() {
    var cs = getComputedStyle(document.documentElement), v = function (n) { return cs.getPropertyValue(n).trim(); };
    C = { amber: v("--laser"), teal: v("--hg"), rose: v("--na-ink"), ink: v("--ink"), muted: v("--ink-2"), line: v("--rule"), bg: v("--paper") };
  }
  function ridisegna(fn) { RIDISEGNA.push(fn); }
  function temaCambiato() { leggi(); filetti(); RIDISEGNA.forEach(function (fn) { try { fn(); } catch (e) {} }); }
  function alfa(col, a) { var m = /^#([0-9a-f]{6})$/i.exec(col); if (!m) return col; var n = parseInt(m[1], 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; }
  function f3(x) { return (Math.abs(x) < 5e-4 ? 0 : x).toFixed(3); }

  /* ---------- riquadri «Nei libri»: link alla pagina del PDF nella copia locale ---------- */
  function libri() {
    document.querySelectorAll(".book[data-l]").forEach(function (b) {
      var L = LIBRI[b.dataset.l], p = b.dataset.p, tag = b.querySelector(".tag");
      if (!L || !tag) return;
      var el;
      if (LOCALE) { el = document.createElement("a"); el.href = "file:///Volumes/T7/claude/raw/libri/" + encodeURIComponent(L.file) + "#page=" + p; el.target = "_blank"; el.rel = "noopener"; el.textContent = "apri p. " + p; }
      else { el = document.createElement("span"); el.className = "pg"; el.title = "Il PDF si apre dalla copia della dispensa sul T7"; el.textContent = "PDF p. " + p; }
      tag.appendChild(el);
    });
  }

  /* ---------- indice laterale con evidenziazione ---------- */
  function indice() {
    var art = document.querySelector("article"), toc = document.querySelector(".toc ol"), tm = document.querySelector(".toc-mobile ol");
    if (!art || !toc) return;
    var hs = art.querySelectorAll("h2[id]"), links = [];
    hs.forEach(function (h) {
      var t = h.getAttribute("data-toc") || h.textContent.replace(/^\s*\d+\s*/, ""), nn = h.querySelector(".n");
      [toc, tm].forEach(function (ol) { if (!ol) return; var li = document.createElement("li"), a = document.createElement("a"); a.href = "#" + h.id; a.textContent = t; a.setAttribute("data-n", nn ? nn.textContent.trim() : "·"); li.appendChild(a); ol.appendChild(li); if (ol === toc) links.push(a); });
    });
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); }); } });
    }, { rootMargin: "-80px 0px -70% 0px" });
    hs.forEach(function (h) { io.observe(h); });
  }

  /* ---------- canvas nitido ---------- */
  function fit(cv, h) {
    var dpr = window.devicePixelRatio || 1, w = cv.clientWidth || cv.parentNode.clientWidth;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + "px";
    var g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g: g, w: w, h: h };
  }

  /* ---------- retini: motivo di punti a 45° per riempire aree, e striscia sfumata per i filetti ---------- */
  function retino(g, col, passo, r) {
    var dpr = window.devicePixelRatio || 1, c = document.createElement("canvas"), q = passo * dpr;
    c.width = c.height = Math.round(q * 2); var x = c.getContext("2d"); x.fillStyle = col;
    [[0, 0], [q, q], [q * 2, 0], [0, q * 2], [q * 2, q * 2]].forEach(function (p) { x.beginPath(); x.arc(p[0], p[1], r * dpr, 0, 6.2832); x.fill(); });
    var pat = g.createPattern(c, "repeat"); if (pat.setTransform && window.DOMMatrix) pat.setTransform(new DOMMatrix().scale(1 / dpr)); return pat;
  }
  function filetti() {
    try {
      var dpr = 2, w = 1200, h = 12, c = document.createElement("canvas"); c.width = w * dpr; c.height = h * dpr;
      var x = c.getContext("2d"); x.scale(dpr, dpr); x.fillStyle = C.ink;
      for (var j = 0; j < 3; j++) for (var i = 0; i * 6 < w; i++) {
        var px = i * 6 + (j % 2 ? 3 : 0), py = 2 + j * 3.5, f = Math.max(0, 1 - px / (w * 0.55)), r = 1.9 * Math.sqrt(f) * (j === 1 ? 1 : 0.8);
        if (r > 0.25) { x.beginPath(); x.arc(px, py, r, 0, 6.2832); x.fill(); }
      }
      document.documentElement.style.setProperty("--ht-rule", "url(" + c.toDataURL() + ")");
    } catch (e) {}
  }

  /* ---------- 1. HERO: gli elettroni arrivano uno alla volta e si accumulano in una mezzatinta ---------- */
  /* Retino a 45° (l'angolo del nero in tipografia): ogni arrivo cade nella cella più vicina e il raggio del punto
     cresce con la radice del conteggio, così l'area d'inchiostro è proporzionale al numero di arrivi, cioè a |ψ|². */
  function hero(el) {
    el.innerHTML = '<canvas aria-label="Gli elettroni arrivano uno alla volta e, accumulandosi, formano la mezzatinta delle frange d\'interferenza"></canvas>';
    var cv = el.querySelector("canvas"), H = el.dataset.h ? +el.dataset.h : 360, S, raf = 0, n = 0, celle, maxc, recenti, sosta = 0;
    var P = 7, ux = Math.SQRT1_2, uy = Math.SQRT1_2, FINE = 26000;
    function Ix(u) { var b = 3.2 * u, a = 14 * u; var env = Math.abs(b) < 1e-6 ? 1 : Math.pow(Math.sin(b) / b, 2); return env * Math.pow(Math.cos(a), 2); }
    var cdf = [], M = 2000, acc = 0;
    for (var i = 0; i < M; i++) { var u = -1 + 2 * i / (M - 1); acc += Ix(u); cdf.push(acc); }
    function sx() { var t = Math.random() * acc, lo = 0, hi = M - 1; while (lo < hi) { var mid = (lo + hi) >> 1; if (cdf[mid] < t) lo = mid + 1; else hi = mid; } return -1 + 2 * lo / (M - 1) + (Math.random() - .5) * (2 / M); }
    function sy() { for (;;) { var v = Math.random() * 2 - 1; if (Math.random() < Math.exp(-Math.pow(v / 0.6, 4))) return v; } }
    function reset() { S = fit(cv, H); celle = new Map(); maxc = 1; n = 0; recenti = []; }
    function arriva() {
      var x = (sx() + 1) / 2 * S.w, y = S.h * 0.47 + sy() * S.h * 0.44;
      var a = Math.round((x * ux + y * uy) / P), b = Math.round((-x * uy + y * ux) / P), k = a + "," + b, c = (celle.get(k) || 0) + 1;
      celle.set(k, c); if (c > maxc) maxc = c; n++;
      recenti.push([x, y]); if (recenti.length > 36) recenti.shift();
    }
    function disegna() {
      var g = S.g, R = P * 0.66, ref = Math.max(1, maxc * 0.75), path = new Path2D();
      g.clearRect(0, 0, S.w, S.h);
      celle.forEach(function (c, k) {
        var i = k.indexOf(","), a = +k.slice(0, i), b = +k.slice(i + 1), X = (a * ux - b * uy) * P, Y = (a * uy + b * ux) * P, r = R * Math.sqrt(Math.min(1, c / ref));
        if (r < 0.3) return; path.moveTo(X + r, Y); path.arc(X, Y, r, 0, 6.2832);
      });
      g.fillStyle = C.ink; g.fill(path);
      g.fillStyle = C.amber;
      recenti.forEach(function (p, j) { g.globalAlpha = (j + 1) / recenti.length; g.beginPath(); g.arc(p[0], p[1], 2.4, 0, 6.2832); g.fill(); });
      g.globalAlpha = 1;
      var t = n.toLocaleString("it-IT") + (n === 1 ? " elettrone" : " elettroni"); g.font = "12px " + MONO;
      var tw = g.measureText(t).width; g.fillStyle = C.bg; g.fillRect(8, S.h - 27, tw + 14, 19); g.fillStyle = C.muted; g.fillText(t, 15, S.h - 13);
    }
    function frame(ts) {
      raf = requestAnimationFrame(frame);
      if (n >= FINE) { if (!sosta) sosta = ts; if (ts - sosta > 4500) { sosta = 0; reset(); } return; }
      var k = n < 60 ? (Math.random() < 0.25 ? 1 : 0) : n < 600 ? 3 : n < 4000 ? 14 : 45;
      for (var i = 0; i < k; i++) arriva();
      if (k) disegna();
    }
    function riparti() { cancelAnimationFrame(raf); sosta = 0; reset(); if (RIDOTTO) { for (var j = 0; j < FINE; j++) arriva(); disegna(); } else raf = requestAnimationFrame(frame); }
    riparti(); ridisegna(riparti);
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(riparti, 150); });
  }

  /* ---------- SVG di base per i laboratori a piano H-V ---------- */
  function piano(svg) {
    var cx = 160, cy = 160, R = 120;
    return {
      P: function (a, r) { return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; },
      R: R,
      line: function (a, r, col, w, dash, through, head) { var p1 = through ? this.P(a + Math.PI, r) : [cx, cy], p2 = this.P(a, r); return '<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" stroke="' + col + '" stroke-width="' + w + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + (head ? ' marker-end="url(#' + head + ')"' : '') + '/>'; },
      seg: function (p, q, col, w, dash) { return '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke="' + col + '" stroke-width="' + w + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>'; },
      txt: function (a, r, s, col) { var p = this.P(a, r); return '<text x="' + p[0] + '" y="' + p[1] + '" text-anchor="middle" dominant-baseline="central" font-size="14" font-family="' + MONO + '" fill="' + col + '">' + s + '</text>'; },
      defs: function () { return '<defs><marker id="h-ink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L9 5L1 9z" fill="' + C.ink + '"/></marker><marker id="h-amb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L9 5L1 9z" fill="' + C.amber + '"/></marker><marker id="h-teal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L9 5L1 9z" fill="' + C.teal + '"/></marker><marker id="h-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L9 5L1 9z" fill="' + C.rose + '"/></marker></defs>'; },
      assi: function () { return this.line(0, this.R + 22, C.line, 1.3, null, true) + this.line(Math.PI / 2, this.R + 22, C.line, 1.3, null, true) + this.txt(0, this.R + 34, "H", C.muted) + this.txt(Math.PI / 2, this.R + 34, "V", C.muted); }
    };
  }
  function slider(id, label, min, max, val, unit) { return '<div class="ctl"><label for="' + id + '">' + label + ' <output id="' + id + '-o">' + val + unit + '</output></label><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" value="' + val + '"></div>'; }

  /* ---------- 2. Il polarizzatore come proiettore ---------- */
  function malus(el) {
    var u = el.id || "malus";
    el.innerHTML = '<div class="cols"><svg viewBox="0 0 320 320" role="img" aria-label="Lo stato, l\'asse del polarizzatore e la proiezione"></svg><div>' + slider(u + "a", "Polarizzazione dello stato α", 0, 180, 60, "°") + slider(u + "t", "Asse del polarizzatore θ", 0, 180, 20, "°") + '<div class="num"></div></div></div>';
    var svg = el.querySelector("svg"), A = el.querySelector("#" + u + "a"), T = el.querySelector("#" + u + "t"), num = el.querySelector(".num"), pl = piano(svg);
    function draw() {
      var d = Math.PI / 180, a = A.value * d, t = T.value * d, amp = Math.cos(a - t);
      el.querySelector("#" + u + "a-o").textContent = A.value + "°"; el.querySelector("#" + u + "t-o").textContent = T.value + "°";
      var s = pl.defs() + pl.assi() + pl.line(t, pl.R + 22, C.teal, 3, "10 6", true) + pl.txt(t, pl.R + 36, "θ", C.teal);
      s += pl.seg(pl.P(a, pl.R), pl.P(t, pl.R * amp), C.muted, 1.2, "3 4");
      s += pl.line(a, pl.R, C.ink, 2.6, null, false, "h-ink") + pl.txt(a, pl.R + 16, "ψ", C.ink);
      if (Math.abs(amp) > 0.02) s += pl.line(amp >= 0 ? t : t + Math.PI, pl.R * Math.abs(amp), C.amber, 4, null, false, "h-amb");
      svg.innerHTML = s;
      num.innerHTML = 'ampiezza ⟨θ|ψ⟩ = cos(α − θ) = <b>' + f3(amp) + '</b><br>probabilità di passare = <b>' + f3(amp * amp) + '</b><br><b>freccia rossa</b> = P<sub>θ</sub>|ψ⟩, l\'ombra di ψ sull\'asse<br>se passa, il fotone esce nello stato |θ⟩';
    }
    A.oninput = T.oninput = draw; draw(); ridisegna(draw);
  }

  /* ---------- 3. Un fotone alla volta: Born come frequenza ---------- */
  function born(el) {
    var u = el.id || "born";
    el.innerHTML = '<div class="cols"><canvas aria-label="Conteggi dei fotoni che passano e di quelli bloccati"></canvas><div>' + slider(u + "d", "Angolo tra stato e polarizzatore α − θ", 0, 90, 60, "°") + '<div class="btns"><button type="button" data-k="1">1 fotone</button><button type="button" data-k="10">10</button><button type="button" data-k="100">100</button><button type="button" data-k="1000">1000</button><button type="button" data-k="0">Azzera</button></div><div class="num" style="margin-top:10px"></div></div></div>';
    var cv = el.querySelector("canvas"), D = el.querySelector("#" + u + "d"), num = el.querySelector(".num"), pass = 0, tot = 0, ultimo = "", storia = [];
    function p() { var c = Math.cos(D.value * Math.PI / 180); return c * c; }
    function draw() {
      var S = fit(cv, 240), g = S.g, w = S.w, h = S.h;
      g.clearRect(0, 0, w, h);
      var bx = [w * 0.18, w * 0.52], bw = w * 0.22, base = h - 28, top = 20, H = base - top;
      var fr = tot ? [pass / tot, (tot - pass) / tot] : [0, 0], th = [p(), 1 - p()], lab = ["passa", "bloccato"], col = [C.amber, C.muted];
      for (var k = 0; k < 2; k++) {
        g.fillStyle = retino(g, col[k], 4, 1.55); g.fillRect(bx[k], base - fr[k] * H, bw, fr[k] * H);
        g.strokeStyle = col[k]; g.lineWidth = 1.2; if (fr[k] > 0) g.strokeRect(bx[k] + .5, base - fr[k] * H + .5, bw - 1, fr[k] * H - 1);
        g.strokeStyle = C.teal; g.lineWidth = 2; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(bx[k] - 8, base - th[k] * H); g.lineTo(bx[k] + bw + 8, base - th[k] * H); g.stroke(); g.setLineDash([]);
        g.fillStyle = C.muted; g.font = "13px " + MONO; g.textAlign = "center"; g.fillText(lab[k], bx[k] + bw / 2, base + 18);
      }
      g.strokeStyle = C.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(10, base); g.lineTo(w - 10, base); g.stroke();
      g.textAlign = "left"; g.fillStyle = C.teal; g.fillText("— — teoria: cos²(α−θ)", w * 0.62 > 260 ? w - 230 : 10, 14);
      el.querySelector("#" + u + "d-o").textContent = D.value + "°";
      num.innerHTML = 'fotoni mandati: <b>' + tot + '</b><br>passati: <b>' + pass + '</b> → frequenza <b>' + (tot ? f3(pass / tot) : "–") + '</b><br>previsione di Born: <span class="t">' + f3(p()) + '</span>' + (ultimo ? '<br>ultimo fotone: <b>' + ultimo + '</b>' : '');
    }
    el.querySelectorAll("button").forEach(function (b) {
      b.onclick = function () {
        var k = +b.dataset.k;
        if (!k) { pass = 0; tot = 0; ultimo = ""; draw(); return; }
        for (var i = 0; i < k; i++) { var ok = Math.random() < p(); pass += ok ? 1 : 0; tot++; ultimo = ok ? "è passato intero" : "è stato bloccato"; }
        draw();
      };
    });
    D.oninput = function () { pass = 0; tot = 0; ultimo = ""; draw(); };
    draw(); ridisegna(draw); var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(draw, 150); });
  }

  /* ---------- 4. Fasori: da dove vengono le frange ---------- */
  function fasori(el) {
    var u = el.id || "fas";
    el.innerHTML = '<div class="cols"><svg viewBox="0 0 320 320" role="img" aria-label="Le due ampiezze come frecce nel piano complesso e la loro somma"></svg><div>' + slider(u + "p", "Fase relativa Δφ tra le due strade", 0, 360, 60, "°") + slider(u + "r", "Peso della seconda fenditura |a₂| / |a₁|", 0, 100, 100, "%") + '<canvas aria-label="Probabilità in funzione della fase relativa"></canvas><div class="num" style="margin-top:8px"></div></div></div>';
    var svg = el.querySelector("svg"), P = el.querySelector("#" + u + "p"), Rr = el.querySelector("#" + u + "r"), cv = el.querySelector("canvas"), num = el.querySelector(".num");
    function draw() {
      var d = Math.PI / 180, ph = P.value * d, r1 = 0.5, r2 = 0.5 * Rr.value / 100;
      el.querySelector("#" + u + "p-o").textContent = P.value + "°"; el.querySelector("#" + u + "r-o").textContent = Rr.value + "%";
      var sc = 130, cx = 70, cy = 220;
      var a1 = [r1, 0], a2 = [r2 * Math.cos(ph), r2 * Math.sin(ph)], s = [a1[0] + a2[0], a1[1] + a2[1]];
      function X(v) { return cx + v[0] * sc; } function Y(v) { return cy - v[1] * sc; }
      var o = piano(svg).defs();
      o += '<line x1="10" y1="' + cy + '" x2="310" y2="' + cy + '" stroke="' + C.line + '"/><line x1="' + cx + '" y1="20" x2="' + cx + '" y2="310" stroke="' + C.line + '"/>';
      o += '<text x="300" y="' + (cy - 8) + '" font-size="12" fill="' + C.muted + '" text-anchor="end" font-family="' + MONO + '">Re</text><text x="' + (cx + 8) + '" y="30" font-size="12" fill="' + C.muted + '" font-family="' + MONO + '">Im</text>';
      o += '<line x1="' + cx + '" y1="' + cy + '" x2="' + X(a1) + '" y2="' + Y(a1) + '" stroke="' + C.amber + '" stroke-width="3.5" marker-end="url(#h-amb)"/>';
      if (r2 > 0.005) o += '<line x1="' + X(a1) + '" y1="' + Y(a1) + '" x2="' + X(s) + '" y2="' + Y(s) + '" stroke="' + C.rose + '" stroke-width="3.5" marker-end="url(#h-rose)"/>';
      o += '<line x1="' + cx + '" y1="' + cy + '" x2="' + X(s) + '" y2="' + Y(s) + '" stroke="' + C.teal + '" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#h-teal)"/>';
      o += '<text x="' + ((cx + X(a1)) / 2) + '" y="' + (cy + 18) + '" font-size="13" fill="' + C.amber + '" text-anchor="middle" font-family="' + MONO + '">a₁</text>';
      svg.innerHTML = o;
      var Pq = s[0] * s[0] + s[1] * s[1], Pc = r1 * r1 + r2 * r2, Ii = 2 * r1 * r2 * Math.cos(ph);
      var S = fit(cv, 158), g = S.g, w = S.w, h = S.h; g.clearRect(0, 0, w, h);
      var mx = (r1 + 0.5) * (r1 + 0.5), top = 40, yv = function (v) { return h - 14 - v / mx * (h - 24 - top); };
      /* le frange come appaiono sullo schermo: una mezzatinta in cui il punto cresce con la probabilità */
      var fr = new Path2D();
      for (var jj = 0; jj < 6; jj++) for (var ii = 0; ii * 6 < w + 6; ii++) {
        var xx = ii * 6 + (jj % 2 ? 3 : 0), qq = xx / w * 2 * Math.PI, vv = (r1 * r1 + r2 * r2 + 2 * r1 * r2 * Math.cos(qq)) / mx, rr = 2.9 * Math.sqrt(Math.max(0, vv));
        if (rr > .3) { fr.moveTo(xx + rr, 6 + jj * 4.6); fr.arc(xx, 6 + jj * 4.6, rr, 0, 6.2832); }
      }
      g.fillStyle = C.ink; g.fill(fr);
      g.strokeStyle = C.muted; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(0, yv(Pc)); g.lineTo(w, yv(Pc)); g.stroke(); g.setLineDash([]);
      g.strokeStyle = C.teal; g.lineWidth = 2; g.beginPath();
      for (var i = 0; i <= 200; i++) { var q = i / 200 * 2 * Math.PI, v = r1 * r1 + r2 * r2 + 2 * r1 * r2 * Math.cos(q), x = i / 200 * w; i ? g.lineTo(x, yv(v)) : g.moveTo(x, yv(v)); }
      g.stroke(); g.fillStyle = C.amber; g.beginPath(); g.arc(ph / (2 * Math.PI) * w, yv(Pq), 5, 0, 6.283); g.fill();
      g.fillStyle = C.muted; g.font = "11px " + MONO; g.fillText("P al variare di Δφ: sopra, le frange", 6, top + 8); g.fillText("tratteggio: somma classica", 6, h - 2);
      num.innerHTML = '|a₁ + a₂|² = <b>' + f3(Pq) + '</b> (quantistica)<br>|a₁|² + |a₂|² = ' + f3(Pc) + ' (classica)<br>termine d\'interferenza 2|a₁||a₂|cos Δφ = <span class="t">' + f3(Ii) + '</span>';
    }
    P.oninput = Rr.oninput = draw; draw(); ridisegna(draw); var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(draw, 150); });
  }

  /* ---------- 5. Cambio di base: lo stato resta fermo ---------- */
  function base(el) {
    var u = el.id || "base";
    el.innerHTML = '<div class="cols"><svg viewBox="0 0 320 320" role="img" aria-label="Lo stato e due basi ruotate"></svg><div>' + slider(u + "a", "Polarizzazione dello stato α", 0, 180, 60, "°") + slider(u + "t", "Rotazione della nuova base θ", -90, 90, 45, "°") + '<div class="num"></div></div></div>';
    var svg = el.querySelector("svg"), A = el.querySelector("#" + u + "a"), T = el.querySelector("#" + u + "t"), num = el.querySelector(".num"), pl = piano(svg);
    function draw() {
      var d = Math.PI / 180, a = A.value * d, t = T.value * d, c1 = Math.cos(a), c2 = Math.sin(a), n1 = Math.cos(a - t), n2 = Math.sin(a - t);
      el.querySelector("#" + u + "a-o").textContent = A.value + "°"; el.querySelector("#" + u + "t-o").textContent = T.value + "°";
      var s = pl.defs() + pl.assi() + pl.line(t, pl.R + 22, C.teal, 1.8, "7 5", true) + pl.line(t + Math.PI / 2, pl.R + 22, C.teal, 1.8, "7 5", true) + pl.txt(t, pl.R + 36, "e′₁", C.teal) + pl.txt(t + Math.PI / 2, pl.R + 36, "e′₂", C.teal);
      s += pl.seg(pl.P(a, pl.R), pl.P(t, pl.R * n1), C.amber, 1.2, "3 4") + pl.seg(pl.P(a, pl.R), pl.P(t + Math.PI / 2, pl.R * n2), C.amber, 1.2, "3 4");
      s += pl.line(a, pl.R, C.ink, 2.6, null, false, "h-ink") + pl.txt(a, pl.R + 16, "ψ", C.ink);
      svg.innerHTML = s;
      num.innerHTML = 'base vecchia {H, V}: (' + f3(c1) + ', ' + f3(c2) + ')<br>base nuova {e′₁, e′₂}: (<b>' + f3(n1) + '</b>, <b>' + f3(n2) + '</b>)<br>U = [[' + f3(Math.cos(t)) + ', ' + f3(Math.sin(t)) + '], [' + f3(-Math.sin(t)) + ', ' + f3(Math.cos(t)) + ']]<br>somma delle probabilità: ' + f3(n1 * n1 + n2 * n2) + ' <span class="t">(non cambia)</span>';
    }
    A.oninput = T.oninput = draw; draw(); ridisegna(draw);
  }

  /* ---------- 6. La corda dello Shankar: dalla somma all'integrale ---------- */
  function corda(el) {
    var u = el.id || "corda";
    el.innerHTML = '<canvas aria-label="Una funzione campionata in n punti"></canvas>' + slider(u + "n", "Numero di punti n (componenti del vettore)", 3, 200, 7, "") + '<div class="num"></div>';
    var cv = el.querySelector("canvas"), N = el.querySelector("#" + u + "n"), num = el.querySelector(".num");
    function f(x) { return Math.sin(Math.PI * x) + 0.4 * Math.sin(3 * Math.PI * x); }
    function gg(x) { return Math.sin(Math.PI * x); }
    function draw() {
      var n = +N.value, S = fit(cv, 220), g = S.g, w = S.w, h = S.h, x0 = 16, x1 = w - 16, ymid = h * 0.62, A = h * 0.42;
      el.querySelector("#" + u + "n-o").textContent = n;
      g.clearRect(0, 0, w, h);
      g.strokeStyle = C.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, ymid); g.lineTo(x1, ymid); g.stroke();
      var area = new Path2D(); area.moveTo(x0, ymid);
      for (var i = 0; i <= 300; i++) { var x = i / 300; area.lineTo(x0 + x * (x1 - x0), ymid - f(x) * A); }
      area.lineTo(x1, ymid); area.closePath(); g.fillStyle = retino(g, alfa(C.ink, .5), 5, 1.2); g.fill(area);
      g.strokeStyle = alfa(C.ink, .55); g.lineWidth = 1.5; g.beginPath();
      for (var i = 0; i <= 300; i++) { var x = i / 300, X = x0 + x * (x1 - x0), Y = ymid - f(x) * A; i ? g.lineTo(X, Y) : g.moveTo(X, Y); } g.stroke();
      var Sraw = 0, SD = 0, D = 1 / (n + 1);
      for (var k = 1; k <= n; k++) {
        var xk = k * D, X2 = x0 + xk * (x1 - x0), Y2 = ymid - f(xk) * A;
        g.strokeStyle = C.amber; g.lineWidth = Math.max(1, Math.min(3, 200 / n)); g.beginPath(); g.moveTo(X2, ymid); g.lineTo(X2, Y2); g.stroke();
        if (n <= 60) { g.fillStyle = C.amber; g.beginPath(); g.arc(X2, Y2, 3, 0, 6.283); g.fill(); }
        Sraw += f(xk) * gg(xk); SD += f(xk) * gg(xk) * D;
      }
      g.fillStyle = C.muted; g.font = "12px " + MONO; g.fillText("f(x) campionata in " + n + " punti: un vettore con " + n + " componenti", x0, 16);
      num.innerHTML = 'Σ f(xᵢ) g(xᵢ) senza Δ = <b>' + Sraw.toFixed(2) + '</b> <span class="w">(cresce con n: esplode)</span><br>Σ f(xᵢ) g(xᵢ) Δ = <b>' + SD.toFixed(4) + '</b> <span class="t">(tende a ∫ f g dx = 0.5000)</span>';
    }
    N.oninput = draw; draw(); ridisegna(draw); var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(draw, 150); });
  }

  /* =====================================================================
     LABORATORI DEL PERCORSO PARALLELO «OLTRE COPENHAGEN»
     Unità naturali ħ = m = 1 dove non è detto altro.
     ===================================================================== */

  /* ---------- numeri complessi minimi: [re, im] ---------- */
  function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
  function cdiv(a, b) { var d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }
  function cexp(re, im) { var r = Math.exp(re); return [r * Math.cos(im), r * Math.sin(im)]; }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function mezzatinta(g, x0, y0, w, h, P, valore, col, rmax) {
    /* retino a righe sfalsate: valore(x, y) in [0, 1] decide il raggio del punto */
    var path = new Path2D(), R = rmax || P * 0.5;
    for (var j = 0; j * P / 2 <= h; j++) for (var i = 0; i * P <= w + P; i++) {
      var x = x0 + i * P + (j % 2 ? P / 2 : 0), y = y0 + j * P / 2; if (x > x0 + w) continue;
      var v = valore(x, y); if (!(v > 0.004)) continue;
      var r = R * Math.sqrt(Math.min(1, v)); path.moveTo(x + r, y); path.arc(x, y, r, 0, 6.2832);
    }
    g.fillStyle = col; g.fill(path);
  }

  /* ---------- 7. Onda pilota: traiettorie di Bohm nella doppia fenditura ----------
     ψ = ψ₁ + ψ₂, due pacchetti gaussiani liberi centrati in ±d/2 con impulso medio nullo:
       ψⱼ(x,t) ∝ (1+iτ)^(-1/2) exp[ −(x−xⱼ)² / (4σ₀²(1+iτ)) ],   τ = t/(2σ₀²)
     equazione guida  dX/dt = Im( ∂ₓψ / ψ ) |_{x=X},  con  ∂ₓψⱼ = −(x−xⱼ)/(2σ₀²(1+iτ)) ψⱼ.
     Il fattore (1+iτ)^(-1/2) è comune ai due pacchetti e si semplifica nel rapporto. */
  function bohm(el) {
    var u = el.id || "bohm";
    el.innerHTML = '<canvas aria-label="Traiettorie di Bohm nella doppia fenditura sopra la densità di probabilità"></canvas>' +
      '<div class="cols" style="margin-top:10px"><div>' + slider(u + "d", "Distanza tra le fenditure d", 50, 110, 80, "") +
      '<div class="btns"><button type="button" data-a="una">Una particella</button><button type="button" data-a="dieci">Dieci</button><button type="button" data-a="tante">Mostra 41 traiettorie</button><button type="button" data-a="zero">Azzera</button></div></div>' +
      '<div class="num"></div></div>';
    var cv = el.querySelector("canvas"), D = el.querySelector("#" + u + "d"), num = el.querySelector(".num");
    var S0 = 0.35, T = 9, XM = 40, DT = 0.005, traj = [], arrivi = [], anim = null, raf = 0;
    function xs() { return D.value / 20; }   /* metà distanza: d/2 da 2.5 a 5.5 (in unità con σ₀ = 0,35) */
    function campi(x, t) {
      var tau = t / (2 * S0 * S0), q = 4 * S0 * S0 * (1 + tau * tau), a = xs(), x1 = -a, x2 = a;
      var r1 = -(x - x1) * (x - x1) / q, i1 = (x - x1) * (x - x1) * tau / q, r2 = -(x - x2) * (x - x2) / q, i2 = (x - x2) * (x - x2) * tau / q;
      var m = Math.max(r1, r2), e1 = cexp(r1 - m, i1), e2 = cexp(r2 - m, i2);
      var inv = [1 / (1 + tau * tau), -tau / (1 + tau * tau)];       /* 1/(1+iτ) */
      var d1 = cmul([-(x - x1) / (2 * S0 * S0), 0], cmul(inv, e1)), d2 = cmul([-(x - x2) / (2 * S0 * S0), 0], cmul(inv, e2));
      return { psi: [e1[0] + e2[0], e1[1] + e2[1]], dpsi: [d1[0] + d2[0], d1[1] + d2[1]], m: m, tau: tau };
    }
    function vel(x, t) { var c = campi(x, t), n = c.psi[0] * c.psi[0] + c.psi[1] * c.psi[1]; if (n < 1e-300) return 0; return cdiv(c.dpsi, c.psi)[1]; }
    function dens(x, t) { var c = campi(x, t); return Math.exp(2 * c.m) * (c.psi[0] * c.psi[0] + c.psi[1] * c.psi[1]) / Math.sqrt(1 + c.tau * c.tau); }
    function integra(x0) {
      var pts = [[0, x0]], x = x0, t = 0;
      while (t < T) {
        var k1 = vel(x, t), k2 = vel(x + DT * k1 / 2, t + DT / 2), k3 = vel(x + DT * k2 / 2, t + DT / 2), k4 = vel(x + DT * k3, t + DT);
        x += DT * (k1 + 2 * k2 + 2 * k3 + k4) / 6; t += DT; if (Math.round(t / DT) % 4 === 0) pts.push([t, x]);
      }
      pts.push([T, x]); return pts;
    }
    /* posizione iniziale distribuita come |ψ(x,0)|²: miscela di due gaussiane di deviazione σ₀ */
    function x0caso() { return (Math.random() < 0.5 ? -1 : 1) * xs() + S0 * gauss(); }
    function x0quantile(qn) {
      var lo = -xs() - 5 * S0, hi = xs() + 5 * S0, F = function (x) { return 0.5 * (cdf((x + xs()) / S0) + cdf((x - xs()) / S0)); };
      for (var k = 0; k < 60; k++) { var mid = (lo + hi) / 2; if (F(mid) < qn) lo = mid; else hi = mid; } return (lo + hi) / 2;
    }
    function cdf(z) { var t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2), p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
    var sfondo = null;
    function geom(S) { var schermo = Math.min(90, S.w * 0.14); return { L: 34, R: S.w - schermo - 8, schermo: schermo, top: 10, bot: S.h - 26 }; }
    function draw() {
      var S = fit(cv, 330), g = S.g, G = geom(S), W = G.R - G.L, H = G.bot - G.top;
      var X = function (t) { return G.L + t / T * W; }, Y = function (x) { return G.top + (XM - x) / (2 * XM) * H; };
      g.clearRect(0, 0, S.w, S.h);
      /* densità |ψ(x,t)|² in mezzatinta, scalata colonna per colonna al suo massimo; disegnata una volta e riusata */
      var chiave = [S.w, S.h, D.value, C.ink].join("|");
      if (!sfondo || sfondo.chiave !== chiave) {
        var off = document.createElement("canvas"), dpr = window.devicePixelRatio || 1; off.width = Math.round(S.w * dpr); off.height = Math.round(S.h * dpr);
        var og = off.getContext("2d"); og.setTransform(dpr, 0, 0, dpr, 0, 0);
        var cols = Math.ceil(W / 6) + 1, mx = [];
        for (var c = 0; c <= cols; c++) { var t = c / cols * T, best = 0; for (var k = 0; k <= 80; k++) best = Math.max(best, dens(-XM + 2 * XM * k / 80, t)); mx.push(best || 1); }
        mezzatinta(og, G.L, G.top, W, H, 6, function (px, py) { var t = (px - G.L) / W * T, x = XM - (py - G.top) / H * 2 * XM, c = Math.round((px - G.L) / W * cols); return dens(x, t) / mx[c]; }, alfa(C.ink, .5), 2.6);
        sfondo = { chiave: chiave, cv: off };
      }
      g.drawImage(sfondo.cv, 0, 0, S.w, S.h);
      /* fenditure */
      g.fillStyle = C.ink; var a = xs();
      g.fillRect(G.L - 6, G.top, 3, Y(a + 3 * S0) - G.top); g.fillRect(G.L - 6, Y(a - 3 * S0), 3, Y(-a + 3 * S0) - Y(a - 3 * S0)); g.fillRect(G.L - 6, Y(-a - 3 * S0), 3, G.bot - Y(-a - 3 * S0));
      /* traiettorie */
      g.lineWidth = 1.1; g.strokeStyle = alfa(C.ink, .85);
      traj.forEach(function (tr) { g.beginPath(); tr.forEach(function (p, i) { i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])); }); g.stroke(); });
      if (anim) { g.strokeStyle = C.amber; g.lineWidth = 2; g.beginPath(); for (var i = 0; i <= anim.k; i++) { var p = anim.tr[i]; i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])); } g.stroke(); var q = anim.tr[anim.k]; g.fillStyle = C.amber; g.beginPath(); g.arc(X(q[0]), Y(q[1]), 4, 0, 6.2832); g.fill(); }
      /* schermo: gli arrivi in mezzatinta */
      g.strokeStyle = C.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(G.R + 4, G.top); g.lineTo(G.R + 4, G.bot); g.stroke();
      var NB = 70, bins = new Array(NB).fill(0); arrivi.forEach(function (x) { var b = Math.floor((XM - x) / (2 * XM) * NB); if (b >= 0 && b < NB) bins[b]++; });
      var bm = Math.max.apply(null, bins) || 1, bh = H / NB;
      for (var b = 0; b < NB; b++) { var len = bins[b] / bm * (G.schermo - 10); if (len > 0) { g.fillStyle = retino(g, C.amber, 3, 1.15); g.fillRect(G.R + 8, G.top + b * bh, len, bh - 0.5); } }
      g.fillStyle = C.muted; g.font = "11px " + MONO; g.textAlign = "left"; g.fillText("t →", G.L + 4, S.h - 8); g.fillText("x", 10, G.top + 10); g.textAlign = "right"; g.fillText("schermo", S.w - 6, S.h - 8); g.textAlign = "left";
      el.querySelector("#" + u + "d-o").textContent = (2 * xs()).toFixed(1);
      num.innerHTML = 'arrivi sullo schermo: <b>' + arrivi.length + '</b><br>traiettorie disegnate: ' + traj.length + '<br><span class="t">le traiettorie non si incrociano mai</span>: l\'equazione guida è del primo ordine, quindi da ogni punto (x, t) passa una sola traiettoria';
    }
    function lancia(n) {
      if (RIDOTTO || n > 1) { for (var i = 0; i < n; i++) { var tr = integra(x0caso()); traj.push(tr); arrivi.push(tr[tr.length - 1][1]); } if (traj.length > 60) traj = traj.slice(-60); draw(); return; }
      var tr1 = integra(x0caso()); anim = { tr: tr1, k: 0 }; cancelAnimationFrame(raf);
      (function passo() { anim.k = Math.min(anim.tr.length - 1, anim.k + 4); draw(); if (anim.k < anim.tr.length - 1) raf = requestAnimationFrame(passo); else { traj.push(anim.tr); arrivi.push(anim.tr[anim.tr.length - 1][1]); anim = null; draw(); } })();
    }
    el.querySelectorAll("button").forEach(function (b) { b.onclick = function () {
      var a = b.dataset.a; if (a === "zero") { traj = []; arrivi = []; anim = null; draw(); }
      else if (a === "una") lancia(1); else if (a === "dieci") lancia(10);
      else if (a === "tante") { traj = []; for (var i = 0; i < 41; i++) traj.push(integra(x0quantile((i + 0.5) / 41))); draw(); }
    }; });
    D.oninput = function () { traj = []; arrivi = []; anim = null; draw(); };
    for (var i = 0; i < 41; i++) traj.push(integra(x0quantile((i + 0.5) / 41)));
    draw(); ridisegna(draw); var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(draw, 150); });
  }

  /* ---------- 8. Onda pilota nella buca infinita: ferma negli stati stazionari ----------
     ψ = c₁ φ₁ e^{−iE₁t} + c₂ φ₂ e^{−iE₂t},  φₙ = √2 sin(nπx),  Eₙ = n²π²/2  (L = 1, ħ = m = 1). */
  function scatola(el) {
    var u = el.id || "box";
    el.innerHTML = '<canvas aria-label="Densità e traiettorie di Bohm nella buca infinita"></canvas><div class="cols" style="margin-top:10px"><div>' + slider(u + "c", "Peso del secondo stato |c₂|²", 0, 100, 30, "%") + '</div><div class="num"></div></div>';
    var cv = el.querySelector("canvas"), Cc = el.querySelector("#" + u + "c"), num = el.querySelector(".num"), E1 = Math.PI * Math.PI / 2, E2 = 4 * E1, TT = 2 * (2 * Math.PI / (E2 - E1));
    function stato(x, t, c1, c2) {
      var p1 = Math.SQRT2 * Math.sin(Math.PI * x), p2 = Math.SQRT2 * Math.sin(2 * Math.PI * x), d1 = Math.SQRT2 * Math.PI * Math.cos(Math.PI * x), d2 = 2 * Math.SQRT2 * Math.PI * Math.cos(2 * Math.PI * x);
      var f1 = [Math.cos(E1 * t), -Math.sin(E1 * t)], f2 = [Math.cos(E2 * t), -Math.sin(E2 * t)];
      return { psi: [c1 * p1 * f1[0] + c2 * p2 * f2[0], c1 * p1 * f1[1] + c2 * p2 * f2[1]], dpsi: [c1 * d1 * f1[0] + c2 * d2 * f2[0], c1 * d1 * f1[1] + c2 * d2 * f2[1]] };
    }
    function draw() {
      var w2 = Cc.value / 100, c1 = Math.sqrt(1 - w2), c2 = Math.sqrt(w2), S = fit(cv, 260), g = S.g, L = 34, R = S.w - 12, top = 10, bot = S.h - 24, W = R - L, H = bot - top;
      var X = function (t) { return L + t / TT * W; }, Y = function (x) { return bot - x * H; };
      g.clearRect(0, 0, S.w, S.h);
      var maxd = (c1 + c2) * (c1 + c2) * 2;
      mezzatinta(g, L, top, W, H, 6, function (px, py) { var t = (px - L) / W * TT, x = (bot - py) / H; var s = stato(x, t, c1, c2); return (s.psi[0] * s.psi[0] + s.psi[1] * s.psi[1]) / maxd; }, alfa(C.ink, .45), 2.6);
      g.strokeStyle = C.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(L, top); g.lineTo(R, top); g.moveTo(L, bot); g.lineTo(R, bot); g.stroke();
      g.strokeStyle = C.amber; g.lineWidth = 1.4;
      for (var q = 1; q <= 9; q++) {
        var x = q / 10, t = 0, dt = TT / 1400; g.beginPath(); g.moveTo(X(0), Y(x));
        for (var k = 0; k < 1400; k++) { var s = stato(x, t, c1, c2), n = s.psi[0] * s.psi[0] + s.psi[1] * s.psi[1]; var v = n > 1e-12 ? cdiv(s.dpsi, s.psi)[1] : 0; x = Math.min(0.999, Math.max(0.001, x + v * dt)); t += dt; g.lineTo(X(t), Y(x)); }
        g.stroke();
      }
      g.fillStyle = C.muted; g.font = "11px " + MONO; g.fillText("t → (due periodi 2π/(E₂−E₁))", L + 4, S.h - 7); g.fillText("x", 12, top + 10);
      el.querySelector("#" + u + "c-o").textContent = Cc.value + "%";
      num.innerHTML = '|c₁|² = <b>' + f3(1 - w2) + '</b>, |c₂|² = <b>' + f3(w2) + '</b><br>' + (w2 === 0 || w2 === 1 ? '<span class="t">stato stazionario reale a meno di una fase globale: ∂S/∂x = 0, la particella è ferma</span>' : 'sovrapposizione: la fase relativa ruota con pulsazione E₂ − E₁ e le particelle oscillano');
    }
    Cc.oninput = draw; draw(); ridisegna(draw); var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(draw, 150); });
  }

  /* ---------- 9. Bell/CHSH con coppie di fotoni nello stato (|HH⟩+|VV⟩)/√2 ----------
     E(α,β) = P(uguali) − P(diversi) = cos 2(α−β).   S = E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′).
     Modello locale: ogni coppia porta una polarizzazione nascosta λ uniforme; A(α,λ) = sgn cos 2(α−λ), idem per B.
     Dà E_loc(Δ) = 1 − 4|Δ|/π per |Δ| ≤ π/2 (Δ ridotto modulo π), e |S| ≤ 2. */
  function chsh(el) {
    var u = el.id || "chsh";
    el.innerHTML = '<div class="cols"><canvas aria-label="Correlazione quantistica e locale in funzione dell\'angolo"></canvas><div>' +
      slider(u + "a", "Alice, a", 0, 180, 0, "°") + slider(u + "a2", "Alice, a′", 0, 180, 45, "°") + slider(u + "b", "Bob, b", 0, 180, 22.5, "°") + slider(u + "b2", "Bob, b′", 0, 180, 67.5, "°") +
      '<div class="btns"><button type="button" data-k="1000">Misura 1000 coppie</button><button type="button" data-k="ottimo">Angoli ottimali</button></div><div class="num" style="margin-top:8px"></div></div></div>';
    var cv = el.querySelector("canvas"), ids = ["a", "a2", "b", "b2"], I = {}, num = el.querySelector(".num"), sim = null;
    ids.forEach(function (k) { I[k] = el.querySelector("#" + u + k); I[k].step = 0.5; I[k].value = { a: 0, a2: 45, b: 22.5, b2: 67.5 }[k]; });
    function rid(d) { d = ((d % Math.PI) + Math.PI) % Math.PI; return d > Math.PI / 2 ? d - Math.PI : d; }
    function Eq(al, be) { return Math.cos(2 * (al - be)); }
    function El(al, be) { return 1 - 4 * Math.abs(rid(al - be)) / Math.PI; }
    function ang() { var d = Math.PI / 180; return { a: I.a.value * d, a2: I.a2.value * d, b: I.b.value * d, b2: I.b2.value * d }; }
    function Sdi(E, A) { return E(A.a, A.b) - E(A.a, A.b2) + E(A.a2, A.b) + E(A.a2, A.b2); }
    function draw() {
      var A = ang(), S = fit(cv, 250), g = S.g, L = 30, R = S.w - 8, top = 12, bot = S.h - 30, W = R - L, H = bot - top;
      var X = function (dd) { return L + (dd + 90) / 180 * W; }, Y = function (e) { return top + (1 - e) / 2 * H; };
      g.clearRect(0, 0, S.w, S.h);
      g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.moveTo(L, Y(0)); g.lineTo(R, Y(0)); g.moveTo(X(0), top); g.lineTo(X(0), bot); g.stroke();
      g.strokeStyle = C.amber; g.lineWidth = 2; g.beginPath(); for (var i = 0; i <= 180; i++) { var dd = -90 + i; i ? g.lineTo(X(dd), Y(Eq(dd * Math.PI / 180, 0))) : g.moveTo(X(dd), Y(Eq(-Math.PI / 2, 0))); } g.stroke();
      g.strokeStyle = C.ink; g.setLineDash([5, 4]); g.lineWidth = 1.4; g.beginPath(); g.moveTo(X(-90), Y(-1)); g.lineTo(X(0), Y(1)); g.lineTo(X(90), Y(-1)); g.stroke(); g.setLineDash([]);
      [["a", "b"], ["a", "b2"], ["a2", "b"], ["a2", "b2"]].forEach(function (pq) { var dd = rid(A[pq[0]] - A[pq[1]]) * 180 / Math.PI; g.fillStyle = C.amber; g.beginPath(); g.arc(X(dd), Y(Eq(dd * Math.PI / 180, 0)), 4, 0, 6.2832); g.fill(); });
      g.fillStyle = C.muted; g.font = "11px " + MONO; g.fillText("E(Δ)", 4, top + 8); g.fillText("Δ = α − β: da −90° a 90°", L + 4, S.h - 8);
      g.fillStyle = C.amber; g.fillText("quantistica cos 2Δ", R - 150, top + 12); g.fillStyle = C.ink; g.fillText("locale (tratteggio)", R - 150, top + 26);
      ids.forEach(function (k) { el.querySelector("#" + u + k + "-o").textContent = I[k].value + "°"; });
      var Sq = Sdi(Eq, A), Sl = Sdi(El, A);
      num.innerHTML = 'S quantistica = <b>' + Sq.toFixed(3) + '</b><br>S del modello locale = ' + Sl.toFixed(3) + '<br>limite locale |S| ≤ 2 · massimo quantistico 2√2 = 2.828' + (sim ? '<br>misurate ' + sim.n + ' coppie: S ≈ <b>' + sim.S.toFixed(2) + '</b> ± ' + sim.err.toFixed(2) + ' (quantistica), ' + sim.Sl.toFixed(2) + ' (locale)' : '');
    }
    function misura(n) {
      var A = ang(), coppie = [["a", "b", 1], ["a", "b2", -1], ["a2", "b", 1], ["a2", "b2", 1]], acc = [0, 0, 0, 0], accl = [0, 0, 0, 0], cnt = [0, 0, 0, 0];
      for (var i = 0; i < n; i++) {
        var k = Math.floor(Math.random() * 4), al = A[coppie[k][0]], be = A[coppie[k][1]];
        var uguali = Math.random() < (1 + Eq(al, be)) / 2; acc[k] += uguali ? 1 : -1;
        var lam = Math.random() * Math.PI, ra = Math.cos(2 * (al - lam)) >= 0 ? 1 : -1, rb = Math.cos(2 * (be - lam)) >= 0 ? 1 : -1; accl[k] += ra * rb; cnt[k]++;
      }
      var Sq = 0, Sl = 0, v = 0; for (var j = 0; j < 4; j++) { var e = acc[j] / cnt[j]; Sq += coppie[j][2] * e; Sl += coppie[j][2] * accl[j] / cnt[j]; v += (1 - e * e) / cnt[j]; }
      sim = { n: n, S: Sq, Sl: Sl, err: Math.sqrt(v) }; draw();
    }
    el.querySelectorAll("button").forEach(function (b) { b.onclick = function () { if (b.dataset.k === "ottimo") { I.a.value = 0; I.a2.value = 45; I.b.value = 22.5; I.b2.value = 67.5; sim = null; draw(); } else misura(1000); }; });
    ids.forEach(function (k) { I[k].oninput = function () { sim = null; draw(); }; });
    draw(); ridisegna(draw); var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(draw, 150); });
  }

  /* ---------- 10. GRW: un colpo di localizzazione su una sovrapposizione di due pacchetti ----------
     Convenzione di Norsen (9.4)-(9.11): lunghezze in unità di σ = 10⁻⁷ m. Il colpo centrato in r moltiplica ψ per
     g_r(x) = (2πσ²)^(−1/4) exp[−(x−r)²/(4σ²)] e rinormalizza; il centro r è estratto con P(r) = ∫ |g_r(x) ψ(x)|² dx,
     cioè |ψ|² convoluta con una gaussiana di deviazione standard σ.
     Ogni particella subisce colpi con tasso λ = 10⁻¹⁶ s⁻¹; un oggetto di N particelle con tasso N λ. */
  function grw(el) {
    var u = el.id || "grw";
    el.innerHTML = '<canvas aria-label="Densità di probabilità prima e dopo un colpo GRW"></canvas><div class="cols" style="margin-top:10px"><div>' +
      slider(u + "w", "Peso del pacchetto di sinistra |c₁|²", 5, 95, 50, "%") + slider(u + "n", "Particelle coinvolte N = 10^", 0, 23, 0, "") +
      '<div class="btns"><button type="button" data-k="1">Un colpo</button><button type="button" data-k="200">Ripeti 200 volte</button><button type="button" data-k="0">Ripristina</button></div></div><div class="num"></div></div>';
    var cv = el.querySelector("canvas"), Wt = el.querySelector("#" + u + "w"), Nn = el.querySelector("#" + u + "n"), num = el.querySelector(".num");
    var XM = 10, NX = 400, dx = 2 * XM / NX, SIG = 0.35, SEP = 5, psi = null, ult = null, conti = null;
    function xi(i) { return -XM + (i + 0.5) * dx; }
    function iniz() { var w1 = Wt.value / 100; psi = []; for (var i = 0; i < NX; i++) { var x = xi(i); psi.push(Math.sqrt(w1) * g1(x + SEP) + Math.sqrt(1 - w1) * g1(x - SEP)); } ult = null; }
    function g1(x) { return Math.pow(2 * Math.PI * SIG * SIG, -0.25) * Math.exp(-x * x / (4 * SIG * SIG)); }
    function densitaCentro(v) {
      var P = [], tot = 0;
      for (var k = 0; k < NX; k++) { var X = xi(k), s = 0; for (var i = 0; i < NX; i++) { var d = xi(i) - X; if (Math.abs(d) < 6) s += v[i] * v[i] * Math.exp(-d * d / 2) / Math.sqrt(2 * Math.PI) * dx; } P.push(s); tot += s; }
      return { P: P, tot: tot };
    }
    function estrai(D) { var r = Math.random() * D.tot, k2 = 0; while (k2 < NX - 1 && (r -= D.P[k2]) > 0) k2++; return xi(k2); }
    function colpo(v) {
      var Xc = estrai(densitaCentro(v)), out = [], nrm = 0; for (var i2 = 0; i2 < NX; i2++) { var d2 = xi(i2) - Xc, val = v[i2] * Math.exp(-d2 * d2 / 4); out.push(val); nrm += val * val * dx; }
      nrm = Math.sqrt(nrm); return { psi: out.map(function (a) { return a / nrm; }), X: Xc };
    }
    function attesa() {
      var N = Math.pow(10, +Nn.value), tau = 1 / (N * 1e-16);
      if (tau > 3.156e7) return (tau / 3.156e7).toExponential(1).replace("e+", "·10^") + " anni";
      if (tau > 1) return tau.toPrecision(2) + " s"; return tau.toExponential(1).replace("e-", "·10^-") + " s";
    }
    function draw() {
      var S = fit(cv, 220), g = S.g, L = 12, R = S.w - 12, top = 14, bot = S.h - 26, W = R - L, H = bot - top, X = function (x) { return L + (x + XM) / (2 * XM) * W; };
      g.clearRect(0, 0, S.w, S.h);
      var base = []; var w1 = Wt.value / 100; for (var i = 0; i < NX; i++) { var x = xi(i), a = Math.sqrt(w1) * g1(x + SEP) + Math.sqrt(1 - w1) * g1(x - SEP); base.push(a * a); }
      var cur = psi.map(function (a) { return a * a; }), mx = Math.max(Math.max.apply(null, base), Math.max.apply(null, cur));
      /* prima del colpo: profilo tratteggiato; adesso: colonne in mezzatinta */
      g.strokeStyle = alfa(C.ink, .45); g.setLineDash([4, 4]); g.beginPath(); base.forEach(function (v, i) { var px = X(xi(i)), py = bot - v / mx * H; i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke(); g.setLineDash([]);
      mezzatinta(g, L, top, W, H, 5, function (px, py) { var i = Math.floor((px - L) / W * NX); if (i < 0 || i >= NX) return 0; var h = cur[i] / mx * H; return py >= bot - h ? 0.9 : 0; }, C.ink, 2.1);
      g.strokeStyle = C.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(L, bot); g.lineTo(R, bot); g.stroke();
      if (ult) { g.strokeStyle = C.amber; g.lineWidth = 2; g.beginPath(); g.moveTo(X(ult.X), top); g.lineTo(X(ult.X), bot); g.stroke(); g.fillStyle = C.amber; g.font = "11px " + MONO; g.fillText("centro del colpo", Math.min(R - 100, X(ult.X) + 5), top + 10); }
      g.fillStyle = C.muted; g.font = "11px " + MONO; g.fillText("x in unità di σ = 10⁻⁷ m: pacchetti a ±0,5 µm", L, S.h - 8);
      el.querySelector("#" + u + "w-o").textContent = Wt.value + "%"; el.querySelector("#" + u + "n-o").textContent = Nn.value;
      num.innerHTML = 'tasso dei colpi N λ = 10^' + Nn.value + ' · 10⁻¹⁶ s⁻¹<br>attesa media del primo colpo: <b>' + attesa() + '</b>' + (conti ? '<br>su ' + conti.n + ' colpi: a sinistra <b>' + f3(conti.s / conti.n) + '</b> (Born: ' + f3(Wt.value / 100) + ')' : '<br><span class="t">un colpo non sceglie a caso «uniforme»: il centro cade dove |ψ|² è grande</span>');
    }
    el.querySelectorAll("button").forEach(function (b) { b.onclick = function () {
      var k = +b.dataset.k; if (!k) { iniz(); conti = null; draw(); return; }
      if (k === 1) { var r = colpo(psi); psi = r.psi; ult = r; draw(); return; }
      iniz(); var s = 0, Dd = densitaCentro(psi); for (var i = 0; i < k; i++) if (estrai(Dd) < 0) s++; conti = { n: k, s: s }; draw();
    }; });
    Wt.oninput = function () { iniz(); conti = null; draw(); }; Nn.oninput = draw;
    iniz(); draw(); ridisegna(draw); var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(draw, 150); });
  }

  /* ---------- 11. Molti mondi: contare i rami o pesarli? ----------
     n misure ripetute di un sistema a due esiti con |α|² = p: dopo n misure ci sono 2ⁿ rami;
     i rami con k esiti «su» sono C(n,k), ciascuno con peso pᵏ(1−p)ⁿ⁻ᵏ. */
  function rami(el) {
    var u = el.id || "rami";
    el.innerHTML = '<canvas aria-label="Numero di rami e peso dei rami in funzione della frequenza osservata"></canvas><div class="cols" style="margin-top:10px"><div>' + slider(u + "p", "Probabilità di Born del «su», p = |α|²", 5, 95, 80, "%") + slider(u + "n", "Misure ripetute n", 1, 40, 20, "") + '</div><div class="num"></div></div>';
    var cv = el.querySelector("canvas"), Pp = el.querySelector("#" + u + "p"), Nn = el.querySelector("#" + u + "n"), num = el.querySelector(".num");
    function lbin(n, k) { var s = 0; for (var i = 1; i <= k; i++) s += Math.log((n - k + i) / i); return s; }
    function draw() {
      var p = Pp.value / 100, n = +Nn.value, S = fit(cv, 230), g = S.g, L = 14, R = S.w - 10, top = 14, bot = S.h - 30, W = R - L, H = bot - top;
      g.clearRect(0, 0, S.w, S.h);
      var conta = [], peso = []; for (var k = 0; k <= n; k++) { var lb = lbin(n, k); conta.push(Math.exp(lb - n * Math.LN2)); peso.push(Math.exp(lb + k * Math.log(p) + (n - k) * Math.log(1 - p))); }
      var mx = Math.max(Math.max.apply(null, conta), Math.max.apply(null, peso)), bw = W / (n + 1);
      for (var k2 = 0; k2 <= n; k2++) {
        var x = L + k2 * bw, h1 = conta[k2] / mx * H, h2 = peso[k2] / mx * H;
        g.fillStyle = retino(g, alfa(C.ink, .8), 4, 1.3); g.fillRect(x + 1, bot - h1, bw / 2 - 1.5, h1);
        g.fillStyle = retino(g, C.amber, 4, 1.6); g.fillRect(x + bw / 2, bot - h2, bw / 2 - 1.5, h2);
      }
      g.strokeStyle = C.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(L, bot); g.lineTo(R, bot); g.stroke();
      g.fillStyle = C.muted; g.font = "11px " + MONO; g.textAlign = "left"; g.fillText("frequenza osservata k/n: da 0 a 1 →", L, S.h - 10);
      g.fillStyle = C.ink; g.fillText("▮ frazione dei rami", L + 4, top + 4); g.fillStyle = C.amber; g.fillText("▮ peso dei rami (|ampiezza|²)", L + 150, top + 4);
      var vicini = function (arr, c) { var s = 0; for (var k = 0; k <= n; k++) if (Math.abs(k / n - c) <= 0.1 + 1e-9) s += arr[k]; return s; };
      el.querySelector("#" + u + "p-o").textContent = Pp.value + "%"; el.querySelector("#" + u + "n-o").textContent = n;
      num.innerHTML = 'rami in tutto: 2^' + n + ' = ' + Math.pow(2, n).toLocaleString("it-IT") + '<br>rami con frequenza entro ±0,1 da p: <b>' + f3(vicini(conta, p)) + '</b> del totale<br>peso di quegli stessi rami: <b>' + f3(vicini(peso, p)) + '</b><br><span class="w">contando i rami la frequenza tipica è 1/2 per ogni p</span>: la regola di Born richiede di pesarli';
    }
    Pp.oninput = Nn.oninput = draw; draw(); ridisegna(draw); var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(draw, 150); });
  }

  /* =====================================================================
     LABORATORI DELLA LEZIONE 3 (evoluzione temporale)
     ===================================================================== */

  /* ---------- 12. La posizione discretizzata ----------
     ψ con due gobbe gaussiane; x̂_ε = Σ_m x_m Ê_{x_m,ε}, x_m = ε m, Ê proiettore sull'intervallo I_m = [x_m − ε/2, x_m + ε/2].
     P(m) = ⟨ψ|Ê_m|ψ⟩ = ∫_{I_m} |ψ|² dx;  ⟨x̂_ε⟩ = Σ_m x_m P(m)  →  ⟨x̂⟩ per ε → 0. */
  function discreto(el) {
    var u = el.id || "disc";
    el.innerHTML = '<canvas aria-label="Densità di probabilità, funzione a scalini e probabilità degli intervalli"></canvas><div class="cols" style="margin-top:10px"><div>' + slider(u + "e", "Larghezza degli intervalli ε", 5, 200, 100, "") + '</div><div class="num"></div></div>';
    var cv = el.querySelector("canvas"), E = el.querySelector("#" + u + "e"), num = el.querySelector(".num"), XM = 4;
    function rho(x) { var a = Math.exp(-Math.pow(x + 1.3, 2) / (2 * 0.36)), b = 0.6 * Math.exp(-Math.pow(x - 1.6, 2) / (2 * 0.25)); return a + b; }
    var NRM = 0, MEDIA = 0; for (var i = 0; i <= 4000; i++) { var x = -XM + 2 * XM * i / 4000, w = (i === 0 || i === 4000 ? 0.5 : 1) * 2 * XM / 4000; NRM += rho(x) * w; MEDIA += x * rho(x) * w; } MEDIA /= NRM;
    function P(a, b) { var s = 0, n = 60; for (var k = 0; k < n; k++) { var x = a + (k + 0.5) * (b - a) / n; s += rho(x); } return s * (b - a) / n / NRM; }
    function draw() {
      var eps = E.value / 100, S = fit(cv, 300), g = S.g, L = 34, R = S.w - 10, top = 12, mid = 150, bot = S.h - 24, W = R - L;
      var X = function (x) { return L + (x + XM) / (2 * XM) * W; };
      g.clearRect(0, 0, S.w, S.h);
      /* in alto: |ψ|² in mezzatinta, la retta y = x e la funzione a scalini x_ε(x) */
      var rmax = 0; for (var q = -XM; q <= XM; q += 0.01) rmax = Math.max(rmax, rho(q));
      mezzatinta(g, L, top, W, mid - top, 6, function (px, py) { var x = -XM + (px - L) / W * 2 * XM, h = rho(x) / rmax * (mid - top); return py >= mid - h ? 0.85 : 0; }, alfa(C.ink, .35), 2.4);
      var Yx = function (y) { return (top + mid) / 2 - y / XM * (mid - top) / 2; };
      g.strokeStyle = alfa(C.ink, .45); g.setLineDash([4, 4]); g.lineWidth = 1; g.beginPath(); g.moveTo(X(-XM), Yx(-XM)); g.lineTo(X(XM), Yx(XM)); g.stroke(); g.setLineDash([]);
      g.strokeStyle = C.amber; g.lineWidth = 2; g.beginPath();
      var m0 = Math.ceil((-XM - eps / 2) / eps), m1 = Math.floor((XM + eps / 2) / eps), first = true;
      for (var m = m0; m <= m1; m++) { var xm = m * eps, a = Math.max(-XM, xm - eps / 2), b = Math.min(XM, xm + eps / 2); if (first) { g.moveTo(X(a), Yx(xm)); first = false; } else g.lineTo(X(a), Yx(xm)); g.lineTo(X(b), Yx(xm)); }
      g.stroke();
      /* in basso: P(m) per ogni intervallo, colonne in mezzatinta */
      var probs = [], pm = 0, att = 0; for (var m2 = m0; m2 <= m1; m2++) { var x2 = m2 * eps, p = P(Math.max(-XM, x2 - eps / 2), Math.min(XM, x2 + eps / 2)); probs.push([x2, p]); pm = Math.max(pm, p); att += x2 * p; }
      probs.forEach(function (c) { var a = X(Math.max(-XM, c[0] - eps / 2)), b = X(Math.min(XM, c[0] + eps / 2)), h = c[1] / pm * (bot - mid - 18); g.fillStyle = retino(g, C.ink, 4, 1.35); g.fillRect(a + 0.5, bot - h, Math.max(1, b - a - 1), h); });
      g.strokeStyle = C.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(L, bot); g.lineTo(R, bot); g.moveTo(L, mid); g.lineTo(R, mid); g.stroke();
      g.fillStyle = C.amber; g.beginPath(); g.moveTo(X(att), bot + 2); g.lineTo(X(att) - 5, bot + 10); g.lineTo(X(att) + 5, bot + 10); g.closePath(); g.fill();
      g.strokeStyle = C.teal; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(MEDIA), bot - 4); g.lineTo(X(MEDIA), bot + 12); g.stroke();
      g.fillStyle = C.muted; g.font = "11px " + MONO; g.fillText("|ψ(x)|², retta y = x e scalini x_ε(x)", L, top + 10); g.fillText("P(m) = ∫ |ψ|² sull'intervallo m", L, mid + 14); g.fillText("x", R - 8, S.h - 8);
      el.querySelector("#" + u + "e-o").textContent = eps.toFixed(2);
      num.innerHTML = 'intervalli: <b>' + probs.length + '</b>, ε = ' + eps.toFixed(2) + '<br>⟨x̂_ε⟩ = Σ x_m P(m) = <b>' + att.toFixed(4) + '</b><br>⟨x̂⟩ = ∫ x |ψ|² dx = <span class="t">' + MEDIA.toFixed(4) + '</span><br>somma delle P(m) = ' + probs.reduce(function (s, c) { return s + c[1]; }, 0).toFixed(4);
    }
    E.oninput = draw; draw(); ridisegna(draw); var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(draw, 150); });
  }

  /* ---------- 13. L'ordine conta: rotatore e lamina sulla sfera di Poincaré ----------
     |H⟩ al polo nord (z), |V⟩ al polo sud, |D⟩ su +x, |R⟩ su +y.
     Rotatore ottico: K₁ ∝ σ_y, ruota il vettore attorno all'asse y; lamina birifrangente: K₂ ∝ σ_z, ruota attorno a z.
     Con K(t) = K₁ nel primo intervallo e K₂ nel secondo, U = e^{−iK₂τ} e^{−iK₁τ} (il tempo dopo sta a sinistra).
     Fedeltà tra due stati puri con vettori di Bloch a, b: |⟨ψa|ψb⟩|² = (1 + a·b)/2. */
  function ordine(el) {
    var u = el.id || "ord";
    el.innerHTML = '<div class="cols"><canvas aria-label="Sfera di Poincaré con due traiettorie dello stato di polarizzazione"></canvas><div>' + slider(u + "t", "Angolo di ciascun elemento θ", 0, 180, 90, "°") +
      '<div class="ctl"><label for="' + u + 'c"><span>Due lamine (generatori che commutano)</span><input type="checkbox" id="' + u + 'c"></label></div><div class="num"></div></div></div>';
    var cv = el.querySelector("canvas"), T = el.querySelector("#" + u + "t"), Cm = el.querySelector("#" + u + "c"), num = el.querySelector(".num");
    function rot(v, asse, a) { var c = Math.cos(a), s = Math.sin(a), x = v[0], y = v[1], z = v[2]; if (asse === "y") return [c * x + s * z, y, -s * x + c * z]; if (asse === "z") return [c * x - s * y, s * x + c * y, z]; return [x, c * y - s * z, s * y + c * z]; }
    function percorso(seq, th, v0) { var v = (v0 || [0, 0, 1]).slice(), pts = [v.slice()]; seq.forEach(function (asse) { for (var k = 1; k <= 40; k++) pts.push(rot(v, asse, th * k / 40)); v = rot(v, asse, th); }); return { pts: pts, fine: v }; }
    var AZ = -0.6, EL = 0.35;
    function proietta(v, cx, cy, R) { var x = v[0], y = v[1], z = v[2], x1 = x * Math.cos(AZ) - y * Math.sin(AZ), y1 = x * Math.sin(AZ) + y * Math.cos(AZ), zp = z * Math.cos(EL) - y1 * Math.sin(EL), d = y1 * Math.cos(EL) + z * Math.sin(EL); return [cx + R * x1, cy - R * zp, d]; }
    function draw() {
      var th = T.value * Math.PI / 180, S = fit(cv, 300), g = S.g, cx = S.w / 2, cy = S.h / 2 + 4, R = Math.min(S.w, S.h) * 0.4;
      g.clearRect(0, 0, S.w, S.h);
      /* la sfera in mezzatinta, più scura verso il bordo */
      mezzatinta(g, cx - R, cy - R, 2 * R, 2 * R, 7, function (px, py) { var r = Math.hypot(px - cx, py - cy) / R; return r <= 1 ? 0.12 + 0.35 * r * r : 0; }, alfa(C.ink, .35), 2.6);
      g.strokeStyle = alfa(C.ink, .6); g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.stroke();
      g.beginPath(); for (var k = 0; k <= 72; k++) { var a = k / 72 * 6.2832, p = proietta([Math.cos(a), Math.sin(a), 0], cx, cy, R); k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.setLineDash([3, 3]); g.stroke(); g.setLineDash([]);
      [["H", [0, 0, 1]], ["V", [0, 0, -1]], ["D", [1, 0, 0]], ["R", [0, 1, 0]]].forEach(function (e) { var p = proietta(e[1], cx, cy, R * 1.12); g.fillStyle = C.muted; g.font = "12px " + MONO; g.textAlign = "center"; g.fillText(e[0], p[0], p[1] + 4); });
      g.textAlign = "left";
      var comm = Cm.checked, v0 = comm ? [1, 0, 0] : [0, 0, 1], A = percorso(comm ? ["z", "z"] : ["y", "z"], th, v0), B = percorso(comm ? ["z", "z"] : ["z", "y"], th, v0);
      function linea(P, col, w, dash) { g.strokeStyle = col; g.lineWidth = w; g.setLineDash(dash || []); g.beginPath(); P.pts.forEach(function (v, i) { var p = proietta(v, cx, cy, R); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.stroke(); g.setLineDash([]); var f = proietta(P.fine, cx, cy, R); g.fillStyle = col; g.beginPath(); g.arc(f[0], f[1], 5, 0, 6.2832); g.fill(); }
      linea(A, C.amber, 2.6); linea(B, C.ink, 1.6, [5, 4]);
      var p0 = proietta(v0, cx, cy, R); g.fillStyle = C.ink; g.beginPath(); g.arc(p0[0], p0[1], 3.5, 0, 6.2832); g.fill();
      var fed = (1 + A.fine[0] * B.fine[0] + A.fine[1] * B.fine[1] + A.fine[2] * B.fine[2]) / 2;
      el.querySelector("#" + u + "t-o").textContent = T.value + "°";
      num.innerHTML = (comm ? 'due lamine: K₁ = K₂ ∝ σ_z, i generatori commutano; si parte da |D⟩' : '<b>rosso</b>: prima il rotatore (σ_y), poi la lamina (σ_z)<br>tratteggio: prima la lamina, poi il rotatore') + '<br>fedeltà tra i due stati finali |⟨ψ_a|ψ_b⟩|² = <b>' + f3(fed) + '</b>' + (comm ? '<br><span class="t">l\'ordine non conta: U = exp(−i ∫ K dt)</span>' : (fed < 0.999 ? '<br><span class="w">l\'ordine conta: serve l\'ordinamento temporale T</span>' : ''));
    }
    T.oninput = Cm.onchange = draw; draw(); ridisegna(draw); var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(draw, 150); });
  }

  var LABS = { hero: hero, malus: malus, born: born, fasori: fasori, base: base, corda: corda, bohm: bohm, scatola: scatola, chsh: chsh, grw: grw, rami: rami, discreto: discreto, ordine: ordine };
  function avvia() {
    leggi(); filetti(); libri(); indice();
    if (window.matchMedia) { var mq = matchMedia("(prefers-color-scheme: dark)"); if (mq.addEventListener) mq.addEventListener("change", temaCambiato); }
    if ("MutationObserver" in window) new MutationObserver(temaCambiato).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(temaCambiato);
    document.querySelectorAll("[data-lab]").forEach(function (el) { var fn = LABS[el.dataset.lab]; if (fn) { try { fn(el); } catch (e) { el.textContent = "Il laboratorio non si è caricato: " + e.message; } } });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", avvia); else avvia();
})();
