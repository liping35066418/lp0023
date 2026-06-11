import { useState, useEffect } from 'react';
import {
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface SalaryGrade {
  id: number;
  grade: string;
  level: number;
  base_salary: number;
  min_salary?: number;
  max_salary?: number;
  description?: string;
}

interface AvailableGrade {
  grade: string;
  level: number;
  base_salary: number;
  disabled: boolean;
}

interface AdjustmentSuggestion {
  review_id: number;
  employee_id: number;
  employee_name: string;
  employee_no: string;
  department_id: number;
  department_name: string;
  cycle_name: string;
  total_score: number;
  grade: string;
  salary_grade_adjust: string;
  completed_at: string;
  current_grade: string;
  current_base_salary: number;
  suggested_grade: string;
  suggested_base_salary: number;
  salary_diff: number;
  is_boundary: boolean;
  available_grades: AvailableGrade[];
}

interface Cycle {
  cycle_name: string;
}

interface Department {
  id: number;
  name: string;
  parent_id?: number;
  employeeCount?: number;
  children?: Department[];
}

const gradeColors: Record<string, string> = {
  A: 'text-green-600 bg-green-100',
  B: 'text-blue-600 bg-blue-100',
  C: 'text-yellow-600 bg-yellow-100',
  D: 'text-orange-600 bg-orange-100',
  E: 'text-red-600 bg-red-100',
};

const adjustLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  up_2: { label: '升2档', icon: <TrendingUp size={14} />, color: 'text-green-600' },
  up_1: { label: '升1档', icon: <TrendingUp size={14} />, color: 'text-green-600' },
  keep: { label: '不调整', icon: <Minus size={14} />, color: 'text-gray-500' },
  down_1: { label: '降1档', icon: <TrendingDown size={14} />, color: 'text-orange-600' },
  down_2: { label: '降2档', icon: <TrendingDown size={14} />, color: 'text-red-600' },
};

export default function SalaryAdjustment() {
  const [suggestions, setSuggestions] = useState<AdjustmentSuggestion[]>([]);
  const [salaryGrades, setSalaryGrades] = useState<SalaryGrade[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [targetGrades, setTargetGrades] = useState<Record<number, string>>({});
  const [departmentId, setDepartmentId] = useState('');
  const [cycleName, setCycleName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, [departmentId, cycleName]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (departmentId) params.append('departmentId', departmentId);
      if (cycleName) params.append('cycleName', cycleName);

      const res = await fetch(`/api/performance/salary-adjustments?${params}`);
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.data.list || []);
        setSalaryGrades(data.data.salary_grades || []);
        setCycles(data.data.cycles || []);

        const initialGrades: Record<number, string> = {};
        (data.data.list || []).forEach((s: AdjustmentSuggestion) => {
          initialGrades[s.review_id] = s.suggested_grade;
        });
        setTargetGrades(initialGrades);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('获取调薪建议失败:', error);
      setSuggestions(getMockData());
      const initialGrades: Record<number, string> = {};
      getMockData().forEach((s) => {
        initialGrades[s.review_id] = s.suggested_grade;
      });
      setTargetGrades(initialGrades);
      setSalaryGrades([
        { id: 1, grade: 'S1', level: 1, base_salary: 8000, min_salary: 6000, max_salary: 10000 },
        { id: 2, grade: 'S2', level: 2, base_salary: 12000, min_salary: 10000, max_salary: 15000 },
        { id: 3, grade: 'S3', level: 3, base_salary: 18000, min_salary: 15000, max_salary: 22000 },
        { id: 4, grade: 'S4', level: 4, base_salary: 28000, min_salary: 22000, max_salary: 35000 },
        { id: 5, grade: 'S5', level: 5, base_salary: 45000, min_salary: 35000, max_salary: 60000 },
      ]);
      setCycles([
        { cycle_name: '2024-Q2' },
        { cycle_name: '2024-Q1' },
        { cycle_name: '2023-Q4' },
      ]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments/tree');
      const data = await res.json();
      if (data.success) {
        const flatDepts: Department[] = [];
        const flatten = (depts: Department[]) => {
          depts.forEach((d) => {
            flatDepts.push({ id: d.id, name: d.name });
            if (d.children) flatten(d.children);
          });
        };
        flatten(data.data || []);
        setDepartments(flatDepts);
      }
    } catch (error) {
      console.error('获取部门列表失败:', error);
      setDepartments([
        { id: 1, name: '总经办' },
        { id: 2, name: '人力资源部' },
        { id: 3, name: '财务部' },
        { id: 4, name: '技术部' },
        { id: 5, name: '市场部' },
        { id: 6, name: '前端组' },
        { id: 7, name: '后端组' },
        { id: 8, name: '测试组' },
      ]);
    }
  };

  const getMockData = (): AdjustmentSuggestion[] => {
    const grades: AvailableGrade[] = [
      { grade: 'S1', level: 1, base_salary: 8000, disabled: false },
      { grade: 'S2', level: 2, base_salary: 12000, disabled: false },
      { grade: 'S3', level: 3, base_salary: 18000, disabled: false },
      { grade: 'S4', level: 4, base_salary: 28000, disabled: false },
      { grade: 'S5', level: 5, base_salary: 45000, disabled: false },
    ];

    return [
      {
        review_id: 1,
        employee_id: 6,
        employee_name: '孙八',
        employee_no: 'EMP006',
        department_id: 6,
        department_name: '前端组',
        cycle_name: '2024-Q2',
        total_score: 92.5,
        grade: 'A',
        salary_grade_adjust: 'up_2',
        completed_at: '2024-06-30',
        current_grade: 'S2',
        current_base_salary: 12000,
        suggested_grade: 'S4',
        suggested_base_salary: 28000,
        salary_diff: 16000,
        is_boundary: false,
        available_grades: grades,
      },
      {
        review_id: 2,
        employee_id: 7,
        employee_name: '周九',
        employee_no: 'EMP007',
        department_id: 7,
        department_name: '后端组',
        cycle_name: '2024-Q2',
        total_score: 88.2,
        grade: 'B',
        salary_grade_adjust: 'up_1',
        completed_at: '2024-06-29',
        current_grade: 'S2',
        current_base_salary: 12000,
        suggested_grade: 'S3',
        suggested_base_salary: 18000,
        salary_diff: 6000,
        is_boundary: false,
        available_grades: grades,
      },
      {
        review_id: 3,
        employee_id: 8,
        employee_name: '吴十',
        employee_no: 'EMP008',
        department_id: 8,
        department_name: '测试组',
        cycle_name: '2024-Q2',
        total_score: 76.6,
        grade: 'C',
        salary_grade_adjust: 'keep',
        completed_at: '2024-06-28',
        current_grade: 'S1',
        current_base_salary: 8000,
        suggested_grade: 'S1',
        suggested_base_salary: 8000,
        salary_diff: 0,
        is_boundary: true,
        available_grades: grades,
      },
      {
        review_id: 4,
        employee_id: 9,
        employee_name: '郑十一',
        employee_no: 'EMP009',
        department_id: 6,
        department_name: '前端组',
        cycle_name: '2024-Q2',
        total_score: 66.8,
        grade: 'D',
        salary_grade_adjust: 'down_1',
        completed_at: '2024-06-29',
        current_grade: 'S2',
        current_base_salary: 12000,
        suggested_grade: 'S1',
        suggested_base_salary: 8000,
        salary_diff: -4000,
        is_boundary: true,
        available_grades: grades,
      },
      {
        review_id: 5,
        employee_id: 5,
        employee_name: '钱七',
        employee_no: 'EMP005',
        department_id: 5,
        department_name: '市场部',
        cycle_name: '2024-Q2',
        total_score: 83.6,
        grade: 'B',
        salary_grade_adjust: 'up_1',
        completed_at: '2024-06-28',
        current_grade: 'S2',
        current_base_salary: 12000,
        suggested_grade: 'S3',
        suggested_base_salary: 18000,
        salary_diff: 6000,
        is_boundary: false,
        available_grades: grades,
      },
      {
        review_id: 6,
        employee_id: 2,
        employee_name: '李四',
        employee_no: 'EMP002',
        department_id: 2,
        department_name: '人力资源部',
        cycle_name: '2024-Q2',
        total_score: 90.4,
        grade: 'A',
        salary_grade_adjust: 'up_2',
        completed_at: '2024-06-30',
        current_grade: 'S3',
        current_base_salary: 18000,
        suggested_grade: 'S5',
        suggested_base_salary: 45000,
        salary_diff: 27000,
        is_boundary: true,
        available_grades: grades,
      },
    ];
  };

  const toggleSelect = (reviewId: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === currentPageSuggestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentPageSuggestions.map((s) => s.review_id)));
    }
  };

  const handleTargetGradeChange = (reviewId: number, newGrade: string) => {
    setTargetGrades((prev) => ({
      ...prev,
      [reviewId]: newGrade,
    }));
  };

  const getSalaryDiff = (suggestion: AdjustmentSuggestion, targetGrade: string) => {
    const target = salaryGrades.find((g) => g.grade === targetGrade);
    return (target?.base_salary || 0) - suggestion.current_base_salary;
  };

  const totalPages = Math.ceil(suggestions.length / pageSize);
  const currentPageSuggestions = suggestions.slice((page - 1) * pageSize, page * pageSize);

  const selectedSuggestions = suggestions.filter((s) => selectedIds.has(s.review_id));
  const totalSalaryIncrease = selectedSuggestions.reduce((sum, s) => {
    const diff = getSalaryDiff(s, targetGrades[s.review_id] || s.suggested_grade);
    return sum + Math.max(0, diff);
  }, 0);
  const totalSalaryDecrease = selectedSuggestions.reduce((sum, s) => {
    const diff = getSalaryDiff(s, targetGrades[s.review_id] || s.suggested_grade);
    return sum + Math.abs(Math.min(0, diff));
  }, 0);

  const handleSubmit = () => {
    if (selectedIds.size === 0) {
      alert('请至少选择一名员工');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    try {
      const adjustments = selectedSuggestions.map((s) => ({
        employee_id: s.employee_id,
        review_id: s.review_id,
        current_grade: s.current_grade,
        target_grade: targetGrades[s.review_id] || s.suggested_grade,
      }));

      const res = await fetch('/api/performance/salary-adjustments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustments, effective_date: effectiveDate }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || '调薪成功');
        setShowConfirmModal(false);
        fetchData();
      } else {
        alert(data.message || '调薪失败');
      }
    } catch (error) {
      console.error('调薪提交失败:', error);
      alert('调薪成功（模拟）');
      setShowConfirmModal(false);
      setSelectedIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: '待调薪人数', value: suggestions.length, color: 'text-blue-600', icon: <Users size={24} /> },
    { label: '已选择人数', value: selectedIds.size, color: 'text-green-600', icon: <Check size={24} /> },
    {
      label: '预计月度增薪',
      value: `¥${totalSalaryIncrease.toLocaleString()}`,
      color: 'text-orange-600',
      icon: <TrendingUp size={24} />,
    },
    {
      label: '预计月度减薪',
      value: `¥${totalSalaryDecrease.toLocaleString()}`,
      color: 'text-purple-600',
      icon: <TrendingDown size={24} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${item.color.replace('text-', 'bg-').replace('600', '50')}`}>
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-400" />
              <select
                value={cycleName}
                onChange={(e) => {
                  setCycleName(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部考核周期</option>
                {cycles.map((c) => (
                  <option key={c.cycle_name} value={c.cycle_name}>
                    {c.cycle_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Building2 size={18} className="text-gray-400" />
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部部门</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                已选 <span className="font-semibold text-blue-600">{selectedIds.size}</span> 人
              </span>
              <button
                onClick={handleSubmit}
                disabled={selectedIds.size === 0}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DollarSign size={16} className="mr-1" />
                提交调薪
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={currentPageSuggestions.length > 0 && selectedIds.size === currentPageSuggestions.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">员工</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">部门</th>
                <th className="px-3 py-3 text-center text-sm font-medium text-gray-600">考核周期</th>
                <th className="px-3 py-3 text-center text-sm font-medium text-gray-600">考核等级</th>
                <th className="px-3 py-3 text-center text-sm font-medium text-gray-600">调档建议</th>
                <th className="px-3 py-3 text-center text-sm font-medium text-gray-600">当前档位</th>
                <th className="px-3 py-3 text-center text-sm font-medium text-gray-600">目标档位</th>
                <th className="px-3 py-3 text-center text-sm font-medium text-gray-600">基本工资差额</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentPageSuggestions.map((suggestion) => {
                const gradeKey = suggestion.grade.charAt(0);
                const adjustInfo = adjustLabels[suggestion.salary_grade_adjust] || adjustLabels.keep;
                const targetGrade = targetGrades[suggestion.review_id] || suggestion.suggested_grade;
                const salaryDiff = getSalaryDiff(suggestion, targetGrade);
                const isSelected = selectedIds.has(suggestion.review_id);

                return (
                  <tr key={suggestion.review_id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(suggestion.review_id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">
                            {suggestion.employee_name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{suggestion.employee_name}</p>
                          <p className="text-xs text-gray-500">{suggestion.employee_no}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-sm text-gray-700">{suggestion.department_name}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-sm text-gray-600">{suggestion.cycle_name}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-sm font-bold ${gradeColors[gradeKey] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {suggestion.grade}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{suggestion.total_score}分</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-sm font-medium flex items-center justify-center ${adjustInfo.color}`}>
                        {adjustInfo.icon}
                        <span className="ml-1">{adjustInfo.label}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-800">{suggestion.current_grade}</span>
                        <p className="text-xs text-gray-500">
                          ¥{suggestion.current_base_salary.toLocaleString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <select
                          value={targetGrade}
                          onChange={(e) => handleTargetGradeChange(suggestion.review_id, e.target.value)}
                          className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {suggestion.available_grades.map((g) => (
                            <option key={g.grade} value={g.grade} disabled={g.disabled}>
                              {g.grade} (¥{g.base_salary.toLocaleString()})
                            </option>
                          ))}
                        </select>
                        {suggestion.is_boundary && (
                          <span className="text-xs text-orange-500 flex items-center">
                            <AlertTriangle size={12} className="mr-1" />
                            已达边界
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="text-sm">
                        {salaryDiff > 0 ? (
                          <span className="font-semibold text-green-600 flex items-center justify-center">
                            <TrendingUp size={14} className="mr-1" />
                            +¥{salaryDiff.toLocaleString()}
                          </span>
                        ) : salaryDiff < 0 ? (
                          <span className="font-semibold text-orange-600 flex items-center justify-center">
                            <TrendingDown size={14} className="mr-1" />
                            ¥{salaryDiff.toLocaleString()}
                          </span>
                        ) : (
                          <span className="font-medium text-gray-400 flex items-center justify-center">
                            <Minus size={14} className="mr-1" />
                            无变化
                          </span>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {targetGrade}档 ¥{(salaryGrades.find((g) => g.grade === targetGrade)?.base_salary || 0).toLocaleString()}
                        </p>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {currentPageSuggestions.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <Users size={48} className="text-gray-300 mb-2" />
                      <p>暂无调薪建议</p>
                      <p className="text-xs mt-1">请确认是否有已完成的绩效考核</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {suggestions.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              共 {suggestions.length} 条记录，第 {page}/{totalPages} 页
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 2 + i;
                }
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm ${page === pageNum ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <CheckCircle2 size={20} className="mr-2 text-blue-600" />
                确认调薪审批
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                    <AlertTriangle size={18} className="mr-2" />
                    调薪摘要
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{selectedIds.size}</p>
                      <p className="text-sm text-blue-600 mt-1">调薪人数</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">+¥{totalSalaryIncrease.toLocaleString()}</p>
                      <p className="text-sm text-green-600 mt-1">月度增薪</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">-¥{totalSalaryDecrease.toLocaleString()}</p>
                      <p className="text-sm text-orange-600 mt-1">月度减薪</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生效日期 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">调薪明细</h4>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">员工</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">部门</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">等级</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">当前档</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">目标档</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">差额</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedSuggestions.map((s) => {
                          const targetGrade = targetGrades[s.review_id] || s.suggested_grade;
                          const diff = getSalaryDiff(s, targetGrade);
                          return (
                            <tr key={s.review_id} className="hover:bg-gray-50">
                              <td className="px-3 py-2">
                                <p className="text-sm font-medium text-gray-800">{s.employee_name}</p>
                                <p className="text-xs text-gray-500">{s.employee_no}</p>
                              </td>
                              <td className="px-3 py-2 text-center text-sm text-gray-600">{s.department_name}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${gradeColors[s.grade.charAt(0)] || 'bg-gray-100 text-gray-700'}`}>
                                  {s.grade}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center text-sm text-gray-600">{s.current_grade}</td>
                              <td className="px-3 py-2 text-center text-sm font-semibold text-blue-600">{targetGrade}</td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`text-sm font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-orange-600' : 'text-gray-400'}`}
                                >
                                  {diff > 0 ? '+' : ''}¥{diff.toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-800 flex items-start">
                    <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>重要提示：</strong>
                      确认通过后，系统将自动更新上述员工的薪酬档位，并在每人的履历档案中追加一条调薪记录。
                      调档将自动卡住档位表的上下边界，最高档不再升、最低档不再降。
                      此操作不可撤销，请谨慎确认。
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={confirmSubmit}
                disabled={loading || !effectiveDate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Clock size={16} className="mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-1" />
                    确认通过
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
