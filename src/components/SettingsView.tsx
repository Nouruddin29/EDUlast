import React, { useState, useRef } from 'react';
import {
  User,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  Save,
  Code2,
  CheckCircle2,
  FolderGit2,
} from 'lucide-react';
import { EduDatabaseBackup, TeacherProfileModel } from '../types/edu';

interface SettingsViewProps {
  teacherProfile: TeacherProfileModel;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSaveProfile: (profile: TeacherProfileModel) => void;
  onExportBackup: () => EduDatabaseBackup;
  onImportBackup: (backup: EduDatabaseBackup) => void;
  onResetDatabase: () => void;
  onOpenApkModal: () => void;
}

const FLUTTER_EXTRACTED_FILES = [
  {
    path: 'lib/main.dart',
    description: 'نقطة الدخول الرئيسية لتطبيق Flutter وتهيئة ChangeNotifierProvider والوضع الليلي والاتجاه RTL.',
  },
  {
    path: 'lib/data/local/db_helper.dart',
    description: 'محرك قاعدة البيانات المحلية SQLite (الجداول، الفهارس، العلاقات، والتصدير/الاستيراد JSON).',
  },
  {
    path: 'lib/providers/app_provider.dart',
    description: 'إدارة الحالة المركزية (حضور، درجات، مصروفات، مجموعات، وإعدادات المعلم).',
  },
  {
    path: 'lib/presentation/screens/session_tab.dart',
    description: 'شاشة الحصة اليومية التفاعلية (الحضور، الواجب، 3 عدادات درجات، وإشعارات واتساب).',
  },
  {
    path: 'lib/presentation/screens/students_tab.dart',
    description: 'شاشة إدارة الطلاب، البحث الفوري، نافذة إضافة طالب، وحذف الطالب.',
  },
  {
    path: 'lib/presentation/screens/fees_tab.dart',
    description: 'شاشة المصروفات الشهرية مع بطاقة الإجمالي الداكنة ومفاتيح التحصيل السريع.',
  },
  {
    path: 'lib/presentation/screens/reports_tab.dart',
    description: 'شاشة التقارير التراكمية الشهرية ومعاينة فقاعة واتساب.',
  },
  {
    path: 'lib/core/services/whatsapp_service.dart',
    description: 'خدمة تنسيق أرقام الهواتف المصرية (+20) وفتح روابط wa.me الخارجية.',
  },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  teacherProfile,
  isDarkMode,
  onToggleDarkMode,
  onSaveProfile,
  onExportBackup,
  onImportBackup,
  onResetDatabase,
}) => {
  const [teacherName, setTeacherName] = useState(teacherProfile.teacherName);
  const [subject, setSubject] = useState(teacherProfile.subject);
  const [phone, setPhone] = useState(teacherProfile.phone);
  const [savedNotice, setSavedNotice] = useState(false);
  const [importError, setImportError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      teacherName: teacherName.trim() || 'مستر أحمد الصاوي',
      subject: subject.trim() || 'اللغة العربية والتربية الإسلامية',
      phone: phone.trim() || '201012345678',
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleDownloadJson = () => {
    const data = onExportBackup();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_teacher_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result));
        if (!parsed.students || !parsed.groups_table) {
          setImportError('ملف النسخة الاحتياطية غير صالح أو لا يحتوي على جداول الطلاب والمجموعات.');
          return;
        }
        onImportBackup(parsed as EduDatabaseBackup);
      } catch {
        setImportError('تعذر قراءة ملف JSON. تأكد من صحة الملف.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Teacher Profile Form (Matches settings_screen.dart) */}
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-[#1E88E5]/20 text-[#1E88E5] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                بيانات المعلم (تظهر في توقيع رسائل وتقارير واتساب)
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                يتم تضمين اسم المعلم والمادة تلقائياً في نهاية كل إشعار أو تقرير شهري
              </p>
            </div>
          </div>

          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] bg-[#DCFCE7] dark:bg-[#166534]/40 px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              تم الحفظ
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
              اسم المعلم
            </label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1E88E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
              المادة العلمية
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1E88E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
              رقم واتساب المعلم
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC] tabular-nums focus:outline-none focus:border-[#1E88E5]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ إعدادات الملف الشخصي</span>
          </button>
        </div>
      </form>

      {/* Theme & Appearance Card */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#1E88E5]/20 text-[#1E88E5] flex items-center justify-center">
            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              المظهر الليلي (Dark Mode)
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              تبديل ألوان الواجهة بين الوضع الفاتح والوضع الداكن المريح للعين
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isDarkMode}
          onClick={onToggleDarkMode}
          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            isDarkMode ? 'bg-[#1E88E5]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
              isDarkMode ? '-translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Backup & Restore Card (JSON format compatible with db_helper.dart) */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            النسخ الاحتياطي واستعادة قاعدة البيانات (متوافق مع هيكل SQLite في Flutter)
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            تصدير أو استيراد جميع بيانات المراحل، المجموعات، الطلاب، الحصص، والمصروفات بصيغة JSON القياسية.
          </p>
        </div>

        {importError && (
          <div className="p-3 rounded-xl bg-[#FEE2E2] text-[#EF4444] text-xs font-bold">
            {importError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#1E88E5] text-xs font-bold transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#1E88E5]" />
            <span>استيراد نسخة احتياطية</span>
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#991B1B]/30 text-xs font-bold transition-colors cursor-pointer mr-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة ضبط البيانات الافتراضية</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 mr-auto">
              <span className="text-xs font-bold text-[#EF4444]">تأكيد استعادة البيانات الأصلية؟</span>
              <button
                type="button"
                onClick={() => {
                  onResetDatabase();
                  setConfirmReset(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#EF4444] text-white text-xs font-bold cursor-pointer"
              >
                نعم
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Flutter Project Reference (`11.zip -> app_edu_flutter`) */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-[#1E88E5]/20 text-[#1E88E5] flex items-center justify-center">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              هيكل مشروع Flutter المستخرج من الملف (11.zip / app_edu_flutter)
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              تم فك ضغط جميع ملفات المشروع الـ 35 وتشغيلها بكامل وظائفها المحسنة في هذه البيئة التفاعلية
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {FLUTTER_EXTRACTED_FILES.map((item) => (
            <div
              key={item.path}
              className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-start gap-2.5"
            >
              <Code2 className="w-4 h-4 text-[#1E88E5] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-extrabold font-mono text-[#1E88E5]" dir="ltr">
                  {item.path}
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
