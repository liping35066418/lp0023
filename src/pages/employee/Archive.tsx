import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  FileText,
  UserPlus,
  ArrowRightLeft,
  UserMinus,
  Upload,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  History,
  Paperclip
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Employee {
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
}

export default function EmployeeArchive() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchEmployees();
  }, [page, keyword, status]);

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (keyword) params.append('keyword', keyword);
      if (status) params.append('status', status);

      const res = await fetch(`/api/employees?${params}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data.list);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('获取员工列表失败:', error);
      setEmployees(getMockEmployees());
      setTotal(10);
    }
  };

  const getMockEmployees = (): Employee[] => [
    { id: 1, employee_no: 'EMP001', name: '张三', gender: '男', phone: '13800138001', email: 'zhangsan@company.com', department_name: '总经办', position: '总经理', job_level: 'P8', entry_date: '2015-01-01', status: 'active' },
    { id: 2, employee_no: 'EMP002', name: '李四', gender: '女', phone: '13800138002', email: 'lisi@company.com', department_name: '人力资源部', position: 'HR经理', job_level: 'P6', entry_date: '2016-03-15', status: 'active' },
    { id: 3, employee_no: 'EMP003', name: '王五', gender: '男', phone: '13800138003', email: 'wangwu@company.com', department_name: '财务部', position: '财务主管', job_level: 'P6', entry_date: '2017-06-01', status: 'active' },
    { id: 4, employee_no: 'EMP004', name: '赵六', gender: '男', phone: '13800138004', email: 'zhaoliu@company.com', department_name: '技术部', position: '技术总监', job_level: 'P7', entry_date: '2016-09-01', status: 'active' },
    { id: 5, employee_no: 'EMP005', name: '钱七', gender: '女', phone: '13800138005', email: 'qianqi@company.com', department_name: '市场部', position: '市场经理', job_level: 'P5', entry_date: '2018-02-01', status: 'active' },
    { id: 6, employee_no: 'EMP006', name: '孙八', gender: '男', phone: '13800138006', email: 'sunba@company.com', department_name: '前端组', position: '高级前端工程师', job_level: 'P5', entry_date: '2019-04-01', status: 'active' },
    { id: 7, employee_no: 'EMP007', name: '周九', gender: '男', phone: '13800138007', email: 'zhoujiu@company.com', department_name: '后端组', position: '高级后端工程师', job_level: 'P5', entry_date: '2018-11-15', status: 'active' },
    { id: 8, employee_no: 'EMP008', name: '吴十', gender: '女', phone: '13800138008', email: 'wushi@company.com', department_name: '测试组', position: '测试工程师', job_level: 'P4', entry_date: '2020-07-01', status: 'active' },
    { id: 9, employee_no: 'EMP009', name: '郑十一', gender: '男', phone: '13800138009', email: 'zheng11@company.com', department_name: '前端组', position: '前端工程师', job_level: 'P4', entry_date: '2020-03-01', status: 'active' },
    { id: 10, employee_no: 'EMP010', name: '冯十二', gender: '女', phone: '13800138010', email: 'feng12@company.com', department_name: '人力资源部', position: 'HR专员', job_level: 'P3', entry_date: '2021-01-15', status: 'active' },
  ];

  const getStatusLabel = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      active: { label: '在职', color: 'bg-green-100 text-green-700' },
      inactive: { label: '待入职', color: 'bg-yellow-100 text-yellow-700' },
      resigned: { label: '已离职', color: 'bg-gray-100 text-gray-700' },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const handleView = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowDetail(true);
  };

  const handleAdd = () => {
    navigate('/employee/entry');
  };

  const handleTransfer = (emp: Employee) => {
    if (confirm(`确定要调动 ${emp.name} 吗？`)) {
      // 调岗逻辑
    }
  };

  const handleResign = (emp: Employee) => {
    if (confirm(`确定要办理 ${emp.name} 的离职手续吗？`)) {
      // 离职逻辑
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const tabs = [
    { key: 'basic', label: '基本信息' },
    { key: 'job', label: '工作信息' },
    { key: 'history', label: '履历档案' },
    { key: 'attachment', label: '附件管理' },
  ];

  return (
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
                placeholder="搜索员工姓名、工号、电话..."
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
                <option value="active">在职</option>
                <option value="inactive">待入职</option>
                <option value="resigned">已离职</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Download size={16} className="mr-1" />
              批量导出
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              <Plus size={16} className="mr-1" />
              新增员工
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">性别</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">部门</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">职位</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">职级</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">入职日期</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((emp) => {
              const statusInfo = getStatusLabel(emp.status);
              return (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{emp.employee_no}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">{emp.name.charAt(0)}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{emp.gender}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{emp.department_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{emp.position}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{emp.job_level}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{emp.entry_date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleView(emp)}
                        className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                        title="查看"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                        title="编辑"
                      >
                        <Edit2 size={16} />
                      </button>
                      <div className="relative group">
                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                          <MoreHorizontal size={16} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-10 min-w-28">
                          <button
                            onClick={() => handleTransfer(emp)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <ArrowRightLeft size={14} className="mr-2" />
                            调岗
                          </button>
                          <button
                            onClick={() => handleResign(emp)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <UserMinus size={14} className="mr-2" />
                            离职
                          </button>
                        </div>
                      </div>
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

      {showDetail && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xl font-medium">{selectedEmployee.name.charAt(0)}</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">{selectedEmployee.name}</h3>
                  <p className="text-sm text-gray-500">{selectedEmployee.employee_no} · {selectedEmployee.position}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="border-b border-gray-100">
              <div className="flex">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === tab.key
                        ? 'text-blue-600 border-blue-500'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {activeTab === 'basic' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">基本信息</h4>
                    <div className="space-y-3">
                      {[
                        { label: '姓名', value: selectedEmployee.name },
                        { label: '性别', value: selectedEmployee.gender },
                        { label: '出生日期', value: '1990-01-15' },
                        { label: '身份证号', value: '110101199001150000' },
                        { label: '手机号', value: selectedEmployee.phone },
                        { label: '邮箱', value: selectedEmployee.email },
                      ].map((item, idx) => (
                        <div key={idx} className="flex">
                          <span className="w-24 text-sm text-gray-500">{item.label}</span>
                          <span className="text-sm text-gray-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">联系信息</h4>
                    <div className="space-y-3">
                      {[
                        { label: '现居地址', value: '北京市朝阳区建国路88号' },
                        { label: '紧急联系人', value: '李四' },
                        { label: '紧急联系电话', value: '13900139000' },
                        { label: '开户行', value: '中国工商银行' },
                        { label: '银行账号', value: '6222020001000100001' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex">
                          <span className="w-24 text-sm text-gray-500">{item.label}</span>
                          <span className="text-sm text-gray-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'job' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">工作信息</h4>
                    <div className="space-y-3">
                      {[
                        { label: '所属部门', value: selectedEmployee.department_name },
                        { label: '职位', value: selectedEmployee.position },
                        { label: '职级', value: selectedEmployee.job_level },
                        { label: '薪酬档位', value: 'S3' },
                        { label: '入职日期', value: selectedEmployee.entry_date },
                        { label: '转正日期', value: '2016-06-15' },
                        { label: '用工类型', value: '全职' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex">
                          <span className="w-24 text-sm text-gray-500">{item.label}</span>
                          <span className="text-sm text-gray-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">教育背景</h4>
                    <div className="space-y-3">
                      {[
                        { label: '最高学历', value: '本科' },
                        { label: '毕业院校', value: '清华大学' },
                        { label: '专业', value: '计算机科学' },
                        { label: '毕业时间', value: '2015-06-30' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex">
                          <span className="w-24 text-sm text-gray-500">{item.label}</span>
                          <span className="text-sm text-gray-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                    <History size={18} className="mr-2" />
                    履历档案
                  </h4>
                  <div className="space-y-4">
                    {[
                      { type: '入职', date: '2015-01-01', desc: '加入公司，担任总经理', operator: '系统' },
                      { type: '调岗', date: '2017-03-15', desc: '从技术部调至总经办', operator: 'HR经理' },
                      { type: '信息更新', date: '2020-05-20', desc: '更新联系电话、地址信息', operator: '员工本人' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex p-4 bg-gray-50 rounded-lg">
                        <div className="w-24 text-sm font-medium text-gray-700">{item.type}</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{item.desc}</p>
                          <p className="text-xs text-gray-500 mt-1">操作人：{item.operator}</p>
                        </div>
                        <div className="text-sm text-gray-500">{item.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'attachment' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-800 flex items-center">
                      <Paperclip size={18} className="mr-2" />
                      附件列表
                    </h4>
                    <button className="flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">
                      <Upload size={14} className="mr-1" />
                      上传附件
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['身份证复印件', '学历证明', '劳动合同', '入职登记表'].map((name, idx) => (
                      <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FileText size={24} className="text-blue-500" />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-800">{name}.pdf</p>
                          <p className="text-xs text-gray-500">2.5 MB · 2024-01-15</p>
                        </div>
                        <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                关闭
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                编辑档案
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
