import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../api/client';
import { User, LogOut, Settings, X, Menu, Shield } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthed, user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const profileMenuRef = useRef(null);

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

  // Scroll to top when pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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

  return (
    <>
      <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b bg-white">
        {/* Left side: Logo/Brand */}
        <div onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
          </div>
          <button  className="text-lg sm:text-xl font-serif font-bold text-black">Meu Casamento</button>
        </div>
        {/* Desktop Navigation - Hidden on mobile/tablet */}
        
          {user?.role!="admin" && <div className="hidden lg:flex gap-6 xl:gap-8 text-gray-600">
         

           <button 
            onClick={() => navigate('/')} 
            className={`transition-colors font-medium ${location.pathname === '/' ? 'text-[#9CAA8E] font-bold' : 'hover:text-[#9CAA8E]'}`}
          >
          Painel
          </button>
         
       {user?.role=="couple" && <>

        

          <button 
            onClick={() => navigate('/checklist')} 
            className={`transition-colors font-medium ${location.pathname === '/checklist' ? 'text-[#9CAA8E] font-bold' : 'hover:text-[#9CAA8E]'}`}
          >
            Agenda e Tarefas
          </button>

          <button 
            onClick={() => navigate('/vendors')} 
            className={`transition-colors font-medium ${location.pathname === '/vendors' ? 'text-[#9CAA8E] font-bold' : 'hover:text-[#9CAA8E]'}`}
          >
            Fornecedores
          </button>

          <button 
            onClick={() => navigate('/budget')} 
            className={`transition-colors font-medium ${location.pathname === '/budget' ? 'text-[#9CAA8E] font-bold' : 'hover:text-[#9CAA8E]'}`}
          >
            Orçamento
          </button>

          <button 
            onClick={() => navigate('/guests')} 
            className={`transition-colors font-medium ${location.pathname === '/guests' ? 'text-[#9CAA8E] font-bold' : 'hover:text-[#9CAA8E]'}`}
          >
            Convidados
          </button>

          <button 
            onClick={() => navigate('/gallery')} 
            className={`transition-colors font-medium ${location.pathname === '/gallery' ? 'text-[#9CAA8E] font-bold' : 'hover:text-[#9CAA8E]'}`}
          >
            Galeria
          </button>

          </>}


          {!user && <>

          <button 
            onClick={() => navigate('/vendors')} 
            className={`transition-colors font-medium ${location.pathname === '/vendors' ? 'text-[#9CAA8E] font-bold' : 'hover:text-[#9CAA8E]'}`}
          >
            Fornecedores
          </button>

          <button 
            onClick={() => navigate('/public-gallery')} 
            className={`transition-colors font-medium ${location.pathname === '/public-gallery' ? 'text-[#9CAA8E] font-bold' : 'hover:text-[#9CAA8E]'}`}
          >
            Gallery
          </button>

          <button 
            onClick={() => navigate('/contact')} 
            className={`transition-colors font-medium ${location.pathname === '/contact' ? 'text-[#9CAA8E] font-bold' : 'hover:text-[#9CAA8E]'}`}
          >
            Contacto
          </button>

          </>}



          {user?.role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')} 
              className={`transition-colors font-medium flex items-center gap-1 ${location.pathname.startsWith('/admin') ? 'text-[#9CAA8E] font-bold' : 'hover:text-[#9CAA8E]'}`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          )}
        </div>}
        
        {/* Right side: Auth buttons and mobile menu */}
        <div className="flex items-center gap-3">
          {/* Desktop Auth Buttons - Hidden on mobile/tablet */}
          <div className="hidden lg:flex gap-3">
            {isAuthed ? (
              <div className="relative" ref={profileMenuRef}>
                {/* Profile Button with Avatar */}
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
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
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
        
        {/* Mobile/Tablet Menu - Hidden on desktop */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50">
            <div className="flex flex-col px-6 py-4 space-y-4">
              <button 
                onClick={() => { navigate('/'); setIsMenuOpen(false); }} 
                className={`py-2 border-b border-gray-100 text-left font-medium ${location.pathname === '/' ? 'text-[#9CAA8E]' : 'text-gray-600 hover:text-[#9CAA8E]'}`}
              >
                Início
              </button>
              <button 
                onClick={() => { navigate('/vendors'); setIsMenuOpen(false); }} 
                className={`py-2 border-b border-gray-100 text-left font-medium ${location.pathname === '/vendors' ? 'text-[#9CAA8E]' : 'text-gray-600 hover:text-[#9CAA8E]'}`}
              >
                Fornecedores
              </button>
              <button 
                onClick={() => { navigate('/checklist'); setIsMenuOpen(false); }} 
                className={`py-2 border-b border-gray-100 text-left font-medium ${location.pathname === '/checklist' ? 'text-[#9CAA8E]' : 'text-gray-600 hover:text-[#9CAA8E]'}`}
              >
                Agenda e Tarefas
              </button>
              <button 
                onClick={() => { navigate('/budget'); setIsMenuOpen(false); }} 
                className={`py-2 border-b border-gray-100 text-left font-medium ${location.pathname === '/budget' ? 'text-[#9CAA8E]' : 'text-gray-600 hover:text-[#9CAA8E]'}`}
              >
                Orçamento
              </button>
              <button 
                onClick={() => { navigate('/gallery'); setIsMenuOpen(false); }} 
                className={`py-2 border-b border-gray-100 text-left font-medium ${location.pathname === '/gallery' ? 'text-[#9CAA8E]' : 'text-gray-600 hover:text-[#9CAA8E]'}`}
              >
                Galeria
              </button>
              
              {/* Mobile/Tablet Auth Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                {isAuthed ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`} 
                          alt={user?.name || 'Profile'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#9CAA8E]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#9CAA8E] flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        navigate('/profile');
                        setIsMenuOpen(false);
                      }} 
                      className="w-full py-3 text-center text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      Meu Perfil
                    </button>
                    <button 
                      onClick={() => {
                        setShowLogoutModal(true);
                        setIsMenuOpen(false);
                      }} 
                      className="w-full py-3 text-center text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Sair
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

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
