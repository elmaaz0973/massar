// انحدار خطي بطريقة المربعات الصغرى: y = slope * x + intercept
export function linearRegression(points) {
  const n = points.length;
  if (n < 2) return null;
  const mx = points.reduce((s, p) => s + p.x, 0) / n;
  const my = points.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (const p of points) {
    sxx += (p.x - mx) ** 2;
    sxy += (p.x - mx) * (p.y - my);
    syy += (p.y - my) ** 2;
  }
  if (sxx === 0) return null; // كل النقاط على خط رأسي
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const r = syy === 0 ? null : sxy / Math.sqrt(sxx * syy);
  const sse = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  return { n, slope, intercept, r, r2: r === null ? null : r * r, sse };
}

export const predict = (model, x) => model.slope * x + model.intercept;

export function describeCorrelation(r) {
  if (r === null) return 'لا يمكن حساب معامل الارتباط (كل قيم y متساوية)';
  const a = Math.abs(r);
  const strength = a >= 0.9 ? 'قوية جداً' : a >= 0.7 ? 'قوية' : a >= 0.4 ? 'متوسطة' : a >= 0.1 ? 'ضعيفة' : null;
  if (!strength) return 'لا توجد علاقة خطية تُذكر';
  return `علاقة ${r > 0 ? 'طردية' : 'عكسية'} ${strength}`;
}
