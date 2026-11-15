export function Loading() { return <p className="state">جارٍ التحميل…</p>; }
export function ErrorBox({ message }) { return <p className="state error">{message}</p>; }
