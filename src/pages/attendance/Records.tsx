import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';

interface PunchRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_no: string;
  department_name: string;
  punch_date: string;
  punch_in: string;
  punch_out: string;
  shift_name: string;
  work_start: string;
  work_end: string;
  status: string;
  late_minutes: number;
  early_leave_minutes: number;
  punch_in_location?: string;
  punch_out_location?: string;
}

export default function AttendanceRecords() {
  const [records, setRecords] = useState<PunchRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [page, keyword, status, date, departmentId]);

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        date,
      });
      if (keyword) params.append('keyword', keyword);
      if (status) params.append('status', status);
      if (departmentId) params.append('departmentId', departmentId);

      const res = await fetch(`/api/attendance/records?${params}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.list || []);
        setTotal(data.data.total || 0);
      }
    } catch (error) {
      console.error('获取打卡记录失败:', error);
      setRecords(getMockData());
      setTotal(120);
    }
  };

  const getMockData = (): PunchRecord[] => {
    const employees = [
      { id: 1, name: '张三', no: 'EMP001', dept: '总经办' },
      { id: 2, name: '李四', no: 'EMP002', dept: '人力资源部' },
      { id: 3, name: '王五', no: 'EMP003', dept: '财务部' },
      { id: 4, name: '赵六', no: 'EMP004', dept: '技术部' },
      { id: 5, name: '钱七', no: 'EMP005', dept: '市场部' },
      { id: 6, name: '孙八', no: 'EMP006', dept: '前端组' },
      { id: 7, name: '周九', no: 'EMP007', dept: '后端组' },
      { id: 8, name: '吴十', no: 'EMP008', dept: '测试组' },
      { id: 9, name: '郑十一', no: 'EMP009', dept: '前端组' },
      { id: 10, name: '冯十二', no: 'EMP010', dept: '人力资源部' },
    ];
    return employees.map((emp, idx) => {
      const isLate = idx === 2 || idx === 5;
      const isEarly = idx === 5;
      const isAbsent = idx === 7;
      let status = 'normal';
      let lateMin = 0;
      let earlyMin = 0;
      if (isAbsent) status = 'absent';
      else if (isLate && isEarly) status = 'late_early';
      else if (isLate) status = 'late';
      else if (isEarly) status = 'early_leave';
      if (isLate) lateMin = 15 + idx * 5;
      if (isEarly) earlyMin = 20 + idx * 3;
      return {
        id: idx + 1,
        employee_id: emp.id,
        employee_name: emp.name,
        employee_no: emp.no,
        department_name: emp.dept,
        punch_date: date,
        punch_in: isAbsent ? '' : `09:${String(lateMin > 0 ? lateMin : '00').padStart(2, '0')}`,
        punch_out: isAbsent ? '' : `18:${String(earlyMin > 0 ? 30 - earlyMin : '00').padStart(2, '0')}`,
        shift_name: '早班',
        work_start: '09:00',
        work_end: '18:00',
        status,
        late_minutes: lateMin,
        early_leave_minutes: earlyMin,
        punch_in_location: '公司总部A座',
        punch_out_location: '公司总部A座',
      };
    });
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      normal: { label: '正常', color: 'text-green-600 bg-green-50', icon: <CheckCircle size={14} /> },
      late: { label: '迟到', color: 'text-yellow-600 bg-yellow-50', icon: <AlertTriangle size={14} /> },
      early_leave: { label: '早退', color: 'text-orange-600 bg-orange-50', icon: <AlertTriangle size={14} /> },
      late_early: { label: '迟到+早退', color: 'text-red-600 bg-red-50', icon: <AlertTriangle size={14} /> },
      absent: { label: '旷工', color: 'text-red-600 bg-red-50', icon: <XCircle size={14} /> },
      leave: { label: '请假', color: 'text-blue-600 bg-blue-50', icon: <CheckCircle size={14} /> },
      fieldwork: { label: '外勤', color: 'text-purple-600 bg-purple-50', icon: <MapPin size={14} /> },
    };
    return map[status] || { label: status, color: 'text-gray-600 bg-gray-50', icon: null };
  };

  const totalPages = Math.ceil(total / pageSize);

  const stats = [
    { label: '应打卡人数', value: '156' },
    { label: '正常打卡', value: '142', color: 'text-green-600' },
    { label: '迟到', value: '8', color: 'text-yellow-600' },
    { label: '早退', value: '3', color: 'text-orange-600' },
    { label: '旷工', value: '2', color: 'text-red-600' },
    { label: '请假/外勤', value: '11', color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

            <div className="flex items-center space-x-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部状态</option>
                <option value="normal">正常</option>
                <option value="late">迟到</option>
                <option value="early_leave">早退</option>
                <option value="absent">旷工</option>
                <option value="leave">请假</option>
                <option value="fieldwork">外勤</option>
              </select>
            </div>

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

            <div className="ml-auto flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Download size={16} className="mr-1" />
                导出
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((item, idx) => (
              <div key={idx} className="text-center">
                <p className={`text-xl font-semibold ${item.color || 'text-gray-800'}`}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
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
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">班次</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">上班打卡</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">下班打卡</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">迟到(分)</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">早退(分)</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
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
                      <span className="text-sm text-gray-700">{record.shift_name}</span>
                      <p className="text-xs text-gray-400">{record.work_start}-{record.work_end}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <Clock size={14} className="text-gray-400 mr-1" />
                        <span className={`text-sm font-medium ${record.status === 'late' || record.status === 'late_early' ? 'text-yellow-600' : 'text-gray-800'}`}>
                          {record.punch_in || '--'}
                        </span>
                      </div>
                      {record.punch_in_location && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center justify-center">
                          <MapPin size={12} className="mr-1" />
                          {record.punch_in_location}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <Clock size={14} className="text-gray-400 mr-1" />
                        <span className={`text-sm font-medium ${record.status === 'early_leave' || record.status === 'late_early' ? 'text-orange-600' : 'text-gray-800'}`}>
                          {record.punch_out || '--'}
                        </span>
                      </div>
                      {record.punch_out_location && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center justify-center">
                          <MapPin size={12} className="mr-1" />
                          {record.punch_out_location}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm ${record.late_minutes > 0 ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                        {record.late_minutes > 0 ? record.late_minutes : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm ${record.early_leave_minutes > 0 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                        {record.early_leave_minutes > 0 ? record.early_leave_minutes : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.label}</span>
                      </span>
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
    </div>
  );
}
