import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye,
  FileText,
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  X
} from 'lucide-react';

interface PerformanceReview {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_no: string;
  department_name: string;
  template_name: string;
  cycle_name: string;
  status: string;
  self_score: number | null;
  supervisor_score: number | null;
  peer_score: number | null;
  total_score: number | null;
  grade: string | null;
  created_at: string;
}

export default function PerformanceReview() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [scoreType, setScoreType] = useState<'self' | 'supervisor' | 'peer'>('self');
  const [scores, setScores] = useState<{ dimension_id: number; dimension_name: string; score: number; comment: string }[]>([]);
  const [evaluation, setEvaluation] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [page, status, templateId, keyword]);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (status) params.append('status', status);
      if (templateId) params.append('templateId', templateId);
      if (keyword) params.append('employeeId', '');

      const res = await fetch(`/api/performance/reviews?${params}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data.list);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('获取考核列表失败:', error);
      setReviews(getMockData());
      setTotal(10);
    }
  };

  const getMockData = (): PerformanceReview[] => [
    { id: 1, employee_id: 1, employee_name: '张三', employee_no: 'EMP001', department_name: '总经办', template_name: '年度绩效考核', cycle_name: '2024年度', status: 'completed', self_score: 92, supervisor_score: 88, peer_score: 85, total_score: 88.2, grade: 'B+', created_at: '2024-12-01' },
    { id: 2, employee_id: 2, employee_name: '李四', employee_no: 'EMP002', department_name: '人力资源部', template_name: '年度绩效考核', cycle_name: '2024年度', status: 'self_submitted', self_score: 85, supervisor_score: null, peer_score: null, total_score: null, grade: null, created_at: '2024-12-01' },
    { id: 3, employee_id: 3, employee_name: '王五', employee_no: 'EMP003', department_name: '财务部', template_name: '年度绩效考核', cycle_name: '2024年度', status: 'completed', self_score: 78, supervisor_score: 82, peer_score: 80, total_score: 80.8, grade: 'B', created_at: '2024-12-01' },
    { id: 4, employee_id: 4, employee_name: '赵六', employee_no: 'EMP004', department_name: '技术部', template_name: '季度绩效考核', cycle_name: '2024Q4', status: 'draft', self_score: null, supervisor_score: null, peer_score: null, total_score: null, grade: null, created_at: '2024-12-15' },
    { id: 5, employee_id: 6, employee_name: '孙八', employee_no: 'EMP006', department_name: '前端组', template_name: '季度绩效考核', cycle_name: '2024Q4', status: 'completed', self_score: 90, supervisor_score: 92, peer_score: 88, total_score: 90.8, grade: 'A-', created_at: '2024-12-15' },
    { id: 6, employee_id: 7, employee_name: '周九', employee_no: 'EMP007', department_name: '后端组', template_name: '季度绩效考核', cycle_name: '2024Q4', status: 'completed', self_score: 85, supervisor_score: 78, peer_score: 82, total_score: 80.6, grade: 'B', created_at: '2024-12-15' },
  ];

  const getStatusConfig = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      draft: { label: '草稿', color: 'bg-gray-100 text-gray-700', icon: <FileText size={12} /> },
      self_submitted: { label: '待上级评分', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
      peer_reviewing: { label: '互评中', color: 'bg-blue-100 text-blue-700', icon: <Users size={12} /> },
      completed: { label: '已完成', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
      rejected: { label: '已驳回', color: 'bg-red-100 text-red-700', icon: <AlertCircle size={12} /> },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return '';
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    if (grade.startsWith('D')) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleView = (review: PerformanceReview) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleScore = (review: PerformanceReview, type: 'self' | 'supervisor' | 'peer') => {
    setSelectedReview(review);
    setScoreType(type);
    setScores([
      { dimension_id: 1, dimension_name: '工作业绩', score: 0, comment: '' },
      { dimension_id: 2, dimension_name: '工作能力', score: 0, comment: '' },
      { dimension_id: 3, dimension_name: '工作态度', score: 0, comment: '' },
      { dimension_id: 4, dimension_name: '团队协作', score: 0, comment: '' },
    ]);
    setEvaluation('');
    setShowScoreModal(true);
  };

  const handleSubmitScore = async () => {
    if (!selectedReview) return;
    
    try {
      const endpoint = scoreType === 'self' 
        ? 'self-score' 
        : scoreType === 'supervisor' 
          ? 'supervisor-score' 
          : 'peer-score';

      const res = await fetch(`/api/performance/reviews/${selectedReview.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores,
          self_evaluation: scoreType === 'self' ? evaluation : undefined,
          supervisor_evaluation: scoreType === 'supervisor' ? evaluation : undefined,
          reviewer_id: 1,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('评分提交成功');
        setShowScoreModal(false);
        fetchReviews();
      } else {
        alert(data.error || '提交失败');
      }
    } catch (error) {
      alert('提交失败');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const scoreTypeLabels = {
    self: '自评',
    supervisor: '上级评分',
    peer: '互评',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索员工"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部状态</option>
                <option value="draft">草稿</option>
                <option value="self_submitted">待上级评分</option>
                <option value="peer_reviewing">互评中</option>
                <option value="completed">已完成</option>
              </select>
            </div>

            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部模板</option>
              <option value="1">季度绩效考核</option>
              <option value="2">年度绩效考核</option>
            </select>
          </div>

          <button
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            <Plus size={16} className="mr-1" />
            创建考核
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">员工</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">部门</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">考核模板</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">考核周期</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">自评</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">上级评</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">互评</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">总分</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">等级</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map((review) => {
              const statusConfig = getStatusConfig(review.status);
              return (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">{review.employee_name.charAt(0)}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{review.employee_name}</p>
                        <p className="text-xs text-gray-500">{review.employee_no}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{review.department_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{review.template_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{review.cycle_name}</td>
                  <td className="px-4 py-3 text-center text-sm">
                    {review.self_score !== null ? (
                      <span className="font-medium text-gray-800">{review.self_score}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {review.supervisor_score !== null ? (
                      <span className="font-medium text-gray-800">{review.supervisor_score}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {review.peer_score !== null ? (
                      <span className="font-medium text-gray-800">{review.peer_score}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {review.total_score !== null ? (
                      <span className="text-lg font-bold text-blue-600">{review.total_score}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {review.grade ? (
                      <span className={`text-lg font-bold ${getGradeColor(review.grade)}`}>
                        {review.grade}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.icon}
                      <span className="ml-1">{statusConfig.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(review)}
                        className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                        title="查看"
                      >
                        <Eye size={16} />
                      </button>
                      {review.status === 'draft' && (
                        <button
                          onClick={() => handleScore(review, 'self')}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          自评
                        </button>
                      )}
                      {review.status === 'self_submitted' && (
                        <button
                          onClick={() => handleScore(review, 'supervisor')}
                          className="text-sm text-green-600 hover:text-green-700"
                        >
                          评分
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-500">共 {total} 条记录</p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600">第 {page} 页</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
            className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {showModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">考核详情</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">员工</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedReview.employee_name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">部门</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedReview.department_name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">考核模板</p>
                  <p className="text-lg font-medium text-gray-800 mt-1">{selectedReview.template_name}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-500">综合得分</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {selectedReview.total_score ?? '--'}
                    <span className={`text-lg ml-2 ${getGradeColor(selectedReview.grade)}`}>
                      {selectedReview.grade || ''}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { type: 'self', label: '自评得分', score: selectedReview.self_score, weight: 20 },
                  { type: 'supervisor', label: '上级评分', score: selectedReview.supervisor_score, weight: 60 },
                  { type: 'peer', label: '互评得分', score: selectedReview.peer_score, weight: 20 },
                ].map(item => (
                  <div key={item.type} className="p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{item.label}</span>
                      <span className="text-sm text-gray-500">权重 {item.weight}%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(item.score || 0)}%` }}
                        />
                      </div>
                      <span className="ml-3 text-lg font-bold text-gray-800 w-16 text-right">
                        {item.score ?? '--'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showScoreModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {scoreTypeLabels[scoreType]} - {selectedReview.employee_name}
              </h3>
              <button onClick={() => setShowScoreModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {scores.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{item.dimension_name}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.score}
                      onChange={(e) => {
                        const newScores = [...scores];
                        newScores[idx].score = Number(e.target.value);
                        setScores(newScores);
                      }}
                      className="w-20 px-2 py-1 border border-gray-200 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    value={item.comment}
                    onChange={(e) => {
                      const newScores = [...scores];
                      newScores[idx].comment = e.target.value;
                      setScores(newScores);
                    }}
                    placeholder="评分说明（选填）"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              ))}

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">
                  当前总分：{scores.reduce((sum, s) => sum + s.score, 0) / scores.length || 0}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {scoreType === 'self' ? '自我评价' : '评价意见'}
                </label>
                <textarea
                  value={evaluation}
                  onChange={(e) => setEvaluation(e.target.value)}
                  placeholder="请输入评价意见..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setShowScoreModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmitScore}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                提交评分
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
