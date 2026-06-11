import { Router, type Request, type Response } from 'express';
import db from '../db/index.js';
import { success, fail } from '../utils/response.js';

const router = Router();

router.get('/templates', (req: Request, res: Response): void => {
  try {
    const { status, cycleType } = req.query;

    let sql = 'SELECT * FROM performance_templates WHERE 1=1';
    const params: any[] = [];

    if (status !== undefined && status !== null && status !== '') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (cycleType) {
      sql += ' AND cycle_type = ?';
      params.push(cycleType);
    }

    sql += ' ORDER BY created_at DESC';

    const templates = db.prepare(sql).all(...params);

    res.json(success(templates));
  } catch (error) {
    res.json(fail('获取考核模板失败'));
  }
});

router.get('/templates/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const template = db.prepare('SELECT * FROM performance_templates WHERE id = ?').get(id);

    if (!template) {
      res.json(fail('模板不存在', 404));
      return;
    }

    const dimensions = db
      .prepare('SELECT * FROM performance_dimensions WHERE template_id = ? ORDER BY sort_order')
      .all(id);

    res.json(
      success({
        ...template,
        dimensions,
      })
    );
  } catch (error) {
    res.json(fail('获取模板详情失败'));
  }
});

router.post('/templates', (req: Request, res: Response): void => {
  try {
    const { name, description, cycle_type, dimensions } = req.body;

    const transaction = db.transaction(() => {
      const result = db
        .prepare(
          'INSERT INTO performance_templates (name, description, cycle_type, created_by) VALUES (?, ?, ?, ?)'
        )
        .run(name, description || '', cycle_type || 'quarterly', 1);

      const templateId = result.lastInsertRowid;

      if (dimensions && dimensions.length > 0) {
        const insertDim = db.prepare(
          'INSERT INTO performance_dimensions (template_id, name, weight, sort_order, description, scoring_guide) VALUES (?, ?, ?, ?, ?, ?)'
        );

        dimensions.forEach((dim: any, index: number) => {
          insertDim.run(
            templateId,
            dim.name,
            dim.weight || 0,
            dim.sort_order || index + 1,
            dim.description || '',
            dim.scoring_guide || ''
          );
        });
      }

      return templateId;
    });

    const templateId = transaction();

    res.json(success({ id: templateId }, '创建成功'));
  } catch (error) {
    res.json(fail('创建模板失败'));
  }
});

router.put('/templates/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { name, description, cycle_type, status, dimensions } = req.body;

    const transaction = db.transaction(() => {
      db.prepare(
        `UPDATE performance_templates SET 
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          cycle_type = COALESCE(?, cycle_type),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      ).run(name, description, cycle_type, status, id);

      if (dimensions) {
        db.prepare('DELETE FROM performance_dimensions WHERE template_id = ?').run(id);

        const insertDim = db.prepare(
          'INSERT INTO performance_dimensions (template_id, name, weight, sort_order, description, scoring_guide) VALUES (?, ?, ?, ?, ?, ?)'
        );

        dimensions.forEach((dim: any, index: number) => {
          insertDim.run(
            id,
            dim.name,
            dim.weight || 0,
            dim.sort_order || index + 1,
            dim.description || '',
            dim.scoring_guide || ''
          );
        });
      }
    });

    transaction();

    res.json(success(null, '更新成功'));
  } catch (error) {
    res.json(fail('更新模板失败'));
  }
});

router.get('/reviews', (req: Request, res: Response): void => {
  try {
    const {
      page = 1,
      pageSize = 10,
      employeeId,
      templateId,
      status,
      cycleName,
      departmentId,
    } = req.query;

    let sql = `
      SELECT r.*, e.name as employee_name, e.employee_no, d.name as department_name,
             t.name as template_name, t.cycle_type
      FROM performance_reviews r
      LEFT JOIN employees e ON r.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN performance_templates t ON r.template_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      sql += ' AND r.employee_id = ?';
      params.push(employeeId);
    }

    if (templateId) {
      sql += ' AND r.template_id = ?';
      params.push(templateId);
    }

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    if (cycleName) {
      sql += ' AND r.cycle_name LIKE ?';
      params.push(`%${cycleName}%`);
    }

    if (departmentId) {
      sql += ' AND e.department_id = ?';
      params.push(departmentId);
    }

    const total = db
      .prepare(
        sql.replace(
          'SELECT r.*, e.name as employee_name, e.employee_no, d.name as department_name, t.name as template_name, t.cycle_type',
          'SELECT COUNT(*) as count'
        )
      )
      .get(...params) as { count: number };

    const offset = (Number(page) - 1) * Number(pageSize);
    sql += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(pageSize), offset);

    const reviews = db.prepare(sql).all(...params);

    res.json(
      success({
        list: reviews,
        total: total.count,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total.count / Number(pageSize)),
      })
    );
  } catch (error) {
    res.json(fail('获取考核列表失败'));
  }
});

router.get('/reviews/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const review = db.prepare(`
      SELECT r.*, e.name as employee_name, e.employee_no, e.position, e.department_id,
             d.name as department_name, t.name as template_name
      FROM performance_reviews r
      LEFT JOIN employees e ON r.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN performance_templates t ON r.template_id = t.id
      WHERE r.id = ?
    `).get(id);

    if (!review) {
      res.json(fail('考核记录不存在', 404));
      return;
    }

    const dimensions = db
      .prepare('SELECT * FROM performance_dimensions WHERE template_id = ? ORDER BY sort_order')
      .all(review.template_id);

    const scores = db
      .prepare('SELECT * FROM performance_scores WHERE review_id = ?')
      .all(id);

    const reviewers = db
      .prepare(`
        SELECT pr.*, e.name as reviewer_name
        FROM performance_reviewers pr
        LEFT JOIN employees e ON pr.reviewer_id = e.id
        WHERE pr.review_id = ?
      `)
      .all(id);

    res.json(
      success({
        ...review,
        dimensions,
        scores,
        reviewers,
      })
    );
  } catch (error) {
    res.json(fail('获取考核详情失败'));
  }
});

router.post('/reviews', (req: Request, res: Response): void => {
  try {
    const {
      template_id,
      employee_ids,
      cycle_name,
      start_date,
      end_date,
      reviewer_ids,
    } = req.body;

    if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
      res.json(fail('请选择考核员工'));
      return;
    }

    const transaction = db.transaction(() => {
      const createdIds: number[] = [];

      for (const empId of employee_ids) {
        const result = db
          .prepare(
            `INSERT INTO performance_reviews 
              (template_id, employee_id, cycle_name, start_date, end_date, status)
            VALUES (?, ?, ?, ?, ?, 'draft')`
          )
          .run(template_id, empId, cycle_name, start_date || null, end_date || null);

        const reviewId = result.lastInsertRowid as number;
        createdIds.push(reviewId);

        if (reviewer_ids && reviewer_ids.length > 0) {
          const insertReviewer = db.prepare(
            'INSERT INTO performance_reviewers (review_id, reviewer_id, reviewer_type, weight) VALUES (?, ?, ?, ?)'
          );

          reviewer_ids.forEach((rid: number, index: number) => {
            insertReviewer.run(
              reviewId,
              rid,
              index === 0 ? 'supervisor' : 'peer',
              index === 0 ? 70 : 30 / (reviewer_ids.length - 1 || 1)
            );
          });
        }
      }

      return createdIds;
    });

    const createdIds = transaction();

    res.json(success({ count: createdIds.length, ids: createdIds }, '考核创建成功'));
  } catch (error) {
    res.json(fail('考核创建失败'));
  }
});

router.post('/reviews/:id/self-score', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { scores, self_evaluation } = req.body;

    const review = db.prepare('SELECT * FROM performance_reviews WHERE id = ?').get(id);
    if (!review) {
      res.json(fail('考核记录不存在', 404));
      return;
    }

    const transaction = db.transaction(() => {
      db.prepare("DELETE FROM performance_scores WHERE review_id = ? AND score_type = 'self'").run(id);

      const insertScore = db.prepare(
        'INSERT INTO performance_scores (review_id, dimension_id, score_type, score, rater_id, comment) VALUES (?, ?, ?, ?, ?, ?)'
      );

      let totalWeightedScore = 0;
      const dimensions = db
        .prepare('SELECT * FROM performance_dimensions WHERE template_id = ?')
        .all(review.template_id);

      const dimMap = new Map(dimensions.map((d: any) => [d.id, d]));

      if (scores && scores.length > 0) {
        for (const s of scores) {
          insertScore.run(id, s.dimension_id, 'self', s.score, review.employee_id, s.comment || '');
          
          const dim = dimMap.get(s.dimension_id);
          if (dim) {
            totalWeightedScore += (s.score || 0) * (dim.weight / 100);
          }
        }
      }

      db.prepare(
        `UPDATE performance_reviews SET 
          self_score = ?, self_evaluation = ?, status = 'self_submitted'
        WHERE id = ?`
      ).run(Number(totalWeightedScore.toFixed(2)), self_evaluation || '', id);
    });

    transaction();

    res.json(success(null, '自评提交成功'));
  } catch (error) {
    res.json(fail('自评提交失败'));
  }
});

router.post('/reviews/:id/supervisor-score', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { scores, supervisor_evaluation, reviewer_id } = req.body;

    const review = db.prepare('SELECT * FROM performance_reviews WHERE id = ?').get(id);
    if (!review) {
      res.json(fail('考核记录不存在', 404));
      return;
    }

    const transaction = db.transaction(() => {
      db.prepare("DELETE FROM performance_scores WHERE review_id = ? AND score_type = 'supervisor'").run(id);

      const insertScore = db.prepare(
        'INSERT INTO performance_scores (review_id, dimension_id, score_type, score, rater_id, comment) VALUES (?, ?, ?, ?, ?, ?)'
      );

      let totalWeightedScore = 0;
      const dimensions = db
        .prepare('SELECT * FROM performance_dimensions WHERE template_id = ?')
        .all(review.template_id);

      const dimMap = new Map(dimensions.map((d: any) => [d.id, d]));

      if (scores && scores.length > 0) {
        for (const s of scores) {
          insertScore.run(id, s.dimension_id, 'supervisor', s.score, reviewer_id || 1, s.comment || '');
          
          const dim = dimMap.get(s.dimension_id);
          if (dim) {
            totalWeightedScore += (s.score || 0) * (dim.weight / 100);
          }
        }
      }

      const totalScore = calculateTotalScore(id, review.self_score || 0, Number(totalWeightedScore.toFixed(2)));
      const grade = calculateGrade(totalScore);
      const salaryAdjust = calculateSalaryAdjust(totalScore);

      db.prepare(
        `UPDATE performance_reviews SET 
          supervisor_score = ?, total_score = ?, grade = ?,
          supervisor_evaluation = ?, salary_grade_adjust = ?,
          status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      ).run(
        Number(totalWeightedScore.toFixed(2)),
        totalScore,
        grade,
        supervisor_evaluation || '',
        salaryAdjust,
        id
      );
    });

    transaction();

    res.json(success(null, '上级评分完成'));
  } catch (error) {
    res.json(fail('上级评分失败'));
  }
});

router.post('/reviews/:id/peer-score', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { scores, reviewer_id } = req.body;

    const review = db.prepare('SELECT * FROM performance_reviews WHERE id = ?').get(id);
    if (!review) {
      res.json(fail('考核记录不存在', 404));
      return;
    }

    const transaction = db.transaction(() => {
      db.prepare("DELETE FROM performance_scores WHERE review_id = ? AND score_type = 'peer' AND rater_id = ?").run(id, reviewer_id);

      const insertScore = db.prepare(
        'INSERT INTO performance_scores (review_id, dimension_id, score_type, score, rater_id, comment) VALUES (?, ?, ?, ?, ?, ?)'
      );

      let totalWeightedScore = 0;
      const dimensions = db
        .prepare('SELECT * FROM performance_dimensions WHERE template_id = ?')
        .all(review.template_id);

      const dimMap = new Map(dimensions.map((d: any) => [d.id, d]));

      if (scores && scores.length > 0) {
        for (const s of scores) {
          insertScore.run(id, s.dimension_id, 'peer', s.score, reviewer_id, s.comment || '');
          
          const dim = dimMap.get(s.dimension_id);
          if (dim) {
            totalWeightedScore += (s.score || 0) * (dim.weight / 100);
          }
        }
      }

      db.prepare(
        'UPDATE performance_reviewers SET status = ?, submitted_at = CURRENT_TIMESTAMP WHERE review_id = ? AND reviewer_id = ?'
      ).run('submitted', id, reviewer_id);

      const peerScores = db
        .prepare("SELECT DISTINCT rater_id FROM performance_scores WHERE review_id = ? AND score_type = 'peer'")
        .all(id);
      
      const reviewerCount = db
        .prepare("SELECT COUNT(*) as count FROM performance_reviewers WHERE review_id = ? AND reviewer_type = 'peer'")
        .get(id) as { count: number };

      if (peerScores.length >= reviewerCount.count) {
        const allPeerScores = db
          .prepare("SELECT * FROM performance_scores WHERE review_id = ? AND score_type = 'peer'")
          .all(id);

        let peerTotal = 0;
        const peerDimScores = new Map<number, { total: number; count: number }>();

        for (const ps of allPeerScores) {
          const dim = dimMap.get(ps.dimension_id);
          if (dim) {
            if (!peerDimScores.has(ps.dimension_id)) {
              peerDimScores.set(ps.dimension_id, { total: 0, count: 0 });
            }
            const entry = peerDimScores.get(ps.dimension_id)!;
            entry.total += ps.score;
            entry.count++;
          }
        }

        for (const [dimId, data] of peerDimScores) {
          const dim = dimMap.get(dimId);
          if (dim && data.count > 0) {
            peerTotal += (data.total / data.count) * (dim.weight / 100);
          }
        }

        const totalScore = calculateTotalScore(
          id,
          review.self_score || 0,
          review.supervisor_score || 0,
          Number(peerTotal.toFixed(2))
        );
        const grade = calculateGrade(totalScore);
        const salaryAdjust = calculateSalaryAdjust(totalScore);

        db.prepare(
          `UPDATE performance_reviews SET 
            peer_score = ?, total_score = ?, grade = ?,
            salary_grade_adjust = ?, status = 'completed', completed_at = CURRENT_TIMESTAMP
          WHERE id = ?`
        ).run(Number(peerTotal.toFixed(2)), totalScore, grade, salaryAdjust, id);
      }
    });

    transaction();

    res.json(success(null, '互评提交成功'));
  } catch (error) {
    res.json(fail('互评提交失败'));
  }
});

function calculateTotalScore(
  reviewId: number,
  selfScore: number,
  supervisorScore: number,
  peerScore: number = 0
): number {
  let total = 0;
  let totalWeight = 0;

  if (selfScore > 0) {
    total += selfScore * 0.2;
    totalWeight += 20;
  }
  if (supervisorScore > 0) {
    total += supervisorScore * 0.6;
    totalWeight += 60;
  }
  if (peerScore > 0) {
    total += peerScore * 0.2;
    totalWeight += 20;
  }

  if (totalWeight === 0) return 0;
  return Number(((total / totalWeight) * 100).toFixed(2));
}

function calculateGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'E';
}

function calculateSalaryAdjust(score: number): string {
  if (score >= 90) return 'up_2';
  if (score >= 80) return 'up_1';
  if (score >= 70) return 'keep';
  if (score >= 60) return 'down_1';
  return 'down_2';
}

router.post('/reviews/:id/reject', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { reason, target_stage } = req.body;

    db.prepare(
      `UPDATE performance_reviews SET 
        status = ?, review_stage = ?
      WHERE id = ?`
    ).run('rejected', target_stage || 'self', id);

    res.json(success(null, '考核已驳回'));
  } catch (error) {
    res.json(fail('驳回失败'));
  }
});

router.post('/reviews/:id/revise', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { scores, reason, type } = req.body;

    const review = db.prepare('SELECT * FROM performance_reviews WHERE id = ?').get(id);
    if (!review) {
      res.json(fail('考核记录不存在', 404));
      return;
    }

    const transaction = db.transaction(() => {
      if (type === 'supervisor' && scores && scores.length > 0) {
        db.prepare("DELETE FROM performance_scores WHERE review_id = ? AND score_type = 'supervisor'").run(id);

        const insertScore = db.prepare(
          'INSERT INTO performance_scores (review_id, dimension_id, score_type, score, rater_id, comment) VALUES (?, ?, ?, ?, ?, ?)'
        );

        const dimensions = db
          .prepare('SELECT * FROM performance_dimensions WHERE template_id = ?')
          .all(review.template_id);

        const dimMap = new Map(dimensions.map((d: any) => [d.id, d]));

        let totalWeightedScore = 0;
        for (const s of scores) {
          insertScore.run(id, s.dimension_id, 'supervisor', s.score, 1, s.comment || '');
          
          const dim = dimMap.get(s.dimension_id);
          if (dim) {
            totalWeightedScore += (s.score || 0) * (dim.weight / 100);
          }
        }

        const totalScore = calculateTotalScore(
          id,
          review.self_score || 0,
          Number(totalWeightedScore.toFixed(2)),
          review.peer_score || 0
        );
        const grade = calculateGrade(totalScore);
        const salaryAdjust = calculateSalaryAdjust(totalScore);

        db.prepare(
          `UPDATE performance_reviews SET 
            supervisor_score = ?, total_score = ?, grade = ?,
            salary_grade_adjust = ?, is_revised = 1, revision_reason = ?, revised_at = CURRENT_TIMESTAMP
          WHERE id = ?`
        ).run(
          Number(totalWeightedScore.toFixed(2)),
          totalScore,
          grade,
          salaryAdjust,
          reason || '',
          id
        );
      }
    });

    transaction();

    res.json(success(null, '修正成功'));
  } catch (error) {
    res.json(fail('修正失败'));
  }
});

router.get('/salary-grades', (req: Request, res: Response): void => {
  try {
    const grades = db.prepare('SELECT * FROM salary_grades WHERE status = 1 ORDER BY level').all();
    res.json(success(grades));
  } catch (error) {
    res.json(fail('获取薪酬档位失败'));
  }
});

router.post('/salary-grades', (req: Request, res: Response): void => {
  try {
    const { grade, level, base_salary, min_salary, max_salary, description } = req.body;

    const result = db
      .prepare(
        'INSERT INTO salary_grades (grade, level, base_salary, min_salary, max_salary, description) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(grade, level, base_salary, min_salary || null, max_salary || null, description || '');

    res.json(success({ id: result.lastInsertRowid }, '创建成功'));
  } catch (error) {
    res.json(fail('创建薪酬档位失败'));
  }
});

router.get('/statistics', (req: Request, res: Response): void => {
  try {
    const { cycle_name, departmentId } = req.query;

    let sql = `
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
        SUM(CASE WHEN status = 'self_submitted' THEN 1 ELSE 0 END) as self_submitted_count,
        AVG(CASE WHEN total_score IS NOT NULL THEN total_score ELSE NULL END) as avg_score,
        SUM(CASE WHEN grade = 'A' THEN 1 ELSE 0 END) as grade_a_count,
        SUM(CASE WHEN grade = 'B' THEN 1 ELSE 0 END) as grade_b_count,
        SUM(CASE WHEN grade = 'C' THEN 1 ELSE 0 END) as grade_c_count,
        SUM(CASE WHEN grade = 'D' THEN 1 ELSE 0 END) as grade_d_count,
        SUM(CASE WHEN grade = 'E' THEN 1 ELSE 0 END) as grade_e_count
      FROM performance_reviews r
      LEFT JOIN employees e ON r.employee_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (cycle_name) {
      sql += ' AND r.cycle_name = ?';
      params.push(cycle_name);
    }

    if (departmentId) {
      sql += ' AND e.department_id = ?';
      params.push(departmentId);
    }

    const stats = db.prepare(sql).get(...params);

    res.json(success(stats));
  } catch (error) {
    res.json(fail('获取统计数据失败'));
  }
});

router.get('/salary-adjustments', (req: Request, res: Response): void => {
  try {
    const { departmentId, cycleName } = req.query;

    let sql = `
      SELECT 
        r.id as review_id,
        r.employee_id,
        r.cycle_name,
        r.total_score,
        r.grade,
        r.salary_grade_adjust,
        r.completed_at,
        e.name as employee_name,
        e.employee_no,
        e.salary_grade as current_grade,
        d.id as department_id,
        d.name as department_name,
        sg_current.base_salary as current_base_salary
      FROM performance_reviews r
      LEFT JOIN employees e ON r.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN salary_grades sg_current ON e.salary_grade = sg_current.grade
      WHERE r.status = 'completed'
        AND r.salary_grade_adjust IS NOT NULL
        AND e.status = 'active'
    `;
    const params: any[] = [];

    if (departmentId) {
      sql += ' AND e.department_id = ?';
      params.push(departmentId);
    }

    if (cycleName) {
      sql += ' AND r.cycle_name = ?';
      params.push(cycleName);
    }

    sql += ' ORDER BY r.completed_at DESC, e.department_id';

    const reviews = db.prepare(sql).all(...params);

    const salaryGrades = db.prepare('SELECT * FROM salary_grades WHERE status = 1 ORDER BY level').all() as any[];
    const gradeMap = new Map(salaryGrades.map((g: any) => [g.grade, g]));
    const gradeLevels = salaryGrades.map((g: any) => ({ grade: g.grade, level: g.level }));

    const suggestions = reviews.map((r: any) => {
      const currentLevel = gradeLevels.find((g: any) => g.grade === r.current_grade)?.level || 0;
      const adjust = r.salary_grade_adjust || 'keep';
      
      let targetLevel = currentLevel;
      if (adjust === 'up_2') targetLevel += 2;
      else if (adjust === 'up_1') targetLevel += 1;
      else if (adjust === 'down_1') targetLevel -= 1;
      else if (adjust === 'down_2') targetLevel -= 2;

      const minLevel = Math.min(...gradeLevels.map((g: any) => g.level));
      const maxLevel = Math.max(...gradeLevels.map((g: any) => g.level));
      targetLevel = Math.max(minLevel, Math.min(maxLevel, targetLevel));

      const suggestedGrade = gradeLevels.find((g: any) => g.level === targetLevel)?.grade || r.current_grade;
      const suggestedGradeInfo = gradeMap.get(suggestedGrade);
      const currentGradeInfo = gradeMap.get(r.current_grade);

      return {
        ...r,
        suggested_grade: suggestedGrade,
        suggested_base_salary: suggestedGradeInfo?.base_salary || 0,
        current_base_salary: currentGradeInfo?.base_salary || 0,
        salary_diff: (suggestedGradeInfo?.base_salary || 0) - (currentGradeInfo?.base_salary || 0),
        is_boundary: targetLevel === minLevel || targetLevel === maxLevel,
        available_grades: gradeLevels.map((g: any) => ({
          grade: g.grade,
          level: g.level,
          base_salary: gradeMap.get(g.grade)?.base_salary || 0,
          disabled: g.level < minLevel || g.level > maxLevel,
        })),
      };
    });

    const cycles = db.prepare(`
      SELECT DISTINCT cycle_name 
      FROM performance_reviews 
      WHERE status = 'completed'
      ORDER BY cycle_name DESC
    `).all();

    res.json(success({
      list: suggestions,
      salary_grades: salaryGrades,
      cycles,
    }));
  } catch (error) {
    console.error('获取调薪建议失败:', error);
    res.json(fail('获取调薪建议失败'));
  }
});

router.post('/salary-adjustments/submit', (req: Request, res: Response): void => {
  try {
    const { adjustments, effective_date } = req.body;

    if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
      res.json(fail('请选择要调薪的员工'));
      return;
    }

    const salaryGrades = db.prepare('SELECT * FROM salary_grades WHERE status = 1 ORDER BY level').all() as any[];
    const gradeMap = new Map(salaryGrades.map((g: any) => [g.grade, g]));
    const minLevel = Math.min(...salaryGrades.map((g: any) => g.level));
    const maxLevel = Math.max(...salaryGrades.map((g: any) => g.level));

    const transaction = db.transaction(() => {
      for (const adj of adjustments) {
        const { employee_id, review_id, target_grade, current_grade } = adj;

        const targetLevel = salaryGrades.find((g: any) => g.grade === target_grade)?.level;
        if (targetLevel === undefined) continue;

        const clampedLevel = Math.max(minLevel, Math.min(maxLevel, targetLevel));
        const finalGrade = salaryGrades.find((g: any) => g.level === clampedLevel)?.grade;
        if (!finalGrade) continue;

        if (finalGrade === current_grade) continue;

        const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id) as any;
        if (!employee) continue;

        const review = db.prepare('SELECT * FROM performance_reviews WHERE id = ?').get(review_id) as any;

        const beforeData = JSON.stringify({
          salary_grade: current_grade,
          base_salary: gradeMap.get(current_grade)?.base_salary || 0,
        });

        const afterData = JSON.stringify({
          salary_grade: finalGrade,
          base_salary: gradeMap.get(finalGrade)?.base_salary || 0,
        });

        db.prepare(
          'UPDATE employees SET salary_grade = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(finalGrade, employee_id);

        const changeReason = `绩效考核调薪 - ${review?.cycle_name || ''}，考核等级：${review?.grade || ''}，依据考核ID：${review_id}`;

        db.prepare(
          `INSERT INTO employee_history 
           (employee_id, type, before_data, after_data, change_reason, operator_id, created_at)
           VALUES (?, 'salary_adjust', ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(
          employee_id,
          beforeData,
          afterData,
          changeReason,
          1
        );

        db.prepare(
          `INSERT INTO salary_adjustment_records 
           (employee_id, review_id, current_grade, target_grade, effective_date, status, operator_id, created_at)
           VALUES (?, ?, ?, ?, ?, 'approved', ?, CURRENT_TIMESTAMP)`
        ).run(
          employee_id,
          review_id,
          current_grade,
          finalGrade,
          effective_date || new Date().toISOString().split('T')[0],
          1
        );
      }
    });

    transaction();

    res.json(success(null, `成功调薪 ${adjustments.length} 人`));
  } catch (error) {
    console.error('调薪提交失败:', error);
    res.json(fail('调薪提交失败'));
  }
});

router.get('/cycles', (req: Request, res: Response): void => {
  try {
    const cycles = db.prepare(`
      SELECT DISTINCT cycle_name 
      FROM performance_reviews 
      WHERE status = 'completed'
      ORDER BY cycle_name DESC
    `).all();

    res.json(success(cycles));
  } catch (error) {
    res.json(fail('获取考核周期失败'));
  }
});

export default router;
