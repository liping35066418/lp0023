import { Router, type Request, type Response } from 'express';
import db from '../db/index.js';
import { success, fail } from '../utils/response.js';

const router = Router();

function buildTree(departments: any[], parentId: number | null = null): any[] {
  return departments
    .filter((d) => d.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((d) => ({
      ...d,
      children: buildTree(departments, d.id),
      employeeCount: departments.filter((emp) => emp.department_id === d.id).length || 0,
    }));
}

router.get('/tree', (req: Request, res: Response): void => {
  try {
    const departments = db
      .prepare('SELECT * FROM departments WHERE status = 1 ORDER BY sort_order')
      .all();
    
    const employees = db
      .prepare('SELECT id, department_id FROM employees WHERE status = "active"')
      .all();

    const tree = buildTree([...departments], null);
    
    const result = tree.map((dept: any) => {
      const countEmp = (d: any): number => {
        let count = employees.filter((e: any) => e.department_id === d.id).length;
        if (d.children) {
          d.children.forEach((child: any) => {
            count += countEmp(child);
          });
        }
        return count;
      };
      return {
        ...dept,
        employeeCount: countEmp(dept),
      };
    });

    res.json(success(result));
  } catch (error) {
    res.json(fail('获取部门树失败'));
  }
});

router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
    
    if (!dept) {
      res.json(fail('部门不存在', 404));
      return;
    }

    res.json(success(dept));
  } catch (error) {
    res.json(fail('获取部门信息失败'));
  }
});

router.post('/', (req: Request, res: Response): void => {
  try {
    const { name, parent_id, manager_id, description, sort_order } = req.body;
    
    const result = db
      .prepare(
        'INSERT INTO departments (name, parent_id, manager_id, description, sort_order) VALUES (?, ?, ?, ?, ?)'
      )
      .run(name, parent_id || null, manager_id || null, description || '', sort_order || 0);

    res.json(success({ id: result.lastInsertRowid }, '创建成功'));
  } catch (error) {
    res.json(fail('创建部门失败'));
  }
});

router.put('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { name, parent_id, manager_id, description, sort_order, status } = req.body;

    db.prepare(
      `UPDATE departments SET 
        name = COALESCE(?, name),
        parent_id = COALESCE(?, parent_id),
        manager_id = COALESCE(?, manager_id),
        description = COALESCE(?, description),
        sort_order = COALESCE(?, sort_order),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    ).run(name, parent_id, manager_id, description, sort_order, status, id);

    res.json(success(null, '更新成功'));
  } catch (error) {
    res.json(fail('更新部门失败'));
  }
});

router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    
    const childCount = db
      .prepare('SELECT COUNT(*) as count FROM departments WHERE parent_id = ?')
      .get(id) as { count: number };
    
    if (childCount.count > 0) {
      res.json(fail('存在子部门，无法删除'));
      return;
    }

    const empCount = db
      .prepare('SELECT COUNT(*) as count FROM employees WHERE department_id = ? AND status = "active"')
      .get(id) as { count: number };
    
    if (empCount.count > 0) {
      res.json(fail('部门下存在员工，无法删除'));
      return;
    }

    db.prepare('DELETE FROM departments WHERE id = ?').run(id);
    res.json(success(null, '删除成功'));
  } catch (error) {
    res.json(fail('删除部门失败'));
  }
});

router.get('/:id/employees', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10, keyword } = req.query;

    let sql = 'SELECT e.*, d.name as department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE e.department_id = ?';
    const params: any[] = [id];

    if (keyword) {
      sql += ' AND (e.name LIKE ? OR e.employee_no LIKE ? OR e.position LIKE ?)';
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    const total = db
      .prepare(sql.replace('SELECT e.*, d.name as department_name', 'SELECT COUNT(*) as count'))
      .get(...params) as { count: number };

    const offset = (Number(page) - 1) * Number(pageSize);
    sql += ` ORDER BY e.id LIMIT ? OFFSET ?`;
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
    res.json(fail('获取部门员工失败'));
  }
});

router.post('/batch-transfer', (req: Request, res: Response): void => {
  try {
    const { employeeIds, targetDepartmentId, reason } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      res.json(fail('请选择要调动的员工'));
      return;
    }

    const updateStmt = db.prepare(
      'UPDATE employees SET department_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );

    const historyStmt = db.prepare(
      'INSERT INTO employee_history (employee_id, type, before_data, after_data, change_reason, operator_id) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const transaction = db.transaction((ids: number[]) => {
      for (const empId of ids) {
        const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(empId);
        if (!emp) continue;

        const beforeData = JSON.stringify({ department_id: emp.department_id });
        const afterData = JSON.stringify({ department_id: targetDepartmentId });

        updateStmt.run(targetDepartmentId, empId);
        historyStmt.run(empId, 'transfer', beforeData, afterData, reason || '批量调动', 1);
      }
    });

    transaction(employeeIds);

    res.json(success(null, `成功调动 ${employeeIds.length} 名员工`));
  } catch (error) {
    res.json(fail('批量调动失败'));
  }
});

export default router;
