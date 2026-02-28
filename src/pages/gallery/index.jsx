import { useState, useEffect } from 'react';
import Gallery from '../../components/Gallery';
import Header from '../../components/Header';
import Loader from '../../components/loader';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../api/client';

const GalleryPage = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-black">Galeria</h1>
          <p className="text-gray-600 mt-2">Gerencie suas fotos e álbuns do casamento</p>
        </div>
        <Gallery userId={user?.id} isOwner={true} />
      </div>
    </div>
  );
};

export default GalleryPage;
