import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL, getSharedAlbum, uploadToSharedAlbum } from '../../api/client';
import { toast } from 'react-hot-toast';
import { 
  Download, 
  ChevronLeft,
  ChevronRight,
  X,
  Image,
  Upload
} from 'lucide-react';
import Header from '../../components/Header';
import { motion, AnimatePresence } from 'framer-motion';

const SharedGallery = () => {
  const { shareCode } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (lightboxIndex < 0) return;
    
    if (e.key === 'ArrowLeft' && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else if (e.key === 'ArrowRight' && lightboxIndex < album.photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    } else if (e.key === 'Escape') {
      setLightboxIndex(-1);
    }
  }, [lightboxIndex, album?.photos?.length]);

  useEffect(() => {
    if (lightboxIndex >= 0) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxIndex, handleKeyDown]);

  useEffect(() => {
    fetchSharedAlbum();
  }, [shareCode]);

  const fetchSharedAlbum = async () => {
    try {
      setLoading(true);
      const response = await getSharedAlbum(shareCode);
      
      if (response.data.success) {
        setAlbum(response.data.data);
      } else {
        setError(response.data.message || 'Álbum não encontrado');
      }
    } catch (err) {
      console.error('Error fetching shared album:', err);
      setError('Erro ao carregar álbum compartilhado');
    } finally {
      setLoading(false);
    }
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

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('photos', file);
      });

      const response = await uploadToSharedAlbum(shareCode, formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      if (response.data.success) {
        toast.success(`${files.length} foto(s) carregada(s) com sucesso`);
        setAlbum(response.data.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao carregar fotos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9CAA8E]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-black mb-2">Álbum Não Encontrado</h2>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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

      {/* Upload Progress */}
      {uploading && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white rounded-full shadow-lg border border-gray-200 px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              A carregar fotos...
            </span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#9CAA8E] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-[#9CAA8E] w-10">
              {uploadProgress}%
            </span>
          </div>
        </div>
      )}

      {/* Album Header */}
      <div className="bg-white shadow-md p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ChevronLeft className="w-5 h-5" />
                <span>Voltar</span>
              </a>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-serif font-bold text-black max-md:text-[18px]">{album?.name}</h1>
              {album?.createdBy && (
                <p className="text-gray-500 text-sm">
                  Por {album.createdBy.name}
                </p>
              )}
            </div>
           {album?.allowUpload && ( <div className="w-24 flex justify-end">
              
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="shared-photo-upload"
                  />
                  <label
                    htmlFor="shared-photo-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-[#9CAA8E] text-white rounded-full cursor-pointer hover:bg-[#8A9A7E] transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="w-4 h-4" />
                     <span className="max-md:hidden">{uploading ? 'Carregando...' : 'Adicionar'}</span>
                  </label>
                </>
             
            </div> )}
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {album?.photos && album.photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {album.photos.map((photo, index) => (
              <div 
                key={photo._id} 
                className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              >
                <img 
                  src={`${API_URL}${photo.url}`} 
                  alt={photo.caption || 'Photo'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {album.allowDownload && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const fileName = photo.url.split('/').pop();
                          downloadPhoto(photo.url, fileName);
                        }}
                        className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {photo.caption && (
                    <div className="p-2 w-full">
                      <p className="text-white text-sm truncate">{photo.caption}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma foto neste álbum</p>
            {album?.allowUpload && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="shared-photo-upload-empty"
                />
                <label
                  htmlFor="shared-photo-upload-empty"
                  className={`inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[#9CAA8E] text-white rounded-full cursor-pointer hover:bg-[#8A9A7E] transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-5 h-5" />
                  {uploading ? 'Carregando...' : 'Adicionar Fotos'}
                </label>
              </>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex >= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxIndex(-1)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10"
            >
              <X className="w-8 h-8" />
            </button>
            
            {/* Album Info */}
            <div className="absolute top-4 left-4 z-10 text-white">
              <p className="text-white/70 text-sm">
                {album.photos.length} fotos
              </p>
            </div>
            
            {/* Navigation */}
            {lightboxIndex > 0 && (
              <button
                onClick={() => setLightboxIndex(lightboxIndex - 1)}
                className="absolute left-4 p-3 text-white/70 hover:text-white z-10"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            )}
            
            {lightboxIndex < album.photos.length - 1 && (
              <button
                onClick={() => setLightboxIndex(lightboxIndex + 1)}
                className="absolute right-4 p-3 text-white/70 hover:text-white z-10"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            )}
            
            {/* Main Image with Animation */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={`${API_URL}${album.photos[lightboxIndex].url}`}
              alt=""
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
            
            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
              {album.photos.map((photo, idx) => (
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
                    src={`${API_URL}${photo.url}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            
            {/* Counter */}
            <div className="absolute top-4 right-16 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
              {lightboxIndex + 1} / {album.photos.length}
            </div>
            
            {/* Download button */}
            {album.allowDownload && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const fileName = album.photos[lightboxIndex].url.split('/').pop();
                  downloadPhoto(album.photos[lightboxIndex].url, fileName);
                }}
                className="absolute bottom-4 right-4 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full z-10"
              >
                <Download className="w-6 h-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SharedGallery;
