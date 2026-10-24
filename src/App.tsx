import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  Users,
  Wallet,
  FileSpreadsheet,
  Settings,
  GraduationCap,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  CheckCircle2,
  Download,
  WifiOff,
} from 'lucide-react';
import {
  AttendanceStatus,
  EduDatabaseBackup,
  FeeItemModel,
  GroupModel,
  HomeworkStatus,
  SessionStudentData,
  StudentModel,
  TeacherProfileModel,
} from './types/edu';
import {
  createInitialDatabase,
  DEFAULT_TEACHER_PROFILE,
} from './data/initialEduData';
import { clampScore } from './utils/eduLogic';
import { SessionView } from './components/SessionView';
import { StudentsView } from './components/StudentsView';
import { FeesView } from './components/FeesView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { WhatsAppModal } from './components/WhatsAppModal';
import { ApkExportModal } from './components/ApkExportModal';
import { usePWAInstall } from './hooks/usePWAInstall';

const STORAGE_KEY_DB = 'smart_teacher_edu_db_v2';
const STORAGE_KEY_DARK = 'smart_teacher_dark_mode';

type TabKey = 'session' | 'students' | 'fees' | 'reports' | 'settings';

export default function App() {
  // Database State (Mirrors SQLite structure from app_edu_flutter/lib/data/local/db_helper.dart)
  const [db, setDb] = useState<EduDatabaseBackup>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DB);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.groups_table) && Array.isArray(parsed.students)) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial database
    }
    return createInitialDatabase();
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_DARK) === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<TabKey>('session');
  const [selectedGroupId, setSelectedGroupId] = useState<number>(
    () => db.groups_table[0]?.id || 1
  );
  const [currentMonth, setCurrentMonth] = useState<string>('أكتوبر 2026');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);

  const { isInstallable, isInstalled, isIOS, isOnline, install } = usePWAInstall();

  // WhatsApp Modal State
  const [waModal, setWaModal] = useState<{
    isOpen: boolean;
    studentName: string;
    phone: string;
    message: string;
    title?: string;
  }>({
    isOpen: false,
    studentName: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(db));
    } catch {
      // Ignore storage quota errors
    }
  }, [db]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DARK, String(isDark));
    } catch {
      // Ignore
    }
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  // Teacher Profile derived from settings table
  const teacherProfile: TeacherProfileModel = useMemo(() => {
    const getVal = (key: string, fallback: string) =>
      db.settings.find((s) => s.key === key)?.value || fallback;
    return {
      teacherName: getVal('teacher_name', DEFAULT_TEACHER_PROFILE.teacherName),
      subject: getVal('subject', DEFAULT_TEACHER_PROFILE.subject),
      phone: getVal('phone', DEFAULT_TEACHER_PROFILE.phone),
    };
  }, [db.settings]);

  // Selected Group
  const selectedGroup: GroupModel = useMemo(() => {
    return (
      db.groups_table.find((g) => g.id === selectedGroupId) ||
      db.groups_table[0] || {
        id: 1,
        stageId: 1,
        name: 'المجموعة الافتراضية',
        schedule: 'السبت والثلاثاء 4م',
        defaultFee: 250,
      }
    );
  }, [db.groups_table, selectedGroupId]);

  // Students in Selected Group
  const groupStudents: StudentModel[] = useMemo(() => {
    return db.students.filter((s) => s.groupId === selectedGroup.id);
  }, [db.students, selectedGroup.id]);

  // Active Session for Selected Group
  const currentSession = useMemo(() => {
    const existing = db.sessions.find((s) => s.groupId === selectedGroup.id);
    if (existing) return existing;
    return {
      id: selectedGroup.id,
      groupId: selectedGroup.id,
      sessionDate: new Date().toISOString().slice(0, 10),
      title: 'حصة اليوم',
    };
  }, [db.sessions, selectedGroup.id]);

  // Session Student Data
  const sessionStudents: SessionStudentData[] = useMemo(() => {
    return groupStudents.map((student) => {
      const record = db.session_records.find(
        (r) => r.session_id === currentSession.id && r.student_id === student.id
      );
      return {
        studentId: student.id,
        studentName: student.name,
        parentPhone: student.parentPhone,
        attendance: record?.attendance || 'present',
        homework: record?.homework || 'done',
        recitationScore: record?.recitation_score ?? 0,
        dictationScore: record?.dictation_score ?? 0,
        examScore: record?.exam_score ?? 0,
        note: record?.note ?? '',
      };
    });
  }, [groupStudents, db.session_records, currentSession.id]);

  // Fees List for Selected Group & Current Month
  const feesList: FeeItemModel[] = useMemo(() => {
    return groupStudents.map((student) => {
      const feeRow = db.monthly_fees.find(
        (f) => f.student_id === student.id && f.month === currentMonth
      );
      return {
        id: feeRow?.id ?? student.id * 1000,
        studentId: student.id,
        studentName: student.name,
        parentPhone: student.parentPhone,
        month: currentMonth,
        amount: feeRow?.amount ?? selectedGroup.defaultFee,
        isPaid: feeRow ? feeRow.is_paid === 1 : false,
        paidDate: feeRow?.paid_date ?? null,
      };
    });
  }, [groupStudents, db.monthly_fees, currentMonth, selectedGroup.defaultFee]);

  // Handlers for Session Tab
  const updateSessionRecord = (
    studentId: number,
    updater: (prev: EduDatabaseBackup['session_records'][number]) => EduDatabaseBackup['session_records'][number]
  ) => {
    setDb((prev) => {
      const sessionExists = prev.sessions.some((s) => s.id === currentSession.id);
      const nextSessions = sessionExists
        ? prev.sessions
        : [...prev.sessions, currentSession];

      const idx = prev.session_records.findIndex(
        (r) => r.session_id === currentSession.id && r.student_id === studentId
      );

      const baseRecord: EduDatabaseBackup['session_records'][number] =
        idx >= 0
          ? prev.session_records[idx]
          : {
              session_id: currentSession.id,
              student_id: studentId,
              attendance: 'present',
              homework: 'done',
              recitation_score: 0,
              dictation_score: 0,
              exam_score: 0,
              note: '',
            };

      const updatedRecord = updater(baseRecord);
      const nextRecords =
        idx >= 0
          ? prev.session_records.map((r, i) => (i === idx ? updatedRecord : r))
          : [...prev.session_records, updatedRecord];

      return {
        ...prev,
        sessions: nextSessions,
        session_records: nextRecords,
      };
    });
  };

  const handleSetAttendance = (studentId: number, status: AttendanceStatus) => {
    updateSessionRecord(studentId, (r) => ({ ...r, attendance: status }));
  };

  const handleSetHomework = (studentId: number, status: HomeworkStatus) => {
    updateSessionRecord(studentId, (r) => ({ ...r, homework: status }));
  };

  const handleModifyScore = (
    studentId: number,
    scoreType: 'recitation' | 'dictation' | 'exam',
    delta: number
  ) => {
    updateSessionRecord(studentId, (r) => {
      if (scoreType === 'recitation') {
        return {
          ...r,
          recitation_score: clampScore(r.recitation_score + delta, 0, 10),
        };
      }
      if (scoreType === 'dictation') {
        return {
          ...r,
          dictation_score: clampScore(r.dictation_score + delta, 0, 10),
        };
      }
      return {
        ...r,
        exam_score: clampScore(r.exam_score + delta, 0, 50),
      };
    });
  };

  const handleUpdateNote = (studentId: number, note: string) => {
    updateSessionRecord(studentId, (r) => ({ ...r, note }));
  };

  const handleUpdateSessionTitle = (title: string) => {
    setDb((prev) => {
      const exists = prev.sessions.some((s) => s.id === currentSession.id);
      if (exists) {
        return {
          ...prev,
          sessions: prev.sessions.map((s) =>
            s.id === currentSession.id ? { ...s, title } : s
          ),
        };
      }
      return {
        ...prev,
        sessions: [...prev.sessions, { ...currentSession, title }],
      };
    });
  };

  const handleMarkAllPresent = () => {
    groupStudents.forEach((st) => handleSetAttendance(st.id, 'present'));
    showToast('تم تحضير جميع طلاب المجموعة (حاضر)');
  };

  const handleMarkAllHomeworkDone = () => {
    groupStudents.forEach((st) => handleSetHomework(st.id, 'done'));
    showToast('تم تسجيل إتمام الواجب لجميع طلاب المجموعة');
  };

  // Handlers for Students & Groups
  const handleAddStudent = (newStudent: Omit<StudentModel, 'id'>) => {
    setDb((prev) => {
      const nextId =
        prev.students.reduce((max, s) => Math.max(max, s.id), 0) + 1;
      const studentObj: StudentModel = { ...newStudent, id: nextId };

      const nextFeeId =
        prev.monthly_fees.reduce((max, f) => Math.max(max, f.id), 0) + 1;

      return {
        ...prev,
        students: [...prev.students, studentObj],
        session_records: [
          ...prev.session_records,
          {
            session_id: currentSession.id,
            student_id: nextId,
            attendance: 'present',
            homework: 'done',
            recitation_score: 8,
            dictation_score: 8,
            exam_score: 40,
            note: '',
          },
        ],
        monthly_fees: [
          ...prev.monthly_fees,
          {
            id: nextFeeId,
            student_id: nextId,
            month: currentMonth,
            amount: selectedGroup.defaultFee,
            is_paid: 0,
            paid_date: null,
          },
        ],
      };
    });
    showToast(`تمت إضافة الطالب «${newStudent.name}» بنجاح`);
  };

  const handleUpdateStudent = (updated: StudentModel) => {
    setDb((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === updated.id ? updated : s)),
    }));
    showToast('تم تحديث بيانات الطالب');
  };

  const handleDeleteStudent = (studentId: number) => {
    setDb((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
      session_records: prev.session_records.filter(
        (r) => r.student_id !== studentId
      ),
      monthly_fees: prev.monthly_fees.filter((f) => f.student_id !== studentId),
    }));
    showToast('تم حذف الطالب وسجلاته');
  };

  const handleAddGroup = (newGroup: Omit<GroupModel, 'id'>) => {
    const nextGroupId =
      db.groups_table.reduce((max, g) => Math.max(max, g.id), 0) + 1;
    const groupObj: GroupModel = { ...newGroup, id: nextGroupId };
    const today = new Date().toISOString().slice(0, 10);

    setDb((prev) => ({
      ...prev,
      groups_table: [...prev.groups_table, groupObj],
      sessions: [
        ...prev.sessions,
        {
          id: nextGroupId,
          groupId: nextGroupId,
          sessionDate: today,
          title: 'حصة اليوم',
        },
      ],
    }));
    setSelectedGroupId(nextGroupId);
    showToast(`تم إنشاء مجموعة «${newGroup.name}»`);
  };

  // Handlers for Fees
  const handleTogglePaid = (feeId: number, isPaid: boolean) => {
    const nowStr = new Date().toISOString().slice(0, 10);
    setDb((prev) => {
      const targetStudent = feesList.find((f) => f.id === feeId);
      if (!targetStudent) return prev;

      const existingIdx = prev.monthly_fees.findIndex(
        (f) =>
          f.student_id === targetStudent.studentId && f.month === currentMonth
      );

      if (existingIdx >= 0) {
        const nextFees = prev.monthly_fees.map((f, idx) =>
          idx === existingIdx
            ? {
                ...f,
                is_paid: isPaid ? 1 : 0,
                paid_date: isPaid ? nowStr : null,
              }
            : f
        );
        return { ...prev, monthly_fees: nextFees };
      }

      const nextId =
        prev.monthly_fees.reduce((max, f) => Math.max(max, f.id), 0) + 1;
      return {
        ...prev,
        monthly_fees: [
          ...prev.monthly_fees,
          {
            id: nextId,
            student_id: targetStudent.studentId,
            month: currentMonth,
            amount: selectedGroup.defaultFee,
            is_paid: isPaid ? 1 : 0,
            paid_date: isPaid ? nowStr : null,
          },
        ],
      };
    });
  };

  const handleMarkAllPaid = () => {
    feesList.forEach((f) => {
      if (!f.isPaid) {
        handleTogglePaid(f.id, true);
      }
    });
    showToast(`تم تحصيل مصروفات شهر ${currentMonth} بالكامل`);
  };

  // Handlers for Settings & Backup
  const handleSaveProfile = (profile: TeacherProfileModel) => {
    setDb((prev) => ({
      ...prev,
      settings: [
        { key: 'teacher_name', value: profile.teacherName },
        { key: 'subject', value: profile.subject },
        { key: 'phone', value: profile.phone },
      ],
    }));
    showToast('تم حفظ بيانات المعلم بنجاح');
  };

  const handleExportBackup = (): EduDatabaseBackup => {
    return {
      ...db,
      exported_at: new Date().toISOString(),
    };
  };

  const handleImportBackup = (backup: EduDatabaseBackup) => {
    setDb(backup);
    if (backup.groups_table?.[0]) {
      setSelectedGroupId(backup.groups_table[0].id);
    }
    showToast('تم استيراد قاعدة البيانات بنجاح');
  };

  const handleResetDatabase = () => {
    const fresh = createInitialDatabase();
    setDb(fresh);
    setSelectedGroupId(fresh.groups_table[0]?.id || 1);
    showToast('تمت استعادة البيانات الافتراضية للتطبيق');
  };

  const openWhatsAppModal = (
    studentName: string,
    phone: string,
    message: string,
    title?: string
  ) => {
    setWaModal({
      isOpen: true,
      studentName,
      phone,
      message,
      title,
    });
  };

  const navItems: Array<{
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: 'session', label: 'الحصة', icon: ClipboardCheck },
    { key: 'students', label: 'الطلاب', icon: Users },
    { key: 'fees', label: 'المصاريف', icon: Wallet },
    { key: 'reports', label: 'التقارير', icon: FileSpreadsheet },
    { key: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div
      dir="rtl"
      className={`min-h-screen font-sans transition-colors ${
        isDark
          ? 'bg-[#0F172A] text-[#F8FAFC]'
          : 'bg-[#F8FAFC] text-[#0F172A]'
      }`}
    >
      {/* Wrapper supporting Desktop Full-Width or Mobile Frame Preview */}
      <div
        className={`mx-auto transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[440px] my-4 min-h-[860px] rounded-[36px] border-[6px] border-slate-800 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A]'
            : 'max-w-6xl min-h-screen flex flex-col'
        }`}
      >
        {/* Top App Bar (Matches main_shell_screen.dart with Group Dropdown & Theme Controls) */}
        <header
          className={`sticky top-0 z-30 border-b px-4 py-3 backdrop-blur-md transition-colors ${
            isDark
              ? 'bg-[#1E293B]/95 border-[#334155]'
              : 'bg-white/95 border-[#E2E8F0]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Brand & Teacher Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E88E5] text-white flex items-center justify-center shadow-xs shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold tracking-tight">
                    نظام إدارة المعلم الذكي
                  </h1>
                  <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#EFF6FF] dark:bg-[#1E88E5]/20 text-[#1E88E5]">
                    {teacherProfile.teacherName}
                  </span>
                </div>
                <p
                  className={`text-xs ${
                    isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                >
                  {teacherProfile.subject}
                </p>
              </div>
            </div>

            {/* Group Selector Dropdown + Viewport & Theme Toggles */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
              <div className="flex-1 sm:flex-initial min-w-[200px] max-w-[270px]">
                <select
                  aria-label="تحديد المجموعة الدراسية"
                  value={selectedGroup.id}
                  onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-extrabold focus:outline-none focus:border-[#1E88E5] transition-colors ${
                    isDark
                      ? 'bg-[#0F172A] border-[#334155] text-[#F8FAFC]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  {db.groups_table.map((g) => (
                    <option key={g.id} value={g.id}>
                      👥 {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* APK Export & Install Button */}
              <button
                type="button"
                onClick={() => setIsApkModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-extrabold transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                title="استخراج وتحميل نسخة الأندرويد APK"
              >
                <Download className="w-4 h-4" />
                <span>نسخة APK</span>
              </button>

              {/* Mobile / Desktop Simulator Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileFrame((prev) => !prev)}
                title={
                  isMobileFrame
                    ? 'التبديل إلى وضع سطح المكتب العريض'
                    : 'معاينة في إطار هاتف محمول (Flutter Mobile Frame)'
                }
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#0F172A] border-[#334155] text-[#94A3B8] hover:text-white'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {isMobileFrame ? (
                  <Monitor className="w-4 h-4 text-[#1E88E5]" />
                ) : (
                  <Smartphone className="w-4 h-4" />
                )}
              </button>

              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsDark((prev) => !prev)}
                title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#0F172A] border-[#334155] text-amber-400 hover:bg-slate-800'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Pills */}
          {!isMobileFrame && (
            <nav className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#1E88E5] text-white shadow-xs'
                        : isDark
                        ? 'text-[#94A3B8] hover:bg-[#0F172A] hover:text-white'
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 pb-24">
          {activeTab === 'session' && (
            <SessionView
              group={selectedGroup}
              sessionDate={currentSession.sessionDate}
              sessionTitle={currentSession.title}
              onUpdateSessionTitle={handleUpdateSessionTitle}
              students={sessionStudents}
              teacherProfile={teacherProfile}
              onSetAttendance={handleSetAttendance}
              onSetHomework={handleSetHomework}
              onModifyScore={handleModifyScore}
              onUpdateNote={handleUpdateNote}
              onMarkAllPresent={handleMarkAllPresent}
              onMarkAllHomeworkDone={handleMarkAllHomeworkDone}
              onOpenWhatsApp={openWhatsAppModal}
              onNavigateToStudents={() => setActiveTab('students')}
              isDark={isDark}
              isMobileFrame={isMobileFrame}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              stages={db.stages}
              groups={db.groups_table}
              selectedGroup={selectedGroup}
              students={groupStudents}
              teacherName={teacherProfile.teacherName}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddGroup={handleAddGroup}
              onOpenWhatsApp={(name, phone, msg) =>
                openWhatsAppModal(name, phone, msg)
              }
            />
          )}

          {activeTab === 'fees' && (
            <FeesView
              currentMonth={currentMonth}
              feesList={feesList}
              teacherName={teacherProfile.teacherName}
              onChangeMonth={setCurrentMonth}
              onTogglePaid={handleTogglePaid}
              onMarkAllPaid={handleMarkAllPaid}
              onOpenWhatsApp={(name, phone, msg) =>
                openWhatsAppModal(name, phone, msg)
              }
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              selectedGroup={selectedGroup}
              students={groupStudents}
              sessionStudents={sessionStudents}
              feesList={feesList}
              currentMonth={currentMonth}
              teacherName={teacherProfile.teacherName}
              onOpenWhatsApp={(name, phone, msg) =>
                openWhatsAppModal(name, phone, msg, `التقرير الشهري - ${name}`)
              }
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              teacherProfile={teacherProfile}
              isDarkMode={isDark}
              onToggleDarkMode={() => setIsDark((prev) => !prev)}
              onSaveProfile={handleSaveProfile}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetDatabase={handleResetDatabase}
              onOpenApkModal={() => setIsApkModalOpen(true)}
            />
          )}
        </main>

        {/* Bottom Navigation Bar (Always shown in Mobile Frame or on small screens, matching main_shell_screen.dart) */}
        <nav
          className={`${
            isMobileFrame ? 'sticky' : 'fixed sm:hidden'
          } bottom-0 inset-x-0 z-30 border-t px-2 py-1.5 backdrop-blur-md ${
            isDark
              ? 'bg-[#1E293B]/95 border-[#334155]'
              : 'bg-white/95 border-[#E2E8F0]'
          }`}
        >
          <div className="grid grid-cols-5 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                    active
                      ? 'text-[#1E88E5] bg-[#EFF6FF] dark:bg-[#1E88E5]/20 font-extrabold'
                      : isDark
                      ? 'text-[#94A3B8]'
                      : 'text-[#64748B]'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Offline Mode Indicator */}
      {!isOnline && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>وضع عدم الاتصال بالإنترنت — يتم الحفظ محلياً</span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* WhatsApp Preview & Direct Send Modal */}
      <WhatsAppModal
        isOpen={waModal.isOpen}
        onClose={() => setWaModal((prev) => ({ ...prev, isOpen: false }))}
        studentName={waModal.studentName}
        phone={waModal.phone}
        initialMessage={waModal.message}
        title={waModal.title}
        isDark={isDark}
      />

      {/* APK Export & Android Install Center Modal */}
      <ApkExportModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        isDark={isDark}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onTriggerPWAInstall={install}
      />
    </div>
  );
}
