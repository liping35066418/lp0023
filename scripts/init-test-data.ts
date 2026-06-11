import db from '../api/db/index.js';

function init() {
  const emps = db.prepare('SELECT id, name, employee_no, salary_grade, department_id FROM employees').all();
  console.log('Employees:', emps.length);
  console.log(emps);

  const templates = db.prepare('SELECT * FROM performance_templates').all();
  console.log('\nTemplates:', templates.length);

  const reviewCount = db.prepare('SELECT COUNT(*) as count FROM performance_reviews').get().count;
  console.log('\nExisting reviews:', reviewCount);

  if (emps.length > 0 && templates.length > 0) {
    console.log('\nUpdating employees with salary grades...');
    
    const updateGrade = db.prepare('UPDATE employees SET salary_grade = ? WHERE id = ?');
    
    const gradeAssignments = {
      1: 'S3',
      2: 'S2',
      5: 'S4',
      6: 'S2',
      7: 'S3',
      8: 'S3',
      9: 'S2',
      11: 'S1',
    };
    
    for (const [empId, grade] of Object.entries(gradeAssignments)) {
      const emp = emps.find(e => e.id === Number(empId));
      if (emp) {
        updateGrade.run(grade, Number(empId));
        console.log(`  ${emp.name}: ${grade}`);
      }
    }

    if (reviewCount === 0) {
      console.log('\nCreating test performance reviews...');
      
      const insertReview = db.prepare(`
        INSERT INTO performance_reviews 
        (template_id, employee_id, cycle_name, start_date, end_date, status, 
         self_score, supervisor_score, total_score, grade, salary_grade_adjust, 
         completed_at)
        VALUES (?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      const testData = [
        { empId: 6, grade: 'A', adjust: 'up_2', total: 92.5, self: 90, supervisor: 93 },
        { empId: 7, grade: 'B', adjust: 'up_1', total: 85.2, self: 82, supervisor: 86 },
        { empId: 8, grade: 'C', adjust: 'keep', total: 75.8, self: 78, supervisor: 75 },
        { empId: 9, grade: 'D', adjust: 'down_1', total: 62.5, self: 65, supervisor: 62 },
        { empId: 5, grade: 'B', adjust: 'up_1', total: 83.6, self: 85, supervisor: 83 },
        { empId: 2, grade: 'A', adjust: 'up_2', total: 91.0, self: 92, supervisor: 91 },
      ];
      
      for (const data of testData) {
        const emp = emps.find(e => e.id === data.empId);
        if (emp) {
          insertReview.run(
            templates[0].id,
            data.empId,
            '2024-Q2',
            '2024-04-01',
            '2024-06-30',
            data.self,
            data.supervisor,
            data.total,
            data.grade,
            data.adjust
          );
          console.log(`  Created review for ${emp.name}: Grade ${data.grade}, Adjust ${data.adjust}`);
        }
      }
      
      console.log('\nTest data created successfully!');
    }
  }

  const reviews = db.prepare('SELECT r.id, r.employee_id, r.cycle_name, r.status, r.grade, r.salary_grade_adjust, r.total_score, e.name as employee_name, e.salary_grade FROM performance_reviews r LEFT JOIN employees e ON r.employee_id = e.id').all();
  console.log('\nAll reviews:');
  console.log(reviews);

  const grades = db.prepare('SELECT * FROM salary_grades').all();
  console.log('\nSalary grades:');
  console.log(grades);
}

init();
