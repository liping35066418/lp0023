import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye,
  Edit2,
  Trash2,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  Settings
} from 'lucide-react';

interface SalaryGrade {
  id: number;
  grade: string;
  name: string;
  min_salary: number;
  max_salary: number;
  mid_salary: number;
  employee_count: number;
  description: string;
  level: number;
}

export default function SalaryGradePage() {
  const [grades, setGrades] = useState<SalaryGrade[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<SalaryGrade | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    grade: '',
    name: '',
    min_salary: 0,
    max_salary: 0,
    description: '',
    level: 1,
  });

  useEffect(() => {
    fetchGrades();
  }, [page, keyword]);

  const fetchGrades = async () => {
    try {
      const res = await fetch('/api/performance/salary-grades');
      const data = await res.json();
      if (data.success) {
        setGrades(data.data || []);
        setTotal(data.data?.length || 0);
      }
    } catch (error) {
      console.error('获取薪酬档位失败:', error);
      setGrades(getMockData());
      setTotal(8);
    }
  };

  const getMockData = (): SalaryGrade[] => [
    { id: 1, grade: 'S1', name: '实习生', min_salary: 3000, max_salary: 5000, mid_salary: 4000, employee_count: 8, description: '实习岗位薪酬档位', level: 1 },
    { id: 2, grade: 'P1', name: '初级', min_salary: 5000, max_salary: 8000, mid_salary: 6500, employee_count: 15, description: '初级员工薪酬档位，适用于应届生或1年以内经验', level: 2 },
    { id: 3, grade: 'P2', name: '中级', min_salary: 8000, max_salary: 12000, mid_salary: 10000, employee_count: 28, description: '中级员工薪酬档位，1-3年工作经验', level: 3 },
    { id: 4, grade: 'P3', name: '高级', min_salary: 12000, max_salary: 18000, mid_salary: 15000, employee_count: 35, description: '高级员工薪酬档位，3-5年工作经验', level: 4 },
    { id: 5, grade: 'P4', name: '资深', min_salary: 18000, max_salary: 25000, mid_salary: 21500, employee_count: 22, description: '资深员工薪酬档位，5-8年工作经验', level: 5 },
    { id: 6, grade: 'P5', name: '专家', min_salary: 25000, max_salary: 35000, mid_salary: 30000, employee_count: 12, description: '专家级薪酬档位，领域专家', level: 6 },
    { id: 7, grade: 'P6', name: '高级专家', min_salary: 35000, max_salary: 50000, mid_salary: 42500, employee_count: 8, description: '高级专家薪酬档位', level: 7 },
    { id: 8, grade: 'P7', name: '首席专家', min_salary: 50000, max_salary: 80000, mid_salary: 65000, employee_count: 5, description: '首席专家薪酬档位', level: 8 },
  ];

  const handleView = (grade: SalaryGrade) => {
    setSelectedGrade(grade);
    setShowDetail(true);
    setEditMode(false);
  };

  const handleAdd = () => {
    setFormData({ grade: '', name: '', min_salary: 0, max_salary: 0, description: '', level: 1 });
    setShowAddModal(true);
  };

  const handleEdit = (grade: SalaryGrade) => {
    setFormData({
      grade: grade.grade,
      name: grade.name,
      min_salary: grade.min_salary,
      max_salary: grade.max_salary,
      description: grade.description,
      level: grade.level,
    });
    setSelectedGrade(grade);
    setEditMode(true);
    setShowDetail(true);
  };

  const handleSubmit = async () => {
    if (!formData.grade || !formData.name || formData.min_salary <= 0 || formData.max_salary <= 0) {
      alert('请填写完整信息');
      return;
    }
    if (formData.min_salary >= formData.max_salary) {
      alert('最低薪资必须小于最高薪资');
      return;
    }
    try {
      const res = await fetch(editMode ? `/api/performance/salary-grades/${selectedGrade?.id}` : '/api/performance/salary-grades', {
        method: editMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert(editMode ? '更新成功' : '创建成功');
        setShowAddModal(false);
        setShowDetail(false);
        setEditMode(false);
        fetchGrades();
      }
    } catch (error) {
      alert('操作失败，请稍后重试');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该薪酬档位吗？')) return;
    try {
      const res = await fetch(`/api/performance/salary-grades/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert('删除成功');
        fetchGrades();
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const totalEmployees = grades.reduce((sum, g) => sum + g.employee_count, 0);
  const avgSalary = grades.length > 0 
    ? Math.round(grades.reduce((sum, g) => sum + g.mid_salary, 0) / grades.length) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">薪酬档位</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{total} 档</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <DollarSign size={24} className="text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">覆盖员工</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totalEmployees} 人</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <Users size={24} className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">平均薪资</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">¥{avgSalary.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <TrendingUp size={24} className="text-orange-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">薪资带宽</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">40%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Building2 size={24} className="text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索档位名称/职级..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Download size={16} className="mr-1" />
                导出
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                <Plus size={16} className="mr-1" />
                新增档位
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">档位</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">名称</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">薪资范围</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">中位值</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">在职人数</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">描述</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.map((grade) => (
                <tr key={grade.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-12 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-lg">
                      {grade.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{grade.name}</p>
                    <p className="text-xs text-gray-400">级别 {grade.level}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-700">
                      ¥{grade.min_salary.toLocaleString()} - ¥{grade.max_salary.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-semibold text-blue-600">
                      ¥{grade.mid_salary.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-gray-700">{grade.employee_count} 人</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                    {grade.description}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => handleView(grade)}
                        className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                        title="查看"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(grade)}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                        title="编辑"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(grade.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-red-500"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            共 {total} 条记录，第 {page}/{totalPages} 页
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
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
                  className={`w-8 h-8 rounded-lg text-sm ${
                    page === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {(showAddModal || (showDetail && editMode)) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Settings size={20} className="mr-2 text-blue-600" />
                {showAddModal ? '新增薪酬档位' : '编辑薪酬档位'}
              </h3>
              <button onClick={() => { setShowAddModal(false); setEditMode(false); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">档位代号 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="如 P1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">级别</label>
                    <input
                      type="number"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">档位名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如 初级工程师"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">最低薪资 <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={formData.min_salary || ''}
                      onChange={(e) => setFormData({ ...formData, min_salary: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="元/月"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">最高薪资 <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={formData.max_salary || ''}
                      onChange={(e) => setFormData({ ...formData, max_salary: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="元/月"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="请输入档位描述"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">
              <button
                onClick={() => { setShowAddModal(false); setEditMode(false); }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedGrade && !editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">薪酬档位详情</h3>
              <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{selectedGrade.grade}</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-gray-800">{selectedGrade.name}</h4>
                  <p className="text-gray-500">级别 {selectedGrade.level} · {selectedGrade.employee_count} 人在职</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">薪资范围</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">最低</p>
                    <p className="text-2xl font-bold text-gray-800">¥{selectedGrade.min_salary.toLocaleString()}</p>
                  </div>
                  <div className="text-3xl text-gray-300">—</div>
                  <div>
                    <p className="text-sm text-gray-500">最高</p>
                    <p className="text-2xl font-bold text-gray-800">¥{selectedGrade.max_salary.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/50">
                  <p className="text-sm text-gray-600 mb-1">中位值</p>
                  <p className="text-xl font-bold text-blue-600">¥{selectedGrade.mid_salary.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">档位描述</p>
                <p className="text-gray-700">{selectedGrade.description}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                关闭
              </button>
              <button
                onClick={() => handleEdit(selectedGrade)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                编辑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
