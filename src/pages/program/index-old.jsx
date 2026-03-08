import React, { useState, useEffect, useRef } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { 
  ChevronDown, Check, Heart, Loader2, Edit2, Trash2, X, Plus, 
  GripVertical, Clock, User, MapPin, Save, RotateCcw
} from 'lucide-react';
import { toast } from '../../lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import * as api from '../../api/client';

// Default sections
const defaultSections = [
  'Preparação',
  'Cerimônia',
  'Fotos',
  'Recepção',
  'Saída',
  'Outro'
];

// Default program structure
const defaultProgram = {
  preparacao: {
    title: 'Preparação',
    activities: [
      { _id: 'prep1', title: 'Preparação da noiva', startTime: '08:00', endTime: '10:00', responsible: 'Noiva', location: 'Quarto nupcial', description: '' },
      { _id: 'prep2', title: 'Preparação do noivo', startTime: '09:00', endTime: '10:00', responsible: 'Noivo', location: 'Sala', description: '' },
      { _id: 'prep3', title: 'Almoço de preparação', startTime: '12:00', endTime: '13:00', responsible: '', location: 'Restaurante', description: '' },
    ]
  },
  cerimonia: {
    title: 'Cerimônia',
    activities: [
      { _id: 'cer1', title: 'Chegada dos convidados', startTime: '14:30', endTime: '15:00', responsible: 'Coordenador', location: 'Igreja', description: '' },
      { _id: 'cer2', title: 'Entrada do noivo', startTime: '15:00', endTime: '15:05', responsible: 'Músico', location: 'Igreja', description: '' },
      { _id: 'cer3', title: 'Entrada da noiva', startTime: '15:05', endTime: '15:15', responsible: 'Pai da noiva', location: 'Igreja', description: '' },
      { _id: 'cer4', title: 'Cerimônia religiosa', startTime: '15:15', endTime: '16:00', responsible: 'Padre', location: 'Igreja', description: '' },
      { _id: 'cer5', title: 'Saída dos noivos', startTime: '16:00', endTime: '16:15', responsible: 'Coordenador', location: 'Igreja', description: '' },
    ]
  },
  fotos: {
    title: 'Fotos',
    activities: [
      { _id: 'photo1', title: 'Fotos do casal', startTime: '16:30', endTime: '17:15', responsible: 'Fotógrafo', location: 'Jardim', description: '' },
      { _id: 'photo2', title: 'Fotos com família', startTime: '17:15', endTime: '17:45', responsible: 'Fotógrafo', location: 'Igreja', description: '' },
      { _id: 'photo3', title: 'Fotos com amigos', startTime: '17:45', endTime: '18:15', responsible: 'Fotógrafo', location: 'Jardim', description: '' },
    ]
  },
  recepcao: {
    title: 'Recepção',
    activities: [
      { _id: 'rec1', title: 'Recepção dos convidados', startTime: '18:30', endTime: '19:00', responsible: 'Coordenador', location: 'Salão', description: '' },
      { _id: 'rec2', title: 'Brinde de boas-vindas', startTime: '19:00', endTime: '19:15', responsible: 'Mestre de cerimônias', location: 'Salão', description: '' },
      { _id: 'rec3', title: 'Jantar', startTime: '19:15', endTime: '21:00', responsible: '', location: 'Salão', description: '' },
      { _id: 'rec4', title: 'Primeiro bolo', startTime: '21:00', endTime: '21:15', responsible: 'Coordenador', location: 'Salão', description: '' },
      { _id: 'rec5', title: 'Dança dos noivos', startTime: '21:15', endTime: '21:25', responsible: 'DJ', location: 'Palco', description: '' },
      { _id: 'rec6', title: 'Dança com pais', startTime: '21:25', endTime: '21:35', responsible: 'DJ', location: 'Palco', description: '' },
      { _id: 'rec7', title: 'Jogo do buquê', startTime: '21:35', endTime: '21:45', responsible: 'Noiva', location: 'Palco', description: '' },
      { _id: 'rec8', title: 'Animação/DJ', startTime: '21:45', endTime: '23:45', responsible: 'DJ', location: 'Salão', description: '' },
      { _id: 'rec9', title: 'Corte do bolo', startTime: '23:45', endTime: '00:00', responsible: 'Coordenador', location: 'Salão', description: '' },
    ]
  },
  saida: {
    title: 'Saída',
    activities: [
      { _id: 'dep1', title: 'Despedida dos noivos', startTime: '00:00', endTime: '00:30', responsible: 'Coordenador', location: 'Entrada', description: '' },
      { _id: 'dep2', title: 'Partida dos noivos', startTime: '00:30', endTime: '00:40', responsible: '', location: '', description: '' },
    ]
  }
};

// Default responsible people list
const defaultResponsibles = [
  'Noiva', 'Noivo', 'Mãe da noiva', 'Pai da noiva', 'Mãe do noivo', 'Pai do noivo',
  'Coordenador', 'Fotógrafo', 'Videomaker', 'DJ', 'Músico', 'Padre', 'Mestre de cerimônias',
  'Cerimonialista', 'Decorador', 'Buffet', 'Outros'
];

const ProgramPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [program, setProgram] = useState({});
  const [sections, setSections] = useState(defaultSections);
  const [responsibles, setResponsibles] = useState(defaultResponsibles);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newActivity, setNewActivity] = useState({
    title: '',
    startTime: '',
    endTime: '',
    responsible: '',
    location: '',
    description: ''
  });
  const [addToSection, setAddToSection] = useState('cerimonia');
  const [expandedSections, setExpandedSections] = useState({});
  const [editingResponsible, setEditingResponsible] = useState(null);
  const [newResponsible, setNewResponsible] = useState('');
  const [customSection, setCustomSection] = useState('');
  const [showCustomSectionInput, setShowCustomSectionInput] = useState(false);
  const [showNewResponsibleInput, setShowNewResponsibleInput] = useState(false);
  const [tempNewResponsible, setTempNewResponsible] = useState('');
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { section, activityId }
  const [deleteSectionConfirm, setDeleteSectionConfirm] = useState(null); // { sectionKey, sectionTitle, activityCount }
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [editingSection, setEditingSection] = useState(null); // { key, title }
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const dragItem = useRef();
  const dragOverItemRef = useRef();
  
  const data = useData();

  // Load program from API
  useEffect(() => {
    const loadProgram = async () => {
      try {
        const response = await api.getProgram();
        if (response.data && response.data.success && response.data.data) {
          const programData = response.data.data;
          
          // Load sections from program
          if (programData.sectionsArray && programData.sectionsArray.length > 0) {
            const loadedProgram = {};
            const loadedSections = [];
            
            programData.sectionsArray.forEach(section => {
              // Use title as key for consistency
              const key = section.title.toLowerCase().replace(/\s+/g, '_');
              loadedProgram[key] = {
                title: section.title,
                activities: section.activities || []
              };
              loadedSections.push(section.title);
            });
            
            setProgram(loadedProgram);
            setSections(loadedSections);
          } else if (programData.sections) {
            // Handle Map-like structure
            const sectionsObj = programData.sections;
            const loadedProgram = {};
            const loadedSections = [];
            
            Object.keys(sectionsObj).forEach(key => {
              loadedProgram[key] = sectionsObj[key];
              loadedSections.push(sectionsObj[key].title);
            });
            
            setProgram(loadedProgram);
            setSections(loadedSections);
          }
          
          // Load responsibles
          if (programData.responsibles && programData.responsibles.length > 0) {
            setResponsibles(programData.responsibles);
          }
        }
        
        // Initialize expanded sections
        const expanded = {};
        Object.keys(defaultProgram).forEach(key => {
          expanded[key] = true;
        });
        setExpandedSections(expanded);
      } catch (error) {
        console.error('Error loading program:', error);
        // Use default program if API fails
        setProgram(defaultProgram);
        const expanded = {};
        Object.keys(defaultProgram).forEach(key => {
          expanded[key] = true;
        });
        setExpandedSections(expanded);
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, []);
  const saveProgramToApi = async (newProgram) => {
    setSaving(true);
    try {
      // Convert program object to array format with title-based keys for API
      const sectionsArray = Object.entries(newProgram).map(([key, section]) => ({
        key: key,
        title: section.title,
        activities: section.activities || []
      }));

      await api.updateProgram(sectionsArray);
      setProgram(newProgram);
      toast.success('Programa guardado!');
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error('Erro ao guardar programa');
    } finally {
      setSaving(false);
    }
  };

  // Save responsibles to API
  const saveResponsiblesToApi = async (newResponsibles) => {
    try {
      setResponsibles(newResponsibles);
    } catch (error) {
      console.error('Error saving responsibles:', error);
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Drag and drop handlers
  const handleDragStart = (e, sectionKey, index) => {
    dragItem.current = { sectionKey, index };
    setDraggedItem({ sectionKey, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, sectionKey, index) => {
    dragOverItemRef.current = { sectionKey, index };
    setDragOverItem({ sectionKey, index });
  };

  const handleDragEnd = async () => {
    if (dragItem.current && dragOverItemRef.current) {
      const { sectionKey: sourceSection, index: sourceIndex } = dragItem.current;
      const { sectionKey: targetSection, index: targetIndex } = dragOverItemRef.current;
      
      if (sourceSection === targetSection && sourceIndex !== targetIndex) {
        const newProgram = { ...program };
        const activities = [...newProgram[sourceSection].activities];
        const [removed] = activities.splice(sourceIndex, 1);
        activities.splice(targetIndex, 0, removed);
        newProgram[sourceSection].activities = activities;
        
        // Save to API
        const orderedIds = activities.map(a => a._id);
        try {
          await api.reorderActivities(sourceSection, orderedIds);
        } catch (error) {
          console.error('Error reordering:', error);
        }
        
        setProgram(newProgram);
        toast.success('Ordem atualizada!');
      }
    }
    dragItem.current = null;
    dragOverItemRef.current = null;
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Move activity up
  const moveActivityUp = async (section, index) => {
    if (index === 0) return;
    const newProgram = { ...program };
    const activities = [...newProgram[section].activities];
    [activities[index - 1], activities[index]] = [activities[index], activities[index - 1]];
    newProgram[section].activities = activities;
    
    const orderedIds = activities.map(a => a._id);
    try {
      await api.reorderActivities(section, orderedIds);
    } catch (error) {
      console.error('Error reordering:', error);
    }
    
    setProgram(newProgram);
  };

  // Move activity down
  const moveActivityDown = async (section, index) => {
    const newProgram = { ...program };
    const activities = [...newProgram[section].activities];
    if (index === activities.length - 1) return;
    [activities[index], activities[index + 1]] = [activities[index + 1], activities[index]];
    newProgram[section].activities = activities;
    
    const orderedIds = activities.map(a => a._id);
    try {
      await api.reorderActivities(section, orderedIds);
    } catch (error) {
      console.error('Error reordering:', error);
    }
    
    setProgram(newProgram);
  };

  // Delete activity
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const { section, activityId } = deleteConfirm;
    const activityIndex = program[section].activities.findIndex(a => a._id === activityId);
    if (activityIndex === -1) {
      toast.error('Atividade não encontrada');
      return;
    }
    const activity = program[section].activities[activityIndex];
    if (!activity || !activity._id) {
      toast.error('ID da atividade não encontrado');
      return;
    }
    
    try {
      await api.deleteActivity(section, activity._id);
      const newProgram = { ...program };
      newProgram[section].activities.splice(activityIndex, 1);
      setProgram(newProgram);
      setDeleteConfirm(null);
      toast.success('Atividade removida!');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Erro ao remover atividade');
    }
  };

  // Start editing section
  const startEditSection = (sectionKey, title) => {
    setEditingSection({ key: sectionKey, title });
    setEditSectionTitle(title);
  };

  // Save edited section
  const saveEditSection = async () => {
    if (!editingSection) return;
    const newTitle = editSectionTitle.trim();
    if (!newTitle) {
      toast.error('Por favor, insira o nome da seção');
      return;
    }
    
    try {
      const newProgram = { ...program };
      newProgram[editingSection.key].title = newTitle;
      
      await api.upsertSection(editingSection.key, newProgram[editingSection.key]);
      
      // Update sections array
      const newSections = sections.map(s => s === editingSection.title ? newTitle : s);
      setSections(newSections);
      setProgram(newProgram);
      
      setEditingSection(null);
      setEditSectionTitle('');
      toast.success('Seção atualizada!');
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Erro ao atualizar seção');
    }
  };

  // Delete section
  const handleDeleteSectionConfirm = async () => {
    if (!deleteSectionConfirm) return;
    const { sectionKey } = deleteSectionConfirm;
    
    try {
      const newProgram = { ...program };
      delete newProgram[sectionKey];
      
      const sectionTitle = deleteSectionConfirm.sectionTitle;
      const newSections = sections.filter(s => s !== sectionTitle);
      
      await api.deleteSection(sectionKey);
      
      setProgram(newProgram);
      setSections(newSections);
      setDeleteSectionConfirm(null);
      toast.success('Seção removida!');
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Erro ao remover seção');
    }
  };

  // Delete all activities
  const handleDeleteAllConfirm = async () => {
    try {
      await api.initProgram();
      setProgram({});
      setSections([]);
      setDeleteAllConfirm(false);
      toast.success('Todas as atividades foram removidas!');
    } catch (error) {
      console.error('Error deleting all:', error);
      toast.error('Erro ao remover atividades');
    }
  };

  // Start editing activity
  const startEditActivity = (section, activity) => {
    setEditingActivity({ section, id: activity._id });
    setEditForm({ ...activity });
  };

  // Save edited activity
  const saveEditActivity = async () => {
    if (!editingActivity) return;
    
    try {
      await api.updateActivity(editingActivity.section, editingActivity.id, editForm);
      
      const newProgram = { ...program };
      const section = newProgram[editingActivity.section];
      const index = section.activities.findIndex(a => a._id === editingActivity.id);
      
      if (index !== -1) {
        section.activities[index] = { ...editForm };
        setProgram(newProgram);
        toast.success('Atividade atualizada!');
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Erro ao atualizar atividade');
    }
    
    setEditingActivity(null);
    setEditForm({});
  };

  // Add new activity
  const handleAddActivity = async (e) => {
    e.preventDefault();
    
    if (!newActivity.title.trim()) {
      toast.error('Por favor, insira o título da atividade');
      return;
    }

    if (!newActivity.startTime) {
      toast.error('Por favor, insira o horário de início');
      return;
    }

    try {
      const activityData = { 
        ...newActivity, 
        endTime: newActivity.endTime || '' 
      };
      
      // Use the section title as the key
      await api.addActivity(addToSection, activityData);
      
      const newProgram = { ...program };
      const activity = { 
        ...activityData, 
        _id: `temp_${Date.now()}` // Temporary ID until refresh
      };
      
      newProgram[addToSection].activities.push(activity);
      setProgram(newProgram);
      
      setShowAddModal(false);
      setNewActivity({
        title: '',
        startTime: '',
        endTime: '',
        responsible: '',
        location: '',
        description: ''
      });
      toast.success('Atividade adicionada!');
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Erro ao adicionar atividade');
    }
  };

  // Add new section
  const handleAddSection = async () => {
    if (!customSection.trim()) return;
    
    // Use title as key
    const sectionKey = customSection.trim().toLowerCase().replace(/\s+/g, '_');
    const newSection = {
      title: customSection.trim(),
      activities: []
    };
    
    try {
      await api.upsertSection(sectionKey, newSection);
      
      const newProgram = { ...program, [sectionKey]: newSection };
      const newSections = [...sections, customSection.trim()];
      
      setProgram(newProgram);
      setSections(newSections);
      
      setCustomSection('');
      setShowCustomSectionInput(false);
      toast.success('Seção adicionada!');
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error('Erro ao adicionar seção');
    }
  };

  // Add new responsible
  const handleAddResponsible = async () => {
    if (!newResponsible.trim()) return;
    if (responsibles.includes(newResponsible.trim())) {
      toast.error('Esta pessoa já está na lista');
      return;
    }
    
    try {
      await api.addProgramResponsible(newResponsible.trim());
      const newResponsibles = [...responsibles, newResponsible.trim()];
      saveResponsiblesToApi(newResponsibles);
      setNewResponsible('');
      setEditingResponsible(null);
      toast.success('Responsável adicionado!');
    } catch (error) {
      console.error('Error adding responsible:', error);
      toast.error('Erro ao adicionar responsável');
    }
  };

  // Add new responsible from activity form
  const handleAddResponsibleFromForm = async () => {
    if (!tempNewResponsible.trim()) return;
    if (responsibles.includes(tempNewResponsible.trim())) {
      toast.error('Esta pessoa já está na lista');
      return;
    }
    
    try {
      await api.addProgramResponsible(tempNewResponsible.trim());
      const newResponsibles = [...responsibles, tempNewResponsible.trim()];
      saveResponsiblesToApi(newResponsibles);
      setNewActivity({ ...newActivity, responsible: tempNewResponsible.trim() });
      setTempNewResponsible('');
      setShowNewResponsibleInput(false);
      toast.success('Responsável adicionado!');
    } catch (error) {
      console.error('Error adding responsible:', error);
      toast.error('Erro ao adicionar responsável');
    }
  };

  // Delete responsible
  const deleteResponsible = async (responsible) => {
    try {
      await api.deleteProgramResponsible(responsible);
      const newResponsibles = responsibles.filter(r => r !== responsible);
      saveResponsiblesToApi(newResponsibles);
      toast.success('Responsável removido!');
    } catch (error) {
      console.error('Error deleting responsible:', error);
      toast.error('Erro ao remover responsável');
    }
  };

  // Reset to default
  const resetToDefault = async () => {
    try {
      await api.initProgram();
      setProgram(defaultProgram);
      setSections(defaultSections);
      setResponsibles(defaultResponsibles);
      setResetConfirm(false);
      toast.success('Programa restaurado!');
    } catch (error) {
      console.error('Error resetting program:', error);
      toast.error('Erro ao restaurar programa');
    }
  };

  // Calculate schedule timeline (sorted by start time)
  const calculateTimeline = () => {
    const allActivities = [];
    
    Object.entries(program).forEach(([sectionKey, section]) => {
      section.activities.forEach(activity => {
        if (activity.startTime) {
          allActivities.push({
            ...activity,
            section: section.title,
            sectionKey
          });
        }
      });
    });
    
    // Sort by start time
    allActivities.sort((a, b) => {
      const timeA = a.startTime.replace(':', '');
      const timeB = b.startTime.replace(':', '');
      return parseInt(timeA) - parseInt(timeB);
    });
    
    return allActivities;
  };

  if (loading) {
    return (
      <DefaultLayout largerPadding={true} hero={{title:"Programa do Casamento",subtitle:"Organize o cronograma do seu grande dia"}}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DefaultLayout>
    );
  }

  const timeline = calculateTimeline();
  const programKeys = Object.keys(program);

  return (
    <DefaultLayout largerPadding={true} hero={{title:"Programa do Casamento",subtitle:"Organize o cronograma do seu grande dia"}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Heart },
            { id: 'schedule', label: 'Horário', icon: Clock },
            { id: 'activities', label: 'Atividades', icon: Plus },
            { id: 'responsibles', label: 'Responsáveis', icon: User },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
          
          <button
            onClick={() => setResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar
          </button>
          <button
            onClick={() => setDeleteAllConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Apagar Tudo
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary-500" fill="currentColor" />
                Resumo do Programa
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programKeys.map((key) => {
                  const section = program[key];
                  const activityCount = section.activities?.length || 0;
                  const startTimes = section.activities
                    ?.filter(a => a.startTime)
                    .map(a => a.startTime)
                    .sort() || [];
                  const firstTime = startTimes[0] || '';
                  const lastActivity = section.activities
                    ?.filter(a => a.startTime)
                    .sort((a, b) => {
                      const timeA = a.startTime.replace(':', '');
                      const timeB = b.startTime.replace(':', '');
                      return parseInt(timeA) - parseInt(timeB);
                    }) || [];
                  const lastTime = lastActivity.length > 0 ? (lastActivity[lastActivity.length - 1].endTime || lastActivity[lastActivity.length - 1].startTime) : '';
                  
                  return (
                    <div 
                      key={key} 
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setActiveTab('schedule');
                        setExpandedSections(prev => {
                          const updated = {};
                          programKeys.forEach(k => updated[k] = k === key);
                          return updated;
                        });
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{section.title}</h3>
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                          {activityCount} atividades
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {firstTime && lastTime 
                            ? `${firstTime} - ${lastTime}`
                            : firstTime || 'Sem horário'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
                Cronograma Rápido
              </h2>
              
              <div className="space-y-3">
                {timeline.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 flex-shrink-0 text-center">
                      <span className="text-lg font-bold text-primary-600">{item.startTime}</span>
                      {item.endTime && (
                        <>
                          <span className="text-gray-400 mx-1">-</span>
                          <span className="text-sm text-gray-600">{item.endTime}</span>
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.section}</p>
                    </div>
                  </div>
                ))}
                {timeline.length > 8 && (
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="w-full text-center text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                  >
                    Ver todas as {timeline.length} atividades →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {programKeys.map((sectionKey) => {
              const section = program[sectionKey];
              return (
                <div key={sectionKey} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="text-left">
                        {editingSection?.key === sectionKey ? (
                          <input
                            type="text"
                            value={editSectionTitle}
                            onChange={(e) => setEditSectionTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEditSection()}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                            autoFocus
                          />
                        ) : (
                          <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                        )}
                        <span className="text-sm text-gray-500">
                          {section.activities?.length || 0} atividades
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingSection?.key === sectionKey ? (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); saveEditSection(); }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Guardar"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingSection(null); setEditSectionTitle(''); }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); startEditSection(sectionKey, section.title); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Editar seção"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteSectionConfirm({ sectionKey, sectionTitle: section.title, activityCount: section.activities?.length || 0 }); }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Eliminar seção"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections[sectionKey] ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {expandedSections[sectionKey] && (
                    <div className="border-t border-gray-200">
                      {section.activities?.map((activity, index) => (
                        <div 
                          key={activity._id || index} 
                          className={`p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                            draggedItem?.sectionKey === sectionKey && draggedItem?.index === index 
                              ? 'bg-primary-50 opacity-50' 
                              : dragOverItem?.sectionKey === sectionKey && dragOverItem?.index === index 
                                ? 'bg-primary-100' 
                                : ''
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, sectionKey, index)}
                          onDragEnter={(e) => handleDragEnter(e, sectionKey, index)}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleDragOver}
                        >
                          {editingActivity?.id === activity._id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Título da atividade"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Início</label>
                                  <input
                                    type="time"
                                    value={editForm.startTime}
                                    onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Fim (opcional)</label>
                                  <input
                                    type="time"
                                    value={editForm.endTime || ''}
                                    onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Responsável</label>
                                <select
                                  value={editForm.responsible}
                                  onChange={(e) => setEditForm({...editForm, responsible: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                  <option value="">Selecione</option>
                                  {responsibles.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Local</label>
                                <input
                                  type="text"
                                  value={editForm.location}
                                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  placeholder="Local da atividade"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Descrição</label>
                                <textarea
                                  value={editForm.description || ''}
                                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  rows={2}
                                  placeholder="Descrição adicional (opcional)"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={saveEditActivity}
                                  className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-2"
                                >
                                  <Save className="w-4 h-4" />
                                  Guardar
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingActivity(null);
                                    setEditForm({});
                                  }}
                                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              {/* Drag Handle */}
                              <div className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 touch-none">
                                <GripVertical className="w-5 h-5" />
                              </div>
                              
                              {/* Time Display */}
                              <div className="w-20 flex-shrink-0 text-center">
                                <span className="text-lg font-bold text-primary-600">{activity.startTime || '--:--'}</span>
                                {activity.endTime && (
                                  <>
                                    <br/>
                                    <span className="text-xs text-gray-500">-{activity.endTime}</span>
                                  </>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-gray-800">{activity.title}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                  {activity.responsible && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {activity.responsible}
                                    </span>
                                  )}
                                  {activity.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {activity.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditActivity(sectionKey, activity)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({ section: sectionKey, activityId: activity._id })}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <button
                        onClick={() => {
                          setAddToSection(sectionKey);
                          setShowAddModal(true);
                        }}
                        className="w-full p-3 text-center text-primary-600 hover:bg-primary-50 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar atividade
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Custom Section Button */}
            {showCustomSectionInput ? (
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSection}
                    onChange={(e) => setCustomSection(e.target.value)}
                    placeholder="Nome da nova seção"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
                  />
                  <button
                    onClick={handleAddSection}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomSectionInput(false);
                      setCustomSection('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomSectionInput(true)}
                className="w-full p-4 bg-white rounded-2xl shadow-lg text-center text-primary-600 hover:bg-primary-50 flex items-center justify-center gap-2 transition-colors border-2 border-dashed border-primary-200"
              >
                <Plus className="w-5 h-5" />
                Adicionar nova seção
              </button>
            )}
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-gray-900">
                Todas as Atividades
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Atividade
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Horário</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Atividade</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Seção</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Responsável</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Local</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((activity, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      {editingActivity?.id === activity._id ? (
                        <td colSpan={6} className="py-3 px-4 bg-primary-50">
                          <div className="space-y-3 p-3 bg-white rounded-lg border border-primary-200">
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Título da atividade"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Início</label>
                                <input
                                  type="time"
                                  value={editForm.startTime}
                                  onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Fim (opcional)</label>
                                <input
                                  type="time"
                                  value={editForm.endTime || ''}
                                  onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Responsável</label>
                              <select
                                value={editForm.responsible}
                                onChange={(e) => setEditForm({...editForm, responsible: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                <option value="">Selecione</option>
                                {responsibles.map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Local</label>
                              <input
                                type="text"
                                value={editForm.location}
                                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Local da atividade"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={saveEditActivity}
                                className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-2"
                              >
                                <Save className="w-4 h-4" />
                                Guardar
                              </button>
                              <button
                                onClick={() => {
                                  setEditingActivity(null);
                                  setEditForm({});
                                }}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-800">{activity.startTime}</span>
                              {activity.endTime && (
                                <>
                                  <span className="text-gray-400">-</span>
                                  <span className="text-gray-600">{activity.endTime}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-800">{activity.title}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{activity.section}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{activity.responsible || '-'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{activity.location || '-'}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  startEditActivity(activity.sectionKey, activity);
                                }}
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirm({ section: activity.sectionKey, activityId: activity._id });
                                }}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Responsibles Tab */}
        {activeTab === 'responsibles' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-500" />
                  Responsáveis
                </h2>
                <button
                  onClick={() => setEditingResponsible(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>

              {editingResponsible && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newResponsible}
                      onChange={(e) => setNewResponsible(e.target.value)}
                      placeholder="Nome do responsável"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddResponsible()}
                    />
                    <button
                      onClick={handleAddResponsible}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                      Adicionar
                    </button>
                    <button
                      onClick={() => {
                        setEditingResponsible(false);
                        setNewResponsible('');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {responsibles.map((responsible) => {
                  const isUsed = timeline.some(t => t.responsible === responsible);
                  return (
                    <div 
                      key={responsible} 
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isUsed 
                          ? 'bg-primary-50 border-primary-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isUsed ? 'bg-primary-200' : 'bg-gray-200'
                        }`}>
                          <User className={`w-4 h-4 ${isUsed ? 'text-primary-600' : 'text-gray-500'}`} />
                        </div>
                        <span className={`font-medium ${isUsed ? 'text-gray-800' : 'text-gray-600'}`}>
                          {responsible}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteResponsible(responsible)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Usage Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Atribuições</h3>
              <div className="space-y-2">
                {responsibles.filter(r => timeline.some(t => t.responsible === r)).map(responsible => {
                  const count = timeline.filter(t => t.responsible === responsible).length;
                  return (
                    <div key={responsible} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-800">{responsible}</span>
                      <span className="text-sm text-gray-600">{count} atividade{count !== 1 ? 's' : ''}</span>
                    </div>
                  );
                })}
                {responsibles.filter(r => timeline.some(t => t.responsible === r)).length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhum responsável atribuído ainda</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Activity Modal - Mobile */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end"
              onClick={() => setShowAddModal(false)}
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
                    <h3 className="text-lg font-semibold text-gray-800">Nova Atividade</h3>
                    <button 
                      onClick={() => setShowAddModal(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleAddActivity} className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seção</label>
                    <div className="relative">
                      <select
                        value={addToSection}
                        onChange={(e) => setAddToSection(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                      >
                        {programKeys.map((key) => (
                          <option key={key} value={key}>{program[key].title}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título da atividade</label>
                    <input
                      type="text"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                      placeholder="Ex: Entrada dos noivos"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                      <input
                        type="time"
                        value={newActivity.startTime}
                        onChange={(e) => setNewActivity({...newActivity, startTime: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fim (opcional)</label>
                      <input
                        type="time"
                        value={newActivity.endTime}
                        onChange={(e) => setNewActivity({...newActivity, endTime: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                    {showNewResponsibleInput ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={tempNewResponsible}
                          onChange={(e) => setTempNewResponsible(e.target.value)}
                          placeholder="Nome do novo responsável"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddResponsibleFromForm()}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddResponsibleFromForm}
                            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                          >
                            Adicionar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewResponsibleInput(false);
                              setTempNewResponsible('');
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={newActivity.responsible}
                          onChange={(e) => setNewActivity({...newActivity, responsible: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                        >
                          <option value="">Selecione</option>
                          {responsibles.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowNewResponsibleInput(true)}
                          className="absolute right-8 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-700"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                    <input
                      type="text"
                      value={newActivity.location}
                      onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: Igreja"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                    <textarea
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Detalhes adicionais..."
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
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

        {/* Add Activity Modal - Desktop */}
        {showAddModal && (
          <div className="hidden lg:flex fixed inset-0 bg-black/50 items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-100">
                <h3 className="text-xl font-serif font-bold text-black">Nova Atividade</h3>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seção</label>
                  <div className="relative">
                    <select
                      value={addToSection}
                      onChange={(e) => setAddToSection(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black appearance-none"
                    >
                      {programKeys.map((key) => (
                        <option key={key} value={key}>{program[key].title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
               
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título da atividade</label>
                  <input
                    type="text"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    required
                    placeholder="Ex: Entrada dos noivos"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                    <input
                      type="time"
                      value={newActivity.startTime}
                      onChange={(e) => setNewActivity({...newActivity, startTime: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fim (opcional)</label>
                    <input
                      type="time"
                      value={newActivity.endTime}
                      onChange={(e) => setNewActivity({...newActivity, endTime: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                  {showNewResponsibleInput ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={tempNewResponsible}
                        onChange={(e) => setTempNewResponsible(e.target.value)}
                        placeholder="Nome do novo responsável"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddResponsibleFromForm()}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddResponsibleFromForm}
                          className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                        >
                          Adicionar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewResponsibleInput(false);
                            setTempNewResponsible('');
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={newActivity.responsible}
                        onChange={(e) => setNewActivity({...newActivity, responsible: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black appearance-none"
                      >
                        <option value="">Selecione</option>
                        {responsibles.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewResponsibleInput(true)}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-700"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                  <input
                    type="text"
                    value={newActivity.location}
                    onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    placeholder="Ex: Igreja"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                  <textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    rows={3}
                    placeholder="Detalhes adicionais..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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

        {/* Delete Confirmation Modal - Mobile */}
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
                    Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium active:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
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
                Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Section Confirmation Modal - Mobile */}
        <AnimatePresence>
          {deleteSectionConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end"
              onClick={() => setDeleteSectionConfirm(null)}
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
                      onClick={() => setDeleteSectionConfirm(null)}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar exclusão da seção</h3>
                  <p className="text-gray-600 mb-2">
                    Tem certeza que deseja excluir a seção "{deleteSectionConfirm.sectionTitle}"?
                  </p>
                  {deleteSectionConfirm.activityCount > 0 && (
                    <p className="text-red-600 text-sm mb-6">
                      Esta seção contém {deleteSectionConfirm.activityCount} atividade{deleteSectionConfirm.activityCount !== 1 ? 's' : ''} que também serão removidas
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteSectionConfirm(null)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium active:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteSectionConfirm}
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

        {/* Delete Section Confirmation Modal - Desktop */}
        {deleteSectionConfirm && (
          <div className="hidden lg:flex fixed inset-0 bg-black/50 items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="flex justify-end mb-2">
                <button 
                  onClick={() => setDeleteSectionConfirm(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirmar exclusão da seção</h3>
              <p className="text-gray-600 text-center mb-2">
                Tem certeza que deseja excluir a seção "{deleteSectionConfirm.sectionTitle}"?
              </p>
              {deleteSectionConfirm.activityCount > 0 && (
                <p className="text-red-600 text-sm text-center mb-6">
                  Esta seção contém {deleteSectionConfirm.activityCount} atividade{deleteSectionConfirm.activityCount !== 1 ? 's' : ''} que também serão removidas
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteSectionConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteSectionConfirm}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete All Confirmation Modal - Mobile */}
        <AnimatePresence>
          {deleteAllConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end"
              onClick={() => setDeleteAllConfirm(false)}
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
                      onClick={() => setDeleteAllConfirm(false)}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Apagar Tudo</h3>
                  <p className="text-gray-600 mb-6">
                    Tem certeza que deseja apagar todas as atividades? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteAllConfirm(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium active:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteAllConfirm}
                      className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium active:bg-red-600"
                    >
                      Apagar Tudo
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete All Confirmation Modal - Desktop */}
        {deleteAllConfirm && (
          <div className="hidden lg:flex fixed inset-0 bg-black/50 items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="flex justify-end mb-2">
                <button 
                  onClick={() => setDeleteAllConfirm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Apagar Tudo</h3>
              <p className="text-gray-600 text-center mb-6">
                Tem certeza que deseja apagar todas as atividades? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteAllConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAllConfirm}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Apagar Tudo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Confirmation Modal - Mobile */}
        <AnimatePresence>
          {resetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end"
              onClick={() => setResetConfirm(false)}
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
                      onClick={() => setResetConfirm(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100"
                      aria-label="Fechar"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <RotateCcw className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Restaurar Programa</h3>
                  <p className="text-gray-600 mb-6">
                    Tem certeza que deseja restaurar o programa padrão? Todas as alterações serão perdidas.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setResetConfirm(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium active:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={resetToDefault}
                      className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium active:bg-orange-600"
                    >
                      Restaurar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset Confirmation Modal - Desktop */}
        {resetConfirm && (
          <div className="hidden lg:flex fixed inset-0 bg-black/50 items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="flex justify-end mb-2">
                <button 
                  onClick={() => setResetConfirm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-orange-100 rounded-full mb-4">
                <RotateCcw className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Restaurar Programa</h3>
              <p className="text-gray-600 text-center mb-6">
                Tem certeza que deseja restaurar o programa padrão? Todas as alterações serão perdidas.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setResetConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={resetToDefault}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Restaurar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default ProgramPage;
