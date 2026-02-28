import React, { useState, useEffect, useCallback } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { ChevronDown, ChevronRight, Check, Heart, Loader2, Plus, Trash2, Edit2, X, MoreVertical, Filter } from 'lucide-react';
import { getCategories, updateCategory, deleteCategory, createCategory, initDefaultCategories, getBudget, updateBudget } from '../../api/client';
import {toast} from '../../lib/toast';

const statusLabels = {
  'not-started': 'Não iniciado',
  'negotiating': 'Em negociação',
  'contracted': 'Contratado',
  'paid': 'Pago',
  'completed': 'Concluído',
};

const WeddingBudgetManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [totalBudget, setTotalBudget] = useState(0);
  const [customBudget, setCustomBudget] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addToCategory, setAddToCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', type: '', estimatedCost: 0, status: 'not-started', parent: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [mobileActionMenu, setMobileActionMenu] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'summary'

  // Fetch budget and categories from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch budget
      const budgetResponse = await getBudget();
      if (budgetResponse.data.success) {
        setTotalBudget(budgetResponse.data.data.totalBudget || 0);
        setCustomBudget(budgetResponse.data.data.totalBudget || null);
      }
      
      // Fetch categories
      const categoriesResponse = await getCategories();
      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.data);
        // Auto-expand all categories by default
        const expanded = {};
        categoriesResponse.data.data.forEach(cat => {
          expanded[cat._id] = true;
        });
        setExpandedCategories(expanded);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 404 || error.response?.data?.message?.includes('não')) {
        try {
          await initDefaultCategories();
          const categoriesResponse = await getCategories();
          if (categoriesResponse.data.success) {
            setCategories(categoriesResponse.data.data);
            const expanded = {};
            categoriesResponse.data.data.forEach(cat => {
              expanded[cat._id] = true;
            });
            setExpandedCategories(expanded);
            toast.success('Categorias padrão criadas com sucesso!');
          }
        } catch (initError) {
          console.error('Error initializing categories:', initError);
          toast.error('Erro ao carregar dados');
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle budget change and save to database
  const handleBudgetChange = async (newBudget) => {
    try {
      setTotalBudget(newBudget);
      setCustomBudget(newBudget);
      await updateBudget({ totalBudget: newBudget });
      toast.success('Orçamento atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Erro ao salvar orçamento');
    }
  };

  // Calculate totals from subcategories only
  const flatSubcategories = categories.flatMap(cat => 
    cat.subcategories ? cat.subcategories.map(sub => ({ ...sub, parentName: cat.name, parentId: cat._id })) : []
  );

  const totalBudgeted = flatSubcategories.reduce((sum, cat) => sum + (cat.estimatedCost || 0), 0);
  const totalActual = flatSubcategories.reduce((sum, cat) => sum + (cat.finalCost || 0), 0);
  const remaining = totalBudget - totalActual;
  const difference = totalBudget - totalBudgeted;

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Handle editing a subcategory
  const handleEdit = (subcategory) => {
    setEditingSubcategory(subcategory._id);
    setEditForm({
      estimatedCost: subcategory.estimatedCost ?? 0,
      finalCost: subcategory.finalCost ?? 0,
      status: subcategory.status || 'not-started',
    });
    setMobileActionMenu(null);
  };

  const handleSaveEdit = async (subcategoryId) => {
    try {
      // Convert null to 0 before sending to database (backend requires a number)
      const dataToSend = {
        estimatedCost: editForm.estimatedCost ?? 0,
        finalCost: editForm.finalCost ?? 0,
        status: editForm.status,
      };
      const response = await updateCategory(subcategoryId, dataToSend);
      if (response.data.success) {
        toast.success('Subcategoria atualizada com sucesso!');
        // Update state locally instead of reloading
        setCategories(prevCategories => {
          return prevCategories.map(cat => {
            if (cat.subcategories) {
              return {
                ...cat,
                subcategories: cat.subcategories.map(sub => 
                  sub._id === subcategoryId ? { ...sub, ...editForm } : sub
                )
              };
            }
            return cat;
          });
        });
        setEditingSubcategory(null);
        setEditForm({});
      }
    } catch (error) {
      console.error('Error updating subcategory:', error);
      toast.error('Erro ao atualizar subcategoria');
    }
  };

  const handleCancelEdit = () => {
    setEditingSubcategory(null);
    setEditForm({});
  };

  // Handle adding a new subcategory
  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    try {
      // Convert null to 0 before sending to database (backend requires a number)
      const dataToSend = {
        ...newCategory,
        estimatedCost: newCategory.estimatedCost ?? 0,
      };
      const response = await createCategory(dataToSend);
      if (response.data.success) {
        toast.success('Subcategoria criada com sucesso!');
        // Update state locally instead of reloading
        const newSubcategory = response.data.data;
        setCategories(prevCategories => {
          return prevCategories.map(cat => {
            if (cat._id === newCategory.parent) {
              return {
                ...cat,
                subcategories: [...(cat.subcategories || []), newSubcategory]
              };
            }
            return cat;
          });
        });
        setShowAddModal(false);
        setNewCategory({ name: '', type: '', estimatedCost: null, status: 'not-started', parent: null });
      }
    } catch (error) {
      console.error('Error creating subcategory:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar subcategoria');
    }
  };

  // Open add modal for a specific category (from button inside each category)
  const openAddModalForCategory = (category) => {
    setNewCategory({
      name: '',
      type: category.type,
      estimatedCost: null,
      status: 'not-started',
      parent: category._id
    });
    setShowAddModal(true);
  };

  // Open add modal with empty values (for global buttons)
  const openAddModalEmpty = () => {
    setNewCategory({ name: '', type: '', estimatedCost: null, status: 'not-started', parent: null });
    setShowAddModal(true);
  };

  // Handle parent category change in modal
  const handleParentChange = (parentId) => {
    const parent = categories.find(c => c._id === parentId);
    setNewCategory({
      ...newCategory,
      parent: parentId,
      type: parent ? parent.type : ''
    });
  };

  // Handle deleting a subcategory
  const handleDelete = async (subcategoryId) => {
    setDeleteConfirm(subcategoryId);
    setMobileActionMenu(null);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      const response = await deleteCategory(deleteConfirm);
      if (response.data.success) {
        toast.success('Subcategoria excluída com sucesso!');
        // Update state locally instead of reloading
        setCategories(prevCategories => {
          return prevCategories.map(cat => {
            if (cat.subcategories) {
              return {
                ...cat,
                subcategories: cat.subcategories.filter(sub => sub._id !== deleteConfirm)
              };
            }
            return cat;
          });
        });
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir subcategoria');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const formatCurrency = (value) => {
    return `MT ${(value || 0).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'negotiating':
        return 'bg-yellow-500 text-white';
      case 'contracted':
        return 'bg-blue-500 text-white';
      case 'paid':
        return 'bg-green-500 text-white';
      case 'completed':
        return 'bg-purple-500 text-white';
      case 'not-started':
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'negotiating':
        return '🤝';
      case 'contracted':
        return '📝';
      case 'paid':
        return '💰';
      case 'completed':
        return '✅';
      case 'not-started':
      default:
        return '⏳';
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Tabs */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-1">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-center ${
                activeTab === 'categories'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-transparent text-gray-600'
              }`}
            >
              Categorias
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-center ${
                activeTab === 'summary'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-transparent text-gray-600'
              }`}
            >
              Resumo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:-translate-y-[70px] bg-gray-50 p-3 rounded-2xl">
          {/* Left Column - Budget Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
              {/* Budget Header */}
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 justify-between mb-4">
                  <span className="text-gray-700 font-medium">Orçamento total do casamento</span>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-none">
                        <select 
                          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                          value={totalBudget || ''}
                          onChange={(e) => handleBudgetChange(Number(e.target.value))}
                        >
                          <option value="">Definir orçamento</option>
                          <option value={300000}>MT 300,000</option>
                          <option value={400000}>MT 400,000</option>
                          <option value={500000}>MT 500,000</option>
                          <option value={600000}>MT 600,000</option>
                          <option value={700000}>MT 700,000</option>
                          <option value={800000}>MT 800,000</option>
                          <option value={1000000}>MT 1,000,000</option>
                          <option value={1500000}>MT 1,500,000</option>
                          <option value={2000000}>MT 2,000,000</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                      <span className="text-gray-400 text-sm">ou</span>
                      <div className="relative flex-1 sm:flex-none">
                        <input
                          type="number"
                          className="w-full sm:w-28 px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Personalizado"
                          value={customBudget || ''}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null;
                            setCustomBudget(value);
                            if (value) handleBudgetChange(value);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0}%` }}
                  ></div>
                </div>

                {/* Budget Summary - Mobile friendly */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-2">
                  <div className="text-sm text-gray-600">
                    Total previsto: <span className="font-semibold text-gray-900">{formatCurrency(totalBudgeted)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Restam <span className="font-semibold text-gray-900">{formatCurrency(remaining)}</span>
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-4 flex items-center text-primary-500 bg-primary-50 p-3 rounded-lg">
                  <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="font-medium text-sm">
                    Você está MT {Math.abs(difference).toLocaleString()} {difference >= 0 ? 'abaixo' : 'acima'} do seu orçamento
                  </span>
                </div>
              </div>

              {/* Categories List - Only show when active on mobile */}
              {(activeTab === 'categories' || window.innerWidth >= 1024) && (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category._id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Category Header (clickable to expand/collapse) */}
                      <div 
                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                        onClick={() => toggleCategory(category._id)}
                      >
                        <div className="flex items-center space-x-3">
                          {expandedCategories[category._id] ? (
                            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                          <span className="font-semibold text-gray-900 text-base sm:text-lg">{category.name}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {category.subcategories?.length || 0} itens
                        </span>
                      </div>

                      {/* Subcategories (shown when expanded) */}
                      {expandedCategories[category._id] && (
                        <div className="border-t border-gray-200">
                          {category.subcategories && category.subcategories.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                              {/* Mobile View - Card Layout */}
                              <div className="block lg:hidden">
                                {category.subcategories.map((subcategory) => {
                                  const difference = (subcategory.estimatedCost || 0) - (subcategory.finalCost || 0);
                                  const isEditing = editingSubcategory === subcategory._id;
                                  
                                  return (
                                    <div key={subcategory._id} className="p-4 hover:bg-gray-50 transition">
                                      {isEditing ? (
                                        // Edit Mode for Mobile
                                        <div className="space-y-3">
                                          <div className="font-medium text-gray-900">{subcategory.name}</div>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <label className="text-xs text-gray-500 block mb-1">Previsto</label>
                                              <input
                                                type="number"
                                                value={editForm.estimatedCost ?? ''}
                                                onChange={(e) => setEditForm({...editForm, estimatedCost: Number(e.target.value) || null})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="0"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-xs text-gray-500 block mb-1">Real</label>
                                              <input
                                                type="number"
                                                value={editForm.finalCost ?? ''}
                                                onChange={(e) => setEditForm({...editForm, finalCost: Number(e.target.value) || null})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="0"
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <label className="text-xs text-gray-500 block mb-1">Estado</label>
                                            <select
                                              value={editForm.status}
                                              onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                              <option value="not-started">Não iniciado</option>
                                              <option value="negotiating">Em negociação</option>
                                              <option value="contracted">Contratado</option>
                                              <option value="paid">Pago</option>
                                              <option value="completed">Concluído</option>
                                            </select>
                                          </div>
                                          <div className="flex items-center justify-end gap-2 pt-2">
                                            <button
                                              onClick={handleCancelEdit}
                                              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                              Cancelar
                                            </button>
                                            <button
                                              onClick={() => handleSaveEdit(subcategory._id)}
                                              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                                            >
                                              Salvar
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        // View Mode for Mobile
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="font-medium text-gray-900">{subcategory.name}</span>
                                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(subcategory.status)}`}>
                                                {getStatusIcon(subcategory.status)} {statusLabels[subcategory.status]}
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                              <div>
                                                <span className="text-gray-500 text-xs">Previsto</span>
                                                <div className="font-medium text-gray-900">{formatCurrency(subcategory.estimatedCost)}</div>
                                              </div>
                                              <div>
                                                <span className="text-gray-500 text-xs">Real</span>
                                                <div className="font-medium text-gray-900">{formatCurrency(subcategory.finalCost)}</div>
                                              </div>
                                              <div>
                                                <span className="text-gray-500 text-xs">Diferença</span>
                                                <div className={`font-medium ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                  {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {/* Mobile 3-dots Menu */}
                                          <div className="relative ml-2">
                                            <button
                                              onClick={() => setMobileActionMenu(mobileActionMenu === subcategory._id ? null : subcategory._id)}
                                              className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                              aria-label="Opções"
                                            >
                                              <MoreVertical className="w-5 h-5" />
                                            </button>
                                            
                                            {mobileActionMenu === subcategory._id && (
                                              <>
                                                <div 
                                                  className="fixed inset-0 z-40"
                                                  onClick={() => setMobileActionMenu(null)}
                                                />
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                                  <button
                                                    onClick={() => handleEdit(subcategory)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                                                  >
                                                    <Edit2 className="w-5 h-5 text-blue-600" />
                                                    <span className="text-sm font-medium text-gray-700">Editar</span>
                                                  </button>
                                                  <button
                                                    onClick={() => handleDelete(subcategory._id)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                                  >
                                                    <Trash2 className="w-5 h-5 text-red-600" />
                                                    <span className="text-sm font-medium text-gray-700">Excluir</span>
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Desktop View - Table Layout */}
                              <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-gray-100 bg-gray-25">
                                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Subcategoria</th>
                                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Previsto (MT)</th>
                                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Real (MT)</th>
                                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Diferença</th>
                                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {category.subcategories.map((subcategory) => {
                                      const difference = (subcategory.estimatedCost || 0) - (subcategory.finalCost || 0);
                                      const isEditing = editingSubcategory === subcategory._id;
                                      
                                      return (
                                        <tr key={subcategory._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                          <td className="py-3 px-4">
                                            <span className="font-medium text-gray-900">{subcategory.name}</span>
                                          </td>
                                          
                                          {/* Estimated Cost */}
                                          <td className="py-3 px-4 text-right">
                                            {isEditing ? (
                                              <input
                                                type="number"
                                                value={editForm.estimatedCost ?? ''}
                                                onChange={(e) => setEditForm({...editForm, estimatedCost: Number(e.target.value) || null})}
                                                className="w-28 px-2 py-1 border border-gray-300 rounded text-right text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                                              />
                                            ) : (
                                              <span className="font-medium text-gray-900">{formatCurrency(subcategory.estimatedCost)}</span>
                                            )}
                                          </td>
                                          
                                          {/* Final Cost */}
                                          <td className="py-3 px-4 text-right">
                                            {isEditing ? (
                                              <input
                                                type="number"
                                                value={editForm.finalCost ?? ''}
                                                onChange={(e) => setEditForm({...editForm, finalCost: Number(e.target.value) || null})}
                                                className="w-28 px-2 py-1 border border-gray-300 rounded text-right text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                                              />
                                            ) : (
                                              <span className="font-medium text-gray-900">{formatCurrency(subcategory.finalCost)}</span>
                                            )}
                                          </td>

                                          {/* Difference */}
                                          <td className="py-3 px-4 text-right">
                                            <span className={`font-semibold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                              {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
                                            </span>
                                          </td>
                                          
                                          {/* Status */}
                                          <td className="py-3 px-4">
                                            {isEditing ? (
                                              <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                                className="px-2 py-1 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                                              >
                                                <option value="not-started">Não iniciado</option>
                                                <option value="negotiating">Em negociação</option>
                                                <option value="contracted">Contratado</option>
                                                <option value="paid">Pago</option>
                                                <option value="completed">Concluído</option>
                                              </select>
                                            ) : (
                                              <div className="flex justify-center">
                                                <span className={`${getStatusColor(subcategory.status)} px-3 py-1 rounded-lg text-xs font-medium`}>
                                                  {statusLabels[subcategory.status]}
                                                </span>
                                              </div>
                                            )}
                                          </td>
                                          
                                          {/* Actions */}
                                          <td className="py-3 px-4">
                                            <div className="flex justify-center space-x-2">
                                              {isEditing ? (
                                                <>
                                                  <button
                                                    onClick={() => handleSaveEdit(subcategory._id)}
                                                    className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Salvar"
                                                  >
                                                    <Check className="w-5 h-5" />
                                                  </button>
                                                  <button
                                                    onClick={handleCancelEdit}
                                                    className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Cancelar"
                                                  >
                                                    <X className="w-5 h-5" />
                                                  </button>
                                                </>
                                              ) : (
                                                <>
                                                  <button
                                                    onClick={() => handleEdit(subcategory)}
                                                    className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                  >
                                                    <Edit2 className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDelete(subcategory._id)}
                                                    className="p-1 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 text-center text-gray-500">
                              Nenhuma subcategoria encontrada
                            </div>
                          )}

                          {/* Category Total - Mobile */}
                          {category.subcategories && category.subcategories.length > 0 && (
                            <>
                              {/* Mobile Category Total */}
                              <div className="block lg:hidden p-4 bg-gray-100 border-t border-gray-200">
                                <div className="text-sm font-semibold text-gray-700 mb-2">Total {category.name}</div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <span className="text-xs text-gray-500 block">Previsto</span>
                                    <span className="font-semibold text-gray-900">
                                      {formatCurrency(category.subcategories.reduce((sum, sub) => sum + (sub.estimatedCost || 0), 0))}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block">Real</span>
                                    <span className="font-semibold text-gray-900">
                                      {formatCurrency(category.subcategories.reduce((sum, sub) => sum + (sub.finalCost || 0), 0))}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block">Diferença</span>
                                    <span className={`font-semibold ${
                                      (category.subcategories.reduce((sum, sub) => sum + (sub.estimatedCost || 0), 0) - 
                                       category.subcategories.reduce((sum, sub) => sum + (sub.finalCost || 0), 0)) >= 0 
                                        ? 'text-green-600' 
                                        : 'text-red-600'
                                    }`}>
                                      {formatCurrency(
                                        category.subcategories.reduce((sum, sub) => sum + (sub.estimatedCost || 0), 0) -
                                        category.subcategories.reduce((sum, sub) => sum + (sub.finalCost || 0), 0)
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Desktop Category Total */}
                              <div className="hidden lg:block p-3 bg-gray-100 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-gray-700">Total {category.name}:</span>
                                  <div className="flex space-x-4">
                                    <div className="text-right">
                                      <span className="text-xs text-gray-500 block">Previsto</span>
                                      <span className="font-semibold text-gray-900">
                                        {formatCurrency(category.subcategories.reduce((sum, sub) => sum + (sub.estimatedCost || 0), 0))}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs text-gray-500 block">Real</span>
                                      <span className="font-semibold text-gray-900">
                                        {formatCurrency(category.subcategories.reduce((sum, sub) => sum + (sub.finalCost || 0), 0))}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs text-gray-500 block">Diferença</span>
                                      <span className={`font-semibold ${
                                        (category.subcategories.reduce((sum, sub) => sum + (sub.estimatedCost || 0), 0) - 
                                         category.subcategories.reduce((sum, sub) => sum + (sub.finalCost || 0), 0)) >= 0 
                                          ? 'text-green-600' 
                                          : 'text-red-600'
                                      }`}>
                                        {formatCurrency(
                                          category.subcategories.reduce((sum, sub) => sum + (sub.estimatedCost || 0), 0) -
                                          category.subcategories.reduce((sum, sub) => sum + (sub.finalCost || 0), 0)
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Add Subcategory Button inside category */}
                          <div className="p-3 border-t border-gray-100 bg-gray-25">
                            <button
                              onClick={() => openAddModalForCategory(category)}
                              className="flex items-center space-x-2 text-sm text-primary-500 hover:text-primary-600 w-full lg:w-auto justify-center lg:justify-start"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Adicionar subcategoria</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Subcategory Button - Desktop */}
              <button
                onClick={openAddModalEmpty}
                className="hidden lg:flex mt-4 items-center space-x-2 text-primary-500 hover:text-primary-600"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar subcategoria</span>
              </button>

              {/* Tip */}
              <div className="mt-6 flex items-start space-x-3 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">💡</span>
                </div>
                <p className="text-sm text-gray-700">
                  Procure negociar pacotes que combinem salão e buffet para <span className="font-semibold">economizar até 20%</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Smart Tips (Mobile: shown in summary tab, Desktop: always visible) */}
          <div className={`lg:col-span-1 ${activeTab === 'summary' || window.innerWidth >= 1024 ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" fill="white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Dicas inteligentes</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    A média dos casamentos em Maputo é <span className="font-semibold text-gray-900">MT 600,000</span>
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    Sugere-se gastar cerca de <span className="font-semibold text-gray-900">30%</span> com salão e <span className="font-semibold text-gray-900">20%</span> com catering
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    Reserve <span className="font-semibold text-gray-900">10-15%</span> do orçamento para imprevistos
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Previsto:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(totalBudgeted)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Real:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(totalActual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Restam:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(remaining)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Orçamento:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(totalBudget)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={openAddModalEmpty}
                className="w-full bg-primary-500 text-white py-3 rounded-full font-medium hover:bg-primary-600 transition flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar despesa</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile FAB for adding expenses */}
        <button
          onClick={openAddModalEmpty}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-600 transition-colors z-40"
          aria-label="Adicionar despesa"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Add Subcategory Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-white">
                <h3 className="text-lg font-semibold text-gray-800">Adicionar Subcategoria</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleAddSubcategory}>
                {newCategory.parent ? (
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <span className="text-sm text-gray-600">Categoria: </span>
                    <span className="font-medium text-gray-900">
                      {categories.find(c => c._id === newCategory.parent)?.name}
                    </span>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria Pai</label>
                    <select
                      value={newCategory.parent || ''}
                      onChange={(e) => handleParentChange(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                    placeholder="Ex: Buffet"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custo Estimado (MT)</label>
                  <input
                    type="number"
                    value={newCategory.estimatedCost ?? ''}
                    onChange={(e) => setNewCategory({...newCategory, estimatedCost: Number(e.target.value) || null})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={newCategory.status}
                    onChange={(e) => setNewCategory({...newCategory, status: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="not-started">Não iniciado</option>
                    <option value="negotiating">Em negociação</option>
                    <option value="contracted">Contratado</option>
                    <option value="paid">Pago</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-full sm:flex-1 text-gray-500 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium order-1 sm:order-2"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
              <div className="flex items-center justify-end mb-2">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirmar exclusão</h3>
              <p className="text-gray-600 text-center mb-6">
                Tem certeza que deseja excluir esta subcategoria? Esta ação não pode ser desfeita.
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="w-full sm:flex-1 text-gray-500 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-full sm:flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium order-1 sm:order-2"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default WeddingBudgetManager;