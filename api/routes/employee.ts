import { Router, type Request, type Response } from 'express';
import db from '../db/index.js';
import { success, fail } from '../utils/response.js';

const router = Router();

function generateEmployeeNo() {
  const result = db
    .prepare('SELECT COUNT(*) as count FROM employees')
    .get() as { count: number };
  return `EMP${String(result.count + 1).padStart(3, '0')}`;
}

router.get('/', (req: Request, res: Response): void => {
  try {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      departmentId,
      status,
      position,
    } = req.query;

    let sql = 'SELECT e.*, d.name as department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE 1=1';
    const params: any[] = [];

    if (keyword) {
      sql += ' AND (e.name LIKE ? OR e.employee_no LIKE ? OR e.phone LIKE ?)';
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    if (departmentId) {
      sql += ' AND e.department_id = ?';
      params.push(departmentId);
    }

    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    }

    if (position) {
      sql += ' AND e.position LIKE ?';
      params.push(`%${position}%`);
    }

    const total = db
      .prepare(sql.replace('SELECT e.*, d.name as department_name', 'SELECT COUNT(*) as count'))
      .get(...params) as { count: number };

    const offset = (Number(page) - 1) * Number(pageSize);
    sql += ` ORDER BY e.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(pageSize), offset);

    const employees = db.prepare(sql).all(...params);

    res.json(
      success({
        list: employees,
        total: total.count,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total.count / Number(pageSize)),
      })
    );
  } catch (error) {
    res.json(fail('获取员工列表失败'));
  }
});

router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const employee = db
      .prepare(
        'SELECT e.*, d.name as department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE e.id = ?'
      )
      .get(id);

    if (!employee) {
      res.json(fail('员工不存在', 404));
      return;
    }

    res.json(success(employee));
  } catch (error) {
    res.json(fail('获取员工信息失败'));
  }
});

router.post('/', (req: Request, res: Response): void => {
  try {
    const data = req.body;
    const employeeNo = data.employee_no || generateEmployeeNo();

    const result = db
      .prepare(
        `INSERT INTO employees (
          employee_no, name, gender, birth_date, id_card, phone, email,
          department_id, position, job_level, salary_grade, entry_date,
          regular_date, status, address, education, major, graduate_school,
          emergency_contact, emergency_phone, bank_name, bank_account, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        employeeNo,
        data.name,
        data.gender || null,
        data.birth_date || null,
        data.id_card || null,
        data.phone || null,
        data.email || null,
        data.department_id || null,
        data.position || null,
        data.job_level || null,
        data.salary_grade || null,
        data.entry_date || null,
        data.regular_date || null,
        data.status || 'active',
        data.address || null,
        data.education || null,
        data.major || null,
        data.graduate_school || null,
        data.emergency_contact || null,
        data.emergency_phone || null,
        data.bank_name || null,
        data.bank_account || null,
        data.remark || null
      );

    db.prepare(
      'INSERT INTO employee_history (employee_id, type, after_data, change_reason, operator_id) VALUES (?, ?, ?, ?, ?)'
    ).run(
      result.lastInsertRowid,
      'entry',
      JSON.stringify(data),
      '入职',
      1
    );

    res.json(success({ id: result.lastInsertRowid, employee_no: employeeNo }, '入职成功'));
  } catch (error) {
    res.json(fail('员工入职失败'));
  }
});

router.put('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const data = req.body;

    const oldEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    if (!oldEmployee) {
      res.json(fail('员工不存在', 404));
      return;
    }

    const fields = [];
    const params: any[] = [];

    const updatableFields = [
      'name', 'gender', 'birth_date', 'id_card', 'phone', 'email',
      'department_id', 'position', 'job_level', 'salary_grade', 'entry_date',
      'regular_date', 'status', 'address', 'education', 'major', 'graduate_school',
      'emergency_contact', 'emergency_phone', 'bank_name', 'bank_account', 'remark'
    ];

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      db.prepare(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`).run(...params);

      const changes: Record<string, { before: any; after: any }> = {};
      for (const field of updatableFields) {
        if (data[field] !== undefined && oldEmployee[field] !== data[field]) {
          changes[field] = { before: oldEmployee[field], after: data[field] };
        }
      }

      if (Object.keys(changes).length > 0) {
        db.prepare(
          'INSERT INTO employee_history (employee_id, type, before_data, after_data, change_reason, operator_id) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(
          id,
          'update',
          JSON.stringify(oldEmployee),
          JSON.stringify(data),
          '信息更新',
          1
        );
      }
    }

    res.json(success(null, '更新成功'));
  } catch (error) {
    res.json(fail('更新员工信息失败'));
  }
});

router.post('/:id/transfer', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { target_department_id, new_position, reason, effective_date } = req.body;

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    if (!employee) {
      res.json(fail('员工不存在', 404));
      return;
    }

    const beforeData = JSON.stringify({
      department_id: employee.department_id,
      position: employee.position,
    });

    const afterData = JSON.stringify({
      department_id: target_department_id,
      position: new_position || employee.position,
    });

    db.prepare(
      'UPDATE employees SET department_id = ?, position = COALESCE(?, position), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(target_department_id, new_position || null, id);

    db.prepare(
      'INSERT INTO employee_history (employee_id, type, before_data, after_data, change_reason, operator_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, 'transfer', beforeData, afterData, reason || '调岗', 1);

    res.json(success(null, '调岗成功'));
  } catch (error) {
    res.json(fail('调岗失败'));
  }
});

router.post('/:id/resign', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { leave_date, reason, remark } = req.body;

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    if (!employee) {
      res.json(fail('员工不存在', 404));
      return;
    }

    const beforeData = JSON.stringify({ status: employee.status, leave_date: employee.leave_date });
    const afterData = JSON.stringify({ status: 'resigned', leave_date });

    db.prepare(
      'UPDATE employees SET status = ?, leave_date = ?, remark = COALESCE(?, remark), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run('resigned', leave_date, remark || null, id);

    db.prepare(
      'INSERT INTO employee_history (employee_id, type, before_data, after_data, change_reason, operator_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, 'resign', beforeData, afterData, reason || '离职', 1);

    res.json(success(null, '离职办理成功'));
  } catch (error) {
    res.json(fail('离职办理失败'));
  }
});

router.get('/:id/history', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const history = db
      .prepare(
        `SELECT h.*, 
          CASE h.type 
            WHEN 'entry' THEN '入职'
            WHEN 'transfer' THEN '调岗'
            WHEN 'resign' THEN '离职'
            WHEN 'update' THEN '信息更新'
            WHEN 'salary_adjust' THEN '调薪'
            ELSE h.type 
          END as type_name
        FROM employee_history h 
        WHERE h.employee_id = ? 
        ORDER BY h.created_at DESC`
      )
      .all(id);

    const result = history.map((h: any) => ({
      ...h,
      before_data: h.before_data ? JSON.parse(h.before_data) : null,
      after_data: h.after_data ? JSON.parse(h.after_data) : null,
    }));

    res.json(success(result));
  } catch (error) {
    res.json(fail('获取履历失败'));
  }
});

router.get('/:id/attachments', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const attachments = db
      .prepare('SELECT * FROM employee_attachments WHERE employee_id = ? ORDER BY created_at DESC')
      .all(id);

    res.json(success(attachments));
  } catch (error) {
    res.json(fail('获取附件失败'));
  }
});

router.post('/:id/attachments', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { file_name, file_path, file_size, file_type, category } = req.body;

    const result = db
      .prepare(
        'INSERT INTO employee_attachments (employee_id, file_name, file_path, file_size, file_type, category, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .run(id, file_name, file_path, file_size || null, file_type || null, category || null, 1);

    res.json(success({ id: result.lastInsertRowid }, '上传成功'));
  } catch (error) {
    res.json(fail('附件上传失败'));
  }
});

router.delete('/attachments/:attId', (req: Request, res: Response): void => {
  try {
    const { attId } = req.params;

    db.prepare('DELETE FROM employee_attachments WHERE id = ?').run(attId);

    res.json(success(null, '删除成功'));
  } catch (error) {
    res.json(fail('删除附件失败'));
  }
});

router.post('/batch-export', (req: Request, res: Response): void => {
  try {
    const { employeeIds, fields } = req.body;

    let sql = 'SELECT * FROM employees';
    const params: any[] = [];

    if (employeeIds && employeeIds.length > 0) {
      sql += ` WHERE id IN (${employeeIds.map(() => '?').join(',')})`;
      params.push(...employeeIds);
    }

    sql += ' ORDER BY id';

    const employees = db.prepare(sql).all(...params);

    res.json(success({
      count: employees.length,
      data: employees,
      fields: fields || ['employee_no', 'name', 'gender', 'department_id', 'position', 'phone', 'email', 'entry_date', 'status'],
    }));
  } catch (error) {
    res.json(fail('导出失败'));
  }
});

export default router;
