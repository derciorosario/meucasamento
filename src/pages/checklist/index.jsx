import React, { useState, useEffect, useCallback } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { ChevronDown, Check, Heart, Lightbulb, Loader2, Edit2, Trash2, X } from 'lucide-react';
import { getTasksByTimeline, getTasksByCategory, updateTask, createTask, deleteTask, toggleTaskCompletion, initDefaultTasks } from '../../api/client';
import { toast } from '../../lib/toast';

// Category labels mapping
const categoryLabels = {
  ceremony: 'Cerimônia',
  reception: 'Recepção',
  music: 'Música',
  invitations: 'Convites',
  wedding_favors: 'Lembranças',
  flowers_decoration: 'Flores e Decoração',
  photo_video: 'Foto e Vídeo',
  transport: 'Transporte',
  jewelry: 'Joalheria',
  bride: 'Noiva e Acessórios',
  groom: 'Noivo e Acessórios',
  beauty_health: 'Beleza e Saúde',
  honeymoon: 'Lua de Mel',
  other: 'Outros',
};

// Timeline period labels
const timelineLabels = {
  '12_months_before': '+ 12 meses',
  '9_months_before': '9 à 12 meses',
  '6_months_before': '6 à 8 meses',
  '3_months_before': '4 à 5 meses',
  '1_month_before': '2 à 3 meses',
  '2_weeks_before': '1 mês',
  'wedding_day': 'Semana do casamento',
  'after_wedding': 'Após o casamento',
};

// Timeline order
const timelineOrder = [
  '12_months_before',
  '9_months_before',
  '6_months_before',
  '3_months_before',
  '1_month_before',
  '2_weeks_before',
  'wedding_day',
  'after_wedding',
];

const ChecklistPage = () => {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('timeline'); // 'timeline', 'category'
  const [showCompleted, setShowCompleted] = useState(() => {
    const saved = localStorage.getItem('checklist_showCompleted');
    return saved === 'true';
  });
  const [filterType, setFilterType] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Pendentes');
  
  // Tasks data
  const [tasksByTimeline, setTasksByTimeline] = useState({});
  const [tasksByCategory, setTasksByCategory] = useState({});
  
  // Expanded sections
  const [expandedTimelineSections, setExpandedTimelineSections] = useState({});
  const [expandedCategorySections, setExpandedCategorySections] = useState({});
  
  // Form state for new task
  const [newTask, setNewTask] = useState({
    title: '',
    categoryType: 'other',
    timelinePeriod: '12_months_before',
    priority: 'medium',
  });

  // Edit task state
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Clear all confirmation state
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [deleteCustomOnly, setDeleteCustomOnly] = useState(true);

  // Fetch tasks data
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to fetch tasks by timeline
      try {
        const timelineResponse = await getTasksByTimeline();
        if (timelineResponse.data.success) {
          setTasksByTimeline(timelineResponse.data.data);
          
          // Set expanded sections based on fetched data
          const expanded = {};
          Object.keys(timelineResponse.data.data).forEach(key => {
            expanded[key] = true;
          });
          setExpandedTimelineSections(expanded);
        }
      } catch (error) {
        // If 404, initialize default tasks
        if (error.response?.status === 404) {
          try {
            await initDefaultTasks();
            const timelineResponse = await getTasksByTimeline();
            if (timelineResponse.data.success) {
              setTasksByTimeline(timelineResponse.data.data);
              
              const expanded = {};
              Object.keys(timelineResponse.data.data).forEach(key => {
                expanded[key] = true;
              });
              setExpandedTimelineSections(expanded);
            }
          } catch (initError) {
            console.error('Error initializing tasks:', initError);
          }
        }
      }
      
      // Also fetch by category
      try {
        const categoryResponse = await getTasksByCategory();
        if (categoryResponse.data.success) {
          setTasksByCategory(categoryResponse.data.data);
          
          const expanded = {};
          Object.keys(categoryResponse.data.data).forEach(key => {
            expanded[key] = true;
          });
          setExpandedCategorySections(expanded);
        }
      } catch (error) {
        console.error('Error fetching tasks by category:', error);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Save showCompleted to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('checklist_showCompleted', showCompleted);
  }, [showCompleted]);

  // Toggle timeline section
  const toggleTimelineSection = (section) => {
    setExpandedTimelineSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle category section
  const toggleCategorySection = (section) => {
    setExpandedCategorySections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle task completion toggle
  const handleToggleTask = async (taskId) => {
    try {
      await toggleTaskCompletion(taskId);
      toast.success('Tarefa atualizada!');
      // Update state locally instead of reloading
      const newStatus = (prevStatus) => prevStatus === 'completed' ? 'pending' : 'completed';
      
      setTasksByTimeline(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].map(task => 
            task._id === taskId ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } : task
          );
        });
        return updated;
      });
      
      setTasksByCategory(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].map(task => 
            task._id === taskId ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } : task
          );
        });
        return updated;
      });
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  // Handle edit task
  const handleEditTask = (task) => {
    setEditingTask(task._id);
    setEditForm({
      title: task.title,
      categoryType: task.categoryType,
      timelinePeriod: task.timelinePeriod,
      priority: task.priority,
    });
  };

  // Save edited task
  const handleSaveEdit = async (taskId) => {
    try {
      await updateTask(taskId, editForm);
      toast.success('Tarefa atualizada!');
      
      // Update state locally instead of reloading
      setTasksByTimeline(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].map(task => 
            task._id === taskId ? { ...task, ...editForm } : task
          );
        });
        return updated;
      });
      
      setTasksByCategory(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].map(task => 
            task._id === taskId ? { ...task, ...editForm } : task
          );
        });
        return updated;
      });
      
      setEditingTask(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditForm({});
  };

  // Handle delete task
  const handleDeleteTask = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteTask(deleteConfirm);
      toast.success('Tarefa excluída!');
      
      // Update state locally instead of reloading
      setTasksByTimeline(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].filter(task => task._id !== deleteConfirm);
        });
        return updated;
      });
      
      setTasksByCategory(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].filter(task => task._id !== deleteConfirm);
        });
        return updated;
      });
      
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir tarefa');
    }
  };

  // Handle clear all (delete all non-system tasks)
  const handleClearAll = async () => {
    try {
      // Get all tasks
      const allTasks = Object.values(tasksByTimeline).flat();
      const tasksToDelete = allTasks.filter(task => !deleteCustomOnly || !task.isSystem);
      
      for (const task of tasksToDelete) {
        await deleteTask(task._id);
      }
      toast.success(deleteCustomOnly ? 'Tarefas personalizadas excluídas!' : 'Todas as tarefas foram excluídas!');
      
      // Update state locally instead of reloading
      const idsToDelete = new Set(tasksToDelete.map(t => t._id));
      
      setTasksByTimeline(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].filter(task => !idsToDelete.has(task._id));
        });
        return updated;
      });
      
      setTasksByCategory(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].filter(task => !idsToDelete.has(task._id));
        });
        return updated;
      });
      
      setClearAllConfirm(false);
      setDeleteCustomOnly(true);
    } catch (error) {
      console.error('Error clearing tasks:', error);
      toast.error('Erro ao limpar tarefas');
    }
  };

  // Handle save new task
  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      const response = await createTask(newTask);
      toast.success('Tarefa criada com sucesso!');
      
      // Update state locally instead of reloading
      const newTaskData = response.data.data;
      
      setTasksByTimeline(prev => {
        const updated = { ...prev };
        const period = newTask.timelinePeriod;
        if (updated[period]) {
          updated[period] = [...updated[period], newTaskData];
        }
        return updated;
      });
      
      setTasksByCategory(prev => {
        const updated = { ...prev };
        const category = newTask.categoryType;
        if (updated[category]) {
          updated[category] = [...updated[category], newTaskData];
        }
        return updated;
      });
      
      setIsModalOpen(false);
      setNewTask({
        title: '',
        categoryType: 'other',
        timelinePeriod: '12_months_before',
        priority: 'medium',
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    let total = 0;
    let completed = 0;
    
    Object.values(tasksByTimeline).forEach(tasks => {
      tasks.forEach(task => {
        total++;
        if (task.status === 'completed') {
          completed++;
        }
      });
    });
    
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const progress = calculateProgress();

  // Filter tasks based on status
  const filterTasks = (tasks) => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      // If showCompleted is true, always show completed tasks
      if (showCompleted && task.status === 'completed') return true;
      
      // Filter by status
      if (statusFilter === 'Pendentes' && task.status !== 'pending') return false;
      if (statusFilter === 'Concluídas' && task.status !== 'completed') return false;
      if (statusFilter === 'Em andamento' && task.status !== 'in_progress') return false;
      
      // If showCompleted is false, hide completed tasks - commented
     // if (!showCompleted && task.status === 'completed') return false;
      
      return true;
    });
  };

  if (loading) {
    return (
      <DefaultLayout hero={{title:"Seu Checklist de Casamento",subtitle:"Organize e acompanhe todas as tarefas passo a passo"}}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout hero={{title:"Seu Checklist de Casamento",subtitle:"Organize e acompanhe todas as tarefas passo a passo"}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 -translate-y-[70px] bg-gray-50 p-3 rounded-2xl">
          {/* Left Column - Checklist */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              {/* Toggle Buttons */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveView('timeline')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeView === 'timeline'
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Por Tempo
                </button>
                <button
                  onClick={() => setActiveView('category')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeView === 'category'
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Por Categoria
                </button>
              </div>

              {/* Progress Section */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-500 bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-primary-500 font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 font-medium">
                      {progress.completed} de {progress.total} tarefas concluídas
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{progress.percentage}%</span>
                </div>
                
                <div className="relative mb-4">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${progress.percentage}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>Faltam</span>
                    <span className="font-semibold text-gray-800">{progress.total - progress.completed} tarefas</span>
                    <span>para concluir 🎉</span>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Adicionar tarefa
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 font-medium cursor-pointer hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option>Pendentes</option>
                    <option>Concluídas</option>
                    <option>Em andamento</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-gray-700 text-sm">Mostrar tarefas concluídas</span>
                </label>

                <button
                  onClick={() => setClearAllConfirm(true)}
                  className="ml-auto text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Limpar tudo
                </button>
              </div>

              {/* Timeline View Content */}
              {activeView === 'timeline' && (
                <div className="space-y-4">
                  {timelineOrder.map((period) => {
                    const tasks = filterTasks(tasksByTimeline[period]);
                    if (!tasks || tasks.length === 0) return null;
                    
                    const completedCount = tasks.filter(t => t.status === 'completed').length;
                    
                    return (
                      <div key={period} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleTimelineSection(period)}
                          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                        >
                          <div className="flex items-center gap-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {timelineLabels[period] || period}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              {completedCount} de {tasks.length} concluídas
                            </span>
                            <ChevronDown 
                              className={`w-5 h-5 text-gray-400 transition-transform ${
                                expandedTimelineSections[period] ? 'rotate-180' : ''
                              }`} 
                            />
                          </div>
                        </button>

                        {expandedTimelineSections[period] && (
                          <div className="px-6 pb-6 space-y-3 bg-white border-t border-gray-200">
                            {tasks.map((task) => (
                              <div key={task._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 group hover:bg-gray-50">
                                <div className="flex items-center gap-3 flex-1">
                                  <button
                                    onClick={() => handleToggleTask(task._id)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                      task.status === 'completed'
                                        ? 'bg-primary-500 border-primary-500'
                                        : 'bg-white border-gray-300'
                                    }`}
                                  >
                                    {task.status === 'completed' && (
                                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {editingTask === task._id ? (
                                        <input
                                          type="text"
                                          value={editForm.title}
                                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                          className="px-2 py-1 border border-gray-300 rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                      ) : (
                                        <span className={`text-gray-700 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                                          {task.title}
                                        </span>
                                      )}
                                      {task.isEssential && (
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Essencial</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {editingTask === task._id ? (
                                    <>
                                      <button
                                        onClick={() => handleSaveEdit(task._id)}
                                        className="text-green-500 hover:text-green-700"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        <ChevronDown className="w-4 h-4 rotate-90" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleEditTask(task)}
                                        className="text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm(task._id)}
                                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                      <span className={`text-xs px-3 py-1 rounded-full ${
                                        task.priority === 'high' || task.priority === 'urgent'
                                          ? 'bg-red-100 text-red-700'
                                          : task.priority === 'medium'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        {task.priority === 'high' ? 'Alta' : task.priority === 'urgent' ? 'Urgente' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Category View Content */}
              {activeView === 'category' && (
                <div className="space-y-4">
                  {Object.keys(tasksByCategory).map((categoryType) => {
                    const tasks = filterTasks(tasksByCategory[categoryType]);
                    if (!tasks || tasks.length === 0) return null;
                    
                    const completedCount = tasks.filter(t => t.status === 'completed').length;
                    
                    return (
                      <div key={categoryType} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleCategorySection(categoryType)}
                          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                              <span className="text-red-400 text-xl">📋</span>
                            </div>
                            <div className="text-left">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {categoryLabels[categoryType] || categoryType}
                              </h3>
                              <span className="text-sm text-gray-500">
                                {completedCount} de {tasks.length} concluídas
                              </span>
                            </div>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategorySections[categoryType] ? 'rotate-180' : ''}`} />
                        </button>

                        {expandedCategorySections[categoryType] && (
                          <div className="p-6 bg-white border-t border-gray-200">
                            <div className="space-y-3">
                              {tasks.map((task) => (
                                <div key={task._id} className="flex items-start gap-3 py-2 group hover:bg-gray-50">
                                  <button
                                    onClick={() => handleToggleTask(task._id)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                                      task.status === 'completed'
                                        ? 'bg-primary-500 border-primary-500'
                                        : 'bg-white border-gray-300'
                                    }`}
                                  >
                                    {task.status === 'completed' && (
                                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                  
                                  <div className="flex-1 flex items-center justify-between">
                                    <span className={`text-gray-700 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                                      {task.title}
                                    </span>
                                    <div className="flex items-center gap-3">
                                      {editingTask === task._id ? (
                                        <>
                                          <button
                                            onClick={() => handleSaveEdit(task._id)}
                                            className="text-green-500 hover:text-green-700"
                                          >
                                            <Check className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={handleCancelEdit}
                                            className="text-gray-500 hover:text-gray-700"
                                          >
                                            <ChevronDown className="w-4 h-4 rotate-90" />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <>
                                              <button
                                                onClick={() => handleEditTask(task)}
                                                className="text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                              >
                                                <Edit2 className="w-4 h-4" />
                                              </button>
                                              <button
                                                onClick={() => setDeleteConfirm(task._id)}
                                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </>
                                          {task.status === 'completed' && (
                                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                              Concluída
                                            </span>
                                          )}
                                          {task.status === 'in_progress' && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                              Em andamento
                                            </span>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">
                    Ganhe tempo e dinheiro contratando pacotes de foto e vídeo com o mesmo fornecedor.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">
                    Defina o estilo de decoração e a paleta de cores antes de escolher suas alianças.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">
                    Delegue pequenas tarefas a amigos e familiares para aliviar o estresse.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de tarefas:</span>
                    <span className="font-semibold text-gray-600">{progress.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Concluídas:</span>
                    <span className="font-semibold text-green-600">{progress.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pendentes:</span>
                    <span className="font-semibold text-yellow-600">{progress.total - progress.completed}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-primary-500 text-white py-3 rounded-full font-medium hover:bg-primary-600 transition"
              >
                Adicionar tarefa
              </button>
            </div>
          </div>
        </div>

        {/* Add Task Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Adicionar Tarefa</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSaveTask}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título da tarefa</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={newTask.categoryType}
                    onChange={(e) => setNewTask({...newTask, categoryType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                  <select
                    value={newTask.timelinePeriod}
                    onChange={(e) => setNewTask({...newTask, timelinePeriod: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.entries(timelineLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 text-gray-500 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
                Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 text-gray-500 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {clearAllConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
              <div className="flex items-center justify-end mb-2">
                <button 
                  onClick={() => { setClearAllConfirm(false); setDeleteCustomOnly(true); }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Limpar tarefas personalizadas</h3>
              <p className="text-gray-600 text-center mb-6">
                Isso irá excluir todas as tarefas personalizadas que você criou. As tarefas padrão do sistema serão mantidas. Continuar?
              </p>
              <label className="flex items-center gap-2 mb-6 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={deleteCustomOnly}
                  onChange={(e) => setDeleteCustomOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-gray-700 text-sm">Excluir apenas tarefas personalizadas</span>
              </label>
              <div className="flex space-x-3">
                <button
                  onClick={() => { setClearAllConfirm(false); setDeleteCustomOnly(true); }}
                  className="flex-1 text-gray-500 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default ChecklistPage;
