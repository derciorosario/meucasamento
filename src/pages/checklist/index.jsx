import React, { useState, useEffect, useCallback } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ChevronDown, Check, Heart, Lightbulb, Loader2, Edit2, Trash2, X, Plus, Filter, ChevronLeft, ChevronRight, MoreVertical, Calendar, Play } from 'lucide-react';
import { getTasksByTimeline, getTasksByCategory, updateTask, createTask, deleteTask, toggleTaskCompletion, initDefaultTasks, getTutorials } from '../../api/client';
import { toast } from '../../lib/toast';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../contexts/DataContext';

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

// Helper function to get current week boundaries (Monday to Sunday)
const getCurrentWeekBounds = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { monday, sunday };
};

// Helper function to determine timeline period based on due date
const getTimelinePeriodFromDate = (date) => {
  if (!date) return '12_months_before';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    // Date is in the past
    if (diffDays >= -14) return 'after_wedding';
    return 'after_wedding';
  }
  
  if (diffDays <= 14) return 'wedding_day';
  if (diffDays <= 30) return '2_weeks_before';
  if (diffDays <= 60) return '1_month_before';
  if (diffDays <= 150) return '3_months_before';
  if (diffDays <= 240) return '6_months_before';
  if (diffDays <= 365) return '9_months_before';
  return '12_months_before';
};

// Helper function to extract YouTube video ID
const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const ChecklistPage = () => {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('category');
  const [showCompleted, setShowCompleted] = useState(() => {
    const saved = localStorage.getItem('checklist_showCompleted');
    return saved === 'true';
  });
  const [filterType, setFilterType] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Pendentes');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const {profile} = useAuth()
  const data=useData()

  useEffect(()=>{

    if(!data.postDialogOpen){
       setIsModalOpen(false)
    }

  },[data.postDialogOpen])
  
 
  // Tasks data
  const [tasksByTimeline, setTasksByTimeline] = useState({});
  const [tasksByCategory, setTasksByCategory] = useState({});
  
  // Expanded sections
  const [expandedTimelineSections, setExpandedTimelineSections] = useState({});
  const [expandedCategorySections, setExpandedCategorySections] = useState({});
  const [expandedThisWeekSection, setExpandedThisWeekSection] = useState(true);
  
  // Form state for new task
  const [newTask, setNewTask] = useState({
    title: '',
    categoryType: 'other',
    timelinePeriod: '12_months_before',
    priority: 'medium',
    dueDate: null,
  });

  // Date type selection: 'period' or 'dueDate' (mandatory)
  const [dateType, setDateType] = useState(null);

  // Edit task state
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Mobile action menu state
  const [mobileActionMenu, setMobileActionMenu] = useState(null);

  // Clear all confirmation state
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [deleteCustomOnly, setDeleteCustomOnly] = useState(true);

  // Mobile touch states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Tutorial video state
  const [checklistTutorial, setChecklistTutorial] = useState(null);
  const [showTutorialDropdown, setShowTutorialDropdown] = useState(false);
  const [showTutorialDesktop, setShowTutorialDesktop] = useState(false);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && activeView === 'timeline') {
      setActiveView('category');
    } else if (isRightSwipe && activeView === 'category') {
      setActiveView('timeline');
    }
  };

  // Fetch tasks data
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch tutorial videos
      try {
        const tutorialsRes = await getTutorials();
        if (tutorialsRes.data?.tutorialVideos?.checklist) {
          const videoId = extractYouTubeId(tutorialsRes.data.tutorialVideos.checklist);
          setChecklistTutorial({
            url: tutorialsRes.data.tutorialVideos.checklist,
            videoId
          });
        }
      } catch (tutError) {
        console.log('No tutorial videos available');
      }
      
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

  // Toggle this week section
  const toggleThisWeekSection = () => {
    setExpandedThisWeekSection(prev => !prev);
  };

  // Get tasks for this week
  const getThisWeekTasks = useCallback(() => {
    const { monday, sunday } = getCurrentWeekBounds();
    const allTasks = Object.values(tasksByTimeline).flat();
    
    return allTasks.filter(task => {
      // Task has dueDate within current week
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        return dueDate >= monday && dueDate <= sunday;
      }
     
    });
  }, [tasksByTimeline]);

  // Get IDs of tasks that should be shown in This Week view (to filter them from other views)
  const getThisWeekTaskIds = useCallback(() => {
    return new Set(getThisWeekTasks().map(t => t._id));
  }, [getThisWeekTasks]);

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
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    });
    setMobileActionMenu(null); // Close mobile menu if open
  };

  // Save edited task
  const handleSaveEdit = async (taskId) => {
    try {
      // Prepare edit data with dueDate formatted for backend
      const editData = {
        ...editForm,
        dueDate: editForm.dueDate ? editForm.dueDate.toISOString() : null,
      };
      
      await updateTask(taskId, editData);
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
      setMobileActionMenu(null); // Close mobile menu if open
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
    
    // Validate that dateType is selected
    if (!dateType) {
      toast.error('Por favor, selecione o tipo de data');
      return;
    }
    
    // Validate required fields based on dateType
    if (dateType === 'dueDate' && !newTask.dueDate) {
      toast.error('Por favor, selecione uma data de vencimento');
      return;
    }
    
    if (dateType === 'period' && !newTask.timelinePeriod) {
      toast.error('Por favor, selecione um período');
      return;
    }
    
    try {
      // Prepare task data with dueDate formatted for backend
      const taskData = {
        ...newTask,
        dueDate: newTask.dueDate ? newTask.dueDate.toISOString() : null,
      };
      
      const response = await createTask(taskData);
      toast.success('Tarefa criada com sucesso!');
      
      // Update state locally instead of reloading
      const newTaskData = response.data.data;
      
      setTasksByTimeline(prev => {
        const updated = { ...prev };
        const period = newTask.timelinePeriod;
        if (updated[period]) {
          updated[period] = [...updated[period], newTaskData];
        } else {
          updated[period] = [newTaskData];
        }
        return updated;
      });
      
      setTasksByCategory(prev => {
        const updated = { ...prev };
        const category = newTask.categoryType;
        if (updated[category]) {
          updated[category] = [...updated[category], newTaskData];
        } else {
          updated[category] = [newTaskData];
        }
        return updated;
      });
      
      setIsModalOpen(false);
      setNewTask({
        title: '',
        categoryType: 'other',
        timelinePeriod: '12_months_before',
        priority: 'medium',
        dueDate: null,
      });
      setDateType(null);
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
      
      return true;
    });
  };

  if (loading) {
    return (
      <DefaultLayout largerPadding={true} hero={{title:"Seu Checklist de Casamento",subtitle:"Organize e acompanhe todas as tarefas passo a passo"}}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout largerPadding={true} hero={{title:"Seu Checklist de Casamento",subtitle:"Organize e acompanhe todas as tarefas passo a passo"}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:-translate-y-[70px] bg-gray-50 py-3 rounded-2xl">
          {/* Left Column - Checklist */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
              {/* Mobile View Toggle with Swipe Hint */}
              <div className="lg:hidden mb-4">
                <div className="flex items-center justify-between mb-2">
                  
                  <button
                    onClick={() => setActiveView('category')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-center ${
                      activeView === 'category'
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Por Categoria
                  </button>

                  <button
                    onClick={() => setActiveView('timeline')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-center ${
                      activeView === 'timeline'
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Por Tempo
                  </button>
                
                </div>
                
              </div>

              {/* Desktop Toggle Buttons */}
              <div className="hidden lg:flex gap-2 mb-6">

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
               
              </div>

              {/* Progress Section */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-500 bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-500 font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">
                      {progress.completed} de {progress.total} tarefas concluídas
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{progress.percentage}%</span>
                </div>
                
                <div className="relative mb-4">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${progress.percentage}%` }} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <span>Faltam</span>
                    <span className="font-semibold text-gray-800">{progress.total - progress.completed} tarefas</span>
                    <span>para concluir 🎉</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsModalOpen(true)
                      data.setPostDialogOpen(true)
                    }}
                    className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar tarefa</span>
                  </button>
                </div>
              </div>

              {/* Tutorial Video - Mobile Only (left column) */}
              {checklistTutorial && (
                <div className="mb-4 lg:hidden">
                  <button
                    onClick={() => setShowTutorialDropdown(!showTutorialDropdown)}
                    className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary-500" fill="currentColor" />
                      <span className="text-sm font-medium text-primary-700">Ver tutorial</span>
                      <span className="text-xs text-primary-600 ml-1">(como usar esta página)</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-primary-500 transition-transform ${showTutorialDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showTutorialDropdown && (
                    <div className="mt-2 rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${checklistTutorial.videoId}`}
                        title="Tutorial Video"
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filtros</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Filters */}
              <div className={`${showMobileFilters ? 'block' : 'hidden lg:flex'} flex-col lg:flex-row items-start lg:items-center gap-4 mb-6`}>
                <div className="w-full lg:w-auto relative">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full lg:w-auto appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-gray-700 font-medium cursor-pointer hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="lg:ml-auto text-red-500 hover:text-red-700 text-sm font-medium w-full lg:w-auto text-left lg:text-right"
                >
                  Limpar tudo
                </button>
              </div>

              {/* Swipeable Content */}
              <div 
                className="touch-pan-y"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Timeline View Content */}
                {activeView === 'timeline' && (
                  <div className="space-y-4 transition-opacity duration-300">
                    {/* Esta Semana Section - Shown at the top */}
                    {(() => {
                      const weekTasks = getThisWeekTasks();
                      const filteredTasks = filterTasks(weekTasks);
                      const completedCount = filteredTasks.filter(t => t.status === 'completed').length;
                      
                      if (filteredTasks.length > 0) {
                        return (
                          <div className="border border-gray-200 rounded-xl mb-4">
                            <button
                              onClick={toggleThisWeekSection}
                              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors bg-gradient-to-r from-blue-50 to-purple-50"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-600 text-xl">📅</span>
                                </div>
                                <div className="text-left">
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                                    Esta Semana
                                  </h3>
                                  <span className="text-xs sm:text-sm text-gray-500">
                                    {completedCount} de {filteredTasks.length} concluídas
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-xs sm:text-sm text-blue-600 font-medium">
                                  {filteredTasks.length} tarefas
                                </span>
                                <ChevronDown 
                                  className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                                    expandedThisWeekSection ? 'rotate-180' : ''
                                  }`} 
                                />
                              </div>
                            </button>

                            {expandedThisWeekSection && (
                              <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 bg-white border-t border-gray-200">
                                {filteredTasks.map((task) => (
                                  <div key={task._id} className="flex items-start sm:items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 group">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                      <button
                                        onClick={() => handleToggleTask(task._id)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                          task.status === 'completed'
                                            ? 'bg-primary-500 border-primary-500'
                                            : 'bg-white border-gray-300 hover:border-primary-500'
                                        }`}
                                        aria-label={task.status === 'completed' ? 'Marcar como pendente' : 'Marcar como concluída'}
                                      >
                                        {task.status === 'completed' && (
                                          <Check className="w-4 h-4 text-white" />
                                        )}
                                      </button>
                                      
                                      <div className="flex-1 min-w-0">
                                        {editingTask === task._id ? (
                                          <div className="space-y-2">
                                            <input
                                              type="text"
                                              value={editForm.title}
                                              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                              autoFocus
                                            />
                                            <div className="flex flex-col sm:flex-row gap-2">
                                              <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Prioridade</label>
                                                <select
                                                  value={editForm.priority}
                                                  onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                                                  className="w-full text-[15px] px-2 py-1.5 border border-gray-300 rounded text-black focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                                                  style={{ height: '40px', boxSizing: 'border-box' }}
                                                >
                                                  <option value="low">Baixa</option>
                                                  <option value="medium">Média</option>
                                                  <option value="high">Alta</option>
                                                  <option value="urgent">Urgente</option>
                                                </select>
                                              </div>
                                              <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Data</label>
                                                <DatePicker
                                                  selected={editForm.dueDate}
                                                  onChange={(date) => setEditForm({...editForm, dueDate: date})}
                                                  minDate={new Date()}
                                                  dateFormat="dd/MM/yyyy"
                                                  placeholderText="Selecione"
                                                  className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded text-black focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                  style={{ height: '30px', boxSizing: 'border-box' }}
                                                  showPopperArrow={false}
                                                  popperPlacement="bottom-start"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-sm sm:text-base text-gray-700 break-words ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                                              {task.title}
                                            </span>
                                            {task.isEssential && (
                                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full whitespace-nowrap">Essencial</span>
                                            )}
                                            {task.dueDate && (
                                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-2">
                                      {editingTask === task._id ? (
                                        <>
                                          <button
                                            onClick={() => handleSaveEdit(task._id)}
                                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Salvar"
                                          >
                                            <Check className="w-5 h-5" />
                                          </button>
                                          <button
                                            onClick={handleCancelEdit}
                                            className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Cancelar"
                                          >
                                            <X className="w-5 h-5" />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <span className={`hidden sm:inline-block text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                                            task.priority === 'high' || task.priority === 'urgent'
                                              ? 'bg-red-100 text-red-700'
                                              : task.priority === 'medium'
                                              ? 'bg-yellow-100 text-yellow-700'
                                              : 'bg-gray-100 text-gray-700'
                                          }`}>
                                            {task.priority === 'high' ? 'Alta' : 
                                             task.priority === 'urgent' ? 'Urgente' : 
                                             task.priority === 'medium' ? 'Média' : 'Baixa'}
                                          </span>

                                          <div className="hidden sm:flex items-center gap-1">
                                            <button
                                              onClick={() => handleEditTask(task)}
                                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                              title="Editar tarefa"
                                            >
                                              <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => setDeleteConfirm(task._id)}
                                              className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                              title="Excluir tarefa"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>

                                          <div className="sm:hidden relative">
                                            <button
                                              onClick={() => setMobileActionMenu(mobileActionMenu === task._id ? null : task._id)}
                                              className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                              aria-label="Opções da tarefa"
                                            >
                                              <MoreVertical className="w-5 h-5" />
                                            </button>
                                            
                                            {mobileActionMenu === task._id && (
                                              <>
                                                <div 
                                                  className="fixed inset-0 z-40"
                                                  onClick={() => setMobileActionMenu(null)}
                                                />
                                                <div className="absolute    right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                                  <button
                                                    onClick={() => {
                                                      handleEditTask(task);
                                                      setMobileActionMenu(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                                                  >
                                                    <Edit2 className="w-5 h-5 text-blue-600" />
                                                    <span className="text-sm font-medium text-gray-700">Editar tarefa</span>
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setDeleteConfirm(task._id);
                                                      setMobileActionMenu(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                                  >
                                                    <Trash2 className="w-5 h-5 text-gray-600" />
                                                    <span className="text-sm font-medium text-gray-700">Excluir tarefa</span>
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>

                                          {mobileActionMenu !== task._id && (
                                            <span className={`sm:hidden text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                                              task.priority === 'high' || task.priority === 'urgent'
                                                ? 'bg-red-100 text-red-700'
                                                : task.priority === 'medium'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                              {task.priority === 'high' ? 'Alta' : 
                                               task.priority === 'urgent' ? 'Urgente' : 
                                               task.priority === 'medium' ? 'Média' : 'Baixa'}
                                            </span>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Timeline Periods */}
                    {timelineOrder.map((period) => {
                      const tasks = filterTasks(tasksByTimeline[period]);
                      if (!tasks || tasks.length === 0) return null;
                      
                      const completedCount = tasks.filter(t => t.status === 'completed').length;
                      
                      return (
                        <div key={period} className="border border-gray-200 rounded-xl">
                          <button
                            onClick={() => toggleTimelineSection(period)}
                            className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                          >
                            <div className="flex items-center gap-4">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                                {timelineLabels[period] || period}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs sm:text-sm text-gray-500">
                                {completedCount}/{tasks.length}
                              </span>
                              <ChevronDown 
                                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                                  expandedTimelineSections[period] ? 'rotate-180' : ''
                                }`} 
                              />
                            </div>
                          </button>

                          {expandedTimelineSections[period] && (
                            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 bg-white border-t border-gray-200">
                              {tasks.map((task) => (
                                <div key={task._id} className="flex items-start sm:items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 group">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <button
                                      onClick={() => handleToggleTask(task._id)}
                                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                        task.status === 'completed'
                                          ? 'bg-primary-500 border-primary-500'
                                          : 'bg-white border-gray-300 hover:border-primary-500'
                                      }`}
                                      aria-label={task.status === 'completed' ? 'Marcar como pendente' : 'Marcar como concluída'}
                                    >
                                      {task.status === 'completed' && (
                                        <Check className="w-4 h-4 text-white" />
                                      )}
                                    </button>
                                    
                                    <div className="flex-1 min-w-0">
                                      {editingTask === task._id ? (
                                        <div className="space-y-2">
                                          <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            autoFocus
                                          />
                                          <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="flex-1">
                                              <label className="block text-xs text-gray-500 mb-1">Prioridade</label>
                                              <select
                                                value={editForm.priority}
                                                onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                                                className="w-full text-[15px] px-2 py-1.5 border border-gray-300 rounded text-black focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                                                style={{ height: '40px', boxSizing: 'border-box' }}
                                              >
                                                <option value="low">Baixa</option>
                                                <option value="medium">Média</option>
                                                <option value="high">Alta</option>
                                                <option value="urgent">Urgente</option>
                                              </select>
                                            </div>
                                            <div className="flex-1">
                                              <label className="block text-xs text-gray-500 mb-1">Data</label>
                                              <DatePicker
                                                selected={editForm.dueDate}
                                                onChange={(date) => setEditForm({...editForm, dueDate: date})}
                                                minDate={new Date()}
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="Selecione"
                                                className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded text-black focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                style={{ height: '30px', boxSizing: 'border-box' }}
                                                showPopperArrow={false}
                                                popperPlacement="bottom-start"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className={`text-sm sm:text-base text-gray-700 break-words ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                                            {task.title}
                                          </span>
                                          {task.isEssential && (
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full whitespace-nowrap">Essencial</span>
                                          )}
                                          {task.dueDate && (
                                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                                              📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 ml-2">
                                    {editingTask === task._id ? (
                                      // Edit mode controls
                                      <>
                                        <button
                                          onClick={() => handleSaveEdit(task._id)}
                                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                          title="Salvar"
                                        >
                                          <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                          onClick={handleCancelEdit}
                                          className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                          title="Cancelar"
                                        >
                                          <X className="w-5 h-5" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        {/* Priority Badge - Always visible */}
                                        <span className={`hidden sm:inline-block text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                                          task.priority === 'high' || task.priority === 'urgent'
                                            ? 'bg-red-100 text-red-700'
                                            : task.priority === 'medium'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}>
                                          {task.priority === 'high' ? 'Alta' : 
                                           task.priority === 'urgent' ? 'Urgente' : 
                                           task.priority === 'medium' ? 'Média' : 'Baixa'}
                                        </span>

                                        {/* Desktop Edit/Delete Icons - Always visible on desktop */}
                                        <div className="hidden sm:flex items-center gap-1">
                                          <button
                                            onClick={() => handleEditTask(task)}
                                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar tarefa"
                                          >
                                            <Edit2 className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => setDeleteConfirm(task._id)}
                                            className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Excluir tarefa"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>

                                        {/* Mobile 3-dots Menu */}
                                        <div className="sm:hidden relative">
                                          <button
                                            onClick={() => setMobileActionMenu(mobileActionMenu === task._id ? null : task._id)}
                                            className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            aria-label="Opções da tarefa"
                                          >
                                            <MoreVertical className="w-5 h-5" />
                                          </button>
                                          
                                          {/* Mobile Action Menu Popup */}
                                          {mobileActionMenu === task._id && (
                                            <>
                                              {/* Backdrop */}
                                              <div 
                                                className="fixed inset-0 z-40"
                                                onClick={() => setMobileActionMenu(null)}
                                              />
                                              
                                              {/* Menu */}
                                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                                <button
                                                  onClick={() => {
                                                    handleEditTask(task);
                                                    setMobileActionMenu(null);
                                                  }}
                                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                                                >
                                                  <Edit2 className="w-5 h-5 text-blue-600" />
                                                  <span className="text-sm font-medium text-gray-700">Editar tarefa</span>
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setDeleteConfirm(task._id);
                                                    setMobileActionMenu(null);
                                                  }}
                                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                                >
                                                  <Trash2 className="w-5 h-5 text-gray-600" />
                                                  <span className="text-sm font-medium text-gray-700">Excluir tarefa</span>
                                                </button>
                                              </div>
                                            </>
                                          )}
                                        </div>

                                        {/* Mobile Priority Badge - Only show if no menu open */}
                                        {mobileActionMenu !== task._id && (
                                          <span className={`sm:hidden text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                                            task.priority === 'high' || task.priority === 'urgent'
                                              ? 'bg-red-100 text-red-700'
                                              : task.priority === 'medium'
                                              ? 'bg-yellow-100 text-yellow-700'
                                              : 'bg-gray-100 text-gray-700'
                                          }`}>
                                            {task.priority === 'high' ? 'Alta' : 
                                             task.priority === 'urgent' ? 'Urgente' : 
                                             task.priority === 'medium' ? 'Média' : 'Baixa'}
                                          </span>
                                        )}
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
                  <div className="space-y-4 transition-opacity duration-300">
                    {/* Esta Semana Section - Shown at the top */}
                    {(() => {
                      const weekTasks = getThisWeekTasks();
                      const filteredTasks = filterTasks(weekTasks);
                      const completedCount = filteredTasks.filter(t => t.status === 'completed').length;
                      
                      if (filteredTasks.length > 0) {
                        return (
                          <div className="border border-gray-200 rounded-xl mb-4">
                            <button
                              onClick={toggleThisWeekSection}
                              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors bg-gradient-to-r from-blue-50 to-purple-50"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-600 text-xl">📅</span>
                                </div>
                                <div className="text-left">
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                                    Esta Semana
                                  </h3>
                                  <span className="text-xs sm:text-sm text-gray-500">
                                    {completedCount} de {filteredTasks.length} concluídas
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-xs sm:text-sm text-blue-600 font-medium">
                                  {filteredTasks.length} tarefas
                                </span>
                                <ChevronDown 
                                  className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                                    expandedThisWeekSection ? 'rotate-180' : ''
                                  }`} 
                                />
                              </div>
                            </button>

                            {expandedThisWeekSection && (
                              <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 bg-white border-t border-gray-200">
                                {filteredTasks.map((task) => (
                                  <div key={task._id} className="flex items-start sm:items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 group">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                      <button
                                        onClick={() => handleToggleTask(task._id)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                          task.status === 'completed'
                                            ? 'bg-primary-500 border-primary-500'
                                            : 'bg-white border-gray-300 hover:border-primary-500'
                                        }`}
                                        aria-label={task.status === 'completed' ? 'Marcar como pendente' : 'Marcar como concluída'}
                                      >
                                        {task.status === 'completed' && (
                                          <Check className="w-4 h-4 text-white" />
                                        )}
                                      </button>
                                      
                                      <div className="flex-1 min-w-0">
                                        {editingTask === task._id ? (
                                          <div className="space-y-2">
                                            <input
                                              type="text"
                                              value={editForm.title}
                                              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                              autoFocus
                                            />
                                            <div className="flex flex-col sm:flex-row gap-2">
                                              <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Prioridade</label>
                                                <select
                                                  value={editForm.priority}
                                                  onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                                                  className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded text-black focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                                                  style={{ height: '40px', boxSizing: 'border-box' }}
                                                >
                                                  <option value="low">Baixa</option>
                                                  <option value="medium">Média</option>
                                                  <option value="high">Alta</option>
                                                  <option value="urgent">Urgente</option>
                                                </select>
                                              </div>
                                              <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Data</label>
                                                <DatePicker
                                                  selected={editForm.dueDate}
                                                  onChange={(date) => setEditForm({...editForm, dueDate: date})}
                                                  minDate={new Date()}
                                                  dateFormat="dd/MM/yyyy"
                                                  placeholderText="Selecione"
                                                  className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded text-black focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                  style={{ height: '30px', boxSizing: 'border-box' }}
                                                  showPopperArrow={false}
                                                  popperPlacement="bottom-start"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-sm sm:text-base text-gray-700 break-words ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                                              {task.title}
                                            </span>
                                            {task.dueDate && (
                                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-2">
                                      {editingTask === task._id ? (
                                        <>
                                          <button
                                            onClick={() => handleSaveEdit(task._id)}
                                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Salvar"
                                          >
                                            <Check className="w-5 h-5" />
                                          </button>
                                          <button
                                            onClick={handleCancelEdit}
                                            className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Cancelar"
                                          >
                                            <X className="w-5 h-5" />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          {task.status === 'completed' && (
                                            <span className="hidden sm:inline-block text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                                              Concluída
                                            </span>
                                          )}
                                          {task.status === 'in_progress' && (
                                            <span className="hidden sm:inline-block text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                                              Em andamento
                                            </span>
                                          )}

                                          <div className="hidden sm:flex items-center gap-1">
                                            <button
                                              onClick={() => handleEditTask(task)}
                                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                              title="Editar tarefa"
                                            >
                                              <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => setDeleteConfirm(task._id)}
                                              className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                              title="Excluir tarefa"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>

                                          <div className="sm:hidden relative">
                                            <button
                                              onClick={() => setMobileActionMenu(mobileActionMenu === task._id ? null : task._id)}
                                              className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                              aria-label="Opções da tarefa"
                                            >
                                              <MoreVertical className="w-5 h-5" />
                                            </button>
                                            
                                            {mobileActionMenu === task._id && (
                                              <>
                                                <div 
                                                  className="fixed inset-0 z-40"
                                                  onClick={() => setMobileActionMenu(null)}
                                                />
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                                  <button
                                                    onClick={() => {
                                                      handleEditTask(task);
                                                      setMobileActionMenu(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                                                  >
                                                    <Edit2 className="w-5 h-5 text-blue-600" />
                                                    <span className="text-sm font-medium text-gray-700">Editar tarefa</span>
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setDeleteConfirm(task._id);
                                                      setMobileActionMenu(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                                  >
                                                    <Trash2 className="w-5 h-5 text-red-600" />
                                                    <span className="text-sm font-medium text-gray-700">Excluir tarefa</span>
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>

                                          {mobileActionMenu !== task._id && (
                                            <>
                                              {task.status === 'completed' && (
                                                <span className="sm:hidden text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                                                  ✓
                                                </span>
                                              )}
                                              {task.status === 'in_progress' && (
                                                <span className="sm:hidden text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                                                  ⋯
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Categories */}
                    {Object.keys(tasksByCategory).map((categoryType) => {
                      const tasks = filterTasks(tasksByCategory[categoryType]);
                      if (!tasks || tasks.length === 0) return null;
                      
                      const completedCount = tasks.filter(t => t.status === 'completed').length;
                      
                      return (
                        <div key={categoryType} className="border border-gray-200 rounded-xl">
                          <button
                            onClick={() => toggleCategorySection(categoryType)}
                            className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-red-400 text-lg sm:text-xl">📋</span>
                              </div>
                              <div className="text-left">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                                  {categoryLabels[categoryType] || categoryType}
                                </h3>
                                <span className="text-xs sm:text-sm text-gray-500">
                                  {completedCount} de {tasks.length}
                                </span>
                              </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${expandedCategorySections[categoryType] ? 'rotate-180' : ''}`} />
                          </button>

                          {expandedCategorySections[categoryType] && (
                            <div className="p-4 sm:p-6 bg-white border-t border-gray-200">
                              <div className="space-y-3">
                                {tasks.map((task) => (
                                  <div key={task._id} className="flex items-start sm:items-center justify-between py-2 hover:bg-gray-50 group">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                      <button
                                        onClick={() => handleToggleTask(task._id)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                          task.status === 'completed'
                                            ? 'bg-primary-500 border-primary-500'
                                            : 'bg-white border-gray-300 hover:border-primary-500'
                                        }`}
                                        aria-label={task.status === 'completed' ? 'Marcar como pendente' : 'Marcar como concluída'}
                                      >
                                        {task.status === 'completed' && (
                                          <Check className="w-4 h-4 text-white" />
                                        )}
                                      </button>
                                      
                                      <div className="flex-1 min-w-0">
                                        {editingTask === task._id ? (
                                          <div className="space-y-2">
                                            <input
                                              type="text"
                                              value={editForm.title}
                                              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                              autoFocus
                                            />
                                            <div className="flex flex-col sm:flex-row gap-2">
                                              <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Prioridade</label>
                                                <select
                                                  value={editForm.priority}
                                                  onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                                                  className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded text-black focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                                                  style={{ height: '40px', boxSizing: 'border-box' }}
                                                >
                                                  <option value="low">Baixa</option>
                                                  <option value="medium">Média</option>
                                                  <option value="high">Alta</option>
                                                  <option value="urgent">Urgente</option>
                                                </select>
                                              </div>
                                              <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Data</label>
                                                <DatePicker
                                                  selected={editForm.dueDate}
                                                  onChange={(date) => setEditForm({...editForm, dueDate: date})}
                                                  minDate={new Date()}
                                                  dateFormat="dd/MM/yyyy"
                                                  placeholderText="Selecione"
                                                  className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded text-black focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                  style={{ height: '30px', boxSizing: 'border-box' }}
                                                  showPopperArrow={false}
                                                  popperPlacement="bottom-start"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-sm sm:text-base text-gray-700 break-words ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                                              {task.title}
                                            </span>
                                            {task.dueDate && (
                                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-2">
                                      {editingTask === task._id ? (
                                        // Edit mode controls
                                        <>
                                          <button
                                            onClick={() => handleSaveEdit(task._id)}
                                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Salvar"
                                          >
                                            <Check className="w-5 h-5" />
                                          </button>
                                          <button
                                            onClick={handleCancelEdit}
                                            className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Cancelar"
                                          >
                                            <X className="w-5 h-5" />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          {/* Status Badge */}
                                          {task.status === 'completed' && (
                                            <span className="hidden sm:inline-block text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                                              Concluída
                                            </span>
                                          )}
                                          {task.status === 'in_progress' && (
                                            <span className="hidden sm:inline-block text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                                              Em andamento
                                            </span>
                                          )}

                                          {/* Desktop Edit/Delete Icons - Always visible on desktop */}
                                          <div className="hidden sm:flex items-center gap-1">
                                            <button
                                              onClick={() => handleEditTask(task)}
                                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                              title="Editar tarefa"
                                            >
                                              <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => setDeleteConfirm(task._id)}
                                              className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                              title="Excluir tarefa"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>

                                          {/* Mobile 3-dots Menu */}
                                          <div className="sm:hidden relative">
                                            <button
                                              onClick={() => setMobileActionMenu(mobileActionMenu === task._id ? null : task._id)}
                                              className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                              aria-label="Opções da tarefa"
                                            >
                                              <MoreVertical className="w-5 h-5" />
                                            </button>
                                            
                                            {/* Mobile Action Menu Popup */}
                                            {mobileActionMenu === task._id && (
                                              <>
                                                {/* Backdrop */}
                                                <div 
                                                  className="fixed inset-0 z-40"
                                                  onClick={() => setMobileActionMenu(null)}
                                                />
                                                
                                                {/* Menu */}
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                                  <button
                                                    onClick={() => {
                                                      handleEditTask(task);
                                                      setMobileActionMenu(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                                                  >
                                                    <Edit2 className="w-5 h-5 text-blue-600" />
                                                    <span className="text-sm font-medium text-gray-700">Editar tarefa</span>
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setDeleteConfirm(task._id);
                                                      setMobileActionMenu(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                                  >
                                                    <Trash2 className="w-5 h-5 text-red-600" />
                                                    <span className="text-sm font-medium text-gray-700">Excluir tarefa</span>
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>

                                          {/* Mobile Status Badge - Only show if no menu open */}
                                          {mobileActionMenu !== task._id && (
                                            <>
                                              {task.status === 'completed' && (
                                                <span className="sm:hidden text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                                                  ✓
                                                </span>
                                              )}
                                              {task.status === 'in_progress' && (
                                                <span className="sm:hidden text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                                                  ⋯
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </>
                                      )}
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
          </div>

          {/* Right Column - Smart Tips (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-1">
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
                    Ganhe tempo e dinheiro contratando pacotes de foto e vídeo com o mesmo fornecedor.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    Defina o estilo de decoração e a paleta de cores antes de escolher suas alianças.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    Delegue pequenas tarefas a amigos e familiares para aliviar o estresse.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                {/* Tutorial Video - Desktop Only (right column) */}
                {checklistTutorial && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowTutorialDesktop(!showTutorialDesktop)}
                      className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Play className="w-5 h-5 text-primary-500" fill="currentColor" />
                        <span className="text-sm font-medium text-primary-700">Ver tutorial</span>
                        <span className="text-xs text-primary-600 ml-1">(como usar esta página)</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-primary-500 transition-transform ${showTutorialDesktop ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showTutorialDesktop && (
                      <div className="mt-2 rounded-lg overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${checklistTutorial.videoId}`}
                          title="Tutorial Video"
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                )}

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
                onClick={() => {
                  setIsModalOpen(true)
                  data.setPostDialogOpen(true)
                }}
                className="w-full mt-4 bg-primary-500 text-white py-3 rounded-full font-medium hover:bg-primary-600 transition"
              >
                Adicionar tarefa
              </button>
            </div>
          </div>
        </div>

        {/* Mobile FAB for adding tasks */}
        <button
          onClick={() => {
            setIsModalOpen(true)
            data.setPostDialogOpen(true)
          }}
          className="lg:hidden fixed bottom-20 right-6 w-14 h-14 bg-primary-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-600 transition-colors z-40"
          aria-label="Adicionar tarefa"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Add Task Modal - Mobile Optimized */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-t-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Adicionar Tarefa</h3>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100"
                      aria-label="Fechar"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleSaveTask} className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título da tarefa</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                      placeholder="Ex: Reservar buffet"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      value={newTask.categoryType}
                      onChange={(e) => setNewTask({...newTask, categoryType: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de data</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDateType('dueDate');
                          setNewTask({...newTask, timelinePeriod: '12_months_before'});
                        }}
                        className={`flex-1 py-3 px-3 rounded-xl font-medium transition-colors text-sm ${
                          dateType === 'dueDate'
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Data de vencimento
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDateType('period');
                          setNewTask({...newTask, dueDate: null});
                        }}
                        className={`flex-1 py-3 px-3 rounded-xl font-medium transition-colors text-sm ${
                          dateType === 'period'
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Período
                      </button>
                    </div>
                  </div>
                  
                  {dateType === 'period' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                      <select
                        value={newTask.timelinePeriod}
                        onChange={(e) => setNewTask({...newTask, timelinePeriod: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {Object.entries(timelineLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  ) : dateType === 'dueDate' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de vencimento</label>
                      <div className="relative w-full">
                        <DatePicker
                          selected={newTask.dueDate}
                          onChange={(date) => {
                            const period = getTimelinePeriodFromDate(date);
                            setNewTask({...newTask, dueDate: date, timelinePeriod: period});
                          }}
                          minDate={new Date()}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Selecione uma data"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  ) : null}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium active:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl font-medium active:bg-primary-600"
                    >
                      Adicionar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Task Modal - Desktop */}
        {isModalOpen && (
          <div className="hidden lg:flex fixed inset-0 bg-black/50 items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-serif font-bold text-black">Adicionar Tarefa</h3>
                <button onClick={() => setIsModalOpen(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleSaveTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título da tarefa</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    required
                    placeholder="Ex: Reservar buffet"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={newTask.categoryType}
                    onChange={(e) => setNewTask({...newTask, categoryType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de data</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDateType('dueDate');
                        setNewTask({...newTask, timelinePeriod: '12_months_before'});
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-lg font-medium transition-colors text-sm ${
                        dateType === 'dueDate'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Data de vencimento
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDateType('period');
                        setNewTask({...newTask, dueDate: null});
                      }}
                      className={`flex-1 py-2.5 px-3 rounded-lg font-medium transition-colors text-sm ${
                        dateType === 'period'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Período
                    </button>
                  </div>
                </div>
                
                {dateType === 'period' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                    <select
                      value={newTask.timelinePeriod}
                      onChange={(e) => setNewTask({...newTask, timelinePeriod: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      {Object.entries(timelineLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                ) : dateType === 'dueDate' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de vencimento</label>
                    <div className="relative w-full">
                      <DatePicker
                        selected={newTask.dueDate}
                        onChange={(date) => {
                          const period = getTimelinePeriodFromDate(date);
                          setNewTask({...newTask, dueDate: date, timelinePeriod: period});
                        }}
                        minDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Selecione uma data"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                ) : null}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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

        {/* Delete Confirmation Modal - Mobile Optimized */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-t-2xl w-full max-w-md mx-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => setDeleteConfirm(null)}
                      className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100"
                      aria-label="Fechar"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar exclusão</h3>
                  <p className="text-gray-600 mb-6">
                    Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium active:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteTask}
                      className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium active:bg-red-600"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal - Desktop */}
        {deleteConfirm && (
          <div className="hidden lg:flex fixed inset-0 bg-black/50 items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="flex justify-end mb-2">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Confirmation Modal - Mobile Optimized */}
        <AnimatePresence>
          {clearAllConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end"
              onClick={() => { setClearAllConfirm(false); setDeleteCustomOnly(true); }}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-t-2xl w-full max-w-md mx-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => { setClearAllConfirm(false); setDeleteCustomOnly(true); }}
                      className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100"
                      aria-label="Fechar"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Limpar tarefas personalizadas</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Isso irá excluir todas as tarefas personalizadas que você criou. As tarefas padrão do sistema serão mantidas. Continuar?
                  </p>
                  <label className="flex items-center gap-2 mb-6 cursor-pointer justify-center">
                    <input 
                      type="checkbox" 
                      checked={deleteCustomOnly}
                      onChange={(e) => setDeleteCustomOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 text-sm">Excluir apenas tarefas personalizadas</span>
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setClearAllConfirm(false); setDeleteCustomOnly(true); }}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium active:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium active:bg-red-600"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear All Confirmation Modal - Desktop */}
        {clearAllConfirm && (
          <div className="hidden lg:flex fixed inset-0 bg-black/50 items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="flex justify-end mb-2">
                <button 
                  onClick={() => { setClearAllConfirm(false); setDeleteCustomOnly(true); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
              <label className="flex items-center gap-2 mb-6 cursor-pointer justify-center">
                <input 
                  type="checkbox" 
                  checked={deleteCustomOnly}
                  onChange={(e) => setDeleteCustomOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-gray-700 text-sm">Excluir apenas tarefas personalizadas</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => { setClearAllConfirm(false); setDeleteCustomOnly(true); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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