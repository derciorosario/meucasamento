import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getAllInspirationCards, 
  createInspirationCard, 
  updateInspirationCard, 
  deleteInspirationCard,
  toggleInspirationCard,
  uploadInspirationImage,
  reorderInspirationCards,
  API_URL
} from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Loader from '../../components/loader';
import { toast } from 'react-hot-toast';
import { 
  GripVertical, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Grid,
  Layers,
  Sparkles,
  Search,
  Filter,
  Menu,
  ChevronDown
} from 'lucide-react';

const AdminInspiration = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    category: 'dica',
    image: '',
    isActive: true
  });

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showSlider, setShowSlider] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Get cards with images for slider
  const cardsWithImages = cards.filter(card => card.image);

  const categoryOptions = [
    { value: 'dica', label: 'Dica', color: 'blue', icon: '💡', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
    { value: 'inspiracao', label: 'Inspiração', color: 'purple', icon: '✨', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
    { value: 'conselho', label: 'Conselho', color: 'green', icon: '🤝', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
    { value: 'planeamento', label: 'Planeamento', color: 'amber', icon: '📋', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
    { value: 'outro', label: 'Outro', color: 'gray', icon: '📌', bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-200' }
  ];

  const getCategoryColor = (category) => {
    const cat = categoryOptions.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  const getCategoryIcon = (category) => {
    const cat = categoryOptions.find(c => c.value === category);
    return cat?.icon || '📌';
  };

  const getCategoryStyles = (category) => {
    const cat = categoryOptions.find(c => c.value === category);
    return {
      bg: cat?.bgColor || 'bg-gray-50',
      text: cat?.textColor || 'text-gray-700',
      border: cat?.borderColor || 'border-gray-200'
    };
  };

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchCards();
  }, [currentUser]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await getAllInspirationCards();
      setCards(response.data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Erro ao carregar cartões');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData({ ...formData, image: previewUrl });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImage = formData.image;
      if (selectedFile) {
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', selectedFile);
        const uploadRes = await uploadInspirationImage(formDataUpload);
        if (uploadRes.data.success) {
          finalImage = uploadRes.data.url;
        }
        setUploading(false);
      }

      const cardData = {
        ...formData,
        image: finalImage
      };

      if (editingCard) {
        await updateInspirationCard(editingCard, cardData);
        toast.success('Cartão atualizado com sucesso');
      } else {
        await createInspirationCard(cardData);
        toast.success('Cartão criado com sucesso');
      }
      
      setShowModal(false);
      resetForm();
      fetchCards();
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error('Erro ao salvar cartão');
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'dica', image: '', isActive: true });
    setSelectedFile(null);
    setImagePreview(null);
    setEditingCard(null);
  };

  const handleEdit = (card) => {
    let img=`${!card.image?.includes('http') && card.image ? `${API_URL}${card.image}`:card.image}` || ''
    setEditingCard(card._id);
    setFormData({
      title: card.title,
      content: card.content,
      category: card.category || 'dica',
      image: img || '',
      isActive: card.isActive
    });
    setImagePreview(img);
    setShowModal(true);
  };

  const handleDelete = async (cardId) => {
    try {
      await deleteInspirationCard(cardId);
      toast.success('Cartão excluído com sucesso');
      setShowDeleteConfirm(null);
      fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Erro ao excluir cartão');
    }
  };

  const handleToggle = async (cardId) => {
    try {
      await toggleInspirationCard(cardId);
      toast.success('Status alterado com sucesso');
      fetchCards();
    } catch (error) {
      console.error('Error toggling card:', error);
      toast.error('Erro ao alterar status');
    }
  };

  // Drag and drop handlers with mobile detection
  const handleDragStart = (index) => {
    if (window.innerWidth < 768) return; // Disable drag on mobile
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (window.innerWidth < 768) return;
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newCards = [...cards];
    const draggedCard = newCards[draggedIndex];
    newCards.splice(draggedIndex, 1);
    newCards.splice(index, 0, draggedCard);
    setCards(newCards);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setIsDragging(false);
    if (window.innerWidth < 768) return;
    if (draggedIndex === null) return;
    
    try {
      const cardIds = cards.map(card => card._id);
      await reorderInspirationCards(cardIds);
      toast.success('Ordem atualizada com sucesso');
    } catch (error) {
      console.error('Error reordering cards:', error);
      toast.error('Erro ao reordenar cartões');
      fetchCards();
    }
    
    setDraggedIndex(null);
  };

  // Slider handlers
  const openSlider = (index) => {
    const imageCards = cards.filter(card => card.image);
    const originalIndex = cards.indexOf(imageCards[index]);
    setSliderIndex(originalIndex);
    setShowSlider(true);
  };

  const nextSlide = () => {
    setSliderIndex((prev) => (prev + 1) % cards.length);
  };

  const prevSlide = () => {
    setSliderIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  // Filter cards
  const filteredCards = cards.filter(card => {
    const matchesCategory = filterCategory === 'all' || card.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && card.isActive) || 
      (filterStatus === 'inactive' && !card.isActive);
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const stats = {
    total: cards.length,
    active: cards.filter(c => c.isActive).length,
    inactive: cards.filter(c => !c.isActive).length,
    withImage: cards.filter(c => c.image).length
  };

  if (loading) return <Loader />;
  if (currentUser?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Header with title and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-[#9CAA8E]/10 rounded-xl">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#9CAA8E]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Cartões de Inspiração</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Gerencie e organize todo o conteúdo</p>
              </div>
            </div>
            
            {/* Action buttons - stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link 
                to="/admin" 
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>Voltar</span>
              </Link>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-[#9CAA8E] to-[#8a9a7e] text-white rounded-lg hover:shadow-lg hover:shadow-[#9CAA8E]/30 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px] group-hover:rotate-90 transition-transform duration-200" />
                <span className="whitespace-nowrap">Adicionar</span>
              </button>
            </div>
          </div>

          {/* Stats Cards - Responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Ativos</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Inativos</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-600">{stats.inactive}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">C/ Imagem</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.withImage}</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters - Mobile friendly */}
          <div className="mt-4 sm:mt-6">
            {/* Mobile filter toggle */}
            <div className="sm:hidden mb-3">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-gray-700"
              >
                <div className="flex items-center gap-2">
                  <Filter size={18} />
                  <span>Filtros</span>
                </div>
                <ChevronDown size={18} className={`transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filter inputs - responsive layout */}
            <div className={`space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4 ${showMobileFilters ? 'block' : 'hidden sm:flex'}`}>
              {/* Search input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cartões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                />
              </div>

              {/* Category filter */}
              <div className="relative sm:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent bg-white text-gray-900 appearance-none cursor-pointer text-sm sm:text-base"
                >
                  <option value="all">Todas categorias</option>
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-36 px-4 py-2.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent bg-white text-gray-900 cursor-pointer text-sm sm:text-base"
              >
                <option value="all">Todos status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header with count and drag hint */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <Grid size={14} className="sm:w-4 sm:h-4" />
            <span>{filteredCards.length} cartões encontrados</span>
          </div>
          <p className="hidden sm:flex text-xs sm:text-sm text-gray-400 items-center gap-1">
            <GripVertical size={14} />
            Arraste os cartões para reordenar
          </p>
          <p className="sm:hidden text-xs text-gray-400">
            Toque e segure para reordenar (não disponível em mobile)
          </p>
        </div>

        {/* Cards list */}
        <div className="space-y-3">
          {filteredCards.map((card, index) => {
            const categoryStyles = getCategoryStyles(card.category);
            return (
              <div 
                key={card._id} 
                draggable={window.innerWidth >= 768}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  group bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md border border-gray-100 
                  transition-all duration-200 overflow-hidden
                  ${!card.isActive ? 'opacity-75' : ''} 
                  ${draggedIndex === index ? 'scale-105 shadow-lg ring-2 ring-[#9CAA8E]' : ''} 
                  ${window.innerWidth >= 768 ? 'cursor-move' : 'cursor-default'}
                `}
              >
                {/* Mobile layout - stacked */}
                <div className="sm:hidden">
                  {/* Image for mobile - full width if exists */}
                  {card.image && (
                    <div 
                      className="w-full h-40 cursor-pointer relative"
                      onClick={() => openSlider(index)}
                    >
                      <img 
                        src={card.image.startsWith('http') && !card.image.startsWith('blob:') ? card.image : `${API_URL}${card.image}`}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Content for mobile */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{card.title}</h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${categoryStyles.bg} ${categoryStyles.text} border ${categoryStyles.border}`}>
                          {getCategoryIcon(card.category)} {categoryOptions.find(c => c.value === card.category)?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleToggle(card._id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            card.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {card.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button 
                          onClick={() => handleEdit(card)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(card._id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">{card.content}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Posição: {index + 1}</span>
                      {card.image && (
                        <span className="flex items-center gap-1">
                          <ImageIcon size={10} />
                          <span>Com imagem</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop layout - horizontal */}
                <div className="hidden sm:flex">
                  {/* Drag Handle */}
                  <div className="w-12 flex items-center justify-center bg-gray-50 border-r border-gray-100 group-hover:bg-gray-100 transition-colors">
                    <GripVertical size={20} className="text-gray-400" />
                  </div>

                  {/* Image Preview */}
                  {card.image && (
                    <div 
                      className="w-32 h-32 flex-shrink-0 cursor-pointer relative group/image"
                      onClick={() => openSlider(index)}
                    >
                      <img 
                        src={card.image.startsWith('http') && !card.image.startsWith('blob:') ? card.image : `${API_URL}${card.image}`}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{card.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${categoryStyles.bg} ${categoryStyles.text} border ${categoryStyles.border}`}>
                        <span>{getCategoryIcon(card.category)}</span>
                        <span>{categoryOptions.find(c => c.value === card.category)?.label}</span>
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{card.content}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-400">Posição: {index + 1}</span>
                      {card.image && (
                        <span className="text-gray-400 flex items-center gap-1">
                          <ImageIcon size={12} />
                          <span>Com imagem</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 p-4 bg-gray-50 border-l border-gray-100">
                    <button 
                      onClick={() => handleToggle(card._id)}
                      className={`
                        p-2 rounded-lg transition-all duration-200
                        ${card.isActive 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
                      `}
                      title={card.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {card.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button 
                      onClick={() => handleEdit(card)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(card._id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredCards.length === 0 && (
          <div className="text-center py-8 sm:py-16 bg-white rounded-xl border border-gray-200">
            <div className="flex flex-col items-center px-4">
              <div className="p-3 sm:p-4 bg-gray-100 rounded-full mb-3 sm:mb-4">
                <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Nenhum cartão encontrado</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Tente ajustar seus filtros ou criar um novo cartão</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8a9a7e] transition-colors flex items-center gap-2"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>Criar Primeiro Cartão</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal - Responsive */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Confirmar Exclusão</h3>
              </div>
              
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.
              </p>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  <Trash2 size={16} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal - Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-[#9CAA8E]/10 to-transparent">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                {editingCard ? (
                  <>
                    <Edit size={18} className="sm:w-5 sm:h-5 text-[#9CAA8E]" />
                    <span>Editar Cartão</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} className="sm:w-5 sm:h-5 text-[#9CAA8E]" />
                    <span>Adicionar Cartão</span>
                  </>
                )}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4 sm:space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                    placeholder="Digite o título do cartão"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Conteúdo <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                    rows="4"
                    placeholder="Digite o conteúdo do cartão"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent bg-white text-gray-900 cursor-pointer"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Imagem
                  </label>
                  
                  {/* Image Preview */}
                  {(imagePreview || formData.image) && (
                    <div className="mb-3 relative inline-block">
                      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                        <img 
                          src={imagePreview || formData.image} 
                          alt="Preview" 
                          className="w-24 h-24 sm:w-32 sm:h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image: '' });
                            setSelectedFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 sm:p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 sm:p-4 hover:border-[#9CAA8E] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-1 sm:mb-2" />
                      <span className="text-xs sm:text-sm text-gray-600 text-center">Clique para fazer upload</span>
                      <span className="text-xs text-gray-400 mt-0.5 sm:mt-1 text-center">JPG, PNG, GIF até 5MB</span>
                    </label>
                  </div>

                  {/* URL Input */}
                  <div className="mt-3 hidden">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                      <LinkIcon size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span>Ou insira uma URL</span>
                    </div>
                    <input
                      type="text"
                      value={!selectedFile ? formData.image : ''}
                      onChange={(e) => {
                        if (!selectedFile) {
                          setFormData({ ...formData, image: e.target.value });
                        }
                      }}
                      placeholder="https://exemplo.com/imagem.jpg"
                      disabled={!!selectedFile}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent bg-white text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-[#9CAA8E] focus:ring-[#9CAA8E]"
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="text-xs sm:text-sm text-gray-700 select-none">
                    Cartão ativo (visível no site)
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-[#9CAA8E] to-[#8a9a7e] text-white rounded-lg hover:shadow-lg hover:shadow-[#9CAA8E]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>A carregar...</span>
                    </>
                  ) : (
                    <>
                      {editingCard ? <Edit size={14} className="sm:w-4 sm:h-4" /> : <Plus size={14} className="sm:w-4 sm:h-4" />}
                      <span>{editingCard ? 'Atualizar' : 'Criar'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Slider Modal - Responsive */}
      {showSlider && cards[sliderIndex] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          {/* Close button */}
          <button 
            onClick={() => setShowSlider(false)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-10 group"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Navigation arrows - hidden on mobile, use swipe instead */}
          <button 
            onClick={prevSlide}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center transition-all duration-200 backdrop-blur-sm group"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
          </button>

          <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-5xl">
              <img 
                src={cards[sliderIndex].image?.startsWith('http') && !cards[sliderIndex].image?.startsWith('blob:') ? cards[sliderIndex].image : `${API_URL}${cards[sliderIndex].image}`}
                alt={cards[sliderIndex].title}
                className="w-full h-auto max-h-[60vh] sm:max-h-[70vh] object-contain rounded-lg"
              />
              
              {/* Image Info - simplified on mobile */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-6">
                <h3 className="text-white font-semibold text-sm sm:text-xl line-clamp-1">{cards[sliderIndex].title}</h3>
                <p className="text-white/80 text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none">
                  {cards[sliderIndex].content}
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={nextSlide}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center transition-all duration-200 backdrop-blur-sm group"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Mobile swipe hint */}
          <div className="sm:hidden absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-xs">
            Deslize para navegar
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2">
            {cards.filter(c => c.image).map((_, idx) => {
              const originalIndex = cards.indexOf(cards.filter(c => c.image)[idx]);
              return (
                <button
                  key={idx}
                  onClick={() => setSliderIndex(originalIndex)}
                  className={`transition-all duration-300 ${
                    originalIndex === sliderIndex 
                      ? 'w-4 sm:w-8 h-1 sm:h-2 bg-white rounded-full' 
                      : 'w-1 sm:w-2 h-1 sm:h-2 bg-white/50 rounded-full hover:bg-white/80'
                  }`}
                />
              );
            })}
          </div>

          {/* Counter */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm rounded-full">
            {cards.filter(c => c.image).findIndex((c) => cards.indexOf(c) === sliderIndex) + 1} / {cards.filter(c => c.image).length}
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminInspiration;