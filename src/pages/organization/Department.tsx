import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Users,
  Building2,
  MoreHorizontal,
  Download,
  ArrowRightLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Department {
  id: number;
  name: string;
  parent_id: number | null;
  description: string;
  sort_order: number;
  employeeCount: number;
  children?: Department[];
}

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1]));
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    parent_id: null as number | null,
    description: '',
    sort_order: 0,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

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

  const getMockDepartments = (): Department[] => [
    {
      id: 1,
      name: '总经办',
      parent_id: null,
      description: '公司最高管理层',
      sort_order: 1,
      employeeCount: 3,
      children: [
        {
          id: 2,
          name: '人力资源部',
          parent_id: 1,
          description: '负责人力资源管理',
          sort_order: 2,
          employeeCount: 5,
          children: [],
        },
        {
          id: 3,
          name: '财务部',
          parent_id: 1,
          description: '负责财务管理',
          sort_order: 3,
          employeeCount: 4,
          children: [],
        },
        {
          id: 4,
          name: '技术部',
          parent_id: 1,
          description: '负责技术研发',
          sort_order: 4,
          employeeCount: 20,
          children: [
            {
              id: 6,
              name: '前端组',
              parent_id: 4,
              description: '前端开发团队',
              sort_order: 1,
              employeeCount: 8,
              children: [],
            },
            {
              id: 7,
              name: '后端组',
              parent_id: 4,
              description: '后端开发团队',
              sort_order: 2,
              employeeCount: 7,
              children: [],
            },
            {
              id: 8,
              name: '测试组',
              parent_id: 4,
              description: '测试团队',
              sort_order: 3,
              employeeCount: 5,
              children: [],
            },
          ],
        },
        {
          id: 5,
          name: '市场部',
          parent_id: 1,
          description: '负责市场营销',
          sort_order: 5,
          employeeCount: 6,
          children: [],
        },
      ],
    },
  ];

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAdd = (parentId: number | null = null) => {
    setEditingDept(null);
    setFormData({ name: '', parent_id: parentId, description: '', sort_order: 0 });
    setShowModal(true);
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      parent_id: dept.parent_id,
      description: dept.description,
      sort_order: dept.sort_order,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该部门吗？')) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchDepartments();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('请输入部门名称');
      return;
    }

    try {
      const url = editingDept 
        ? `/api/departments/${editingDept.id}`
        : '/api/departments';
      const method = editingDept ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchDepartments();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const renderDeptNode = (dept: Department, level = 0) => {
    const hasChildren = dept.children && dept.children.length > 0;
    const isExpanded = expanded.has(dept.id);
    const isSelected = selectedDept === dept.id;

    return (
      <div key={dept.id}>
        <div
          className={cn(
            'flex items-center py-2 px-3 cursor-pointer rounded-lg transition-colors group',
            isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50',
            level > 0 && 'ml-6'
          )}
          onClick={() => setSelectedDept(dept.id)}
        >
          <span
            className="flex-shrink-0 mr-2 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleExpand(dept.id);
            }}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
            ) : (
              <span className="inline-block w-[18px]" />
            )}
          </span>
          <Building2 size={20} className={cn('flex-shrink-0', isSelected ? 'text-blue-600' : 'text-gray-500')} />
          <span className={cn('ml-2 flex-1 font-medium', isSelected ? 'text-blue-700' : 'text-gray-700')}>
            {dept.name}
          </span>
          <span className="text-sm text-gray-500 flex items-center mr-2">
            <Users size={14} className="mr-1" />
            {dept.employeeCount}
          </span>
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-1 hover:bg-gray-200 rounded"
              onClick={(e) => { e.stopPropagation(); handleAdd(dept.id); }}
              title="添加子部门"
            >
              <Plus size={16} className="text-gray-500" />
            </button>
            <button
              className="p-1 hover:bg-gray-200 rounded"
              onClick={(e) => { e.stopPropagation(); handleEdit(dept); }}
              title="编辑"
            >
              <Edit2 size={16} className="text-gray-500" />
            </button>
            <button
              className="p-1 hover:bg-red-100 rounded"
              onClick={(e) => { e.stopPropagation(); handleDelete(dept.id); }}
              title="删除"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {dept.children!.map(child => renderDeptNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex gap-6 h-full">
      <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">组织架构</h3>
          <button
            onClick={() => handleAdd(null)}
            className="flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            新增部门
          </button>
        </div>
        <div className="flex-1 overflow-auto space-y-1">
          {departments.map(dept => renderDeptNode(dept))}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">部门详情</h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedDept ? '查看和管理部门信息' : '请选择一个部门查看详情'}
            </p>
          </div>
          {selectedDept && (
            <div className="flex space-x-2">
              <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Download size={16} className="mr-1" />
                导出
              </button>
              <button className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <ArrowRightLeft size={16} className="mr-1" />
                批量调动
              </button>
            </div>
          )}
        </div>

        {selectedDept ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">部门名称</p>
                <p className="text-lg font-medium text-gray-800 mt-1">技术部</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">上级部门</p>
                <p className="text-lg font-medium text-gray-800 mt-1">总经办</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">部门人数</p>
                <p className="text-lg font-medium text-gray-800 mt-1">20 人</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">排序</p>
                <p className="text-lg font-medium text-gray-800 mt-1">4</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">部门描述</p>
              <p className="text-gray-700">负责公司技术研发工作，包括前端开发、后端开发、软件测试等。</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3">部门成员</h4>
              <div className="space-y-2">
                {['赵六 - 技术总监', '孙八 - 高级前端工程师', '周九 - 高级后端工程师', '吴十 - 测试工程师'].map((name, idx) => (
                  <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users size={14} className="text-blue-600" />
                    </div>
                    <span className="ml-3 text-gray-700">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Building2 size={48} />
            <p className="mt-3">请选择左侧部门查看详情</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingDept ? '编辑部门' : '新增部门'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">部门名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入部门名称"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">上级部门</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">无（顶级部门）</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">部门描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="请输入部门描述"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">排序</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
