import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar,
  Calculator,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  FileText
} from 'lucide-react';

interface AttendanceSummary {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_no: string;
  department_name: string;
  work_days: number;
  actual_work_days: number;
  late_count: number;
  early_leave_count: number;
  absent_count: number;
  leave_days: number;
  overtime_hours: number;
  fieldwork_days: number;
  normal_days: number;
  status: string;
}

export default function AttendanceSummary() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [departmentId, setDepartmentId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchSummaries();
  }, [year, month, departmentId, keyword]);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        year: String(year),
        month: String(month),
      });
      if (departmentId) params.append('departmentId', departmentId);

      const res = await fetch(`/api/attendance/summary?${params}`);
      const data = await res.json();
      if (data.success) {
        setSummaries(data.data);
      }
    } catch (error) {
      console.error('获取考勤汇总失败:', error);
      setSummaries(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): AttendanceSummary[] => [
    { id: 1, employee_id: 1, employee_name: '张三', employee_no: 'EMP001', department_name: '总经办', work_days: 21, actual_work_days: 20.5, late_count: 0, early_leave_count: 0, absent_count: 0, leave_days: 0.5, overtime_hours: 8, fieldwork_days: 2, normal_days: 20, status: 'calculated' },
    { id: 2, employee_id: 2, employee_name: '李四', employee_no: 'EMP002', department_name: '人力资源部', work_days: 21, actual_work_days: 19, late_count: 2, early_leave_count: 1, absent_count: 0, leave_days: 2, overtime_hours: 4, fieldwork_days: 1, normal_days: 17, status: 'calculated' },
    { id: 3, employee_id: 3, employee_name: '王五', employee_no: 'EMP003', department_name: '财务部', work_days: 21, actual_work_days: 21, late_count: 0, early_leave_count: 0, absent_count: 0, leave_days: 0, overtime_hours: 2, fieldwork_days: 0, normal_days: 21, status: 'calculated' },
    { id: 4, employee_id: 4, employee_name: '赵六', employee_no: 'EMP004', department_name: '技术部', work_days: 21, actual_work_days: 18.5, late_count: 1, early_leave_count: 0, absent_count: 1, leave_days: 1, overtime_hours: 24, fieldwork_days: 0, normal_days: 18, status: 'calculated' },
    { id: 5, employee_id: 6, employee_name: '孙八', employee_no: 'EMP006', department_name: '前端组', work_days: 21, actual_work_days: 17, late_count: 3, early_leave_count: 2, absent_count: 0, leave_days: 2, overtime_hours: 16, fieldwork_days: 0, normal_days: 15, status: 'calculated' },
    { id: 6, employee_id: 7, employee_name: '周九', employee_no: 'EMP007', department_name: '后端组', work_days: 21, actual_work_days: 20, late_count: 1, early_leave_count: 0, absent_count: 0, leave_days: 1, overtime_hours: 20, fieldwork_days: 0, normal_days: 19, status: 'calculated' },
  ];

  const handleCalculate = async () => {
    if (!confirm(`确定要核算 ${year}年${month}月 的考勤吗？`)) return;
    
    setCalculating(true);
    try {
      const res = await fetch('/api/attendance/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, departmentId: departmentId || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        alert('考勤核算完成');
        fetchSummaries();
      } else {
        alert(data.error || '核算失败');
      }
    } catch (error) {
      alert('核算失败');
    } finally {
      setCalculating(false);
    }
  };

  const getStatusBadge = (item: AttendanceSummary) => {
    if (item.absent_count > 0) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center"><XCircle size={12} className="mr-1" />有旷工</span>;
    }
    if (item.late_count > 2 || item.early_leave_count > 2) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center"><AlertTriangle size={12} className="mr-1" />异常较多</span>;
    }
    if (item.late_count === 0 && item.early_leave_count === 0 && item.absent_count === 0) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center"><CheckCircle size={12} className="mr-1" />全勤</span>;
    }
    return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center"><Clock size={12} className="mr-1" />正常</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-400" />
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}月</option>
                ))}
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

            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索员工姓名/工号"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Download size={16} className="mr-1" />
              导出报表
            </button>
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              <Calculator size={16} className="mr-1" />
              {calculating ? '核算中...' : '开始核算'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: '应出勤天数', value: '21天', color: 'text-gray-700' },
            { label: '实际出勤', value: '19.5天', color: 'text-blue-600' },
            { label: '迟到次数', value: '8次', color: 'text-yellow-600' },
            { label: '早退次数', value: '3次', color: 'text-orange-600' },
            { label: '旷工天数', value: '1天', color: 'text-red-600' },
            { label: '加班时长', value: '74小时', color: 'text-purple-600' },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <p className={`text-lg font-semibold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">员工</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">部门</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">应出勤</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">实际出勤</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">迟到</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">早退</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">旷工</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">请假</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">加班(h)</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">外勤</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500">加载中...</td>
              </tr>
            ) : (
              summaries.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">{item.employee_name.charAt(0)}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{item.employee_name}</p>
                        <p className="text-xs text-gray-500">{item.employee_no}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.department_name}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">{item.work_days}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">{item.actual_work_days}</td>
                  <td className="px-4 py-3 text-center text-sm">
                    <span className={item.late_count > 0 ? 'text-yellow-600 font-medium' : 'text-gray-700'}>
                      {item.late_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    <span className={item.early_leave_count > 0 ? 'text-orange-600 font-medium' : 'text-gray-700'}>
                      {item.early_leave_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    <span className={item.absent_count > 0 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                      {item.absent_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">{item.leave_days}</td>
                  <td className="px-4 py-3 text-center text-sm text-purple-600 font-medium">{item.overtime_hours}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">{item.fieldwork_days}</td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(item)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
