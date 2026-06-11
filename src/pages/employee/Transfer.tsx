import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRightLeft,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  Calendar,
  FileText,
  Plus
} from 'lucide-react';

interface TransferRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_no: string;
  from_department: string;
  to_department: string;
  from_position: string;
  to_position: string;
  from_job_level: string;
  to_job_level: string;
  transfer_date: string;
  reason: string;
  status: string;
  operator: string;
  created_at: string;
}

export default function TransferManagement() {
  const [records, setRecords] = useState<TransferRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TransferRecord | null>(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    to_department: '',
    to_position: '',
    to_job_level: '',
    transfer_date: '',
    reason: '',
  });

  useEffect(() => {
    fetchRecords();
  }, [page, keyword, status]);

  const fetchRecords = async () => {
    try {
      const res = await fetch(`/api/employees/history?type=transfer&page=${page}&pageSize=${pageSize}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.list || []);
        setTotal(data.data.total || 0);
      }
    } catch (error) {
      console.error('获取调岗记录失败:', error);
      setRecords(getMockData());
      setTotal(12);
    }
  };

  const getMockData = (): TransferRecord[] => [
    { id: 1, employee_id: 1, employee_name: '张三', employee_no: 'EMP001', from_department: '技术部', to_department: '总经办', from_position: '技术总监', to_position: '总经理', from_job_level: 'P7', to_job_level: 'P8', transfer_date: '2017-03-15', reason: '公司战略调整，晋升管理岗', status: 'completed', operator: '系统', created_at: '2017-03-10' },
    { id: 2, employee_id: 6, employee_name: '孙八', employee_no: 'EMP006', from_department: '技术部', to_department: '前端组', from_position: '前端工程师', to_position: '高级前端工程师', from_job_level: 'P4', to_job_level: 'P5', transfer_date: '2022-06-01', reason: '绩效优秀，晋升调级', status: 'completed', operator: 'HR经理', created_at: '2022-05-20' },
    { id: 3, employee_id: 7, employee_name: '周九', employee_no: 'EMP007', from_department: '前端组', to_department: '后端组', from_position: '前端工程师', to_position: '高级后端工程师', from_job_level: 'P4', to_job_level: 'P5', transfer_date: '2023-01-15', reason: '个人发展意愿，技术方向调整', status: 'completed', operator: 'HR经理', created_at: '2023-01-05' },
    { id: 4, employee_id: 10, employee_name: '冯十二', employee_no: 'EMP010', from_department: '行政部', to_department: '人力资源部', from_position: '行政专员', to_position: 'HR专员', from_job_level: 'P2', to_job_level: 'P3', transfer_date: '2024-03-01', reason: '部门重组，岗位调整', status: 'pending', operator: 'HR经理', created_at: '2024-02-20' },
    { id: 5, employee_id: 5, employee_name: '钱七', employee_no: 'EMP005', from_department: '销售部', to_department: '市场部', from_position: '销售经理', to_position: '市场经理', from_job_level: 'P5', to_job_level: 'P5', transfer_date: '2024-06-01', reason: '业务线整合', status: 'pending', operator: '总经理', created_at: '2024-05-25' },
  ];

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
      approved: { label: '已通过', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
      rejected: { label: '已驳回', color: 'bg-red-100 text-red-700', icon: <XCircle size={12} /> },
      completed: { label: '已完成', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle size={12} /> },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
  };

  const handleView = (record: TransferRecord) => {
    setSelectedRecord(record);
    setShowDetail(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.to_department || !formData.transfer_date) {
      alert('请填写必填项');
      return;
    }
    try {
      const res = await fetch(`/api/employees/${formData.employee_id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: formData.to_department,
          position: formData.to_position,
          jobLevel: formData.to_job_level,
          reason: formData.reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('调岗申请提交成功');
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
    if (!confirm('确认通过该调岗申请？')) return;
    alert('审批通过');
    fetchRecords();
    setShowDetail(false);
  };

  const handleReject = async (id: number) => {
    if (!confirm('确认驳回该调岗申请？')) return;
    alert('已驳回');
    fetchRecords();
    setShowDetail(false);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
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
                  <option value="approved">已通过</option>
                  <option value="rejected">已驳回</option>
                  <option value="completed">已完成</option>
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
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                <Plus size={16} className="mr-1" />
                发起调岗
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">员工</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">原部门/岗位</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">新部门/岗位</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">调岗日期</th>
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
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-gray-800 font-medium">{record.from_department}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{record.from_position} · {record.from_job_level}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <p className="text-green-600 font-medium">{record.to_department}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{record.to_position} · {record.to_job_level}</p>
                        </div>
                        <ArrowRightLeft size={16} className="text-blue-500 ml-3" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{record.transfer_date}</td>
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
                <ArrowRightLeft size={20} className="mr-2 text-blue-600" />
                发起调岗
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
                  <label className="block text-sm text-gray-600 mb-1">调至部门 <span className="text-red-500">*</span></label>
                  <select
                    value={formData.to_department}
                    onChange={(e) => setFormData({ ...formData, to_department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择部门</option>
                    <option value="1">总经办</option>
                    <option value="2">人力资源部</option>
                    <option value="3">财务部</option>
                    <option value="4">技术部</option>
                    <option value="5">市场部</option>
                    <option value="6">前端组</option>
                    <option value="7">后端组</option>
                    <option value="8">测试组</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">新职位</label>
                    <input
                      type="text"
                      value={formData.to_position}
                      onChange={(e) => setFormData({ ...formData, to_position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="请输入新职位"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">新职级</label>
                    <select
                      value={formData.to_job_level}
                      onChange={(e) => setFormData({ ...formData, to_job_level: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">请选择职级</option>
                      <option value="P1">P1</option>
                      <option value="P2">P2</option>
                      <option value="P3">P3</option>
                      <option value="P4">P4</option>
                      <option value="P5">P5</option>
                      <option value="P6">P6</option>
                      <option value="P7">P7</option>
                      <option value="P8">P8</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">生效日期 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.transfer_date}
                    onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">调岗原因</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="请输入调岗原因"
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
          <div className="bg-white rounded-xl w-4/5 max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">调岗详情</h3>
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
                  <p className="text-gray-500 text-sm">{selectedRecord.employee_no}</p>
                </div>
                <span className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedRecord.status).color}`}>
                  {getStatusInfo(selectedRecord.status).icon}
                  <span className="ml-1">{getStatusInfo(selectedRecord.status).label}</span>
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h5 className="font-medium text-gray-800 mb-4 flex items-center">
                  <ArrowRightLeft size={18} className="mr-2 text-blue-600" />
                  调岗信息
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">原部门</p>
                    <p className="font-medium text-gray-800 flex items-center">
                      <Building2 size={16} className="mr-2 text-gray-400" />
                      {selectedRecord.from_department}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">新部门</p>
                    <p className="font-medium text-green-600 flex items-center">
                      <Building2 size={16} className="mr-2 text-green-400" />
                      {selectedRecord.to_department}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">原职位</p>
                    <p className="font-medium text-gray-800">{selectedRecord.from_position}</p>
                    <p className="text-sm text-gray-500 mt-1">{selectedRecord.from_job_level}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">新职位</p>
                    <p className="font-medium text-green-600">{selectedRecord.to_position}</p>
                    <p className="text-sm text-green-500 mt-1">{selectedRecord.to_job_level}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-600">生效日期：</span>
                  <span className="text-gray-800 font-medium">{selectedRecord.transfer_date}</span>
                </div>
                <div>
                  <p className="text-gray-600 mb-1 flex items-center">
                    <FileText size={16} className="mr-2 text-gray-400" />
                    调岗原因：
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 ml-6">
                    {selectedRecord.reason}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>操作人：{selectedRecord.operator}</p>
                  <p className="mt-1">申请时间：{selectedRecord.created_at}</p>
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
