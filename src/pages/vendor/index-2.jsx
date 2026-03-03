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
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL, getVendor, requestVendorQuote, addVendorReview } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// FAQ predefined questions configuration (must match profile/index.jsx)
const FAQ_QUESTIONS = [
  // Services category
  { id: 's1', question: 'Quais serviços estão incluídos no pacote?', type: 'text', _allowCustom: true, options: ['Fotografia', 'Vídeo', 'Decoração', 'Música', 'Iluminação', 'Buffet', 'Bolo', 'Convites', 'Flores', 'Outro'], category: 'services' },
  { id: 's2', question: 'Quantas horas de serviço estão incluídas?', type: 'text', category: 'services', placeholder: 'Ex: 8 horas, dia inteiro, etc.' },
  { id: 's3', question: 'É possível contratar serviços adicionais?', type: 'boolean', category: 'services' },
  { id: 's4', question: 'Quais são as opções de personalização disponíveis?', type: 'multi-select', options: ['Cores', 'Tema', 'Decoração', 'Música', 'Menu', 'Outro'], category: 'services' },
  
  // Pricing category
  { id: 'p1', question: 'Qual é o custo por convidado adicional?', type: 'text', category: 'pricing', placeholder: 'Ex: 250 MT por convidado' },
  { id: 'p2', question: 'Quais formas de pagamento são aceites?', type: 'multi-select', options: ['Dinheiro', 'Transferência bancária', 'Multicaixa', 'PayPal', 'Cartão de crédito', 'Parcelamento'], category: 'pricing' },
  { id: 'p3', question: 'É necessário pagar uma caução?', type: 'boolean', category: 'pricing' },
  { id: 'p4', question: 'Qual é a política de reembolso?', type: 'text', category: 'pricing', placeholder: 'Ex: Reembolso total até 30 dias antes' },
  
  // Availability category
  { id: 'a2', question: 'Com antecedência preciso contratar?', type: 'text', category: 'availability', placeholder: 'Ex: Com pelo menos 2 meses de antecedência' },
  { id: 'a3', question: 'Trabalha em quais dias da semana?', type: 'multi-select', options: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo', 'Feriados'], category: 'availability' },
  { id: 'a4', question: 'Aceita eventos em diferentes locais?', type: 'boolean', category: 'availability' },
  
  // Logistics category
  { id: 'l1', question: 'Inclui transporte e logística?', type: 'boolean', category: 'logistics' },
  { id: 'l2', question: 'Qual é o raio de atuação?', type: 'text', category: 'logistics', placeholder: 'Ex: Até 50km de Maputo' },
  { id: 'l3', question: 'Há custos adicionais para deslocação?', type: 'text', category: 'logistics', placeholder: 'Ex: 5 MT por km acima de 20km' },
  { id: 'l4', question: 'Quais equipamentos são fornecidos?', type: 'multi-select', options: ['Som', 'Iluminação', 'Projétor', 'Decoração', 'Mobiliário', 'Pratos e talheres', 'Copos', 'Outro'], category: 'logistics' },
  
  // Style category
  { id: 'st1', question: 'Qual é o estilo principal do serviço?', type: 'multi-select', options: ['Clássico', 'Rústico', 'Moderno', 'Minimalista', 'Boho', 'Vintage', 'Romântico', 'Luxo'], category: 'style' },
  { id: 'st2', question: 'É possível ver trabalhos anteriores?', type: 'boolean', category: 'style' },
  { id: 'st3', question: 'Oferece serviços em diferentes idiomas?', type: 'multi-select', options: ['Português', 'Inglês', 'Espanhol', 'Francês', 'Outro'], category: 'style' },
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

// Price range helpers
const getPriceRangeColor = (range) => {
  const colors = {
    budget: 'bg-green-100 text-green-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    premium: 'bg-orange-100 text-orange-700',
    luxury: 'bg-purple-100 text-purple-700',
  };
  return colors[range] || 'bg-gray-100 text-gray-700';
};

const getPriceRangeLabel = (range) => {
  const labels = {
    budget: 'Económico',
    moderate: 'Moderado',
    premium: 'Premium',
    luxury: 'Luxo',
  };
  return labels[range] || range;
};

const VendorProfilePage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  
  // Quote and Review modal states
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    eventDate: '',
    guestCount: 50,
    message: '',
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
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

    if (vendorId) {
      fetchVendor();
    }
  }, [vendorId]);

  // Get all images: vendor images + gallery images from albums
  const getAllImages = () => {
    if (!vendor) return [];
    const images = [...(vendor.images || [])];
    
    // Add gallery album photos
    if (vendor.galleries && vendor.galleries.length > 0) {
      vendor.galleries.forEach(gallery => {
        if (gallery.photos && gallery.photos.length > 0) {
          gallery.photos.forEach(photo => {
            if (photo.url) {
              images.push(photo.url);
            }
          });
        }
      });
    }
    
    return images;
  };

  const allImages = getAllImages();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://www.acadiate.com/images/Placeholder.png';
    if (imagePath.includes('https')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const nextSlide = () => {
    if (allImages.length > 1) {
      setCurrentSlide((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevSlide = () => {
    if (allImages.length > 1) {
      setCurrentSlide((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  // Lightbox functions
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  const nextLightboxSlide = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevLightboxSlide = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleRequestQuote = () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Precisa fazer login para pedir orçamento');
      return;
    }
    
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
    // Check if user is logged in
    if (!user) {
      toast.error('Precisa fazer login para avaliar');
      return;
    }
    
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
      // Refresh vendor data
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
      <div className="min-h-screen flex flex-col">
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {error || 'Fornecedor não encontrado'}
          </h2>
          <button
            onClick={() => navigate('/vendors')}
            className="flex items-center gap-2 px-6 py-3 bg-[#9CAA8E] text-white rounded-xl hover:bg-[#8A9A7E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Fornecedores
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/vendors')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#9CAA8E] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Fornecedores
          </button>

          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Cover Image Slideshow */}
            <div className="relative h-72 sm:h-80 lg:h-96 mb-6">
              {allImages.length > 0 ? (
                <>
                  <motion.img 
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={getImageUrl(allImages[currentSlide])}
                    alt={`${vendor.name} - ${currentSlide + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button 
                        onClick={prevSlide}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-all shadow-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={nextSlide}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-all shadow-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      {/* Slide Indicators */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`transition-all duration-300 ${
                              idx === currentSlide 
                                ? 'w-6 h-1.5 bg-white rounded-full' 
                                : 'w-1.5 h-1.5 bg-white/60 rounded-full hover:bg-white'
                            }`}
                          />
                        ))}
                      </div>
                      {/* Image Counter */}
                      <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                        {currentSlide + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <img 
                  src="https://www.acadiate.com/images/Placeholder.png"
                  alt={vendor.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div className="px-6 pb-6">
              {/* Header Info */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{vendor.category?.icon}</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {vendor.category?.name}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {vendor.name}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{vendor.city}, {vendor.region}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-xl">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-yellow-700">{vendor.averageRating?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-yellow-600">({vendor.totalReviews})</span>
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Sobre</h3>
                <p className="text-gray-700 leading-relaxed">{vendor.description}</p>
              </div>
              
              {/* Price */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-5 mb-6">
                <p className="text-sm text-gray-600 mb-1">Preço</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendor.startingPrice 
                    ? `A partir de ${vendor.startingPrice.toLocaleString('pt-MZ')} MT` 
                    : 'Contactar para orçamento'}
                </p>
                {vendor.priceDescription && (
                  <p className="text-sm text-gray-500 mt-1">{vendor.priceDescription}</p>
                )}
                {vendor.priceRange && (
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getPriceRangeColor(vendor.priceRange)}`}>
                    {getPriceRangeLabel(vendor.priceRange)}
                  </span>
                )}
                {vendor.maxCapacity && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Capacidade máxima: <span className="font-medium">{vendor.maxCapacity} convidados</span></span>
                  </div>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Contactos</h3>
                <div className="space-y-2">
                  {vendor.email && (
                    <a href={`mailto:${vendor.email}`} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-primary-600 transition-all group">
                      <Mail className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                      <span className="text-sm">{vendor.email}</span>
                    </a>
                  )}
                  {vendor.phone && (
                    <a href={`tel:${vendor.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-primary-600 transition-all group">
                      <Phone className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                      <span className="text-sm">{vendor.phone}</span>
                    </a>
                  )}
                  {vendor.website && (
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-primary-600 transition-all group">
                      <Globe className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                      <span className="text-sm">Website</span>
                    </a>
                  )}
                </div>
              </div>
              
              {/* FAQ Section - Public Display */}
              {vendor.faqs && vendor.faqs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Perguntas Frequentes
                  </h3>
                  
                  {/* Group FAQs by category */}
                  {['services', 'pricing', 'availability', 'logistics', 'style'].map(category => {
                    const categoryFaqs = vendor.faqs.filter(faq => {
                      const question = FAQ_QUESTIONS.find(q => q.id === faq.questionId);
                      return question && question.category === category && faq.answer !== undefined && faq.answer !== null && faq.answer !== '' && 
                        (Array.isArray(faq.answer) ? faq.answer.length > 0 : true);
                    });
                    
                    if (categoryFaqs.length === 0) return null;
                    
                    // Limit to first 3 FAQs unless showAllFaqs is true
                    const displayedFaqs = showAllFaqs ? categoryFaqs : categoryFaqs.slice(0, 3);
                    const hasMoreFaqs = !showAllFaqs && categoryFaqs.length > 3;
                    
                    return (
                      <div key={category} className="mb-4">
                        <h4 className="text-xs font-medium text-[#9CAA8E] mb-2 uppercase tracking-wide">
                          {getCategoryLabel(category)}
                        </h4>
                        <div className="space-y-3">
                          {displayedFaqs.map((faq, idx) => {
                            const question = FAQ_QUESTIONS.find(q => q.id === faq.questionId);
                            if (!question) return null;
                            
                            return (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-gray-800 mb-1">{question.question}</p>
                                
                                {/* Render answer based on type */}
                                {question.type === 'text' && (
                                  <p className="text-sm text-gray-600">{faq.answer}</p>
                                )}
                                
                                {question.type === 'boolean' && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    faq.answer === true 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {faq.answer === true ? (
                                      <><CheckCircle className="w-3 h-3" /> Sim</>
                                    ) : (
                                      'Não'
                                    )}
                                  </span>
                                )}
                                
                                {question.type === 'multi-select' && Array.isArray(faq.answer) && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {faq.answer.map((option, optIdx) => (
                                      <span 
                                        key={optIdx} 
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#9CAA8E]/10 text-[#9CAA8E] rounded-full text-xs"
                                      >
                                        <CheckCircle className="w-3 h-3" />
                                        {option}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          
                          {/* Ver mais button */}
                          {hasMoreFaqs && (
                            <button
                              onClick={() => setShowAllFaqs(true)}
                              className="text-sm text-[#9CAA8E] hover:text-[#8A9A7E] font-medium flex items-center gap-1"
                            >
                              Ver mais ({categoryFaqs.length - 3} restantes)
                            </button>
                          )}
                          
                          {/* Ver menos button when showing all */}
                          {showAllFaqs && categoryFaqs.length > 3 && (
                            <button
                              onClick={() => setShowAllFaqs(false)}
                              className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
                            >
                              Ver menos
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Reviews */}
              {vendor.reviews && vendor.reviews.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Avaliações</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {vendor.reviews.map((review, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-50 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Gallery Section - All Images */}
              {allImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    Galeria ({allImages.length} fotos)
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {allImages.map((image, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() => openLightbox(idx)}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${vendor.name} - ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <ZoomIn className="w-4 h-4 text-gray-700" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRequestQuote}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Pedir Orçamento
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddReview}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:border-primary-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Avaliar
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Navigation */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevLightboxSlide(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextLightboxSlide(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={getImageUrl(allImages[lightboxIndex])}
              alt={`${vendor.name} - ${lightboxIndex + 1}`}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm text-white rounded-full">
              {lightboxIndex + 1} / {allImages.length}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
                {allImages.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      idx === lightboxIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Request Modal */}
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Pedir Orçamento</h2>
                  <button 
                    onClick={() => setShowQuoteModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <form onSubmit={submitQuote} className="p-6 space-y-5">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">{vendor.category?.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Para</p>
                      <p className="font-medium text-gray-900">{vendor.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data do evento</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="date"
                        required
                        value={quoteForm.eventDate}
                        onChange={(e) => setQuoteForm({ ...quoteForm, eventDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de convidados</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="number"
                        min="1"
                        value={quoteForm.guestCount}
                        onChange={(e) => setQuoteForm({ ...quoteForm, guestCount: parseInt(e.target.value) || 0 })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                    <textarea 
                      rows={4}
                      value={quoteForm.message}
                      onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900"
                      placeholder="Descreva o que precisa..."
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowQuoteModal(false)}
                      disabled={isSubmittingQuote}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
                    >
                      Cancelar
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmittingQuote}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      {isSubmittingQuote ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Review Modal */}
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Avaliar Fornecedor</h2>
                  <button 
                    onClick={() => setShowReviewModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <form onSubmit={submitReview} className="p-6 space-y-5">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">{vendor.category?.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Para</p>
                      <p className="font-medium text-gray-900">{vendor.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Avaliação</label>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="p-1 focus:outline-none"
                        >
                          <Star 
                            className={`w-10 h-10 transition-all ${
                              star <= reviewForm.rating 
                                ? 'text-yellow-400 fill-yellow-400 filter drop-shadow-lg' 
                                : 'text-gray-300 hover:text-gray-400'
                            }`} 
                          />
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      {reviewForm.rating === 5 && 'Excelente!'}
                      {reviewForm.rating === 4 && 'Muito bom'}
                      {reviewForm.rating === 3 && 'Bom'}
                      {reviewForm.rating === 2 && 'Regular'}
                      {reviewForm.rating === 1 && 'Ruim'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comentário</label>
                    <textarea 
                      rows={4}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900"
                      placeholder="Partilhe a sua experiência..."
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      disabled={isSubmittingReview}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
                    >
                      Cancelar
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmittingReview}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          Avaliar
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorProfilePage;
