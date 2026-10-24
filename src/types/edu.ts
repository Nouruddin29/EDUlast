export type AttendanceStatus = 'present' | 'absent' | 'late';
export type HomeworkStatus = 'done' | 'partial' | 'notDone';

export interface StageModel {
  id: number;
  name: string;
}

export interface GroupModel {
  id: number;
  stageId: number;
  name: string;
  schedule: string;
  defaultFee: number;
}

export interface StudentModel {
  id: number;
  groupId: number;
  name: string;
  parentPhone: string;
  studentPhone: string;
  notes: string;
}

export interface SessionModel {
  id: number;
  groupId: number;
  sessionDate: string; // YYYY-MM-DD
  title: string;
}

export interface SessionStudentData {
  studentId: number;
  studentName: string;
  parentPhone: string;
  attendance: AttendanceStatus;
  homework: HomeworkStatus;
  recitationScore: number; // 0 - 10
  dictationScore: number;  // 0 - 10
  examScore: number;       // 0 - 50
  note: string;
}

export interface FeeItemModel {
  id: number;
  studentId: number;
  studentName: string;
  parentPhone: string;
  month: string;
  amount: number;
  isPaid: boolean;
  paidDate: string | null;
}

export interface TeacherProfileModel {
  teacherName: string;
  subject: string;
  phone: string;
}

export interface EduDatabaseBackup {
  version: number;
  exported_at: string;
  stages: StageModel[];
  groups_table: GroupModel[];
  students: StudentModel[];
  sessions: SessionModel[];
  session_records: Array<{
    session_id: number;
    student_id: number;
    attendance: AttendanceStatus;
    homework: HomeworkStatus;
    recitation_score: number;
    dictation_score: number;
    exam_score: number;
    note: string;
  }>;
  monthly_fees: Array<{
    id: number;
    student_id: number;
    month: string;
    amount: number;
    is_paid: number;
    paid_date: string | null;
  }>;
  settings: Array<{
    key: string;
    value: string;
  }>;
}
