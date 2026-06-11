import { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronRight,
  ChevronDown,
  Users,
  Building2,
  Download,
  Check,
  ArrowRightLeft,
  FileText,
  MoreHorizontal,
  Eye,
  Filter
} from 'lucide-react';

interface Department {
  id: number;
  name: string;
  parent_id: number | null;
  employeeCount?: number;
  children?: Department[];
}

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

export default function EmployeeList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [expandedDepts, setExpandedDepts] = useState<Record<number, boolean>>({});
  const [keyword, setKeyword] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [showBatchMenu, setShowBatchMenu] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [selectedDeptId, keyword]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments/tree');
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('获取部门树失败:', error);
      setDepartments(getMockDepartments());
    }
  };

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '100' });
      if (selectedDeptId) params.append('departmentId', String(selectedDeptId));
      if (keyword) params.append('keyword', keyword);

      const res = await fetch(`/api/employees?${params}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data.list || []);
        setTotal(data.data.total || 0);
      }
    } catch (error) {
      console.error('获取员工列表失败:', error);
      setEmployees(getMockEmployees());
      setTotal(156);
    }
  };

  const getMockDepartments = (): Department[] => [
    {
      id: 1,
      name: '总经办',
      parent_id: null,
      employeeCount: 2,
      children: [],
    },
    {
      id: 2,
      name: '人力资源部',
      parent_id: null,
      employeeCount: 5,
      children: [],
    },
    {
      id: 3,
      name: '财务部',
      parent_id: null,
      employeeCount: 4,
      children: [],
    },
    {
      id: 4,
      name: '技术部',
      parent_id: null,
      employeeCount: 45,
      children: [
        { id: 6, name: '前端组', parent_id: 4, employeeCount: 15, children: [] },
        { id: 7, name: '后端组', parent_id: 4, employeeCount: 20, children: [] },
        { id: 8, name: '测试组', parent_id: 4, employeeCount: 10, children: [] },
      ],
    },
    {
      id: 5,
      name: '市场部',
      parent_id: null,
      employeeCount: 12,
      children: [],
    },
  ];

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

  const toggleDept = (id: number) => {
    setExpandedDepts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectDept = (id: number | null) => {
    setSelectedDeptId(id);
    setSelectedEmployees([]);
  };

  const toggleSelectEmployee = (id: number) => {
    setSelectedEmployees(prev => 
      prev.includes(id) 
        ? prev.filter(eid => eid !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
  };

  const handleBatchTransfer = () => {
    alert(`已选择 ${selectedEmployees.length} 人进行批量调岗`);
    setShowBatchMenu(false);
  };

  const handleBatchExport = () => {
    alert(`导出 ${selectedEmployees.length} 人数据`);
    setShowBatchMenu(false);
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      active: { label: '在职', color: 'bg-green-100 text-green-700' },
      inactive: { label: '待入职', color: 'bg-yellow-100 text-yellow-700' },
      resigned: { label: '已离职', color: 'bg-gray-100 text-gray-700' },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const renderDeptTree = (depts: Department[], level = 0) => {
    return depts.map(dept => {
      const hasChildren = dept.children && dept.children.length > 0;
      const isExpanded = expandedDepts[dept.id];
      const isSelected = selectedDeptId === dept.id;
      const hasSelectedChild = hasChildren && dept.children?.some(child => child.id === selectedDeptId);

      return (
        <div key={dept.id}>
          <div
            className={`flex items-center px-2 py-2 cursor-pointer rounded-lg mx-1 transition-colors ${
              isSelected || hasSelectedChild ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => selectDept(dept.id)}
          >
            {hasChildren ? (
              <button
                onClick={(e) => { e.stopPropagation(); toggleDept(dept.id); }}
                className="p-0.5 hover:bg-gray-200 rounded mr-1"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="w-6" />
            )}
            <Building2 size={16} className="mr-2 text-gray-400" />
            <span className="text-sm flex-1 truncate">{dept.name}</span>
            {dept.employeeCount !== undefined && (
              <span className="text-xs text-gray-400">{dept.employeeCount}</span>
            )}
          </div>
          {hasChildren && isExpanded && (
            <div>{renderDeptTree(dept.children!, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800 flex items-center">
            <Building2 size={18} className="mr-2 text-blue-600" />
            组织架构
          </h3>
        </div>
        <div className="p-2 border-b border-gray-100">
          <div
            className={`flex items-center px-2 py-2 cursor-pointer rounded-lg mx-1 transition-colors ${
              selectedDeptId === null ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => selectDept(null)}
          >
            <Users size={16} className="mr-2" />
            <span className="text-sm">全部员工</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {renderDeptTree(departments)}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
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
                <select className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="">全部状态</option>
                  <option value="active">在职</option>
                  <option value="inactive">待入职</option>
                  <option value="resigned">已离职</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedEmployees.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowBatchMenu(!showBatchMenu)}
                    className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100"
                  >
                    <MoreHorizontal size={16} className="mr-1" />
                    批量操作 ({selectedEmployees.length})
                  </button>
                  {showBatchMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-36">
                      <button
                        onClick={handleBatchTransfer}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <ArrowRightLeft size={14} className="mr-2" />
                        批量调岗
                      </button>
                      <button
                        onClick={handleBatchExport}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <FileText size={14} className="mr-2" />
                        批量导出
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Download size={16} className="mr-1" />
                导出
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <button
                    onClick={toggleSelectAll}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedEmployees.length === employees.length && employees.length > 0
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {selectedEmployees.length === employees.length && employees.length > 0 && <Check size={12} />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">员工</th>
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
                const isSelected = selectedEmployees.includes(emp.id);
                return (
                  <tr key={emp.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelectEmployee(emp.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">{emp.name.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.employee_no} · {emp.phone}</p>
                        </div>
                      </div>
                    </td>
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
                          className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                          title="查看详情"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                          title="调岗"
                        >
                          <ArrowRightLeft size={16} />
                        </button>
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
            共 {total} 人
            {selectedDeptId && ` · 当前部门 ${employees.length} 人`}
            {selectedEmployees.length > 0 && ` · 已选 ${selectedEmployees.length} 人`}
          </p>
        </div>
      </div>
    </div>
  );
}
