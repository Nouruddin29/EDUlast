import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePhone,
  buildWhatsAppUrl,
  clampScore,
  calculateStudentGrade,
  generateMonthlyReportText,
  calculateSessionSummary,
  calculateFeesSummary,
} from './eduLogic';

test('sanitizePhone prepends Egypt country code 2 to 11-digit 01 numbers', () => {
  assert.equal(sanitizePhone('01012345678'), '201012345678');
  assert.equal(sanitizePhone('011-234-56789'), '201123456789');
  assert.equal(sanitizePhone('201012345678'), '201012345678');
});

test('clampScore keeps scores within valid bounds', () => {
  assert.equal(clampScore(11, 0, 10), 10);
  assert.equal(clampScore(-2, 0, 10), 0);
  assert.equal(clampScore(45, 0, 50), 45);
  assert.equal(clampScore(55, 0, 50), 50);
});

test('calculateStudentGrade computes accurate cumulative grade', () => {
  assert.equal(calculateStudentGrade(48, 8).label, 'ممتاز (A+)');
  assert.equal(calculateStudentGrade(40, 6).label, 'جيد جداً (B+)');
  assert.equal(calculateStudentGrade(30, 5).label, 'مقبول (C)');
});

test('generateMonthlyReportText produces formatted WhatsApp report matching Flutter template', () => {
  const report = generateMonthlyReportText({
    student: {
      id: 1,
      groupId: 1,
      name: 'أحمد محمود العوضي',
      parentPhone: '01012345678',
      studentPhone: '01011111111',
      notes: 'متفوق ونشيط جداً',
    },
    group: {
      id: 1,
      stageId: 1,
      name: '3 إعدادي (السبت والثلاثاء 4م)',
      schedule: 'السبت والثلاثاء - 4:00 عصراً',
      defaultFee: 250,
    },
    month: 'أكتوبر 2026',
    totalSessions: 8,
    presentCount: 8,
    absentCount: 0,
    homeworkRate: '100% ممتاز',
    recitationScore: 9,
    dictationScore: 10,
    examScore: 49,
    isFeePaid: true,
    feeDate: '01-10-2026',
    teacherName: 'مستر أحمد الصاوي',
    notes: 'ممتاز ومشارك بإيجابية',
  });

  assert.ok(report.includes('أحمد محمود العوضي'));
  assert.ok(report.includes('3 إعدادي (السبت والثلاثاء 4م)'));
  assert.ok(report.includes('ممتاز (A+)'));
  assert.ok(report.includes('تم السداد بتاريخ: 01-10-2026'));
  assert.ok(report.includes('مستر أحمد الصاوي'));
});

test('calculateSessionSummary and calculateFeesSummary compute accurate totals', () => {
  const sessionSummary = calculateSessionSummary([
    {
      studentId: 1,
      studentName: 'أحمد',
      parentPhone: '010',
      attendance: 'present',
      homework: 'done',
      recitationScore: 9,
      dictationScore: 10,
      examScore: 49,
      note: '',
    },
    {
      studentId: 2,
      studentName: 'عمر',
      parentPhone: '011',
      attendance: 'absent',
      homework: 'notDone',
      recitationScore: 5,
      dictationScore: 6,
      examScore: 35,
      note: '',
    },
  ]);

  assert.equal(sessionSummary.total, 2);
  assert.equal(sessionSummary.presentCount, 1);
  assert.equal(sessionSummary.absentCount, 1);
  assert.equal(sessionSummary.homeworkDoneCount, 1);

  const feeSummary = calculateFeesSummary([
    {
      id: 1,
      studentId: 1,
      studentName: 'أحمد',
      parentPhone: '010',
      month: 'أكتوبر 2026',
      amount: 250,
      isPaid: true,
      paidDate: '01-10-2026',
    },
    {
      id: 2,
      studentId: 2,
      studentName: 'عمر',
      parentPhone: '011',
      month: 'أكتوبر 2026',
      amount: 250,
      isPaid: false,
      paidDate: null,
    },
  ]);

  assert.equal(feeSummary.totalCollected, 250);
  assert.equal(feeSummary.totalPending, 250);
  assert.equal(feeSummary.paidStudentsCount, 1);
  assert.equal(feeSummary.unpaidStudentsCount, 1);
  assert.equal(feeSummary.collectionRate, 50);
});
