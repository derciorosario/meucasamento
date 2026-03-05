import React, { useState, useEffect } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { 
  Heart, Star, ChevronLeft, ChevronRight, ChevronDown, MapPin, Phone, Mail, Globe, 
  Send, X, User, Check, Loader2, Filter, Search, SlidersHorizontal,
  Award, Calendar, Users, MessageCircle, TrendingUp, Sparkles,
  Camera, Music, Utensils, Flower2, Gem, Wine, Cake, Gift, Play
} from 'lucide-react';
import {
  getVendorCategories,
  getVendors,
  getVendor,
  getVendorLocations,
  requestVendorQuote,
  addVendorReview,
  seedVendorData,
  getFavorites,
  addFavorite,
  removeFavorite,
  getVendorsByIds,
  getTutorials,
} from '../../api/client';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import VendorProfileModal from '../../components/VendorProfileModal';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';

// Category icons mapping
const categoryIcons = {
  photography: Camera,
  music: Music,
  catering: Utensils,
  flowers: Flower2,
  jewelry: Gem,
  wine: Wine,
  cake: Cake,
  gifts: Gift,
  default: Sparkles
};

const VendorsPage = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState({ cities: [], regions: [] });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const navigate=useNavigate()

  const {user} = useAuth()

  const data=useData()
  
  useEffect(()=>{
  
      if(!data.postDialogOpen){
        setShowMobileFilters(false)
      }
  
  },[data.postDialogOpen])
  
  // Multi-select filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  
  const [filters, setFilters] = useState({
    search: '',
    sort: 'rating',
    page: 1
  });
  
  // Dropdown visibility states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [vendorSlides, setVendorSlides] = useState({});
  const [favorites, setFavorites] = useState([]);
  
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

  const [showVendorTutorial,setShowVendorTutorial]=useState(false)

  // Tutorial video state
  const [vendorTutorial, setVendorTutorial] = useState(null);
  const [playingTutorial, setPlayingTutorial] = useState(null);

  // Helper function to extract YouTube video ID
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Load favorites when user logs in
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const favoritesRes = await getFavorites();
          if (favoritesRes.data && favoritesRes.data.favorites) {
            setFavorites(favoritesRes.data.favorites.map(v => v._id));
          }
        } catch (e) {
          console.error('Error loading favorites:', e);
        }
      } else {
        setFavorites([]);
      }
    };
    loadFavorites();
  }, [user]);

  useEffect(() => {
    loadVendors();
  }, [filters, selectedCategories, selectedCities, selectedPriceRanges, showFavoritesOnly, favorites]);

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
      // Fetch tutorial videos
      try {
        const tutorialsRes = await getTutorials();
        if (tutorialsRes.data?.tutorialVideos?.vendors) {
          const videoId = extractYouTubeId(tutorialsRes.data.tutorialVideos.vendors);
          setVendorTutorial({
            url: tutorialsRes.data.tutorialVideos.vendors,
            videoId
          });
        }
      } catch (tutError) {
        console.log('No tutorial videos available');
      }

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
      
      // Load favorites if user is logged in
      if (user) {
        try {
          const favoritesRes = await getFavorites();
          if (favoritesRes.data && favoritesRes.data.favorites) {
            setFavorites(favoritesRes.data.favorites.map(v => v._id));
          }
        } catch (e) {
          console.error('Error loading favorites:', e);
        }
      }
      
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
      
      // If showing favorites only, use the by-ids endpoint
      if (showFavoritesOnly && favorites.length > 0) {
        const params = {
          page: filters.page || 1,
          limit: 12,
          sort: filters.sort,
        };
        const response = await getVendorsByIds(favorites.join(','), params);
        setVendors(response.data.vendors);
        setPagination(response.data.pagination);
        return;
      }
      
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

  const toggleFavorite = async (vendorId) => {
    // Check if user is logged in
    if (!user) {
      toast.error('Precisa fazer login para adicionar aos favoritos');
      return;
    }
    
    try {
      const isFavorite = favorites.includes(vendorId);
      
      if (isFavorite) {
        await removeFavorite(vendorId);
        setFavorites(prev => prev.filter(id => id !== vendorId));
        toast.success('Removido dos favoritos');
      } else {
        await addFavorite(vendorId);
        setFavorites(prev => [...prev, vendorId]);
        toast.success('Adicionado aos favoritos');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erro ao atualizar favorito');
    }
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

    navigate('/vendor/'+vendor._id)

    return
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

  const getAllVendorImages = (vendor) => {
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
    // Check if user is logged in
    if (!user) {
      toast.error('Precisa fazer login para pedir orçamento');
      return;
    }
    
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
    // Check if user is logged in
    if (!user) {
      toast.error('Precisa fazer login para avaliar');
      return;
    }
    
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPriceRangeColor = (range) => {
    const colors = {
      budget: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      luxury: 'text-purple-600 bg-purple-50'
    };
    return colors[range] || 'text-gray-600 bg-gray-50';
  };

  const getPriceRangeLabel = (range) => {
    const labels = {
      budget: 'Económico',
      medium: 'Médio',
      high: 'Alto',
      luxury: 'Luxo'
    };
    return labels[range] || range;
  };

  const activeFilterCount = selectedCategories.length + selectedCities.length + selectedPriceRanges.length;

  if (loading && vendors.length === 0) {
    return (
      <DefaultLayout largerPadding={true}  hero={{ title: "Fornecedores", subtitle: "Encontre os melhores fornecedores para o seu casamento" }}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <Sparkles className="w-8 h-8 text-primary-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 animate-pulse">Carregando fornecedores...</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout  largerPadding={true} hero={{ 
      title: "Fornecedores", 
      subtitle: "Encontre os melhores fornecedores para tornar o seu casamento inesquecível",
      image: "https://images.unsplash.com/photo-1519167758481-83f29da8c1e8?w=1200&h=400&fit=crop"
    }}>
      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-gray-600">{pagination.total} fornecedores verificados</span>
              </div>
              <div className="flex items-center gap-2 hidden">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-gray-600">Avaliação média 4.8</span>
              </div>
              <div className="flex items-center gap-2 hidden">
                <Users className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-gray-600">+1000 casamentos realizados</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              {user && (
                <button 
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex hidden items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    showFavoritesOnly 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
                  <span className="text-sm font-medium">Ver favoritos</span>
                </button>
              )}

                          {/* Tutorial Video - Mobile Only */}
            {/* Tutorial Video - Desktop Only - Opens Dialog */}
            {vendorTutorial && (
              <div className="max-lg:hidden mb-4">
                <button
                  onClick={() => setPlayingTutorial(vendorTutorial)}
                  className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary-500" fill="currentColor" />
                    <span className="text-sm font-medium text-primary-700">Ver tutorial</span>
                    <span className="text-xs text-primary-600 ml-1">(como usar esta página)</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-primary-500 transition-transform ${showVendorTutorial ? 'rotate-180' : ''}`} />
                </button>
                
               
              </div>
            )}
            
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Main Content with Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-[90px]">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Filter Header */}
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200"
                  onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Filtros</h3>
                    {activeFilterCount > 0 && (
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  <ChevronRight 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isFilterCollapsed ? '' : 'rotate-90'
                    }`} 
                  />
                </div>

                {/* Scrollable Filter Content */}
                <div className={isFilterCollapsed ? 'hidden' : 'block'}>
                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {/* Search Input */}
                    <div className="p-5 border-b border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pesquisar
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text"
                          placeholder="Nome do fornecedor..."
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900"
                          value={filters.search}
                          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        />
                      </div>
                    </div>

                    {/* Favorites Filter - After Search */}
                    {user && (
                      <div className="p-5 border-b border-gray-100">
                        <button
                          onClick={() => {
                            setShowFavoritesOnly(!showFavoritesOnly);
                            setFilters({ ...filters, page: 1 });
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                            showFavoritesOnly
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 hover:border-red-200 text-gray-700'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-red-500 text-red-500' : ''}`} />
                          <span className="font-medium">Ver favoritos</span>
                          {showFavoritesOnly && (
                            <Check className="w-5 h-5 ml-auto text-red-500" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Category Filter */}
                    <div className="p-5 border-b border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Categoria
                      </label>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {categories.map((cat) => {
                          const IconComponent = categoryIcons[cat.icon] || categoryIcons.default;
                          return (
                            <div
                              key={cat._id}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedCategories.includes(cat._id) ? 'bg-primary-50' : ''
                              }`}
                              onClick={() => toggleCategory(cat._id)}
                            >
                              <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                                selectedCategories.includes(cat._id) 
                                  ? 'bg-primary-600 border-primary-600' 
                                  : 'border-gray-300'
                              }`}>
                                {selectedCategories.includes(cat._id) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <IconComponent className={`w-4 h-4 ${
                                selectedCategories.includes(cat._id) 
                                  ? 'text-primary-600' 
                                  : 'text-gray-400'
                              }`} />
                              <span className={`text-sm ${
                                selectedCategories.includes(cat._id) 
                                  ? 'text-primary-900 font-medium' 
                                  : 'text-gray-700'
                              }`}>
                                {cat.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Location Filter */}
                    <div className="p-5 border-b border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Localização
                      </label>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {locations.cities.map((city) => (
                          <div
                            key={city}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedCities.includes(city) ? 'bg-primary-50' : ''
                            }`}
                            onClick={() => toggleCity(city)}
                          >
                            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                              selectedCities.includes(city) 
                                ? 'bg-primary-600 border-primary-600' 
                                : 'border-gray-300'
                            }`}>
                              {selectedCities.includes(city) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <MapPin className={`w-4 h-4 ${
                              selectedCities.includes(city) 
                                ? 'text-primary-600' 
                                : 'text-gray-400'
                            }`} />
                            <span className={`text-sm ${
                              selectedCities.includes(city) 
                                ? 'text-primary-900 font-medium' 
                                : 'text-gray-700'
                            }`}>
                              {city}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="p-5 border-b border-gray-100 hidden">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Orçamento
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'budget', label: 'Económico', icon: '💰' },
                          { value: 'medium', label: 'Médio', icon: '💎' },
                          { value: 'high', label: 'Alto', icon: '👑' },
                          { value: 'luxury', label: 'Luxo', icon: '✨' }
                        ].map((range) => (
                          <div
                            key={range.value}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedPriceRanges.includes(range.value) ? 'bg-primary-50' : ''
                            }`}
                            onClick={() => togglePriceRange(range.value)}
                          >
                            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                              selectedPriceRanges.includes(range.value) 
                                ? 'bg-primary-600 border-primary-600' 
                                : 'border-gray-300'
                            }`}>
                              {selectedPriceRanges.includes(range.value) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="text-lg">{range.icon}</span>
                            <span className={`text-sm ${
                              selectedPriceRanges.includes(range.value) 
                                ? 'text-primary-900 font-medium' 
                                : 'text-gray-700'
                            }`}>
                              {range.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="p-5 border-b border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Ordenar por
                      </label>
                      <select 
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 appearance-none cursor-pointer"
                        value={filters.sort}
                        onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
                      >
                        <option value="rating">Melhor avaliação</option>
                        <option value="price_low">Menor preço</option>
                        <option value="price_high">Maior preço</option>
                        <option value="name">Nome A-Z</option>
                      </select>
                    </div>

                    {/* Filter Actions */}
                    <div className="p-5 bg-gray-50">
                      <button 
                        onClick={clearFilters}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Limpar todos os filtros
                      </button>
                    </div>

                    {/* Results Summary */}
                    <div className="p-5 bg-primary-50 border-t border-primary-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Resultados</span>
                        <span className="text-2xl font-bold text-primary-600">{pagination.total}</span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>{selectedCategories.length} categorias selecionadas</p>
                        <p>{selectedCities.length} cidades selecionadas</p>
                        <p>{selectedPriceRanges.length} faixas de preço selecionadas</p>
                      </div>
                      {activeFilterCount > 0 && (
                        <div className="mt-3 pt-3 border-t border-primary-200">
                          <p className="text-xs text-primary-600 font-medium">
                            {activeFilterCount} filtro(s) ativo(s)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <button
              onClick={() => {
                 setShowMobileFilters(true)
                 data.setPostDialogOpen(true)
              }}
              className="lg:hidden w-full mb-6 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Filtros</span>
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* Tutorial Video - Mobile Only */}
            {vendorTutorial && (
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowVendorTutorial(true)}
                  className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary-500" fill="currentColor" />
                    <span className="text-sm font-medium text-primary-700">Ver tutorial</span>
                    <span className="text-xs text-primary-600 ml-1">(como usar esta página)</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-primary-500 transition-transform ${showVendorTutorial ? 'rotate-180' : ''}`} />
                </button>
                
                {showVendorTutorial && (
                  <div className="mt-2 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${vendorTutorial.videoId}`}
                      title="Tutorial Video"
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {showFavoritesOnly 
                    ? `${pagination.total} fornecedores nos favoritos` 
                    : `${pagination.total} fornecedores encontrados`}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {activeFilterCount} filtro(s) aplicado(s)
                </p>
              </div>
              <div className="hidden lg:block text-sm text-gray-500">
                Página {pagination.page} de {pagination.pages}
              </div>
            </div>

            {/* Vendors Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
            >
              {vendors.map((vendor, index) => (
                <motion.div
                  key={vendor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleViewProfile(vendor)}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 cursor-pointer"
                >
                  {/* Image Slideshow */}
                  <div className="relative h-48 overflow-hidden">
                    {(() => {
                      const allImages = getAllVendorImages(vendor);
                      return allImages.length > 0 ? (
                        <>
                          <motion.img 
                            key={vendorSlides[vendor._id] || 0}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            src={getImageUrl(allImages[vendorSlides[vendor._id] || 0])}
                            alt={`${vendor.name} - ${(vendorSlides[vendor._id] || 0) + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {allImages.length > 1 && (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); prevVendorSlide(vendor._id, allImages.length); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); nextVendorSlide(vendor._id, allImages.length); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {allImages.map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setVendorSlides(prev => ({ ...prev, [vendor._id]: idx })); }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                      idx === (vendorSlides[vendor._id] || 0) 
                                        ? 'w-4 bg-white' 
                                        : 'bg-white/60 hover:bg-white'
                                    }`}
                                  />
                                ))}
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
                      );
                    })()}
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(vendor._id); }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${
                          favorites.includes(vendor._id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-600'
                        }`} 
                      />
                    </button>

                    {/* Featured Badge */}
                    {vendor.isFeatured && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Destaque
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                          {vendor.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl">{vendor.category?.icon}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {vendor.category?.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-semibold text-yellow-700">{vendor.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-xs text-yellow-600">({vendor.totalReviews})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      {vendor.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {vendor.city}
                        </span>
                      )}
                      {vendor.maxCapacity && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Até {vendor.maxCapacity}
                          </span>
                        </>
                      )}
                      {(vendor.priceRange && false) && (
                        <>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriceRangeColor(vendor.priceRange)}`}>
                            {getPriceRangeLabel(vendor.priceRange)}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {vendor.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs text-gray-500">A partir de</span>
                        <p className="text-base font-bold text-gray-900">
                          {vendor.startingPrice 
                            ? `${vendor.startingPrice.toLocaleString('pt-MZ')} MT` 
                            : 'Sob consulta'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 hidden">
                      <button 
                        onClick={() => handleViewProfile(vendor)}
                        className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-2 rounded-xl text-xs font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Ver detalhes
                      </button>
                      <button 
                        onClick={() => handleRequestQuote(vendor)}
                        className="w-8 h-8 border-2 border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-300 flex items-center justify-center group"
                        title="Pedir orçamento"
                      >
                        <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {(vendors.length === 0) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-16"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg mb-2">
                    {showFavoritesOnly 
                      ? 'Nenhum fornecedor nos favoritos' 
                      : 'Nenhum fornecedor encontrado'}
                  </p>
                  <button 
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Limpar filtros
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </motion.button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === 1 || page === pagination.pages || 
                      (page >= pagination.page - 2 && page <= pagination.page + 2);
                  })
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
                          pagination.page === page 
                            ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md' 
                            : 'border-2 border-gray-200 hover:border-primary-300 text-gray-600'
                        }`}
                      >
                        {page}
                      </motion.button>
                    </React.Fragment>
                  ))
                }
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 lg:hidden overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Mobile Search Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pesquisar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Nome do fornecedor..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                  </div>
                </div>

                {/* Mobile Favorites Filter - After Search */}
                {user && (
                  <div>
                    <button
                      onClick={() => {
                        setShowFavoritesOnly(!showFavoritesOnly);
                        setFilters({ ...filters, page: 1 });
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                        showFavoritesOnly
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-red-200 text-gray-700'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="font-medium">Ver favoritos</span>
                      {showFavoritesOnly && (
                        <Check className="w-5 h-5 ml-auto text-red-500" />
                      )}
                    </button>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div
                        key={cat._id}
                        className={`px-4 py-3 rounded-xl cursor-pointer flex items-center gap-3 border-2 transition-all ${
                          selectedCategories.includes(cat._id)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-200'
                        }`}
                        onClick={() => toggleCategory(cat._id)}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="flex-1 text-gray-900">{cat.name}</span>
                        {selectedCategories.includes(cat._id) && (
                          <Check className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                  <div className="space-y-2">
                    {locations.cities.map((city) => (
                      <div
                        key={city}
                        className={`px-4 py-3 rounded-xl cursor-pointer flex items-center gap-3 border-2 transition-all ${
                          selectedCities.includes(city)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-200'
                        }`}
                        onClick={() => toggleCity(city)}
                      >
                        <MapPin className={`w-5 h-5 ${
                          selectedCities.includes(city) ? 'text-primary-500' : 'text-gray-400'
                        }`} />
                        <span className="flex-1 text-gray-900">{city}</span>
                        {selectedCities.includes(city) && (
                          <Check className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Orçamento</label>
                  <div className="space-y-2">
                    {[
                      { value: 'budget', label: 'Económico', icon: '💰' },
                      { value: 'medium', label: 'Médio', icon: '💎' },
                      { value: 'high', label: 'Alto', icon: '👑' },
                      { value: 'luxury', label: 'Luxo', icon: '✨' }
                    ].map((range) => (
                      <div
                        key={range.value}
                        className={`px-4 py-3 rounded-xl cursor-pointer flex items-center gap-3 border-2 transition-all ${
                          selectedPriceRanges.includes(range.value)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-200'
                        }`}
                        onClick={() => togglePriceRange(range.value)}
                      >
                        <span className="text-xl">{range.icon}</span>
                        <span className="flex-1 text-gray-900">{range.label}</span>
                        {selectedPriceRanges.includes(range.value) && (
                          <Check className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                  <select 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900"
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
                  >
                    <option value="rating">Melhor avaliação</option>
                    <option value="price_low">Menor preço</option>
                    <option value="price_high">Maior preço</option>
                    <option value="name">Nome A-Z</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Limpar
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Vendor Profile Modal */}
      <AnimatePresence>
        {showProfile && selectedVendor && (
          <VendorProfileModal
            vendor={selectedVendor}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
            onClose={() => setShowProfile(false)}
            onRequestQuote={handleRequestQuote}
            onAddReview={handleAddReview}
            getPriceRangeColor={getPriceRangeColor}
            getPriceRangeLabel={getPriceRangeLabel}
          />
        )}
      </AnimatePresence>

      {/* Quote Request Modal */}
      <AnimatePresence>
        {showQuoteModal && selectedVendor && (
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
                      <span className="text-xl">{selectedVendor.category?.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Para</p>
                      <p className="font-medium text-gray-900">{selectedVendor.name}</p>
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
        {showReviewModal && selectedVendor && (
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
                      <span className="text-xl">{selectedVendor.category?.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Para</p>
                      <p className="font-medium text-gray-900">{selectedVendor.name}</p>
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

      {/* Video Player Modal - Desktop Only */}
      {vendorTutorial && playingTutorial && (
        <div 
          className="fixed inset-0 z-50 hidden lg:flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setPlayingTutorial(null)}
        >
          <div 
            className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Tutorial: Fornecedores
              </h3>
              <button
                onClick={() => setPlayingTutorial(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${playingTutorial.videoId}?autoplay=1`}
                title="YouTube video player"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default VendorsPage;