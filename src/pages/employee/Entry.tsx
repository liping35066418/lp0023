import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  UserPlus,
  FileText,
  X,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar
} from 'lucide-react';

interface EntryRecord {
  id: number;
  employee_no: string;
  name: string;
  gender: string;
  phone: string;
  email: string;
  department_name: string;
  position: string;
  job_level: string;
  entry_date: string;
  status: string;
  remark: string;
  created_at: string;
}

export default function EntryManagement() {
  const [records, setRecords] = useState<EntryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EntryRecord | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    phone: '',
    email: '',
    id_card: '',
    department_id: '',
    position: '',
    job_level: '',
    entry_date: '',
    salary: '',
    remark: '',
  });

  useEffect(() => {
    fetchRecords();
  }, [page, keyword, status]);

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        status: 'inactive',
      });
      if (keyword) params.append('keyword', keyword);

      const res = await fetch(`/api/employees?${params}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.list.map((item: any) => ({
          ...item,
          status: item.status === 'inactive' ? 'pending' : item.status,
        })));
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('获取入职记录失败:', error);
      setRecords(getMockData());
      setTotal(8);
    }
  };

  const getMockData = (): EntryRecord[] => [
    { id: 11, employee_no: 'EMP011', name: '陈十三', gender: '男', phone: '13800138011', email: 'chen13@company.com', department_name: '后端组', position: '后端工程师', job_level: 'P4', entry_date: '2024-07-15', status: 'pending', remark: '社招，3年经验', created_at: '2024-06-20' },
    { id: 12, employee_no: 'EMP012', name: '林十四', gender: '女', phone: '13800138012', email: 'lin14@company.com', department_name: '前端组', position: '前端工程师', job_level: 'P3', entry_date: '2024-07-01', status: 'approved', remark: '校招，应届毕业生', created_at: '2024-06-15' },
    { id: 13, employee_no: 'EMP013', name: '黄十五', gender: '男', phone: '13800138013', email: 'huang15@company.com', department_name: '市场部', position: '市场专员', job_level: 'P3', entry_date: '2024-06-25', status: 'approved', remark: '有2年市场经验', created_at: '2024-06-10' },
    { id: 14, employee_no: 'EMP014', name: '杨十六', gender: '女', phone: '13800138014', email: 'yang16@company.com', department_name: '人力资源部', position: '招聘专员', job_level: 'P3', entry_date: '2024-07-20', status: 'pending', remark: '猎头推荐', created_at: '2024-06-25' },
  ];

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: '待入职', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
      approved: { label: '已入职', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
      rejected: { label: '已取消', color: 'bg-gray-100 text-gray-700', icon: <XCircle size={12} /> },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
  };

  const handleView = (record: EntryRecord) => {
    setSelectedRecord(record);
    setShowDetail(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.department_id) {
      alert('请填写必填项');
      return;
    }
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'inactive',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('入职登记成功');
        setShowAddModal(false);
        fetchRecords();
      } else {
        alert(data.error || '登记失败');
      }
    } catch (error) {
      alert('登记失败，请稍后重试');
    }
  };

  const handleConfirmEntry = async (id: number) => {
    if (!confirm('确认该员工已入职？')) return;
    try {
      const res = await fetch(`/api/employees/${id}/entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        alert('入职确认成功');
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索姓名、手机号、工号..."
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
                  <option value="pending">待入职</option>
                  <option value="approved">已入职</option>
                  <option value="rejected">已取消</option>
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
                入职登记
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">工号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">姓名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">部门</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">职位</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">职级</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">计划入职日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => {
                const statusInfo = getStatusInfo(record.status);
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{record.employee_no}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">{record.name.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{record.name}</p>
                          <p className="text-xs text-gray-500">{record.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.department_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.position}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.job_level}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.entry_date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(record)}
                          className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                          title="查看"
                        >
                          <Eye size={16} />
                        </button>
                        {record.status === 'pending' && (
                          <button
                            onClick={() => handleConfirmEntry(record.id)}
                            className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100"
                          >
                            确认入职
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
          <div className="bg-white rounded-xl w-4/5 max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <UserPlus size={20} className="mr-2 text-blue-600" />
                新员工入职登记
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-4 pb-2 border-b border-gray-100">基本信息</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">姓名 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入姓名"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">性别</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">手机号 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入手机号"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">邮箱</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入邮箱"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">身份证号</label>
                      <input
                        type="text"
                        value={formData.id_card}
                        onChange={(e) => setFormData({ ...formData, id_card: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入身份证号"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-4 pb-2 border-b border-gray-100">工作信息</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">部门 <span className="text-red-500">*</span></label>
                      <select
                        value={formData.department_id}
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
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
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">职位</label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入职位"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">职级</label>
                      <select
                        value={formData.job_level}
                        onChange={(e) => setFormData({ ...formData, job_level: e.target.value })}
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
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">入职日期</label>
                      <input
                        type="date"
                        value={formData.entry_date}
                        onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">薪资</label>
                      <input
                        type="text"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入薪资"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">附件上传</label>
                      <button className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center">
                        <Upload size={16} className="mr-2" />
                        上传简历/证件
                      </button>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">备注</label>
                      <textarea
                        value={formData.remark}
                        onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="请输入备注信息"
                      />
                    </div>
                  </div>
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
                提交登记
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">入职详情</h3>
              <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-2xl font-medium">{selectedRecord.name.charAt(0)}</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-gray-800">{selectedRecord.name}</h4>
                  <p className="text-gray-500">{selectedRecord.employee_no} · {selectedRecord.position}</p>
                  <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(selectedRecord.status).color}`}>
                    {getStatusInfo(selectedRecord.status).icon}
                    <span className="ml-1">{getStatusInfo(selectedRecord.status).label}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">基本信息</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex"><span className="w-20 text-gray-500">性别：</span><span className="text-gray-800">{selectedRecord.gender}</span></div>
                    <div className="flex"><span className="w-20 text-gray-500">手机：</span><span className="text-gray-800">{selectedRecord.phone}</span></div>
                    <div className="flex"><span className="w-20 text-gray-500">邮箱：</span><span className="text-gray-800">{selectedRecord.email}</span></div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">工作信息</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex"><span className="w-20 text-gray-500">部门：</span><span className="text-gray-800 flex items-center"><Building2 size={14} className="mr-1" />{selectedRecord.department_name}</span></div>
                    <div className="flex"><span className="w-20 text-gray-500">职位：</span><span className="text-gray-800">{selectedRecord.position}</span></div>
                    <div className="flex"><span className="w-20 text-gray-500">职级：</span><span className="text-gray-800">{selectedRecord.job_level}</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="font-medium text-gray-800 mb-3">入职安排</h5>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-500">计划入职日期：</span>
                    <span className="text-gray-800 font-medium">{selectedRecord.entry_date}</span>
                  </div>
                  {selectedRecord.remark && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-gray-500 mb-1">备注：</p>
                      <p className="text-gray-700">{selectedRecord.remark}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                  <FileText size={16} className="mr-2" />
                  入职材料
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  {['身份证复印件', '学历证明', '体检报告', '原单位离职证明'].map((item, idx) => (
                    <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FileText size={20} className="text-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">{item}.pdf</span>
                    </div>
                  ))}
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
                <button
                  onClick={() => handleConfirmEntry(selectedRecord.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  确认入职
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
