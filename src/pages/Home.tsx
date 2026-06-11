import { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Clock, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar
} from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

export default function Home() {
  const [stats, setStats] = useState<StatCard[]>([]);

  useEffect(() => {
    setStats([
      {
        title: '员工总数',
        value: '156',
        change: '+12',
        changeType: 'up',
        icon: <Users size={24} />,
        color: 'bg-blue-500',
      },
      {
        title: '部门数量',
        value: '12',
        change: '+2',
        changeType: 'up',
        icon: <Building2 size={24} />,
        color: 'bg-green-500',
      },
      {
        title: '本月出勤率',
        value: '96.8%',
        change: '+1.2%',
        changeType: 'up',
        icon: <Clock size={24} />,
        color: 'bg-purple-500',
      },
      {
        title: '绩效考核完成率',
        value: '85%',
        change: '-3%',
        changeType: 'down',
        icon: <BarChart3 size={24} />,
        color: 'bg-orange-500',
      },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'up' ? (
                    <TrendingUp size={14} className="text-green-500" />
                  ) : (
                    <TrendingDown size={14} className="text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${stat.changeType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change} 较上月
                  </span>
                </div>
              </div>
              <div className={`${stat.color} text-white p-3 rounded-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">最近入职员工</h3>
          <div className="space-y-4">
            {[
              { name: '郑十一', dept: '前端组', position: '前端工程师', date: '2024-06-01' },
              { name: '冯十二', dept: '人力资源部', position: 'HR专员', date: '2024-06-15' },
              { name: '陈十三', dept: '后端组', position: '后端工程师', date: '2024-07-01' },
            ].map((emp, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users size={18} className="text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{emp.name}</p>
                    <p className="text-sm text-gray-500">{emp.dept} · {emp.position}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  <Calendar size={14} className="inline mr-1" />
                  {emp.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">待办事项</h3>
          <div className="space-y-3">
            {[
              { title: '待审批请假申请', count: 3, type: 'leave' },
              { title: '待审批加班申请', count: 5, type: 'overtime' },
              { title: '待处理考勤申诉', count: 2, type: 'appeal' },
              { title: '待完成绩效考核', count: 8, type: 'performance' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{item.title}</span>
                <span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-sm font-medium">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">考勤概览 - 本月</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: '正常出勤', value: '18.5', unit: '天' },
            { label: '迟到', value: '3', unit: '次' },
            { label: '早退', value: '1', unit: '次' },
            { label: '请假', value: '2', unit: '天' },
            { label: '加班', value: '12', unit: '小时' },
            { label: '外勤', value: '3', unit: '天' },
          ].map((item, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">
                {item.value}
                <span className="text-sm font-normal text-gray-500 ml-1">{item.unit}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
