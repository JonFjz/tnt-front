import { useRef, useEffect } from "react";

export default function Starfield() {
  const bgRef = useRef(null); // static layer: tiny stars + bottom glow
  const fxRef = useRef(null); // animated layer: medium/bright stars

  useEffect(() => {
    const bg = bgRef.current;
    const fx = fxRef.current;
    const bgCtx = bg.getContext("2d");
    const fxCtx = fx.getContext("2d");

    // Tuned for realism + restraint
    const CFG = {
      densitySmall: 1 / 2400,   // static pinpricks
      densityMed:   1 / 12000,  // animated
      densityBig:   1 / 30000,  // animated (few brights)
      driftX: 0.15,             // barely perceptible drift
      twinkleSpeed: 0.28,       // slow brightness modulation
      appearSpeed:  0.02,       // slow fade cycle
      band: false,              // set true for diagonal bias
      maxDPR: 1.5,              // clamp DPI to keep fill cheap
      targetFPS: 30,            // throttle
      bottomGlowStrength: 0.10, // softer white light from bottom
    };

    let DPR = 1, W = 0, H = 0, raf;
    let smallStars = []; // static points
    let stars = [];      // animated medium/bright
    let sprites = {};    // cached star sprites
    let last = 0, acc = 0, frameMs = 1000 / CFG.targetFPS;

    // ---------- helpers ----------
    const rnd = (a, b) => a + Math.random() * (b - a);
    function rndGauss(mu = 0, sigma = 1) {
      const u = 1 - Math.random(), v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * sigma + mu;
    }
    function bandY(x, angle = -0.45, spread = 80) {
      const cx = W / 2, cy = H / 2;
      return Math.tan(angle) * (x - cx) + cy + rndGauss(0, spread);
    }
    function clampDPR() {
      return Math.min(CFG.maxDPR, window.devicePixelRatio || 1);
    }
    function smoothstep(e0, e1, x) {
      const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
      return t * t * (3 - 2 * t);
    }

    // Photographic-looking point spread function:
    // tiny, crisp core + short halo; subtle chroma helps realism.
    function makePSFSprite({ rCore, rHalo, tintH = 210 }) {
      const R = rHalo; // total radius we paint to
      const size = Math.ceil((R) * 2 + 2);
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      const cx = size / 2, cy = size / 2;

      // Additive composition inside the sprite to keep a hot core
      ctx.globalCompositeOperation = "lighter";

      // 1) Crisp core
      const gCore = ctx.createRadialGradient(cx, cy, 0, cx, cy, rCore);
      gCore.addColorStop(0.0, "rgba(255,255,255,1)");
      gCore.addColorStop(0.9, "rgba(255,255,255,0.85)");
      gCore.addColorStop(1.0, "rgba(255,255,255,0.0)");
      ctx.fillStyle = gCore;
      ctx.beginPath(); ctx.arc(cx, cy, rCore, 0, Math.PI * 2); ctx.fill();

      // 2) Very short, soft halo (exponential falloff feel)
      const gHalo = ctx.createRadialGradient(cx, cy, rCore * 0.6, cx, cy, R);
      gHalo.addColorStop(0.0, "rgba(255,255,255,0.35)");
      gHalo.addColorStop(0.6, "rgba(255,255,255,0.10)");
      gHalo.addColorStop(1.0, "rgba(255,255,255,0.0)");
      ctx.fillStyle = gHalo;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      // 3) Subtle cool tint near core (barely visible, avoids flat white)
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = `hsl(${tintH}, 18%, 92%)`;
      ctx.beginPath(); ctx.arc(cx, cy, rCore * 0.85, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      // 4) Tiny diffraction cross (short & faint)
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = "white";
      ctx.lineWidth = 0.6;
      const len = rCore * 2.2; // short
      ctx.beginPath();
      ctx.moveTo(cx - len, cy); ctx.lineTo(cx + len, cy);
      ctx.moveTo(cx, cy - len); ctx.lineTo(cx, cy + len);
      ctx.stroke();
      ctx.globalAlpha = 1;

      return c;
    }

    function makeSprites() {
      // Smaller stars than before; halos are tight
      sprites.m = makePSFSprite({ rCore: 0.9,  rHalo: 2.4, tintH: 210 }); // medium
      sprites.l = makePSFSprite({ rCore: 1.2,  rHalo: 3.2, tintH: 205 }); // bright
    }

    function makeSmallStars() {
      const n = Math.max(1, Math.floor(W * H * CFG.densitySmall));
      smallStars = Array.from({ length: n }, () => {
        const x = Math.random() * W;
        const y = CFG.band && Math.random() < 0.5 ? bandY(x) : Math.random() * H;
        return { x, y, a: rnd(0.35, 0.9) };
      });
    }

    function makeAnimatedStars() {
      const medN = Math.max(1, Math.floor(W * H * CFG.densityMed));
      const bigN = Math.max(1, Math.floor(W * H * CFG.densityBig));
      stars = [];

      // Medium
      for (let i = 0; i < medN; i++) {
        const x = Math.random() * W;
        const y = CFG.band && Math.random() < 0.5 ? bandY(x) : Math.random() * H;
        stars.push({
          x, y,
          size: "m",
          z: rnd(0.7, 1.0),              // minimal parallax weight
          baseA: rnd(0.45, 0.9),
          twPhase: Math.random() * Math.PI * 2,
          appearPhase: Math.random(),
        });
      }
      // Bright (still small, just hotter core)
      for (let i = 0; i < bigN; i++) {
        const x = Math.random() * W;
        const y = CFG.band && Math.random() < 0.5 ? bandY(x) : Math.random() * H;
        stars.push({
          x, y,
          size: "l",
          z: rnd(0.7, 1.0),
          baseA: rnd(0.5, 0.95),
          twPhase: Math.random() * Math.PI * 2,
          appearPhase: Math.random(),
        });
      }
    }

    function drawBackground() {
      // deep space gradient
      const g = bgCtx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.5, H * 0.5, Math.max(W, H));
      g.addColorStop(0, "#05070f");
      g.addColorStop(1, "#000000");
      bgCtx.fillStyle = g;
      bgCtx.fillRect(0, 0, W, H);

      // softer "white light" glow from bottom
      const glow = bgCtx.createRadialGradient(W / 2, H * 1.08, H * 0.05, W / 2, H * 1.08, H * 0.9);
      glow.addColorStop(0.0, `rgba(255,255,255,${CFG.bottomGlowStrength * 1.6})`);
      glow.addColorStop(0.35, `rgba(255,255,255,${CFG.bottomGlowStrength * 0.8})`);
      glow.addColorStop(0.65, `rgba(255,255,255,${CFG.bottomGlowStrength * 0.3})`);
      glow.addColorStop(1.0, "rgba(255,255,255,0.0)");
      bgCtx.fillStyle = glow;
      bgCtx.fillRect(0, 0, W, H);

      // tiny static stars
      bgCtx.fillStyle = "#fff";
      for (const s of smallStars) {
        bgCtx.globalAlpha = s.a;
        bgCtx.fillRect(s.x, s.y, 1, 1);
      }
      bgCtx.globalAlpha = 1;
    }

    function resize() {
      DPR = clampDPR();
      W = window.innerWidth;
      H = window.innerHeight;

      for (const c of [bg, fx]) {
        c.width = Math.floor(W * DPR);
        c.height = Math.floor(H * DPR);
        c.style.width = W + "px";
        c.style.height = H + "px";
        c.getContext("2d").setTransform(DPR, 0, 0, DPR, 0, 0);
      }

      makeSprites();
      makeSmallStars();
      makeAnimatedStars();
      drawBackground();
    }

    // ---------- animation ----------
    function frame(now) {
      if (!last) last = now;
      acc += now - last;
      last = now;

      if (acc >= frameMs) {
        acc = 0;
        drawAnimated(now / 1000);
      }
      raf = requestAnimationFrame(frame);
    }

    function drawAnimated(t) {
      fxCtx.clearRect(0, 0, W, H);

      // Additive blending makes small stars “pop” without huge blur
      const prevComp = fxCtx.globalCompositeOperation;
      fxCtx.globalCompositeOperation = "lighter";

      for (const s of stars) {
        // barely-there drift
        const drift = Math.sin(t * 0.15 + s.x * 0.001) * CFG.driftX * s.z;
        const px = (s.x + drift + W) % W;
        const py = s.y;

        // brightness twinkle only (no radius pop)
        const tw = 0.92 + 0.08 * Math.sin(CFG.twinkleSpeed * t + s.twPhase);

        // very gentle fade cycle — never fully disappears
        const cycle = (s.appearPhase + t * CFG.appearSpeed) % 1;
        const env = cycle < 0.5
          ? 0.6 + 0.4 * smoothstep(0.0, 0.5, cycle)     // 0.6 → 1.0
          : 0.6 + 0.4 * smoothstep(1.0, 0.5, cycle);    // 1.0 → 0.6

        const alpha = Math.min(0.95, s.baseA * tw * env);
        if (alpha < 0.05) continue;

        fxCtx.globalAlpha = alpha;

        const spr = s.size === "l" ? sprites.l : sprites.m;
        fxCtx.drawImage(spr, Math.round(px - spr.width / 2), Math.round(py - spr.height / 2));
      }

      fxCtx.globalAlpha = 1;
      fxCtx.globalCompositeOperation = prevComp;
    }

    // init
    resize();
    drawBackground();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="starfield-wrap">
      <canvas ref={bgRef} />
      <canvas ref={fxRef} />
    </div>
  );
}
