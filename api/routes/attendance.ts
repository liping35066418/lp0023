import { Router, type Request, type Response } from 'express';
import db from '../db/index.js';
import { success, fail } from '../utils/response.js';
import dayjs from 'dayjs';

const router = Router();

router.get('/records', (req: Request, res: Response): void => {
  try {
    const {
      page = 1,
      pageSize = 20,
      employeeId,
      departmentId,
      startDate,
      endDate,
      status,
    } = req.query;

    let sql = `
      SELECT a.*, e.name as employee_name, e.employee_no, d.name as department_name
      FROM attendance_records a
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      sql += ' AND a.employee_id = ?';
      params.push(employeeId);
    }

    if (departmentId) {
      sql += ' AND e.department_id = ?';
      params.push(departmentId);
    }

    if (startDate) {
      sql += ' AND a.punch_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND a.punch_date <= ?';
      params.push(endDate);
    }

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    const total = db
      .prepare(sql.replace('SELECT a.*, e.name as employee_name, e.employee_no, d.name as department_name', 'SELECT COUNT(*) as count'))
      .get(...params) as { count: number };

    const offset = (Number(page) - 1) * Number(pageSize);
    sql += ` ORDER BY a.punch_date DESC, a.employee_id LIMIT ? OFFSET ?`;
    params.push(Number(pageSize), offset);

    const records = db.prepare(sql).all(...params);

    res.json(
      success({
        list: records,
        total: total.count,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total.count / Number(pageSize)),
      })
    );
  } catch (error) {
    res.json(fail('获取考勤记录失败'));
  }
});

router.post('/records', (req: Request, res: Response): void => {
  try {
    const { employee_id, punch_date, punch_in, punch_out, remark } = req.body;

    const existing = db
      .prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND punch_date = ?')
      .get(employee_id, punch_date);

    if (existing) {
      db.prepare(
        `UPDATE attendance_records SET 
          punch_in = COALESCE(?, punch_in),
          punch_out = COALESCE(?, punch_out),
          remark = COALESCE(?, remark),
          updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = ? AND punch_date = ?`
      ).run(punch_in || null, punch_out || null, remark || null, employee_id, punch_date);

      recalculateWorkHours(employee_id, punch_date);
      res.json(success(null, '打卡记录更新成功'));
    } else {
      const result = db
        .prepare(
          'INSERT INTO attendance_records (employee_id, punch_date, punch_in, punch_out, remark) VALUES (?, ?, ?, ?, ?)'
        )
        .run(employee_id, punch_date, punch_in || null, punch_out || null, remark || '');

      recalculateWorkHours(employee_id, punch_date);
      res.json(success({ id: result.lastInsertRowid }, '打卡成功'));
    }
  } catch (error) {
    res.json(fail('打卡失败'));
  }
});

function recalculateWorkHours(employeeId: number | string, punchDate: string) {
  const record = db
    .prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND punch_date = ?')
    .get(employeeId, punchDate);

  if (!record || !record.punch_in || !record.punch_out) {
    if (record && !record.punch_in && !record.punch_out) {
      db.prepare('UPDATE attendance_records SET work_hours = 0, status = ? WHERE id = ?')
        .run('absent', record.id);
    }
    return;
  }

  const [inH, inM] = record.punch_in.split(':').map(Number);
  const [outH, outM] = record.punch_out.split(':').map(Number);

  const startMinutes = inH * 60 + inM;
  const endMinutes = outH * 60 + outM;
  const workMinutes = endMinutes - startMinutes - 60;
  const workHours = Math.max(0, Number((workMinutes / 60).toFixed(2)));

  const stdStart = 8 * 60 + 30;
  const stdEnd = 17 * 60 + 30;

  let status = 'normal';
  if (startMinutes > stdStart) {
    status = 'late';
  }
  if (endMinutes < stdEnd) {
    status = status === 'late' ? 'late_and_early' : 'early_leave';
  }

  db.prepare(
    'UPDATE attendance_records SET work_hours = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(workHours, status, record.id);
}

router.get('/summary', (req: Request, res: Response): void => {
  try {
    const { year, month, departmentId, employeeId } = req.query;

    if (!year || !month) {
      res.json(fail('请指定年月'));
      return;
    }

    let sql = `
      SELECT s.*, e.name as employee_name, e.employee_no, d.name as department_name
      FROM attendance_summary s
      LEFT JOIN employees e ON s.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE s.year = ? AND s.month = ?
    `;
    const params: any[] = [year, month];

    if (departmentId) {
      sql += ' AND e.department_id = ?';
      params.push(departmentId);
    }

    if (employeeId) {
      sql += ' AND s.employee_id = ?';
      params.push(employeeId);
    }

    sql += ' ORDER BY e.department_id, e.id';

    const summaries = db.prepare(sql).all(...params);

    res.json(success(summaries));
  } catch (error) {
    res.json(fail('获取考勤汇总失败'));
  }
});

router.post('/calculate', (req: Request, res: Response): void => {
  try {
    const { year, month, departmentId } = req.body;

    if (!year || !month) {
      res.json(fail('请指定年月'));
      return;
    }

    const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD');
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');

    let empSql = 'SELECT id FROM employees WHERE status = \'active\'';
    const empParams: any[] = [];

    if (departmentId) {
      empSql += ' AND department_id = ?';
      empParams.push(departmentId);
    }

    const employees = db.prepare(empSql).all(...empParams) as { id: number }[];

    const calculateTransaction = db.transaction((emps: { id: number }[]) => {
      for (const emp of emps) {
        const records = db
          .prepare(
            'SELECT * FROM attendance_records WHERE employee_id = ? AND punch_date BETWEEN ? AND ?'
          )
          .all(emp.id, startDate, endDate);

        const leaves = db
          .prepare(
            "SELECT * FROM leaves WHERE employee_id = ? AND status = 'approved' AND start_date <= ? AND end_date >= ?"
          )
          .all(emp.id, endDate, startDate);

        const overtimes = db
          .prepare(
            "SELECT * FROM overtime WHERE employee_id = ? AND status = 'approved' AND overtime_date BETWEEN ? AND ?"
          )
          .all(emp.id, startDate, endDate);

        const fieldworks = db
          .prepare(
            "SELECT * FROM fieldwork WHERE employee_id = ? AND status = 'approved' AND field_date BETWEEN ? AND ?"
          )
          .all(emp.id, startDate, endDate);

        const workDays = records.length;
        let normalDays = 0;
        let lateCount = 0;
        let earlyLeaveCount = 0;
        let absentCount = 0;
        let totalWorkHours = 0;

        for (const r of records) {
          if (r.status === 'normal') normalDays++;
          if (r.status === 'late' || r.status === 'late_and_early') lateCount++;
          if (r.status === 'early_leave' || r.status === 'late_and_early') earlyLeaveCount++;
          if (r.status === 'absent') absentCount++;
          totalWorkHours += r.work_hours || 0;
        }

        let leaveDays = 0;
        for (const l of leaves) {
          const leaveStart = dayjs(l.start_date);
          const leaveEnd = dayjs(l.end_date);
          const periodStart = dayjs(startDate);
          const periodEnd = dayjs(endDate);

          const overlapStart = dayjs.max(leaveStart, periodStart);
          const overlapEnd = dayjs.min(leaveEnd, periodEnd);

          if (overlapStart.isBefore(overlapEnd)) {
            leaveDays += overlapEnd.diff(overlapStart, 'day') + 1;
          }
        }

        const overtimeHours = overtimes.reduce((sum: number, o: any) => sum + (o.hours || 0), 0);
        const fieldworkDays = fieldworks.length;

        const existing = db
          .prepare('SELECT id FROM attendance_summary WHERE employee_id = ? AND year = ? AND month = ?')
          .get(emp.id, year, month);

        if (existing) {
          db.prepare(
            `UPDATE attendance_summary SET 
              work_days = ?, actual_work_days = ?,
              late_count = ?, early_leave_count = ?, absent_count = ?,
              leave_days = ?, overtime_hours = ?, fieldwork_days = ?,
              normal_days = ?, status = 'calculated',
              calculated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`
          ).run(
            workDays,
            Number(totalWorkHours / 8).toFixed(2),
            lateCount,
            earlyLeaveCount,
            absentCount,
            leaveDays,
            overtimeHours,
            fieldworkDays,
            normalDays,
            existing.id
          );
        } else {
          db.prepare(
            `INSERT INTO attendance_summary 
              (employee_id, year, month, work_days, actual_work_days,
               late_count, early_leave_count, absent_count,
               leave_days, overtime_hours, fieldwork_days,
               normal_days, status, calculated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'calculated', CURRENT_TIMESTAMP)`
          ).run(
            emp.id,
            year,
            month,
            workDays,
            Number(totalWorkHours / 8).toFixed(2),
            lateCount,
            earlyLeaveCount,
            absentCount,
            leaveDays,
            overtimeHours,
            fieldworkDays,
            normalDays
          );
        }
      }
    });

    calculateTransaction(employees);

    res.json(success({ count: employees.length }, '考勤核算完成'));
  } catch (error) {
    res.json(fail('考勤核算失败'));
  }
});

router.get('/leaves', (req: Request, res: Response): void => {
  try {
    const {
      page = 1,
      pageSize = 10,
      employeeId,
      status,
      leaveType,
    } = req.query;

    let sql = `
      SELECT l.*, e.name as employee_name, e.employee_no, d.name as department_name
      FROM leaves l
      LEFT JOIN employees e ON l.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      sql += ' AND l.employee_id = ?';
      params.push(employeeId);
    }

    if (status) {
      sql += ' AND l.status = ?';
      params.push(status);
    }

    if (leaveType) {
      sql += ' AND l.leave_type = ?';
      params.push(leaveType);
    }

    const total = db
      .prepare(sql.replace('SELECT l.*, e.name as employee_name, e.employee_no, d.name as department_name', 'SELECT COUNT(*) as count'))
      .get(...params) as { count: number };

    const offset = (Number(page) - 1) * Number(pageSize);
    sql += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(pageSize), offset);

    const leaves = db.prepare(sql).all(...params);

    res.json(
      success({
        list: leaves,
        total: total.count,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total.count / Number(pageSize)),
      })
    );
  } catch (error) {
    res.json(fail('获取请假记录失败'));
  }
});

router.post('/leaves', (req: Request, res: Response): void => {
  try {
    const {
      employee_id,
      leave_type,
      start_date,
      end_date,
      start_time,
      end_time,
      days,
      reason,
    } = req.body;

    const result = db
      .prepare(
        `INSERT INTO leaves 
          (employee_id, leave_type, start_date, end_date, start_time, end_time, days, reason, status, applicant_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
      )
      .run(
        employee_id,
        leave_type,
        start_date,
        end_date,
        start_time || null,
        end_time || null,
        days,
        reason || '',
        employee_id
      );

    res.json(success({ id: result.lastInsertRowid }, '请假申请提交成功'));
  } catch (error) {
    res.json(fail('请假申请提交失败'));
  }
});

router.post('/leaves/:id/approve', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { result, remark } = req.body;

    db.prepare(
      `UPDATE leaves SET 
        status = ?, approver_id = 1, approve_time = CURRENT_TIMESTAMP, approve_remark = ?
      WHERE id = ?`
    ).run(result === true || result === 'approved' ? 'approved' : 'rejected', remark || '', id);

    res.json(success(null, '审批完成'));
  } catch (error) {
    res.json(fail('审批失败'));
  }
});

router.get('/overtime', (req: Request, res: Response): void => {
  try {
    const {
      page = 1,
      pageSize = 10,
      employeeId,
      status,
      overtimeType,
    } = req.query;

    let sql = `
      SELECT o.*, e.name as employee_name, e.employee_no, d.name as department_name
      FROM overtime o
      LEFT JOIN employees e ON o.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      sql += ' AND o.employee_id = ?';
      params.push(employeeId);
    }

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    if (overtimeType) {
      sql += ' AND o.overtime_type = ?';
      params.push(overtimeType);
    }

    const total = db
      .prepare(sql.replace('SELECT o.*, e.name as employee_name, e.employee_no, d.name as department_name', 'SELECT COUNT(*) as count'))
      .get(...params) as { count: number };

    const offset = (Number(page) - 1) * Number(pageSize);
    sql += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(pageSize), offset);

    const overtimes = db.prepare(sql).all(...params);

    res.json(
      success({
        list: overtimes,
        total: total.count,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total.count / Number(pageSize)),
      })
    );
  } catch (error) {
    res.json(fail('获取加班记录失败'));
  }
});

router.post('/overtime', (req: Request, res: Response): void => {
  try {
    const {
      employee_id,
      overtime_date,
      start_time,
      end_time,
      hours,
      overtime_type,
      reason,
    } = req.body;

    const result = db
      .prepare(
        `INSERT INTO overtime 
          (employee_id, overtime_date, start_time, end_time, hours, overtime_type, reason, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`
      )
      .run(
        employee_id,
        overtime_date,
        start_time,
        end_time,
        hours,
        overtime_type || 'workday',
        reason || ''
      );

    res.json(success({ id: result.lastInsertRowid }, '加班申请提交成功'));
  } catch (error) {
    res.json(fail('加班申请提交失败'));
  }
});

router.post('/overtime/:id/approve', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { result, remark } = req.body;

    db.prepare(
      `UPDATE overtime SET 
        status = ?, approver_id = 1, approve_time = CURRENT_TIMESTAMP, approve_remark = ?
      WHERE id = ?`
    ).run(result === true || result === 'approved' ? 'approved' : 'rejected', remark || '', id);

    res.json(success(null, '审批完成'));
  } catch (error) {
    res.json(fail('审批失败'));
  }
});

router.get('/fieldwork', (req: Request, res: Response): void => {
  try {
    const {
      page = 1,
      pageSize = 10,
      employeeId,
      status,
    } = req.query;

    let sql = `
      SELECT f.*, e.name as employee_name, e.employee_no, d.name as department_name
      FROM fieldwork f
      LEFT JOIN employees e ON f.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      sql += ' AND f.employee_id = ?';
      params.push(employeeId);
    }

    if (status) {
      sql += ' AND f.status = ?';
      params.push(status);
    }

    const total = db
      .prepare(sql.replace('SELECT f.*, e.name as employee_name, e.employee_no, d.name as department_name', 'SELECT COUNT(*) as count'))
      .get(...params) as { count: number };

    const offset = (Number(page) - 1) * Number(pageSize);
    sql += ` ORDER BY f.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(pageSize), offset);

    const fieldworks = db.prepare(sql).all(...params);

    res.json(
      success({
        list: fieldworks,
        total: total.count,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total.count / Number(pageSize)),
      })
    );
  } catch (error) {
    res.json(fail('获取外勤记录失败'));
  }
});

router.post('/fieldwork', (req: Request, res: Response): void => {
  try {
    const {
      employee_id,
      field_date,
      start_time,
      end_time,
      location,
      purpose,
    } = req.body;

    const result = db
      .prepare(
        `INSERT INTO fieldwork 
          (employee_id, field_date, start_time, end_time, location, purpose, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')`
      )
      .run(
        employee_id,
        field_date,
        start_time || null,
        end_time || null,
        location || '',
        purpose || ''
      );

    res.json(success({ id: result.lastInsertRowid }, '外勤申请提交成功'));
  } catch (error) {
    res.json(fail('外勤申请提交失败'));
  }
});

router.post('/fieldwork/:id/approve', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { result, remark } = req.body;

    db.prepare(
      `UPDATE fieldwork SET 
        status = ?, approver_id = 1, approve_time = CURRENT_TIMESTAMP, approve_remark = ?
      WHERE id = ?`
    ).run(result === true || result === 'approved' ? 'approved' : 'rejected', remark || '', id);

    res.json(success(null, '审批完成'));
  } catch (error) {
    res.json(fail('审批失败'));
  }
});

router.get('/appeals', (req: Request, res: Response): void => {
  try {
    const {
      page = 1,
      pageSize = 10,
      employeeId,
      status,
    } = req.query;

    let sql = `
      SELECT a.*, e.name as employee_name, e.employee_no, d.name as department_name
      FROM attendance_appeals a
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      sql += ' AND a.employee_id = ?';
      params.push(employeeId);
    }

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    const total = db
      .prepare(sql.replace('SELECT a.*, e.name as employee_name, e.employee_no, d.name as department_name', 'SELECT COUNT(*) as count'))
      .get(...params) as { count: number };

    const offset = (Number(page) - 1) * Number(pageSize);
    sql += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(pageSize), offset);

    const appeals = db.prepare(sql).all(...params);

    res.json(
      success({
        list: appeals,
        total: total.count,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total.count / Number(pageSize)),
      })
    );
  } catch (error) {
    res.json(fail('获取申诉记录失败'));
  }
});

router.post('/appeals', (req: Request, res: Response): void => {
  try {
    const {
      employee_id,
      attendance_id,
      appeal_date,
      appeal_type,
      reason,
    } = req.body;

    const result = db
      .prepare(
        `INSERT INTO attendance_appeals 
          (employee_id, attendance_id, appeal_date, appeal_type, reason, status)
        VALUES (?, ?, ?, ?, ?, 'pending')`
      )
      .run(
        employee_id,
        attendance_id || null,
        appeal_date,
        appeal_type,
        reason
      );

    res.json(success({ id: result.lastInsertRowid }, '申诉提交成功'));
  } catch (error) {
    res.json(fail('申诉提交失败'));
  }
});

router.post('/appeals/:id/approve', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { result, remark } = req.body;

    const status = result === true || result === 'approved' ? 'approved' : 'rejected';

    db.prepare(
      `UPDATE attendance_appeals SET 
        status = ?, approver_id = 1, approve_time = CURRENT_TIMESTAMP,
        approve_result = ?, approve_remark = ?
      WHERE id = ?`
    ).run(status, status, remark || '', id);

    if (status === 'approved') {
      const appeal = db.prepare('SELECT * FROM attendance_appeals WHERE id = ?').get(id);
      if (appeal && appeal.attendance_id) {
        const att = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(appeal.attendance_id);
        if (att) {
          db.prepare(
            'UPDATE attendance_records SET status = ?, remark = COALESCE(?, remark) WHERE id = ?'
          ).run('normal', appeal.reason, att.id);
        }
      }
    }

    res.json(success(null, '审批完成'));
  } catch (error) {
    res.json(fail('审批失败'));
  }
});

router.get('/shifts', (req: Request, res: Response): void => {
  try {
    const shifts = db.prepare('SELECT * FROM shifts WHERE status = 1 ORDER BY id').all();
    res.json(success(shifts));
  } catch (error) {
    res.json(fail('获取班次列表失败'));
  }
});

router.post('/shifts', (req: Request, res: Response): void => {
  try {
    const { name, start_time, end_time, work_hours, rest_start, rest_end, rest_hours, is_flexible, description } = req.body;

    const result = db
      .prepare(
        `INSERT INTO shifts (name, start_time, end_time, work_hours, rest_start, rest_end, rest_hours, is_flexible, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        name,
        start_time,
        end_time,
        work_hours || 8,
        rest_start || null,
        rest_end || null,
        rest_hours || 1,
        is_flexible || 0,
        description || ''
      );

    res.json(success({ id: result.lastInsertRowid }, '创建成功'));
  } catch (error) {
    res.json(fail('创建班次失败'));
  }
});

export default router;
