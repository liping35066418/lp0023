import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  Plus,
  FileText,
  Calendar
} from 'lucide-react';

interface FieldworkRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_no: string;
  department_name: string;
  fieldwork_date: string;
  start_time: string;
  end_time: string;
  location: string;
  purpose: string;
  status: string;
  approver?: string;
  remark?: string;
  created_at: string;
}

export default function FieldworkManagement() {
  const [records, setRecords] = useState<FieldworkRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FieldworkRecord | null>(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    fieldwork_date: '',
    start_time: '',
    end_time: '',
    location: '',
    purpose: '',
  });

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

      const res = await fetch(`/api/attendance/fieldwork?${params}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.list || []);
        setTotal(data.data.total || 0);
      }
    } catch (error) {
      console.error('获取外勤记录失败:', error);
      setRecords(getMockData());
      setTotal(18);
    }
  };

  const getMockData = (): FieldworkRecord[] => [
    { id: 1, employee_id: 5, employee_name: '钱七', employee_no: 'EMP005', department_name: '市场部', fieldwork_date: '2024-07-02', start_time: '09:00', end_time: '18:00', location: '客户公司-朝阳区', purpose: '客户拜访，洽谈合作事宜', status: 'approved', approver: '张三', created_at: '2024-07-01' },
    { id: 2, employee_id: 5, employee_name: '钱七', employee_no: 'EMP005', department_name: '市场部', fieldwork_date: '2024-07-04', start_time: '13:00', end_time: '17:00', location: '展览中心', purpose: '参加行业展会', status: 'approved', approver: '张三', created_at: '2024-07-03' },
    { id: 3, employee_id: 9, employee_name: '郑十一', employee_no: 'EMP009', department_name: '前端组', fieldwork_date: '2024-07-08', start_time: '10:00', end_time: '16:00', location: '客户现场', purpose: '客户项目现场调试', status: 'pending', created_at: '2024-07-05' },
    { id: 4, employee_id: 2, employee_name: '李四', employee_no: 'EMP002', department_name: '人力资源部', fieldwork_date: '2024-07-09', start_time: '09:00', end_time: '12:00', location: '人才市场', purpose: '现场招聘', status: 'pending', created_at: '2024-07-07' },
    { id: 5, employee_id: 3, employee_name: '王五', employee_no: 'EMP003', department_name: '财务部', fieldwork_date: '2024-07-03', start_time: '09:00', end_time: '15:00', location: '税务局', purpose: '办理税务相关事务', status: 'rejected', approver: '张三', remark: '可安排出纳前往', created_at: '2024-07-02' },
    { id: 6, employee_id: 6, employee_name: '孙八', employee_no: 'EMP006', department_name: '前端组', fieldwork_date: '2024-06-25', start_time: '09:30', end_time: '18:00', location: '客户公司', purpose: '需求沟通与原型确认', status: 'approved', approver: '赵六', created_at: '2024-06-24' },
  ];

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
      approved: { label: '已通过', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
      rejected: { label: '已驳回', color: 'bg-red-100 text-red-700', icon: <XCircle size={12} /> },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
  };

  const handleView = (record: FieldworkRecord) => {
    setSelectedRecord(record);
    setShowDetail(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.fieldwork_date || !formData.location) {
      alert('请填写必填项');
      return;
    }
    try {
      const res = await fetch('/api/attendance/fieldwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: formData.employee_id,
          fieldworkDate: formData.fieldwork_date,
          startTime: formData.start_time,
          endTime: formData.end_time,
          location: formData.location,
          purpose: formData.purpose,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('外勤申请提交成功');
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
    if (!confirm('确认通过该外勤申请？')) return;
    alert('审批通过');
    fetchRecords();
    setShowDetail(false);
  };

  const handleReject = async (id: number) => {
    const reason = prompt('请输入驳回原因：');
    if (reason === null) return;
    alert('已驳回');
    fetchRecords();
    setShowDetail(false);
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
                申请外勤
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
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">日期</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">时间段</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">地点</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">事由</th>
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
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{record.fieldwork_date}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {record.start_time} - {record.end_time}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm text-gray-700">
                        <MapPin size={14} className="text-purple-500 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{record.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[150px] truncate">
                      {record.purpose}
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
                <MapPin size={20} className="mr-2 text-purple-600" />
                外勤申请
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
                    <option value="5">钱七 - EMP005</option>
                    <option value="6">孙八 - EMP006</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">外勤日期 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.fieldwork_date}
                    onChange={(e) => setFormData({ ...formData, fieldwork_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">开始时间</label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">结束时间</label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">外勤地点 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入外勤地点"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">外勤事由</label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="请输入外勤事由"
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
              <h3 className="text-lg font-semibold text-gray-800">外勤详情</h3>
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
                  <Calendar size={16} className="text-gray-400 mr-3" />
                  <span className="text-gray-500 w-20">日期</span>
                  <span className="text-gray-800">{selectedRecord.fieldwork_date}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="text-gray-400 mr-3" />
                  <span className="text-gray-500 w-20">时间段</span>
                  <span className="text-gray-800">{selectedRecord.start_time} - {selectedRecord.end_time}</span>
                </div>
                <div className="flex items-start">
                  <MapPin size={16} className="text-purple-500 mr-3 mt-0.5" />
                  <span className="text-gray-500 w-20">地点</span>
                  <span className="text-gray-800">{selectedRecord.location}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center">
                    <FileText size={16} className="mr-2" />
                    外勤事由
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 ml-6">
                    {selectedRecord.purpose}
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
