import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bell, Calendar, MapPin, Check, Users, Euro, ChevronRight, Camera, UtensilsCrossed, Music, Flower2, User, LogOut, Settings, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../api/client';

export default function WeddingDashboard() {
  const [activeTab, setActiveTab] = useState('resumo');
  const {user, signOut}  = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const profileMenuRef = useRef(null);

 useEffect(()=>{
        if(user?.role=="admin"){
     navigate('/admin')
  }
 },[user])

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

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
    navigate('/');
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(false);
    navigate('/profile');
  };

  const tabs = [
    { id: 'resumo', label: 'Resumo', path: '/' },
    { id: 'agenda', label: 'Agenda de Tarefas', path: '/checklist' },
    { id: 'fornecedores', label: 'Fornecedores', path: '/vendors' },
    { id: 'convidados', label: 'Convidados', path: '/guests' },
    { id: 'orcamento', label: 'Orçamento', path: '/budget' },
  ];

  const tasks = [
    { id: 1, title: 'Escolher fotógrafo', deadline: 'Prazo: 10 dias', priority: 'Alta', completed: false },
    { id: 2, title: 'Confirmar espaço da cerimónia', deadline: 'Prazo: 15 dias', priority: 'Média', completed: false },
    { id: 3, title: 'Agendar prova de menu', deadline: 'Prazo: 20 dias', priority: 'Baixa', completed: false },
  ];

  const vendors = [
    { id: 1, name: 'Fotógrafo', company: 'João Silva Photography', status: 'Confirmado', icon: Camera, color: 'bg-green-100' },
    { id: 2, name: 'Catering', company: 'Sabores do Convento', status: 'Confirmado', icon: UtensilsCrossed, color: 'bg-pink-100' },
    { id: 3, name: 'DJ / Música', company: 'SoundWave Events', status: 'Contactado', icon: Music, color: 'bg-yellow-100' },
    { id: 4, name: 'Decoração', company: 'Flores & Encantos', status: 'Contactado', icon: Flower2, color: 'bg-purple-100' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'text-red-500';
      case 'Média': return 'text-orange-500';
      case 'Baixa': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado': return 'text-green-600';
      case 'Contactado': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
          </div>
            <span className="text-gray-700 font-light">Meu Casamento</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-gray-400" />
            
            {/* Profile Dropdown */}
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
                <span className="text-gray-700 font-medium">{user?.name}</span>
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
                    onClick={handleProfileClick}
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-100/50 to-orange-100/50 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-light text-gray-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            {user?.name}
          </h1>
          <div className="flex items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">15 de Junho, 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Quinta do Convento, Sintra</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Faltam</div>
            <div className="text-5xl font-light text-gray-600">120</div>
            <div className="text-sm text-gray-500">dias</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`px-1 py-4 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-gray-800'
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Próximas Tarefas */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-light text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                Próximas Tarefas
              </h2>
              <Check className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded border-gray-300"
                    checked={task.completed}
                    readOnly
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-800">{task.title}</div>
                    <div className="text-xs text-gray-500">{task.deadline}</div>
                  </div>
                  <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <Link to="/checklist">Ver agenda completa</Link>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Meus Convidados */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-light text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                Meus Convidados
              </h2>
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-center mb-6">
              <div className="text-5xl font-light text-gray-800 mb-2">150</div>
              <div className="text-sm text-gray-500">Total de convidados</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-light text-gray-800">87</div>
                <div className="text-xs text-gray-600">Confirmados</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-light text-gray-800">63</div>
                <div className="text-xs text-gray-600">Pendentes</div>
              </div>
            </div>
            <button className="mt-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <Link to="/vendors">Gerir convidados</Link>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Meu Orçamento */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-light text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                Meu Orçamento
              </h2>
              <Euro className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Orçamento Total</span>
                <span className="text-gray-800 font-medium">€25,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gasto até agora</span>
                <span className="text-gray-800">€12,500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Restante</span>
                <span className="text-gray-800 font-medium">€12,500</span>
              </div>
            </div>
            <div className="mb-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center mb-4">50% do orçamento utilizado</div>
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <Link to="/budget">Ver orçamento completo</Link>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Fornecedores e Equipa */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-light text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                Fornecedores e Equipa
              </h2>
              <UtensilsCrossed className="w-5 h-5 text-green-400" />
            </div>
            <div className="space-y-4">
              {vendors.map((vendor) => {
                const Icon = vendor.icon;
                return (
                  <div key={vendor.id} className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${vendor.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{vendor.name}</div>
                      <div className="text-xs text-gray-500">{vendor.company}</div>
                    </div>
                    <span className={`text-xs font-medium ${getStatusColor(vendor.status)}`}>
                      {vendor.status}
                    </span>
                  </div>
                );
              })}
            </div>
            <button className="mt-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <Link to="/vendors">Ver fornecedores</Link>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Espaços */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-light text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                Espaços
              </h2>
              <MapPin className="w-5 h-5 text-green-400" />
            </div>
            <div className="mb-4">
              <img
                src="https://images.unsplash.com/photo-1519167758481-83f29da8c1e8?w=800&h=400&fit=crop"
                alt="Quinta do Convento"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Cerimónia & Recepção</div>
              <div className="text-lg font-medium text-gray-800">Quinta do Convento</div>
              <div className="text-sm text-gray-600">Sintra, Portugal</div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Capacidade: 150 pessoas</span>
              </div>
              <span className="inline-block text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                Confirmado
              </span>
            </div>
            <button className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              Gerir espaços
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <div>© 2025 Meu Casamento. Todos os direitos reservados.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-700">Ajuda</a>
            <a href="#" className="hover:text-gray-700">Privacidade</a>
            <a href="#" className="hover:text-gray-700">Termos</a>
          </div>
        </div>
      </footer>

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
    </div>
  );
}