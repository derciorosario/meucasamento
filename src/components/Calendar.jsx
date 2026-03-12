import React, { useState, useEffect, useCallback } from 'react';
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  shareCalendarEvent,
  removeCalendarShare,
} from '../api/client';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Bell,
  Trash2,
  Edit3,
  Share2,
  Check,
  XCircle,
  List,
  Grid,
  AlertTriangle,
  Store,
} from 'lucide-react';

// Event categories with colors
const CATEGORIES = {
  wedding: { label: 'Casamento', color: '#9CAA8E' },
  meeting: { label: 'Reunião', color: '#3B82F6' },
  payment: { label: 'Pagamento', color: '#F59E0B' },
  vendor: { label: 'Fornecedor', color: '#8B5CF6' },
  guest: { label: 'Convidado', color: '#EC4899' },
  milestone: { label: 'Marco', color: '#10B981' },
  reminder: { label: 'Lembrete', color: '#EF4444' },
  other: { label: 'Outro', color: '#6B7280' },
};

// Month names in Portuguese
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Day names
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const Calendar = ({ userId, vendorId, vendors = [] }) => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [shareEventId, setShareEventId] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('read');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'list'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    location: '',
    category: 'other',
    color: '#9CAA8E',
    emailReminder: false,
    emailReminderMinutes: 60,
    vendorId: vendorId || '',
  });

  // Load events
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const params = {
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
      };
      
      // Only add vendorId filter if a specific vendor is selected
      if (vendorId) {
        params.vendorId = vendorId;
      }
      
      const response = await getCalendarEvents(params);
      
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  }, [currentDate, vendorId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Update event form vendorId when vendorId prop changes
  useEffect(() => {
    if (!showEventModal) {
      // Only update the default vendorId when modal is not open
      setEventForm(prev => ({
        ...prev,
        vendorId: vendorId || '',
      }));
    }
  }, [vendorId, showEventModal]);

  // Get days in month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const targetDate = new Date(date);
      
      return (
        targetDate >= new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate()) &&
        targetDate <= new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())
      );
    });
  };

  // Navigate to previous month
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Open event modal for new event
  const openNewEventModal = (date) => {
    const selectedDate = date || new Date();
    setEventForm({
      title: '',
      description: '',
      startDate: selectedDate.toISOString().split('T')[0],
      startTime: '09:00',
      endDate: selectedDate.toISOString().split('T')[0],
      endTime: '10:00',
      allDay: false,
      location: '',
      category: 'other',
      color: '#9CAA8E',
      emailReminder: false,
      emailReminderMinutes: 60,
      vendorId: vendorId || '',
    });
    setEditingEvent(null);
    setSelectedEvent(null);
    setShowEventDetails(false);
    setShowEventModal(true);
  };

  // Open event details dialog first, then edit
  const openEditEventModal = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  // Open edit form from details
  const openEditFromDetails = () => {
    if (!selectedEvent) return;
    
    const startDate = new Date(selectedEvent.startDate);
    const endDate = new Date(selectedEvent.endDate);
    
    setEventForm({
      title: selectedEvent.title,
      description: selectedEvent.description || '',
      startDate: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split('T')[0],
      endTime: endDate.toTimeString().slice(0, 5),
      allDay: selectedEvent.allDay || false,
      location: selectedEvent.location || '',
      category: selectedEvent.category || 'other',
      color: selectedEvent.color || '#9CAA8E',
      emailReminder: selectedEvent.reminders?.email?.enabled || false,
      emailReminderMinutes: selectedEvent.reminders?.email?.beforeMinutes || 60,
      vendorId: selectedEvent.vendor?._id || selectedEvent.vendor || '',
    });
    setEditingEvent(selectedEvent);
    setShowEventDetails(false);
    setShowEventModal(true);
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Auto-update color when category changes
    if (name === 'category') {
      setEventForm((prev) => ({
        ...prev,
        category: value,
        color: CATEGORIES[value]?.color || '#9CAA8E',
      }));
    }
  };

  // Save event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    
    // Validate vendor is selected
    if (!eventForm.vendorId) {
      toast.error('Por favor, selecione um fornecedor para o evento');
      return;
    }
    
    const startDateTime = eventForm.allDay
      ? new Date(eventForm.startDate)
      : new Date(`${eventForm.startDate}T${eventForm.startTime}`);
    
    const endDateTime = eventForm.allDay
      ? new Date(eventForm.endDate)
      : new Date(`${eventForm.endDate}T${eventForm.endTime}`);
    
    if (endDateTime < startDateTime) {
      toast.error('A data de fim não pode ser anterior à data de início');
      return;
    }
    
    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        allDay: eventForm.allDay,
        location: eventForm.location,
        category: eventForm.category,
        color: eventForm.color,
        vendorId: eventForm.vendorId || null,
        reminders: {
          email: {
            enabled: eventForm.emailReminder,
            beforeMinutes: parseInt(eventForm.emailReminderMinutes),
          },
          push: {
            enabled: false,
            beforeMinutes: 60,
          },
        },
      };
      
      if (editingEvent) {
        const response = await updateCalendarEvent(editingEvent._id, eventData);
        if (response.data.success) {
          toast.success('Evento atualizado com sucesso');
        }
      } else {
        const response = await createCalendarEvent(eventData);
        if (response.data.success) {
          toast.success('Evento criado com sucesso');
        }
      }
      
      setShowEventModal(false);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao guardar evento');
      }
    }
  };

  // Delete event - show confirmation dialog
  const handleDeleteEvent = (eventId) => {
    setEventToDelete(eventId);
    setShowDeleteConfirm(true);
  };

  // Confirm delete event
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      const response = await deleteCalendarEvent(eventToDelete);
      if (response.data.success) {
        toast.success('Evento eliminado com sucesso');
        loadEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erro ao eliminar evento');
    } finally {
      setShowDeleteConfirm(false);
      setEventToDelete(null);
      setShowEventDetails(false);
      setSelectedEvent(null);
      setEditingEvent(null)
      setShowEventModal(false)
    }
  };

  // Share event
  const handleShareEvent = async (e) => {
    e.preventDefault();
    
    if (!shareEmail) {
      toast.error('Por favor, insira um email');
      return;
    }
    
    try {
      const response = await shareCalendarEvent(shareEventId, shareEmail, sharePermission);
      if (response.data.success) {
        toast.success('Evento partilhado com sucesso');
        setShowShareModal(false);
        setShareEmail('');
      }
    } catch (error) {
      console.error('Error sharing event:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao partilhar evento');
      }
    }
  };

  // Handle drag and drop
  const handleDragStart = (e, event) => {
    e.dataTransfer.setData('eventId', event._id);
  };

  const handleDrop = async (e, date) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    
    if (!eventId) return;
    
    const event = events.find((ev) => ev._id === eventId);
    if (!event) return;
    
    // Calculate time difference
    const originalStart = new Date(event.startDate);
    const originalEnd = new Date(event.endDate());
    const duration = originalEnd - originalStart;
    
    const newStart = new Date(date);
    newStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
    
    const newEnd = new Date(newStart.getTime() + duration);
    
    try {
      const response = await updateCalendarEvent(eventId, {
        startDate: newStart.toISOString(),
        endDate: newEnd.toISOString(),
      });
      
      if (response.data.success) {
        toast.success('Evento movido com sucesso');
        loadEvents();
      }
    } catch (error) {
      console.error('Error moving event:', error);
      toast.error('Erro ao mover evento');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const days = getDaysInMonth();
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2 uppercase"
          >
            {day}
          </div>
        ))}
        
        {/* Day cells */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const isCurrentDay = isToday(day.date);
          
          return (
            <div
              key={index}
              className={`
                min-h-[80px] md:min-h-[100px] p-1 border border-gray-100 rounded-lg cursor-pointer
                transition-colors hover:bg-gray-50
                ${!day.isCurrentMonth ? 'bg-gray-30' : 'bg-white'}
                ${isCurrentDay ? 'ring-2 ring-[#9CAA8E] ring-inset' : ''}
              `}
              onClick={() => openNewEventModal(day.date)}
              onDrop={(e) => handleDrop(e, day.date)}
              onDragOver={handleDragOver}
            >
              <div className={`
                text-xs md:text-sm font-medium mb-1
                ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${isToday(day.date) ? 'text-[#9CAA8E] font-bold' : ''}
              `}>
                {day.date.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event)}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditEventModal(event);
                    }}
                    className="text-[10px] md:text-xs px-1 py-0.5 rounded truncate text-white cursor-move"
                    style={{ backgroundColor: event.color || CATEGORIES[event.category]?.color }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-gray-500">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    );

    if (sortedEvents.length === 0) {
      return (
        <div className="text-center py-12">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum evento encontrado</p>
          <p className="text-sm text-gray-400 mt-1">Clique em "Novo Evento" para criar</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {sortedEvents.map((event) => (
          <div
            key={event._id}
            onClick={() => openEditEventModal(event)}
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
          >
            <div 
              className="w-1 h-12 rounded-full"
              style={{ backgroundColor: event.color || CATEGORIES[event.category]?.color }}
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-black truncate">{event.title}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(event.startDate).toLocaleDateString('pt-PT', { 
                    day: '2-digit', month: 'short', year: 'numeric' 
                  })}
                  {event.allDay ? ' - Todo o dia' : ` - ${new Date(event.startDate).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>
            <span 
              className="px-2 py-1 text-xs rounded-full text-white"
              style={{ backgroundColor: CATEGORIES[event.category]?.color }}
            >
              {CATEGORIES[event.category]?.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-serif font-semibold text-black">
            {viewMode === 'month' ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}` : 'Eventos'}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'month' ? 'bg-white shadow-sm text-[#9CAA8E]' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Vista de mês"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-[#9CAA8E]' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Vista de lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-[#9CAA8E] hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Add Event Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => openNewEventModal(new Date())}
          className="flex items-center gap-2 px-4 py-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Evento
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-[#9CAA8E] border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Calendar Grid or List View */}
      {!loading && (
        viewMode === 'month' ? renderCalendarGrid() : renderListView()
      )}

      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">
                    {editingEvent ? 'Editar Evento' : 'Novo Evento'}
                  </h3>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSaveEvent} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={eventForm.title}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                      placeholder="Nome do evento"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      name="description"
                      value={eventForm.description}
                      onChange={handleFormChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                      placeholder="Descrição do evento"
                    />
                  </div>

                  {/* All day checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="allDay"
                      id="allDay"
                      checked={eventForm.allDay}
                      onChange={handleFormChange}
                      className="w-4 h-4 text-[#9CAA8E] focus:ring-[#9CAA8E]"
                    />
                    <label htmlFor="allDay" className="text-sm text-gray-700">
                      Todo o dia
                    </label>
                  </div>

                  {/* Date and Time */}
                  <div className={`grid gap-4 ${eventForm.allDay ? 'grid-cols-1':'grid-cols-2'}  max-sm:grid-cols-1`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Início
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={eventForm.startDate}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                      />
                    </div>
                    {!eventForm.allDay && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora de Início
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={eventForm.startTime}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                        />
                      </div>
                    )}
                  </div>

                  <div className={`grid ${eventForm.allDay ? 'grid-cols-1':'grid-cols-2'} gap-4 max-sm:grid-cols-1`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Fim
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={eventForm.endDate}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                      />
                    </div>
                    {!eventForm.allDay && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora de Fim
                        </label>
                        <input
                          type="time"
                          name="endTime"
                          value={eventForm.endTime}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                        />
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      name="category"
                      value={eventForm.category}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white"
                    >
                      {Object.entries(CATEGORIES).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vendor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fornecedor <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="vendorId"
                      value={eventForm.vendorId}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white"
                    >
                      <option value="">Selecione um fornecedor</option>
                      {vendors.map((vendor) => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Localização
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={eventForm.location}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                      placeholder="Endereço ou local"
                    />
                  </div>

                  {/* Email Reminder */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Lembrete por Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="emailReminder"
                        id="emailReminder"
                        checked={eventForm.emailReminder}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-[#9CAA8E] focus:ring-[#9CAA8E]"
                      />
                      <label htmlFor="emailReminder" className="text-sm text-gray-600">
                        Enviar lembrete
                      </label>
                      {eventForm.emailReminder && (
                        <select
                          name="emailReminderMinutes"
                          value={eventForm.emailReminderMinutes}
                          onChange={handleFormChange}
                          className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded text-black"
                        >
                          <option value={15}>15 minutos antes</option>
                          <option value={30}>30 minutos antes</option>
                          <option value={60}>1 hora antes</option>
                          <option value={120}>2 horas antes</option>
                          <option value={1440}>1 dia antes</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    {editingEvent && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setShareEventId(editingEvent._id);
                            setShowShareModal(true);
                          }}
                          className="flex hidden items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          <Share2 className="w-4 h-4" />
                          Partilhar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(editingEvent._id)}
                          className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </>
                    )}
                    <div className="flex-1"></div>
                    <button
                      type="button"
                      onClick={() => setShowEventModal(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E]"
                    >
                      {editingEvent ? 'Atualizar' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Details Dialog */}
      <AnimatePresence>
        {showEventDetails && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEventDetails(false);
              setSelectedEvent(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">Detalhes do Evento</h3>
                  <button
                    onClick={() => {
                      setShowEventDetails(false);
                      setSelectedEvent(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Event Title */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedEvent.color || CATEGORIES[selectedEvent.category]?.color }}
                    />
                    <h4 className="text-xl font-semibold text-black">{selectedEvent.title}</h4>
                  </div>

                  {/* Category Badge */}
                  <div>
                    <span 
                      className="inline-block px-3 py-1 text-sm rounded-full text-white"
                      style={{ backgroundColor: CATEGORIES[selectedEvent.category]?.color }}
                    >
                      {CATEGORIES[selectedEvent.category]?.label}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-black">
                        {new Date(selectedEvent.startDate).toLocaleDateString('pt-PT', { 
                          weekday: 'long',
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {selectedEvent.allDay 
                          ? 'Todo o dia' 
                          : `${new Date(selectedEvent.startDate).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedEvent.endDate).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {selectedEvent.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <p className="text-black">{selectedEvent.location}</p>
                    </div>
                  )}

                  {/* Description */}
                  {selectedEvent.description && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">Descrição</p>
                      <p className="text-black">{selectedEvent.description}</p>
                    </div>
                  )}

                  {/* Reminder */}
                  {selectedEvent.reminders?.email?.enabled && (
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-600 text-sm">
                        Lembrete: {selectedEvent.reminders.email.beforeMinutes >= 60 
                          ? `${selectedEvent.reminders.email.beforeMinutes / 60} hora(s) antes` 
                          : `${selectedEvent.reminders.email.beforeMinutes} minutos antes`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openEditFromDetails()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E]"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar
                  </button>

                   <button
                          type="button"
                          onClick={() => handleDeleteEvent(selectedEvent._id)}
                          className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>

                  <button
                    onClick={() => {
                      setShareEventId(selectedEvent._id);
                      setShowEventDetails(false);
                      setShowShareModal(true);
                    }}
                    className="flex hidden items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Share2 className="w-4 h-4" />
                    Partilhar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black">Partilhar Evento</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleShareEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email do utilizador
                  </label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permissão
                  </label>
                  <select
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white"
                  >
                    <option value="read">Apenas leitura</option>
                    <option value="write">Leitura e escrita</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 hidden px-4 py-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E]"
                  >
                    Partilhar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowDeleteConfirm(false);
              setEventToDelete(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                {/* Warning Icon */}
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-black mb-2">
                  Eliminar Evento
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja eliminar este evento? Esta ação não pode ser desfeita.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setEventToDelete(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteEvent}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
