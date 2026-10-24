import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  CloudCog,
  CheckCircle2,
  PackageCheck,
} from 'lucide-react';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onTriggerPWAInstall: () => Promise<boolean>;
}

const SHARED_APP_URL =
  'https://ais-pre-p5hy3xsh7psjtgfvhcmxmh-966310028355.europe-west2.run.app';

export const ApkExportModal: React.FC<ApkExportModalProps> = ({
  isOpen,
  onClose,
  isDark,
  isInstallable,
  isInstalled,
  isIOS,
  onTriggerPWAInstall,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const flutterCommands = `flutter create . --project-name smart_teacher_app --org com.smartteacher.app
flutter pub get
flutter build apk --release --no-tree-shake-icons`;

  const handleCopyCommands = async () => {
    try {
      await navigator.clipboard.writeText(flutterCommands);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch {
      setCopiedCmd(true);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(SHARED_APP_URL);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      setCopiedUrl(true);
    }
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/?site=${encodeURIComponent(
    SHARED_APP_URL
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apk-modal-title"
    >
      <div
        dir="rtl"
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-auto ${
          isDark
            ? 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
            : 'bg-white border-[#E2E8F0] text-[#0F172A]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? 'border-[#334155] bg-[#0F172A]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 id="apk-modal-title" className="text-base font-extrabold">
                مركز استخراج وتحميل تطبيق الأندرويد (APK)
              </h3>
              <p
                className={`text-xs ${
                  isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
                }`}
              >
                3 طرق جاهزة للحصول على ملف APK أو تثبيت التطبيق مباشرة على الهاتف بدون إنترنت
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Method 1: Download Ready-to-Build Flutter Project ZIP + GitHub Actions Auto-APK */}
          <div
            className={`rounded-2xl border p-4 space-y-3 ${
              isDark
                ? 'bg-[#0F172A] border-[#334155]'
                : 'bg-[#EFF6FF]/60 border-[#BFDBFE]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#1E88E5] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-extrabold">
                    مشروع Flutter الكامل + بناء ملف APK تلقائياً (`app-release.apk`)
                  </h4>
                  <p
                    className={`text-xs mt-0.5 ${
                      isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                  >
                    يحتوي الملف المضغوط على كود Flutter الكامل مضافاً إليه ملف{' '}
                    <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">
                      build_apk.bat
                    </code>{' '}
                    للـ Windows وملف{' '}
                    <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">
                      .github/workflows/build_apk.yml
                    </code>{' '}
                    لاستخراج APK سحابياً مجاناً بدون تثبيت Android Studio.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="/smart_teacher_flutter_apk_project.zip"
                download="smart_teacher_flutter_apk_project.zip"
                className="flex-1 min-w-[220px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs sm:text-sm font-extrabold transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>تحميل مشروع Flutter الجاهز لبناء APK (.zip)</span>
              </a>
            </div>

            {/* Terminal Commands Box */}
            <div
              className={`rounded-xl p-3 border ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-900 border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  أوامر استخراج الـ APK محلياً (أو اضغط مرتين على ملف build_apk.bat):
                </span>
                <button
                  type="button"
                  onClick={handleCopyCommands}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ الأوامر</span>
                    </>
                  )}
                </button>
              </div>
              <pre
                dir="ltr"
                className="text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed"
              >
                {flutterCommands}
              </pre>
            </div>
          </div>

          {/* Method 2: Instant APK Packaging from Live URL via PWABuilder */}
          <div
            className={`rounded-2xl border p-4 space-y-3 ${
              isDark
                ? 'bg-[#0F172A] border-[#334155]'
                : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#10B981] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h4 className="text-sm font-extrabold">
                  تحويل فوري إلى ملف APK خلال 30 ثانية (بدون أي كود - PWABuilder)
                </h4>
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                >
                  تم تجهيز هذا التطبيق بملف <code className="font-mono">Manifest</code> و{' '}
                  <code className="font-mono">Service Worker</code> كامل للعمل بدون إنترنت. يمكنك
                  توليد ملف <code className="font-mono">.apk</code> مباشر عبر أداة مايكروسوفت
                  المجانية PWABuilder:
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div
                dir="ltr"
                className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono truncate flex items-center justify-between gap-2 ${
                  isDark
                    ? 'bg-[#1E293B] border-[#334155] text-slate-300'
                    : 'bg-white border-[#E2E8F0] text-slate-700'
                }`}
              >
                <span className="truncate">{SHARED_APP_URL}</span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-2 py-1 rounded bg-[#1E88E5]/15 text-[#1E88E5] font-sans font-bold text-[11px] shrink-0 cursor-pointer"
                >
                  {copiedUrl ? 'تم نسخ الرابط' : 'نسخ الرابط'}
                </button>
              </div>

              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-extrabold transition-colors whitespace-nowrap"
              >
                <CloudCog className="w-4 h-4" />
                <span>فتح PWABuilder واستخراج APK</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Method 3: Direct 1-Click Standalone Installation on Phone */}
          <div
            className={`rounded-2xl border p-4 space-y-3 ${
              isDark
                ? 'bg-[#0F172A] border-[#334155]'
                : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-extrabold">
                    تثبيت مباشر على شاشة الهاتف الآن (يعمل بدون إنترنت مثل الـ APK تماماً)
                  </h4>
                  <p
                    className={`text-xs mt-0.5 ${
                      isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                  >
                    يمكنك فتح الرابط على هاتفك الأندرويد والضغط على زر التثبيت ليظهر كأيقونة تطبيق
                    مستقل بملء الشاشة ويحفظ جميع البيانات محلياً بدون إنترنت.
                  </p>
                </div>
              </div>

              {isInstalled ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#DCFCE7] text-[#166534] text-xs font-extrabold">
                  <CheckCircle2 className="w-4 h-4" />
                  التطبيق مثبت بالفعل على جهازك
                </span>
              ) : isInstallable ? (
                <button
                  type="button"
                  onClick={onTriggerPWAInstall}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-extrabold transition-colors cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>تثبيت التطبيق على الجهاز الآن</span>
                </button>
              ) : isIOS ? (
                <div className="text-xs font-bold text-amber-500">
                  على آيفون: اضغط زر المشاركة (Share) ثم «إضافة إلى الشاشة الرئيسية» (Add to Home Screen)
                </div>
              ) : (
                <div
                  className={`text-xs font-semibold px-3 py-2 rounded-xl border ${
                    isDark
                      ? 'bg-[#1E293B] border-[#334155] text-slate-300'
                      : 'bg-white border-[#E2E8F0] text-slate-600'
                  }`}
                >
                  من متصفح Chrome على الأندرويد: افتح القائمة (⋮) ثم اختر{' '}
                  <strong>«تثبيت التطبيق / Install App»</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
