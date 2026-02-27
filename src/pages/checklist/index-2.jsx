import React, { useState } from 'react';
import { ChevronDown, Heart, Lightbulb, Instagram, Facebook, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WeddingChecklistTimeline = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [filterType, setFilterType] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Pendentes');
  const [expandedSections, setExpandedSections] = useState({
    'plus12': false,
    '9to12': false,
    '6to8': false,
    '4to5': true,
    '2to3': false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const timelineSections = [
    {
      id: 'plus12',
      title: '+ 12 meses',
      completed: 0,
      total: 0,
      tasks: []
    },
    {
      id: '9to12',
      title: '9 à 12 meses',
      completed: 4,
      total: 12,
      tasks: []
    },
    {
      id: '6to8',
      title: '6 à 8 meses',
      completed: 4,
      total: 12,
      tasks: []
    },
    {
      id: '4to5',
      title: '4 à 5 meses',
      completed: 4,
      total: 12,
      tasks: [
        { id: 1, text: 'Contratar fotografia e vídeo', days: 150, completed: true },
        { id: 2, text: 'Escolher vestido de noiva', days: 150, completed: true, badge: '150 dias antes' },
        { id: 3, text: 'Definir traje do noivo', days: 150, completed: true, subtext: '150 dias antes', badge: '150 dias antes' },
        { id: 4, text: 'Escolher as alianças', days: 140, completed: true, subtext: '150 dias antes', badge: '140 dias antes' },
        { id: 5, text: 'Enviar save the date aos convidados', days: 140, completed: true, subtext: '140 dias antes', badge: '130 dias antes' },
        { id: 6, text: 'Reservar transporte para o dia do evento', days: 130, completed: false, subtext: '130 dias antes', badge: '130 dias antes' }
      ]
    },
    {
      id: '2to3',
      title: '2 à 3 meses',
      completed: 2,
      total: 9,
      tasks: [],
      tip: 'Compartilhar o checklist com seu parceiro(a) facilita o planejamento'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation - Same as Budget Manager */}
      <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b bg-white">
        {/* Left side: Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#9CAA8E] rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-lg sm:text-xl font-semibold text-black">Meu casamento</span>
        </div>
        
        {/* Desktop Navigation - Hidden on mobile/tablet */}
        <div className="hidden lg:flex gap-6 xl:gap-8 text-gray-600">
          <a href="#" className="hover:text-gray-900 transition-colors">Para Noivos</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Fornecedores</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Categorias</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Contato</a>
        </div>
        
        {/* Right side: Auth buttons and mobile menu */}
        <div className="flex items-center gap-3">
          {/* Desktop Auth Buttons - Hidden on mobile/tablet */}
          <div className="hidden lg:flex gap-3">
            <button 
              onClick={() => navigate('/login')} 
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Entrar
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="px-6 py-2 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E] transition-colors"
            >
              Cadastrar
            </button>
          </div>
          
          {/* Mobile/Tablet Menu Button - Hidden on desktop */}
          <button 
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile/Tablet Menu - Hidden on desktop */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50">
            <div className="flex flex-col px-6 py-4 space-y-4">
              <a 
                href="#" 
                className="py-2 text-gray-600 hover:text-gray-900 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Para Noivos
              </a>
              <a 
                href="#" 
                className="py-2 text-gray-600 hover:text-gray-900 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Fornecedores
              </a>
              <a 
                href="#" 
                className="py-2 text-gray-600 hover:text-gray-900 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Categorias
              </a>
              <a 
                href="#" 
                className="py-2 text-gray-600 hover:text-gray-900 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </a>
              
              {/* Mobile/Tablet Auth Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={() => {
                    navigate('/login');
                    setIsMenuOpen(false);
                  }} 
                  className="w-full py-3 text-center text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-100 to-gray-200 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop" 
            alt="Wedding flowers" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Seu Checklist de Casamento</h1>
          <p className="text-lg text-gray-600">Organize e acompanhe todas as tarefas passo a passo</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 -translate-y-[70px] bg-gray-50 p-3 rounded-2xl">
          {/* Left Column - Timeline Checklist */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              {/* Progress Section */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#9CAA8E] bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-[#9CAA8E] font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 font-medium">25 de 70 tarefas concluídas</span>
                  </div>
                  <span className="text-sm text-gray-600">35%</span>
                </div>
                
                <div className="relative mb-4">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#9CAA8E] rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>Faltam</span>
                    <span className="font-semibold text-gray-800">5 meses</span>
                    <span>para o casamento 🎉</span>
                  </div>
                  <button className="bg-[#9CAA8E] hover:bg-[#8A9A7E] text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Adicionar tarefa
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 font-medium cursor-pointer hover:border-[#9CAA8E] focus:outline-none focus:ring-2 focus:ring-[#9CAA8E]"
                  >
                    <option>Todas</option>
                    <option>Salão</option>
                    <option>Decoração</option>
                    <option>Fotografia</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 font-medium cursor-pointer hover:border-[#9CAA8E] focus:outline-none focus:ring-2 focus:ring-[#9CAA8E]"
                  >
                    <option>Pendentes</option>
                    <option>Concluídas</option>
                    <option>Em andamento</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#9CAA8E] focus:ring-[#9CAA8E]"
                  />
                  <span className="text-gray-700 text-sm">Mostrar tarefas concluídas</span>
                </label>
              </div>

              {/* Timeline Sections */}
              <div className="space-y-4">
                {timelineSections.map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                        {section.tip && (
                          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            <span>{section.tip}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {section.completed} de {section.total} concluídas
                        </span>
                        <ChevronDown 
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedSections[section.id] ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </button>

                    {expandedSections[section.id] && section.tasks.length > 0 && (
                      <div className="px-6 pb-6 space-y-3 bg-white border-t border-gray-200">
                        {section.tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                task.completed
                                  ? 'bg-[#9CAA8E] border-[#9CAA8E]'
                                  : 'bg-white border-gray-300'
                              }`}>
                                {task.completed && (
                                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-gray-700 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                    {task.text}
                                  </span>
                                  {task.subtext && (
                                    <span className="text-sm text-gray-400">({task.subtext})</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500 whitespace-nowrap">• {task.days} dias antes</span>
                              {task.badge && (
                                <span className="bg-[#9CAA8E] text-white text-xs px-3 py-1 rounded whitespace-nowrap">
                                  {task.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.tip && expandedSections[section.id] && (
                      <div className="px-6 pb-6 bg-white">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#9CAA8E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm">💡</span>
                          </div>
                          <p className="text-sm text-gray-700">{section.tip}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Smart Tips */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-6 h-6 bg-[#9CAA8E] rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" fill="white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Dicas inteligentes</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-[#9CAA8E] rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">
                    Ganhe tempo e dinheiro contratando pacotes de foto e vídeo com o mesmo fornecedor.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-[#9CAA8E] rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">
                    Defina o estilo de decoração e a paleta de cores antes de escolher suas alianças.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-[#9CAA8E] rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">
                    Delegue pequenas tarefas a amigos e familiares para aliviar o estresse.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas tarefas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Contratar fotógrafo</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Urgente</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Escolher playlist</span>
                    <span className="text-xs text-gray-500">em 15 dias</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Provar vestido</span>
                    <span className="text-xs text-gray-500">em 30 dias</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-1">Progresso da semana</div>
                <div className="text-2xl font-bold text-gray-900">+3 tarefas</div>
                <div className="text-xs text-gray-500">concluídas esta semana</div>
              </div>

              <button className="w-full bg-[#9CAA8E] text-white py-3 rounded-full font-medium hover:bg-[#8A9A7E] transition">
                Adicionar tarefa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Same as Budget Manager */}
      <footer className="bg-[#1a2332] text-white py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#9CAA8E] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-white">Meu casamento</span>
              </div>
              <p className="text-gray-400 text-sm">
                Planei o casamento perfeito do início ao fim
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Para Noivos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white !text-gray-400">Checklist</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">Orçamento</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">Comunidade</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">Site do Casamento</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Fornecedores</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white !text-gray-400">Cadastre-se</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">Planos</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">Suporte</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white !text-gray-400">Sobre</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">Blog</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">Contato</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Meu Casamento. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white !text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white !text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white !text-white">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WeddingChecklistTimeline;