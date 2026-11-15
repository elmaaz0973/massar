import { ADS } from '../config.js';

// مكان مخصص للإعلان. حالياً مجرد placeholder واضح.
// لاحقاً: ضع كود شبكة الإعلانات (مثل AdSense) داخل هذا المكوّن فقط، فتتغير كل الصفحات معاً.
// نحجز مساحة ثابتة (min-height) حتى لا تقفز الصفحة عند تحميل الإعلان.
export default function AdSlot({ position = 'top' }) {
  if (!ADS.enabled || !ADS[position]) return null;
  return (
    <div className={`ad-slot ad-${position}`} role="complementary" aria-label="مساحة إعلانية">
      <span>إعلان</span>
    </div>
  );
}
