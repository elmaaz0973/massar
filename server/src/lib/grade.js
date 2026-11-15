export const PASS_RATIO = 0.6;

// التصحيح يتم دائماً على الخادم. answers: مصفوفة بنفس عدد الأسئلة (رقم الخيار أو null).
export function gradeQuiz(questions, answers) {
  let score = 0;
  const results = questions.map((q, i) => {
    const a = answers[i];
    const chosen = Number.isInteger(a) && a >= 0 && a < q.options.length ? a : null;
    const correct = chosen === q.correctIndex;
    if (correct) score += 1;
    return { chosen, correct, correctIndex: q.correctIndex, explanation: q.explanation || '', source: q.source || '' };
  });
  const total = questions.length;
  const percent = total ? Math.round((score / total) * 100) : 0;
  return { score, total, percent, passed: total > 0 && score / total >= PASS_RATIO, results };
}
