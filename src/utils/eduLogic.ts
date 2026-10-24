import {
  AttendanceStatus,
  FeeItemModel,
  GroupModel,
  HomeworkStatus,
  SessionStudentData,
  StudentModel,
} from '../types/edu';

export function sanitizePhone(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('01') && clean.length === 11) {
    clean = `2${clean}`;
  }
  return clean;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = sanitizePhone(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export function clampScore(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateStudentGrade(examScore: number, presentCount: number): {
  label: string;
  code: 'A+' | 'B+' | 'C' | 'D';
} {
  if (examScore >= 45 && presentCount >= 7) {
    return { label: 'ممتاز (A+)', code: 'A+' };
  }
  if (examScore >= 35) {
    return { label: 'جيد جداً (B+)', code: 'B+' };
  }
  if (examScore >= 25) {
    return { label: 'مقبول (C)', code: 'C' };
  }
  return { label: 'يحتاج متابعة (D)', code: 'D' };
}

export function formatHomeworkRate(homework: HomeworkStatus): string {
  switch (homework) {
    case 'done':
      return '100% ممتاز';
    case 'partial':
      return '75% متوسط';
    case 'notDone':
      return 'مقصر (لم يحل)';
  }
}

export function generateDirectNoticeMessage(params: {
  studentName: string;
  teacherName: string;
  attendance?: AttendanceStatus;
  homework?: HomeworkStatus;
  note?: string;
}): string {
  const { studentName, teacherName, attendance, homework, note } = params;

  const attendanceText =
    attendance === 'absent'
      ? 'نود إبلاغكم بأن الطالب تغيب عن حصة اليوم.'
      : attendance === 'late'
      ? 'حضر الطالب اليوم متأخراً عن موعد الحصة.'
      : 'حضر الطالب حصة اليوم بانتظام.';

  const homeworkText =
    homework === 'notDone'
      ? 'الواجب المدرسي: لم يتم حل الواجب المطلوب.'
      : homework === 'partial'
      ? 'الواجب المدرسي: تم حل الواجب بشكل جزئي.'
      : 'الواجب المدرسي: تم حل الواجب بالكامل.';

  const extraNote = note && note.trim() ? `\nملاحظات الحصة: ${note.trim()}` : '';

  return `السلام عليكم ورحمة الله وبركاته
إشعار بمتابعة الطالب: (${studentName}) في حصة اليوم.
• ${attendanceText}
• ${homeworkText}${extraNote}
نرجو متابعة كراسة الواجب وملاحظات الحصة مع الطالب.

تحياتي،
${teacherName}`;
}

export function generateFeeReminderMessage(params: {
  studentName: string;
  month: string;
  amount: number;
  isPaid: boolean;
  paidDate?: string | null;
  teacherName: string;
}): string {
  const { studentName, month, amount, isPaid, paidDate, teacherName } = params;
  if (isPaid) {
    return `السلام عليكم ورحمة الله وبركاته
إشعار تأكيد سداد مصروفات شهر (${month}) للطالب: (${studentName}).
• المبلغ المسدد: ${amount} ج.م
• تاريخ السداد: ${paidDate || 'اليوم'}

خالص الشكر والتقدير،
${teacherName}`;
  }

  return `السلام عليكم ورحمة الله وبركاته
تذكير ودي بسداد اشتراك شهر (${month}) للطالب: (${studentName}).
• قيمة الاشتراك الشهري: ${amount} ج.م

تحياتي وتقديري،
${teacherName}`;
}

export function generateMonthlyReportText(params: {
  student: StudentModel;
  group: GroupModel;
  month: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  homeworkRate: string;
  recitationScore: number;
  dictationScore: number;
  examScore: number;
  isFeePaid: boolean;
  feeDate: string | null;
  teacherName: string;
  notes: string;
}): string {
  const {
    student,
    group,
    month,
    totalSessions,
    presentCount,
    absentCount,
    homeworkRate,
    recitationScore,
    dictationScore,
    examScore,
    isFeePaid,
    feeDate,
    teacherName,
    notes,
  } = params;

  const rating = calculateStudentGrade(examScore, presentCount).label;
  const feeStatus = isFeePaid
    ? `تم السداد بتاريخ: ${feeDate || 'أول الشهر'}`
    : 'غير مسدد (متأخر)';

  const finalNotes =
    notes.trim() ||
    student.notes.trim() ||
    'طالب مجتهد ونتمنى له مزيداً من التفوق';

  return `📊 *التقرير الشهري للطالب: ${student.name}*
🗓 عن شهر: ${month}
👥 المجموعة: ${group.name}
-----------------------------------
📌 *سجل الحضور والالتزام:*
• عدد الحصص المنعقدة: ${totalSessions} حصص
• الحضور: ${presentCount} | الغياب: ${absentCount}
• الالتزام بالواجبات: ${homeworkRate}

📝 *متوسط الدرجات:*
• التسميع: ${recitationScore} / 10
• الإملاء/الكويز: ${dictationScore} / 10
• الامتحان الشهري: ${examScore} / 50

💰 *المصروفات الشهرية:*
• الحالة: ${feeStatus}

🌟 *التقييم التراكمي:* ${rating}
💬 *ملاحظات المعلم:* ${finalNotes}
-----------------------------------
إدارة: ${teacherName}`;
}

export function calculateSessionSummary(students: SessionStudentData[]) {
  const total = students.length;
  const presentCount = students.filter((s) => s.attendance === 'present').length;
  const absentCount = students.filter((s) => s.attendance === 'absent').length;
  const lateCount = students.filter((s) => s.attendance === 'late').length;
  const homeworkDoneCount = students.filter((s) => s.homework === 'done').length;

  const avgTotalScore =
    total > 0
      ? Math.round(
          students.reduce(
            (sum, s) => sum + s.recitationScore + s.dictationScore + s.examScore,
            0
          ) / total
        )
      : 0;

  return {
    total,
    presentCount,
    absentCount,
    lateCount,
    homeworkDoneCount,
    avgTotalScore, // out of 70
  };
}

export function calculateFeesSummary(fees: FeeItemModel[]) {
  const totalStudents = fees.length;
  const paidStudentsCount = fees.filter((f) => f.isPaid).length;
  const unpaidStudentsCount = fees.filter((f) => !f.isPaid).length;
  const totalCollected = fees
    .filter((f) => f.isPaid)
    .reduce((sum, f) => sum + f.amount, 0);
  const totalPending = fees
    .filter((f) => !f.isPaid)
    .reduce((sum, f) => sum + f.amount, 0);
  const collectionRate =
    totalStudents > 0 ? Math.round((paidStudentsCount / totalStudents) * 100) : 0;

  return {
    totalStudents,
    paidStudentsCount,
    unpaidStudentsCount,
    totalCollected,
    totalPending,
    collectionRate,
  };
}
