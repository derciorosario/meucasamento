import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Star, Users, TrendingUp, Shield, Headphones, Briefcase, Camera, Music, Utensils, Flower2, Car, Gem, Palette, Sparkles, Mail } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getVendorCategories, getVendorStats } from '../../api/client';
import bgImage from '../../assets/vendor.jpg'

export default function VendorLanding() {
  const navigate = useNavigate();
  const [vendorCount, setVendorCount] = useState(0);
  const [coupleCount, setCoupleCount] = useState(0);
  const [avgRating, setAvgRating] = useState(4.9);
  const [categories, setCategories] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsResponse = await getVendorStats();
        if (statsResponse.data) {
          setVendorCount(statsResponse.data.totalVendors || 0);
          setCoupleCount(statsResponse.data.totalUsers || 0);
          setAvgRating(statsResponse.data.averageRating || 4.9);
        }
        
        // Fetch categories
        const categoriesResponse = await getVendorCategories();
        if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setVendorCount(600); // Fallback default
        setCoupleCount(10000); // Fallback default
        setAvgRating(4.9);
      }
    };
    fetchData();
  }, []);

  const benefits = [
    { icon: TrendingUp, title: 'Aumente sua visibilidade', description: 'Chegue a milhares de casais que buscam fornecedores todos os dias' },
    { icon: Users, title: 'Novos clientes', description: 'Receba pedidos de orçamento diretamente no seu email' },
    { icon: Shield, title: 'Construa confiança', description: 'Avaliações verificadas ajudam a conquistar a confiança dos clientes' },
    { icon: Headphones, title: 'Suporte dedicado', description: 'Nossa equipe está sempre pronta para ajudar você a crescer' }
  ];

  // Default icons for categories (in case API doesn't return icons)
  const categoryIcons = {
    'fotografia-filmagem': Camera,
    'salao-espaco-casamento': Utensils,
    'decoracao-casamento': Flower2,
    'mc': Music,
    'dj-som': Music,
    'carros-casamento': Car,
    'florista': Flower2,
    'ourivesaria-joalharia': Gem,
    'wedding-planner': Star,
    'criador-convites': Star,
    'ateliers': Palette,
    'maquiador': Sparkles,
    'bolo-casamento': Star,
    'tendas-casamento': Star,
    'lua-mel': Star,
    'musica-atuacao': Music
  };

  const categoriesList = [
    { icon: Utensils, name: 'Catering & Salões' },
    { icon: Camera, name: 'Fotografia & Vídeo' },
    { icon: Music, name: 'Música & Animação' },
    { icon: Flower2, name: 'Decoração & Floristas' },
    { icon: Car, name: 'Transportes' },
    { icon: Gem, name: 'Joalharias' },
    { icon: Palette, name: 'Vestidos & Ateliers' },
    { icon: Sparkles, name: 'Maquiadores' }
  ];

  const testimonials = [
    { name: 'João Manuel', role: 'Fotógrafo', text: 'Em 3 meses conquistei mais de 30 clientes através da plataforma. Incrível!', rating: 5 },
    { name: 'Ana Sousa', role: 'Decoradora', text: 'O melhor investimento que fiz para o meu negócio. Recomendo!', rating: 5 },
    { name: 'Miguel Costa', role: 'DJ & Som', text: 'Recebo pedidos de orçamento toda semana. A visibilidade é espetacular.', rating: 5 }
  ];

  const features = [
    'Perfil completo com galeria de fotos',
    'Pedidos de orçamento por email',
    'Avaliações e ratings de clientes',
    'Visibilidade no diretório de fornecedores',
    'Statísticas e análises detalhadas',
    'Suporte ao cliente'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header notSticky={true} />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={bgImage}
            alt="Wedding vendors"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        </div>
        
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="max-w-3xl">
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">
      Faça a sua empresa crescer com a <span className="text-[#9CAA8E]">nossa Plataforma</span>
    </h1>
    
    <div className="space-y-4 sm:space-y-6">
      <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed">
        <Check className="w-5 h-5 sm:w-6 sm:h-6 inline-block mr-2 text-[#9CAA8E] flex-shrink-0" />
        <span>Aumente a visibilidade do seu negócio</span>
      </p>
      <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed">
        <Check className="w-5 h-5 sm:w-6 sm:h-6 inline-block mr-2 text-[#9CAA8E] flex-shrink-0" />
        <span>Receba solicitações de orçamento por email</span>
      </p>
      <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
        <Check className="w-5 h-5 sm:w-6 sm:h-6 inline-block mr-2 text-[#9CAA8E] flex-shrink-0" />
        <span>Interaja com casais que estão organizando casamento e consiga novos clientes</span>
      </p>
    </div>
    
    <div className="flex flex-col sm:flex-row gap-4">
      <button 
        onClick={() => navigate('/vendor-signup')}
        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#9CAA8E] text-white rounded-full font-medium hover:bg-[#8A9A7E] transition-all shadow-lg hover:shadow-xl"
      >
        Criar conta gratuita
        <ChevronRight className="w-5 h-5" />
      </button>
      <button 
        onClick={() => navigate('/vendors')}
        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-full font-medium hover:bg-white/20 transition-all"
      >
        Ver fornecedores
      </button>
    </div>
    
    <div className="flex items-center gap-6 mt-10 text-white/80">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <span className="text-sm font-medium">{avgRating}/5 avaliação média</span>
      </div>
      <div className="flex items-center gap-2 hidden">
        <Users className="w-5 h-5" />
        <span className="text-sm font-medium">{coupleCount.toLocaleString('pt-MZ')}+ casais</span>
      </div>
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5" />
        <span className="text-sm font-medium">{vendorCount.toLocaleString('pt-MZ')}+ fornecedores</span>
      </div>
    </div>
  </div>
</div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Categorias disponíveis</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encontre a categoria ideal para o seu negócio e comece a receber pedidos de orçamento hoje mesmo.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.length > 0 ? (
              (showAllCategories ? categories : categories.slice(0, 8)).map((category, idx) => {
                const IconComponent = categoryIcons[category.slug] || Star;
                return (
                  <div 
                    key={idx}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#9CAA8E]/20 transition-colors">
                      <IconComponent className="w-6 h-6 text-[#9CAA8E]" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.vendorCount || 0}+ fornecedores</p>
                  </div>
                );
              })
            ) : (
              (showAllCategories ? categoriesList : categoriesList.slice(0, 8)).map((category, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#9CAA8E]/20 transition-colors">
                    <category.icon className="w-6 h-6 text-[#9CAA8E]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count || '20+ fornecedores'}</p>
                </div>
              ))
            )}
          </div>
          
          {(categories.length > 8 || categoriesList.length > 8) && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#9CAA8E] text-white rounded-full font-medium hover:bg-[#8A9A7E] transition-all"
              >
                {showAllCategories ? 'Ver menos' : 'Ver todas as categorias'}
                <ChevronRight className={`w-5 h-5 transition-transform ${showAllCategories ? 'rotate-90' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Por que anunciar conosco?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Somos a plataforma líder de casamentos em Moçambique, conectando fornecedores a milhares de casais todos os dias.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-center p-8">
                <div className="w-16 h-16 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-[#9CAA8E]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Como funciona a nossa Plataforma
            </h2>
          </div>
          
          <div className="grid md:grid-cols-1 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-[#9CAA8E]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Os casais poderão te encontrar</h3>
                  <p className="text-gray-600">
                    Veja os seus serviços e enviar solicitações de orçamento
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#9CAA8E]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Receba solicitações por email</h3>
                  <p className="text-gray-600">
                    Você poderá receber as solicitações por email e interactuar directamente com os casais
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-[#9CAA8E]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Consiga novos clientes</h3>
                  <p className="text-gray-600">
                    Responda as solicitações dos noivos e consigas clientes valiosos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

 

      {/* CTA Section */}
      <section className="py-20 bg-[#9CAA8E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Teste gratuitamente
          </h2>
          <p className="text-white/90 text-lg mb-4 max-w-2xl mx-auto">
            Receba solicitações de orçamento e aumente a visibilidade do seu negócio
          </p>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Criar a sua conta é grátis e leva apenas alguns minutos. Comece a receber pedidos de orçamento hoje mesmo.
          </p>
          <button 
            onClick={() => navigate('/vendor-signup')}
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-[#9CAA8E] rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
          >
            Criar conta gratuita
            <ChevronRight className="w-6 h-6" />
          </button>
          <p className="text-white/70 text-sm mt-4">
            Sem compromisso. Sem cartão de crédito.
          </p>
        </div>
      </section>

      <Footer largerPadding={true} />
    </div>
  );
}
