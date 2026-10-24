import {
  EduDatabaseBackup,
  GroupModel,
  SessionModel,
  StageModel,
  StudentModel,
  TeacherProfileModel,
} from '../types/edu';

export const DEFAULT_TEACHER_PROFILE: TeacherProfileModel = {
  teacherName: 'مستر أحمد الصاوي',
  subject: 'اللغة العربية والتربية الإسلامية',
  phone: '201012345678',
};

export const INITIAL_STAGES: StageModel[] = [
  { id: 1, name: 'المرحلة الإعدادية' },
  { id: 2, name: 'المرحلة الثانوية' },
];

export const INITIAL_GROUPS: GroupModel[] = [
  {
    id: 1,
    stageId: 1,
    name: '3 إعدادي (السبت والثلاثاء 4م)',
    schedule: 'السبت والثلاثاء - 4:00 عصراً',
    defaultFee: 250,
  },
  {
    id: 2,
    stageId: 2,
    name: '1 ثانوي (الأحد والأربعاء 6م)',
    schedule: 'الأحد والأربعاء - 6:00 مساءً',
    defaultFee: 300,
  },
  {
    id: 3,
    stageId: 2,
    name: '3 ثانوي (الإثنين والخميس 5م)',
    schedule: 'الإثنين والخميس - 5:00 مساءً',
    defaultFee: 400,
  },
];

export const INITIAL_STUDENTS: StudentModel[] = [
  // المجموعة الأولى: 3 إعدادي (البيانات الأصلية في db_helper.dart + طلاب إضافيين)
  {
    id: 1,
    groupId: 1,
    name: 'أحمد محمود العوضي',
    parentPhone: '01012345678',
    studentPhone: '01011111111',
    notes: 'متفوق ونشيط جداً ويستحق التشجيع.',
  },
  {
    id: 2,
    groupId: 1,
    name: 'عمر خالد المنشاوي',
    parentPhone: '01123456789',
    studentPhone: '01122222222',
    notes: 'يحتاج لمتابعة مستمرة في حل الواجب.',
  },
  {
    id: 3,
    groupId: 1,
    name: 'سارة إبراهيم حسن',
    parentPhone: '01234567890',
    studentPhone: '01233333333',
    notes: 'ممتازة في التسميع الشفهي.',
  },
  {
    id: 4,
    groupId: 1,
    name: 'مريم طارق عبد الرحمن',
    parentPhone: '01551234567',
    studentPhone: '01550001122',
    notes: 'ملتزمة بالحضور وخطها ممتاز في الإملاء.',
  },
  // المجموعة الثانية: 1 ثانوي
  {
    id: 5,
    groupId: 2,
    name: 'يوسف وائل الشناوي',
    parentPhone: '01098765432',
    studentPhone: '01099887766',
    notes: 'متميز في البلاغة والنحو.',
  },
  {
    id: 6,
    groupId: 2,
    name: 'نور الهدى محمد سالم',
    parentPhone: '01187654321',
    studentPhone: '01188776655',
    notes: 'متفوقة وحصلت على الدرجة النهائية في الاختبار السابق.',
  },
  {
    id: 7,
    groupId: 2,
    name: 'كريم سامح الجندي',
    parentPhone: '01276543210',
    studentPhone: '01277665544',
    notes: 'يحتاج إلى التركيز في تدريبات النصوص المتحررة.',
  },
  // المجموعة الثالثة: 3 ثانوي
  {
    id: 8,
    groupId: 3,
    name: 'زياد أشرف المنير',
    parentPhone: '01065432198',
    studentPhone: '01066554433',
    notes: 'مستوى ممتاز في المراجعات الشاملة.',
  },
  {
    id: 9,
    groupId: 3,
    name: 'رقية حسن الدسوقي',
    parentPhone: '01154321987',
    studentPhone: '01155443322',
    notes: 'ملتزمة جداً بحل نماذج الامتحانات.',
  },
];

export const AVAILABLE_MONTHS = ['سبتمبر 2026', 'أكتوبر 2026', 'نوفمبر 2026', 'ديسمبر 2026'];

export function createInitialDatabase(): EduDatabaseBackup {
  const today = new Date().toISOString().substring(0, 10);

  const sessions: SessionModel[] = [
    { id: 1, groupId: 1, sessionDate: today, title: 'حصة اليوم - مراجعة النحو والقراءة' },
    { id: 2, groupId: 2, sessionDate: today, title: 'حصة اليوم - البلاغة والأدب' },
    { id: 3, groupId: 3, sessionDate: today, title: 'حصة اليوم - تدريبات شاملة' },
  ];

  const session_records: EduDatabaseBackup['session_records'] = [
    // Group 1
    {
      session_id: 1,
      student_id: 1,
      attendance: 'present',
      homework: 'done',
      recitation_score: 9,
      dictation_score: 10,
      exam_score: 49,
      note: 'ممتاز ومشارك بإيجابية',
    },
    {
      session_id: 1,
      student_id: 2,
      attendance: 'absent',
      homework: 'notDone',
      recitation_score: 5,
      dictation_score: 6,
      exam_score: 35,
      note: 'غائب اليوم',
    },
    {
      session_id: 1,
      student_id: 3,
      attendance: 'present',
      homework: 'done',
      recitation_score: 10,
      dictation_score: 10,
      exam_score: 50,
      note: 'أداء رائع ومتميز',
    },
    {
      session_id: 1,
      student_id: 4,
      attendance: 'late',
      homework: 'partial',
      recitation_score: 8,
      dictation_score: 9,
      exam_score: 44,
      note: 'حضرت متأخرة 10 دقائق مع استكمال الواجب',
    },
    // Group 2
    {
      session_id: 2,
      student_id: 5,
      attendance: 'present',
      homework: 'done',
      recitation_score: 10,
      dictation_score: 9,
      exam_score: 48,
      note: 'إجابات نموذجية في النحو',
    },
    {
      session_id: 2,
      student_id: 6,
      attendance: 'present',
      homework: 'done',
      recitation_score: 10,
      dictation_score: 10,
      exam_score: 50,
      note: 'الدرجة النهائية في التسميع والاختبار',
    },
    {
      session_id: 2,
      student_id: 7,
      attendance: 'present',
      homework: 'partial',
      recitation_score: 7,
      dictation_score: 8,
      exam_score: 39,
      note: 'تحسن ملحوظ ولكن يرجى إكمال الواجب',
    },
    // Group 3
    {
      session_id: 3,
      student_id: 8,
      attendance: 'present',
      homework: 'done',
      recitation_score: 9,
      dictation_score: 10,
      exam_score: 47,
      note: 'متميز في حل القطع النحوية',
    },
    {
      session_id: 3,
      student_id: 9,
      attendance: 'present',
      homework: 'done',
      recitation_score: 10,
      dictation_score: 10,
      exam_score: 49,
      note: 'التزام كامل ومستوى مشرف',
    },
  ];

  const monthly_fees: EduDatabaseBackup['monthly_fees'] = [
    // Group 1 - October 2026
    { id: 1, student_id: 1, month: 'أكتوبر 2026', amount: 250, is_paid: 1, paid_date: '01-10-2026' },
    { id: 2, student_id: 2, month: 'أكتوبر 2026', amount: 250, is_paid: 0, paid_date: null },
    { id: 3, student_id: 3, month: 'أكتوبر 2026', amount: 250, is_paid: 1, paid_date: '02-10-2026' },
    { id: 4, student_id: 4, month: 'أكتوبر 2026', amount: 250, is_paid: 1, paid_date: '05-10-2026' },
    // Group 2 - October 2026
    { id: 5, student_id: 5, month: 'أكتوبر 2026', amount: 300, is_paid: 1, paid_date: '01-10-2026' },
    { id: 6, student_id: 6, month: 'أكتوبر 2026', amount: 300, is_paid: 1, paid_date: '03-10-2026' },
    { id: 7, student_id: 7, month: 'أكتوبر 2026', amount: 300, is_paid: 0, paid_date: null },
    // Group 3 - October 2026
    { id: 8, student_id: 8, month: 'أكتوبر 2026', amount: 400, is_paid: 1, paid_date: '02-10-2026' },
    { id: 9, student_id: 9, month: 'أكتوبر 2026', amount: 400, is_paid: 1, paid_date: '04-10-2026' },
  ];

  return {
    version: 2,
    exported_at: new Date().toISOString(),
    stages: INITIAL_STAGES,
    groups_table: INITIAL_GROUPS,
    students: INITIAL_STUDENTS,
    sessions,
    session_records,
    monthly_fees,
    settings: [
      { key: 'teacher_name', value: DEFAULT_TEACHER_PROFILE.teacherName },
      { key: 'subject', value: DEFAULT_TEACHER_PROFILE.subject },
      { key: 'phone', value: DEFAULT_TEACHER_PROFILE.phone },
    ],
  };
}
