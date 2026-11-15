// هيكل المنهج منقول من فهارس الكتب نفسها (قُرئت كصور) ومن صفحات افتتاح الوحدات.
// page = رقم صفحة بداية الدرس كما هو مطبوع في الكتاب. نهاية الدرس = صفحة قبل بداية الدرس التالي.
// ترقيم الدروس: الصف الأول يكتب الكتاب «رقم الدرس-رقم الوحدة» (مثل 2-6)، والصف الثاني «رقم الوحدة-رقم الدرس» (مثل 3-1).
// الـ slug داخلي دائماً بالشكل lesson-<وحدة>-<درس>.

export const books = {
  g1:  { title: 'البرمجة والذكاء الاصطناعي – مقدمة في تكنولوجيا المعلومات والاتصالات – الصف الأول الثانوي', short: 'كتاب الصف الأول الثانوي', lastPage: 218 },
  g2a: { title: 'البرمجة والذكاء الاصطناعي – الصف الثاني الثانوي (الترم الأول – الفصول 1 إلى 4)', short: 'كتاب الصف الثاني، الترم الأول', lastPage: 94 },
  g2b: { title: 'البرمجة والذكاء الاصطناعي – الصف الثاني الثانوي (الترم الثاني – الفصول 5 إلى 7)', short: 'كتاب الصف الثاني، الترم الثاني', lastPage: 76 },
};

export const stages = [
  {
    slug: 'grade-1',
    title: 'الصف الأول الثانوي',
    subject: 'البرمجة والذكاء الاصطناعي – مقدمة في تكنولوجيا المعلومات والاتصالات',
    description: '13 وحدة و62 درساً كما في الكتاب المدرسي.',
    order: 1,
    comingSoon: false,
    numberOrder: 'lesson-unit',
    units: [
      { number: 1, term: 1, book: 'g1', title: "ما هي المعلومات؟", lessons: [{ title: "المعلومات والوسائط", page: 8 }, { title: "أخلاقيات المعلومات", page: 12 }] },
      { number: 2, term: 1, book: 'g1', title: "القوانين والحقوق في مجتمع المعلومات", lessons: [{ title: "البيانات الشخصية", page: 17 }, { title: "حقوق الملكية الفكرية", page: 21 }, { title: "استخدام المعلومات والكشف عنها", page: 25 }] },
      { number: 3, term: 1, book: 'g1', title: "أمن المعلومات", lessons: [{ title: "تهديدات وإجراءات مواجهة أمن المعلومات (1)", page: 30 }, { title: "التهديدات والتدابير المضادة في أمن المعلومات (2)", page: 34 }, { title: "التهديدات والتدابير المضادة في أمن المعلومات (3)", page: 38 }, { title: "تقنيات المعلومات للسلامة (1)", page: 41 }, { title: "تقنيات المعلومات للسلامة (2)", page: 44 }] },
      { number: 4, term: 1, book: 'g1', title: "تكنولوجيا المعلومات والمجتمع", lessons: [{ title: "تطور تكنولوجيا المعلومات", page: 49 }] },
      { number: 5, term: 1, book: 'g1', title: "الاتصالات", lessons: [{ title: "تطوير وسائل الاتصال", page: 54 }, { title: "الاتصال وأشكاله", page: 56 }, { title: "الإنترنت والاتصالات", page: 58 }] },
      { number: 6, term: 1, book: 'g1', title: "تصميم المعلومات", lessons: [{ title: "التناظري والرقمي", page: 62 }, { title: "النظام الثنائي وكمية البيانات", page: 64 }, { title: "النظام السادس عشر (Hexadecimal)", page: 68 }, { title: "التمثيل الرقمي للأحرف", page: 70 }, { title: "العمليات الحسابية العددية (1)", page: 74 }, { title: "العمليات الحسابية العددية (2)", page: 76 }, { title: "رقمنة الصوت", page: 79 }, { title: "رقمنة الصور", page: 83 }, { title: "التمثيل الرقمي وضغط الفيديو", page: 87 }, { title: "تصميم البيانات", page: 92 }] },
      { number: 7, term: 1, book: 'g1', title: "الكمبيوترات", lessons: [{ title: "بنية الكمبيوتر", page: 97 }, { title: "برامج الكمبيوتر", page: 101 }, { title: "الدوائر المنطقية", page: 103 }] },
      { number: 8, term: 1, book: 'g1', title: "الشبكات", lessons: [{ title: "شبكات الكمبيوتر", page: 108 }, { title: "عناوين IP وأسماء النطاقات", page: 112 }, { title: "بروتوكول الاتصال", page: 114 }, { title: "آلية عمل صفحات الويب والبريد الإلكتروني", page: 118 }, { title: "سرعة نقل البيانات على الشبكات", page: 122 }] },
      { number: 9, term: 1, book: 'g1', title: "قواعد البيانات", lessons: [{ title: "قواعد البيانات (1)", page: 125 }, { title: "قواعد البيانات (2)", page: 129 }, { title: "نظم المعلومات المختلفة", page: 133 }] },
      { number: 10, term: 1, book: 'g1', title: "تحليل البيانات", lessons: [{ title: "أنواع البيانات والتحليل", page: 136 }, { title: "تحليل البيانات (1)", page: 138 }, { title: "تحليل البيانات (2)", page: 142 }, { title: "تحليل البيانات (3)", page: 145 }, { title: "تحليل البيانات (4)", page: 147 }, { title: "تحليل البيانات (5)", page: 151 }] },
      { number: 11, term: 1, book: 'g1', title: "المحاكاة", lessons: [{ title: "النمذجة", page: 154 }, { title: "المحاكاة (1)", page: 157 }, { title: "المحاكاة (2)", page: 161 }, { title: "قوائم الانتظار (Queues)", page: 165 }] },
      { number: 12, term: 1, book: 'g1', title: "البرمجة", lessons: [{ title: "الخوارزميات", page: 168 }, { title: "أساسيات البرمجة (1)", page: 172 }, { title: "أساسيات البرمجة (2)", page: 176 }, { title: "البرمجة التطبيقية (1)", page: 182 }, { title: "البرمجة التطبيقية (2)", page: 186 }] },
      { number: 13, term: 1, book: 'g1', title: "الذكاء الاصطناعي التوليدي", lessons: [{ title: "الذكاء الاصطناعي التوليدي", page: 191 }, { title: "HTML, CSS", page: 193 }, { title: "HTML, JS", page: 196 }, { title: "إنشاء صفحة ويب ثابتة", page: 201 }, { title: "إنشاء صفحات ويب تفاعلية", page: 205 }, { title: "عرض تقديمي لموقع الويب", page: 207 }, { title: "تطوير تطبيق اختبارات", page: 208 }, { title: "مراجعة تطبيق الاختبارات", page: 210 }, { title: "تطوير لعبة تكسير القوالب (1)", page: 211 }, { title: "تطوير لعبة تكسير القوالب (2)", page: 213 }, { title: "ملخص لعبة تكسير القوالب", page: 215 }, { title: "عرض تقديمي للعبة تكسير القوالب المطورة", page: 217 }] },
    ],
  },
  {
    slug: 'grade-2',
    title: 'الصف الثاني الثانوي',
    subject: 'البرمجة والذكاء الاصطناعي',
    description: '7 فصول و23 درساً كما في الكتاب المدرسي.',
    order: 2,
    comingSoon: false,
    numberOrder: 'unit-lesson',
    units: [
      { number: 1, term: 1, book: 'g2a', title: "تكنولوجيا المعلومات والمجتمع", lessons: [{ title: "تطور تكنولوجيا المعلومات والتحول الاجتماعي", page: 4 }, { title: "كيف يعمل الذكاء الاصطناعي", page: 12 }, { title: "الذكاء الاصطناعي في الحياة اليومية والصناعة", page: 18 }, { title: "القضايا الأخلاقية للذكاء الاصطناعي", page: 24 }] },
      { number: 2, term: 1, book: 'g2a', title: "الأمن السيبراني", lessons: [{ title: "تقنيات التشفير والمصادقة", page: 31 }, { title: "تصميم أمن الشبكات", page: 38 }, { title: "الاستجابة للحوادث وإدارة المخاطر", page: 44 }] },
      { number: 3, term: 1, book: 'g2a', title: "تطبيقات الويب", lessons: [{ title: "البنية العامة لتطبيقات الويب", page: 50 }, { title: "طرق الاتصال في تطبيقات الويب", page: 56 }, { title: "أساسيات تكنولوجيا الواجهة الأمامية", page: 62 }] },
      { number: 4, term: 1, book: 'g2a', title: "تصميم الويب والوسائط", lessons: [{ title: "أنواع الوسائط وخصائصها", page: 68 }, { title: "تصميم المعلومات وتجربة المستخدم للمواقع", page: 74 }, { title: "أساليب تقييم المواقع الإلكترونية", page: 81 }, { title: "عملية التحسين التكراري للمواقع", page: 87 }] },
      { number: 5, term: 2, book: 'g2b', title: "جمع البيانات وتنقيتها", lessons: [{ title: "طرق جمع البيانات", page: 4 }, { title: "تنقية البيانات وتحويلها", page: 11 }, { title: "البيانات المفتوحة وواجهات برمجة التطبيقات", page: 19 }] },
      { number: 6, term: 2, book: 'g2b', title: "التحليل والتواصل", lessons: [{ title: "الاستدلال الإحصائي", page: 26 }, { title: "استخدام تحليل الانحدار وتقييمه", page: 34 }, { title: "تمثيل البيانات المرئي والتواصل", page: 42 }] },
      { number: 7, term: 2, book: 'g2b', title: "التعلم الآلي والذكاء الاصطناعي", lessons: [{ title: "أساسيات التعلم الآلي", page: 50 }, { title: "الشبكات العصبية والتعلم العميق", page: 59 }, { title: "نماذج اللغة الكبيرة والذكاء الاصطناعي التوليدي", page: 67 }] },
    ],
  },
];

// رقم الدرس كما يظهر في الكتاب
export const displayNumber = (stage, unitNumber, lessonIndex) =>
  stage.numberOrder === 'lesson-unit' ? `${lessonIndex}-${unitNumber}` : `${unitNumber}-${lessonIndex}`;

// قائمة مسطّحة بكل الدروس مع صفحاتها (البداية والنهاية المطبوعتان) — تُستخدم في الـ seed وأدوات الفحص
export function flattenLessons() {
  const rows = [];
  for (const stage of stages) {
    for (const unit of stage.units) {
      const end = books[unit.book].lastPage;
      unit.lessons.forEach((l, i) => {
        const nextLesson = unit.lessons[i + 1];
        const nextUnit = stage.units.find((u) => u.book === unit.book && u.number === unit.number + 1);
        const nextStart = nextLesson ? nextLesson.page : nextUnit ? nextUnit.lessons[0].page - 1 : end + 1;
        // صفحة افتتاح الوحدة التالية (في الصف الأول) تسبق أول درس فيها، فننتهي قبلها بصفحة إن وُجدت
        rows.push({
          stage: stage.slug, unit: unit.number, index: i + 1, book: unit.book,
          slug: `lesson-${unit.number}-${i + 1}`,
          number: displayNumber(stage, unit.number, i + 1),
          title: l.title, startPage: l.page,
          endPage: Math.max(l.page, (nextLesson ? nextStart - 1 : nextStart - 1)),
        });
      });
    }
  }
  return rows;
}
