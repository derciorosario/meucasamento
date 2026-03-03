import { useState, useEffect } from 'react';
import Gallery from '../../components/Gallery';
import Header from '../../components/Header';
import Loader from '../../components/loader';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, getTutorials } from '../../api/client';
import { Play, ChevronDown } from 'lucide-react';

// Helper function to extract YouTube video ID
const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const GalleryPage = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Tutorial video state
  const [galleryTutorial, setGalleryTutorial] = useState(null);
  const [showTutorialDropdown, setShowTutorialDropdown] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      
      // Fetch tutorial videos
      try {
        const tutorialsRes = await getTutorials();
        if (tutorialsRes.data?.tutorialVideos?.gallery) {
          const videoId = extractYouTubeId(tutorialsRes.data.tutorialVideos.gallery);
          setGalleryTutorial({
            url: tutorialsRes.data.tutorialVideos.gallery,
            videoId
          });
        }
      } catch (tutError) {
        console.log('No tutorial videos available');
      }
      
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
        
        {/* Tutorial Video - Desktop & Mobile */}
        {galleryTutorial && (
          <div className="mb-6">
            <button
              onClick={() => setShowTutorialDropdown(!showTutorialDropdown)}
              className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary-500" fill="currentColor" />
                <span className="text-sm font-medium text-primary-700">Ver tutorial</span>
                <span className="text-xs text-primary-600 ml-1">(como usar esta página)</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-primary-500 transition-transform ${showTutorialDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showTutorialDropdown && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${galleryTutorial.videoId}`}
                  title="Tutorial Video"
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        )}
        
        <Gallery userId={user?.id} isOwner={true} />
      </div>
    </div>
  );
};

export default GalleryPage;
