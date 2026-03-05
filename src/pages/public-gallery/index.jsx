import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPublicGalleries } from '../../api/client';
import { toast } from 'react-hot-toast';
import { 
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Image,
  User,
  Calendar,
  Loader2,
  Grid,
  Layers,
  Download
} from 'lucide-react';
import DefaultLayout from '../../layout/DefaultLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../api/client';
import { useData } from '../../contexts/DataContext';

const PublicGallery = () => {
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [lightboxGallery, setLightboxGallery] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [galleryIndexes, setGalleryIndexes] = useState({}); // Track index per gallery
  const [viewMode, setViewMode] = useState('slides'); // 'slides' or 'grid'
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);


  const data=useData()
      
      useEffect(()=>{
          if(!data.postDialogOpen){
              setLightboxIndex(-1)
              setLightboxGallery(null);
    
          }
      },[data.postDialogOpen])
    
      useEffect(()=>{
    
        if(lightboxIndex>=0){
              data.setPostDialogOpen(true)
        }
    
      },[lightboxIndex])

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getAllPublicGalleries({ page, limit: 12 });
      
      if (response.data.success) {
        setGalleries(response.data.data.galleries);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching galleries:', err);
      toast.error('Erro ao carregar galerias');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://www.acadiate.com/images/Placeholder.png';
    if (path.includes('https')) return path;
    return `${API_URL}${path}`;
  };

  const openLightbox = (gallery) => {
    setLightboxGallery(gallery);
    setLightboxIndex(0);

  };

  const closeLightbox = () => {
    setLightboxGallery(null);
    setLightboxIndex(0);
  };

  const nextSlide = () => {
    if (lightboxGallery && lightboxIndex < lightboxGallery.photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevSlide = () => {
    if (lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const getGalleryIndex = (galleryId) => galleryIndexes[galleryId] || 0;

  const setGalleryIndex = (galleryId, index) => {
    setGalleryIndexes(prev => ({ ...prev, [galleryId]: index }));
  };

  const handlePageChange = (newPage) => {
    fetchGalleries(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadPhoto = (photoUrl, fileName) => {
    const url = `${API_URL}/download/${fileName}`;
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    
    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded * 100) / event.total);
        setDownloadProgress(percentComplete);
      }
    };
    
    xhr.onload = function() {
      setDownloading(false);
      setDownloadProgress(0);
      
      if (this.status === 200) {
        const blob = this.response;
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      } else {
        toast.error('Erro ao descargar imagem');
      }
    };
    
    xhr.onerror = function() {
      setDownloading(false);
      setDownloadProgress(0);
      toast.error('Erro ao descargar imagem');
    };
    
    setDownloading(true);
    setDownloadProgress(0);
    xhr.send();
  };

  if (loading && galleries.length === 0) {
    return (
      <DefaultLayout hero={{ title: "Galeria Pública", subtitle: "Inspire-se com os casamentos mais lindos" }}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-[#9CAA8E] animate-spin" />
          <p className="mt-4 text-gray-600">Carregando galerias...</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout hero={{ 
      title: "Galeria Pública", 
      subtitle: "Inspire-se com os casamentos mais lindos",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop"
    }}>
      {/* View Mode Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Download Progress */}
        {downloading && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white rounded-full shadow-lg border border-gray-200 px-6 py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                A descargar...
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#9CAA8E] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-[#9CAA8E] w-10">
                {downloadProgress}%
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Álbuns Públicos
            </h2>
            <p className="text-gray-500 mt-1">
              {pagination.total} álbuns disponíveis
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setViewMode('slides')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'slides' 
                  ? 'bg-[#9CAA8E] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              Slides
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-[#9CAA8E] text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4" />
              Grade
            </button>
          </div>
        </div>

        {galleries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum álbum público ainda
            </h3>
            <p className="text-gray-500">
             Seja o primeiro a compartilhar seu álbum!
            </p>
          </div>
        ) : viewMode === 'slides' ? (
          /* Slides View - Carousel */
          <div className="space-y-8">
            {galleries.map((gallery, idx) => (
              <motion.div
                key={gallery._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Album Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {gallery.createdBy?.avatar ? (
                        <img 
                          src={getImageUrl(gallery.createdBy.avatar)} 
                          alt={gallery.createdBy.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#9CAA8E]/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-[#9CAA8E]" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{gallery.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {gallery.createdBy?.name || 'Anónimo'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(gallery.createdAt).toLocaleDateString('pt-MZ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        {gallery.photos?.length || 0} fotos
                      </span>
                    </div>
                  </div>
                  {gallery.description && (
                    <p className="mt-3 text-gray-600">{gallery.description}</p>
                  )}
                </div>

                {/* Slideshow */}
                <div className="relative h-[400px] bg-gray-900">
                  {gallery.photos && gallery.photos.length > 0 ? (
                    <>
                      <AnimatePresence mode='wait'>
                          <motion.img
                            key={`${gallery._id}-${getGalleryIndex(gallery._id)}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            src={getImageUrl(gallery.photos[getGalleryIndex(gallery._id)]?.url || gallery.coverPhoto)}
                          alt={gallery.name}
                          className="w-full h-full object-contain"
                          onClick={() => openLightbox(gallery)}
                        />
                      </AnimatePresence>
                      
                      {/* Slide Navigation */}
                      {gallery.photos.length > 1 && (
                        <>
                          <button
                            onClick={() => {
                              const currentIdx = getGalleryIndex(gallery._id);
                              if (currentIdx > 0) {
                                setGalleryIndex(gallery._id, currentIdx - 1);
                              }
                            }}
                            disabled={getGalleryIndex(gallery._id) === 0}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
                          >
                            <ChevronLeft className="w-6 h-6 text-gray-800" />
                          </button>
                          <button
                            onClick={() => {
                              const currentIdx = getGalleryIndex(gallery._id);
                              if (currentIdx < gallery.photos.length - 1) {
                                setGalleryIndex(gallery._id, currentIdx + 1);
                              }
                            }}
                            disabled={getGalleryIndex(gallery._id) >= gallery.photos.length - 1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
                          >
                            <ChevronRight className="w-6 h-6 text-gray-800" />
                          </button>
                          
                          {/* Slide Indicators */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {Array.from({ length: gallery.photos.length }, (_, i) => (
                              <button
                                key={i}
                                onClick={() => setGalleryIndex(gallery._id, i)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  getGalleryIndex(gallery._id) === i 
                                    ? 'w-6 bg-white' 
                                    : 'bg-white/50 hover:bg-white/80'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {/* Photo Counter */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full">
                        {getGalleryIndex(gallery._id) + 1} / {gallery.photos.length}
                      </div>

                      {/* View All Button */}
                      <button
                        onClick={() => openLightbox(gallery)}
                        className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg font-medium text-sm transition-all shadow-lg"
                      >
                        Ver todas as fotos
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Image className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery, idx) => (
              <motion.div
                key={gallery._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                onClick={() => openLightbox(gallery)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {gallery.coverPhoto || gallery.photos?.[0] ? (
                    <img 
                      src={getImageUrl(gallery.coverPhoto || gallery.photos[0].url)}
                      alt={gallery.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-medium truncate">{gallery.name}</p>
                      <p className="text-white/80 text-sm flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        {gallery.photos?.length || 0} fotos
                      </p>
                    </div>
                  </div>

                  {/* Photo count badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                    {gallery.photos?.length || 0} fotos
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{gallery.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      {gallery.createdBy?.avatar ? (
                        <img 
                          src={getImageUrl(gallery.createdBy.avatar)} 
                          alt={gallery.createdBy.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-[#9CAA8E]/20 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-[#9CAA8E]" />
                        </div>
                      )}
                      <span className="text-sm text-gray-600">
                        {gallery.createdBy?.name || 'Anónimo'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(gallery.createdAt).toLocaleDateString('pt-MZ')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="w-10 h-10 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
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
                  <button 
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
                      pagination.page === page 
                        ? 'bg-[#9CAA8E] text-white shadow-md' 
                        : 'border-2 border-gray-200 hover:border-[#9CAA8E] text-gray-600'
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
              className="w-10 h-10 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Album Info */}
            <div className="absolute top-4 left-4 z-10 text-white">
              <h3 className="text-xl font-bold">{lightboxGallery.name}</h3>
              <p className="text-white/70 text-sm">
                {lightboxGallery.createdBy?.name} • {lightboxGallery.photos?.length} fotos
              </p>
            </div>

            {/* Navigation */}
            {lightboxIndex > 0 && (
              <button
                onClick={prevSlide}
                className="absolute left-4 p-3 text-white/70 hover:text-white z-10"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            )}
            
            {lightboxIndex < lightboxGallery.photos.length - 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-4 p-3 text-white/70 hover:text-white z-10"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            )}

            {/* Main Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={getImageUrl(lightboxGallery.photos[lightboxIndex]?.url)}
              alt=""
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />

            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
              {lightboxGallery.photos?.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                    idx === lightboxIndex 
                      ? 'ring-2 ring-white scale-110' 
                      : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <img 
                    src={getImageUrl(photo.url)} 
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Counter */}
            <div className="absolute top-4 right-16 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
              {lightboxIndex + 1} / {lightboxGallery.photos?.length}
            </div>
            
            {/* Download button */}
            <button
              onClick={() => {
                const fileName = lightboxGallery.photos[lightboxIndex].url.split('/').pop();
                downloadPhoto(lightboxGallery.photos[lightboxIndex].url, fileName);
              }}
              className="absolute bottom-4 right-4 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full z-10"
            >
              <Download className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </DefaultLayout>
  );
};

export default PublicGallery;
