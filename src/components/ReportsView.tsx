import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  MessageCircle,
  Copy,
  Check,
  Award,
  UserCheck,
  BookOpen,
  Wallet,
} from 'lucide-react';
import {
  FeeItemModel,
  GroupModel,
  SessionStudentData,
  StudentModel,
} from '../types/edu';
import {
  buildWhatsAppUrl,
  calculateStudentGrade,
  formatHomeworkRate,
  generateMonthlyReportText,
} from '../utils/eduLogic';

interface ReportsViewProps {
  selectedGroup: GroupModel;
  students: StudentModel[];
  sessionStudents: SessionStudentData[];
  feesList: FeeItemModel[];
  currentMonth: string;
  teacherName: string;
  onOpenWhatsApp: (studentName: string, phone: string, message: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  selectedGroup,
  students,
  sessionStudents,
  feesList,
  currentMonth,
  teacherName,
  onOpenWhatsApp,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    students[0]?.id ?? null
  );
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (
      students.length > 0 &&
      (!selectedStudentId || !students.some((s) => s.id === selectedStudentId))
    ) {
      setSelectedStudentId(students[0].id);
    } else if (students.length === 0) {
      setSelectedStudentId(null);
    }
  }, [students, selectedStudentId]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const studentSessionRecord = useMemo(
    () => sessionStudents.find((r) => r.studentId === selectedStudentId) || null,
    [sessionStudents, selectedStudentId]
  );

  const studentFeeRecord = useMemo(
    () => feesList.find((f) => f.studentId === selectedStudentId) || null,
    [feesList, selectedStudentId]
  );

  useEffect(() => {
    if (selectedStudent) {
      setCustomNote(studentSessionRecord?.note || selectedStudent.notes || '');
    }
  }, [selectedStudent, studentSessionRecord]);

  const reportData = useMemo(() => {
    if (!selectedStudent) return null;

    const isAbsent = studentSessionRecord?.attendance === 'absent';
    const totalSessions = 8;
    const presentCount = isAbsent ? 7 : 8;
    const absentCount = isAbsent ? 1 : 0;
    const homeworkRate = formatHomeworkRate(
      studentSessionRecord?.homework || 'done'
    );
    const recitationScore = studentSessionRecord?.recitationScore ?? 9;
    const dictationScore = studentSessionRecord?.dictationScore ?? 9;
    const examScore = studentSessionRecord?.examScore ?? 45;
    const isFeePaid = studentFeeRecord?.isPaid ?? false;
    const feeDate = studentFeeRecord?.paidDate ?? null;

    const grade = calculateStudentGrade(examScore, presentCount);

    const text = generateMonthlyReportText({
      student: selectedStudent,
      group: selectedGroup,
      month: currentMonth,
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
      notes: customNote,
    });

    return {
      totalSessions,
      presentCount,
      absentCount,
      homeworkRate,
      recitationScore,
      dictationScore,
      examScore,
      isFeePaid,
      feeDate,
      grade,
      text,
    };
  }, [
    selectedStudent,
    studentSessionRecord,
    studentFeeRecord,
    selectedGroup,
    currentMonth,
    teacherName,
    customNote,
  ]);

  const handleCopy = async () => {
    if (!reportData) return;
    try {
      await navigator.clipboard.writeText(reportData.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  if (students.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-10 text-center">
        <FileSpreadsheet className="w-10 h-10 text-[#64748B] mx-auto mb-2 opacity-50" />
        <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          لا يوجد طلاب في هذه المجموعة لإصدار تقاريرهم
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Student Selector Card */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              اختر الطالب لمعاينة التقرير الشهري التراكمي:
            </label>
            <select
              value={selectedStudentId ?? ''}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1E88E5]"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — (ولي الأمر: {s.parentPhone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              ملاحظة المعلم المرفقة في التقرير:
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="اكتب توصية أو إشادة خاصة بالطالب..."
              className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1E88E5]"
            />
          </div>
        </div>
      </div>

      {/* Quick Performance Summary Cards */}
      {reportData && selectedStudent && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] dark:bg-[#1E88E5]/20 text-[#1E88E5] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">التقييم العام</div>
                <div className="text-xs font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                  {reportData.grade.label}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] dark:bg-[#166534]/40 text-[#10B981] flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">نسبة الحضور</div>
                <div className="text-xs font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                  {reportData.presentCount} من {reportData.totalSessions} حصص
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] dark:bg-[#B45309]/40 text-[#F59E0B] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">مجموع الدرجات</div>
                <div className="text-xs font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                  {reportData.recitationScore + reportData.dictationScore + reportData.examScore} / 70
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-3 flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  reportData.isFeePaid
                    ? 'bg-[#DCFCE7] dark:bg-[#166534]/40 text-[#10B981]'
                    : 'bg-[#FEE2E2] dark:bg-[#991B1B]/40 text-[#EF4444]'
                }`}
              >
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">اشتراك {currentMonth}</div>
                <div
                  className={`text-xs font-extrabold ${
                    reportData.isFeePaid ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}
                >
                  {reportData.isFeePaid ? 'خالص السداد' : 'غير مسدد'}
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Green Bubble Preview (Matches reports_tab.dart) */}
          <div className="bg-[#DCF8C6] dark:bg-[#132E1B] border border-[#A7F3D0] dark:border-[#166534] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-700/15 dark:border-emerald-400/15">
              <span className="text-xs font-extrabold text-[#166534] dark:text-[#A7F3D0] flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                معاينة رسالة واتساب الجاهزة للإرسال إلى ولي الأمر
              </span>
              <span className="text-[11px] font-bold text-[#166534]/80 dark:text-[#A7F3D0]/80 tabular-nums">
                {selectedStudent.parentPhone}
              </span>
            </div>

            <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-[#0F172A] dark:text-[#E2E8F0] select-all">
              {reportData.text}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[#10B981]">تم نسخ التقرير للحافظة</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#64748B]" />
                  <span>نسخ نص التقرير</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                onOpenWhatsApp(
                  selectedStudent.name,
                  selectedStudent.parentPhone,
                  reportData.text
                )
              }
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-extrabold transition-colors shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>تعديل أو إرسال التقرير عبر WhatsApp</span>
            </button>

            <a
              href={buildWhatsAppUrl(selectedStudent.parentPhone, reportData.text)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#166534] hover:bg-emerald-900 text-white text-xs font-bold transition-colors"
            >
              <span>فتح واتساب مباشرة</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
};
