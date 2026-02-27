import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedAlbum } from '../../api/client';
import { toast } from 'react-hot-toast';
import { 
  Download, 
  ChevronLeft,
  ChevronRight,
  X,
  Image
} from 'lucide-react';
import Header from '../../components/Header';

const API_URL = 'http://localhost:5005';

const SharedGallery = () => {
  const { shareCode } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [error, setError] = useState(null);

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

  const downloadPhoto = (photoUrl) => {
    const link = document.createElement('a');
    link.href = `${API_URL}${photoUrl}`;
    link.download = photoUrl.split('/').pop();
    link.click();
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
              <h1 className="text-2xl font-serif font-bold text-black">{album?.name}</h1>
              {album?.createdBy && (
                <p className="text-gray-500 text-sm">
                  Por {album.createdBy.name}
                </p>
              )}
            </div>
            <div className="w-24"></div>
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
                          downloadPhoto(photo.url);
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
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setLightboxIndex(-1)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>
          
          {lightboxIndex > 0 && (
            <button
              onClick={() => setLightboxIndex(lightboxIndex - 1)}
              className="absolute left-4 p-2 text-white/70 hover:text-white"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          
          {lightboxIndex < album.photos.length - 1 && (
            <button
              onClick={() => setLightboxIndex(lightboxIndex + 1)}
              className="absolute right-4 p-2 text-white/70 hover:text-white"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
          
          <img
            src={`${API_URL}${album.photos[lightboxIndex].url}`}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default SharedGallery;
