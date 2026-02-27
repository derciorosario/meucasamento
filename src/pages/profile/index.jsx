import { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile, getVendorCategories, uploadProfileImage, getVendorQuoteRequests, updateQuoteRequestStatus, getMyQuoteRequests } from '../../api/client';
import { API_URL } from '../../api/client';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Gallery from '../../components/Gallery';
import Loader from '../../components/loader';
import { X, Trash2, Upload, Image, Check, XCircle, MessageSquare, Star, Clock, User, Store } from 'lucide-react';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [newVendorData, setNewVendorData] = useState({ name: '', category: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [vendorImagesInput, setVendorImagesInput] = useState(null);
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [respondingQuote, setRespondingQuote] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [myQuoteRequests, setMyQuoteRequests] = useState([]);
  const [loadingMyQuotes, setLoadingMyQuotes] = useState(false);
  const avatarInputRef = useRef(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    userType: 'bride',
    phone: '',
    country: '',
    city: '',
    weddingDate: '',
    weddingVenue: '',
    weddingGuestCount: '',
    partnerName: '',
    partnerEmail: '',
    // Vendor fields
    vendorCompanyName: '',
    vendorDescription: '',
    vendorPhone: '',
    vendorEmail: '',
    vendorCity: '',
    vendorCountry: '',
    vendorRegion: '',
    vendorCategory: '',
    vendorStartingPrice: '',
    vendorPriceRange: 'medium',
    vendorImages: [],
  });

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.data.success) {
        const { user, profile, vendors, vendor } = response.data;
        setUser(user);
        setProfile(profile);
        setVendors(vendors || []);
        setSelectedVendor(vendor || (vendors && vendors.length > 0 ? vendors[0] : null));
        
        // Populate form with existing data
        const currentVendor = vendor || (vendors && vendors.length > 0 ? vendors[0] : null);
        setFormData({
          name: user?.name || '',
          avatar: user?.avatar || '',
          userType: user?.userType || 'bride',
          phone: profile?.phone || '',
          country: profile?.country || '',
          city: profile?.city || '',
          weddingDate: profile?.wedding?.date ? new Date(profile.wedding.date).toISOString().split('T')[0] : '',
          weddingVenue: profile?.wedding?.venue || '',
          weddingGuestCount: profile?.wedding?.guestCount?.estimated || '',
          partnerName: profile?.partner?.name || '',
          partnerEmail: profile?.partner?.email || '',
          // Vendor fields
          vendorCompanyName: currentVendor?.name || '',
          vendorDescription: currentVendor?.description || '',
          vendorPhone: currentVendor?.phone || '',
          vendorEmail: currentVendor?.email || '',
          vendorCity: currentVendor?.city || '',
          vendorCountry: currentVendor?.country || '',
          vendorRegion: currentVendor?.region || '',
          vendorCategory: currentVendor?.category?._id || '',
          vendorStartingPrice: currentVendor?.startingPrice || '',
          vendorPriceRange: currentVendor?.priceRange || 'medium',
          vendorImages: currentVendor?.images || [],
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getVendorCategories();
      if (response.data) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchQuoteRequests = async () => {
    if (!selectedVendor) return;
    setLoadingQuotes(true);
    try {
      const response = await getVendorQuoteRequests();

      if (response.data) {
        setQuoteRequests(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching quote requests:', error);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const fetchMyQuoteRequests = async () => {
    setLoadingMyQuotes(true);
    try {
      const response = await getMyQuoteRequests();
      if (response.data) {
        setMyQuoteRequests(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching my quote requests:', error);
    } finally {
      setLoadingMyQuotes(false);
    }
  };

  useEffect(() => {
    if (selectedVendor && activeTab === 'quotes') {
      fetchQuoteRequests();
    }
    if (activeTab === 'myquotes') {
      fetchMyQuoteRequests();
    }
  }, [selectedVendor, activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use: jpeg, jpg, png, gif ou webp');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await uploadProfileImage(formData);
      
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          avatar: response.data.imageUrl
        }));
        toast.success('Avatar atualizado com sucesso');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não suportado. Use: jpeg, jpg, png, gif ou webp');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }
    }

    setUploadingCover(true);
    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await uploadProfileImage(formData);
        
        if (response.data.success) {
          uploadedUrls.push(response.data.imageUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          vendorImages: [...prev.vendorImages, ...uploadedUrls]
        }));
        toast.success(`${uploadedUrls.length} imagem(ns) carregada(s) com sucesso`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Erro ao carregar imagens');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDeleteImage = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      vendorImages: prev.vendorImages.filter(img => img !== imageUrl)
    }));
    toast.success('Imagem removida');
  };

  const handleQuoteResponse = async (quoteId, status) => {
    if (!selectedVendor) return;
    try {
      const response = await updateQuoteRequestStatus(
        selectedVendor._id,
        quoteId,
        status,
        responseMessage
      );
      if (response.data.success) {
        toast.success(status === 'accepted' ? 'Orçamento aceite!' : 'Orçamento recusado');
        setRespondingQuote(null);
        setResponseMessage('');
        fetchQuoteRequests();
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Erro ao atualizar orçamento');
    }
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    if (!newVendorData.name || !newVendorData.category) {
      toast.error('Por favor, preencha o nome e a categoria');
      return;
    }
    
    setSaving(true);
    try {
      const updateData = {
        name: user.name,
        avatar: user.avatar,
        userType: user.userType,
        vendorData: {
          companyName: newVendorData.name,
          category: newVendorData.category,
        },
      };

      const response = await updateProfile(updateData);
      
      if (response.data.success) {
        toast.success('Fornecedor criado com sucesso');
        await fetchProfile();
        
        // Select the newly created vendor
        const newVendor = response.data.vendors?.find(v => 
          v.name === newVendorData.name && v.category?._id === newVendorData.category
        );
        if (newVendor) {
          setSelectedVendor(newVendor);
          setFormData({
            ...formData,
            vendorCompanyName: newVendor.name || '',
            vendorDescription: newVendor.description || '',
            vendorPhone: newVendor.phone || '',
            vendorEmail: newVendor.email || '',
            vendorCity: newVendor.city || '',
            vendorCountry: newVendor.country || '',
            vendorRegion: newVendor.region || '',
            vendorCategory: newVendor.category?._id || '',
            vendorStartingPrice: newVendor.startingPrice || '',
            vendorPriceRange: newVendor.priceRange || 'medium',
            vendorImages: newVendor.images || [],
          });
        }
        setShowAddVendorModal(false);
        setNewVendorData({ name: '', category: '' });
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      if (error.response?.data?.code === 'DUPLICATE_CATEGORY') {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao criar fornecedor');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const updateData = {
        name: formData.name,
        avatar: formData.avatar,
        userType: formData.userType,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        weddingDate: formData.weddingDate,
        weddingVenue: formData.weddingVenue,
        weddingGuestCount: formData.weddingGuestCount ? parseInt(formData.weddingGuestCount) : null,
        partner: formData.partnerName || formData.partnerEmail ? {
          name: formData.partnerName,
          email: formData.partnerEmail,
        } : undefined,
      };

      // Add vendor data if user is vendor
      if (formData.userType === 'vendor') {
        updateData.vendorData = {
          vendorId: selectedVendor?._id || null,
          companyName: formData.vendorCompanyName,
          description: formData.vendorDescription,
          phone: formData.vendorPhone,
          email: formData.vendorEmail,
          city: formData.vendorCity,
          country: formData.vendorCountry,
          region: formData.vendorRegion,
          category: formData.vendorCategory || null,
          startingPrice: formData.vendorStartingPrice ? parseFloat(formData.vendorStartingPrice) : null,
          priceRange: formData.vendorPriceRange,
          images: formData.vendorImages,
        };
      }

      const response = await updateProfile(updateData);
      
      if (response.data.success) {
        toast.success('Perfil atualizado com sucesso');
        fetchProfile();
        setShowAddVendorModal(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.code === 'DUPLICATE_CATEGORY') {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } finally {
      setSaving(false);
    }
  };

  const userTypeOptions = [
    { value: 'bride', label: 'Noiva' },
    { value: 'groom', label: 'Noivo' },
    { value: 'wedding_planner', label: 'Planejador de Casamento' },
    { value: 'vendor', label: 'Fornecedor' },
    { value: 'other', label: 'Outro' },
  ];

  const priceRanges = [
    { value: 'budget', label: 'Económico' },
    { value: 'medium', label: 'Médio' },
    { value: 'high', label: 'Alto' },
    { value: 'luxury', label: 'Luxo' },
  ];

  const countries = [
    { code: 'MZ', name: 'Moçambique' },
    { code: 'PT', name: 'Portugal' },
    { code: 'BR', name: 'Brasil' },
    { code: 'ZA', name: 'África do Sul' },
    { code: 'AO', name: 'Angola' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'ES', name: 'Espanha' },
    { code: 'FR', name: 'França' },
    { code: 'IT', name: 'Itália' },
    { code: 'DE', name: 'Alemanha' },
    { code: 'NL', name: 'Países Baixos' },
    { code: 'BE', name: 'Bélgica' },
    { code: 'CH', name: 'Suíça' },
    { code: 'AT', name: 'Áustria' },
    { code: 'GR', name: 'Grécia' },
    { code: 'TK', name: 'Turquia' },
    { code: 'EG', name: 'Egito' },
    { code: 'MA', name: 'Marrocos' },
    { code: 'SC', name: 'Seicheles' },
    { code: 'MU', name: 'Maurícia' },
    { code: 'KE', name: 'Quénia' },
    { code: 'TZ', name: 'Tanzânia' },
    { code: 'NA', name: 'Namíbia' },
    { code: 'BW', name: 'Botsuana' },
    { code: 'ZM', name: 'Zâmbia' },
    { code: 'ZW', name: 'Zimbábue' },
    { code: 'NG', name: 'Nigéria' },
    { code: 'GH', name: 'Gana' },
    { code: 'SN', name: 'Senegal' },
    { code: 'CI', name: 'Costa do Marfim' },
    { code: 'OTHER', name: 'Outro' },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center space-x-6">
            {formData.avatar ? (
              <img 
                src={formData.avatar} 
                alt={formData.name} 
                className="w-24 h-24 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#9CAA8E] flex items-center justify-center shadow-lg">
                <span className="text-4xl text-white font-bold">
                  {formData.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-serif font-bold text-black">{formData.name}</h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
              <span className="inline-block mt-2 px-4 py-1.5 text-sm font-medium bg-[#9CAA8E] text-white rounded-full">
                {userTypeOptions.find(opt => opt.value === formData.userType)?.label || formData.userType}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              activeTab === 'personal' 
                ? 'bg-[#9CAA8E] text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
            }`}
          >
            Dados Pessoais
          </button>
         {formData.userType != 'vendor' &&  <button
            onClick={() => setActiveTab('wedding')}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              activeTab === 'wedding' 
                ? 'bg-[#9CAA8E] text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
            }`}
          >
            Casamento
          </button>}
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              activeTab === 'gallery' 
                ? 'bg-[#9CAA8E] text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
            }`}
          >
            Galeria
          </button>
          {formData.userType === 'vendor' && (
            <button
              onClick={() => setActiveTab('vendor')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'vendor' 
                  ? 'bg-[#9CAA8E] text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
              }`}
            >
              Fornecedor
            </button>
          )}
          {formData.userType === 'vendor' && selectedVendor && (
            <>
              <button
                onClick={() => setActiveTab('quotes')}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === 'quotes' 
                    ? 'bg-[#9CAA8E] text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
                }`}
              >
                Orçamentos {quoteRequests.filter(q => q.status === 'pending').length > 0 && 
                  <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {quoteRequests.filter(q => q.status === 'pending').length}
                  </span>}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === 'reviews' 
                    ? 'bg-[#9CAA8E] text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
                }`}
              >
                Avaliações
              </button>
            </>
          )}
          {formData.userType !== 'vendor' && (
            <button
              onClick={() => setActiveTab('myquotes')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'myquotes' 
                  ? 'bg-[#9CAA8E] text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
              }`}
            >
              Meus Orçamentos {myQuoteRequests.filter(q => q.status === 'pending').length > 0 && 
                <span className="ml-1 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {myQuoteRequests.filter(q => q.status === 'pending').length}
                </span>}
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'gallery' ? (
          <Gallery userId={user?.id} isOwner={true} />
        ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif font-semibold text-black mb-6 pb-2 border-b border-gray-100">
                Informações Pessoais
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Usuário
                  </label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white"
                  >
                    {userTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar
                  </label>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="px-4 py-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E] transition-colors disabled:opacity-50"
                    >
                      {uploadingAvatar ? 'A carregar...' : 'Escolher Imagem'}
                    </button>
                    {formData.avatar && (
                      <span className="text-sm text-gray-500">Imagem definida</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white"
                  >
                    <option value="">Selecione um país</option>
                    {countries.map(country => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                  />
                </div>
              </div>

              {/* Partner Info */}
              {(formData.userType === 'bride' || formData.userType === 'groom') && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-serif font-semibold text-black mb-4">
                    Informações do Parceiro(a)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do(a) Parceiro(a)
                      </label>
                      <input
                        type="text"
                        name="partnerName"
                        value={formData.partnerName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail do(a) Parceiro(a)
                      </label>
                      <input
                        type="email"
                        name="partnerEmail"
                        value={formData.partnerEmail}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wedding Info Tab */}
          {activeTab === 'wedding' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif font-semibold text-black mb-6 pb-2 border-b border-gray-100">
                Informações do Casamento
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data do Casamento
                  </label>
                  <input
                    type="date"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Local do Casamento
                  </label>
                  <input
                    type="text"
                    name="weddingVenue"
                    value={formData.weddingVenue}
                    onChange={handleChange}
                    placeholder="Nome do espaço ou endereço"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Convidados
                  </label>
                  <input
                    type="number"
                    name="weddingGuestCount"
                    value={formData.weddingGuestCount}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vendor Info Tab */}
          {activeTab === 'vendor' && formData.userType === 'vendor' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-semibold text-black pb-2 border-b border-gray-100">
                  Informações do Fornecedor
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVendorModal(true);
                    setNewVendorData({ name: '', category: '' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E] transition-colors"
                >
                  + Adicionar Fornecedor
                </button>
              </div>

              {/* Vendor Selector */}
              {vendors.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione o fornecedor para editar:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {vendors.map((v) => (
                      <button
                        type="button"
                        key={v._id}
                        onClick={() => {
                          setSelectedVendor(v);
                          setFormData({
                            ...formData,
                            vendorCompanyName: v.name || '',
                            vendorDescription: v.description || '',
                            vendorPhone: v.phone || '',
                            vendorEmail: v.email || '',
                            vendorCity: v.city || '',
                            vendorCountry: v.country || '',
                            vendorRegion: v.region || '',
                            vendorCategory: v.category?._id || '',
                            vendorStartingPrice: v.startingPrice || '',
                            vendorPriceRange: v.priceRange || 'medium',
                            vendorImages: v.images || [],
                          });
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedVendor?._id === v._id
                            ? 'bg-[#9CAA8E] text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {v.name} {v.category && `(${v.category.name})`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vendor Form - shown when a vendor is selected */}
              {selectedVendor && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      name="vendorCompanyName"
                      value={formData.vendorCompanyName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      name="vendorCategory"
                      value={formData.vendorCategory}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="vendorPhone"
                      value={formData.vendorPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="vendorEmail"
                      value={formData.vendorEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País
                    </label>
                    <select
                      name="vendorCountry"
                      value={formData.vendorCountry}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white"
                    >
                      <option value="">Selecione um país</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provincia/Região
                    </label>
                    <input
                      type="text"
                      name="vendorRegion"
                      value={formData.vendorRegion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço Inicial (MT)
                    </label>
                    <input
                      type="number"
                      name="vendorStartingPrice"
                      value={formData.vendorStartingPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faixa de Preço
                    </label>
                    <select
                      name="vendorPriceRange"
                      value={formData.vendorPriceRange}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white"
                    >
                      {priceRanges.map(range => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagens do Fornecedor
                    </label>
                    <input
                      type="file"
                      ref={(el) => setVendorImagesInput(el)}
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleMultipleImageUpload}
                      multiple
                      className="hidden"
                    />
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => vendorImagesInput?.click()}
                        disabled={uploadingCover}
                        className="px-4 py-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E] transition-colors disabled:opacity-50"
                      >
                        {uploadingCover ? 'A carregar...' : 'Adicionar Imagens'}
                      </button>
                      {formData.vendorImages.length > 0 && (
                        <span className="text-sm text-gray-500">{formData.vendorImages.length} imagem(ns) adicionada(s)</span>
                      )}
                    </div>
                    
                    {/* Images Grid */}
                    {formData.vendorImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.vendorImages.map((img, index) => (
                          <div 
                            key={index} 
                            className="relative group aspect-square rounded-xl overflow-hidden"
                          >
                            <img 
                              src={img.startsWith('http') ? img : `${API_URL}${img}`} 
                              alt={`Imagem ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            
                            {/* Overlay with delete button */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImage(img)}
                                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Nenhuma imagem adicionada ainda</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      name="vendorDescription"
                      value={formData.vendorDescription}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Descreva seus serviços..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Show vendor stats if vendor is selected */}
              {selectedVendor && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-serif font-semibold text-black mb-4">
                    Estatísticas do Perfil
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#9CAA8E]">{selectedVendor.averageRating || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Avaliação</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#9CAA8E]">{selectedVendor.totalReviews || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Avaliações</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#9CAA8E]">{selectedVendor.quoteRequests?.length || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Orçamentos</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quote Requests Tab */}
          {activeTab === 'quotes' && formData.userType === 'vendor' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif font-semibold text-black pb-2 border-b border-gray-100">
                Gestão de Orçamentos
              </h2>

              {loadingQuotes ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-[#9CAA8E] border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-2">A carregar orçamentos...</p>
                </div>
              ) : quoteRequests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum orçamento solicitado ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quoteRequests.map((quote) => (
                    <div key={quote._id} className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-[#9CAA8E]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-black">{quote.clientName || 'Cliente'}</h4>
                            <p className="text-sm text-gray-500">{quote.clientEmail}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              {quote.eventDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {new Date(quote.eventDate).toLocaleDateString('pt-PT')}
                                </span>
                              )}
                              {quote.guestCount && (
                                <span>{quote.guestCount} convidados</span>
                              )}
                            </div>
                            {quote.message && (
                              <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                                {quote.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {quote.status === 'pending' ? 'Pendente' : 
                             quote.status === 'accepted' ? 'Aceite' : 'Recusado'}
                          </span>
                          {quote.responseMessage && (
                            <p className="text-sm text-gray-500 text-right max-w-xs">
                              <span className="font-medium">Resposta:</span> {quote.responseMessage}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Response Section */}
                      {quote.status === 'pending' && respondingQuote === quote._id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <textarea
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            placeholder="Escreva uma mensagem para o cliente (opcional)..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black mb-3"
                            rows="2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleQuoteResponse(quote._id, 'accepted')}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              <Check className="w-4 h-4" /> Aceitar
                            </button>
                            <button
                              onClick={() => handleQuoteResponse(quote._id, 'rejected')}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              <XCircle className="w-4 h-4" /> Recusar
                            </button>
                            <button
                              onClick={() => { setRespondingQuote(null); setResponseMessage(''); }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {quote.status === 'pending' && respondingQuote !== quote._id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => setRespondingQuote(quote._id)}
                            className="text-[#9CAA8E] hover:text-[#8A9A7E] font-medium"
                          >
                            Responder ao orçamento
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && formData.userType === 'vendor' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif font-semibold text-black pb-2 border-b border-gray-100">
                Gestão de Avaliações
              </h2>

              {selectedVendor?.reviews?.length === 0 || !selectedVendor?.reviews ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma avaliação recebida ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Average Rating Card */}
                  <div className="bg-[#9CAA8E]/10 rounded-xl p-6 text-center">
                    <p className="text-5xl font-bold text-[#9CAA8E]">{selectedVendor.averageRating?.toFixed(1) || '0.0'}</p>
                    <div className="flex justify-center gap-1 my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-5 h-5 ${star <= Math.round(selectedVendor.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">{selectedVendor.totalReviews || 0} avaliação(ões)</p>
                  </div>

                  {/* Reviews List */}
                  {selectedVendor?.reviews?.map((review, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-[#9CAA8E]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-black">{review.clientName || 'Cliente'}</h4>
                            <div className="flex gap-1 my-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-gray-700 mt-2">{review.comment}</p>
                            {review.createdAt && (
                              <p className="text-sm text-gray-400 mt-2">
                                {new Date(review.createdAt).toLocaleDateString('pt-PT')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Quote Requests Tab (for non-vendor users) */}
          {activeTab === 'myquotes' && formData.userType !== 'vendor' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif font-semibold text-black pb-2 border-b border-gray-100">
                Meus Orçamentos
              </h2>

              {loadingMyQuotes ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-[#9CAA8E] border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-2">A carregar orçamentos...</p>
                </div>
              ) : myQuoteRequests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Você ainda não solicitou nenhum orçamento</p>
                  <p className="text-sm text-gray-400 mt-2">Visite a página de fornecedores para encontrar os melhores serviços</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myQuoteRequests.map((quote) => (
                    <div key={quote._id} className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Store className="w-6 h-6 text-[#9CAA8E]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-black">{quote.vendor?.name || 'Fornecedor'}</h4>
                            <p className="text-sm text-gray-500">{quote.vendor?.category?.name}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              {quote.eventDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {new Date(quote.eventDate).toLocaleDateString('pt-PT')}
                                </span>
                              )}
                              {quote.guestCount && (
                                <span>{quote.guestCount} convidados</span>
                              )}
                            </div>
                            {quote.message && (
                              <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                                {quote.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {quote.status === 'pending' ? 'Pendente' : 
                             quote.status === 'accepted' ? 'Aceite' : 'Recusado'}
                          </span>
                          {quote.responseMessage && (
                            <p className="text-sm text-gray-500 text-right max-w-xs">
                              <span className="font-medium">Resposta do fornecedor:</span> {quote.responseMessage}
                            </p>
                          )}
                          {quote.vendor?._id && (
                            <a 
                              href={`/vendors/${quote.vendor._id}`}
                              className="text-xs text-[#9CAA8E] hover:underline"
                            >
                              Ver fornecedor
                            </a>
                          )}
                        </div>
                      </div>
                      {quote.createdAt && (
                        <p className="text-xs text-gray-400 mt-4">
                          Solicitado em: {new Date(quote.createdAt).toLocaleDateString('pt-PT')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto px-8 py-4 bg-[#9CAA8E] text-white font-medium rounded-full hover:bg-[#8A9A7E] focus:ring-4 focus:ring-[#9CAA8E]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Guardar Alterações'
              )}
            </button>
          </div>
        </form>
        )}

        {/* Add Vendor Modal */}
        {showAddVendorModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-serif font-bold text-black">Adicionar Novo Fornecedor</h3>
                <button onClick={() => setShowAddVendorModal(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleAddVendor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    value={newVendorData.name}
                    onChange={(e) => setNewVendorData({...newVendorData, name: e.target.value})}
                    placeholder="Ex: Foto & Vídeos LM"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={newVendorData.category}
                    onChange={(e) => setNewVendorData({...newVendorData, category: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-white"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories
                      .filter(cat => !vendors.some(v => v.category?._id === cat._id))
                      .map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Criando...' : 'Criar Fornecedor'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
