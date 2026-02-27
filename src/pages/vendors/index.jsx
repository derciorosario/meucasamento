import React, { useState, useEffect } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { Heart, Star, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Globe, Send, X, User, Check, Loader2 } from 'lucide-react';
import {
  getVendorCategories,
  getVendors,
  getVendor,
  getVendorLocations,
  requestVendorQuote,
  addVendorReview,
  seedVendorData,
} from '../../api/client';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../api/client';

const VendorsPage = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState({ cities: [], regions: [] });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  // Multi-select filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  
  const [filters, setFilters] = useState({
    search: '',
    sort: 'rating',
  });
  
  // Dropdown visibility states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [vendorSlides, setVendorSlides] = useState({});
  
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
    loadInitialData();
  }, []);

  useEffect(() => {
    loadVendors();
  }, [filters, selectedCategories, selectedCities, selectedPriceRanges]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.multi-select')) {
        setShowCategoryDropdown(false);
        setShowCityDropdown(false);
        setShowPriceDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadInitialData = async () => {
    try {
      // Try to seed vendor data first (for development)
      try {
        await seedVendorData();
      } catch (e) {
        // Ignore if already seeded
      }
      
      const [categoriesRes, locationsRes] = await Promise.all([
        getVendorCategories(),
        getVendorLocations(),
      ]);
      
      setCategories(categoriesRes.data);
      setLocations(locationsRes.data);
      await loadVendors();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page || 1,
        limit: 12,
        sort: filters.sort,
      };
      
      // Handle multi-select filters
      if (selectedCategories.length > 0) params.categories = selectedCategories.join(',');
      if (selectedCities.length > 0) params.cities = selectedCities.join(',');
      if (selectedPriceRanges.length > 0) params.priceRanges = selectedPriceRanges.join(',');
      if (filters.search) params.search = filters.search;
      
      const response = await getVendors(params);
      setVendors(response.data.vendors);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast.error('Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
    }
  };

  // Multi-select toggle functions
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    setFilters({ ...filters, page: 1 });
  };

  const toggleCity = (city) => {
    setSelectedCities(prev => 
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
    setFilters({ ...filters, page: 1 });
  };

  const togglePriceRange = (range) => {
    setSelectedPriceRanges(prev => 
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
    setFilters({ ...filters, page: 1 });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCities([]);
    setSelectedPriceRanges([]);
    setFilters({
      search: '',
      sort: 'rating',
      page: 1,
    });
  };

  const handleViewProfile = async (vendor) => {
    try {
      const response = await getVendor(vendor._id);
      setSelectedVendor(response.data);
      setCurrentSlide(0);
      setShowProfile(true);
    } catch (error) {
      console.error('Error loading vendor:', error);
      toast.error('Erro ao carregar fornecedor');
    }
  };

  const nextSlide = () => {
    if (selectedVendor?.images?.length > 1) {
      setCurrentSlide((prev) => (prev + 1) % selectedVendor.images.length);
    }
  };

  const prevSlide = () => {
    if (selectedVendor?.images?.length > 1) {
      setCurrentSlide((prev) => (prev - 1 + selectedVendor.images.length) % selectedVendor.images.length);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://www.acadiate.com/images/Placeholder.png';
    if (imagePath.includes('https')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const nextVendorSlide = (vendorId, imagesLength) => {
    setVendorSlides(prev => ({
      ...prev,
      [vendorId]: ((prev[vendorId] || 0) + 1) % imagesLength
    }));
  };

  const prevVendorSlide = (vendorId, imagesLength) => {
    setVendorSlides(prev => ({
      ...prev,
      [vendorId]: ((prev[vendorId] || 0) - 1 + imagesLength) % imagesLength
    }));
  };

  const handleRequestQuote = (vendor) => {
    setSelectedVendor(vendor);
    setShowQuoteModal(true);
  };

  const submitQuote = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingQuote(true);
      await requestVendorQuote(selectedVendor._id, quoteForm);
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

  const handleAddReview = (vendor) => {
    setSelectedVendor(vendor);
    setShowReviewModal(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingReview(true);
      await addVendorReview(selectedVendor._id, reviewForm);
      toast.success('Avaliação adicionada com sucesso!');
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
      // Refresh vendor data
      const response = await getVendor(selectedVendor._id);
      setSelectedVendor(response.data);
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error(error.response?.data?.message || 'Erro ao adicionar avaliação');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  if (loading && vendors.length === 0) {
    return (
      <DefaultLayout hero={{ title: "Fornecedores", subtitle: "Encontre e gerencie todos os fornecedores para o seu casamento" }}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout hero={{ title: "Fornecedores", subtitle: "Encontre e gerencie todos os fornecedores para o seu casamento" }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Category Multi-Select */}
            <div className="relative multi-select">
              <label className="block text-sm text-gray-600 mb-2">Categoria</label>
              <div 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer flex items-center justify-between text-gray-900"
                onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowCityDropdown(false); setShowPriceDropdown(false); }}
              >
                <span className={selectedCategories.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedCategories.length === 0 
                    ? 'Todas as categorias' 
                    : `${selectedCategories.length} selecionada(s)`}
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-90' : ''}`} />
              </div>
              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {selectedCategories.length > 0 && (
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                      <button
                        onClick={() => { setSelectedCategories([]); setFilters({ ...filters, page: 1 }); }}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Limpar seleção
                      </button>
                    </div>
                  )}
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className={`px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100 ${selectedCategories.includes(cat._id) ? 'bg-primary-50' : ''}`}
                      onClick={() => toggleCategory(cat._id)}
                    >
                      <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedCategories.includes(cat._id) ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                        {selectedCategories.includes(cat._id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-gray-900">{cat.icon} {cat.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* City Multi-Select */}
            <div className="relative multi-select">
              <label className="block text-sm text-gray-600 mb-2">Localização</label>
              <div 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer flex items-center justify-between text-gray-900"
                onClick={() => { setShowCityDropdown(!showCityDropdown); setShowCategoryDropdown(false); setShowPriceDropdown(false); }}
              >
                <span className={selectedCities.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedCities.length === 0 
                    ? 'Todas as cidades' 
                    : `${selectedCities.length} selecionada(s)`}
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform ${showCityDropdown ? 'rotate-90' : ''}`} />
              </div>
              {showCityDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {selectedCities.length > 0 && (
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                      <button
                        onClick={() => { setSelectedCities([]); setFilters({ ...filters, page: 1 }); }}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Limpar seleção
                      </button>
                    </div>
                  )}
                  {locations.cities.map((city) => (
                    <div
                      key={city}
                      className={`px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100 ${selectedCities.includes(city) ? 'bg-primary-50' : ''}`}
                      onClick={() => toggleCity(city)}
                    >
                      <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedCities.includes(city) ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                        {selectedCities.includes(city) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-gray-900">{city}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Pesquisar</label>
              <input 
                type="text"
                placeholder="Nome do fornecedor..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            
            {/* Price Range Multi-Select */}
            <div className="relative multi-select">
              <label className="block text-sm text-gray-600 mb-2">Orçamento</label>
              <div 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer flex items-center justify-between text-gray-900"
                onClick={() => { setShowPriceDropdown(!showPriceDropdown); setShowCategoryDropdown(false); setShowCityDropdown(false); }}
              >
                <span className={selectedPriceRanges.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedPriceRanges.length === 0 
                    ? 'Qualquer valor' 
                    : `${selectedPriceRanges.length} selecionado(s)`}
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform ${showPriceDropdown ? 'rotate-90' : ''}`} />
              </div>
              {showPriceDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {selectedPriceRanges.length > 0 && (
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                      <button
                        onClick={() => { setSelectedPriceRanges([]); setFilters({ ...filters, page: 1 }); }}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Limpar seleção
                      </button>
                    </div>
                  )}
                  {[
                    { value: 'budget', label: 'Económico' },
                    { value: 'medium', label: 'Médio' },
                    { value: 'high', label: 'Alto' },
                    { value: 'luxury', label: 'Luxo' }
                  ].map((range) => (
                    <div
                      key={range.value}
                      className={`px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100 ${selectedPriceRanges.includes(range.value) ? 'bg-primary-50' : ''}`}
                      onClick={() => togglePriceRange(range.value)}
                    >
                      <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedPriceRanges.includes(range.value) ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                        {selectedPriceRanges.includes(range.value) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-gray-900">{range.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-2">Ordenar por</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
              >
                <option value="rating">Avaliação</option>
                <option value="price_low">Preço (menor)</option>
                <option value="price_high">Preço (maior)</option>
                <option value="name">Nome</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button 
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Limpar filtros
            </button>
            <span className="text-sm text-gray-600">
              {pagination.total} fornecedores encontrados
              {(selectedCategories.length > 0 || selectedCities.length > 0 || selectedPriceRanges.length > 0) && (
                <span className="ml-2 text-primary-500">
                  ({selectedCategories.length + selectedCities.length + selectedPriceRanges.length} filtro(s) ativo(s))
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {vendors.map((vendor) => (
            <div key={vendor._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Image Slideshow */}
              <div className="relative h-48 overflow-hidden">
                {vendor.images && vendor.images.length > 0 ? (
                  <>
                    <img 
                      src={getImageUrl(vendor.images[vendorSlides[vendor._id] || 0])}
                      alt={`${vendor.name} - ${(vendorSlides[vendor._id] || 0) + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {vendor.images.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); prevVendorSlide(vendor._id, vendor.images.length); }}
                          className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-0.5 rounded-full transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); nextVendorSlide(vendor._id, vendor.images.length); }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-0.5 rounded-full transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {vendor.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => { e.stopPropagation(); setVendorSlides(prev => ({ ...prev, [vendor._id]: idx })); }}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                idx === (vendorSlides[vendor._id] || 0) ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="absolute top-1 right-1 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {(vendorSlides[vendor._id] || 0) + 1} / {vendor.images.length}
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
                {vendor.isFeatured && (
                  <span className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                    Destaque
                  </span>
                )}
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-800">{vendor.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-gray-800">{vendor.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-gray-500">({vendor.totalReviews})</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{vendor.category?.icon} {vendor.category?.name}</span>
                  {vendor.city && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {vendor.city}
                      </span>
                    </>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {vendor.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-800 font-medium">
                    {vendor.startingPrice ? `A partir de ${vendor.startingPrice.toLocaleString('pt-MZ')} MT` : 'Contactar para orçamento'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleViewProfile(vendor)}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-sm transition-colors"
                  >
                    Ver Perfil
                  </button>
                  <button 
                    onClick={() => handleRequestQuote(vendor)}
                    className="px-3 py-2 border border-primary-500 text-primary-500 rounded-lg text-sm hover:bg-primary-50 transition-colors"
                    title="Pedir orçamento"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {vendors.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-4">Nenhum fornecedor encontrado.</p>
              <button 
                onClick={clearFilters}
                className="text-primary-500 hover:text-primary-600"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(page => {
                // Show first, last, and around current page
                return page === 1 || page === pagination.pages || 
                  (page >= pagination.page - 2 && page <= pagination.page + 2);
              })
              .map((page, idx, arr) => (
                <React.Fragment key={page}>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  <button 
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium text-sm ${
                      pagination.page === page 
                        ? 'bg-primary-500 text-white' 
                        : 'border border-gray-300 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))
            }
            
            <button 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Vendor Profile Modal */}
      {showProfile && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{selectedVendor.name}</h2>
              <button 
                onClick={() => setShowProfile(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Cover Image Slideshow */}
              <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                {selectedVendor.images && selectedVendor.images.length > 0 ? (
                  <>
                    <img 
                      src={getImageUrl(selectedVendor.images[currentSlide])}
                      alt={`${selectedVendor.name} - ${currentSlide + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Navigation Arrows */}
                    {selectedVendor.images.length > 1 && (
                      <>
                        <button 
                          onClick={prevSlide}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={nextSlide}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        {/* Slide Indicators */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {selectedVendor.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentSlide(idx)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                idx === currentSlide ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                        {/* Image Counter */}
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {currentSlide + 1} / {selectedVendor.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1519167758481-83f29da8c1e8?w=800&h=400&fit=crop"
                    alt={selectedVendor.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Info */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{selectedVendor.category?.icon}</span>
                    <span className="text-gray-600">{selectedVendor.category?.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {selectedVendor.city}, {selectedVendor.region}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-yellow-700">{selectedVendor.averageRating?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-yellow-600">({selectedVendor.totalReviews} avaliações)</span>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-gray-600 mb-6">{selectedVendor.description}</p>
              
              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Preço</p>
                <p className="text-xl font-semibold text-gray-900">
                  {selectedVendor.startingPrice ? `A partir de ${selectedVendor.startingPrice.toLocaleString('pt-MZ')} MT` : 'Contactar para orçamento'}
                </p>
                {selectedVendor.priceDescription && (
                  <p className="text-sm text-gray-500">{selectedVendor.priceDescription}</p>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Contactos</p>
                <div className="space-y-2">
                  {selectedVendor.email && (
                    <a href={`mailto:${selectedVendor.email}`} className="flex items-center gap-2 text-gray-700 hover:text-primary-500">
                      <Mail className="w-4 h-4" />
                      {selectedVendor.email}
                    </a>
                  )}
                  {selectedVendor.phone && (
                    <a href={`tel:${selectedVendor.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-primary-500">
                      <Phone className="w-4 h-4" />
                      {selectedVendor.phone}
                    </a>
                  )}
                  {selectedVendor.website && (
                    <a href={selectedVendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-primary-500">
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>
              
              {/* Reviews */}
              {selectedVendor.reviews && selectedVendor.reviews.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-3">Avaliações</p>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {selectedVendor.reviews.map((review, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowProfile(false);
                    handleRequestQuote(selectedVendor);
                  }}
                  className="flex-1 bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  Pedir Orçamento
                </button>
                <button 
                  onClick={() => {
                    setShowProfile(false);
                    handleAddReview(selectedVendor);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Avaliar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Request Modal */}
      {showQuoteModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Pedir Orçamento</h2>
              <button 
                onClick={() => setShowQuoteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={submitQuote} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Para: <strong>{selectedVendor.name}</strong></p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Data do evento</label>
                <input 
                  type="date"
                  required
                  value={quoteForm.eventDate}
                  onChange={(e) => setQuoteForm({ ...quoteForm, eventDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Número de convidados</label>
                <input 
                  type="number"
                  min="1"
                  value={quoteForm.guestCount}
                  onChange={(e) => setQuoteForm({ ...quoteForm, guestCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Mensagem</label>
                <textarea 
                  rows={4}
                  value={quoteForm.message}
                  onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="Descreva o que precisa..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  disabled={isSubmittingQuote}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmittingQuote ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Avaliar Fornecedor</h2>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={submitReview} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Para: <strong>{selectedVendor.name}</strong></p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Avaliação</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1"
                    >
                      <Star 
                        className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">{reviewForm.rating}/5</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Comentário</label>
                <textarea 
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="Partilhe a sua experiência..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  disabled={isSubmittingReview}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : 'Enviar Avaliação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default VendorsPage;
