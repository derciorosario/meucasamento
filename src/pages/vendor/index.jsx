import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Send,
  MessageCircle,
  ZoomIn,
  CheckCircle,
  Users,
  ArrowLeft,
  X,
  Calendar,
  Loader2,
  Zap,
  Images,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL, getVendor, requestVendorQuote, addVendorReview } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// FAQ predefined questions configuration (must match profile/index.jsx)
const FAQ_QUESTIONS = [
  { id: 's1', question: 'Quais serviços estão incluídos no pacote?', type: 'text', _allowCustom: true, options: ['Fotografia', 'Vídeo', 'Decoração', 'Música', 'Iluminação', 'Buffet', 'Bolo', 'Convites', 'Flores', 'Outro'], category: 'services' },
  { id: 's2', question: 'Quantas horas de serviço estão incluídas?', type: 'text', category: 'services', placeholder: 'Ex: 8 horas, dia inteiro, etc.' },
  { id: 's3', question: 'É possível contratar serviços adicionais?', type: 'boolean', category: 'services' },
  { id: 's4', question: 'Quais são as opções de personalização disponíveis?', type: 'multi-select', options: ['Cores', 'Tema', 'Decoração', 'Música', 'Menu', 'Outro'], category: 'services' },
  { id: 'p1', question: 'Qual é o custo por convidado adicional?', type: 'text', category: 'pricing', placeholder: 'Ex: 250 MT por convidado' },
  { id: 'p2', question: 'Quais formas de pagamento são aceites?', type: 'multi-select', options: ['Dinheiro', 'Transferência bancária', 'Multicaixa', 'PayPal', 'Cartão de crédito', 'Parcelamento'], category: 'pricing' },
  { id: 'p3', question: 'É necessário pagar uma caução?', type: 'boolean', category: 'pricing' },
  { id: 'p4', question: 'Qual é a política de reembolso?', type: 'text', category: 'pricing', placeholder: 'Ex: Reembolso total até 30 dias antes' },
  { id: 'a2', question: 'Com antecedência preciso contratar?', type: 'text', category: 'availability', placeholder: 'Ex: Com pelo menos 2 meses de antecedência' },
  { id: 'a3', question: 'Trabalha em quais dias da semana?', type: 'multi-select', options: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo', 'Feriados'], category: 'availability' },
  { id: 'a4', question: 'Aceita eventos em diferentes locais?', type: 'boolean', category: 'availability' },
  { id: 'l1', question: 'Inclui transporte e logística?', type: 'boolean', category: 'logistics' },
  { id: 'l2', question: 'Qual é o raio de atuação?', type: 'text', category: 'logistics', placeholder: 'Ex: Até 50km de Maputo' },
  { id: 'l3', question: 'Há custos adicionais para deslocação?', type: 'text', category: 'logistics', placeholder: 'Ex: 5 MT por km acima de 20km' },
  { id: 'l4', question: 'Quais equipamentos são fornecidos?', type: 'multi-select', options: ['Som', 'Iluminação', 'Projétor', 'Decoração', 'Mobiliário', 'Pratos e talheres', 'Copos', 'Outro'], category: 'logistics' },
  { id: 'st1', question: 'Qual é o estilo principal do serviço?', type: 'multi-select', options: ['Clássico', 'Rústico', 'Moderno', 'Minimalista', 'Boho', 'Vintage', 'Romântico', 'Luxo'], category: 'style' },
  { id: 'st2', question: 'É possível ver trabalhos anteriores?', type: 'boolean', category: 'style' },
  { id: 'st3', question: 'Oferece serviços em diferentes idiomas?', type: 'multi-select', options: ['Português', 'Inglês', 'Espanhol', 'Francês', 'Outro'], category: 'style' },
  { id: 'st4', question: 'Pode criar um design exclusivo?', type: 'boolean', category: 'style' },
];

const getCategoryLabel = (category) => {
  const labels = { services: 'Serviços', pricing: 'Preços', availability: 'Disponibilidade', logistics: 'Logística', style: 'Estilo' };
  return labels[category] || category;
};

const getPriceRangeColor = (range) => {
  const colors = { budget: 'bg-green-100 text-green-700', moderate: 'bg-yellow-100 text-yellow-700', premium: 'bg-orange-100 text-orange-700', luxury: 'bg-purple-100 text-purple-700' };
  return colors[range] || 'bg-gray-100 text-gray-700';
};

const getPriceRangeLabel = (range) => {
  const labels = { budget: 'Económico', moderate: 'Moderado', premium: 'Premium', luxury: 'Luxo' };
  return labels[range] || range;
};

const TABS = ['Informação', 'FAQs', 'Avaliações', 'Galeria'];

const VendorProfilePage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [activeTab, setActiveTab] = useState('Informação');

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ eventDate: '', guestCount: 50, message: '' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const response = await getVendor(vendorId);
        if (response.data) {
          setVendor(response.data);
        } else {
          setError('Fornecedor não encontrado');
        }
      } catch (err) {
        console.error('Error fetching vendor:', err);
        setError('Erro ao carregar fornecedor');
      } finally {
        setLoading(false);
      }
    };
    if (vendorId) fetchVendor();
  }, [vendorId]);

  const getAllImages = () => {
    if (!vendor) return [];
    const images = [...(vendor.images || [])];
    if (vendor.galleries && vendor.galleries.length > 0) {
      vendor.galleries.forEach(gallery => {
        if (gallery.photos && gallery.photos.length > 0) {
          gallery.photos.forEach(photo => { if (photo.url) images.push(photo.url); });
        }
      });
    }
    return images;
  };

  const allImages = getAllImages();

  const getImageUrl = (imagePath) => {

    if(!imagePath) return getAllImages()[0]
    if (!imagePath) return 'https://www.acadiate.com/images/Placeholder.png';
    if (imagePath.includes('https')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const openLightbox = (index) => { setLightboxIndex(index); setShowLightbox(true); };
  const closeLightbox = () => setShowLightbox(false);
  const nextLightboxSlide = () => setLightboxIndex((prev) => (prev + 1) % allImages.length);
  const prevLightboxSlide = () => setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  const handleRequestQuote = () => {
    if (!user) { toast.error('Precisa fazer login para pedir orçamento'); return; }
    setShowQuoteModal(true);
  };

  const submitQuote = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingQuote(true);
      await requestVendorQuote(vendor._id, quoteForm);
      toast.success('Pedido de orçamento enviado com sucesso!');
      setShowQuoteModal(false);
      setQuoteForm({ eventDate: '', guestCount: 50, message: '' });
    } catch (error) {
      console.error('Error requesting quote:', error);
      toast.error('Erro ao enviar pedido de orçamento');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleAddReview = () => {
    if (!user) { toast.error('Precisa fazer login para avaliar'); return; }
    setShowReviewModal(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingReview(true);
      await addVendorReview(vendor._id, reviewForm);
      toast.success('Avaliação adicionada com sucesso!');
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
      const response = await getVendor(vendor._id);
      setVendor(response.data);
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error(error.response?.data?.message || 'Erro ao adicionar avaliação');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9CAA8E]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{error || 'Fornecedor não encontrado'}</h2>
          <button onClick={() => navigate('/vendors')} className="flex items-center gap-2 px-6 py-3 bg-[#9CAA8E] text-white rounded-xl hover:bg-[#8A9A7E] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Fornecedores
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const tabReviewCount = vendor.reviews?.length || 0;
  const tabGalleryCount = allImages.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-4 md:py-8">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Back Button - Hidden on mobile, visible on desktop */}
          <button
            onClick={() => navigate('/vendors')}
            className="hidden md:flex items-center gap-2 text-gray-500 hover:text-[#9CAA8E] mb-5 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Fornecedores
          </button>

          {/* Mobile Back Button - Only visible on mobile */}
          <button
            onClick={() => navigate('/vendors')}
            className="md:hidden flex items-center gap-1 text-gray-500 mb-3 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </button>

          {/* ── HERO: Responsive Layout ── */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-0">
            {/* Left: image grid - Mobile optimized */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-2 gap-1 md:gap-2 h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg md:rounded-2xl overflow-hidden">
                {/* Main large image */}
                <div
                  className="relative row-span-2 cursor-pointer group"
                  onClick={() => openLightbox(0)}
                >
                  <img
                    src={getImageUrl(allImages[0])}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-l-lg md:rounded-l-2xl" />
                </div>

                {/* Top-right image */}
                <div
                  className="relative cursor-pointer group overflow-hidden"
                  onClick={() => openLightbox(1)}
                >
                  <img
                    src={getImageUrl(allImages[1] || allImages[0])}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                </div>

                {/* Bottom-right image with "Ver Fotos" overlay */}
                <div
                  className="relative cursor-pointer group overflow-hidden rounded-br-lg md:rounded-br-2xl"
                  onClick={() => openLightbox(2)}
                >
                  <img
                    src={getImageUrl(allImages[2] || allImages[0])}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                  {/* "Ver Fotos" badge - Mobile optimized */}
                  {allImages.length > 3 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveTab('Galeria'); }}
                      className="absolute bottom-2 right-2 md:bottom-3 md:right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 md:px-3 md:py-1.5 rounded-lg shadow-lg hover:bg-white transition-colors"
                    >
                      <Images className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span className="hidden xs:inline md:inline">Ver Fotos</span>
                      <span className="xs:hidden md:hidden">{allImages.length}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: sidebar card - Mobile optimized (sticky info bar) */}
            <div className="w-full md:w-72 flex-shrink-0">
              {/* Mobile Sticky Info Bar - Fixed at bottom on mobile */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 shadow-lg">
                <div className="flex items-center justify-between max-w-md mx-auto">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Preço desde</p>
                    <p className="text-base font-bold text-gray-900">
                      {vendor.startingPrice
                        ? `${vendor.startingPrice.toLocaleString('pt-MZ')} MT`
                        : 'Sob consulta'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddReview}
                      className="p-2.5 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-primary-300"
                    >
                      <Star className="w-5 h-5" />
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRequestQuote}
                      className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      Orçamento
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Desktop sidebar card - unchanged */}
              <div className="hidden md:block bg-white rounded-2xl shadow-md border border-gray-100 p-5 h-full flex-col">
                {/* Vendor name + rating */}
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-lg">{vendor.category?.icon}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{vendor.category?.name}</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight mb-2">{vendor.name}</h1>

                  {/* Stars + count */}
                  <div className="flex items-center gap-1.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(vendor.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                    ))}
                    <span className="text-sm font-semibold text-gray-800">{vendor.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-sm text-gray-400">· {vendor.totalReviews} opiniões</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-[#9CAA8E]" />
                    <span>{vendor.city}, {vendor.region}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-3" />

                {/* Price */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-0.5">Preço desde</p>
                  <p className="text-xl font-bold text-gray-900">
                    {vendor.startingPrice
                      ? `${vendor.startingPrice.toLocaleString('pt-MZ')} MT`
                      : 'Sob consulta'}
                  </p>
                  {vendor.priceDescription && (
                    <p className="text-xs text-gray-400 mt-0.5">{vendor.priceDescription}</p>
                  )}
                  {(vendor.priceRange && false) && (
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${getPriceRangeColor(vendor.priceRange)}`}>
                      {getPriceRangeLabel(vendor.priceRange)}
                    </span>
                  )}
                  {vendor.maxCapacity && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                      <Users className="w-3.5 h-3.5" />
                      <span>Máx. {vendor.maxCapacity} convidados</span>
                    </div>
                  )}
                </div>

                {/* Response time hint */}
                <div className="flex items-center gap-1.5 text-xs text-[#9CAA8E] mb-3">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Responde rapidamente</span>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col gap-2 mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRequestQuote}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Pedir Orçamento Grátis
                  </motion.button>

                  <div className="flex gap-2">
                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:border-primary-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 text-sm"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddReview}
                      className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:border-primary-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 text-sm"
                    >
                      <Star className="w-4 h-4" />
                      Avaliar
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Vendor Info Card - Only visible on mobile */}
          <div className="md:hidden bg-white rounded-xl p-4 mt-3 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{vendor.category?.icon}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{vendor.category?.name}</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{vendor.name}</h1>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{vendor.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4 text-[#9CAA8E]" />
              <span>{vendor.city}, {vendor.region}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{vendor.totalReviews} opiniões</span>
            </div>

            <div className="flex items-center gap-2">
              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone}`}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:border-primary-300 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Ligar</span>
                </a>
              )}
              {vendor.email && (
                <a
                  href={`mailto:${vendor.email}`}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:border-primary-300 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>

          {/* ── TAB NAV - Mobile optimized with horizontal scroll ── */}
          <div className="bg-white border-b border-gray-200 mt-4 rounded-t-xl overflow-x-auto hide-scrollbar">
            <div className="flex gap-0 px-2 min-w-max md:min-w-0">
              {TABS.map((tab) => {
                let label = tab;
                if (tab === 'Avaliações' && tabReviewCount > 0) label = `Avaliações (${tabReviewCount})`;
                if (tab === 'Galeria' && tabGalleryCount > 0) label = `Galeria (${tabGalleryCount})`;
                if (tab === 'FAQs' && vendor.faqs?.length > 0) label = `FAQs (${vendor.faqs.length})`;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 md:px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-[#9CAA8E] text-[#9CAA8E]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── TAB CONTENT - Mobile optimized with proper spacing ── */}
          <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 border-t-0 p-4 md:p-6 mb-16 md:mb-0">
            {/* Informação tab */}
            {activeTab === 'Informação' && (
              <div className="max-w-2xl">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Sobre</h2>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6">{vendor.description}</p>

                {/* Contact Info - Mobile optimized */}
                <h3 className="text-sm font-medium text-gray-500 mb-3">Contactos</h3>
                <div className="space-y-2">
                  {vendor.email && (
                    <a href={`mailto:${vendor.email}`} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-primary-600 transition-all group">
                      <Mail className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
                      <span className="text-sm truncate">{vendor.email}</span>
                    </a>
                  )}
                  {vendor.phone && (
                    <a href={`tel:${vendor.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-primary-600 transition-all group">
                      <Phone className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
                      <span className="text-sm">{vendor.phone}</span>
                    </a>
                  )}
                  {vendor.website && (
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-primary-600 transition-all group">
                      <Globe className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
                      <span className="text-sm truncate">Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* FAQs tab */}
            {activeTab === 'FAQs' && (
              <div className="max-w-2xl">
                {vendor.faqs && vendor.faqs.length > 0 ? (
                  <>
                    {['services', 'pricing', 'availability', 'logistics', 'style'].map(category => {
                      const categoryFaqs = vendor.faqs.filter(faq => {
                        const question = FAQ_QUESTIONS.find(q => q.id === faq.questionId);
                        return question && question.category === category && faq.answer !== undefined && faq.answer !== null && faq.answer !== '' &&
                          (Array.isArray(faq.answer) ? faq.answer.length > 0 : true);
                      });
                      if (categoryFaqs.length === 0) return null;
                      const displayedFaqs = showAllFaqs ? categoryFaqs : categoryFaqs.slice(0, 3);
                      const hasMoreFaqs = !showAllFaqs && categoryFaqs.length > 3;
                      return (
                        <div key={category} className="mb-5">
                          <h4 className="text-xs font-semibold text-[#9CAA8E] mb-2 uppercase tracking-widest">{getCategoryLabel(category)}</h4>
                          <div className="space-y-3">
                            {displayedFaqs.map((faq, idx) => {
                              const question = FAQ_QUESTIONS.find(q => q.id === faq.questionId);
                              if (!question) return null;
                              return (
                                <div key={idx} className="bg-gray-50 rounded-xl p-3 md:p-4">
                                  <p className="text-xs md:text-sm font-medium text-gray-800 mb-1.5">{question.question}</p>
                                  {question.type === 'text' && <p className="text-xs md:text-sm text-gray-600">{faq.answer}</p>}
                                  {question.type === 'boolean' && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${faq.answer === true ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                      {faq.answer === true ? <><CheckCircle className="w-3 h-3" /> Sim</> : 'Não'}
                                    </span>
                                  )}
                                  {question.type === 'multi-select' && Array.isArray(faq.answer) && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {faq.answer.map((option, optIdx) => (
                                        <span key={optIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-[#9CAA8E]/10 text-[#9CAA8E] rounded-full text-xs">
                                          <CheckCircle className="w-3 h-3" />{option}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {hasMoreFaqs && (
                              <button onClick={() => setShowAllFaqs(true)} className="text-xs md:text-sm text-[#9CAA8E] hover:text-[#8A9A7E] font-medium">
                                Ver mais ({categoryFaqs.length - 3} restantes)
                              </button>
                            )}
                            {showAllFaqs && categoryFaqs.length > 3 && (
                              <button onClick={() => setShowAllFaqs(false)} className="text-xs md:text-sm text-gray-500 hover:text-gray-700 font-medium">
                                Ver menos
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">Nenhuma pergunta frequente disponível.</p>
                )}
              </div>
            )}

            {/* Avaliações tab */}
            {activeTab === 'Avaliações' && (
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">Avaliações</h2>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddReview}
                    className="flex items-center gap-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-xs md:text-sm font-medium text-gray-700 hover:border-primary-300"
                  >
                    <Star className="w-4 h-4" />
                    <span className="hidden xs:inline">Avaliar</span>
                  </motion.button>
                </div>
                {vendor.reviews && vendor.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {vendor.reviews.map((review, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="bg-gray-50 rounded-xl p-3 md:p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 md:w-3.5 md:h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-xs md:text-sm text-gray-600">{review.comment}</p>}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Ainda sem avaliações.</p>
                )}
              </div>
            )}

            {/* Galeria tab */}
            {activeTab === 'Galeria' && (
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Galeria ({allImages.length} fotos)</h2>
                {allImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 md:gap-2">
                    {allImages.map((image, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() => openLightbox(idx)}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${vendor.name} - ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-5 h-5 md:w-7 md:h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <ZoomIn className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-gray-700" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Sem fotos disponíveis.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox - Mobile optimized */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-2 right-2 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
            {allImages.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevLightboxSlide(); }} 
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextLightboxSlide(); }} 
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
              </>
            )}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={getImageUrl(allImages[lightboxIndex])}
              alt={`${vendor.name} - ${lightboxIndex + 1}`}
              className="max-w-[95vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 md:px-4 md:py-2 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs md:text-sm">
              {lightboxIndex + 1} / {allImages.length}
            </div>
            {allImages.length > 1 && (
              <div className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2 max-w-[90vw] overflow-x-auto px-2 md:px-4 hide-scrollbar">
                {allImages.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      idx === lightboxIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(image)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Request Modal - Mobile optimized */}
      <AnimatePresence>
        {showQuoteModal && vendor && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.5 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowQuoteModal(false)} 
              className="fixed inset-0 bg-black z-50" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              transition={{ type: 'spring', duration: 0.5 }} 
              className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            >
              <div className="bg-white rounded-t-3xl md:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">Pedir Orçamento</h2>
                  <button onClick={() => setShowQuoteModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <form onSubmit={submitQuote} className="p-4 md:p-6 space-y-4 md:space-y-5">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{vendor.category?.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Para</p>
                      <p className="font-medium text-gray-900 truncate">{vendor.name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Data do evento</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="date" 
                        required 
                        value={quoteForm.eventDate} 
                        onChange={(e) => setQuoteForm({ ...quoteForm, eventDate: e.target.value })} 
                        className="w-full pl-10 pr-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Número de convidados</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="number" 
                        min="1" 
                        value={quoteForm.guestCount} 
                        onChange={(e) => setQuoteForm({ ...quoteForm, guestCount: parseInt(e.target.value) || 0 })} 
                        className="w-full pl-10 pr-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                    <textarea 
                      rows={4} 
                      value={quoteForm.message} 
                      onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })} 
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 text-sm"
                      placeholder="Descreva o que precisa..." 
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowQuoteModal(false)} 
                      disabled={isSubmittingQuote} 
                      className="flex-1 px-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-all text-sm"
                    >
                      Cancelar
                    </button>
                    <motion.button 
                      whileTap={{ scale: 0.98 }} 
                      type="submit" 
                      disabled={isSubmittingQuote} 
                      className="flex-1 px-4 py-2.5 md:py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-md text-sm"
                    >
                      {isSubmittingQuote ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : <><Send className="w-4 h-4" />Enviar</>}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Review Modal - Mobile optimized */}
      <AnimatePresence>
        {showReviewModal && vendor && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.5 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowReviewModal(false)} 
              className="fixed inset-0 bg-black z-50" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              transition={{ type: 'spring', duration: 0.5 }} 
              className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            >
              <div className="bg-white rounded-t-3xl md:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">Avaliar Fornecedor</h2>
                  <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <form onSubmit={submitReview} className="p-4 md:p-6 space-y-4 md:space-y-5">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{vendor.category?.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Para</p>
                      <p className="font-medium text-gray-900 truncate">{vendor.name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-3">Avaliação</label>
                    <div className="flex items-center justify-center gap-1 md:gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button 
                          key={star} 
                          type="button" 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })} 
                          className="p-1 focus:outline-none"
                        >
                          <Star className={`w-8 h-8 md:w-10 md:h-10 transition-all ${
                            star <= reviewForm.rating 
                              ? 'text-yellow-400 fill-yellow-400 filter drop-shadow-lg' 
                              : 'text-gray-300 hover:text-gray-400'
                          }`} />
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-center text-xs md:text-sm text-gray-500 mt-2">
                      {reviewForm.rating === 5 && 'Excelente!'}
                      {reviewForm.rating === 4 && 'Muito bom'}
                      {reviewForm.rating === 3 && 'Bom'}
                      {reviewForm.rating === 2 && 'Regular'}
                      {reviewForm.rating === 1 && 'Ruim'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Comentário</label>
                    <textarea 
                      rows={4} 
                      value={reviewForm.comment} 
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} 
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 text-sm"
                      placeholder="Partilhe a sua experiência..." 
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowReviewModal(false)} 
                      disabled={isSubmittingReview} 
                      className="flex-1 px-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-all text-sm"
                    >
                      Cancelar
                    </button>
                    <motion.button 
                      whileTap={{ scale: 0.98 }} 
                      type="submit" 
                      disabled={isSubmittingReview} 
                      className="flex-1 px-4 py-2.5 md:py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-md text-sm"
                    >
                      {isSubmittingReview ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : <><MessageCircle className="w-4 h-4" />Avaliar</>}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add CSS for hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
          .xs\\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default VendorProfilePage;