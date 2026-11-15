import { useEffect, useRef } from 'react';
import robotSvg from './robotSvg.js';

// الخلفية المتحركة منقولة من ملف masar1.html: ثلاث طبقات متدرجة تتبدل كل 5 ثوانٍ،
// فقاعات صاعدة، موجات متوازية، والروبوت. الألوان تأتي من متغيرات الثيم (فاتح/داكن + اللون الرئيسي).
export default function Background({ showRobot = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const layers = [...root.querySelectorAll('.bg')];
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || layers.length < 2) return undefined;
    let active = 0;
    const id = window.setInterval(() => {
      layers[active].classList.remove('show');
      active = (active + 1) % layers.length;
      layers[active].classList.add('show');
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="masar-bg" ref={ref} aria-hidden="true">
      <div className="bg bg-1 show" />
      <div className="bg bg-2" />
      <div className="bg bg-3" />
      <ul className="circles">
        {Array.from({ length: 10 }, (_, i) => <li key={i} />)}
      </ul>
      {showRobot && <div className="robot bg-robot" dangerouslySetInnerHTML={{ __html: robotSvg }} />}
      <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g className="parallax">
          <use xlinkHref="#gentle-wave" x="48" y="0" />
          <use xlinkHref="#gentle-wave" x="48" y="3" />
          <use xlinkHref="#gentle-wave" x="48" y="5" />
          <use xlinkHref="#gentle-wave" x="48" y="7" />
        </g>
      </svg>
    </div>
  );
}
