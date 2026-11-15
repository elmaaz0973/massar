---
source: كتاب البرمجة والذكاء الاصطناعي – الصف الأول الثانوي، الدرس 3-13 «HTML, JS»، ص 196–200 (التمارين ص 197–200)
---

## النقاط الرئيسية

**JavaScript** تُعد لغة برمجة تعمل داخل متصفحات الويب. ومن خلال دمجها في صفحات الويب، يمكنك إضفاء تفاعلية على الصفحة أو إحداث تغييرات استجابةً لإجراءات المستخدم.

من خلال تضمينها في صفحات الويب، يمكنك تحويل الصفحة إلى تفاعلية (Interactive)، بحيث تتغير وتستجيب لإجراءات المستخدم (User Action).

| اللغة | دورها في الشكل التوضيحي |
|---|---|
| HTML | المحتوى والبنية (Content and Structure): العناوين (Headings)، النص (text)، إلخ |
| JavaScript | التحكم والتعديل (Manipulation): التحريك (Moving)، التغيير (changing)، التكبير (zooming)، إلخ |

(الشكل في الكتاب: مثال كود HTML ومثال كود JavaScript يظهران معاً في عرض المتصفح (Browser Display).)

في المثال السابق، تم تحديد الوسم (tag) `<p>` في لغة HTML باستخدام مُحدِّد فريد `id`، وتستخدم لغة JavaScript هذا الـ id للوصول إلى تلك الفقرة وتغيير النص الموجود بداخلها. أما الخاصية `textContent`، فهي الأداة المستخدمة خصيصاً لتحديد (أو الوصول إلى) المحتوى النصي داخل أي وسم (tag).

### تعديل صفحة التعريف بالنفس باستخدام JavaScript

لنحاول تعديل صفحة التعريف بالنفس باستخدام JavaScript.

**كود HTML**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>About Me</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<h1 id="name">Adam</h1>
</body>
</html>
```

**كود JavaScript**

```javascript
document.getElementById("name").textContent = "Omar";
```

قم بنسخ ولصق (أو كتابة) الكود في WebDen ثم قم بتشغيله. **النتيجة:** ستلاحظ أن الاسم قد تغير.

### التفاعل مع الأزرار

بعد ذلك، لنجرب تغيير النص من خلال النقر على زر.

**كود HTML:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>About Me</title>
</head>
<body>
<p id="name">Adam</p>
<button id="btn">Text Change</button>
</body>
</html>
```

**وكود JavaScript:**

```javascript
const p = document.getElementById("name");
const btn = document.getElementById("btn");
btn.onclick = () => {
  p.textContent = "Omar";
};
```

عند تشغيل الكود في WebDen والضغط على الزر: يتغير الاسم فوراً.

### تغيير حجم النص

**كود HTML:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>About Me</title>
</head>
<body>
<p id="name">Adam</p>
<button id="btn">Size Change</button>
</body>
</html>
```

**كود JavaScript:**

```javascript
const text = document.getElementById("name");
const btn = document.getElementById("btn");
btn.onclick = () => {
  text.style.fontSize = 50 + "px";
};
```

عند الضغط على الزر: سيصبح حجم خط الاسم أكبر.

### حاول بنفسك

- لنحاول جعل لون النص وحجمه يتغيران معاً عند الضغط على الزر.
- لنضف عنصراً جديداً للعرض، ونحاول إنشاء دالة (Function) تقوم بدمج نصوص العنصرين معاً عند النقر على الزر.

### تدريب

لنحاول جعل لون النص يتبادل بين اللونين الأحمر والأزرق في كل مرة يتم فيها الضغط على الزر.

> تمارين هذا الدرس (تحدّى معلوماتك، جرّب بنفسك، تمرين) موجودة في الكتاب ص 197–200. الكويز أدناه مبني على شرح الدرس فقط.
