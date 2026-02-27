import React, { useState } from 'react';
import { Calendar, Users, Mail, Globe, CheckSquare, DollarSign, Star, Check, Instagram, Facebook, Youtube, Camera, MapIcon, MapPin } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/loader';
import WeddingDashboard from '../dashboad';

export default function WeddingLanding() {
  const { t, i18n } = useTranslation();
  const data=useData()
  const navigate=useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {user,loading,signOut}  = useAuth()
  
  const vendors = [
    {
      name: 'Atelier Moments',
      category: 'Fotografia',
      rating: 4.9,
      reviews: 127,
      location: 'Lisboa',
      image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=300&fit=crop'
    },
    {
      name: 'Quinta da Vale',
      category: 'Espaço para Eventos',
      rating: 5.0,
      reviews: 89,
      location: 'Sintra',
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop'
    },
    {
      name: 'Flora & Design',
      category: 'Decoração Floral',
      rating: 4.8,
      reviews: 156,
      location: 'Porto',
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=300&fit=crop'
    },
    {
      name: 'Sabor Premium',
      category: 'Buffet & Catering',
      rating: 4.9,
      reviews: 203,
      location: 'Cascais',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop'
    }
  ];

  const categories = ['Todos', 'Fotografia', 'Espaços', 'Decoração', 'Buffet', 'Música'];

  const testimonials = [
    {
      rating: 5,
      text: '"Incrível! Conseguimos organizar nosso casamento em apenas 3 meses. A organização e as ferramentas são impecáveis."',
      name: 'Ana & João',
      date: 'Casaram em 2024',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      rating: 5,
      text: '"O controle de orçamento salvou nosso casamento! Conseguimos economizar 30% do que tínhamos planejado inicialmente."',
      name: 'Maria & Pedro',
      date: 'Casaram em 2024',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    {
      rating: 5,
      text: '"Nossos convidados amaram o site do casamento! Foi tão fácil confirmar presença e ver todos os detalhes."',
      name: 'Carla & Bruno',
      date: 'Casaram em 2023',
      avatar: 'https://i.pravatar.cc/150?img=9'
    }
  ];

  const inspirationImages = [
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop'
  ];

  if (loading) {
    return <Loader />;
  }

  if (user) {
    return <WeddingDashboard />;
  }

  

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      
      
    
    <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b">
  {/* Left side: Logo/Brand */}
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-[#9CAA8E] rounded-full flex items-center justify-center">
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    </div>
    <span className="text-lg sm:text-xl font-semibold text-black">{t('nav.brand')}</span>
  </div>
  
  {/* Desktop Navigation - Hidden on mobile/tablet */}
  <div className="hidden lg:flex gap-6 xl:gap-8 text-gray-600">
    <a href="#" className="hover:text-gray-900 transition-colors">{t('nav.forCouples')}</a>
    <a href="#" className="hover:text-gray-900 transition-colors">{t('nav.vendors')}</a>
    <a href="#" className="hover:text-gray-900 transition-colors">{t('nav.contact')}</a>
  </div>
  
  {/* Right side: Auth buttons and mobile menu */}
  <div className="flex items-center gap-3">
    {/* Desktop Auth Buttons - Hidden on mobile/tablet */}
    <div className="hidden lg:flex gap-3">
      {user ? (
        <button 
          onClick={signOut} 
          className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          {t('nav.logout')}
        </button>
      ) : (
        <>
          <button 
            onClick={() => navigate('/login')} 
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {t('nav.login')}
          </button>
          <button 
            onClick={() => navigate('/signup')} 
            className="px-6 py-2 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E] transition-colors"
          >
            {t('nav.signup')}
          </button>
        </>
      )}
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
          {t('nav.forCouples')}
        </a>
        <a 
          href="#" 
          className="py-2 text-gray-600 hover:text-gray-900 border-b border-gray-100"
          onClick={() => setIsMenuOpen(false)}
        >
          {t('nav.vendors')}
        </a>
        <a 
          href="#" 
          className="py-2 text-gray-600 hover:text-gray-900 border-b border-gray-100"
          onClick={() => setIsMenuOpen(false)}
        >
          {t('nav.categories')}
        </a>
        <a 
          href="#" 
          className="py-2 text-gray-600 hover:text-gray-900 border-b border-gray-100"
          onClick={() => setIsMenuOpen(false)}
        >
          {t('nav.contact')}
        </a>
        
        {/* Mobile/Tablet Auth Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          {user ? (
            <button 
              onClick={() => {
                signOut();
                setIsMenuOpen(false);
              }} 
              className="w-full py-3 text-center text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('nav.logout')}
            </button>
          ) : (
            <>
              <button 
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }} 
                className="w-full py-3 text-center text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('nav.login')}
              </button>
              <button 
                onClick={() => {
                  navigate('/signup');
                  setIsMenuOpen(false);
                }} 
                className="w-full py-3 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E] transition-colors"
              >
                {t('nav.signup')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )}
</nav>




    {/* <div 
      className=""
      style = {{
      background: 'linear-gradient(180deg, rgba(244, 228, 225, 0.3) 0%, rgba(254, 253, 251, 1) 100%)'
    }}>
      <section className="px-8 hidden py-16 max-w-7xl mx-auto"  
>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif mb-6 text-black">
              Planei o seu <span className="text-[#9CAA8E]">casamento</span><br />
              em um só lugar
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Ferramentas, inspiração e os melhores fornecedores para<br />
              o seu grande dia
            </p>
            <div className="flex gap-4 mb-8 max-sm:flex-col">
              <button onClick={()=>navigate('/signup')} className="px-8 py-3 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E]">
                Começar agora
              </button>
              <button onClick={()=>navigate('/signup')} className="px-8 py-3 border-2 border-[#9CAA8E] text-[#9CAA8E] rounded-full hover:bg-[#9CAA8E] hover:text-white">
                Sou fornecedor
              </button>
            </div>
           
           <div className="flex items-center gap-2">
  <div className="flex -space-x-2">
    <div className="w-8 h-8 rounded-full bg-pink-300 border-2 border-white overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
        alt="Happy couple" 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-white overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
        alt="Happy couple" 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="w-8 h-8 rounded-full bg-purple-300 border-2 border-white overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" 
        alt="Happy couple" 
        className="w-full h-full object-cover"
      />
    </div>
  </div>
  <span className="text-sm text-gray-600">+10.000 casais felizes</span>
</div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop"
              alt="Wedding ceremony"
              className="rounded-2xl shadow-2xl w-full"
            />
            <div className="absolute bottom-6 left-6 bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-[#9CAA8E]" />
              <div>
                <div className="font-semibold text-sm text-black">{t('stats.weddingOrganized')}</div>
                <div className="text-xs text-gray-500">{t('stats.inMonths')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
     </div>*/}





      {/* Hero Section */}
      <section className="relative min-h-[300px] max-lg:min-h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=800&fit=crop"
            alt="Wedding ceremony"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-serif mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-white/95 max-lg:opacity-0 pointer-none:">
            {t('hero.subtitle')}
          </p>
        </div>
        
        {/* White Card Overlay */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[70%] max-md:translate-y-[75%]  w-[95%] max-w-6xl bg-white rounded-3xl shadow-2xl z-20 p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-12 text-black">{t('features.title')}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 mb-8">
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckSquare className="w-7 h-7 md:w-8 md:h-8 text-[#9CAA8E]" />
              </div>
              <h3 className="font-semibold text-sm md:text-base mb-1 text-black">{t('features.checklist.title')}</h3>
              <p className="text-xs md:text-sm text-gray-600">{t('features.checklist.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-7 h-7 md:w-8 md:h-8 text-[#9CAA8E]" />
              </div>
              <h3 className="font-semibold text-sm md:text-base mb-1 text-black">{t('features.budget.title')}</h3>
              <p className="text-xs md:text-sm text-gray-600">{t('features.budget.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 md:w-8 md:h-8 text-[#9CAA8E]" />
              </div>
              <h3 className="font-semibold text-sm md:text-base mb-1 text-black">{t('features.vendors.title')}</h3>
              <p className="text-xs md:text-sm text-gray-600">{t('features.vendors.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Mail className="w-7 h-7 md:w-8 md:h-8 text-[#9CAA8E]" />
              </div>
              <h3 className="font-semibold text-sm md:text-base mb-1 text-black">{t('features.invitations.title')}</h3>
              <p className="text-xs md:text-sm text-gray-600">{t('features.invitations.description')}</p>
            </div>
            
            <div className="text-center">
               <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Camera className="w-8 h-8 text-[#9CAA8E]" />
        </div>
        <h3 className="font-semibold mb-2 text-black">Galeria de Fotos</h3>
        <p className="text-sm text-gray-600">Partilhe fotos com os convidados</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 shadow px-4 py-2 rounded-lg">
                <CheckSquare className="w-5 h-5 text-[#9CAA8E]" />
                <div className="text-left">
                  <div className="font-semibold text-sm text-black">{t('stats.weddingOrganized')}</div>
                  <div className="text-xs text-gray-500">{t('stats.inMonths')}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 max-sm:hidden">
                  <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                    <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
                        alt="Happy couple" 
                        className="w-full h-full object-cover"
                    />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                    <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
                        alt="Happy couple" 
                        className="w-full h-full object-cover"
                    />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                    <img 
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" 
                        alt="Happy couple" 
                        className="w-full h-full object-cover"
                    />
                 </div>
                </div>
                <span className="text-sm text-gray-600">{t('stats.happyCouples')}</span>
              </div>
            </div>
            
            <div className="flex gap-4 max-sm:flex-col max-sm:w-full">
              <button onClick={()=>navigate('/signup')} className="px-8  py-3 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E] font-medium">
                {t('cta.startNow')}
              </button>
              <button onClick={()=>navigate('/signup')} className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:border-[#9CAA8E] hover:text-[#9CAA8E] font-medium">
                {t('cta.vendor')}
              </button>
            </div>
          </div>
        </div>
      </section>


      <div className="mt-[300px] max-md:mt-[740px]"></div>
      

      {/* Features Section */}
      <section className="bg-gray-50 py-16 hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif mb-4 text-black">Tudo que você precisa</h2>
            <p className="text-gray-600">Organize cada detalhe do seu casamento perfeito</p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-[#9CAA8E]" />
              </div>
              <h3 className="font-semibold mb-2 text-black">Checklist Completo</h3>
              <p className="text-sm text-gray-600">Organize todo o casamento passo a passo</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-[#9CAA8E]" />
              </div>
              <h3 className="font-semibold mb-2 text-black">Controle de Orçamento</h3>
              <p className="text-sm text-gray-600">Controle orçamento e gastos</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#9CAA8E]" />
              </div>
              <h3 className="font-semibold mb-2 text-black">Fornecedores</h3>
              <p className="text-sm text-gray-600">Encontre fornecedores de confiança</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#9CAA8E]" />
              </div>
              <h3 className="font-semibold mb-2 text-black">Convites Online</h3>
              <p className="text-sm text-gray-600">Confirmação de presença online</p>
            </div>
            
            <div className="text-center hidden">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-[#9CAA8E]" />
              </div>
              <h3 className="font-semibold mb-2 text-black">Site do Casal</h3>
              <p className="text-sm text-gray-600">Site personalizado do casal</p>
            </div>

                <div className="text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-[#9CAA8E]" />
        </div>
        <h3 className="font-semibold mb-2 text-black">Galeria de Fotos</h3>
        <p className="text-sm text-gray-600">Partilhe fotos com os convidados</p>
      </div>
          </div>
        </div>
      </section>

      {/* Vendors Section */}
      <section className="py-16 max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
          <div>
            <h2 className="text-4xl font-serif mb-2 text-black">{t('vendors.title')}</h2>
            <p className="text-gray-600">{t('vendors.subtitle')}</p>
          </div>
          <button className="px-6 text-black py-2 border border-gray-300 rounded-full hover:border-gray-400">
            {t('vendors.viewAll')}
          </button>
        </div>
        
        <div className="flex gap-3 mb-8 overflow-x-auto">
          {categories.map((cat, idx) => (
            <button
              key={cat}
              className={`px-6 py-2 rounded-full whitespace-nowrap ${
                idx === 0 
                  ? 'bg-[#9CAA8E] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {vendors.map((vendor, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src={vendor.image} 
                  alt={vendor.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{vendor.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{vendor.category}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{vendor.rating}</span>
                    <span className="text-gray-500">({vendor.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <span><MapPin size={16}/></span>
                    <span>{vendor.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif mb-4 text-black">{t('howItWorks.title')}</h2>
            <p className="text-gray-600">{t('howItWorks.subtitle')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#9CAA8E] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-serif mb-3 text-black">{t('howItWorks.step1.title')}</h3>
              <p className="text-gray-600">{t('howItWorks.step1.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[#9CAA8E] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-serif mb-3 text-black">{t('howItWorks.step2.title')}</h3>
              <p className="text-gray-600">{t('howItWorks.step2.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[#9CAA8E] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-serif mb-3 text-black">{t('howItWorks.step3.title')}</h3>
              <p className="text-gray-600">{t('howItWorks.step3.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Couples Section */}
      <section className="py-16 max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=500&fit=crop"
              alt="Couple planning wedding"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div>
            <h2 className="text-4xl font-serif mb-4 text-black">{t('forCouples.title')}</h2>
            <p className="text-gray-600 mb-8">{t('forCouples.subtitle')}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#9CAA8E]" />
                <span className="text-gray-700">{t('forCouples.features.checklist')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#9CAA8E]" />
                <span className="text-gray-700">{t('forCouples.features.budget')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#9CAA8E]" />
                <span className="text-gray-700">{t('forCouples.features.guests')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#9CAA8E]" />
                <span className="text-gray-700">{t('forCouples.features.website')}</span>
              </div>
            </div>
            
            <button className="px-8 py-3 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E]">
              {t('cta.createWedding')}
            </button>
          </div>
        </div>
      </section>

      {/* For Vendors Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif mb-4 text-black">{t('forVendors.title')}</h2>
              <p className="text-gray-600 mb-8">{t('forVendors.subtitle')}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-700">{t('forVendors.features.profile')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-700">{t('forVendors.features.quotes')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-700">{t('forVendors.features.reviews')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-700">{t('forVendors.features.visibility')}</span>
                </div>
              </div>
              
              <button className="px-8 py-3 border-2 border-[#9CAA8E] text-[#9CAA8E] rounded-full hover:bg-[#9CAA8E] hover:text-white">
                {t('cta.registerVendor')}
              </button>
            </div>
            
            <div className="rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=500&fit=crop"
                alt="Vendor at work"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 max-w-7xl mx-auto px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif mb-4 text-black">{t('testimonials.title')}</h2>
          <div className="flex items-center justify-center gap-8 text-gray-600 max-sm:hidden">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">+10.000</div>
              <div className="text-sm">{t('testimonials.stats.couples')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">+2.000</div>
              <div className="text-sm">{t('testimonials.stats.vendors')}</div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="ml-2 text-3xl font-bold text-gray-900">4.9</span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-md">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">{testimonial.text}</p>
              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inspiration Gallery Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif mb-4 text-black">{t('inspiration.title')}</h2>
            <p className="text-gray-600">{t('inspiration.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inspirationImages.map((img, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                <img 
                  src={img} 
                  alt={`Inspiration ${idx + 1}`}
                  className="w-full h-64 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#9CAA8E]">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
            {t('ctaSection.title')}
          </h2>
          <p className="text-white/90 text-lg mb-8">
            {t('ctaSection.subtitle')}
          </p>
          <button onClick={()=>navigate('/signup')} className="px-10 py-4 bg-white text-[#9CAA8E] rounded-full hover:bg-gray-100 font-semibold text-lg">
            {t('cta.startFree')}
          </button>
          <p className="text-white/80 text-sm mt-4">{t('cta.noCreditCard')}</p>
        </div>
      </section>

      {/* Footer */}
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
                <span className="text-xl font-semibold text-white">{t('footer.brand')}</span>
              </div>
              <p className="text-gray-400 text-sm">
                {t('footer.brandDescription')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('footer.forCouples.title')}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white !text-gray-400">{t('footer.forCouples.checklist')}</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">{t('footer.forCouples.budget')}</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">{t('footer.forCouples.community')}</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">{t('footer.forCouples.weddingSite')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('footer.vendors.title')}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white !text-gray-400">{t('footer.vendors.register')}</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">{t('footer.vendors.plans')}</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">{t('footer.vendors.support')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('footer.company.title')}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white !text-gray-400">{t('footer.company.about')}</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">{t('footer.company.blog')}</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">{t('footer.company.contact')}</a></li>
                <li><a href="#" className="hover:text-white !text-gray-400">{t('footer.company.privacy')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              {t('footer.copyright')}
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
}
