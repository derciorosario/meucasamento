import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getMyAlbums, 
  getAlbum, 
  createAlbum, 
  updateAlbum, 
  deleteAlbum, 
  uploadPhotos, 
  deletePhoto,
  getUserPublicAlbums
} from '../api/client';
import { API_URL } from '../api/client';
import { toast } from 'react-hot-toast';
import { 
  Upload, 
  Plus, 
  Trash2, 
  Image, 
  Share2, 
  QrCode, 
  Download, 
  X, 
  Settings,
  Eye,
  EyeOff,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = ({ userId = null, isOwner = false, isPublicView = false }) => {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showProfileShareModal, setShowProfileShareModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: null, id: null, name: '' });
  const [newAlbum, setNewAlbum] = useState({ name: '', description: '', isPublic: false });
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const fileInputRef = useRef(null);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (lightboxIndex < 0 || !selectedAlbum) return;
    
    if (e.key === 'ArrowLeft' && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else if (e.key === 'ArrowRight' && lightboxIndex < selectedAlbum.photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    } else if (e.key === 'Escape') {
      setLightboxIndex(-1);
    }
  }, [lightboxIndex, selectedAlbum?.photos?.length]);

  useEffect(() => {
    if (lightboxIndex >= 0) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxIndex, handleKeyDown]);

  useEffect(() => {
    fetchAlbums();
  }, [userId]);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      let response;
      if (userId && !isOwner) {
        response = await getUserPublicAlbums(userId);
      } else {
        response = await getMyAlbums();
      }
      
      if (response.data.success) {
        setAlbums(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast.error('Erro ao carregar álbuns');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbum = async (albumId) => {
    try {
      setLoading(true);
      const response = await getAlbum(albumId);
      if (response.data.success) {
        setSelectedAlbum(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching album:', error);
      toast.error('Erro ao carregar álbum');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    try {
      const response = await createAlbum(newAlbum);
      if (response.data.success) {
        toast.success('Álbum criado com sucesso');
        setShowNewAlbumModal(false);
        setNewAlbum({ name: '', description: '', isPublic: false });
        fetchAlbums();
      }
    } catch (error) {
      toast.error('Erro ao criar álbum');
    }
  };

  const handleUpdateAlbum = async (e) => {
    e.preventDefault();
    try {
      const response = await updateAlbum(selectedAlbum._id, {
        name: selectedAlbum.name,
        description: selectedAlbum.description,
        isPublic: selectedAlbum.isPublic,
        allowShare: selectedAlbum.allowShare,
        allowDownload: selectedAlbum.allowDownload,
      });
      if (response.data.success) {
        toast.success('Álbum atualizado com sucesso');
        setShowSettingsModal(false);
        fetchAlbums();
        if (selectedAlbum) {
          fetchAlbum(selectedAlbum._id);
        }
      }
    } catch (error) {
      toast.error('Erro ao atualizar álbum');
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    try {
      const response = await deleteAlbum(albumId);
      if (response.data.success) {
        toast.success('Álbum excluído com sucesso');
        setSelectedAlbum(null);
        fetchAlbums();
      }
    } catch (error) {
      toast.error('Erro ao excluir álbum');
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      if (selectedAlbum) {
        formData.append('albumId', selectedAlbum._id);
      }
      files.forEach(file => {
        formData.append('photos', file);
      });

      const response = await uploadPhotos(formData);
      if (response.data.success) {
        toast.success(`${files.length} foto(s) carregada(s) com sucesso`);
        
        if (selectedAlbum) {
          fetchAlbum(selectedAlbum._id);
        } else {
          fetchAlbums();
          if (response.data.data._id) {
            fetchAlbum(response.data.data._id);
          }
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao carregar fotos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!deleteConfirm.show || !deleteConfirm.id) return;
    
    try {
      const response = await deletePhoto(selectedAlbum._id, deleteConfirm.id);
      if (response.data.success) {
        toast.success('Foto excluída com sucesso');
        fetchAlbum(selectedAlbum._id);
        fetchAlbums();
      }
    } catch (error) {
      toast.error('Erro ao excluir foto');
    } finally {
      setDeleteConfirm({ show: false, type: null, id: null, name: '' });
    }
  };

  const confirmDelete = (type, id, name) => {
    setDeleteConfirm({ show: true, type, id, name });
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/gallery/shared/${selectedAlbum.shareCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  const getQRCodeUrl = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/gallery/shared/${selectedAlbum?.shareCode || ''}`)}`;
  };

  const getProfileShareLink = () => {
    return `${window.location.origin}/profile/${userId}`;
  };

  const getProfileQRCodeUrl = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getProfileShareLink())}`;
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(getProfileShareLink());
    toast.success('Link do perfil copiado para a área de transferência!');
  };

  const downloadPhoto = (photoUrl) => {
    const link = document.createElement('a');
    link.href = `${API_URL}${photoUrl}`;
    link.download = photoUrl.split('/').pop();
    link.click();
  };

  if (loading && albums.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9CAA8E]"></div>
      </div>
    );
  }

  // Album detail view
  if (selectedAlbum) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedAlbum(null)}
                className="p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-serif font-bold text-black">{selectedAlbum.name}</h2>
                {selectedAlbum.description && (
                  <p className="text-gray-500 text-sm">{selectedAlbum.description}</p>
                )}
              </div>
            </div>
            
            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow hover:shadow-md transition-shadow text-gray-700"
                >
                  <Settings className="w-4 h-4" />
                  Configurações
                </button>
                {selectedAlbum.allowShare && (
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E] transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Upload button for owner */}
          {isOwner && (
            <div className="mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className={`inline-flex items-center gap-2 px-6 py-3 bg-[#9CAA8E] text-white rounded-full cursor-pointer hover:bg-[#8A9A7E] transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-5 h-5" />
                {uploading ? 'Carregando...' : 'Adicionar Fotos'}
              </label>
            </div>
          )}

          {/* Photo Grid */}
          {selectedAlbum.photos && selectedAlbum.photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedAlbum.photos.map((photo, index) => (
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
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete('photo', photo._id, photo.caption || 'esta foto');
                          }}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {selectedAlbum.allowDownload && (
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
              <p className="text-gray-500">Nenhuma foto neste álbum ainda</p>
              {isOwner && (
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[#9CAA8E] text-white rounded-full cursor-pointer hover:bg-[#8A9A7E] transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Adicionar Fotos
                </label>
              )}
            </div>
          )}

          {/* Settings Modal */}
          {showSettingsModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-serif font-bold text-black">Configurações do Álbum</h3>
                  <button onClick={() => setShowSettingsModal(false)}>
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
                
                <form onSubmit={handleUpdateAlbum} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      value={selectedAlbum.name}
                      onChange={(e) => setSelectedAlbum({...selectedAlbum, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={selectedAlbum.description || ''}
                      onChange={(e) => setSelectedAlbum({...selectedAlbum, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Tornar público</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAlbum({...selectedAlbum, isPublic: !selectedAlbum.isPublic})}
                      className={`p-2 rounded-full transition-colors ${selectedAlbum.isPublic ? 'bg-[#9CAA8E] text-white' : 'bg-gray-200 text-gray-500'}`}
                    >
                      {selectedAlbum.isPublic ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Permitir compartilhamento</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAlbum({...selectedAlbum, allowShare: !selectedAlbum.allowShare})}
                      className={`p-2 rounded-full transition-colors ${selectedAlbum.allowShare ? 'bg-[#9CAA8E] text-white' : 'bg-gray-200 text-gray-500'}`}
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Permitir download</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAlbum({...selectedAlbum, allowDownload: !selectedAlbum.allowDownload})}
                      className={`p-2 rounded-full transition-colors ${selectedAlbum.allowDownload ? 'bg-[#9CAA8E] text-white' : 'bg-gray-200 text-gray-500'}`}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => confirmDelete('album', selectedAlbum._id, selectedAlbum.name)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Excluir Álbum
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E]"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* QR Code Modal */}
          {showQRModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-serif font-bold text-black">Compartilhar Álbum</h3>
                  <button onClick={() => setShowQRModal(false)}>
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
                
                {selectedAlbum.shareCode && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                      <img 
                        src={getQRCodeUrl()} 
                        alt="QR Code" 
                        className="w-48 h-48 mx-auto rounded-lg"
                      />
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      Escaneie o QR code ou use o link abaixo:
                    </p>
                    
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 mb-4">
                      <input
                        type="text"
                        value={`${window.location.origin}/gallery/shared/${selectedAlbum.shareCode}`}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-black px-2"
                      />
                      <button
                        onClick={copyShareLink}
                        className="p-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E]"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
                
                {!selectedAlbum.shareCode && (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Ative o compartilhamento nas configurações do álbum para gerar um link.
                    </p>
                    <button
                      onClick={() => {
                        setShowQRModal(false);
                        setShowSettingsModal(true);
                      }}
                      className="px-6 py-2 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E]"
                    >
                      Ativar Compartilhamento
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Delete Confirmation Modal */}
          {deleteConfirm.show && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                
                <h3 className="text-xl font-serif font-bold text-black mb-2">
                  Confirmar Exclusão
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja excluir {deleteConfirm.type === 'album' ? 'o álbum' : 'esta foto'} "{deleteConfirm.name}"?
                  {deleteConfirm.type === 'album' && ' Esta ação não pode ser desfeita e todas as fotos serão excluídas.'}
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm({ show: false, type: null, id: null, name: '' })}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      if (deleteConfirm.type === 'album') {
                        try {
                          const response = await deleteAlbum(deleteConfirm.id);
                          if (response.data.success) {
                            toast.success('Álbum excluído com sucesso');
                            setSelectedAlbum(null);
                            fetchAlbums();
                          }
                        } catch (error) {
                          toast.error('Erro ao excluir álbum');
                        }
                      } else {
                        await handleDeletePhoto();
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )}

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
                  <h3 className="text-xl font-bold">{selectedAlbum.name}</h3>
                  <p className="text-white/70 text-sm">
                    {selectedAlbum.photos.length} fotos
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
                
                {lightboxIndex < selectedAlbum.photos.length - 1 && (
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
                  src={`${API_URL}${selectedAlbum.photos[lightboxIndex].url}`}
                  alt=""
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />
                
                {/* Thumbnail Strip */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
                  {selectedAlbum.photos.map((photo, idx) => (
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
                  {lightboxIndex + 1} / {selectedAlbum.photos.length}
                </div>
                
                {/* Action buttons */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete('photo', selectedAlbum.photos[lightboxIndex]._id, selectedAlbum.photos[lightboxIndex].caption || 'esta foto');
                        setLightboxIndex(-1);
                      }}
                      className="p-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full z-10"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  )}
                  {selectedAlbum.allowDownload && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPhoto(selectedAlbum.photos[lightboxIndex].url);
                      }}
                      className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full z-10"
                    >
                      <Download className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Albums grid view
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-black">Galeria de Fotos</h2>
            <p className="text-gray-500">{albums.length} álbum(ns)</p>
          </div>
          
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => setShowProfileShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow hover:shadow-md transition-shadow text-gray-700"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar Perfil
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => setShowNewAlbumModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Novo Álbum
              </button>
            )}
          </div>
        </div>

        {/* Albums Grid */}
        {albums.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map((album) => (
              <div 
                key={album._id}
                onClick={() => fetchAlbum(album._id)}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="aspect-square relative overflow-hidden">
                  {album.coverPhoto ? (
                    <img 
                      src={`${API_URL}${album.coverPhoto}`} 
                      alt={album.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Photo count badge */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                    {album.photoCount || 0} fotos
                  </div>
                  
                  {/* Public badge */}
                  {album.isPublic && (
                    <div className="absolute top-2 left-2 bg-[#9CAA8E] text-white px-2 py-1 rounded-full text-xs">
                      Público
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-black truncate">{album.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {new Date(album.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum álbum criado ainda</p>
            {isOwner && (
              <button
                onClick={() => setShowNewAlbumModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Criar Primeiro Álbum
              </button>
            )}
          </div>
        )}

        {/* New Album Modal */}
        {showNewAlbumModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-serif font-bold text-black">Criar Novo Álbum</h3>
                <button onClick={() => setShowNewAlbumModal(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleCreateAlbum} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Álbum</label>
                  <input
                    type="text"
                    value={newAlbum.name}
                    onChange={(e) => setNewAlbum({...newAlbum, name: e.target.value})}
                    placeholder="Ex: Fotos do Casamento"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                  <textarea
                    value={newAlbum.description}
                    onChange={(e) => setNewAlbum({...newAlbum, description: e.target.value})}
                    rows={3}
                    placeholder="Descreva este álbum..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Tornar público</span>
                  <button
                    type="button"
                    onClick={() => setNewAlbum({...newAlbum, isPublic: !newAlbum.isPublic})}
                    className={`p-2 rounded-full transition-colors ${newAlbum.isPublic ? 'bg-[#9CAA8E] text-white' : 'bg-gray-200 text-gray-500'}`}
                  >
                    {newAlbum.isPublic ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E] transition-colors"
                >
                  Criar Álbum
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Profile Share Modal */}
        {showProfileShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-serif font-bold text-black">Compartilhar Perfil</h3>
                <button onClick={() => setShowProfileShareModal(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <img 
                  src={getProfileQRCodeUrl()} 
                  alt="QR Code do Perfil" 
                  className="w-48 h-48 mx-auto rounded-lg"
                />
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Escaneie o QR code ou use o link abaixo para compartilhar seu perfil público:
              </p>
              
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 mb-4">
                <input
                  type="text"
                  value={getProfileShareLink()}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-black px-2"
                />
                <button
                  onClick={copyProfileLink}
                  className="p-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E]"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Compartilhe este link para que outros possam ver sua galeria de fotos pública.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
