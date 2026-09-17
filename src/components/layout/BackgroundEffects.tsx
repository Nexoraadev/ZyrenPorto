  "use client";

  import { useEffect, useRef } from "react";

  // ─── 1. Aurora Blobs (opacity turun dari sebelumnya) ─────────────────────────
  function AuroraBlobs() {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden hidden md:block" aria-hidden="true">
        <div className="absolute rounded-full blur-[130px]"
          style={{
            width:"min(550px,80vw)",height:"min(550px,80vw)",opacity:0.09,
            background:"radial-gradient(circle,#0e7490 0%,#083344 60%,transparent 100%)",
            top:"-80px",left:"-80px",
            animation:"blob1 20s ease-in-out infinite",
          }}
        />
        <div className="absolute rounded-full blur-[150px]"
          style={{
            width:"min(650px,90vw)",height:"min(650px,90vw)",opacity:0.07,
            background:"radial-gradient(circle,#0891b2 0%,#083344 55%,transparent 100%)",
            bottom:"-120px",right:"-120px",
            animation:"blob2 26s ease-in-out infinite",
          }}
        />
        <style>{`
          @keyframes blob1{0%,100%{transform:translate(0,0) scale(1)}
            33%{transform:translate(70px,50px) scale(1.06)}
            66%{transform:translate(-30px,100px) scale(0.96)}}
          @keyframes blob2{0%,100%{transform:translate(0,0) scale(1)}
            40%{transform:translate(-80px,-60px) scale(1.08)}
            70%{transform:translate(-40px,-100px) scale(0.94)}}
        `}</style>
      </div>
    );
  }

  // ─── 2. Starfield — red-dark + grey particles ─────────────────────────────────
  function Starfield() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Skip on mobile for performance
      const isMobile = window.innerWidth < 768;
      if (isMobile) return;

      const W = () => window.innerWidth;
      const H = () => window.innerHeight;
      canvas.width  = W();
      canvas.height = H();

      const resize = () => { canvas.width = W(); canvas.height = H(); init(); };
      window.addEventListener("resize", resize);

      interface Star {
        x: number; y: number;
        size: number; opacity: number;
        vx: number; vy: number;
        color: string;
        twinkleSpeed: number;
        twinkleOffset: number;
      }

      let stars: Star[] = [];
      let scrollY = 0;

      const COLORS = [
        "rgba(34,211,238,",
        "rgba(6,182,212,",
        "rgba(100,116,139,",
        "rgba(148,163,184,",
        "rgba(45,212,191,",
      ];

      function init() {
        // Use far fewer stars for better performance
        const count = Math.floor((W() * H()) / 9000);
        stars = Array.from({ length: count }, () => ({
          x:             Math.random() * W(),
          y:             Math.random() * H(),
          size:          0.4 + Math.random() * 1.4,
          opacity:       0.15 + Math.random() * 0.45,
          vx:            (Math.random() - 0.5) * 0.1,
          vy:            (Math.random() - 0.5) * 0.07,
          color:         COLORS[Math.floor(Math.random() * COLORS.length)],
          twinkleSpeed:  0.008 + Math.random() * 0.012,
          twinkleOffset: Math.random() * Math.PI * 2,
        }));
      }

      init();

      let t = 0;
      let rafId: number;
      let lastRaf = 0;
      const onScroll = () => { scrollY = window.scrollY; };
      window.addEventListener("scroll", onScroll, { passive: true });

      function draw(now: number) {
        // Throttle to ~30fps on desktop for lower CPU usage
        if (now - lastRaf < 33) { rafId = requestAnimationFrame(draw); return; }
        lastRaf = now;

        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        t += 0.01;

        const scrollBoost = Math.min(scrollY * 0.0003, 0.5);

        for (const s of stars) {
          s.x += s.vx * (1 + scrollBoost * 3);
          s.y += s.vy * (1 + scrollBoost * 2);

          if (s.x < -2)                s.x = canvas!.width  + 2;
          if (s.x > canvas!.width  + 2) s.x = -2;
          if (s.y < -2)                s.y = canvas!.height + 2;
          if (s.y > canvas!.height + 2) s.y = -2;

          const twinkle = 0.7 + 0.3 * Math.sin(t * s.twinkleSpeed * 80 + s.twinkleOffset);
          const alpha   = s.opacity * twinkle;

          ctx!.beginPath();
          ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx!.fillStyle = s.color + alpha + ")";
          ctx!.fill();

          // Only large stars get glow
          if (s.size > 1.2) {
            const g = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
            g.addColorStop(0, s.color + (alpha * 0.4) + ")");
            g.addColorStop(1, s.color + "0)");
            ctx!.beginPath();
            ctx!.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
            ctx!.fillStyle = g;
            ctx!.fill();
          }
        }

        rafId = requestAnimationFrame(draw);
      }
      rafId = requestAnimationFrame(draw);

      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(rafId);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none hidden md:block"
        style={{ opacity: 0.85, mixBlendMode: "screen" as React.CSSProperties["mixBlendMode"] }}
        aria-hidden="true"
      />
    );
  }

  // ─── 3. Noise / Grain Texture overlay ────────────────────────────────────────
  function NoiseTexture() {
    return (
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.025,
          mixBlendMode: "overlay" as React.CSSProperties["mixBlendMode"],
        }}
        aria-hidden="true"
      />
    );
  }

  // ─── 4. Blood Crack Trail (cursor) ────────────────────────────────────────────
  interface Branch {
    points: { x: number; y: number }[];
    width: number;
  }
  interface CrackSystem {
    x: number; y: number;
    branches: Branch[];
    life: number;
  }

  function genCrack(sx: number, sy: number, angle: number, len: number, depth: number): Branch[] {
    const branches: Branch[] = [];
    const pts: { x: number; y: number }[] = [{ x: sx, y: sy }];
    let x = sx, y = sy, a = angle;
    const seg = 9 + Math.random() * 11;
    const n   = Math.floor(len / seg);
    for (let i = 0; i < n; i++) {
      a += (Math.random() - 0.5) * 0.65;
      x += Math.cos(a) * seg;
      y += Math.sin(a) * seg;
      pts.push({ x, y });
      if (depth > 0 && Math.random() < 0.3) {
        const ba = a + (Math.random() - 0.5) * 1.8;
        branches.push(...genCrack(x, y, ba, len * 0.45, depth - 1));
      }
    }
    branches.unshift({ points: pts, width: 1.4 - depth * 0.35 });
    return branches;
  }

  function BloodCrackTrail() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Disable on touch/mobile devices — saves main-thread significantly
      const isTouchOnly = !window.matchMedia("(hover: hover)").matches;
      if (isTouchOnly) return;

      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
      window.addEventListener("resize", resize);

      const cracks: CrackSystem[] = [];
      let lastX = -999, lastY = -999, rafId: number;

      const spawn = (x: number, y: number) => {
        if (Math.hypot(x - lastX, y - lastY) < 20) return;
        lastX = x; lastY = y;
        for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
          const a = Math.atan2(y - lastY, x - lastX) + (Math.random() - 0.5) * 2.8;
          cracks.push({ x, y, branches: genCrack(x, y, a, 35 + Math.random() * 45, 2), life: 1 });
        }
        if (cracks.length > 35) cracks.splice(0, cracks.length - 35);
      };

      const onMove  = (e: MouseEvent) => spawn(e.clientX, e.clientY);
      const onTouch = (e: TouchEvent) => { const t = e.touches[0]; if (t) spawn(t.clientX, t.clientY); };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onTouch);

      const drawBranch = (b: Branch, a: number) => {
        if (b.points.length < 2) return;
        // glow
        ctx.save();
        ctx.shadowBlur  = 7;
        ctx.shadowColor = `rgba(34,211,238,${a*0.35})`;
        ctx.strokeStyle = `rgba(8,145,178,${a*0.55})`;
        ctx.lineWidth   = b.width + 0.8;
        ctx.lineCap     = "round";
        ctx.beginPath();
        ctx.moveTo(b.points[0].x, b.points[0].y);
        b.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.restore();
        // core
        ctx.save();
        ctx.strokeStyle = `rgba(94,234,212,${a*0.8})`;
        ctx.lineWidth   = b.width * 0.45;
        ctx.lineCap     = "round";
        ctx.beginPath();
        ctx.moveTo(b.points[0].x, b.points[0].y);
        b.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.restore();
      };

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = cracks.length - 1; i >= 0; i--) {
          const c = cracks[i];
          c.life -= 0.016;
          if (c.life <= 0) { cracks.splice(i, 1); continue; }
          c.branches.forEach((b) => drawBranch(b, c.life));
          ctx.beginPath();
          ctx.arc(c.x, c.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34,211,238,${c.life*0.7})`;
          ctx.fill();
        }
        rafId = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("touchmove", onTouch);
        cancelAnimationFrame(rafId);
      };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-[2] pointer-events-none" aria-hidden="true" />;
  }

  // ─── Export ───────────────────────────────────────────────────────────────────
  export function BackgroundEffects() {
    return (
      <>
        <AuroraBlobs />
        <Starfield />
        <NoiseTexture />
        <BloodCrackTrail />
      </>
    );
  }
