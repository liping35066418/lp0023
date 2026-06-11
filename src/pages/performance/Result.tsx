import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar
} from 'lucide-react';

interface PerformanceResult {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_no: string;
  department_name: string;
  position: string;
  template_name: string;
  period: string;
  self_score?: number;
  supervisor_score?: number;
  peer_score?: number;
  total_score: number;
  grade: string;
  salary_adjust?: string;
  status: string;
  completed_at?: string;
}

const gradeColors: Record<string, string> = {
  'A': 'text-green-600 bg-green-100',
  'B': 'text-blue-600 bg-blue-100',
  'C': 'text-yellow-600 bg-yellow-100',
  'D': 'text-orange-600 bg-orange-100',
  'E': 'text-red-600 bg-red-100',
};

export default function PerformanceResult() {
  const [results, setResults] = useState<PerformanceResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [grade, setGrade] = useState('');
  const [period, setPeriod] = useState('2024-Q2');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedResult, setSelectedResult] = useState<PerformanceResult | null>(null);

  useEffect(() => {
    fetchResults();
  }, [page, keyword, departmentId, grade, period]);

  const fetchResults = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        period,
        status: 'completed',
      });
      if (keyword) params.append('keyword', keyword);
      if (departmentId) params.append('departmentId', departmentId);
      if (grade) params.append('grade', grade);

      const res = await fetch(`/api/performance/reviews?${params}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data.list || []);
        setTotal(data.data.total || 0);
      }
    } catch (error) {
      console.error('获取考核结果失败:', error);
      setResults(getMockData());
      setTotal(56);
    }
  };

  const getMockData = (): PerformanceResult[] => [
    { id: 1, employee_id: 1, employee_name: '张三', employee_no: 'EMP001', department_name: '总经办', position: '总经理', template_name: '季度绩效考核模板', period: '2024-Q2', self_score: 92, supervisor_score: 95, peer_score: 90, total_score: 93.5, grade: 'A', salary_adjust: '+15%', status: 'completed', completed_at: '2024-06-30' },
    { id: 2, employee_id: 4, employee_name: '赵六', employee_no: 'EMP004', department_name: '技术部', position: '技术总监', template_name: '季度绩效考核模板', period: '2024-Q2', self_score: 88, supervisor_score: 90, peer_score: 85, total_score: 88.2, grade: 'B+', salary_adjust: '+10%', status: 'completed', completed_at: '2024-06-29' },
    { id: 3, employee_id: 2, employee_name: '李四', employee_no: 'EMP002', department_name: '人力资源部', position: 'HR经理', template_name: '季度绩效考核模板', period: '2024-Q2', self_score: 85, supervisor_score: 82, peer_score: 88, total_score: 83.6, grade: 'B', salary_adjust: '+8%', status: 'completed', completed_at: '2024-06-28' },
    { id: 4, employee_id: 5, employee_name: '钱七', employee_no: 'EMP005', department_name: '市场部', position: '市场经理', template_name: '季度绩效考核模板', period: '2024-Q2', self_score: 78, supervisor_score: 75, peer_score: 80, total_score: 76.6, grade: 'C', salary_adjust: '+5%', status: 'completed', completed_at: '2024-06-28' },
    { id: 5, employee_id: 6, employee_name: '孙八', employee_no: 'EMP006', department_name: '前端组', position: '高级前端工程师', template_name: '季度绩效考核模板', period: '2024-Q2', self_score: 90, supervisor_score: 92, peer_score: 88, total_score: 90.4, grade: 'A-', salary_adjust: '+12%', status: 'completed', completed_at: '2024-06-30' },
    { id: 6, employee_id: 7, employee_name: '周九', employee_no: 'EMP007', department_name: '后端组', position: '高级后端工程师', template_name: '季度绩效考核模板', period: '2024-Q2', self_score: 70, supervisor_score: 65, peer_score: 68, total_score: 66.8, grade: 'D', salary_adjust: '0%', status: 'completed', completed_at: '2024-06-29' },
    { id: 7, employee_id: 3, employee_name: '王五', employee_no: 'EMP003', department_name: '财务部', position: '财务主管', template_name: '季度绩效考核模板', period: '2024-Q2', self_score: 82, supervisor_score: 80, peer_score: 85, total_score: 81.4, grade: 'B', salary_adjust: '+8%', status: 'completed', completed_at: '2024-06-27' },
  ];

  const handleView = (result: PerformanceResult) => {
    setSelectedResult(result);
    setShowDetail(true);
  };

  const totalPages = Math.ceil(total / pageSize);

  const stats = [
    { label: '参评人数', value: '156', color: 'text-blue-600' },
    { label: '平均分', value: '82.5', color: 'text-green-600' },
    { label: 'A等人数', value: '18', color: 'text-green-600' },
    { label: '淘汰人数', value: '5', color: 'text-red-600' },
  ];

  const gradeDistribution = [
    { grade: 'A', count: 18, percent: 11.5, color: 'bg-green-500' },
    { grade: 'B', count: 62, percent: 39.7, color: 'bg-blue-500' },
    { grade: 'C', count: 54, percent: 34.6, color: 'bg-yellow-500' },
    { grade: 'D', count: 17, percent: 10.9, color: 'bg-orange-500' },
    { grade: 'E', count: 5, percent: 3.2, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800 mb-3">等级分布</h3>
          <div className="space-y-2">
            {gradeDistribution.map((item) => (
              <div key={item.grade} className="flex items-center">
                <span className="w-6 text-sm font-medium text-gray-600">{item.grade}</span>
                <div className="flex-1 mx-3 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="w-20 text-right text-sm text-gray-600">{item.count}人 ({item.percent}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-400" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024-Q2">2024年第二季度</option>
                <option value="2024-Q1">2024年第一季度</option>
                <option value="2023-Q4">2023年第四季度</option>
                <option value="2023-Q3">2023年第三季度</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部部门</option>
                <option value="1">总经办</option>
                <option value="2">人力资源部</option>
                <option value="3">财务部</option>
                <option value="4">技术部</option>
                <option value="5">市场部</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部等级</option>
                <option value="A">A等</option>
                <option value="B">B等</option>
                <option value="C">C等</option>
                <option value="D">D等</option>
                <option value="E">E等</option>
              </select>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索员工姓名/工号"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="ml-auto flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Download size={16} className="mr-1" />
                导出报表
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">员工</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">部门/职位</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">考核模板</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">自评</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">上级评</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">互评</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">总分</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">等级</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">调薪</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((result) => {
                const gradeKey = result.grade.charAt(0);
                return (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">{result.employee_name.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{result.employee_name}</p>
                          <p className="text-xs text-gray-500">{result.employee_no}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-800">{result.department_name}</p>
                      <p className="text-xs text-gray-500">{result.position}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{result.template_name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-gray-700">{result.self_score || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-blue-600">{result.supervisor_score || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-purple-600">{result.peer_score || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-gray-800">{result.total_score}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-sm font-bold ${gradeColors[gradeKey] || 'bg-gray-100 text-gray-700'}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {result.salary_adjust && result.salary_adjust !== '0%' ? (
                        <span className="text-sm font-medium text-green-600 flex items-center justify-center">
                          <TrendingUp size={14} className="mr-1" />
                          {result.salary_adjust}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleView(result)}
                        className="p-1.5 hover:bg-blue-50 rounded text-blue-600 inline-block"
                        title="查看"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
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

      {showDetail && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">考核结果详情</h3>
              <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={28} className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-gray-800">{selectedResult.employee_name}</h4>
                  <p className="text-gray-500">{selectedResult.department_name} · {selectedResult.position}</p>
                </div>
                <div className="ml-auto text-center">
                  <div className={`text-3xl font-bold px-4 py-2 rounded-xl ${gradeColors[selectedResult.grade.charAt(0)] || 'bg-gray-100 text-gray-700'}`}>
                    {selectedResult.grade}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">综合等级</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">{selectedResult.self_score}</p>
                  <p className="text-sm text-gray-500 mt-1">自评得分</p>
                  <p className="text-xs text-gray-400 mt-1">权重 20%</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedResult.supervisor_score}</p>
                  <p className="text-sm text-gray-500 mt-1">上级评分</p>
                  <p className="text-xs text-blue-400 mt-1">权重 60%</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedResult.peer_score}</p>
                  <p className="text-sm text-gray-500 mt-1">互评得分</p>
                  <p className="text-xs text-purple-400 mt-1">权重 20%</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">综合得分</p>
                    <p className="text-4xl font-bold text-gray-800 mt-1">{selectedResult.total_score}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">薪酬调整建议</p>
                    <p className={`text-2xl font-bold mt-1 flex items-center justify-end ${selectedResult.salary_adjust && selectedResult.salary_adjust !== '0%' ? 'text-green-600' : 'text-gray-400'}`}>
                      {selectedResult.salary_adjust && selectedResult.salary_adjust !== '0%' ? (
                        <><TrendingUp size={20} className="mr-1" />{selectedResult.salary_adjust}</>
                      ) : (
                        '不调整'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <FileText size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-500 w-24">考核模板：</span>
                  <span className="text-gray-800">{selectedResult.template_name}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-500 w-24">考核周期：</span>
                  <span className="text-gray-800">{selectedResult.period}</span>
                </div>
                {selectedResult.completed_at && (
                  <div className="flex items-center text-sm">
                    <BarChart3 size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-500 w-24">完成时间：</span>
                    <span className="text-gray-800">{selectedResult.completed_at}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                关闭
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                导出结果
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
