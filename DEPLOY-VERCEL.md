# نشر منصة مسار على Vercel (الواجهة + الـ API معًا)

المشروع مجهّز: الواجهة (`client`) تُبنى كموقع ثابت، وكل مسارات `/api/*` تعمل كدالة Serverless واحدة (`api/index.js`) تشغّل تطبيق Express نفسه. لا يوجد سيرفر منفصل.

## 1) قاعدة البيانات (MongoDB Atlas – مجاني)
1. أنشئ Cluster مجاني على https://www.mongodb.com/atlas
2. Database Access → أضف مستخدمًا بكلمة مرور.
3. Network Access → أضف `0.0.0.0/0` (Vercel لا يملك IP ثابتًا).
4. Connect → Drivers → انسخ رابط الاتصال (`mongodb+srv://...`) وضع اسم القاعدة في آخره، مثل `.../masar`.

## 2) تعبئة القاعدة (مرة واحدة، من جهازك)
```
npm run install:all
cp server/.env.example server/.env      # ضع MONGODB_URI (رابط Atlas) و JWT_SECRET
npm run seed
npm run create:admin -- (راجع README لصيغة الأمر)
```
(`seed` يُنشئ الصفين الأول والثاني والدروس والكويزات، ويحذف الصف الثالث القديم إن وُجد.)

## 3) الرفع على Vercel
1. ارفع المجلد كاملًا على GitHub.
2. Vercel → Add New Project → اختر المستودع. **Root Directory = جذر المشروع** (الذي فيه `vercel.json`). لا تغيّر أوامر البناء، فهي مضبوطة في `vercel.json`.
3. Environment Variables (Production):
   - `MONGODB_URI` = رابط Atlas
   - `JWT_SECRET` = نص عشوائي 32 حرفًا أو أكثر (`openssl rand -hex 32`)
   - `CLIENT_ORIGIN` = دومين الموقع (مثل `https://masar.vercel.app`) — اختياري لأن الواجهة والـ API على نفس الدومين.
4. Deploy. اختبر `https://دومينك/api/health` (يجب أن يرد `{"ok":true}`) ثم `/api/stages`.

## ملاحظات
- أي تعديل على الدروس (ملفات `server/seed/content`) يحتاج إعادة `npm run seed` على قاعدة Atlas، أو التعديل من لوحة التحكم.
- حد المحاولات (rate limit) يُحسب داخل كل نسخة من الدالة، فهو أضعف قليلًا من السيرفر الدائم. للحماية الأقوى استخدم Vercel Firewall/Upstash لاحقًا.
- الدالة لها مهلة 15 ثانية؛ أول طلب بعد خمول قد يكون أبطأ (اتصال القاعدة).
