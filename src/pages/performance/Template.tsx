import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye,
  Edit2,
  Trash2,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
  BarChart3,
  GripVertical
} from 'lucide-react';

interface PerformanceTemplate {
  id: number;
  name: string;
  description: string;
  dimension_count: number;
  total_weight: number;
  status: string;
  created_at: string;
  updated_at: string;
  dimensions?: TemplateDimension[];
}

interface TemplateDimension {
  id: number;
  name: string;
  weight: number;
  description: string;
  sort_order: number;
}

export default function PerformanceTemplate() {
  const [templates, setTemplates] = useState<PerformanceTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PerformanceTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dimensions: [] as TemplateDimension[],
  });

  const [newDimension, setNewDimension] = useState({
    name: '',
    weight: 0,
    description: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, [page, keyword]);

  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (keyword) params.append('keyword', keyword);

      const res = await fetch(`/api/performance/templates?${params}`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data.list || []);
        setTotal(data.data.total || 0);
      }
    } catch (error) {
      console.error('获取考核模板失败:', error);
      setTemplates(getMockData());
      setTotal(4);
    }
  };

  const getMockData = (): PerformanceTemplate[] => [
    {
      id: 1,
      name: '季度绩效考核模板',
      description: '适用于全员季度绩效考核，包含工作业绩、工作能力、工作态度三个维度',
      dimension_count: 3,
      total_weight: 100,
      status: 'active',
      created_at: '2024-01-15',
      updated_at: '2024-06-20',
    },
    {
      id: 2,
      name: '年度绩效考核模板',
      description: '适用于全员年度绩效考核，多维度综合评估',
      dimension_count: 5,
      total_weight: 100,
      status: 'active',
      created_at: '2024-01-10',
      updated_at: '2024-05-15',
    },
    {
      id: 3,
      name: '试用期考核模板',
      description: '新员工试用期转正考核模板',
      dimension_count: 4,
      total_weight: 100,
      status: 'active',
      created_at: '2024-02-20',
      updated_at: '2024-03-01',
    },
    {
      id: 4,
      name: '管理层考核模板',
      description: '适用于部门经理及以上管理人员考核',
      dimension_count: 6,
      total_weight: 100,
      status: 'inactive',
      created_at: '2024-03-01',
      updated_at: '2024-04-10',
    },
  ];

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">启用中</span>
      : <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">已停用</span>;
  };

  const handleView = async (template: PerformanceTemplate) => {
    try {
      const res = await fetch(`/api/performance/templates/${template.id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedTemplate(data.data);
      }
    } catch (error) {
      setSelectedTemplate({
        ...template,
        dimensions: [
          { id: 1, name: '工作业绩', weight: 40, description: '工作任务完成情况、工作质量、工作效率', sort_order: 1 },
          { id: 2, name: '工作能力', weight: 30, description: '专业技能、学习能力、沟通能力、解决问题能力', sort_order: 2 },
          { id: 3, name: '工作态度', weight: 20, description: '责任心、团队协作、主动性、纪律性', sort_order: 3 },
          { id: 4, name: '创新能力', weight: 10, description: '创新思维、改进建议、流程优化', sort_order: 4 },
        ],
      });
    }
    setShowDetail(true);
    setEditMode(false);
  };

  const handleAdd = () => {
    setFormData({ name: '', description: '', dimensions: [] });
    setNewDimension({ name: '', weight: 0, description: '' });
    setEditMode(true);
    setShowAddModal(true);
  };

  const handleAddDimension = () => {
    if (!newDimension.name || newDimension.weight <= 0) {
      alert('请填写维度名称和权重');
      return;
    }
    const totalWeight = formData.dimensions.reduce((sum, d) => sum + d.weight, 0) + newDimension.weight;
    if (totalWeight > 100) {
      alert('权重总和不能超过100%');
      return;
    }
    setFormData({
      ...formData,
      dimensions: [...formData.dimensions, { ...newDimension, id: Date.now(), sort_order: formData.dimensions.length + 1 }],
    });
    setNewDimension({ name: '', weight: 0, description: '' });
  };

  const handleRemoveDimension = (id: number) => {
    setFormData({
      ...formData,
      dimensions: formData.dimensions.filter(d => d.id !== id).map((d, idx) => ({ ...d, sort_order: idx + 1 })),
    });
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('请填写模板名称');
      return;
    }
    if (formData.dimensions.length === 0) {
      alert('请至少添加一个考核维度');
      return;
    }
    const totalWeight = formData.dimensions.reduce((sum, d) => sum + d.weight, 0);
    if (totalWeight !== 100) {
      alert(`权重总和必须为100%，当前为${totalWeight}%`);
      return;
    }
    try {
      const res = await fetch('/api/performance/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert('模板创建成功');
        setShowAddModal(false);
        fetchTemplates();
      }
    } catch (error) {
      alert('创建失败，请稍后重试');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const totalWeight = formData.dimensions.reduce((sum, d) => sum + d.weight, 0);

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
                  placeholder="搜索模板名称..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                新建模板
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">模板名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">描述</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">维度数量</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">权重合计</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">更新时间</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FileText size={20} className="text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{template.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {template.description}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">{template.dimension_count} 个</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-blue-600">{template.total_weight}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(template.status)}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">{template.updated_at}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => handleView(template)}
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
                      <button
                        className="p-1.5 hover:bg-red-50 rounded text-red-500"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {(showAddModal || (showDetail && editMode)) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Settings size={20} className="mr-2 text-blue-600" />
                {showAddModal ? '新建考核模板' : '编辑考核模板'}
              </h3>
              <button onClick={() => { setShowAddModal(false); setEditMode(false); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">基本信息</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">模板名称 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入模板名称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">模板描述</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="请输入模板描述"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center justify-between">
                    <span className="flex items-center">
                      <BarChart3 size={18} className="mr-2" />
                      考核维度
                    </span>
                    <span className={`text-sm font-normal ${totalWeight === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                      权重合计：{totalWeight}%
                    </span>
                  </h4>

                  <div className="space-y-3 mb-4">
                    {formData.dimensions.map((dim, idx) => (
                      <div key={dim.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <GripVertical size={16} className="text-gray-400 mr-2" />
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {idx + 1}
                        </span>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-800">{dim.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{dim.description}</p>
                        </div>
                        <span className="text-sm font-medium text-blue-600 mr-3">{dim.weight}%</span>
                        <button
                          onClick={() => handleRemoveDimension(dim.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-500 mb-3">添加新维度</p>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <input
                          type="text"
                          value={newDimension.name}
                          onChange={(e) => setNewDimension({ ...newDimension, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="维度名称"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={newDimension.weight || ''}
                          onChange={(e) => setNewDimension({ ...newDimension, weight: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="权重(%)"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleAddDimension}
                          className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                        >
                          添加维度
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={newDimension.description}
                      onChange={(e) => setNewDimension({ ...newDimension, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="维度描述（可选）"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">
              <button
                onClick={() => { setShowAddModal(false); setEditMode(false); }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                保存模板
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedTemplate && !editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-4/5 max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">模板详情</h3>
              <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText size={24} className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-800">{selectedTemplate.name}</h4>
                  <p className="text-gray-500 text-sm">{selectedTemplate.description}</p>
                </div>
                {getStatusBadge(selectedTemplate.status)}
              </div>

              <div className="mb-6">
                <h5 className="font-medium text-gray-800 mb-3">考核维度</h5>
                <div className="space-y-3">
                  {selectedTemplate.dimensions?.map((dim, idx) => (
                    <div key={dim.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium mr-2">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-gray-800">{dim.name}</span>
                        </div>
                        <span className="text-blue-600 font-semibold">{dim.weight}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${dim.weight}%` }}
                        />
                      </div>
                      {dim.description && (
                        <p className="text-sm text-gray-500 mt-2">{dim.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <p>创建时间：{selectedTemplate.created_at}</p>
                <p>更新时间：{selectedTemplate.updated_at}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                关闭
              </button>
              <button
                onClick={() => { setEditMode(true); setFormData({ name: selectedTemplate.name, description: selectedTemplate.description, dimensions: selectedTemplate.dimensions || [] }); }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                编辑模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
