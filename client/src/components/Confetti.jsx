import { useEffect, useRef } from 'react';

// احتفال بسيط بالـ canvas بدون مكتبات. لا يعمل لمن فعّل "تقليل الحركة".
export default function Confetti({ fire }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!fire || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const cv = ref.current; if (!cv) return undefined;
    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = (cv.width = innerWidth * dpr), H = (cv.height = innerHeight * dpr);
    const colors = ['#ffb703', '#fb5607', '#ff006e', '#8338ec', '#3a86ff', '#06d6a0'];
    const parts = Array.from({ length: 140 }, () => ({
      x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, r: (4 + Math.random() * 6) * dpr,
      vx: (Math.random() - .5) * 16 * dpr, vy: (-6 - Math.random() * 12) * dpr, g: .38 * dpr,
      rot: Math.random() * 6, vr: (Math.random() - .5) * .4, c: colors[(Math.random() * colors.length) | 0],
    }));
    let raf, t0 = performance.now();
    const tick = (t) => {
      ctx.clearRect(0, 0, W, H);
      const life = (t - t0) / 3200;
      parts.forEach((p) => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vx *= .99;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(0, 1 - life);
        ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 3, p.r, p.r * .66); ctx.restore();
      });
      if (life < 1) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fire]);
  return <canvas ref={ref} aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 60 }} />;
}
