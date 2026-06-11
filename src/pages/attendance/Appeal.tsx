import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  MessageSquare
} from 'lucide-react';

interface AppealRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_no: string;
  department_name: string;
  appeal_date: string;
  appeal_type: string;
  original_status: string;
  reason: string;
  status: string;
  approver?: string;
  approve_remark?: string;
  created_at: string;
}

const appealTypes = ['迟到申诉', '早退申诉', '旷工申诉', '打卡缺失申诉'];

export default function AppealManagement() {
  const [records, setRecords] = useState<AppealRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AppealRecord | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [page, keyword, status]);

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (keyword) params.append('keyword', keyword);
      if (status) params.append('status', status);

      const res = await fetch(`/api/attendance/appeals?${params}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.list || []);
        setTotal(data.data.total || 0);
      }
    } catch (error) {
      console.error('获取申诉记录失败:', error);
      setRecords(getMockData());
      setTotal(12);
    }
  };

  const getMockData = (): AppealRecord[] => [
    { id: 1, employee_id: 6, employee_name: '孙八', employee_no: 'EMP006', department_name: '前端组', appeal_date: '2024-07-02', appeal_type: '迟到申诉', original_status: '迟到', reason: '当天地铁故障导致迟到，已在钉钉打卡补卡说明，忘记录入系统', status: 'pending', created_at: '2024-07-02 10:30' },
    { id: 2, employee_id: 7, employee_name: '周九', employee_no: 'EMP007', department_name: '后端组', appeal_date: '2024-07-03', appeal_type: '早退申诉', original_status: '早退', reason: '因身体不适提前下班，已和主管请假', status: 'pending', created_at: '2024-07-03 19:00' },
    { id: 3, employee_id: 9, employee_name: '郑十一', employee_no: 'EMP009', department_name: '前端组', appeal_date: '2024-07-05', appeal_type: '打卡缺失申诉', original_status: '缺卡', reason: '上午外出拜访客户，外勤打卡未同步', status: 'approved', approver: '赵六', approve_remark: '情况属实，已修改为外勤', created_at: '2024-07-05 18:00' },
    { id: 4, employee_id: 2, employee_name: '李四', employee_no: 'EMP002', department_name: '人力资源部', appeal_date: '2024-06-28', appeal_type: '旷工申诉', original_status: '旷工', reason: '记错日期，以为是周末', status: 'rejected', approver: '张三', approve_remark: '理由不充分，请重视考勤', created_at: '2024-06-28 09:00' },
    { id: 5, employee_id: 5, employee_name: '钱七', employee_no: 'EMP005', department_name: '市场部', appeal_date: '2024-07-01', appeal_type: '迟到申诉', original_status: '迟到', reason: '参加外部会议，路上堵车', status: 'approved', approver: '张三', approve_remark: '同意', created_at: '2024-07-01 14:00' },
  ];

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
      approved: { label: '已通过', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
      rejected: { label: '已驳回', color: 'bg-red-100 text-red-700', icon: <XCircle size={12} /> },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
  };

  const getAppealTypeColor = (type: string) => {
    const map: Record<string, string> = {
      '迟到申诉': 'bg-yellow-100 text-yellow-700',
      '早退申诉': 'bg-orange-100 text-orange-700',
      '旷工申诉': 'bg-red-100 text-red-700',
      '打卡缺失申诉': 'bg-blue-100 text-blue-700',
    };
    return map[type] || 'bg-gray-100 text-gray-700';
  };

  const handleView = (record: AppealRecord) => {
    setSelectedRecord(record);
    setShowDetail(true);
  };

  const handleApprove = async (id: number) => {
    const remark = prompt('请输入审批意见（可选）：') || '';
    if (!confirm('确认通过该申诉？')) return;
    try {
      const res = await fetch(`/api/attendance/appeals/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remark }),
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
    const remark = prompt('请输入驳回原因：');
    if (remark === null) return;
    try {
      const res = await fetch(`/api/attendance/appeals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remark }),
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

  const pendingCount = records.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待处理申诉</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <AlertCircle size={24} className="text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">本月申诉</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <MessageSquare size={24} className="text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">通过率</p>
              <p className="text-2xl font-bold text-green-600 mt-1">68%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle size={24} className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">驳回率</p>
              <p className="text-2xl font-bold text-red-600 mt-1">32%</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <XCircle size={24} className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

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
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部状态</option>
                <option value="pending">待处理</option>
                <option value="approved">已通过</option>
                <option value="rejected">已驳回</option>
              </select>
            </div>

            <div className="ml-auto flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Download size={16} className="mr-1" />
                导出
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
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">申诉日期</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">申诉类型</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">原状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">申诉原因</th>
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
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{record.appeal_date}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getAppealTypeColor(record.appeal_type)}`}>
                        {record.appeal_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium">
                        {record.original_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">
                      {record.reason}
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

      {showDetail && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">申诉详情</h3>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">申诉日期</p>
                    <p className="text-gray-800 font-medium">{selectedRecord.appeal_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">申诉类型</p>
                    <span className={`px-2 py-0.5 rounded text-sm font-medium ${getAppealTypeColor(selectedRecord.appeal_type)}`}>
                      {selectedRecord.appeal_type}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">原考勤状态</p>
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-sm font-medium">
                    {selectedRecord.original_status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center">
                    <FileText size={16} className="mr-2" />
                    申诉原因
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                    {selectedRecord.reason}
                  </div>
                </div>
                {selectedRecord.approver && (
                  <div className="text-sm text-gray-500">
                    处理人：{selectedRecord.approver}
                  </div>
                )}
                {selectedRecord.approve_remark && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">处理意见：</p>
                    <p className={`text-sm p-3 rounded-lg ${selectedRecord.status === 'approved' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                      {selectedRecord.approve_remark}
                    </p>
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
