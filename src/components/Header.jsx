import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../api/client';
import { 
  User, LogOut, Settings, X, Menu, Shield, 
  Home, Calendar, CheckSquare, Users, Gift, Image, 
  DollarSign, Briefcase, Heart, Bell, ChevronDown,
  MapPin, MessageSquare, Star, ShoppingBag, Users2, Wallet, List, Clock,
  CheckCheck
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Header = ({notSticky, returnEmpty}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthed, user, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDesktopMoreMenuOpen, setIsDesktopMoreMenuOpen] = useState(false);
  const [isMobileMoreMenuOpen, setIsMobileMoreMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const desktopMoreMenuRef = useRef(null);
  const mobileMoreMenuRef = useRef(null);

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

  console.log({postOpen:data.postDialogOpen})

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (desktopMoreMenuRef.current && !desktopMoreMenuRef.current.contains(event.target)) {
        setIsDesktopMoreMenuOpen(false);
      }
      if (mobileMoreMenuRef.current && !mobileMoreMenuRef.current.contains(event.target)) {
        setIsMobileMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to top when pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsDesktopMoreMenuOpen(false);
    setIsMobileMoreMenuOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
    navigate('/');
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    navigate('/settings');
  };

  // Helper function to get navigation items based on user role - using WeddingDashboard icons
  const getNavigationItems = () => {
    const items = [];
    
    // Home is always first
    items.push({
      label: 'Início',
      path: '/',
      icon: Home,
      show: true
    });

 
    if (user?.role === "vendor") {

      items.push({
        label: 'Calendário',
        path: '/calendar',
        icon: Calendar,
        show: true
      });

      items.push({
        label: 'Pedidos',
        path: '/profile?tab=quotes',
        icon: MessageSquare,
        show: true
      });

      items.push({
        label: 'Perfil',
        path: '/profile?tab=personal',
        icon: User,
        show: true
      });
      
    }

    if (user?.role === "couple") {
      items.push(
        {
          label: 'Fornecedores',
          path: '/vendors',
          icon: ShoppingBag,
          show: true
        },
        {
          label: 'Orçamento',
          path: '/budget',
          icon: Wallet,
          show: true
        },
        {
          label: 'Lista de Tarefas',
          short_label: 'Tarefas',
          path: '/checklist',
          icon: CheckCheck,
          show: true
        },
        {
          label: 'Lista de Convidados',
          path: '/guests',
          icon: Users2,
          show: true
        },
        {
          label: 'Lista de Presentes',
          path: '/gifts',
          icon: Gift,
          show: true
        },
        {
          label: 'Programa de Casamento',
          short_label: 'Programa',
          path: '/program',
          icon: Clock,
          show: true
        },
        {
          label: 'Partilha de Fotos',
          path: '/gallery',
          icon: Image,
          show: true
        },
      );
    }

    if (!user) {
      items.push(
        {
          label: 'Fornecedores',
          path: '/vendors',
          icon: Briefcase,
          show: true
        },
        {
          label: 'Gallery',
          path: '/public-gallery',
          icon: Image,
          show: true
        },
        {
          label: 'Contacto',
          path: '/contact',
          icon: User,
          show: true
        }
      );
    }

    if (user?.role === 'admin') {
      items.push({
        label: 'Admin',
        path: '/admin',
        icon: Shield,
        show: true
      });
    }

    return items;
  };

  const navigationItems = getNavigationItems();
  
  // For desktop: show first 5 items, rest in "Mais" menu
  const DESKTOP_VISIBLE_ITEMS = 5;
  const desktopMainNavItems = navigationItems.slice(0, DESKTOP_VISIBLE_ITEMS);
  const desktopMoreNavItems = navigationItems.slice(DESKTOP_VISIBLE_ITEMS);
  
  // For mobile bottom nav: show first 4 items, rest in "Mais" menu (ORIGINAL BEHAVIOR)
  const mobileMainNavItems = navigationItems.slice(0, 4);
  const mobileMoreNavItems = navigationItems.slice(4);
  
  // Check if any item in the desktop more menu is active
  const isDesktopMoreMenuActive = desktopMoreNavItems.some(item => 
    item.path === '/' 
      ? location.pathname === item.path 
      : location.pathname.startsWith(item.path)
  );

  if(returnEmpty) return

  return (
    <>
      <nav className={`flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 bg-white ${!notSticky ? 'sticky':''} top-0 z-50 shadow-sm`}>
        {/* Left side: Logo/Brand - Original format */}
        <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <button className="text-lg sm:text-xl font-serif font-bold text-black">Meu Casamento</button>
        </div>
        
        {/* Desktop Navigation - Hidden on mobile/tablet - WITH MORE BUTTON */}
        <div className="hidden lg:flex gap-6 xl:gap-8 text-gray-600 items-center">
          {/* Main navigation items */}
          {desktopMainNavItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`transition-colors font-medium whitespace-nowrap ${
                (item.path === '/' ? location.pathname === item.path : location.pathname.startsWith(item.path))
                  ? 'text-[#9CAA8E] font-bold' 
                  : 'hover:text-[#9CAA8E]'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* More button - only show if there are items in the more menu */}
          {desktopMoreNavItems.length > 0 && (
            <div className="relative" ref={desktopMoreMenuRef}>
              <button
                onClick={() => setIsDesktopMoreMenuOpen(!isDesktopMoreMenuOpen)}
                className={`flex items-center gap-1 transition-colors font-medium whitespace-nowrap ${
                  isDesktopMoreMenuActive || isDesktopMoreMenuOpen
                    ? 'text-[#9CAA8E] font-bold' 
                    : 'hover:text-[#9CAA8E]'
                }`}
              >
                Mais
                <ChevronDown className={`w-4 h-4 transition-transform ${isDesktopMoreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop More Menu Dropdown */}
              {isDesktopMoreMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {desktopMoreNavItems.map((item) => {
                    const isActive = item.path === '/' 
                      ? location.pathname === item.path 
                      : location.pathname.startsWith(item.path);
                    
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setIsDesktopMoreMenuOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                          isActive 
                            ? 'text-[#9CAA8E] bg-[#9CAA8E]/10 font-bold' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right side: Auth buttons and mobile menu */}
        <div className="flex items-center gap-3">
          {/* Desktop Auth Buttons - Hidden on mobile/tablet */}
          <div className="hidden lg:flex gap-3">
            {isAuthed ? (
              <div className="relative" ref={profileMenuRef}>
                {/* Profile Button with Avatar - Original style */}
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`} 
                      alt={user?.name || 'Profile'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#9CAA8E]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#9CAA8E] flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-700 font-medium hidden xl:block">{user?.name}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                      {user?.role === 'vendor' && (
                        <span className="inline-block mt-1 text-xs font-medium text-[#9CAA8E] bg-[#9CAA8E]/10 px-2 py-0.5 rounded-full">
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
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <Shield className="w-5 h-5 text-gray-500" />
                        Painel Admin
                      </button>
                    )}
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
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="px-4 py-2 text-gray-600 hover:text-[#9CAA8E] transition-colors font-medium"
                >
                  Entrar
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="px-6 py-2 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E] transition-colors font-medium"
                >
                  Cadastrar
                </button>
              </>
            )}
          </div>
        
          {/* Mobile/Tablet Menu Button - Hidden on desktop */}
          <button 
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {/* Mobile/Tablet Menu - Hidden on desktop - SHOWS PROFILE DETAILS */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[73px] bg-white z-50 overflow-y-auto">
            
            <div className="flex flex-col px-6 py-4 min-h-full">
              {/* Scrollable content - Profile Section First */}
              <div className="flex-1">
                {isAuthed ? (
                  <>
                    {/* User Info - Prominent at top of mobile menu */}
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-4">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`} 
                          alt={user?.name || 'Profile'}
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#9CAA8E]"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#9CAA8E] flex items-center justify-center">
                          <span className="text-white text-2xl font-medium">
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-lg">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        {user?.role === 'vendor' && (
                          <span className="inline-block mt-1 text-xs font-medium text-[#9CAA8E] bg-[#9CAA8E]/10 px-2 py-0.5 rounded-full">
                            Fornecedor
                          </span>
                        )}
                        {user?.role === 'couple' && profile?.wedding?.date && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>Casamento: {new Date(profile.wedding.date).toLocaleDateString('pt-PT')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Profile Actions */}
                    <div className="space-y-2 mb-6">
                      <button 
                        onClick={handleProfileClick}
                        className="w-full py-3 px-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Meu Perfil</span>
                      </button>
                      <button 
                        onClick={handleSettingsClick}
                        className="w-full py-3 px-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <Settings className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Configurações</span>
                      </button>
                      <button 
                        onClick={() => {
                          setShowLogoutModal(true);
                          setIsMenuOpen(false);
                        }} 
                        className="w-full py-3 px-4 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sair da Conta</span>
                      </button>
                    </div>

                    {/* Quick Stats for Couples */}
                    {user?.role === 'couple' && profile?.wedding?.date && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-[#9CAA8E]" fill="currentColor" />
                          O Grande Dia
                        </h3>
                        <div className="space-y-2">
                          {profile?.wedding?.date && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{new Date(profile.wedding.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                          )}
                          {profile?.wedding?.venue && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{profile.wedding.venue}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Stats for Vendors - leave hidden */}
                    {user?.role === 'vendor' && (
                      <div className="bg-gray-50  hidden rounded-xl p-4 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-[#9CAA8E]" />
                          Estatísticas
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3 text-center">
                            <MessageSquare className="w-4 h-4 text-[#9CAA8E] mx-auto mb-1" />
                            <div className="text-lg font-medium text-gray-800">0</div>
                            <div className="text-xs text-gray-500">Pedidos</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <Star className="w-4 h-4 text-[#9CAA8E] mx-auto mb-1" />
                            <div className="text-lg font-medium text-gray-800">0</div>
                            <div className="text-xs text-gray-500">Avaliações</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Non-authenticated user view */
                  <div className="flex flex-col gap-4 pt-4">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-[#9CAA8E] rounded-full flex items-center justify-center mx-auto mb-3">
                        <Heart className="w-8 h-8 text-white" fill="white" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">Bem-vindo ao Meu Casamento</h3>
                      <p className="text-sm text-gray-500">Faça login para aceder ao seu painel</p>
                    </div>
                    <button 
                      onClick={() => {
                        navigate('/login');
                        setIsMenuOpen(false);
                      }} 
                      className="w-full py-3 text-center text-gray-600 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
                    >
                      Entrar
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/signup');
                        setIsMenuOpen(false);
                      }} 
                      className="w-full py-3 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E] transition-colors"
                    >
                      Cadastrar
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation - EXACTLY AS BEFORE - Only visible on mobile/tablet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="flex items-center justify-around px-2 py-1">
          {mobileMainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/' 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMoreMenuOpen(false);
                }}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-[#9CAA8E] font-bold' 
                    : 'text-gray-500 hover:text-[#9CAA8E]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : ''}`} />
                <span className="text-xs mt-1 font-medium">{item.short_label || item.label}</span>
              </button>
            );
          })}
          
          {/* More Menu Button - Original behavior with separate ref */}
          {mobileMoreNavItems.length > 0 && (
            <div className="relative" ref={mobileMoreMenuRef}>
              <button
                onClick={() => setIsMobileMoreMenuOpen(!isMobileMoreMenuOpen)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isMobileMoreMenuOpen ? 'text-[#9CAA8E] font-bold' : 'text-gray-500 hover:text-[#9CAA8E]'
                }`}
              >
                <Menu className="w-5 h-5" />
                <span className="text-xs mt-1 font-medium">Mais</span>
              </button>

              {/* Mobile More Menu Dropdown */}
              {isMobileMoreMenuOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {mobileMoreNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.path === '/' 
                      ? location.pathname === item.path 
                      : location.pathname.startsWith(item.path);
                    
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileMoreMenuOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                          isActive 
                            ? 'text-[#9CAA8E] bg-[#9CAA8E]/10 font-bold' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#9CAA8E] stroke-2' : 'text-gray-500'}`} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
                Sair da Conta
              </h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja sair da sua conta?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium"
                >
                  Sim, Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;