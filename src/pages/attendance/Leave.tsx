import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  Plus,
  FileText
} from 'lucide-react';

interface LeaveRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_no: string;
  department_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  approver?: string;
  remark?: string;
  created_at: string;
}

const leaveTypes = ['事假', '病假', '年假', '婚假', '产假', '丧假', '调休'];

export default function LeaveManagement() {
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LeaveRecord | null>(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: '事假',
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    fetchRecords();
  }, [page, keyword, status, leaveType]);

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (keyword) params.append('keyword', keyword);
      if (status) params.append('status', status);
      if (leaveType) params.append('leaveType', leaveType);

      const res = await fetch(`/api/attendance/leaves?${params}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.list || []);
        setTotal(data.data.total || 0);
      }
    } catch (error) {
      console.error('获取请假记录失败:', error);
      setRecords(getMockData());
      setTotal(25);
    }
  };

  const getMockData = (): LeaveRecord[] => [
    { id: 1, employee_id: 1, employee_name: '张三', employee_no: 'EMP001', department_name: '总经办', leave_type: '年假', start_date: '2024-07-01', end_date: '2024-07-05', days: 5, reason: '回老家探亲', status: 'approved', approver: '系统', created_at: '2024-06-20' },
    { id: 2, employee_id: 2, employee_name: '李四', employee_no: 'EMP002', department_name: '人力资源部', leave_type: '事假', start_date: '2024-07-03', end_date: '2024-07-03', days: 1, reason: '家里有事处理', status: 'approved', approver: '张三', created_at: '2024-07-01' },
    { id: 3, employee_id: 6, employee_name: '孙八', employee_no: 'EMP006', department_name: '前端组', leave_type: '病假', start_date: '2024-07-08', end_date: '2024-07-09', days: 2, reason: '感冒发烧，需要休息', status: 'pending', created_at: '2024-07-07' },
    { id: 4, employee_id: 7, employee_name: '周九', employee_no: 'EMP007', department_name: '后端组', leave_type: '调休', start_date: '2024-07-12', end_date: '2024-07-12', days: 1, reason: '上周加班调休', status: 'pending', created_at: '2024-07-08' },
    { id: 5, employee_id: 5, employee_name: '钱七', employee_no: 'EMP005', department_name: '市场部', leave_type: '婚假', start_date: '2024-07-15', end_date: '2024-07-25', days: 10, reason: '结婚', status: 'pending', created_at: '2024-07-01' },
    { id: 6, employee_id: 3, employee_name: '王五', employee_no: 'EMP003', department_name: '财务部', leave_type: '事假', start_date: '2024-06-20', end_date: '2024-06-21', days: 2, reason: '处理个人事务', status: 'rejected', approver: '张三', remark: '月底财务较忙，请改期', created_at: '2024-06-15' },
  ];

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
      approved: { label: '已通过', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
      rejected: { label: '已驳回', color: 'bg-red-100 text-red-700', icon: <XCircle size={12} /> },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
  };

  const getLeaveTypeColor = (type: string) => {
    const map: Record<string, string> = {
      '事假': 'bg-gray-100 text-gray-700',
      '病假': 'bg-red-100 text-red-700',
      '年假': 'bg-green-100 text-green-700',
      '婚假': 'bg-pink-100 text-pink-700',
      '产假': 'bg-purple-100 text-purple-700',
      '丧假': 'bg-gray-200 text-gray-700',
      '调休': 'bg-blue-100 text-blue-700',
    };
    return map[type] || 'bg-gray-100 text-gray-700';
  };

  const handleView = (record: LeaveRecord) => {
    setSelectedRecord(record);
    setShowDetail(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.start_date || !formData.end_date) {
      alert('请填写必填项');
      return;
    }
    try {
      const res = await fetch('/api/attendance/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: formData.employee_id,
          leaveType: formData.leave_type,
          startDate: formData.start_date,
          endDate: formData.end_date,
          reason: formData.reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('请假申请提交成功');
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
    if (!confirm('确认通过该请假申请？')) return;
    try {
      const res = await fetch(`/api/attendance/leaves/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        alert('审批通过');
        fetchRecords();
        setShowDetail(false);
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('请输入驳回原因：');
    if (reason === null) return;
    try {
      const res = await fetch(`/api/attendance/leaves/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        alert('已驳回');
        fetchRecords();
        setShowDetail(false);
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
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

            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部类型</option>
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部状态</option>
                <option value="pending">待审批</option>
                <option value="approved">已通过</option>
                <option value="rejected">已驳回</option>
              </select>
            </div>

            <div className="ml-auto flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Download size={16} className="mr-1" />
                导出
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                <Plus size={16} className="mr-1" />
                申请请假
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">员工</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">部门</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">请假类型</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">开始日期</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">结束日期</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">天数</th>
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
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">{record.employee_name.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{record.employee_name}</p>
                          <p className="text-xs text-gray-500">{record.employee_no}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.department_name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLeaveTypeColor(record.leave_type)}`}>
                        {record.leave_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{record.start_date}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{record.end_date}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-gray-800">{record.days}</span>
                      <span className="text-xs text-gray-500 ml-1">天</span>
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
          <div className="bg-white rounded-xl w-4/5 max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar size={20} className="mr-2 text-blue-600" />
                请假申请
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
                  <label className="block text-sm text-gray-600 mb-1">请假类型</label>
                  <select
                    value={formData.leave_type}
                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {leaveTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">开始日期 <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">结束日期 <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">请假原因</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="请输入请假原因"
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
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">请假详情</h3>
              <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={24} className="text-blue-600" />
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

              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="w-20 text-sm text-gray-500">请假类型</span>
                  <span className={`px-2 py-0.5 rounded text-sm font-medium ${getLeaveTypeColor(selectedRecord.leave_type)}`}>
                    {selectedRecord.leave_type}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-20 text-sm text-gray-500">请假时间</span>
                  <span className="text-gray-800">
                    {selectedRecord.start_date} 至 {selectedRecord.end_date}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-20 text-sm text-gray-500">共计</span>
                  <span className="text-gray-800 font-medium">{selectedRecord.days} 天</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center">
                    <FileText size={16} className="mr-2" />
                    请假原因
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 ml-6">
                    {selectedRecord.reason}
                  </div>
                </div>
                {selectedRecord.approver && (
                  <div className="text-sm text-gray-500">
                    审批人：{selectedRecord.approver}
                  </div>
                )}
                {selectedRecord.remark && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">审批意见：</p>
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{selectedRecord.remark}</p>
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  申请时间：{selectedRecord.created_at}
                </div>
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
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    通过
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
