import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProfile, updateProfile, getVendorCategories, uploadProfileImage, getVendorQuoteRequests, updateQuoteRequestStatus, getMyQuoteRequests, getVendor } from '../../api/client';
import VendorProfileModal from '../../components/VendorProfileModal';
import { API_URL } from '../../api/client';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Gallery from '../../components/Gallery';
import Loader from '../../components/loader';
import { motion, AnimatePresence } from 'framer-motion';
import COUNTRIES from '../../constants/countries';



// FAQ predefined questions configuration
const FAQ_QUESTIONS = [
  // Services category
  { id: 's1', question: 'Quais serviços estão incluídos no pacote?', type: 'multi-select', allowCustom: true, options: [], category: 'services',_placeholder:'Fotografia e Vídeo (8 horas), Decoração completa, Iluminação básica e Bolo personalizado.' },
  { id: 's2', question: 'Quantas horas de serviço estão incluídas?', type: 'text', category: 'services', placeholder: 'Ex: 8 horas' },
  { id: 's3', question: 'É possível contratar serviços adicionais?', type: 'boolean', category: 'services' },
  { id: 's4', question: 'Quais são as opções de personalização disponíveis?', type: 'multi-select',allowCustom: true, options: ['Cores', 'Tema', 'Decoração', 'Música', 'Menu'], category: 'services' },
  
  // Pricing category
  { id: 'p1', question: 'Qual é o custo por convidado adicional?', type: 'text', category: 'pricing', placeholder: 'Ex: 500 MT por convidado' },
  { id: 'p2', question: 'Quais formas de pagamento são aceites?', type: 'multi-select',allowCustom: true, options: ['Dinheiro', 'Transferência bancária', 'Multicaixa', 'Cartão de crédito', 'Parcelamento'], category: 'pricing' },
  { id: 'p3', question: 'É necessário pagar uma caução?', type: 'boolean', category: 'pricing' },
  { id: 'p4', question: 'Qual é a política de reembolso?', type: 'text', category: 'pricing', placeholder: 'Ex: Reembolso até 30 dias antes' },
  
  // Availability category
  { id: 'a2', question: 'Com antecedência preciso contratar?', type: 'text', category: 'availability', placeholder: 'Ex: Com pelo menos 2 meses de antecedência' },
  { id: 'a3', question: 'Trabalha em quais dias da semana?', type: 'multi-select', options: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo', 'Feriados'], category: 'availability' },
  { id: 'a4', question: 'Aceita eventos em diferentes locais?', type: 'boolean', category: 'availability' },
  
  // Logistics category
  { id: 'l1', question: 'Inclui transporte e logística?', type: 'boolean', category: 'logistics' },
  { id: 'l2', question: 'Qual é o raio de atuação?', type: 'text', category: 'logistics', placeholder: 'Ex: Até 100km da cidade' },
  { id: 'l3', question: 'Há custos adicionais para deslocação?', type: 'text', category: 'logistics', placeholder: 'Ex: 2 MT por km' },
  { id: 'l4', question: 'Quais equipamentos são fornecidos?', type: 'multi-select', options: ['Som', 'Iluminação', 'Projétor', 'Decoração', 'Mobiliário', 'Pratos e talheres', 'Copos'],allowCustom:true, category: 'logistics' },
  
  // Style category
  { id: 'st1', question: 'Qual é o estilo principal do serviço?', type: 'multi-select', options: ['Clássico', 'Rústico', 'Moderno', 'Minimalista', 'Boho', 'Vintage', 'Romântico', 'Luxo'], category: 'style' },
  { id: 'st2', question: 'É possível ver trabalhos anteriores?', type: 'boolean', category: 'style' },
  { id: 'st3', question: 'Oferece serviços em diferentes idiomas?', type: 'multi-select', options: ['Português', 'Inglês', 'Espanhol', 'Francês'], allowCustom:true, category: 'style' },
  { id: 'st4', question: 'Pode criar um design exclusivo?', type: 'boolean', category: 'style' },
];

// Get category label
const getCategoryLabel = (category) => {
  const labels = {
    services: 'Serviços',
    pricing: 'Preços',
    availability: 'Disponibilidade',
    logistics: 'Logística',
    style: 'Estilo',
  };
  return labels[category] || category;
};
import { 
  X, 
  Trash2, 
  Upload, 
  Image, 
  Check, 
  XCircle, 
  MessageSquare, 
  Star, 
  Clock, 
  User, 
  Store,
  Settings,
  Heart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
  MoreVertical,
  Grid,
  List,
  ChevronRight,
  Edit3,
  Briefcase,
  DollarSign,
  Award,
  ThumbsUp,
  AlertCircle,
  Plus,
  Users,
  CheckCircle
} from 'lucide-react';

const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFaqSection, setShowFaqSection] = useState(false); // Toggle FAQ section visibility
  const [newVendorData, setNewVendorData] = useState({ name: '', category: '', phone: '', email: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [vendorImagesInput, setVendorImagesInput] = useState(null);
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [respondingQuote, setRespondingQuote] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [myQuoteRequests, setMyQuoteRequests] = useState([]);
  const [loadingMyQuotes, setLoadingMyQuotes] = useState(false);
  const [vendorViewMode, setVendorViewMode] = useState('grid'); // 'grid' or 'list' - for mobile vendor display
  const [customFaqInputs, setCustomFaqInputs] = useState({}); // Track custom input values for FAQ
  const [cities, setCities] = useState([]); // Cities from JSON file
  const [loadingCities, setLoadingCities] = useState(false);
  
  const navigate=useNavigate()
  // Vendor Profile Modal states
  const [showProfile, setShowProfile] = useState(false);
  const [selectedVendorProfile, setSelectedVendorProfile] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const avatarInputRef = useRef(null);
  const mobileMenuRef = useRef(null);


  
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
    vendorMaxCapacity: '',
    vendorFaqs: [],
    vendorMapLink: '',
  });

  // Handle click outside for mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab');
    const validTabs = ['personal', 'wedding', 'gallery', 'vendor', 'quotes', 'reviews', 'myquotes'];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    fetchProfile();
    fetchCategories();
  }, [searchParams]);

  // Load quote counts when user data is available
  useEffect(() => {
    if (user) {
      if (user.userType === 'vendor') {
        fetchQuoteRequests();
      }
      if (user.role === 'couple') {
        fetchMyQuoteRequests();
      }
    }
  }, [user]);

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

        if (profile?.country) {
           loadCities(profile?.country);
        }
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
          vendorMaxCapacity: currentVendor?.maxCapacity || '',
          vendorFaqs: currentVendor?.faqs || [],
          vendorMapLink: currentVendor?.mapLink || '',

          ...profile,
          ...user
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  console.log(formData.vendorFaqs)

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



    if(activeTab === 'vendor'){
      if (profile?.vendorCountry) {
           loadCities(profile?.vendorCountry);
      }
    }

    if(activeTab === 'personal'){
      if (profile?.country) {
           loadCities(profile?.country);
      }
    }
    

  }, [selectedVendor, activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // When country changes, load cities for that country
    if (name === 'country' || name === 'vendorCountry') {
      loadCities(value);
    }
  };
  
  // Load cities based on selected country
  const loadCities = async (countryName) => {
    if (!countryName) {
      setCities([]);
      return;
    }
    
    setLoadingCities(true);
    try {
      const response = await fetch('/data/cities.json');
      const allCities = await response.json();
      
      // Find country code from COUNTRIES constant
      const country = COUNTRIES.find(c => c.pt === countryName || c.en === countryName);
      
      if (country) {
        // Filter cities by country - using English name for matching
        const filteredCities = allCities
          .filter(city => city.country === country.en)
          .map(city => city.city);
        
        // Remove duplicates and sort
        const uniqueCities = [...new Set(filteredCities)].sort();
        setCities(uniqueCities);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
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
    setUploadProgress(0);
    setUploadTotal(files.length);
    try {
      const uploadedUrls = [];
      let completed = 0;
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await uploadProfileImage(formData);
        
        if (response.data.success) {
          uploadedUrls.push(response.data.imageUrl);
        }
        completed++;
        setUploadProgress(completed);
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
      setUploadProgress(0);
      setUploadTotal(0);
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

  // Price range helpers
  const getPriceRangeColor = (range) => {
    const colors = {
      budget: 'bg-green-100 text-green-700',
      moderate: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      luxury: 'bg-purple-100 text-purple-700',
    };
    return colors[range] || 'bg-gray-100 text-gray-700';
  };

  const getPriceRangeLabel = (range) => {
    const labels = {
      budget: 'Económico',
      moderate: 'Moderado',
      high: 'Alto',
      luxury: 'Luxo',
    };
    return labels[range] || range;
  };

  // Handle opening vendor profile
  const handleVendorClick = async (vendorId) => {
    navigate('/vendor/'+vendorId)
    return
    try {
      const response = await getVendor(vendorId);
      setSelectedVendorProfile(response.data);
      setCurrentSlide(0);
      setShowProfile(true);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      toast.error('Erro ao carregar perfil do fornecedor');
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
          phone: newVendorData.phone || '',
          email: newVendorData.email || '',
        },
      };

      const response = await updateProfile(updateData);
      
      if (response.data.success) {
        toast.success('Fornecedor criado com sucesso! Aguarde a aprovação do administrador.');
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
            vendorMaxCapacity: newVendor.maxCapacity || '',
            vendorFaqs: newVendor.faqs || [],
          });
        }
        setShowAddVendorModal(false);
        setNewVendorData({ name: '', category: '', phone: '', email: '' });
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
          maxCapacity: formData.vendorMaxCapacity ? parseInt(formData.vendorMaxCapacity) : null,
          faqs: formData.vendorFaqs,
          mapLink: formData.vendorMapLink,
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

  const countryOptions = COUNTRIES.map(country => ({
    value: country.pt,
    label: country.pt,
  }));

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
        {/* Profile Header Card - Desktop */}
        <div className="hidden md:block bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="relative group"
              >
                {formData.avatar ? (
                  <img
                    src={formData.avatar.startsWith('https') ? formData.avatar : `${API_URL}${formData.avatar}`}
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
                {/* Upload overlay */}
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadingAvatar ? (
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Upload className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-black">{formData.name}</h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
              <span className="inline-block mt-2 px-4 py-1.5 text-sm font-medium bg-[#9CAA8E] text-white rounded-full">
                {userTypeOptions.find(opt => opt.value === formData.userType)?.label || formData.userType}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Header - Mobile Optimized */}
        <div className="md:hidden bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="relative group"
              >
                {formData.avatar ? (
                  <img
                    src={formData.avatar.startsWith('https') ? formData.avatar : `${API_URL}${formData.avatar}`}
                    alt={formData.name}
                    className="w-16 h-16 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#9CAA8E] flex items-center justify-center shadow-md">
                    <span className="text-2xl text-white font-bold">
                      {formData.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/0 group-active:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-active:opacity-100 transition-opacity">
                    {uploadingAvatar ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-black">{formData.name}</h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 px-3 py-1 text-xs font-medium bg-[#9CAA8E]/10 text-[#9CAA8E] rounded-full">
                {userTypeOptions.find(opt => opt.value === formData.userType)?.label || formData.userType}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs - Desktop */}
        <div className="hidden md:flex space-x-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
              activeTab === 'personal' 
                ? 'bg-[#9CAA8E] text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
            }`}
          >
            Dados Pessoais
          </button>
          {(formData.role === 'couple') && (
            <button
              onClick={() => setActiveTab('wedding')}
              className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
                activeTab === 'wedding' 
                  ? 'bg-[#9CAA8E] text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
              }`}
            >
              Casamento
            </button>
          )}
          {formData.role === 'couple' && (
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-3 hidden rounded-full font-medium transition-all whitespace-nowrap ${
                activeTab === 'gallery' 
                  ? 'bg-[#9CAA8E] text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
              }`}
            >
              Galeria
            </button>
          )}
          {formData.userType === 'vendor' && (
            <button
              onClick={() => setActiveTab('vendor')}
              className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
                activeTab === 'vendor' 
                  ? 'bg-[#9CAA8E] text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
              }`}
            >
              Serviço/Empresa
            </button>
          )}
          {formData.userType === 'vendor' && selectedVendor && (
            <>
              <button
                onClick={() => setActiveTab('quotes')}
                className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
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
                className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
                  activeTab === 'reviews' 
                    ? 'bg-[#9CAA8E] text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
                }`}
              >
                Avaliações
              </button>
            </>
          )}
          {formData.role === 'couple' && (
            <button
              onClick={() => setActiveTab('myquotes')}
              className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
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

        {/* Tabs - Mobile Optimized with Horizontal Scroll */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 overflow-x-auto scrollbar-hide pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'personal' 
                      ? 'bg-[#9CAA8E] text-white shadow-md' 
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  <User className="w-4 h-4 inline-block mr-1" />
                  Dados
                </button>
                {(formData.role === 'couple') && (
                  <button
                    onClick={() => setActiveTab('wedding')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === 'wedding' 
                        ? 'bg-[#9CAA8E] text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    <Heart className="w-4 h-4 inline-block mr-1" />
                    Casamento
                  </button>
                )}
                {formData.role === 'couple' && (
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === 'gallery' 
                        ? 'bg-[#9CAA8E] text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    <Image className="w-4 h-4 inline-block mr-1" />
                    Galeria
                  </button>
                )}
                {formData.userType === 'vendor' && (
                  <button
                    onClick={() => setActiveTab('vendor')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === 'vendor' 
                        ? 'bg-[#9CAA8E] text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    <Store className="w-4 h-4 inline-block mr-1" />
                    Empresa
                  </button>
                )}
                {formData.userType === 'vendor' && selectedVendor && (
                  <>
                    <button
                      onClick={() => setActiveTab('quotes')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        activeTab === 'quotes' 
                          ? 'bg-[#9CAA8E] text-white shadow-md' 
                          : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 inline-block mr-1" />
                      Orçamentos
                      {quoteRequests.filter(q => q.status === 'pending').length > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {quoteRequests.filter(q => q.status === 'pending').length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        activeTab === 'reviews' 
                          ? 'bg-[#9CAA8E] text-white shadow-md' 
                          : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      <Star className="w-4 h-4 inline-block mr-1" />
                      Avaliações
                    </button>
                  </>
                )}
                {formData.role === 'couple' && (
                  <button
                    onClick={() => setActiveTab('myquotes')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === 'myquotes' 
                        ? 'bg-[#9CAA8E] text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 inline-block mr-1" />
                    Meus Orçamentos
                    {myQuoteRequests.filter(q => q.status === 'pending').length > 0 && (
                      <span className="ml-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {myQuoteRequests.filter(q => q.status === 'pending').length}
                      </span>
                    )}
                  </button>
                )}
                {(formData.userType === 'vendor' || formData.userType === 'wedding_planner') && (
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === 'calendar' 
                        ? 'bg-[#9CAA8E] text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline-block mr-1" />
                    Calendário
                  </button>
                )}
              </div>
            </div>
            
            {/* Mobile Menu Button for additional actions */}
            {formData.userType === 'vendor' && (
              <div className="relative ml-2" ref={mobileMenuRef}>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-200 active:bg-gray-50"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
                
                <AnimatePresence>
                  {showMobileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-20"
                    >
                      <button
                        onClick={() => {
                          setShowAddVendorModal(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 active:bg-gray-50 flex items-center gap-3"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Fornecedor
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'gallery' ? (
          <Gallery userId={user?.id} isOwner={true} />
        ) : activeTab === 'calendar' ? (
          <CalendarComponent userId={user?.id} vendorId={selectedVendor?._id} />
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl md:rounded-2xl shadow-lg p-4 md:p-8 pb-10 mb-10">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg md:text-xl font-serif font-semibold text-black pb-2 border-b border-gray-100 flex-1">
                    Informações Pessoais
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                    />
                  </div>
                  
                  <div className="hidden">
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Tipo de Usuário
                    </label>
                    <select
                      name="userType"
                      value={formData.userType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white text-sm md:text-base"
                    >
                      {userTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      País
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white text-sm md:text-base"
                    >
                      <option value="">Selecione um país</option>
                      {countryOptions.map(country => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Cidade
                    </label>
                    {loadingCities ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 text-sm">
                        A carregar cidades...
                      </div>
                    ) : cities.length > 0 ? (
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white text-sm md:text-base"
                      >
                        <option value="">Selecione uma cidade</option>
                        {cities.map(city => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder={formData.country ? "Digite a cidade" : "Selecione um país primeiro"}
                        disabled={!formData.country}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    )}
                  </div>
                </div>

                {/* Partner Info */}
                {(formData.userType === 'bride' || formData.userType === 'groom') && (
                  <div className="mt-6 md:mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-base md:text-lg font-serif font-semibold text-black mb-4">
                      Informações do Parceiro(a)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Nome do(a) Parceiro(a)
                        </label>
                        <input
                          type="text"
                          name="partnerName"
                          value={formData.partnerName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          E-mail do(a) Parceiro(a)
                        </label>
                        <input
                          type="email"
                          name="partnerEmail"
                          value={formData.partnerEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
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
                <h2 className="text-lg md:text-xl font-serif font-semibold text-black mb-6 pb-2 border-b border-gray-100">
                  Informações do Casamento
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Data do Casamento
                    </label>
                    <input
                      type="date"
                      name="weddingDate"
                      value={formData.weddingDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Local do Casamento
                    </label>
                    <input
                      type="text"
                      name="weddingVenue"
                      value={formData.weddingVenue}
                      onChange={handleChange}
                      placeholder="Nome do espaço ou endereço"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Número de Convidados
                    </label>
                    <input
                      type="number"
                      name="weddingGuestCount"
                      value={formData.weddingGuestCount}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Vendor Info Tab */}
            {activeTab === 'vendor' && formData.userType === 'vendor' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-serif font-semibold text-black pb-2 border-b border-gray-100 flex-1">
                    Informações do Fornecedor
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddVendorModal(true);
                      setNewVendorData({ name: '', category: '', phone: '', email: '' });
                    }}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E] transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Fornecedor
                  </button>
                </div>

                {/* Vendor Selector */}
                {vendors.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecione o fornecedor para editar:
                    </label>
                    
                    {/* Vendor View Toggle - Mobile Only */}
                    <div className="md:hidden flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">{vendors.length} fornecedor(es)</span>
                      <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
                        <button
                          onClick={() => setVendorViewMode('grid')}
                          className={`p-2 rounded-md transition-colors ${
                            vendorViewMode === 'grid' ? 'bg-[#9CAA8E] text-white' : 'text-gray-500 active:bg-gray-100'
                          }`}
                          aria-label="Visualização em grade"
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setVendorViewMode('list')}
                          className={`p-2 rounded-md transition-colors ${
                            vendorViewMode === 'list' ? 'bg-[#9CAA8E] text-white' : 'text-gray-500 active:bg-gray-100'
                          }`}
                          aria-label="Visualização em lista"
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Desktop Vendor Selector */}
                    <div className="hidden md:flex flex-wrap gap-2">
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
                              vendorMaxCapacity: v.maxCapacity || '',
                              vendorFaqs: v.faqs || [],
                              vendorMapLink: v.mapLink || '',
                            });
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedVendor?._id === v._id
                              ? 'bg-[#9CAA8E] text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {v.name} {v.category && `(${v.category.name})`}
                          {v.status && v.status !== 'approved' && (
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                              v.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {v.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Mobile Vendor Selector - Grid View */}
                    <div className="md:hidden">
                      {vendorViewMode === 'grid' ? (
                        <div className="grid grid-cols-2 gap-2">
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
                                  vendorMaxCapacity: v.maxCapacity || '',
                                  vendorFaqs: v.faqs || [],
                                  vendorMapLink: v.mapLink || '',
                                });
                              }}
                              className={`p-3 rounded-xl text-left transition-colors border ${
                                selectedVendor?._id === v._id
                                  ? 'bg-[#9CAA8E] text-white border-[#9CAA8E]'
                                  : 'bg-white text-gray-700 border-gray-200'
                              }`}
                            >
                              <div className="font-medium text-sm truncate">{v.name}</div>
                              {v.category && (
                                <div className={`text-xs mt-1 truncate ${
                                  selectedVendor?._id === v._id ? 'text-white/80' : 'text-gray-500'
                                }`}>
                                  {v.category.name}
                                </div>
                              )}
                              {v.status && v.status !== 'approved' && (
                                <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                                  v.status === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {v.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
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
                                  vendorMaxCapacity: v.maxCapacity || '',
                                  vendorFaqs: v.faqs || [],
                                  vendorMapLink: v.mapLink || '',
                                });
                              }}
                              className={`w-full p-3 rounded-xl text-left transition-colors border flex items-center justify-between ${
                                selectedVendor?._id === v._id
                                  ? 'bg-[#9CAA8E] text-white border-[#9CAA8E]'
                                  : 'bg-white text-gray-700 border-gray-200'
                              }`}
                            >
                              <div>
                                <div className="font-medium text-sm">{v.name}</div>
                                {v.category && (
                                  <div className={`text-xs mt-1 ${
                                    selectedVendor?._id === v._id ? 'text-white/80' : 'text-gray-500'
                                  }`}>
                                    {v.category.name}
                                  </div>
                                )}
                                {v.status && v.status !== 'approved' && (
                                  <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                                    v.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {v.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                                  </span>
                                )}
                              </div>
                              <ChevronRight className={`w-5 h-5 ${
                                selectedVendor?._id === v._id ? 'text-white' : 'text-gray-400'
                              }`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Mobile Add Vendor Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddVendorModal(true);
                        setNewVendorData({ name: '', category: '', phone: '', email: '' });
                      }}
                      className="md:hidden w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-[#9CAA8E] text-white rounded-xl active:bg-[#8A9A7E] transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Novo Fornecedor
                    </button>
                  </div>
                )}

                {/* Vendor Form - shown when a vendor is selected */}
                {selectedVendor && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Pending Status Warning */}
                    {selectedVendor.status === 'pending' && (
                      <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-2">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-yellow-800 text-sm md:text-base">Aguardando Aprovação</p>
                            <p className="text-xs md:text-sm text-yellow-700 mt-1">
                              O seu perfil de fornecedor está pendente de aprovação por um administrador. 
                              Após a aprovação, você poderá receber pedidos de orçamento e seu perfil será visível publicamente.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Rejected Status Warning */}
                    {selectedVendor.status === 'rejected' && (
                      <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-xl p-4 mb-2">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-red-800 text-sm md:text-base">Perfil Rejeitado</p>
                            <p className="text-xs md:text-sm text-red-700 mt-1">
                              O seu perfil de fornecedor foi rejeitado. Por favor, entre em contacto com o administrador para mais informações.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        name="vendorCompanyName"
                        value={formData.vendorCompanyName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Categoria
                      </label>
                      <select
                        name="vendorCategory"
                        value={formData.vendorCategory}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white text-sm md:text-base"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        name="vendorPhone"
                        value={formData.vendorPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        name="vendorEmail"
                        value={formData.vendorEmail}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        País
                      </label>
                      <select
                        name="vendorCountry"
                        value={formData.vendorCountry}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white text-sm md:text-base"
                      >
                        <option value="">Selecione um país</option>
                        {countryOptions.map(country => (
                          <option key={country.value} value={country.value}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Cidade
                      </label>
                      {loadingCities ? (
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 text-sm">
                          A carregar cidades...
                        </div>
                      ) : cities.length > 0 ? (
                        <select
                          name="vendorCity"
                          value={formData.vendorCity}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white text-sm md:text-base"
                        >
                          <option value="">Selecione uma cidade</option>
                          {cities.map(city => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name="vendorCity"
                          value={formData.vendorCity}
                          onChange={handleChange}
                          placeholder={formData.vendorCountry ? "Digite a cidade" : "Selecione um país primeiro"}
                          disabled={!formData.vendorCountry}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Provincia/Região
                      </label>
                      <input
                        type="text"
                        name="vendorRegion"
                        value={formData.vendorRegion}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Preço Inicial (MT)
                      </label>
                      <input
                        type="number"
                        name="vendorStartingPrice"
                        value={formData.vendorStartingPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Faixa de Preço
                      </label>
                      <select
                        name="vendorPriceRange"
                        value={formData.vendorPriceRange}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black bg-white text-sm md:text-base"
                      >
                        {priceRanges.map(range => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Capacidade Máxima (convidados)
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          name="vendorMaxCapacity"
                          value={formData.vendorMaxCapacity}
                          onChange={handleChange}
                          min="0"
                          placeholder="Ex: 200"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Número máximo de convidados que pode atender</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
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
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
                        <button
                          type="button"
                          onClick={() => vendorImagesInput?.click()}
                          disabled={uploadingCover}
                          className="w-full md:w-auto px-4 py-3 bg-[#9CAA8E] text-white rounded-xl md:rounded-lg hover:bg-[#8A9A7E] transition-colors disabled:opacity-50 text-sm"
                        >
                          {uploadingCover ? `A carregar ${uploadProgress}/${uploadTotal}...` : 'Adicionar Imagens'}
                        </button>
                        {formData.vendorImages.length > 0 && (
                          <span className="text-xs md:text-sm text-gray-500">{formData.vendorImages.length} imagem(ns) adicionada(s)</span>
                        )}
                      </div>
                      
                      {/* Upload Progress Bar */}
                      {uploadingCover && uploadTotal > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>A carregar imagens...</span>
                            <span>{Math.round((uploadProgress / uploadTotal) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#9CAA8E] h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${(uploadProgress / uploadTotal) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Images Grid */}
                      {formData.vendorImages.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                          {formData.vendorImages.map((img, index) => (
                            <div 
                              key={index} 
                              className="relative group aspect-square rounded-lg md:rounded-xl overflow-hidden"
                            >
                              <img 
                                src={img.startsWith('https') ? img : `${API_URL}${img}`} 
                                alt={`Imagem ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              
                              {/* Overlay with delete button */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                                <div className="absolute top-1 right-1 md:top-2 md:right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteImage(img)}
                                    className="p-1.5 md:p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                  >
                                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <Image className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-xs md:text-sm">Nenhuma imagem adicionada ainda</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Descrição
                      </label>
                      <textarea
                        name="vendorDescription"
                        value={formData.vendorDescription}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Descreva seus serviços..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                      ></textarea>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Link do Google Maps
                      </label>
                      <input
                        type="url"
                        name="vendorMapLink"
                        value={formData.vendorMapLink}
                        onChange={handleChange}
                        placeholder="https://maps.google.com/..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm md:text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cole aqui o link do Google Maps para a localização do seu negócio</p>
                    </div>
                    
                    {/* FAQ Section */}
                    <div className="md:col-span-2 mt-6">
                      <h3 className="text-base md:text-lg font-serif font-semibold text-black mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Perguntas Frequentes (FAQ)
                      </h3>
                      
                      {/* Toggle FAQ Section Button */}
                      {!showFaqSection ? (
                        <button
                          type="button"
                          onClick={() => setShowFaqSection(true)}
                          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#9CAA8E] hover:text-[#9CAA8E] transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Adicionar Perguntas Frequentes
                        </button>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500 mb-4">
                            Responda às perguntas mais frequentes que os clientes fazem. As perguntas com resposta vazia não serão exibidas no seu perfil público.
                          </p>
                          
                          {/* Close FAQ section button */}
                          <button
                            type="button"
                            onClick={() => setShowFaqSection(false)}
                            className="mb-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Ocultar Perguntas Frequentes
                          </button>
                      
                      {/* Group FAQs by category */}
                      {['services', 'pricing', 'availability', 'logistics', 'style'].map(category => {
                        const categoryQuestions = FAQ_QUESTIONS.filter(q => q.category === category);
                        if (categoryQuestions.length === 0) return null;
                        
                        return (
                          <div key={category} className="mb-6">
                            <h4 className="text-sm font-medium text-[#9CAA8E] mb-3 uppercase tracking-wide">
                              {getCategoryLabel(category)}
                            </h4>
                            <div className="space-y-4">
                              {categoryQuestions.map(faq => {
                                const currentAnswer = formData.vendorFaqs?.find(f => f.questionId === faq.id)?.answer;
                                
                                return (
                                  <div key={faq.id} className="bg-gray-50 rounded-xl p-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      {faq.question}
                                    </label>
                                    
                                    {/* Text input */}
                                    {faq.type === 'text' && (
                                      <input
                                        type="text"
                                        value={currentAnswer || ''}
                                        onChange={(e) => {
                                          const newFaqs = [...(formData.vendorFaqs || [])];
                                          const existingIndex = newFaqs.findIndex(f => f.questionId === faq.id);
                                          const newAnswer = { questionId: faq.id, answer: e.target.value };
                                          
                                          if (existingIndex >= 0) {
                                            newFaqs[existingIndex] = newAnswer;
                                          } else {
                                            newFaqs.push(newAnswer);
                                          }
                                          
                                          setFormData(prev => ({ ...prev, vendorFaqs: newFaqs }));
                                        }}
                                        placeholder={faq.placeholder || 'Digite sua resposta...'}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm"
                                      />
                                    )}
                                    
                                    {/* Boolean input */}
                                    {faq.type === 'boolean' && (
                                      <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="radio"
                                            name={`faq-${faq.id}`}
                                            checked={currentAnswer === true}
                                            onChange={() => {
                                              const newFaqs = [...(formData.vendorFaqs || [])];
                                              const existingIndex = newFaqs.findIndex(f => f.questionId === faq.id);
                                              const newAnswer = { questionId: faq.id, answer: true };
                                              
                                              if (existingIndex >= 0) {
                                                newFaqs[existingIndex] = newAnswer;
                                              } else {
                                                newFaqs.push(newAnswer);
                                              }
                                              
                                              setFormData(prev => ({ ...prev, vendorFaqs: newFaqs }));
                                            }}
                                            className="w-4 h-4 text-[#9CAA8E] focus:ring-[#9CAA8E]"
                                          />
                                          <span className="text-sm text-gray-700">Sim</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                            type="radio"
                                            name={`faq-${faq.id}`}
                                            checked={currentAnswer === false}
                                            onChange={() => {
                                              const newFaqs = [...(formData.vendorFaqs || [])];
                                              const existingIndex = newFaqs.findIndex(f => f.questionId === faq.id);
                                              const newAnswer = { questionId: faq.id, answer: false };
                                              
                                              if (existingIndex >= 0) {
                                                newFaqs[existingIndex] = newAnswer;
                                              } else {
                                                newFaqs.push(newAnswer);
                                              }
                                              
                                              setFormData(prev => ({ ...prev, vendorFaqs: newFaqs }));
                                            }}
                                            className="w-4 h-4 text-[#9CAA8E] focus:ring-[#9CAA8E]"
                                          />
                                          <span className="text-sm text-gray-700">Não</span>
                                        </label>
                                      </div>
                                    )}
                                    
                                   
                                   
                                   {/* Multi-select input */}
{faq.type === 'multi-select' && (
  <div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {/* Combine predefined options with any custom answers */}
      {[...new Set([
        ...faq.options,
        ...(Array.isArray(currentAnswer) 
          ? currentAnswer.filter(item => !faq.options.includes(item)) 
          : [])
      ])].map(option => {
        const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(option);
        const isCustom = !faq.options.includes(option);
        
        return (
          <label
            key={option}
            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
              isSelected 
                ? 'bg-[#9CAA8E]/10 border-[#9CAA8E] text-[#9CAA8E]' 
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {
                const newFaqs = [...(formData.vendorFaqs || [])];
                const existingIndex = newFaqs.findIndex(f => f.questionId === faq.id);
                let currentAnswers = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
                
                if (isSelected) {
                  // Remove the option
                  currentAnswers = currentAnswers.filter(a => a !== option);
                } else {
                  // Add the option
                  currentAnswers.push(option);
                }
                
                const newAnswer = { questionId: faq.id, answer: currentAnswers };
                
                if (existingIndex >= 0) {
                  newFaqs[existingIndex] = newAnswer;
                } else {
                  newFaqs.push(newAnswer);
                }
                
                setFormData(prev => ({ ...prev, vendorFaqs: newFaqs }));
              }}
              className="hidden"
            />
            {isSelected && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
            <span className="text-sm flex-1">
              {option}
              {isCustom && (
                <span className="ml-1 hidden text-xs text-gray-400">(personalizado)</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
    
    {/* Custom input for allowCustom */}
    {faq.allowCustom && (
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={customFaqInputs[faq.id] || ''}
          onChange={(e) => setCustomFaqInputs(prev => ({ ...prev, [faq.id]: e.target.value }))}
          placeholder={faq._placeholder || "Adicionar item personalizado..."}
          className="flex-1 text-gray-500 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && customFaqInputs[faq.id]?.trim()) {
              e.preventDefault();
              const customValue = customFaqInputs[faq.id].trim();
              const newFaqs = [...(formData.vendorFaqs || [])];
              const existingIndex = newFaqs.findIndex(f => f.questionId === faq.id);
              let currentAnswers = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
              
              if (!currentAnswers.includes(customValue)) {
                currentAnswers.push(customValue);
                const newAnswer = { questionId: faq.id, answer: currentAnswers };
                
                if (existingIndex >= 0) {
                  newFaqs[existingIndex] = newAnswer;
                } else {
                  newFaqs.push(newAnswer);
                }
                
                setFormData(prev => ({ ...prev, vendorFaqs: newFaqs }));
                setCustomFaqInputs(prev => ({ ...prev, [faq.id]: '' }));
                toast.success(`"${customValue}" adicionado!`);
              } else {
                toast.error('Este item já foi adicionado');
              }
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            const customValue = customFaqInputs[faq.id]?.trim();
            if (customValue) {
              const newFaqs = [...(formData.vendorFaqs || [])];
              const existingIndex = newFaqs.findIndex(f => f.questionId === faq.id);
              let currentAnswers = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
              
              if (!currentAnswers.includes(customValue)) {
                currentAnswers.push(customValue);
                const newAnswer = { questionId: faq.id, answer: currentAnswers };
                
                if (existingIndex >= 0) {
                  newFaqs[existingIndex] = newAnswer;
                } else {
                  newFaqs.push(newAnswer);
                }
                
                setFormData(prev => ({ ...prev, vendorFaqs: newFaqs }));
                setCustomFaqInputs(prev => ({ ...prev, [faq.id]: '' }));
                toast.success(`"${customValue}" adicionado!`);
              } else {
                toast.error('Este item já foi adicionado');
              }
            } else {
              toast.error('Digite um valor para adicionar');
            }
          }}
          className="px-4 py-2 bg-[#9CAA8E] text-white rounded-lg text-sm hover:bg-[#8A9A7E]"
        >
          Adicionar
        </button>
      </div>
    )}
  </div>
)}


                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      </>
                      )}
                    </div>
                  </div>
                )}

                {/* Show vendor stats if vendor is selected */}
                {selectedVendor && (
                  <div className="mt-6 md:mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-base md:text-lg font-serif font-semibold text-black mb-4">
                      Estatísticas do Perfil
                    </h3>
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                      <div className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                        <p className="text-xl md:text-3xl font-bold text-[#9CAA8E]">{selectedVendor.averageRating || 0}</p>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">Avaliação</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                        <p className="text-xl md:text-3xl font-bold text-[#9CAA8E]">{selectedVendor.totalReviews || 0}</p>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">Avaliações</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                        <p className="text-xl md:text-3xl font-bold text-[#9CAA8E]">{selectedVendor.quoteRequests?.length || 0}</p>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">Orçamentos</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quote Requests Tab */}
            {activeTab === 'quotes' && formData.userType === 'vendor' && (
              <div className="space-y-6">
                <h2 className="text-lg md:text-xl font-serif font-semibold text-black pb-2 border-b border-gray-100">
                  Gestão de Orçamentos
                </h2>

                {loadingQuotes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-[#9CAA8E] border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-2 text-sm">A carregar orçamentos...</p>
                  </div>
                ) : quoteRequests.length === 0 ? (
                  <div className="text-center py-8 md:py-12 bg-gray-50 rounded-xl">
                    <MessageSquare className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Nenhum orçamento solicitado ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {quoteRequests.map((quote) => (
                      <div key={quote._id} className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="flex items-start gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 md:w-6 md:h-6 text-[#9CAA8E]" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-black text-sm md:text-base">{quote.client?.name || 'Cliente'}</h4>
                              <p className="text-xs md:text-sm text-gray-500">{quote.client?.email}</p>
                              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-gray-600">
                                {quote.eventDate && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                    {new Date(quote.eventDate).toLocaleDateString('pt-PT')}
                                  </span>
                                )}
                                {quote.guestCount && (
                                  <span>{quote.guestCount} convidados</span>
                                )}
                              </div>
                              {quote.message && (
                                <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg text-xs md:text-sm">
                                  {quote.message}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 md:gap-2">
                            <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {quote.status === 'pending' ? 'Pendente' : 
                               quote.status === 'accepted' ? 'Aceite' : 'Recusado'}
                            </span>
                            {quote.responseMessage && (
                              <p className="text-xs text-gray-500 text-right max-w-xs hidden md:block">
                                <span className="font-medium">Resposta:</span> {quote.responseMessage}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Mobile Response Message */}
                        {quote.responseMessage && (
                          <p className="md:hidden mt-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
                            <span className="font-medium">Resposta:</span> {quote.responseMessage}
                          </p>
                        )}

                        {/* Response Section */}
                        {quote.status === 'pending' && respondingQuote === quote._id && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <textarea
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                              placeholder="Escreva uma mensagem para o cliente (opcional)..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black mb-3 text-sm"
                              rows="2"
                            />
                            <div className="flex flex-col md:flex-row gap-2">
                              <button
                                onClick={() => handleQuoteResponse(quote._id, 'accepted')}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                              >
                                <Check className="w-4 h-4" /> Aceitar
                              </button>
                              <button
                                onClick={() => handleQuoteResponse(quote._id, 'rejected')}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                              >
                                <XCircle className="w-4 h-4" /> Recusar
                              </button>
                              <button
                                onClick={() => { setRespondingQuote(null); setResponseMessage(''); }}
                                className="px-4 py-3 text-gray-600 hover:text-gray-800 text-sm"
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
                              className="text-[#9CAA8E] hover:text-[#8A9A7E] font-medium text-sm"
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
                <h2 className="text-lg md:text-xl font-serif font-semibold text-black pb-2 border-b border-gray-100">
                  Gestão de Avaliações
                </h2>

                {selectedVendor?.reviews?.length === 0 || !selectedVendor?.reviews ? (
                  <div className="text-center py-8 md:py-12 bg-gray-50 rounded-xl">
                    <Star className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Nenhuma avaliação recebida ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Average Rating Card */}
                    <div className="bg-[#9CAA8E]/10 rounded-xl p-4 md:p-6 text-center">
                      <p className="text-3xl md:text-5xl font-bold text-[#9CAA8E]">{selectedVendor.averageRating?.toFixed(1) || '0.0'}</p>
                      <div className="flex justify-center gap-1 my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 md:w-5 md:h-5 ${star <= Math.round(selectedVendor.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-xs md:text-sm text-gray-600">{selectedVendor.totalReviews || 0} avaliação(ões)</p>
                    </div>

                    {/* Reviews List */}
                    {selectedVendor?.reviews?.map((review, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
                        <div className="flex items-start gap-3 md:gap-4">
                          {/* User Avatar or Guest Icon */}
                          {(review.user && typeof review.user === 'object' && review.user.name) ? (
                            review.user.avatar ? (
                              <img
                                src={review.user.avatar.startsWith('https') ? review.user.avatar : `${API_URL}${review.user.avatar}`}
                                alt={review.user.name}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#9CAA8E] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm md:text-base text-white font-medium">
                                  {review.user.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            {/* Show user name or Guest */}
                            <h4 className="font-semibold text-black text-sm md:text-base">
                              {(review.user && typeof review.user === 'object' && review.user.name) 
                                ? review.user.name 
                                : (review.clientName || 'Convidado')}
                            </h4>
                            <div className="flex gap-1 my-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-3 h-3 md:w-4 md:h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-gray-700 mt-2 text-xs md:text-sm">{review.comment}</p>
                            {review.createdAt && (
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(review.createdAt).toLocaleDateString('pt-PT')}
                              </p>
                            )}
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
                <h2 className="text-lg md:text-xl font-serif font-semibold text-black pb-2 border-b border-gray-100">
                  Meus Orçamentos
                </h2>

                {loadingMyQuotes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-[#9CAA8E] border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-2 text-sm">A carregar orçamentos...</p>
                  </div>
                ) : myQuoteRequests.length === 0 ? (
                  <div className="text-center py-8 md:py-12 bg-gray-50 rounded-xl">
                    <MessageSquare className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Você ainda não solicitou nenhum orçamento</p>
                    <p className="text-xs text-gray-400 mt-2">Visite a página de fornecedores para encontrar os melhores serviços</p>
                  </div>
                ) : (
                
                
                  <div className="space-y-3 md:space-y-4">
  {myQuoteRequests.map((quote) => (
    <div
      key={quote._id}
      className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => quote.vendor?._id && handleVendorClick(quote.vendor._id)}
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        
        {/* LEFT SIDE */}
        <div className="flex items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 md:w-6 md:h-6 text-[#9CAA8E]" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-black text-sm md:text-base truncate">
              {quote.vendor?.name || 'Fornecedor'}
            </h4>

            <p className="text-xs md:text-sm text-gray-500 truncate">
              {quote.vendor?.category?.name}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs md:text-sm text-gray-600">
              {quote.eventDate && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  {new Date(quote.eventDate).toLocaleDateString('pt-PT')}
                </span>
              )}

              {quote.guestCount && (
                <span>{quote.guestCount} convidados</span>
              )}
            </div>

            {quote.message && (
              <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg text-xs md:text-sm break-words">
                {quote.message}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              quote.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : quote.status === 'accepted'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {quote.status === 'pending'
              ? 'Pendente'
              : quote.status === 'accepted'
              ? 'Aceite'
              : 'Recusado'}
          </span>

          {quote.vendor?._id && (
            <span className="text-xs text-[#9CAA8E]">
              Ver fornecedor
            </span>
          )}
        </div>
      </div>

      {/* RESPONSE MESSAGE */}
      {quote.responseMessage && (
        <p className="mt-4 text-xs md:text-sm text-gray-500 border-t border-gray-100 pt-4 break-words">
          <span className="font-medium">
            Resposta do fornecedor:
          </span>{' '}
          {quote.responseMessage}
        </p>
      )}

      {/* CREATED DATE */}
      {quote.createdAt && (
        <p className="text-xs text-gray-400 mt-3 md:mt-4">
          Solicitado em:{' '}
          {new Date(quote.createdAt).toLocaleDateString('pt-PT')}
        </p>
      )}
    </div>
  ))}
</div>


                )}
              </div>
            )}

            {/* Submit Button - Desktop */}
            <div className="hidden md:block mt-8 pt-6 border-t border-gray-100">
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

            {/* Submit Button - Mobile Sticky Bottom */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-[#9CAA8E] text-white font-medium rounded-xl hover:bg-[#8A9A7E] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
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

        {/* Add Vendor Modal - Desktop */}
        {showAddVendorModal && (
          <div className="hidden md:flex fixed inset-0 bg-black/50 items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-serif font-bold text-black">Adicionar Novo Fornecedor</h3>
                <button onClick={() => setShowAddVendorModal(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              {/* Info message about pending approval */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Aprovação Necessária</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Após criar o fornecedor, seu perfil ficará <strong>pendente de aprovação</strong> por um administrador. 
                      Somente após a aprovação seu fornecedor estará visível publicamente na plataforma.
                    </p>
                  </div>
                </div>
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={newVendorData.phone || ''}
                    onChange={(e) => setNewVendorData({...newVendorData, phone: e.target.value})}
                    placeholder="Ex: +258 84/85 xxx xxxx"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={newVendorData.email || ''}
                    onChange={(e) => setNewVendorData({...newVendorData, email: e.target.value})}
                    placeholder="Ex: contacto@empresa.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                  />
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

        {/* Add Vendor Modal - Mobile Optimized */}
        <AnimatePresence>
          {showAddVendorModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end"
              onClick={() => setShowAddVendorModal(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-t-2xl w-full max-w-md mx-auto overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-black">Adicionar Fornecedor</h3>
                    <button 
                      onClick={() => setShowAddVendorModal(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  {/* Info message about pending approval */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-blue-800 font-medium">Aprovação Necessária</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Perfil ficará pendente de aprovação por um administrador.
                        </p>
                      </div>
                    </div>
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
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select
                        value={newVendorData.category}
                        onChange={(e) => setNewVendorData({...newVendorData, category: e.target.value})}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] text-sm"
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input
                        type="tel"
                        value={newVendorData.phone || ''}
                        onChange={(e) => setNewVendorData({...newVendorData, phone: e.target.value})}
                        placeholder="Ex: +258 84/85 xxx xxxx"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                      <input
                        type="email"
                        value={newVendorData.email || ''}
                        onChange={(e) => setNewVendorData({...newVendorData, email: e.target.value})}
                        placeholder="Ex: contacto@empresa.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] text-sm"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-3 bg-[#9CAA8E] text-white rounded-xl font-medium active:bg-[#8A9A7E] transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Criando...' : 'Criar Fornecedor'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vendor Profile Modal */}
        {showProfile && selectedVendorProfile && (
          <VendorProfileModal
            vendor={selectedVendorProfile}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
            onClose={() => {
              setShowProfile(false);
              setSelectedVendorProfile(null);
            }}
            onRequestQuote={(vendor) => {
              setShowProfile(false);
              setSelectedVendorProfile(null);
            }}
            onAddReview={(vendor) => {
              setShowProfile(false);
              setSelectedVendorProfile(null);
            }}
            getPriceRangeColor={getPriceRangeColor}
            getPriceRangeLabel={getPriceRangeLabel}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;