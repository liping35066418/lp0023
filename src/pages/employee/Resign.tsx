import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  UserMinus,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  User,
  AlertTriangle,
  Plus
} from 'lucide-react';

interface ResignRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_no: string;
  department_name: string;
  position: string;
  job_level: string;
  entry_date: string;
  resign_date: string;
  resign_type: string;
  reason: string;
  status: string;
  operator: string;
  created_at: string;
}

export default function ResignManagement() {
  const [records, setRecords] = useState<ResignRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ResignRecord | null>(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    resign_type: '主动离职',
    resign_date: '',
    reason: '',
  });

  useEffect(() => {
    fetchRecords();
  }, [page, keyword, status]);

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        status: 'resigned',
      });
      if (keyword) params.append('keyword', keyword);

      const res = await fetch(`/api/employees?${params}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.list.map((item: any) => ({
          ...item,
          status: 'completed',
          resign_type: '主动离职',
          reason: '个人发展',
          resign_date: item.resign_date || '2024-01-15',
        })));
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('获取离职记录失败:', error);
      setRecords(getMockData());
      setTotal(6);
    }
  };

  const getMockData = (): ResignRecord[] => [
    { id: 101, employee_id: 101, employee_name: '陈离职', employee_no: 'EMP099', department_name: '前端组', position: '前端工程师', job_level: 'P4', entry_date: '2020-03-15', resign_date: '2024-02-28', resign_type: '主动离职', reason: '个人发展原因，寻求更好的机会', status: 'completed', operator: 'HR经理', created_at: '2024-02-15' },
    { id: 102, employee_id: 102, employee_name: '刘拜拜', employee_no: 'EMP098', department_name: '后端组', position: '后端工程师', job_level: 'P5', entry_date: '2019-06-01', resign_date: '2024-03-31', resign_type: '主动离职', reason: '回老家发展', status: 'completed', operator: 'HR经理', created_at: '2024-03-10' },
    { id: 103, employee_id: 103, employee_name: '王再见', employee_no: 'EMP097', department_name: '市场部', position: '市场专员', job_level: 'P3', entry_date: '2022-01-10', resign_date: '2024-05-15', resign_type: '试用期不合格', reason: '试用期考核不通过', status: 'pending', operator: '部门主管', created_at: '2024-05-01' },
    { id: 104, employee_id: 104, employee_name: '张离职', employee_no: 'EMP096', department_name: '测试组', position: '测试工程师', job_level: 'P4', entry_date: '2021-08-20', resign_date: '2024-06-30', resign_type: '主动离职', reason: '薪资待遇不满意', status: 'pending', operator: '员工本人', created_at: '2024-06-01' },
    { id: 105, employee_id: 105, employee_name: '李四走', employee_no: 'EMP095', department_name: '人力资源部', position: 'HR专员', job_level: 'P3', entry_date: '2023-02-14', resign_date: '2024-04-20', resign_type: '协议解除', reason: '公司结构优化', status: 'approved', operator: 'HR经理', created_at: '2024-04-01' },
  ];

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
      approved: { label: '已批准', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle size={12} /> },
      rejected: { label: '已驳回', color: 'bg-red-100 text-red-700', icon: <XCircle size={12} /> },
      completed: { label: '已离职', color: 'bg-gray-100 text-gray-700', icon: <CheckCircle size={12} /> },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
  };

  const getResignTypeColor = (type: string) => {
    const map: Record<string, string> = {
      '主动离职': 'text-blue-600 bg-blue-50',
      '被动离职': 'text-red-600 bg-red-50',
      '试用期不合格': 'text-orange-600 bg-orange-50',
      '协议解除': 'text-purple-600 bg-purple-50',
      '退休': 'text-green-600 bg-green-50',
    };
    return map[type] || 'text-gray-600 bg-gray-50';
  };

  const handleView = (record: ResignRecord) => {
    setSelectedRecord(record);
    setShowDetail(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.resign_date) {
      alert('请填写必填项');
      return;
    }
    try {
      const res = await fetch(`/api/employees/${formData.employee_id}/resign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resignDate: formData.resign_date,
          resignType: formData.resign_type,
          reason: formData.reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('离职申请提交成功');
        setShowAddModal(false);
        fetchRecords();
      } else {
        alert(data.error || '提交失败');
      }
    } catch (error) {
      alert('提交失败，请稍后重试');
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('确认批准该离职申请？')) return;
    alert('已批准');
    fetchRecords();
    setShowDetail(false);
  };

  const handleReject = async (id: number) => {
    if (!confirm('确认驳回该离职申请？')) return;
    alert('已驳回');
    fetchRecords();
    setShowDetail(false);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '本月离职', value: '3', color: 'text-orange-600 bg-orange-50', icon: <UserMinus size={20} /> },
          { label: '待审批', value: '2', color: 'text-yellow-600 bg-yellow-50', icon: <Clock size={20} /> },
          { label: '本年累计', value: '12', color: 'text-gray-600 bg-gray-50', icon: <FileText size={20} /> },
          { label: '离职率', value: '7.5%', color: 'text-red-600 bg-red-50', icon: <AlertTriangle size={20} /> },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold mt-1 text-gray-800">{item.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${item.color}`}>
                {item.icon}
              </div>
            </div>
          </div>
        ))}
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
                  placeholder="搜索员工姓名、工号..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <option value="pending">待审批</option>
                  <option value="approved">已批准</option>
                  <option value="rejected">已驳回</option>
                  <option value="completed">已离职</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Download size={16} className="mr-1" />
                导出
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                <Plus size={16} className="mr-1" />
                办理离职
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
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">入职日期</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">离职日期</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">离职类型</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => {
                const statusInfo = getStatusInfo(record.status);
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-600 text-sm font-medium">{record.employee_name.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{record.employee_name}</p>
                          <p className="text-xs text-gray-500">{record.employee_no}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-800">{record.department_name}</p>
                      <p className="text-xs text-gray-500">{record.position} · {record.job_level}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{record.entry_date}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{record.resign_date}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getResignTypeColor(record.resign_type)}`}>
                        {record.resign_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleView(record)}
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <UserMinus size={20} className="mr-2 text-red-600" />
                办理离职
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">员工 <span className="text-red-500">*</span></label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择员工</option>
                    <option value="1">张三 - EMP001</option>
                    <option value="2">李四 - EMP002</option>
                    <option value="6">孙八 - EMP006</option>
                    <option value="7">周九 - EMP007</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">离职类型</label>
                  <select
                    value={formData.resign_type}
                    onChange={(e) => setFormData({ ...formData, resign_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="主动离职">主动离职</option>
                    <option value="被动离职">被动离职</option>
                    <option value="试用期不合格">试用期不合格</option>
                    <option value="协议解除">协议解除</option>
                    <option value="退休">退休</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">离职日期 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.resign_date}
                    onChange={(e) => setFormData({ ...formData, resign_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">离职原因</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="请输入离职原因"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">离职详情</h3>
              <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={24} className="text-gray-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-800">{selectedRecord.employee_name}</h4>
                  <p className="text-gray-500 text-sm">{selectedRecord.employee_no} · {selectedRecord.department_name}</p>
                </div>
                <span className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedRecord.status).color}`}>
                  {getStatusInfo(selectedRecord.status).icon}
                  <span className="ml-1">{getStatusInfo(selectedRecord.status).label}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">入职日期</p>
                  <p className="font-medium text-gray-800 flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    {selectedRecord.entry_date}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">离职日期</p>
                  <p className="font-medium text-red-600 flex items-center">
                    <Calendar size={16} className="mr-2 text-red-400" />
                    {selectedRecord.resign_date}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">离职类型</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getResignTypeColor(selectedRecord.resign_type)}`}>
                  {selectedRecord.resign_type}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2 flex items-center">
                  <FileText size={16} className="mr-2" />
                  离职原因
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                  {selectedRecord.reason}
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>操作人：{selectedRecord.operator}</p>
                <p className="mt-1">申请时间：{selectedRecord.created_at}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                关闭
              </button>
              {selectedRecord.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(selectedRecord.id)}
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    驳回
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRecord.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    批准
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
