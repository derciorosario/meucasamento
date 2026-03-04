import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layout/DefaultLayout';
import { API_URL, getTutorials } from '../../api/client';
import { Plus, Gift, Search, Share2, QrCode, Trash2, Edit2, Check, X, Image, DollarSign, LayoutGrid, List, Table, Loader2, Download, Copy, Play, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = ['Todos', 'Cozinha', 'Quarto', 'Sala', 'Casa', 'Eletrodomésticos', 'Outros'];

const WeddingGifts = () => {
  const navigate = useNavigate();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, giftId: null, giftName: '' });
  const [editingGift, setEditingGift] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState({
    totalGifts: 0,
    claimedGifts: 0,
    totalValue: 0,
    claimedValue: 0,
  });
  const [shareCode, setShareCode] = useState(null);
  const fileInputRef = useRef(null);
  
  // Tutorial video state
  const [giftsTutorial, setGiftsTutorial] = useState(null);
  const [showTutorialDropdown, setShowTutorialDropdown] = useState(false);
  const [showTutorialDesktop, setShowTutorialDesktop] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    imageUrl: '',
    category: 'Cozinha',
    isPublic: false,
    claimedBy: '',
    status: 'available',
  });

  // Fetch gifts from API
  useEffect(() => {
    fetchGifts();
    fetchTutorial();
  }, [selectedCategory, searchTerm]);

  // Helper function to extract YouTube video ID
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Fetch tutorial video
  const fetchTutorial = async () => {
    try {
      const tutorialsRes = await getTutorials();
      if (tutorialsRes.data?.tutorialVideos?.gifts) {
        const videoId = extractYouTubeId(tutorialsRes.data.tutorialVideos.gifts);
        setGiftsTutorial({
          url: tutorialsRes.data.tutorialVideos.gifts,
          videoId
        });
      }
    } catch (tutError) {
      console.log('No tutorial videos available for gifts');
    }
  };

  const fetchGifts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'Todos') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`${API_URL}/gifts?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setGifts(data.data.gifts);
        setStats(data.data.stats);
        
        // Get share code from first gift if exists
        const publicGift = data.data.gifts.find(g => g.isPublic && g.shareCode);
        if (publicGift) {
          setShareCode(publicGift.shareCode);
        }
      }
    } catch (error) {
      console.error('Error fetching gifts:', error);
      toast.error('Erro ao carregar presentes');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await fetch(`${API_URL}/gifts/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          ...formData,
          image: data.data,
          imageUrl: data.data.url,
        });
        toast.success('Imagem carregada com sucesso!');
      } else {
        toast.error(data.message || 'Erro ao carregar imagem');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Add new gift
  const handleAddGift = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/gifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price || 0,
          category: formData.category,
          isPublic: formData.isPublic,
          image: formData.image,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Presente adicionado com sucesso!');
        setShowAddModal(false);
        setFormData({
          name: '',
          description: '',
          price: '',
          image: null,
          imageUrl: '',
          category: 'Cozinha',
          isPublic: false,
          claimedBy: '',
          status: 'available',
        });
        fetchGifts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error adding gift:', error);
      toast.error('Erro ao adicionar presente');
    }
  };

  // Edit gift
  const handleEditGift = (gift) => {
    setEditingGift(gift);
    setFormData({
      name: gift.name,
      description: gift.description || '',
      price: gift.price?.toString() || '',
      image: gift.image,
      imageUrl: gift.image?.url || '',
      category: gift.category,
      isPublic: gift.isPublic,
      claimedBy: gift.claimedBy || '',
      status: gift.status || 'available',
    });
    setShowAddModal(true);
  };

  // Update gift
  const handleUpdateGift = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/gifts/${editingGift._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price || 0,
          category: formData.category,
          isPublic: formData.isPublic,
          image: formData.image,
          claimedBy: formData.claimedBy || null,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Presente atualizado com sucesso!');
        setShowAddModal(false);
        setEditingGift(null);
        setFormData({
          name: '',
          description: '',
          price: '',
          image: null,
          imageUrl: '',
          category: 'Cozinha',
          isPublic: false,
          claimedBy: '',
          status: 'available',
        });
        fetchGifts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating gift:', error);
      toast.error('Erro ao atualizar presente');
    }
  };

  // Download QR Code
  const downloadQRCode = async () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'lista-presentes-qrcode.png';
      link.click();
      window.URL.revokeObjectURL(link.href);
      toast.success('QR Code descargado com sucesso');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Erro ao descargar QR Code');
    }
  };

  // Delete gift
  const handleDeleteGift = async () => {
    if (!deleteConfirm.giftId) return;

    try {
      const response = await fetch(`${API_URL}/gifts/${deleteConfirm.giftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Presente excluído com sucesso!');
        fetchGifts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting gift:', error);
      toast.error('Erro ao excluir presente');
    } finally {
      setDeleteConfirm({ show: false, giftId: null, giftName: '' });
    }
  };

  // Generate share URL
  const shareUrl = shareCode 
    ? `${window.location.origin}/gifts/shared/${shareCode}` 
    : `${window.location.origin}/gifts/shared/demo`;

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gifts.map((gift) => (
        <div
          key={gift._id}
          className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${
            gift.status === 'claimed' ? 'opacity-75' : ''
          }`}
        >
          {/* Gift Image */}
          <div className="h-48 bg-gray-100 flex items-center justify-center relative">
            {gift.image?.url ? (
              <img src={`${API_URL}${gift.image.url}`} alt={gift.name} className="w-full h-full object-cover" />
            ) : (
              <Gift className="w-16 h-16 text-gray-300" />
            )}
            {/* Status Badge */}
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${
              gift.status === 'claimed'
                ? 'bg-green-100 text-green-700'
                : 'bg-[#9CAA8E]/10 text-[#9CAA8E]'
            }`}>
              {gift.status === 'claimed' ? 'Reservado' : 'Disponível'}
            </div>
          </div>

          {/* Gift Info */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{gift.name}</h3>
                <p className="text-sm text-gray-500">{gift.category}</p>
              </div>
              {gift.price > 0 && (
                <p className="text-lg font-bold text-[#9CAA8E]">
                  {gift.price.toLocaleString('pt-MZ')} MT
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {gift.description}
            </p>

            {/* Claimed By */}
            {gift.claimedBy && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Reservado por: <span className="font-medium">{gift.claimedBy}</span>
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEditGift(gift)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => setDeleteConfirm({ show: true, giftId: gift._id, giftName: gift.name })}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render list view
  const renderListView = () => (
    <div className="space-y-4">
      {gifts.map((gift) => (
        <div
          key={gift._id}
          className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${
            gift.status === 'claimed' ? 'opacity-75' : ''
          }`}
        >
          <div className="flex">
            {/* Gift Image */}
            <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {gift.image?.url ? (
                <img src={`${API_URL}${gift.image.url}`} alt={gift.name} className="w-full h-full object-cover" />
              ) : (
                <Gift className="w-10 h-10 text-gray-300" />
              )}
            </div>

            {/* Gift Info */}
            <div className="flex-1 p-4 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{gift.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      gift.status === 'claimed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-[#9CAA8E]/10 text-[#9CAA8E]'
                    }`}>
                      {gift.status === 'claimed' ? 'Reservado' : 'Disponível'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{gift.category}</p>
                </div>
                {gift.price > 0 && (
                  <p className="text-lg font-bold text-[#9CAA8E] flex-shrink-0">
                    {gift.price.toLocaleString('pt-MZ')} MT
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {gift.description}
              </p>

              <div className="flex items-center justify-between gap-2">
                {gift.claimedBy && (
                  <span className="text-xs text-green-600 font-medium truncate">
                    ✓ Reservado por {gift.claimedBy}
                  </span>
                )}
                <div className="flex gap-1 ml-auto flex-shrink-0">
                  <button
                    onClick={() => handleEditGift(gift)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ show: true, giftId: gift._id, giftName: gift.name })}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render table view
  const renderTableView = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Presente</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Categoria</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Preço</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Reservado por</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gifts.map((gift) => (
              <tr key={gift._id} className={`hover:bg-gray-50 ${gift.status === 'claimed' ? 'opacity-75' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {gift.image?.url ? (
                        <img src={`${API_URL}${gift.image.url}`} alt={gift.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Gift className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{gift.name}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{gift.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{gift.category}</td>
                <td className="px-6 py-4">
                  {gift.price > 0 ? (
                    <span className="font-semibold text-[#9CAA8E]">{gift.price.toLocaleString('pt-MZ')} MT</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    gift.status === 'claimed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-[#9CAA8E]/10 text-[#9CAA8E]'
                  }`}>
                    {gift.status === 'claimed' ? 'Reservado' : 'Disponível'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {gift.claimedBy || '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEditGift(gift)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ show: true, giftId: gift._id, giftName: gift.name })}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DefaultLayout hero={{title:"Presentes",subtitle:"Organize e compartilhe sua lista de presentes com seus convidados"}}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-[#9CAA8E] animate-spin" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout hero={{title:"Presentes",subtitle:"Organize e compartilhe sua lista de presentes com seus convidados"}}>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Lista de Presentes
            </h1>
          
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-[#9CAA8E]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGifts}</p>
                  <p className="text-sm text-gray-500">Total de Presentes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.claimedGifts}</p>
                  <p className="text-sm text-gray-500">Presentes Reservados</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalValue.toLocaleString('pt-MZ')}</p>
                  <p className="text-sm text-gray-500">Valor Total</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.claimedValue.toLocaleString('pt-MZ')}</p>
                  <p className="text-sm text-gray-500">Valor Reservado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar presentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors"
              >
                <QrCode className="w-5 h-5" />
                Compartilhar
              </button>
              <button
                onClick={() => {
                  setEditingGift(null);
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    image: null,
                    imageUrl: '',
                    category: 'Cozinha',
                    isPublic: false,
                    claimedBy: '',
                    status: 'available',
                  });
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-[#9CAA8E] text-white rounded-xl hover:bg-[#8A9A7E] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Adicionar Presente
              </button>
            </div>
          </div>

          {/* Tutorial Video - Desktop Only */}
          {giftsTutorial && (
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
                    src={`https://www.youtube.com/embed/${giftsTutorial.videoId}`}
                    title="Tutorial Video"
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          )}

          {/* Category Filter and View Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#9CAA8E] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-[#9CAA8E] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-[#9CAA8E] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-[#9CAA8E] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Table className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Gift Content based on view mode */}
          {viewMode === 'grid' && renderGridView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'table' && renderTableView()}

          {/* Empty State */}
          {gifts.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum presente encontrado
              </h3>
              <p className="text-gray-500 mb-6">
                Adicione presentes à sua lista para começar
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#9CAA8E] text-white rounded-xl hover:bg-[#8A9A7E] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Adicionar Presente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="px-4 py-6">
          {/* Mobile Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1">
              Lista de Presentes
            </h1>
            <p className="text-sm text-gray-600">
              Organize e compartilhe sua lista
            </p>
          </div>

          {/* Mobile Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Gift className="w-5 h-5 text-[#9CAA8E] mb-2" />
              <p className="text-xl font-bold text-gray-900">{stats.totalGifts}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Check className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-xl font-bold text-gray-900">{stats.claimedGifts}</p>
              <p className="text-xs text-gray-500">Reservados</p>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar presentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
            />
          </div>

          {/* Tutorial Video - Mobile Only */}
          {giftsTutorial && (
            <div className="lg:hidden mb-4">
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
                    src={`https://www.youtube.com/embed/${giftsTutorial.videoId}`}
                    title="Tutorial Video"
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          )}

          {/* Mobile Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#9CAA8E] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors"
            >
              <QrCode className="w-5 h-5" />
              Compartilhar
            </button>
            <button
              onClick={() => {
                setEditingGift(null);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  image: null,
                  imageUrl: '',
                  category: 'Cozinha',
                  isPublic: false,
                });
                setShowAddModal(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#9CAA8E] text-white rounded-xl hover:bg-[#8A9A7E] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>

          {/* Mobile Gift List */}
          <div className="space-y-4">
            {gifts.map((gift) => (
              <div
                key={gift._id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
                  gift.status === 'claimed' ? 'opacity-75' : ''
                }`}
              >
                <div className="flex">
                  {/* Gift Image */}
                  <div className="w-24 h-24 bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {gift.image?.url ? (
                      <img src={`${API_URL}${gift.image.url}`} alt={gift.name} className="w-full h-full object-cover" />
                    ) : (
                      <Gift className="w-10 h-10 text-gray-300" />
                    )}
                  </div>

                  {/* Gift Info */}
                  <div className="flex-1 p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{gift.name}</h3>
                        <p className="text-xs text-gray-500">{gift.category}</p>
                      </div>
                      {gift.price > 0 && (
                        <p className="text-sm font-bold text-[#9CAA8E]">
                          {gift.price.toLocaleString('pt-MZ')} MT
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                      {gift.description}
                    </p>

                    <div className="flex items-center gap-2">
                      {gift.status === 'claimed' && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ {gift.claimedBy}
                        </span>
                      )}
                      <div className="flex gap-1 ml-auto">
                        <button
                          onClick={() => handleEditGift(gift)}
                          className="p-1.5 text-gray-500 hover:text-gray-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ show: true, giftId: gift._id, giftName: gift.name })}
                          className="p-1.5 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Empty State */}
          {gifts.length === 0 && (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Nenhum presente encontrado
              </h3>
              <p className="text-sm text-gray-500">
                Adicione presentes à sua lista
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Gift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif font-bold text-gray-900">
                {editingGift ? 'Editar Presente' : 'Adicionar Presente'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingGift(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={editingGift ? handleUpdateGift : handleAddGift} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Presente
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {formData.imageUrl ? (
                      <img src={`${API_URL}${formData.imageUrl}`} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Image className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Carregar</span>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#9CAA8E] h-2 rounded-full transition-all duration-300" 
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">A carregar imagem...</p>
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Presente *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Jogo de Panelas"
                  className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descreva o presente..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent resize-none"
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (MT)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                  >
                    {categories.filter(c => c !== 'Todos').map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Public Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isPublic"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-[#9CAA8E] border-gray-300 rounded focus:ring-[#9CAA8E]"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Tornar visível para os convidados
                </label>
              </div>

              {/* Reserved By - Only show when editing and status is claimed */}
              {editingGift && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700">Reserva</h3>
                  
                  {/* Status Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="status"
                      id="status"
                      checked={formData.status === 'claimed'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'claimed' : 'available', claimedBy: e.target.checked ? formData.claimedBy : '' })}
                      className="w-5 h-5 text-[#9CAA8E] border-gray-300 rounded focus:ring-[#9CAA8E]"
                    />
                    <label htmlFor="status" className="text-sm text-gray-700">
                      Presente reservado
                    </label>
                  </div>

                  {/* Reserved By Name */}
                  {formData.status === 'claimed' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome de quem reservou
                      </label>
                      <input
                        type="text"
                        name="claimedBy"
                        value={formData.claimedBy}
                        onChange={handleInputChange}
                        placeholder="Nome da pessoa que reservou"
                        className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGift(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#9CAA8E] text-white rounded-xl hover:bg-[#8A9A7E] transition-colors font-medium"
                >
                  {editingGift ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif font-bold text-gray-900">
                Compartilhar Lista de Presentes
              </h2>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Download QR Code Button */}
              <button
                onClick={downloadQRCode}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors font-medium mb-4"
              >
                <Download className="w-5 h-5" />
                Baixar QR Code
              </button>

              {/* Info */}
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">
                  Escaneie o código QR para ver a lista de presentes
                </p>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 mt-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-black px-2 truncate"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success('Link copiado para a área de transferência!');
                    }}
                    className="p-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E]"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success('Link copiado para a área de transferência!');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#9CAA8E] text-white rounded-xl hover:bg-[#8A9A7E] transition-colors font-medium"
              >
                <Share2 className="w-5 h-5" />
                Copiar Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">
              Confirmar Exclusão
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o presente "{deleteConfirm.giftName}"?
              <br />
              <span className="text-sm text-gray-500">Esta ação não pode ser desfeita.</span>
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, giftId: null, giftName: '' })}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteGift}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default WeddingGifts;
