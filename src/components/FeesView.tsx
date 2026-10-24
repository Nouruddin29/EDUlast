import React, { useState, useMemo } from 'react';
import {
  Wallet,
  CheckCircle2,
  Clock,
  MessageCircle,
  Calendar,
  CheckCheck,
  Search,
} from 'lucide-react';
import { FeeItemModel } from '../types/edu';
import { AVAILABLE_MONTHS } from '../data/initialEduData';
import { calculateFeesSummary, generateFeeReminderMessage } from '../utils/eduLogic';

interface FeesViewProps {
  currentMonth: string;
  feesList: FeeItemModel[];
  teacherName: string;
  onChangeMonth: (month: string) => void;
  onTogglePaid: (feeId: number, isPaid: boolean) => void;
  onMarkAllPaid: () => void;
  onOpenWhatsApp: (studentName: string, phone: string, message: string) => void;
}

export const FeesView: React.FC<FeesViewProps> = ({
  currentMonth,
  feesList,
  teacherName,
  onChangeMonth,
  onTogglePaid,
  onMarkAllPaid,
  onOpenWhatsApp,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const summary = useMemo(() => calculateFeesSummary(feesList), [feesList]);

  const filteredFees = useMemo(() => {
    return feesList.filter((item) => {
      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'paid' && item.isPaid) ||
        (filterStatus === 'unpaid' && !item.isPaid);
      const matchesSearch =
        !searchQuery.trim() ||
        item.studentName.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [feesList, filterStatus, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Month Selector & Batch Action */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] ml-1">
            <Calendar className="w-4 h-4 text-[#1E88E5]" />
            <span>شهر التحصيل:</span>
          </div>
          {AVAILABLE_MONTHS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChangeMonth(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                currentMonth === m
                  ? 'bg-[#1E88E5] text-white shadow-xs'
                  : 'bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {summary.unpaidStudentsCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllPaid}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DCFCE7] dark:bg-[#166534]/50 text-[#166534] dark:text-[#DCFCE7] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>تحصيل الكل ({summary.unpaidStudentsCount})</span>
          </button>
        )}
      </div>

      {/* Financial Summary Dark Slate Hero Card (Matches fees_tab.dart) */}
      <div className="bg-[#0F172A] dark:bg-[#1E293B] border border-[#334155] rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <Wallet className="w-4 h-4 text-[#10B981]" />
              <span>إجمالي المحصل لشهر {currentMonth}</span>
            </div>
            <div className="text-3xl font-extrabold text-[#10B981] mt-1.5 tabular-nums">
              {summary.totalCollected.toLocaleString('ar-EG')} ج.م
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center">
              <div className="text-[11px] text-[#94A3B8]">نسبة التحصيل</div>
              <div className="text-base font-extrabold text-white tabular-nums mt-0.5">
                {summary.collectionRate}%
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center">
              <div className="text-[11px] text-[#94A3B8]">الطلاب المسددين</div>
              <div className="text-base font-extrabold text-[#10B981] tabular-nums mt-0.5">
                {summary.paidStudentsCount} / {summary.totalStudents}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center">
              <div className="text-[11px] text-[#94A3B8]">المتبقي</div>
              <div className="text-base font-extrabold text-[#F59E0B] tabular-nums mt-0.5">
                {summary.totalPending.toLocaleString('ar-EG')} ج.م
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#10B981] transition-all duration-300"
            style={{ width: `${summary.collectionRate}%` }}
          />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الطالب في كشف المصروفات..."
            className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl pr-10 pl-4 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1E88E5]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { key: 'all', label: `الكل (${summary.totalStudents})` },
            { key: 'paid', label: `مسدد (${summary.paidStudentsCount})` },
            { key: 'unpaid', label: `غير مسدد (${summary.unpaidStudentsCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key as typeof filterStatus)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterStatus === tab.key
                  ? 'bg-[#1E88E5] text-white'
                  : 'bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fees List */}
      <div className="space-y-2.5">
        {filteredFees.map((fee) => (
          <div
            key={fee.id}
            className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  fee.isPaid
                    ? 'bg-[#DCFCE7] dark:bg-[#166534]/40 text-[#10B981]'
                    : 'bg-[#FEE2E2] dark:bg-[#991B1B]/40 text-[#EF4444]'
                }`}
              >
                {fee.isPaid ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                  {fee.studentName}
                </h3>
                <p
                  className={`text-xs font-semibold mt-0.5 tabular-nums ${
                    fee.isPaid
                      ? 'text-[#10B981]'
                      : 'text-[#EF4444]'
                  }`}
                >
                  {fee.isPaid
                    ? `تم السداد (${fee.paidDate || 'اليوم'})`
                    : 'لم يتم السداد بعد'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                {fee.amount} ج.م
              </span>

              {/* WhatsApp Receipt or Reminder */}
              <button
                type="button"
                onClick={() => {
                  const msg = generateFeeReminderMessage({
                    studentName: fee.studentName,
                    month: fee.month,
                    amount: fee.amount,
                    isPaid: fee.isPaid,
                    paidDate: fee.paidDate,
                    teacherName,
                  });
                  onOpenWhatsApp(fee.studentName, fee.parentPhone, msg);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-[#DCFCE7] dark:hover:bg-[#166534]/40 text-[#64748B] dark:text-[#94A3B8] hover:text-[#166534] dark:hover:text-[#DCFCE7] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold transition-colors cursor-pointer"
                title={fee.isPaid ? 'إرسال إيصال سداد لولي الأمر' : 'إرسال تذكير سداد لولي الأمر'}
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>{fee.isPaid ? 'إيصال واتساب' : 'تذكير واتساب'}</span>
              </button>

              {/* Toggle Switch matching Flutter Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={fee.isPaid}
                onClick={() => onTogglePaid(fee.id, !fee.isPaid)}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  fee.isPaid ? 'bg-[#10B981]' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    fee.isPaid ? '-translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
