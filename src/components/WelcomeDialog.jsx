import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, X, Calendar, Users, Euro, CheckCircle, 
  ArrowRight, Star, MessageSquare, Sparkles,
  DollarSign, Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function WelcomeDialog({ isOpen, onClose, isVendor = false }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  if (!isOpen || !isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Content for couples
  const coupleTips = [
    {
      icon: Calendar,
      title: 'Planeie com Antecedência',
      description: 'Comece pela definição da data e do orçamento. Isso ajuda a guiar todas as outras decisões.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Users,
      title: 'Liste os Convidados',
      description: 'Defina o número de convidados cedo. Isso afeta a escolha do espaço e o orçamento.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: DollarSign,
      title: 'Controle o Orçamento',
      description: 'Acompanhe gastos em tempo real. Nossa plataforma ajuda a manter tudo organizado.',
      color: 'bg-amber-100 text-amber-600'
    },
    {
      icon: CheckCircle,
      title: 'Use a Checklist',
      description: 'Nossa checklist inteligente orienta cada etapa do planeamento.',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const coupleQuickActions = [
    { label: 'Adicionar tarefas', path: '/checklist', icon: CheckCircle },
    { label: 'Ver fornecedores', path: '/vendors', icon: Star },
    { label: 'Gerir convidados', path: '/guests', icon: Users },
    { label: 'Ver orçamento', path: '/budget', icon: DollarSign }
  ];

  // Content for vendors
  const vendorTips = [
    {
      icon: Briefcase,
      title: 'Complete seu Perfil',
      description: 'Um perfil completo atrai mais clientes. Adicione fotos, descrição e serviços.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: MessageSquare,
      title: 'Responda Pedidos',
      description: 'Casais solicitam orçamentos frequentemente. Responda rápido para melhores chances.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Star,
      title: 'Veja Avaliações',
      description: 'Avaliações positivas aumentam sua visibilidade e atraem mais clientes.',
      color: 'bg-amber-100 text-amber-600'
    },
    {
      icon: CheckCircle,
      title: 'Mantenha Atualizado',
      description: 'Mantenha seus serviços e preços sempre atualizados para melhores resultados.',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const vendorQuickActions = [
    { label: 'Ver pedidos', path: '/profile?tab=quotes', icon: MessageSquare },
    { label: 'Meu perfil', path: '/profile', icon: Star },
    { label: 'Editar serviços', path: '/profile', icon: Briefcase },
    { label: 'Ver fornecedores', path: '/vendors', icon: Users }
  ];

  // Use appropriate content based on user type
  const tips = isVendor ? vendorTips : coupleTips;
  const quickActions = isVendor ? vendorQuickActions : coupleQuickActions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Header with gradient - same colors for both */}
        <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-2xl p-6 pb-16">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {isVendor ? (
                <Briefcase className="w-6 h-6 text-white" />
              ) : (
                <Heart className="w-6 h-6 text-white" fill="white" />
              )}
            </div>
            <span className="text-white/80 text-sm font-medium uppercase tracking-wider">
              {isVendor ? 'Área do Fornecedor' : 'Bem-vindo ao Meu Casamento'}
            </span>
          </div>
          
          <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Georgia, serif' }}>
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-white/80 mt-2 text-lg">
            {isVendor 
              ? 'Preparei algumas dicas para ajudar a atrair mais clientes'
              : 'Preparámos alguns conselhos para ajudar no seu planeamento'}
          </p>
        </div>

        {/* Decorative wave */}
        <div className="relative -mt-8">
          <svg 
            className="w-full h-8 text-white" 
            viewBox="0 0 100 20" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0 20 C 25 0, 75 0, 100 20 Z" 
              fill="white"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-4">
          {/* Quick Tips */}
          <div className="mb-6 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-medium text-gray-800">
                {isVendor ? 'Dicas para atrair clientes' : 'Dicas para começar'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tips.map((tip, index) => (
                <div 
                  key={index}
                  className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${tip.color}`}>
                    <tip.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-gray-800">{tip.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Ações rápidas</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => {
                    handleClose();
                    navigate(action.path);
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                    <action.icon className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-primary-600">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Progress Overview - only for couples */}
          {!isVendor && profile && (
            <div className="mb-6 p-4 hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Progresso do seu casamento</h3>
                <span className="text-xs text-gray-500">
                  {profile.wedding?.date 
                    ? new Date(profile.wedding.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Data não definida'}
                </span>
              </div>
              
              <div className="flex gap-2">
                {[
                  { label: 'Perfil', done: !!(profile.partner?.name || profile?.partnerName) },
                  { label: 'Data', done: !!profile.wedding?.date },
                  { label: 'Local', done: !!profile.wedding?.venue },
                  { label: 'Orçamento', done: !!profile.wedding?.budget }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className={`flex-1 py-2 px-3 rounded-lg text-center ${
                      item.done 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-white text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {item.done && <CheckCircle className="w-3 h-3" />}
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                handleClose();
                navigate('/profile');
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
            >
              <span>{isVendor ? 'Editar perfil' : 'Completar perfil'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors font-medium"
            >
              {isVendor ? (
                <>
                  <Briefcase className="w-4 h-4" />
                  <span>Ver meu negócio</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" fill="currentColor" />
                  <span>Começar a planear</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
