import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Trash2,
  Edit3,
  Phone,
  MessageCircle,
  Users,
  FolderPlus,
  X,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import { GroupModel, StageModel, StudentModel } from '../types/edu';
import { sanitizePhone } from '../utils/eduLogic';

interface StudentsViewProps {
  stages: StageModel[];
  groups: GroupModel[];
  selectedGroup: GroupModel;
  students: StudentModel[];
  teacherName: string;
  onAddStudent: (student: Omit<StudentModel, 'id'>) => void;
  onUpdateStudent: (student: StudentModel) => void;
  onDeleteStudent: (studentId: number) => void;
  onAddGroup: (group: Omit<GroupModel, 'id'>) => void;
  onOpenWhatsApp: (studentName: string, phone: string, message: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  stages,
  groups,
  selectedGroup,
  students,
  teacherName,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddGroup,
  onOpenWhatsApp,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentModel | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentModel | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Student Form State
  const [name, setName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Group Form State
  const [groupStageId, setGroupStageId] = useState<number>(stages[0]?.id || 1);
  const [groupName, setGroupName] = useState('');
  const [groupSchedule, setGroupSchedule] = useState('');
  const [groupDefaultFee, setGroupDefaultFee] = useState('250');
  const [groupError, setGroupError] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.parentPhone.includes(q) ||
        s.studentPhone.includes(q) ||
        s.notes.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const currentStage = stages.find((st) => st.id === selectedGroup.stageId);

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setParentPhone('');
    setStudentPhone('');
    setNotes('');
    setFormError('');
    setIsStudentModalOpen(true);
  };

  const openEditModal = (student: StudentModel) => {
    setEditingStudent(student);
    setName(student.name);
    setParentPhone(student.parentPhone);
    setStudentPhone(student.studentPhone);
    setNotes(student.notes);
    setFormError('');
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('الرجاء إدخال اسم الطالب رباعي أو ثلاثي');
      return;
    }
    if (!parentPhone.trim() || parentPhone.replace(/[^0-9]/g, '').length < 10) {
      setFormError('الرجاء إدخال رقم هاتف ولي الأمر بشكل صحيح');
      return;
    }

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        name: name.trim(),
        parentPhone: parentPhone.trim(),
        studentPhone: studentPhone.trim(),
        notes: notes.trim(),
      });
    } else {
      onAddStudent({
        groupId: selectedGroup.id,
        name: name.trim(),
        parentPhone: parentPhone.trim(),
        studentPhone: studentPhone.trim(),
        notes: notes.trim(),
      });
    }
    setIsStudentModalOpen(false);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setGroupError('الرجاء إدخال اسم المجموعة');
      return;
    }
    const feeNum = Number(groupDefaultFee) || 250;
    onAddGroup({
      stageId: groupStageId,
      name: groupName.trim(),
      schedule: groupSchedule.trim() || 'مواعيد مرنة',
      defaultFee: feeNum,
    });
    setGroupName('');
    setGroupSchedule('');
    setGroupDefaultFee('250');
    setGroupError('');
    setIsGroupModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Group Info & Quick Actions Banner */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] dark:bg-[#1E88E5]/15 text-[#1E88E5] flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#1E88E5] bg-[#EFF6FF] dark:bg-[#1E88E5]/15 px-2.5 py-0.5 rounded-md">
                  {currentStage?.name || 'المرحلة الدراسية'}
                </span>
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                  • إجمالي المجموعات: {groups.length}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
                {selectedGroup.name}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 tabular-nums">
                المواعيد: {selectedGroup.schedule} • الاشتراك الشهري: {selectedGroup.defaultFee} ج.م
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsGroupModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-[#1E88E5]" />
              <span>مجموعة جديدة</span>
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة طالب</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Count Bar */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن طالب بالاسم أو رقم هاتف ولي الأمر..."
            className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl pr-10 pl-4 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1E88E5]"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 px-1">
          <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
            عدد الطلاب المسجلين:
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] dark:bg-[#1E88E5]/20 text-[#1E88E5] font-extrabold text-xs tabular-nums">
            {filteredStudents.length} طالب
          </span>
        </div>
      </div>

      {/* Students Roster List */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-10 text-center">
          <Users className="w-10 h-10 text-[#64748B] mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            لا يوجد طلاب في هذه المجموعة حالياً
          </p>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            اضغط على زر «إضافة طالب» لإدراج طلاب جدد في المجموعة
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredStudents.map((student) => {
            const initial = student.name.trim() ? student.name.trim()[0] : 'ط';
            return (
              <div
                key={student.id}
                className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3 transition-all hover:border-[#1E88E5]/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#EFF6FF] dark:bg-[#1E88E5]/20 text-[#1E88E5] font-extrabold text-base flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                        {student.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-[#1E88E5]" />
                          ولي الأمر: {student.parentPhone}
                        </span>
                        {student.studentPhone && (
                          <span className="inline-flex items-center gap-1">
                            • الطالب: {student.studentPhone}
                          </span>
                        )}
                      </div>
                      {student.notes && (
                        <p className="mt-2 text-xs text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#0F172A] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
                          {student.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155]">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenWhatsApp(
                        student.name,
                        student.parentPhone,
                        `السلام عليكم ورحمة الله وبركاته\nولي أمر الطالب: (${student.name})\nنتشرف بتواصلكم الدائم معنا لمتابعة المستوى الدراسي للطالب.\n\nتحياتي،\n${teacherName}`
                      )
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#166534] dark:text-[#DCFCE7] bg-[#DCFCE7] dark:bg-[#166534]/40 hover:bg-[#25D366]/25 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>مراسلة ولي الأمر (+{sanitizePhone(student.parentPhone)})</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(student)}
                      className="p-2 rounded-lg text-[#64748B] hover:text-[#1E88E5] hover:bg-[#EFF6FF] dark:hover:bg-[#0F172A] transition-colors cursor-pointer"
                      title="تعديل بيانات الطالب"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentToDelete(student)}
                      className="p-2 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#991B1B]/30 transition-colors cursor-pointer"
                      title="حذف الطالب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div
            dir="rtl"
            className="w-full max-w-md bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] dark:border-[#334155]">
              <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                {editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد للمجموعة'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5">
              {formError && (
                <div className="p-3 rounded-xl bg-[#FEE2E2] dark:bg-[#991B1B]/40 text-[#EF4444] dark:text-[#FEE2E2] text-xs font-bold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  اسم الطالب رباعي *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: عبد الله محمد الشافعي"
                  className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1E88E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  رقم واتساب ولي الأمر *
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC] tabular-nums focus:outline-none focus:border-[#1E88E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  رقم هاتف الطالب (اختياري)
                </label>
                <input
                  type="tel"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="01122334455"
                  className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC] tabular-nums focus:outline-none focus:border-[#1E88E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  ملاحظات عامة عن الطالب
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مستوى الطالب أو أي ملاحظات خاصة..."
                  className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1E88E5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {editingStudent ? 'حفظ التعديلات' : 'حفظ وإضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div
            dir="rtl"
            className="w-full max-w-md bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] dark:border-[#334155]">
              <h3 className="text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                إنشاء مجموعة دراسية جديدة
              </h3>
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-5 space-y-3.5">
              {groupError && (
                <div className="p-3 rounded-xl bg-[#FEE2E2] text-[#EF4444] text-xs font-bold">
                  {groupError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  المرحلة الدراسية
                </label>
                <select
                  value={groupStageId}
                  onChange={(e) => setGroupStageId(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1E88E5]"
                >
                  {stages.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  اسم المجموعة *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="مثال: 2 إعدادي (الأحد والثلاثاء 5م)"
                  className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1E88E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  مواعيد الحصة
                </label>
                <input
                  type="text"
                  value={groupSchedule}
                  onChange={(e) => setGroupSchedule(e.target.value)}
                  placeholder="الأحد والثلاثاء - 5:00 مساءً"
                  className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1E88E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  قيمة الاشتراك الشهري الافتراضي (ج.م)
                </label>
                <input
                  type="number"
                  value={groupDefaultFee}
                  onChange={(e) => setGroupDefaultFee(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC] tabular-nums focus:outline-none focus:border-[#1E88E5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  إنشاء المجموعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div
            dir="rtl"
            className="w-full max-w-sm bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FEE2E2] dark:bg-[#991B1B]/40 text-[#EF4444] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
                  تأكيد حذف الطالب
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  هل أنت متأكد من حذف «{studentToDelete.name}» وجميع سجلاته؟
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                نعم، احذف الطالب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
