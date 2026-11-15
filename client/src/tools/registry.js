import { lazy } from 'react';

// lessons: قائمة بالدروس المرتبطة بالصيغة "stage-slug/lesson-slug"
export const tools = [
  {
    slug: 'binary-converter', icon: '/tools/binary-converter.png', title: 'محوّل الأنظمة العددية', stage: 'grade-1',
    description: 'حوّل بين العشري والثنائي والسادس عشر وشاهد الخطوات: قيمة الخانات، والقسمة على 2، وتجميع كل 4 بتات.',
    lessons: ['grade-1/lesson-6-2', 'grade-1/lesson-6-3'],
    Component: lazy(() => import('./BinaryConverter.jsx')),
  },
  {
    slug: 'color-bits', icon: '/tools/color-bits.png', title: 'الألوان وحجم الصور', stage: 'grade-1',
    description: 'اصنع لوناً من الأحمر والأخضر والأزرق، وشاهد تمثيله الثنائي، واحسب حجم بيانات الصورة بالـ bit.',
    lessons: ['grade-1/lesson-6-8'],
    Component: lazy(() => import('./ColorBits.jsx')),
  },
  {
    slug: 'audio-sampling', icon: '/tools/audio-sampling.png', title: 'رقمنة الصوت', stage: 'grade-1',
    description: 'غيّر تردد أخذ العينات وعمق bit الكمي وشاهد كيف تتحول الموجة إلى قيم، واحسب كمية بيانات الصوت.',
    lessons: ['grade-1/lesson-6-7'],
    Component: lazy(() => import('./AudioSampling.jsx')),
  },
  {
    slug: 'caesar-cipher', icon: '/tools/caesar-cipher.png', title: 'تشفير قيصر وكسره', stage: 'grade-1',
    description: 'شفّر وفكّ الشفرة بالإنجليزية والعربية، وجرّب كسرها بالقوة الغاشمة وتحليل التكرار.',
    lessons: ['grade-2/lesson-2-1'],   // لم يُربط بدرس الصف الأول 4-3 لأن الكتاب لا يذكر تشفير قيصر هناك؛ يُراجَع مع درس الصف الثاني 2-1
    Component: lazy(() => import('./CaesarCipher.jsx')),
  },
  {
    slug: 'password-strength', icon: '/tools/password-strength.png', title: 'إرشادات كلمة المرور', stage: 'grade-1',
    description: 'قارن كلمة مرور تجريبية بإرشادات الكتاب: الطول وأنواع الأحرف.',
    lessons: ['grade-1/lesson-3-2', 'grade-2/lesson-2-1'],
    Component: lazy(() => import('./PasswordStrength.jsx')),
  },
  {
    slug: 'web-editor', icon: '/tools/web-editor.png', title: 'محرر الويب (HTML / CSS / JS)', stage: 'grade-1',
    description: 'اكتب صفحة ويب صغيرة وشاهد نتيجتها فوراً في معاينة آمنة ومعزولة.',
    lessons: ['grade-2/lesson-3-3'],
    Component: lazy(() => import('./WebEditor.jsx')),
  },
  {
    slug: 'regression', hidden: true, // مخفية من صفحة الأدوات بطلب المالك (الكود والمسار محفوظان)
     title: 'الانحدار الخطي التفاعلي', stage: 'grade-2',
    description: 'ضع نقاطاً على الرسم وشاهد خط الانحدار ومعامل الارتباط يتغيران، وجرّب أثر القيم الشاذة.',
    lessons: ['grade-2/lesson-6-2'],
    Component: lazy(() => import('./Regression.jsx')),
  },
];

export const visibleTools = tools.filter((t) => !t.hidden);

export const findTool = (slug) => tools.find((t) => t.slug === slug);
export const toolsForLesson = (stageSlug, lessonSlug) => tools.filter((t) => t.lessons.includes(`${stageSlug}/${lessonSlug}`));
