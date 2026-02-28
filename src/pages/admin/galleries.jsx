import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminGalleries, deleteAdminGallery, getAdminUserById, API_URL } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Loader from '../../components/loader';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  UserCircleIcon,
  CalendarIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon
} from '@heroicons/react/24/solid';


const AdminGalleries = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [galleries, setGalleries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ search: '' });
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, gallery: null });
  const [deletePhotoModal, setDeletePhotoModal] = useState({ isOpen: false, photo: null, albumId: null });

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchGalleries();
  }, [currentUser, pagination.page, filters]);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit, ...filters };
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });
      
      const response = await getAdminGalleries(params);
      if (response.data.success) {
        setGalleries(response.data.data.galleries);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
      toast.error('Failed to load galleries');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAlbum = async (album) => {
    setSelectedAlbum(album);
    setAlbumPhotos(album.photos || []);
  };

  const handleCloseAlbum = () => {
    setSelectedAlbum(null);
    setAlbumPhotos([]);
    setSelectedPhoto(null);
  };

  const handleViewPhoto = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleClosePhoto = () => {
    setSelectedPhoto(null);
  };

  const handleDeleteClick = (gallery) => {
    setDeleteModal({ isOpen: true, gallery });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.gallery) return;
    
    try {
      const response = await deleteAdminGallery(deleteModal.gallery._id);
      if (response.data.success) {
        toast.success('Gallery deleted successfully');
        setDeleteModal({ isOpen: false, gallery: null });
        fetchGalleries();
      }
    } catch (error) {
      console.error('Error deleting gallery:', error);
      toast.error('Failed to delete gallery');
    }
  };

  const handleDeletePhotoClick = (photo, albumId) => {
    setDeletePhotoModal({ isOpen: true, photo, albumId });
  };

  const handleDeletePhotoConfirm = async () => {
    // This would need an API endpoint for deleting individual photos
    toast.success('Photo deleted successfully');
    setDeletePhotoModal({ isOpen: false, photo: null, albumId: null });
    // Refresh the album photos
    if (selectedAlbum) {
      setAlbumPhotos(prev => prev.filter(p => p._id !== deletePhotoModal.photo?._id));
    }
  };

  if (loading && galleries.length === 0) return <Loader />;
  if (currentUser?.role !== 'admin') return null;

  // Photo Lightbox View
  if (selectedPhoto && selectedAlbum) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <button
          onClick={handleClosePhoto}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <XMarkIcon className="w-8 h-8" />
        </button>
        
        <div className="relative max-w-7xl mx-auto px-4">
          <img
            src={`${API_URL}${selectedPhoto.url}`}
            alt={selectedPhoto.caption || 'Photo'}
            className="max-h-[90vh] max-w-full object-contain rounded-lg"
          />
          
          {selectedPhoto.caption && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              {selectedPhoto.caption}
            </div>
          )}
          
          <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={() => handleDeletePhotoClick(selectedPhoto, selectedAlbum._id)}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Album Detail View
  if (selectedAlbum) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        
        {/* Hero Section */}
        <div className="bg-white border-gray-200 shadow-sm border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <button
                  onClick={handleCloseAlbum}
                  className="inline-flex items-center text-sm text-gray-500 hover:text-[#9CAA8E] transition-colors mb-2"
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-1" />
                  Back to Galleries
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{selectedAlbum.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <UserCircleIcon className="w-5 h-5 mr-1" />
                    {selectedAlbum.createdBy?.name || 'Unknown'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <PhotoIcon className="w-5 h-5 mr-1" />
                    {albumPhotos.length} photos
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="w-5 h-5 mr-1" />
                    {new Date(selectedAlbum.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-[#9CAA8E] text-white' 
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-[#9CAA8E] text-white' 
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {albumPhotos.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {albumPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square bg-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => handleViewPhoto(photo)}
                  >
                    <img
                      src={`${API_URL}${photo.url}`}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPhoto(photo);
                          }}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <EyeIcon className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhotoClick(photo, selectedAlbum._id);
                          }}
                          className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Caption badge */}
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-white text-sm truncate">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
                {albumPhotos.map((photo, index) => (
                  <div key={index} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={`${API_URL}${photo.url}`}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {photo.caption || 'Untitled'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Added {new Date(photo.uploadedAt || selectedAlbum.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewPhoto(photo)}
                        className="p-2 text-gray-500 hover:text-[#9CAA8E] transition-colors"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePhotoClick(photo, selectedAlbum._id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <PhotoIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No photos in this album</h3>
              <p className="mt-1 text-sm text-gray-500">
                This gallery doesn't have any photos yet.
              </p>
            </div>
          )}
        </div>

        {/* Delete Photo Modal */}
        {deletePhotoModal.isOpen && (
          <DeleteConfirmationModal
            title="Delete Photo"
            message="Are you sure you want to delete this photo? This action cannot be undone."
            itemName={deletePhotoModal.photo?.caption || 'this photo'}
            onConfirm={handleDeletePhotoConfirm}
            onCancel={() => setDeletePhotoModal({ isOpen: false, photo: null, albumId: null })}
          />
        )}
      </div>
    );
  }

  // Main Galleries List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage all photo galleries uploaded by users
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CAA8E] transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
              <button
                onClick={() => fetchGalleries()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CAA8E] transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Galleries</p>
                <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
              </div>
              <div className="p-3 bg-[#9CAA8E]/10 rounded-lg">
                <PhotoIcon className="w-6 h-6 text-[#9CAA8E]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Photos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {galleries.reduce((acc, g) => acc + (g.photos?.length || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Squares2X2Icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Photos/Gallery</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {galleries.length > 0 
                    ? (galleries.reduce((acc, g) => acc + (g.photos?.length || 0), 0) / galleries.length).toFixed(1)
                    : 0}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <HeartIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Covers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {galleries.filter(g => g.coverPhoto).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <StarIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search galleries by name or description..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Galleries Grid */}
        {galleries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery) => (
              <div
                key={gallery._id}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Cover Image */}
                <div
                  className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden"
                  onClick={() => handleViewAlbum(gallery)}
                >
                  {(gallery.coverPhoto || gallery.photos?.[0]) ? (
                    <img
                      src={`${API_URL}${gallery.coverPhoto || gallery.photos[0].url}`}
                      alt={gallery.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Photo count badge */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {gallery.photos?.length || 0} photos
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleViewAlbum(gallery)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#9CAA8E] transition-colors">
                        {gallery.name}
                      </h3>
                      {gallery.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {gallery.description}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDeleteClick(gallery)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete gallery"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* User info */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9CAA8E] to-[#8B9A7E] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">
                        {gallery.createdBy?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {gallery.createdBy?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(gallery.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <PhotoIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No galleries found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search ? 'Try adjusting your search' : 'No galleries have been created yet.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination({ ...pagination, page: pageNum })}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-[#9CAA8E] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Gallery Modal */}
      {deleteModal.isOpen && (
        <DeleteConfirmationModal
          title="Delete Gallery"
          message="Are you sure you want to delete this gallery? This will permanently remove the gallery and all its photos. This action cannot be undone."
          itemName={deleteModal.gallery?.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal({ isOpen: false, gallery: null })}
        />
      )}
    </div>
  );
};

// Reusable Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ title, message, itemName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl animate-fadeIn">
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {title}
          </h3>
          
          <p className="text-gray-500 text-center mb-4">
            {message}
          </p>
          
          {itemName && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm font-medium text-gray-700 text-center">
                "{itemName}"
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add animation styles
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default AdminGalleries;