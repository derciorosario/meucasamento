import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserProfileById, getUserPublicAlbums } from '../../api/client';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Gallery from '../../components/Gallery';
import Loader from '../../components/loader';

const API_URL = 'https://meucasamento-api.runwithbroto.com';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gallery');

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get user profile by userId using the public endpoint
      const profileResponse = await getUserProfileById(userId);
      
      if (profileResponse.data && profileResponse.data.success) {
        setUser({
          ...profileResponse.data.user,
          profile: profileResponse.data.profile,
          vendors: profileResponse.data.vendors,
          vendor: profileResponse.data.vendor,
        });
      } else {
        // If API fails, show error
        toast.error(profileResponse.data?.message || 'Erro ao carregar perfil');
        setUser(null);
      }

      // Also fetch user's public albums
      try {
        const albumsResponse = await getUserPublicAlbums(userId);
        if (albumsResponse.data && albumsResponse.data.success) {
          setAlbums(albumsResponse.data.albums || []);
        }
      } catch (albumError) {
        console.log('No public albums found for this user');
        setAlbums([]);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Erro ao carregar perfil do usuário');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-[#9CAA8E] flex items-center justify-center shadow-lg">
              <span className="text-4xl text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-black">{user?.name || 'Usuário'}</h1>
              <p className="text-gray-500 mt-1">
                {user?.userType === 'vendor' ? 'Fornecedor' : 
                 user?.userType === 'bride' ? 'Noiva' :
                 user?.userType === 'groom' ? 'Noivo' : 'Convidado'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              activeTab === 'gallery' 
                ? 'bg-[#9CAA8E] text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
            }`}
          >
            Galeria de Fotos
          </button>
        </div>

        {/* Gallery */}
        {activeTab === 'gallery' && (
          <div>
            {albums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => (
                  <div key={album._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 relative">
                      {album.coverImage ? (
                        <img 
                          src={`${API_URL}${album.coverImage}`} 
                          alt={album.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800">{album.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{album.photos?.length || 0} fotos</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Gallery userId={userId} isOwner={false} isPublicView={true} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
