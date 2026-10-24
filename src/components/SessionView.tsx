import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  MessageCircle,
  CheckCheck,
  BookOpen,
  Search,
  Award,
  Calendar,
} from 'lucide-react';
import {
  AttendanceStatus,
  GroupModel,
  HomeworkStatus,
  SessionStudentData,
  TeacherProfileModel,
} from '../types/edu';
import { calculateSessionSummary, generateDirectNoticeMessage } from '../utils/eduLogic';

interface SessionViewProps {
  group: GroupModel | null;
  sessionDate: string;
  sessionTitle: string;
  onUpdateSessionTitle: (title: string) => void;
  students: SessionStudentData[];
  teacherProfile: TeacherProfileModel;
  onSetAttendance: (studentId: number, status: AttendanceStatus) => void;
  onSetHomework: (studentId: number, status: HomeworkStatus) => void;
  onModifyScore: (
    studentId: number,
    scoreType: 'recitation' | 'dictation' | 'exam',
    delta: number
  ) => void;
  onUpdateNote: (studentId: number, note: string) => void;
  onMarkAllPresent: () => void;
  onMarkAllHomeworkDone: () => void;
  onOpenWhatsApp: (studentName: string, phone: string, message: string, title?: string) => void;
  onNavigateToStudents: () => void;
  isDark: boolean;
  isMobileFrame?: boolean;
}

const QUICK_NOTES = [
  'ممتاز ومشارك بإيجابية',
  'أداء رائع ومتميز',
  'يحتاج لمراجعة الدرس',
  'نسى كراسة الواجب',
];

export const SessionView: React.FC<SessionViewProps> = ({
  group,
  sessionDate,
  sessionTitle,
  onUpdateSessionTitle,
  students,
  teacherProfile,
  onSetAttendance,
  onSetHomework,
  onModifyScore,
  onUpdateNote,
  onMarkAllPresent,
  onMarkAllHomeworkDone,
  onOpenWhatsApp,
  onNavigateToStudents,
  isDark,
  isMobileFrame = false,
}) => {
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'present' | 'absent' | 'late' | 'notDone'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const summary = calculateSessionSummary(students);

  const filteredStudents = students.filter((s) => {
    if (searchQuery.trim() && !s.studentName.includes(searchQuery.trim())) {
      return false;
    }
    if (statusFilter === 'present') return s.attendance === 'present';
    if (statusFilter === 'absent') return s.attendance === 'absent';
    if (statusFilter === 'late') return s.attendance === 'late';
    if (statusFilter === 'notDone') return s.homework === 'notDone';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 1. Top Session Summary Banner (Enhanced from session_tab.dart) */}
      <div
        className={`rounded-2xl p-4 border transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-[#EFF6FF] border-[#BFDBFE]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark
                  ? 'bg-blue-950/80 text-blue-400'
                  : 'bg-[#1E88E5] text-white'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-sm sm:text-base font-extrabold ${
                    isDark ? 'text-slate-100' : 'text-[#1E3A8A]'
                  }`}
                >
                  الحاضرين: <span className="font-mono tabular-nums">{summary.presentCount}</span> من أصل{' '}
                  <span className="font-mono tabular-nums">{summary.total}</span>
                </h2>
                <span className="text-xs opacity-60">·</span>
                <span
                  className={`text-xs font-bold ${
                    summary.absentCount > 0 ? 'text-red-500' : isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  غائب: <span className="font-mono tabular-nums">{summary.absentCount}</span>
                </span>
                {summary.lateCount > 0 && (
                  <>
                    <span className="text-xs opacity-60">·</span>
                    <span className="text-xs font-bold text-amber-500">
                      متأخر: <span className="font-mono tabular-nums">{summary.lateCount}</span>
                    </span>
                  </>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {group?.name} · {group?.schedule} · تاريخ الحصة:{' '}
                <span className="font-mono tabular-nums">{sessionDate}</span>
              </p>
            </div>
          </div>

          {/* Quick Batch Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onMarkAllPresent}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors whitespace-nowrap ${
                isDark
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-emerald-400'
                  : 'bg-white border-blue-200 hover:bg-blue-50 text-emerald-700'
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              <span>تحضير الكل حاضر</span>
            </button>
            <button
              type="button"
              onClick={onMarkAllHomeworkDone}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors whitespace-nowrap ${
                isDark
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-blue-400'
                  : 'bg-white border-blue-200 hover:bg-blue-50 text-[#1E88E5]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>إتمام الواجب للكل</span>
            </button>
          </div>
        </div>

        {/* Session Title & Quick Stats Strip */}
        <div
          className={`mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'border-slate-800' : 'border-blue-200/70'
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Calendar className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-[#1E3A8A]'}`} />
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => onUpdateSessionTitle(e.target.value)}
              placeholder="عنوان أو موضوع حصة اليوم..."
              aria-label="عنوان حصة اليوم"
              className={`w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500'
                  : 'bg-white/90 border-blue-200 text-slate-800 focus:border-[#1E88E5]'
              }`}
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              إنجاز الواجب:{' '}
              <strong className="font-mono tabular-nums">
                {summary.homeworkDoneCount}/{summary.total}
              </strong>
            </span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                متوسط الحصة:{' '}
                <strong className="font-mono tabular-nums">{summary.avgTotalScore}/70</strong>
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search & Status Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Segmented Filter Buttons */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          {[
            { id: 'all', label: `الكل (${summary.total})` },
            { id: 'present', label: `حاضر (${summary.presentCount})` },
            { id: 'absent', label: `غائب (${summary.absentCount})` },
            { id: 'late', label: `متأخر (${summary.lateCount})` },
            {
              id: 'notDone',
              label: `لم يحل الواجب (${students.filter((s) => s.homework === 'notDone').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === tab.id
                  ? isDark
                    ? 'bg-[#1E88E5] text-white shadow-sm'
                    : 'bg-white text-[#1E88E5] shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Search within Session */}
        <div className="relative min-w-[200px]">
          <Search
            className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="تصفية سريعة بالاسم..."
            aria-label="تصفية طلاب الحصة بالاسم"
            className={`w-full pr-9 pl-3 py-2 rounded-xl border text-xs font-medium focus:outline-none ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-100 focus:border-blue-500'
                : 'bg-white border-slate-200 text-slate-900 focus:border-[#1E88E5]'
            }`}
          />
        </div>
      </div>

      {/* 3. Student Session Cards Grid */}
      {students.length === 0 ? (
        <div
          className={`rounded-2xl border p-10 text-center space-y-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            لا يوجد طلاب مسجلين في هذه المجموعة حتى الآن.
          </p>
          <button
            type="button"
            onClick={onNavigateToStudents}
            className="px-4 py-2 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold transition-colors"
          >
            + إضافة طلاب من تبويب الطلاب
          </button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div
          className={`rounded-2xl border p-8 text-center ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <p className="text-xs sm:text-sm font-medium">لا يوجد طلاب مطابقين لفلتر البحث الحالي.</p>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            isMobileFrame ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
          }`}
        >
          {filteredStudents.map((s) => {
            const totalStudentScore = s.recitationScore + s.dictationScore + s.examScore;

            // Avatar status styling matching session_tab.dart
            const avatarStyles =
              s.attendance === 'present'
                ? 'bg-[#DCFCE7] text-[#166534]'
                : s.attendance === 'absent'
                ? 'bg-[#FEE2E2] text-[#991B1B]'
                : 'bg-[#FEF3C7] text-[#B45309]';

            return (
              <article
                key={s.studentId}
                className={`rounded-2xl border p-4 space-y-3.5 transition-colors ${
                  isDark
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Card Header: Student Avatar, Name, Phone, Total Score & Direct WhatsApp */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${avatarStyles}`}
                    >
                      {s.attendance === 'present' ? (
                        <UserCheck className="w-5 h-5" />
                      ) : s.attendance === 'absent' ? (
                        <UserX className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-base truncate">
                        {s.studentName}
                      </h3>
                      <div
                        className={`flex items-center gap-2 text-xs font-mono tabular-nums ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        <span>{s.parentPhone}</span>
                        <span>·</span>
                        <span>المجموع: {totalStudentScore}/70</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct WhatsApp Notice Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const msg = generateDirectNoticeMessage({
                        studentName: s.studentName,
                        teacherName: teacherProfile.teacherName,
                        attendance: s.attendance,
                        homework: s.homework,
                        note: s.note,
                      });
                      onOpenWhatsApp(
                        s.studentName,
                        s.parentPhone,
                        msg,
                        `إشعار متابعة الحصة - ${s.studentName}`
                      );
                    }}
                    title={`إرسال إشعار متابعة لولي أمر ${s.studentName}`}
                    aria-label={`إرسال إشعار واتساب لولي أمر ${s.studentName}`}
                    className="w-10 h-10 rounded-full bg-[#E8F8EE] border border-[#C3E6CB] text-[#25D366] hover:bg-[#d5f3e0] flex items-center justify-center shrink-0 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>

                <hr className={isDark ? 'border-slate-800' : 'border-slate-100'} />

                {/* 1. Segmented Attendance Control (حاضر / غائب / متأخر) */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold block">الحضور والانصراف:</span>
                  <div
                    className={`grid grid-cols-3 gap-1 p-1 rounded-xl ${
                      isDark ? 'bg-slate-950' : 'bg-slate-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSetAttendance(s.studentId, 'present')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        s.attendance === 'present'
                          ? isDark
                            ? 'bg-slate-800 text-[#10B981] shadow-sm font-extrabold'
                            : 'bg-white text-[#10B981] shadow-sm font-extrabold'
                          : isDark
                          ? 'text-slate-400 hover:text-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      حاضر
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetAttendance(s.studentId, 'absent')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        s.attendance === 'absent'
                          ? isDark
                            ? 'bg-slate-800 text-[#EF4444] shadow-sm font-extrabold'
                            : 'bg-white text-[#EF4444] shadow-sm font-extrabold'
                          : isDark
                          ? 'text-slate-400 hover:text-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      غائب
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetAttendance(s.studentId, 'late')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        s.attendance === 'late'
                          ? isDark
                            ? 'bg-slate-800 text-[#F59E0B] shadow-sm font-extrabold'
                            : 'bg-white text-[#F59E0B] shadow-sm font-extrabold'
                          : isDark
                          ? 'text-slate-400 hover:text-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      متأخر
                    </button>
                  </div>
                </div>

                {/* 2. Homework Status Selector (تم الحل / حل جزئي / لم يحل) */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold block">الواجب المدرسي:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSetHomework(s.studentId, 'done')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${
                        s.homework === 'done'
                          ? 'bg-[#DCFCE7] text-[#166534] border-[#166534]/30'
                          : isDark
                          ? 'border-slate-800 text-slate-400 hover:bg-slate-800'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      تم الحل
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetHomework(s.studentId, 'partial')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${
                        s.homework === 'partial'
                          ? 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]/30'
                          : isDark
                          ? 'border-slate-800 text-slate-400 hover:bg-slate-800'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      حل جزئي
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetHomework(s.studentId, 'notDone')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${
                        s.homework === 'notDone'
                          ? 'bg-[#FEE2E2] text-[#991B1B] border-[#991B1B]/30'
                          : isDark
                          ? 'border-slate-800 text-slate-400 hover:bg-slate-800'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      لم يحل
                    </button>
                  </div>
                </div>

                {/* 3. Score Controls Grid (تسميع 10 / إملاء وكويز 10 / امتحان شهري 50) */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold block">الدرجات والتقييمات:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Recitation */}
                    <div
                      className={`p-2 rounded-xl border ${
                        isDark
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold block truncate ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        تسميع (10)
                      </span>
                      <div className="flex items-center justify-between mt-1.5">
                        <button
                          type="button"
                          onClick={() => onModifyScore(s.studentId, 'recitation', -1)}
                          aria-label={`إنقاص درجة التسميع للطالب ${s.studentName}`}
                          className={`w-7 h-7 rounded-lg border font-bold text-sm flex items-center justify-center transition-colors ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          -
                        </button>
                        <span className="font-mono tabular-nums font-extrabold text-sm">
                          {s.recitationScore}
                        </span>
                        <button
                          type="button"
                          onClick={() => onModifyScore(s.studentId, 'recitation', 1)}
                          aria-label={`زيادة درجة التسميع للطالب ${s.studentName}`}
                          className={`w-7 h-7 rounded-lg border font-bold text-sm flex items-center justify-center transition-colors ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Dictation / Quiz */}
                    <div
                      className={`p-2 rounded-xl border ${
                        isDark
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold block truncate ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        إملاء / كويز (10)
                      </span>
                      <div className="flex items-center justify-between mt-1.5">
                        <button
                          type="button"
                          onClick={() => onModifyScore(s.studentId, 'dictation', -1)}
                          aria-label={`إنقاص درجة الإملاء للطالب ${s.studentName}`}
                          className={`w-7 h-7 rounded-lg border font-bold text-sm flex items-center justify-center transition-colors ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          -
                        </button>
                        <span className="font-mono tabular-nums font-extrabold text-sm">
                          {s.dictationScore}
                        </span>
                        <button
                          type="button"
                          onClick={() => onModifyScore(s.studentId, 'dictation', 1)}
                          aria-label={`زيادة درجة الإملاء للطالب ${s.studentName}`}
                          className={`w-7 h-7 rounded-lg border font-bold text-sm flex items-center justify-center transition-colors ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Monthly Exam */}
                    <div
                      className={`p-2 rounded-xl border ${
                        isDark
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold block truncate ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        امتحان شهري (50)
                      </span>
                      <div className="flex items-center justify-between mt-1.5">
                        <button
                          type="button"
                          onClick={() => onModifyScore(s.studentId, 'exam', -5)}
                          aria-label={`إنقاص درجة الامتحان الشهري للطالب ${s.studentName}`}
                          className={`w-7 h-7 rounded-lg border font-bold text-sm flex items-center justify-center transition-colors ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          -
                        </button>
                        <span className="font-mono tabular-nums font-extrabold text-sm">
                          {s.examScore}
                        </span>
                        <button
                          type="button"
                          onClick={() => onModifyScore(s.studentId, 'exam', 5)}
                          aria-label={`زيادة درجة الامتحان الشهري للطالب ${s.studentName}`}
                          className={`w-7 h-7 rounded-lg border font-bold text-sm flex items-center justify-center transition-colors ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Teacher Note Input + Quick Preset Buttons */}
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={s.note}
                    onChange={(e) => onUpdateNote(s.studentId, e.target.value)}
                    placeholder="ملاحظات المعلم على الطالب في الحصة..."
                    aria-label={`ملاحظات الحصة للطالب ${s.studentName}`}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus:border-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#1E88E5]'
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    {QUICK_NOTES.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => onUpdateNote(s.studentId, preset)}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors ${
                          s.note === preset
                            ? 'bg-[#1E88E5]/15 border-[#1E88E5] text-[#1E88E5] font-bold'
                            : isDark
                            ? 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
