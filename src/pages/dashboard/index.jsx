import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, Bell, Calendar, MapPin, Check, Users, Euro, 
  ChevronRight, Camera, UtensilsCrossed, Music, Flower2, 
  User, LogOut, Settings, X, ChevronDown, Plus, Loader2,
  TrendingUp, MessageSquare, Star, Eye, Briefcase, DollarSign,
  Play, Home, List, ShoppingBag, Users2, Calendar as CalendarIcon, Wallet, Image, Gift, Menu, Clock,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL, getTasks, getGuests, getGuestStats, getBudget, getCategories, updateBudget, getVendorQuoteRequests, getVendors, toggleTaskCompletion, getMyQuoteRequests, getVendor, getTutorials } from '../../api/client';
import VendorProfileModal from '../../components/VendorProfileModal';
import WelcomeDialog from '../../components/WelcomeDialog';
import { toast } from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import Header from '../../components/Header';

export default function WeddingDashboard() {
  const [activeTab, setActiveTab] = useState('inicio');
  const { user, profile, signOut, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  
  // Data states
  const [tasks, setTasks] = useState([]);
  const [guestStats, setGuestStats] = useState({ total: 0, confirmed: 0, pending: 0 });
  const [budget, setBudget] = useState({ total: 0, spent: 0, remaining: 0 });
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [myQuoteRequests, setMyQuoteRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tutorial videos state
  const [tutorials, setTutorials] = useState([]);
  const [playingTutorial, setPlayingTutorial] = useState(null);

  

    const data=useData()
  
      useEffect(() => {
  
      let backListener;
  
      // -------------------------
      // BROWSER BACK BUTTON
      // -------------------------
      const handlePopState = (e) => {
        if (data.postDialogOpen) {
          // Close dialog instead of going back
          e.preventDefault();
          data.setPostDialogOpen(false);
  
          // Push the state back to prevent actual navigation
          window.history.pushState(null, "", window.location.href);
        }
      };
  
      if (data.postDialogOpen) {
        // Trap browser back
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handlePopState);
      }
  
      // Cleanup
      return () => {
        if (backListener) backListener.remove();
        window.removeEventListener("popstate", handlePopState);
      };
    }, [data.postDialogOpen, location.pathname]);
  


    useEffect(()=>{
        if(!data.postDialogOpen){
            setPlayingTutorial(null)
  
        }
    },[data.postDialogOpen])
  
    useEffect(()=>{
  
      if(playingTutorial){
            data.setPostDialogOpen(true)
      }
  
     
    },[playingTutorial])
  
  // Vendor Profile Modal states
  const [showProfile, setShowProfile] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Welcome Dialog state
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  const isVendor = user?.role === 'vendor';
  const isCouple = user?.role === 'couple' || user?.role === undefined;

  // Format currency in MT (Mozambican Metical)
  const formatCurrency = (value) => {
    return `MT ${(value || 0).toLocaleString()}`;
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch tutorials (public endpoint)
        const tutorialsRes = await getTutorials();
        if (tutorialsRes.data?.tutorialVideos) {
          const videos = Object.entries(tutorialsRes.data.tutorialVideos)
            .filter(([_, url]) => url)
            .map(([key, url]) => ({
              key,
              url,
              videoId: extractYouTubeId(url)
            }));
          setTutorials(videos);
        }
        
        if (isCouple) {
          // Fetch couple data
          const [tasksRes, guestsRes, budgetRes, categoriesRes, myQuotesRes] = await Promise.allSettled([
            getTasks(),
            getGuestStats(),
            getBudget(),
            getCategories(),
            getMyQuoteRequests()
          ]);
          
          if (tasksRes.status === 'fulfilled') {
            // Tasks endpoint returns { success: true, data: [...] }
            const tasksData = tasksRes.value.data?.data || [];
            // Get pending tasks (not completed) - show max 5
            const pendingTasks = tasksData.filter(t => !t.completed && t.status !== 'completed').slice(0, 5);
            setTasks(pendingTasks);
          }
          
          if (guestsRes.status === 'fulfilled') {
            // Guest stats returns direct object { total, confirmed, pending, ... }
            setGuestStats(guestsRes.value.data || { total: 0, confirmed: 0, pending: 0 });
          }
          
          if (budgetRes.status === 'fulfilled') {
            // Budget returns { success: true, data: { totalBudget, ... } }
            const budgetData = budgetRes.value.data?.data || {};
            setBudget({
              total: budgetData.totalBudget || 0,
              spent: budgetData.totalSpent || 0,
              remaining: (budgetData.totalBudget || 0) - (budgetData.totalSpent || 0)
            });
          }

          // Calculate spent from categories
          if (categoriesRes.status === 'fulfilled') {
            const categoriesData = categoriesRes.value.data?.data || [];
            setCategories(categoriesData);
            
            // Calculate total spent from category subcategories (finalCost)
            const flatSubcategories = categoriesData.flatMap(cat => 
              cat.subcategories ? cat.subcategories.map(sub => ({ ...sub, parentName: cat.name })) : []
            );
            const totalSpent = flatSubcategories.reduce((sum, sub) => sum + (sub.finalCost || 0), 0);
            
            setBudget(prev => ({
              ...prev,
              spent: totalSpent,
              remaining: prev.total - totalSpent
            }));
          }
          
          // Get quote requests for couple
          if (myQuotesRes.status === 'fulfilled') {
            setMyQuoteRequests(myQuotesRes.value.data || []);
          }
        } else if (isVendor) {
          // Fetch vendor data
          const quotesRes = await getVendorQuoteRequests();
          setQuoteRequests(quotesRes?.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isCouple, isVendor]);

  // Handle task toggle completion
  const handleToggleTask = async (taskId) => {
    try {
      await toggleTaskCompletion(taskId);
      toast.success('Tarefa atualizada!');
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  // Show welcome dialog on first load (after data is loaded)
  useEffect(() => {
    if (!loading && user) {
      // Check if user has logged in recently (you can customize this logic)
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeDialog');
      if (!hasSeenWelcome) {
        setShowWelcomeDialog(true);
        localStorage.setItem('hasSeenWelcomeDialog', 'true');
      }
    }
  }, [loading, user]);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
    navigate('/');
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setIsProfileMenuOpen(false);
    navigate('/settings');
  };

  // Couple tabs with icons
  const coupleTabs = [
    { id: 'inicio', label: 'Inicio', path: '/', icon: Home },
    { id: 'fornecedores', label: 'Fornecedores', path: '/vendors', icon: ShoppingBag },
    { id: 'orcamento', label: 'Orçamento', path: '/budget', icon: Wallet },
    { id: 'agenda', label: 'Tarefas', path: '/checklist', icon: CheckCheck },
    { id: 'convidados', label: 'Lista de Convidados', path: '/guests', icon: Users2 },
    { id: 'gifts', label: 'Lista de Presentes', path: '/gifts', icon: Gift },
    { id: 'programa', label: 'Programa de Casamento', path: '/program', icon: Clock },
    { id: 'gallery', label: 'Partilha de fotos', path: '/gallery', icon: Image },
    
  ];

  // Vendor tabs with icons
  const vendorTabs = [
    { id: 'inicio', label: 'Painel', path: '/', icon: Home },
    { id: 'calendar', label: 'Calendário', path: '/calendar', icon: CalendarIcon },
    { id: 'pedidos', label: 'Pedidos', path: '/profile?tab=quotes', icon: MessageSquare },
    { id: 'perfil', label: 'Perfil', path: '/profile', icon: User },
  ];

  const tabs = isVendor ? vendorTabs : coupleTabs;

  // Get first 4 tabs for mobile bottom navigation
  const mobileMainTabs = tabs.slice(0, 4);
  const mobileMoreTabs = tabs.slice(4);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta':
      case 'high':
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'Média':
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'Baixa':
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado':
      case 'confirmed':
      case 'accepted':
        return 'text-green-600 bg-green-50';
      case 'Contactado':
      case 'pending':
        return 'text-blue-600 bg-blue-50';
      case 'Rejeitado':
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Calculate days until wedding
  const getDaysUntilWedding = () => {
    if (!profile?.wedding?.date) return null;
    const weddingDate = new Date(profile.wedding.date);
    const today = new Date();
    const diffTime = weddingDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Helper function to get category name from quote request
  const getCategoryName = (quote) => {
    // If category is an object with name property (vendor view with populated data)
    if (typeof quote.vendor?.category === 'object' && quote.vendor?.category?.name) {
      return quote.vendor.category.name;
    }
    // If category is a string ID (couple view), try to look it up from categories array
    if (typeof quote.vendor?.category === 'string' && categories.length > 0) {
      const category = categories.find(cat => cat._id === quote.vendor.category);
      return category?.name || 'Categoria';
    }
    // Fallback
    return quote.service || 'Serviço';
  };

  // Extract YouTube video ID
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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
      setSelectedVendor(response.data);
      setCurrentSlide(0);
      setShowProfile(true);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      toast.error('Erro ao carregar perfil do fornecedor');
    }
  };

  const daysUntilWedding = getDaysUntilWedding();

  // Calculate budget percentage
  const budgetPercentage = budget.total > 0 ? Math.round((budget.spent / budget.total) * 100) : 0;

  // Get partner name for couple header
  const partnerName = (profile?.partner?.name || profile?.partnerName) || 'Parceiro(a)';
  const weddingVenue = profile?.wedding?.venue || 'Local do Casamento';
  const weddingDateFormatted = profile?.wedding?.date 
    ? new Date(profile.wedding.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Data a definir';

  // Vendor specific data
  const pendingQuotes = quoteRequests.filter(q => q.status === 'pending').length;
  const acceptedQuotes = quoteRequests.filter(q => q.status === 'accepted').length;

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${!user ? 'hidden' : ''} bg-gray-50 pb-16 md:pb-0`}>
      {/* Header */}

      <Header/>

      <header className="bg-white hidden border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow transition-all">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <button className="text-lg sm:text-xl font-serif font-bold text-black">Meu Casamento</button>
          </Link>
          
          <div className="flex items-center gap-4">
            <button className="relative hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {user?.avatar ? (
                  <img 
                    src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`} 
                    alt={user?.name || 'Profile'}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <span className="text-gray-700 font-medium hidden sm:block">{user?.name}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    {isVendor && (
                      <span className="inline-block mt-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                        Fornecedor
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={handleProfileClick}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-500" />
                    Meu Perfil
                  </button>
                  <button 
                    onClick={handleSettingsClick}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-500" />
                    Configurações
                  </button>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button 
                      onClick={() => setShowLogoutModal(true)}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Different for vendor vs couple */}
      <div className="bg-white border-b border-gray-200 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {isVendor ? (
            // Vendor Hero Section
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium text-primary-600 uppercase tracking-wider">Área do Fornecedor</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  Bem-vindo, <span className="text-primary-600">{user?.name}</span>
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-primary-500" />
                    <span className="text-sm">{pendingQuotes} pedidos pendentes</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <Star className="w-4 h-4 text-primary-500" />
                    <span className="text-sm">{acceptedQuotes} orçamentos aceites</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Total de Pedidos</div>
                  <div className="text-5xl font-light text-primary-600">{quoteRequests.length}</div>
                  <div className="text-sm text-gray-500 mt-1">orçamentos</div>
                </div>
              </div>
            </div>
          ) : (
            // Couple Hero Section
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-primary-500" fill="currentColor" />
                  <span className="text-sm font-medium text-primary-600 uppercase tracking-wider">O Grande Dia</span>
                </div>
                {user?.userType!="wedding_planner" && <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  {user?.name} & <span className="text-primary-600">{partnerName}</span>
                </h1>}
                {user?.userType=="wedding_planner" && <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                 Bem-vindo, {user?.name}!
                </h1>}
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span className="text-sm">{weddingDateFormatted}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    <span className="text-sm">{weddingVenue}</span>
                  </div>
                </div>
              </div>
              
             {daysUntilWedding && <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Faltam</div>
                  <div className="text-5xl font-light text-primary-600">{daysUntilWedding !== null ? daysUntilWedding : '--'}</div>
                  <div className="text-sm text-gray-500 mt-1">dias</div>
                </div>
              </div>}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Navigation Tabs - Hidden on mobile */}
      <div className="hidden md:_block bg-white border-b border-gray-200 px-6 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={() => setActiveTab(tab.id)}
                className={`px-1 py-4 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 mb-16 md:mb-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : isVendor ? (
          // VENDOR DASHBOARD CONTENT
          <div className="space-y-6">
            {/* Stats Cards for Vendors */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-light text-gray-800">{pendingQuotes}</div>
                <div className="text-sm text-gray-500">Pedidos Pendentes</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="text-2xl font-light text-gray-800">{acceptedQuotes}</div>
                <div className="text-sm text-gray-500">Orçamentos Aceites</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="text-2xl font-light text-gray-800">--</div>
                <div className="text-sm text-gray-500">Visualizações do Perfil</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="text-2xl font-light text-gray-800">--</div>
                <div className="text-sm text-gray-500">Avaliações</div>
              </div>
            </div>

            {/* Recent Quote Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-800">
                    Pedidos de Orçamento Recentes
                  </h2>
                </div>
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                  {quoteRequests.length} total
                </span>
              </div>
              
              {quoteRequests.length > 0 ? (
                <div className="space-y-3">
                  {quoteRequests.slice(0, 5).map((quote) => (
                    <div key={quote._id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {quote.client?.name || 'Casal'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {quote.service || quote.message?.substring(0, 50) || 'Serviço solicitado'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(quote.createdAt).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(quote.status).split(' ')[0]} ${getStatusColor(quote.status).split(' ')[1]}`}>
                        {quote.status === 'pending' ? 'Pendente' : quote.status === 'accepted' ? 'Aceite' : quote.status === 'rejected' ? 'Rejeitado' : quote.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Ainda não tem pedidos de orçamento</p>
                  <p className="text-sm">Os casais poderão encontrar o seu perfil e solicitar orçamentos</p>
                </div>
              )}
              
              <Link 
                to="/profile?tab=quotes"
                className="mt-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                <span>Ver todos os pedidos</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick Actions for Vendors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Melhorar o seu perfil</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Um perfil completo atrai mais clientes. Adicione fotos, descrição e preços.
                </p>
                <button 
                  onClick={() => navigate('/profile')}
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <span>Editar Perfil</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Ver seu negócio</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Veja como os casais vêem o seu perfil e serviços.
                </p>
                <button 
                  onClick={() => navigate('/profile')}
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <span>Ver Perfil</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // COUPLE DASHBOARD CONTENT
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Próximas Tarefas */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-600" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-800">
                      Próximas Tarefas
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    {tasks.length} pendentes
                  </span>
                </div>
                
                <div className="space-y-3">
                  {tasks.length > 0 ? (
                    tasks.map((task) => {
                      const priorityClasses = getPriorityColor(task.priority || task.priorityLevel).split(' ');
                      return (
                        <div key={task._id || task.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <button
                            onClick={() => handleToggleTask(task._id)}
                            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              task.completed
                                ? 'bg-primary-500 border-primary-500'
                                : 'bg-white border-gray-300'
                            }`}
                          >
                            {task.completed && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <div className="flex-1">
                            <div className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {task.title}
                            </div>
                            {task.dueDate && (
                              <div className="text-xs text-gray-500">
                                Prazo: {new Date(task.dueDate).toLocaleDateString('pt-PT')}
                              </div>
                            )}
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityClasses.join(' ')}`}>
                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : task.priority === 'low' ? 'Baixa' : task.priority}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Parabéns! Não tem tarefas pendentes.
                    </div>
                  )}
                </div>
                
                <Link 
                  to="/checklist"
                  className="mt-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <span>Ver agenda completa</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Meus Convidados */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-800">
                      Meus Convidados
                    </h2>
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-light text-gray-800 mb-1">{guestStats.total}</div>
                  <div className="text-sm text-gray-500">Total de convidados</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                    <div className="text-2xl font-light text-green-700">{guestStats.confirmed}</div>
                    <div className="text-xs text-green-600">Confirmados</div>
                    {guestStats.total > 0 && (
                      <div className="text-xs text-green-500 mt-1">{Math.round((guestStats.confirmed / guestStats.total) * 100)}%</div>
                    )}
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-100">
                    <div className="text-2xl font-light text-yellow-700">{guestStats.pending}</div>
                    <div className="text-xs text-yellow-600">Pendentes</div>
                    {guestStats.total > 0 && (
                      <div className="text-xs text-yellow-500 mt-1">{Math.round((guestStats.pending / guestStats.total) * 100)}%</div>
                    )}
                  </div>
                </div>
                
                <Link 
                  to="/guests"
                  className="mt-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <span>Gerir convidados</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Meu Orçamento */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-800">
                      Meu Orçamento
                    </h2>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Orçamento Total</span>
                    <span className="text-base font-medium text-gray-800">{formatCurrency(budget.total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Gasto até agora</span>
                    <span className="text-base text-amber-600">{formatCurrency(budget.spent)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Remanescente</span>
                    <span className="text-lg font-medium text-green-600">{formatCurrency(budget.remaining)}</span>
                  </div>
                </div>
                
                <div className="relative mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${budgetPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 text-center mb-4">
                  {budgetPercentage}% do orçamento utilizado
                </div>
                
                <Link 
                  to="/budget"
                  className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <span>Ver orçamento completo</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Tutorial Videos Section - Only show if there are videos */}
            {tutorials.length > 0 && (
              <div className="mt-6">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Play className="w-6 h-6" fill="currentColor" />
                    <h2 className="text-lg font-medium">Tutoriais</h2>
                  </div>
                  <p className="text-primary-100 text-sm">
                    Aprenda a usar cada secção do seu painel de casamento. Clique num vídeo para começar a assistir.
                  </p>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-2 px-1">
                  {tutorials.map((tutorial) => (
                    <button
                      key={tutorial.key}
                      onClick={() => {
                        setPlayingTutorial(tutorial)
                        data.setPostDialogOpen(true)
                      }}
                      className="group flex-shrink-0 w-48 relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all text-left"
                    >
                      <div className="relative aspect-video bg-gray-100">
                        <img
                          src={`https://img.youtube.com/vi/${tutorial.videoId}/mqdefault.jpg`}
                          alt={tutorial.key}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 text-primary-500 ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-medium text-gray-800 capitalize">
                          {tutorial.key === 'guests' && 'Convidados'}
                          {tutorial.key === 'checklist' && 'Agenda'}
                          {tutorial.key === 'budget' && 'Orçamento'}
                          {tutorial.key === 'vendors' && 'Fornecedores'}
                          {tutorial.key === 'gallery' && 'Galeria'}
                          {tutorial.key === 'gifts' && 'Presentes'}
                          {tutorial.key === 'program' && 'Programa'}
                          {tutorial.key === 'home' && 'Início'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Tutorial</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Video Player Modal */}
            {playingTutorial && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={() => setPlayingTutorial(null)}>
                <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      Tutorial: {playingTutorial.key === 'guests' ? 'Convidados' : playingTutorial.key === 'checklist' ? 'Agenda' : playingTutorial.key === 'budget' ? 'Orçamento' : playingTutorial.key === 'vendors' ? 'Fornecedores' : playingTutorial.key === 'gallery' ? 'Galeria' : playingTutorial.key === 'gifts' ? 'Presentes' : playingTutorial.key === 'program' ? 'Programa' : playingTutorial.key === 'home' ? 'Início' : playingTutorial.key}
                    </h3>
                    <button
                      onClick={() => setPlayingTutorial(null)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${playingTutorial.videoId}?autoplay=1`}
                      title="YouTube video player"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            )}

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Orçamento de Fornecedores */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-800">
                      Orçamento de Fornecedores
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-center text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    {myQuoteRequests.length} orçamentos
                  </span>
                </div>
                
                {myQuoteRequests.length > 0 ? (
                  <div className="space-y-3">
                    {myQuoteRequests.slice(0, 4).map((quote) => (
                      <div 
                        key={quote._id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleVendorClick(quote.vendor?._id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {quote.vendor?.name || 'Fornecedor'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {getCategoryName(quote)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(quote.createdAt).toLocaleDateString('pt-PT')}
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ml-2 ${getStatusColor(quote.status).split(' ').join(' ')}`}>
                          {quote.status === 'pending' ? 'Pendente' : quote.status === 'accepted' ? 'Aceite' : quote.status === 'rejected' ? 'Rejeitado' : quote.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Ainda não solicitou orçamentos</p>
                    <p className="text-sm">Encontre fornecedores e peça orçamentos</p>
                  </div>
                )}
                
                <Link 
                  to="/vendors"
                  className="mt-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <span>Ver fornecedores</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Espaços (Wedding Venue) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-800">
                      Espaço do Casamento
                    </h2>
                  </div>
                </div>
                
                {weddingVenue && weddingVenue !== 'Local do Casamento' ? (
                  <>
                    <div className="relative mb-4 overflow-hidden rounded-lg">
                      <img
                        src="https://cdn0.hitched.co.uk/article/5702/3_2/1920/jpg/152075-ingestre-conservatory-venue.webp"
                        alt={weddingVenue}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute hidden top-2 right-2">
                        <span className="inline-block text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                          Confirmado
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Cerimónia & Recepção</div>
                      <div className="text-lg font-medium text-gray-800">{weddingVenue}</div>
                      {profile?.wedding?.venueAddress && (
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {profile.wedding.venueAddress}
                        </div>
                      )}
                      {profile?.wedding?.guestCount?.estimated && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>Capacidade: {profile.wedding.guestCount.estimated} pessoas</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Ainda não definiu o espaço</p>
                    <p className="text-sm">Adicione o local do seu casamento</p>
                    <button 
                      onClick={() => navigate('/profile')}
                      className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <span>Adicionar Espaço</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex justify-end">
            
            </div>
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around px-2 py-1">
          {mobileMainTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-600 font-medium mt-1">{tab.label}</span>
              </Link>
            );
          })}
          
          {mobileMoreTabs.length > 0 && (
            <div className="relative mobile-menu-container">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  showMobileMenu ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Menu className="w-5 h-5" />
                <span className="text-xs mt-1">Mais</span>
              </button>
              
              {/* Mobile More Menu */}
              {showMobileMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                  {mobileMoreTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Link
                        key={tab.id}
                        to={tab.path}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setShowMobileMenu(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm">{tab.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Hidden on mobile */}
      <footer className="hidden md:block bg-white border-t border-gray-200 mt-12 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div>© 2025 Meu Casamento. Todos os direitos reservados.</div>
          <div className="flex gap-6">
            <Link to="/support" className="hover:text-primary-600 transition-colors">Ajuda</Link>
            <Link to="/privacy" className="hover:text-primary-600 transition-colors">Privacidade</Link>
            <Link to="/terms" className="hover:text-primary-600 transition-colors">Termos</Link>
          </div>
        </div>
      </footer>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Sair da Conta
              </h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja sair da sua conta?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Sim, Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Profile Modal */}
      {showProfile && selectedVendor && (
        <VendorProfileModal
          vendor={selectedVendor}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          onClose={() => {
            setShowProfile(false);
            setSelectedVendor(null);
          }}
          onRequestQuote={(vendor) => {
            setShowProfile(false);
            setSelectedVendor(null);
            navigate('/vendors');
          }}
          onAddReview={(vendor) => {
            setShowProfile(false);
            setSelectedVendor(null);
          }}
          getPriceRangeColor={getPriceRangeColor}
          getPriceRangeLabel={getPriceRangeLabel}
        />
      )}

      {/* Welcome Dialog */}
      <WelcomeDialog 
        isOpen={showWelcomeDialog} 
        onClose={() => setShowWelcomeDialog(false)}
        isVendor={isVendor}
      />
    </div>
  );
}