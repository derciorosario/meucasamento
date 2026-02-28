import React, { useState, useEffect, useCallback } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { ChevronDown, ChevronRight, Check, Heart, Loader2, Plus, Trash2, Edit2, X } from 'lucide-react';
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
  const [deleteConfirm, setDeleteConfirm] = useState(null); // State for delete confirmation modal

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
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'contracted':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'paid':
        return 'bg-green-500 hover:bg-green-600';
      case 'completed':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'not-started':
      default:
        return 'bg-gray-400 hover:bg-gray-500';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 -translate-y-[70px] bg-gray-50 p-3 rounded-2xl">
          {/* Left Column - Budget Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              {/* Budget Header */}
              <div className="mb-6">
                <div className="flex items-center  max-lg:flex-col gap-2.5 justify-between mb-4">
                  <span className="text-gray-700 font-medium">Orçamento total do casamento</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center  flex-wrap gap-2 space-x-2">
                      <div className="relative">
                        <select 
                          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      <span className="text-gray-400">ou</span>
                      <input
                        type="number"
                        className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                
                {/* Progress Bar */}
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0}%` }}
                  ></div>
                </div>

                {/* Budget Summary */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Total previsto nas categorias: <span className="font-semibold text-gray-900">{formatCurrency(totalBudgeted)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Restam <span className="font-semibold text-gray-900">{formatCurrency(remaining)}</span>
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-4 flex items-center text-primary-500">
                  <Check className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    Você está MT {Math.abs(difference).toLocaleString()} {difference >= 0 ? 'abaixo' : 'acima'} do seu orçamento
                  </span>
                </div>
              </div>

              {/* Categories List with Expandable Subcategories */}
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
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                        <span className="font-semibold text-gray-900 text-lg">{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {category.subcategories?.length || 0} itens
                      </span>
                    </div>

                    {/* Subcategories Table (shown when expanded) */}
                    {expandedCategories[category._id] && (
                      <div className="border-t border-gray-200">
                        {category.subcategories && category.subcategories.length > 0 ? (
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
                                          className="w-28 px-2 py-1 border border-gray-300 rounded text-right text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                          className="w-28 px-2 py-1 border border-gray-300 rounded text-right text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                          className="px-2 py-1 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                          <option value="not-started">Não iniciado</option>
                                          <option value="negotiating">Em negociação</option>
                                          <option value="contracted">Contratado</option>
                                          <option value="paid">Pago</option>
                                          <option value="completed">Concluído</option>
                                        </select>
                                      ) : (
                                        <div className="flex justify-center">
                                          <span className={`${getStatusColor(subcategory.status)} text-white px-3 py-1 rounded-lg text-xs font-medium`}>
                                            {statusLabels[subcategory.status] || 'Não iniciado'}
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
                                              className="text-green-500 hover:text-green-700"
                                              title="Salvar"
                                            >
                                              <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                              onClick={handleCancelEdit}
                                              className="text-gray-500 hover:text-gray-700"
                                              title="Cancelar"
                                            >
                                              <ChevronDown className="w-5 h-5 rotate-90" />
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              onClick={() => handleEdit(subcategory)}
                                              className="text-blue-500 hover:text-blue-700"
                                              title="Editar"
                                            >
                                              <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => handleDelete(subcategory._id)}
                                              className="text-gray-500 hover:text-red-700"
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
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            Nenhuma subcategoria encontrada
                          </div>
                        )}

                        {/* Category Total */}
                        {category.subcategories && category.subcategories.length > 0 && (
                          <div className="p-3 bg-gray-100 border-t border-gray-200 flex justify-between items-center">
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
                                  (category.subcategories.reduce((sum, sub) => sum + (sub.estimatedCost || 0), 0) - category.subcategories.reduce((sum, sub) => sum + (sub.finalCost || 0), 0)) >= 0 
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
                        )}

                        {/* Add Subcategory Button inside category */}
                        <div className="p-3 border-t border-gray-100 bg-gray-25">
                          <button
                            onClick={() => openAddModalForCategory(category)}
                            className="flex items-center space-x-2 text-sm text-primary-500 hover:text-primary-600"
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

              {/* Add Subcategory Button */}
              <button
                onClick={openAddModalEmpty}
                className="mt-4 flex items-center space-x-2 text-primary-500 hover:text-primary-600"
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

          {/* Right Column - Smart Tips */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" fill="white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Dicas inteligentes</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">
                    A média dos casamentos em Maputo é <span className="font-semibold text-gray-900">MT 600,000</span>
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">
                    Sugere-se gastar cerca de <span className="font-semibold text-gray-900">30%</span> com salão e <span className="font-semibold text-gray-900">20%</span> com catering
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Previsto:</span>
                    <span className="font-semibold text-gray-600">{formatCurrency(totalBudgeted)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Real:</span>
                    <span className="font-semibold text-gray-600">{formatCurrency(totalActual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-gray-600">Restam:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(remaining)}</span>
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

        {/* Add Subcategory Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Adicionar Subcategoria</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custo Estimado (MT)</label>
                  <input
                    type="number"
                    value={newCategory.estimatedCost ?? ''}
                    onChange={(e) => setNewCategory({...newCategory, estimatedCost: Number(e.target.value) || null})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={newCategory.status}
                    onChange={(e) => setNewCategory({...newCategory, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="not-started">Não iniciado</option>
                    <option value="negotiating">Em negociação</option>
                    <option value="contracted">Contratado</option>
                    <option value="paid">Pago</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 text-gray-500 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
              <div className="flex items-center justify-end mb-2">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 text-gray-500 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
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
