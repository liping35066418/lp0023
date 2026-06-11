import db from './index.js';

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      manager_id INTEGER,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_no TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      gender TEXT,
      birth_date DATE,
      id_card TEXT,
      phone TEXT,
      email TEXT,
      department_id INTEGER,
      position TEXT,
      job_level TEXT,
      salary_grade TEXT,
      entry_date DATE,
      regular_date DATE,
      leave_date DATE,
      status TEXT DEFAULT 'active',
      address TEXT,
      education TEXT,
      major TEXT,
      graduate_school TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      bank_name TEXT,
      bank_account TEXT,
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS employee_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      before_data TEXT,
      after_data TEXT,
      change_reason TEXT,
      operator_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS employee_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      category TEXT,
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      work_hours REAL DEFAULT 8,
      rest_start TEXT,
      rest_end TEXT,
      rest_hours REAL DEFAULT 1,
      is_flexible INTEGER DEFAULT 0,
      description TEXT,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employee_shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      shift_id INTEGER NOT NULL,
      effective_date DATE NOT NULL,
      end_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (shift_id) REFERENCES shifts(id)
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      punch_date DATE NOT NULL,
      punch_in TIME,
      punch_out TIME,
      punch_in_location TEXT,
      punch_out_location TEXT,
      punch_in_device TEXT,
      punch_out_device TEXT,
      work_hours REAL,
      status TEXT DEFAULT 'normal',
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(employee_id, punch_date),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      leave_type TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      days REAL NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      approver_id INTEGER,
      approve_time DATETIME,
      approve_remark TEXT,
      applicant_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS overtime (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      overtime_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      hours REAL NOT NULL,
      overtime_type TEXT,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      approver_id INTEGER,
      approve_time DATETIME,
      approve_remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS fieldwork (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      field_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      location TEXT,
      purpose TEXT,
      status TEXT DEFAULT 'pending',
      approver_id INTEGER,
      approve_time DATETIME,
      approve_remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS attendance_summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      work_days REAL DEFAULT 0,
      actual_work_days REAL DEFAULT 0,
      late_count INTEGER DEFAULT 0,
      early_leave_count INTEGER DEFAULT 0,
      absent_count INTEGER DEFAULT 0,
      leave_days REAL DEFAULT 0,
      overtime_hours REAL DEFAULT 0,
      fieldwork_days REAL DEFAULT 0,
      normal_days REAL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      calculated_at DATETIME,
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(employee_id, year, month),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS attendance_appeals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      attendance_id INTEGER,
      appeal_date DATE NOT NULL,
      appeal_type TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      approver_id INTEGER,
      approve_time DATETIME,
      approve_result TEXT,
      approve_remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (attendance_id) REFERENCES attendance_records(id)
    );

    CREATE TABLE IF NOT EXISTS performance_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      cycle_type TEXT DEFAULT 'quarterly',
      status INTEGER DEFAULT 1,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS performance_dimensions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      weight REAL NOT NULL DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      description TEXT,
      scoring_guide TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES performance_templates(id)
    );

    CREATE TABLE IF NOT EXISTS performance_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      cycle_name TEXT NOT NULL,
      start_date DATE,
      end_date DATE,
      status TEXT DEFAULT 'draft',
      self_score REAL,
      supervisor_score REAL,
      peer_score REAL,
      total_score REAL,
      grade TEXT,
      salary_grade_change TEXT,
      salary_grade_adjust TEXT,
      self_evaluation TEXT,
      supervisor_evaluation TEXT,
      reviewer_id INTEGER,
      submitted_at DATETIME,
      completed_at DATETIME,
      is_revised INTEGER DEFAULT 0,
      revision_reason TEXT,
      revised_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES performance_templates(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS performance_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL,
      dimension_id INTEGER NOT NULL,
      score_type TEXT NOT NULL,
      score REAL NOT NULL,
      rater_id INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (review_id) REFERENCES performance_reviews(id),
      FOREIGN KEY (dimension_id) REFERENCES performance_dimensions(id)
    );

    CREATE TABLE IF NOT EXISTS performance_reviewers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL,
      reviewer_id INTEGER NOT NULL,
      reviewer_type TEXT NOT NULL,
      weight REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      submitted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (review_id) REFERENCES performance_reviews(id)
    );

    CREATE TABLE IF NOT EXISTS salary_grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grade TEXT NOT NULL,
      level INTEGER NOT NULL,
      base_salary REAL NOT NULL,
      min_salary REAL,
      max_salary REAL,
      description TEXT,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      employee_id INTEGER,
      role TEXT DEFAULT 'user',
      status INTEGER DEFAULT 1,
      last_login_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE INDEX IF NOT EXISTS idx_emp_dept ON employees(department_id);
    CREATE INDEX IF NOT EXISTS idx_emp_status ON employees(status);
    CREATE INDEX IF NOT EXISTS idx_att_date ON attendance_records(punch_date);
    CREATE INDEX IF NOT EXISTS idx_att_emp_date ON attendance_records(employee_id, punch_date);
    CREATE INDEX IF NOT EXISTS idx_leave_emp ON leaves(employee_id);
    CREATE INDEX IF NOT EXISTS idx_overtime_emp ON overtime(employee_id);
    CREATE INDEX IF NOT EXISTS idx_summary_ym ON attendance_summary(year, month);
    CREATE INDEX IF NOT EXISTS idx_dept_parent ON departments(parent_id);
  `);

  const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get() as { count: number };
  if (deptCount.count === 0) {
    seedData();
  }
}

function seedData() {
  const insertDept = db.prepare(
    'INSERT INTO departments (name, parent_id, description, sort_order) VALUES (?, ?, ?, ?)'
  );

  const dept1 = insertDept.run('总经办', null, '公司最高管理层', 1).lastInsertRowid;
  const dept2 = insertDept.run('人力资源部', dept1, '负责人力资源管理', 2).lastInsertRowid;
  const dept3 = insertDept.run('财务部', dept1, '负责财务管理', 3).lastInsertRowid;
  const dept4 = insertDept.run('技术部', dept1, '负责技术研发', 4).lastInsertRowid;
  const dept5 = insertDept.run('市场部', dept1, '负责市场营销', 5).lastInsertRowid;
  const dept6 = insertDept.run('前端组', dept4, '前端开发团队', 1).lastInsertRowid;
  const dept7 = insertDept.run('后端组', dept4, '后端开发团队', 2).lastInsertRowid;
  const dept8 = insertDept.run('测试组', dept4, '测试团队', 3).lastInsertRowid;

  const insertShift = db.prepare(
    'INSERT INTO shifts (name, start_time, end_time, work_hours, rest_start, rest_end, rest_hours, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const shift1 = insertShift.run('早班', '08:30', '17:30', 8, '12:00', '13:00', 1, '标准早班').lastInsertRowid;
  const shift2 = insertShift.run('中班', '09:00', '18:00', 8, '12:30', '13:30', 1, '标准中班').lastInsertRowid;
  insertShift.run('晚班', '13:00', '22:00', 8, '17:00', '18:00', 1, '晚班制度');
  insertShift.run('弹性班', '10:00', '19:00', 8, '13:00', '14:00', 1, '弹性工作制');

  const insertEmp = db.prepare(`
    INSERT INTO employees (
      employee_no, name, gender, birth_date, id_card, phone, email,
      department_id, position, job_level, salary_grade, entry_date,
      status, address, education, major, graduate_school,
      emergency_contact, emergency_phone, bank_name, bank_account
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const emp1 = insertEmp.run(
    'EMP001', '张三', '男', '1985-03-15', '110101198503150011', '13800138001',
    'zhangsan@company.com', dept1, '总经理', 'P8', 'S5', '2015-01-01', 'active',
    '北京市朝阳区建国路88号', '硕士', '工商管理', '清华大学',
    '李四', '13900139001', '中国工商银行', '6222020001000100001'
  ).lastInsertRowid;

  const emp2 = insertEmp.run(
    'EMP002', '李四', '女', '1988-07-22', '110101198807220022', '13800138002',
    'lisi@company.com', dept2, 'HR经理', 'P6', 'S3', '2016-03-15', 'active',
    '北京市海淀区中关村大街1号', '本科', '人力资源管理', '中国人民大学',
    '王五', '13900139002', '中国建设银行', '6222020001000100002'
  ).lastInsertRowid;

  const emp3 = insertEmp.run(
    'EMP003', '王五', '男', '1990-12-10', '110101199012100033', '13800138003',
    'wangwu@company.com', dept3, '财务主管', 'P6', 'S3', '2017-06-01', 'active',
    '北京市西城区金融街10号', '本科', '会计学', '中央财经大学',
    '赵六', '13900139003', '中国银行', '6222020001000100003'
  ).lastInsertRowid;

  const emp4 = insertEmp.run(
    'EMP004', '赵六', '男', '1987-05-30', '110101198705300044', '13800138004',
    'zhaoliu@company.com', dept4, '技术总监', 'P7', 'S4', '2016-09-01', 'active',
    '北京市朝阳区望京SOHO', '硕士', '计算机科学', '北京邮电大学',
    '钱七', '13900139004', '招商银行', '6222020001000100004'
  ).lastInsertRowid;

  const emp5 = insertEmp.run(
    'EMP005', '钱七', '女', '1992-09-18', '110101199209180055', '13800138005',
    'qianqi@company.com', dept5, '市场经理', 'P5', 'S2', '2018-02-01', 'active',
    '北京市东城区王府井大街', '本科', '市场营销', '对外经贸大学',
    '孙八', '13900139005', '农业银行', '6222020001000100005'
  ).lastInsertRowid;

  insertEmp.run(
    'EMP006', '孙八', '男', '1994-11-25', '110101199411250066', '13800138006',
    'sunba@company.com', dept6, '高级前端工程师', 'P5', 'S2', '2019-04-01', 'active',
    '北京市昌平区回龙观', '本科', '软件工程', '北京理工大学',
    '周九', '13900139006', '交通银行', '6222020001000100006'
  );

  insertEmp.run(
    'EMP007', '周九', '男', '1993-08-08', '110101199308080077', '13800138007',
    'zhoujiu@company.com', dept7, '高级后端工程师', 'P5', 'S2', '2018-11-15', 'active',
    '北京市通州区梨园', '硕士', '计算机应用', '北京航空航天大学',
    '吴十', '13900139007', '浦发银行', '6222020001000100007'
  );

  insertEmp.run(
    'EMP008', '吴十', '女', '1995-02-14', '110101199502140088', '13800138008',
    'wushi@company.com', dept8, '测试工程师', 'P4', 'S1', '2020-07-01', 'active',
    '北京市石景山区古城', '本科', '信息管理', '北京工业大学',
    '郑十一', '13900139008', '兴业银行', '6222020001000100008'
  );

  insertEmp.run(
    'EMP009', '郑十一', '男', '1991-06-06', '110101199106060099', '13800138009',
    'zheng11@company.com', dept6, '前端工程师', 'P4', 'S1', '2020-03-01', 'active',
    '北京市丰台区角门', '本科', '计算机科学', '北京交通大学',
    '冯十二', '13900139009', '民生银行', '6222020001000100009'
  );

  insertEmp.run(
    'EMP010', '冯十二', '女', '1996-04-20', '110101199604200100', '13800138010',
    'feng12@company.com', dept2, 'HR专员', 'P3', 'S1', '2021-01-15', 'active',
    '北京市大兴区黄村', '本科', '心理学', '北京师范大学',
    '陈十三', '13900139010', '华夏银行', '6222020001000100010'
  );

  const insertEmpShift = db.prepare(
    'INSERT INTO employee_shifts (employee_id, shift_id, effective_date) VALUES (?, ?, ?)'
  );

  for (let i = 1; i <= 10; i++) {
    insertEmpShift.run(i, i <= 3 ? shift1 : shift2, '2023-01-01');
  }

  const insertSalary = db.prepare(
    'INSERT INTO salary_grades (grade, level, base_salary, min_salary, max_salary, description) VALUES (?, ?, ?, ?, ?, ?)'
  );

  insertSalary.run('S1', 1, 8000, 6000, 10000, '初级岗位');
  insertSalary.run('S2', 2, 12000, 10000, 15000, '中级岗位');
  insertSalary.run('S3', 3, 18000, 15000, 22000, '高级岗位');
  insertSalary.run('S4', 4, 28000, 22000, 35000, '专家岗位');
  insertSalary.run('S5', 5, 45000, 35000, 60000, '管理岗位');

  const insertTemplate = db.prepare(
    'INSERT INTO performance_templates (name, description, cycle_type, created_by) VALUES (?, ?, ?, ?)'
  );

  const template1 = insertTemplate.run('季度绩效考核', '标准季度绩效考核模板', 'quarterly', 1).lastInsertRowid;
  const template2 = insertTemplate.run('年度绩效考核', '年度综合绩效考核模板', 'yearly', 1).lastInsertRowid;

  const insertDimension = db.prepare(
    'INSERT INTO performance_dimensions (template_id, name, weight, sort_order, description, scoring_guide) VALUES (?, ?, ?, ?, ?, ?)'
  );

  insertDimension.run(template1, '工作业绩', 40, 1, '工作任务完成情况', '按目标完成度评分，100分满分');
  insertDimension.run(template1, '工作能力', 25, 2, '专业能力与技能水平', '按专业技能熟练度评分');
  insertDimension.run(template1, '工作态度', 20, 3, '工作积极性与责任心', '按日常表现评分');
  insertDimension.run(template1, '团队协作', 15, 4, '团队合作与沟通能力', '按团队贡献评分');

  insertDimension.run(template2, '工作业绩', 35, 1, '年度工作业绩', '按年度目标完成情况评分');
  insertDimension.run(template2, '工作能力', 30, 2, '专业能力发展', '按能力提升和专业水平评分');
  insertDimension.run(template2, '工作态度', 15, 3, '工作态度与责任心', '按全年表现评分');
  insertDimension.run(template2, '创新贡献', 20, 4, '创新与改进贡献', '按创新成果和改进建议评分');

  const insertUser = db.prepare(
    'INSERT INTO users (username, password, employee_id, role) VALUES (?, ?, ?, ?)'
  );

  insertUser.run('admin', 'admin123', 1, 'admin');
  insertUser.run('hr001', 'hr123456', 2, 'hr');
  insertUser.run('user001', 'user123', 3, 'user');

  const punchDates = [];
  const now = new Date();
  for (let i = 30; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      punchDates.push(d.toISOString().split('T')[0]);
    }
  }

  const insertPunch = db.prepare(`
    INSERT INTO attendance_records 
    (employee_id, punch_date, punch_in, punch_out, work_hours, status, remark)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (let empId = 1; empId <= 10; empId++) {
    for (const date of punchDates) {
      const inOffset = Math.floor(Math.random() * 60) - 30;
      const outOffset = Math.floor(Math.random() * 60) - 30;
      
      let inHour = 8 + Math.floor(inOffset / 60);
      let inMin = 30 + (inOffset % 60);
      if (inMin >= 60) { inHour++; inMin -= 60; }
      if (inMin < 0) { inHour--; inMin += 60; }
      
      let outHour = 17 + Math.floor(outOffset / 60);
      let outMin = 30 + (outOffset % 60);
      if (outMin >= 60) { outHour++; outMin -= 60; }
      if (outMin < 0) { outHour--; outMin += 60; }

      const punchIn = `${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}:00`;
      const punchOut = `${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}:00`;
      
      const startMinutes = inHour * 60 + inMin;
      const endMinutes = outHour * 60 + outMin;
      const workMinutes = endMinutes - startMinutes - 60;
      const workHours = Math.max(0, workMinutes / 60);

      let status = 'normal';
      if (inHour > 8 || (inHour === 8 && inMin > 30)) {
        status = 'late';
      } else if (outHour < 17 || (outHour === 17 && outMin < 30)) {
        status = 'early_leave';
      }

      if (Math.random() < 0.05) {
        status = 'absent';
      }

      insertPunch.run(
        empId, date, 
        status === 'absent' ? null : punchIn, 
        status === 'absent' ? null : punchOut,
        status === 'absent' ? 0 : workHours,
        status,
        ''
      );
    }
  }

  const insertLeave = db.prepare(`
    INSERT INTO leaves (employee_id, leave_type, start_date, end_date, days, reason, status, applicant_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLeave.run(6, 'sick', '2025-05-20', '2025-05-21', 2, '感冒发烧', 'approved', 6);
  insertLeave.run(7, 'personal', '2025-05-28', '2025-05-28', 1, '处理私事', 'approved', 7);
  insertLeave.run(8, 'annual', '2025-06-10', '2025-06-12', 3, '年假休息', 'pending', 8);

  const insertOvertime = db.prepare(`
    INSERT INTO overtime (employee_id, overtime_date, start_time, end_time, hours, overtime_type, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOvertime.run(6, '2025-05-25', '18:00', '21:00', 3, 'workday', '项目赶工', 'approved');
  insertOvertime.run(7, '2025-06-01', '09:00', '18:00', 8, 'weekend', '版本发布', 'approved');
  insertOvertime.run(9, '2025-06-05', '18:30', '20:30', 2, 'workday', 'bug修复', 'pending');

  const insertFieldwork = db.prepare(`
    INSERT INTO fieldwork (employee_id, field_date, start_time, end_time, location, purpose, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertFieldwork.run(5, '2025-05-22', '09:00', '17:00', '客户公司', '客户拜访', 'approved');
  insertFieldwork.run(5, '2025-06-03', '10:00', '16:00', '会展中心', '参加展会', 'pending');
}

export default initDatabase;
