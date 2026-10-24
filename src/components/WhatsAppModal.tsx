import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, ExternalLink, Phone } from 'lucide-react';
import { buildWhatsAppUrl, sanitizePhone } from '../utils/eduLogic';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  phone: string;
  initialMessage: string;
  title?: string;
  isDark: boolean;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  studentName,
  phone,
  initialMessage,
  title = 'مراسلة ولي الأمر عبر واتساب',
  isDark,
}) => {
  const [message, setMessage] = useState(initialMessage);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    setMessage(initialMessage);
    setCopied(false);
  }, [initialMessage, isOpen]);

  if (!isOpen) return null;

  const cleanPhone = sanitizePhone(phone);
  const waUrl = buildWhatsAppUrl(phone, message);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-modal-title"
    >
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 id="wa-modal-title" className="font-bold text-sm sm:text-base">
                {title}
              </h3>
              <p className={`text-xs font-mono tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {studentName} · +{cleanPhone}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              معاينة وتعديل نص الرسالة قبل الإرسال:
            </span>
            <span className="font-mono tabular-nums text-xs text-[#25D366] flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {phone}
            </span>
          </div>

          {/* WhatsApp Bubble Editor */}
          <div
            className={`rounded-xl p-3.5 border ${
              isDark
                ? 'bg-[#132E1B] border-[#166534] text-[#DCFCE7]'
                : 'bg-[#DCF8C6] border-[#C3E6CB] text-slate-900'
            }`}
          >
            <textarea
              rows={9}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-transparent border-0 focus:outline-none text-xs sm:text-sm leading-relaxed resize-y font-medium"
              aria-label="نص رسالة واتساب"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span>فتح واتساب وإرسال الرسالة</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                copied
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
