import { useState } from 'react';
import { 
  Building2, 
  Users, 
  Clock, 
  BarChart3, 
  ChevronDown, 
  ChevronRight,
  Home,
  FileText,
  Calendar,
  Settings,
  DollarSign
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: '首页',
    icon: <Home size={20} />,
    path: '/',
  },
  {
    key: 'organization',
    label: '组织架构',
    icon: <Building2 size={20} />,
    children: [
      { key: 'department-tree', label: '部门管理', icon: <FileText size={16} />, path: '/organization/department' },
      { key: 'employee-list', label: '员工列表', icon: <Users size={16} />, path: '/organization/employee' },
    ],
  },
  {
    key: 'employee',
    label: '员工档案',
    icon: <Users size={20} />,
    children: [
      { key: 'archive', label: '档案管理', icon: <FileText size={16} />, path: '/employee/archive' },
      { key: 'entry', label: '入职管理', icon: <Calendar size={16} />, path: '/employee/entry' },
      { key: 'transfer', label: '调岗管理', icon: <FileText size={16} />, path: '/employee/transfer' },
      { key: 'resign', label: '离职管理', icon: <FileText size={16} />, path: '/employee/resign' },
    ],
  },
  {
    key: 'attendance',
    label: '考勤管理',
    icon: <Clock size={20} />,
    children: [
      { key: 'attendance-record', label: '打卡记录', icon: <Clock size={16} />, path: '/attendance/records' },
      { key: 'attendance-summary', label: '考勤核算', icon: <BarChart3 size={16} />, path: '/attendance/summary' },
      { key: 'leave', label: '请假管理', icon: <Calendar size={16} />, path: '/attendance/leave' },
      { key: 'overtime', label: '加班管理', icon: <Clock size={16} />, path: '/attendance/overtime' },
      { key: 'fieldwork', label: '外勤管理', icon: <FileText size={16} />, path: '/attendance/fieldwork' },
      { key: 'appeal', label: '申诉审批', icon: <FileText size={16} />, path: '/attendance/appeal' },
    ],
  },
  {
    key: 'performance',
    label: '绩效管理',
    icon: <BarChart3 size={20} />,
    children: [
      { key: 'template', label: '考核模板', icon: <FileText size={16} />, path: '/performance/template' },
      { key: 'review', label: '考核管理', icon: <BarChart3 size={16} />, path: '/performance/review' },
      { key: 'result', label: '考核结果', icon: <BarChart3 size={16} />, path: '/performance/result' },
      { key: 'salary', label: '薪酬档位', icon: <Settings size={16} />, path: '/performance/salary' },
      { key: 'adjustment', label: '调薪管理', icon: <DollarSign size={16} />, path: '/performance/adjustment' },
    ],
  },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleMenu = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = !collapsed[item.key];
    const hasActiveChild = hasChildren && item.children?.some(child => isActive(child.path));

    return (
      <div key={item.key}>
        <div
          className={cn(
            'flex items-center px-4 py-2.5 cursor-pointer transition-colors rounded-lg mx-2',
            isActive(item.path) 
              ? 'bg-blue-50 text-blue-600 font-medium' 
              : 'text-gray-700 hover:bg-gray-100',
            level > 0 && 'pl-10'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.key);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          <span className="ml-3 flex-1 truncate">{item.label}</span>
          {hasChildren && (
            <span className="flex-shrink-0">
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </div>
        {hasChildren && isOpen && (
          <div className="mt-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-gray-200">
          <Building2 className="text-blue-600" size={28} />
          <span className="ml-3 text-lg font-bold text-gray-800">人事管理系统</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">管理员</p>
              <p className="text-xs text-gray-500">admin@company.com</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center">
            <h1 className="text-lg font-medium text-gray-800">
              {getCurrentPageTitle(location.pathname)}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={20} className="text-gray-500" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function getCurrentPageTitle(path: string): string {
  const pageMap: Record<string, string> = {
    '/': '首页',
    '/organization/department': '部门管理',
    '/organization/employee': '员工列表',
    '/employee/archive': '档案管理',
    '/employee/entry': '入职管理',
    '/employee/transfer': '调岗管理',
    '/employee/resign': '离职管理',
    '/attendance/records': '打卡记录',
    '/attendance/summary': '考勤核算',
    '/attendance/leave': '请假管理',
    '/attendance/overtime': '加班管理',
    '/attendance/fieldwork': '外勤管理',
    '/attendance/appeal': '申诉审批',
    '/performance/template': '考核模板',
    '/performance/review': '考核管理',
    '/performance/result': '考核结果',
    '/performance/salary': '薪酬档位',
    '/performance/adjustment': '调薪管理',
  };
  return pageMap[path] || '人事管理系统';
}
